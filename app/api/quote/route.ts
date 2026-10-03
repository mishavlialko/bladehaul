import { after, NextResponse } from 'next/server';
import { quoteSchema } from '@/lib/validation';
import { createQuoteBlobStore } from '@/lib/quote-blob-store';
import {
  getQuoteEmailConfig,
  getQuoteStorageConfig,
  quoteAllowedOrigins,
} from '@/lib/quote-config';
import { enqueueQuote, processQuote } from '@/lib/quote-outbox';
import { hasTrustedOrigin, readQuoteBody } from '@/lib/quote-request';
import { createResendProvider } from './delivery';

export const runtime = 'nodejs';
export const maxDuration = 60;

function response(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function unavailable() {
  return response(
    {
      success: false,
      error:
        'We could not save your request. Please try again or email info@bladehaul.com.',
    },
    503,
  );
}

export async function POST(req: Request) {
  // Credentials alone never activate intake. The owner enables this only
  // after authority, delivery, and Vercel WAF checks are documented.
  if (process.env.QUOTE_INTAKE_ENABLED !== 'true') return unavailable();
  try {
    if (!hasTrustedOrigin(req, quoteAllowedOrigins(req.url)))
      return response(
        { success: false, error: 'Please use the quote form on this site.' },
        403,
      );
  } catch {
    return unavailable();
  }
  let body: unknown;
  try {
    body = await readQuoteBody(req);
  } catch {
    return response(
      { success: false, error: 'Please check your request and try again.' },
      400,
    );
  }
  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success)
    return response(
      {
        success: false,
        // Older open tabs cannot map the hidden consentVersion field to a UI error.
        error: parsed.error.issues.some(
          (issue) => issue.path[0] === 'consentVersion',
        )
          ? 'Refresh the page to see the current SMS consent choices before sending your request.'
          : 'Please check the highlighted details.',
        issues: parsed.error.flatten(),
      },
      400,
    );
  const { requestId, website, ...quote } = parsed.data;
  if (website)
    return response(
      { success: false, error: 'Please check your request and try again.' },
      400,
    );
  try {
    const { namespace, storeId } = getQuoteStorageConfig();
    const email = getQuoteEmailConfig();
    const store = createQuoteBlobStore(storeId, namespace);
    const result = await enqueueQuote(
      store,
      namespace,
      requestId,
      quote,
      email,
    );
    if (result.kind === 'conflict')
      return response(
        {
          success: false,
          error: 'This request was changed. Please send it again.',
        },
        409,
      );
    after(async () => {
      try {
        await processQuote(
          { store, namespace, provider: createResendProvider(email.apiKey) },
          requestId,
        );
      } catch {
        // The accepted request is already durable; cron will recover it.
        console.error('[quote] background_delivery_unavailable', {
          quoteId: requestId,
        });
      }
    });
    return response({ success: true, quoteId: requestId }, 202);
  } catch {
    console.error('[quote] durable_acceptance_unavailable');
    return unavailable();
  }
}
