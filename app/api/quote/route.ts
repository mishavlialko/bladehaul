import { after, NextResponse } from 'next/server';
import { checkBotId } from 'botid/server';
import { quoteSchema } from '@/lib/validation';
import { createQuoteBlobStore } from '@/lib/quote-blob-store';
import {
  getQuoteCrmConfig,
  getQuoteEmailConfig,
  getQuoteNotificationConfig,
  getQuoteStorageConfig,
  quoteAllowedOrigins,
  quoteCrmEnabled,
} from '@/lib/quote-config';
import { processQuote, processQuoteCrm } from '@/lib/quote-outbox';
import { admitQuote } from '@/lib/quote-intake';
import { getQuoteSendBudgetLimits } from '@/lib/quote-budget';
import { hasTrustedOrigin, readQuoteBody } from '@/lib/quote-request';
import { createBeRockerProvider, createResendProvider } from './delivery';

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
    const notification = getQuoteNotificationConfig();
    const store = createQuoteBlobStore(storeId, namespace);
    const result = await admitQuote(
      {
        store,
        namespace,
        notification,
        crmEnabled: quoteCrmEnabled(),
        verifyBrowser: () =>
          checkBotId({
            advancedOptions: { checkLevel: 'basic' },
            developmentOptions: { isDevelopment: false },
          }),
      },
      requestId,
      quote,
    );
    if (result.kind === 'rejected')
      return response(
        {
          success: false,
          error:
            'We could not send your request. Your details are still here. Please try again.',
        },
        403,
      );
    if (result.kind === 'unavailable') return unavailable();
    if (result.kind === 'limited') {
      const limited = response(
        {
          success: false,
          error:
            'We are receiving many requests. Your details are still here. Please try again later or email us.',
        },
        429,
      );
      limited.headers.set('Retry-After', String(result.retryAfterSeconds));
      return limited;
    }
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
        const email = getQuoteEmailConfig();
        const limits = getQuoteSendBudgetLimits();
        await processQuote(
          {
            store,
            namespace,
            provider: createResendProvider(email.apiKey, {
              store,
              namespace,
              limits,
            }),
          },
          requestId,
        );
      } catch {
        // The accepted request is already durable; cron will recover it.
        console.error('[quote] background_delivery_unavailable', {
          quoteId: requestId,
        });
      }
      try {
        const crm = getQuoteCrmConfig();
        if (crm)
          await processQuoteCrm(
            {
              store,
              namespace,
              crm: createBeRockerProvider(crm.leadSaveUrl),
            },
            requestId,
          );
      } catch {
        // The CRM step stays pending in the record; cron will recover it.
        console.error('[quote] background_crm_unavailable', {
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
