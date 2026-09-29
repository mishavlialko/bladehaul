import { NextResponse } from 'next/server';
import { createQuoteBlobStore } from '@/lib/quote-blob-store';
import { getQuoteEmailConfig, getQuoteStorageConfig } from '@/lib/quote-config';
import {
  maintenanceIsHealthy,
  maintenancePath,
  runQuoteMaintenance,
} from '@/lib/quote-maintenance';
import type { MaintenanceState } from '@/lib/quote-maintenance';
import { quotePath } from '@/lib/quote-outbox';
import type { QuoteEmailProvider, QuoteRecord } from '@/lib/quote-outbox';
import { authorizedMaintenance, UUID_V4 } from '@/lib/quote-request';
import { createResendProvider } from '@/app/api/quote/delivery';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 240;

function response(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export async function GET(request: Request) {
  // Authorization is in the handler beside every private read/write.
  if (!authorizedMaintenance(request, process.env.CRON_SECRET))
    return response({ error: 'Unauthorized' }, 401);
  try {
    const { namespace, storeId } = getQuoteStorageConfig();
    const store = createQuoteBlobStore(storeId, namespace);
    const params = new URL(request.url).searchParams;
    if (params.get('mode') === 'health') {
      const health = await store.read<MaintenanceState>(
        maintenancePath(namespace),
      );
      const healthy = maintenanceIsHealthy(health?.value ?? null);
      return response(
        {
          healthy,
          state: health?.value ?? null,
        },
        healthy ? 200 : 503,
      );
    }
    if (params.get('mode') === 'record') {
      // Manual recovery only, never a public quote-status endpoint. The secret
      // belongs in Authorization, never in a link or query string.
      const id = params.get('quoteId') ?? '';
      if (!UUID_V4.test(id))
        return response({ error: 'Invalid request ID' }, 400);
      const record = await store.read<QuoteRecord>(quotePath(namespace, id));
      if (!record || Date.parse(record.value.expiresAt) <= Date.now())
        return response({ error: 'Not found' }, 404);
      return response(record.value);
    }
    if (params.size > 0)
      return response({ error: 'Invalid maintenance action' }, 400);
    let provider: QuoteEmailProvider | undefined;
    try {
      provider = createResendProvider(getQuoteEmailConfig().apiKey);
    } catch {
      // Cleanup and the private heartbeat must continue during a mail-configuration outage.
    }
    const result = await runQuoteMaintenance({
      store,
      namespace,
      provider,
    });
    if (!result.busy && result.state.lastBatch) {
      const { errors, manualReviewIds, deliveryUnavailable } =
        result.state.lastBatch;
      if (errors || manualReviewIds.length || deliveryUnavailable)
        console.error('[quote] maintenance_attention', {
          errors,
          deliveryUnavailable,
          quoteIds: manualReviewIds,
        });
      return response(result, result.state.attentionOutstanding ? 503 : 200);
    }
    return response(result);
  } catch {
    console.error('[quote] maintenance_unavailable');
    return response({ error: 'Maintenance unavailable' }, 503);
  }
}
