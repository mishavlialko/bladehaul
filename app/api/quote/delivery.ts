import type { QuoteEmailProvider } from '@/lib/quote-outbox';
import type { QuoteStore } from '@/lib/quote-outbox';
import type { CrmResult, QuoteCrmProvider } from '@/lib/quote-crm';
import { reserveQuoteBudget, type BudgetLimits } from '@/lib/quote-budget';

export const DELIVERY_TIMEOUT_MS = 10_000;
export const SEND_RESERVATION_TIMEOUT_MS = 6_000;
const API_ORIGIN = 'https://api.resend.com';
const EMAIL_ID = /^[a-zA-Z0-9_-]{1,100}$/;
const LEAD_ID = /^[a-zA-Z0-9_-]{1,100}$/;
const EVENTS = new Set([
  'queued',
  'scheduled',
  'sent',
  'delivered',
  'delivery_delayed',
  'bounced',
  'complained',
  'failed',
  'suppressed',
  'canceled',
  'opened',
  'clicked',
]);

function failure(status: number) {
  return {
    kind:
      status >= 500 || [408, 409, 425, 429].includes(status)
        ? ('temporary' as const)
        : ('permanent' as const),
    // Only status codes enter the outbox/logs; never copy provider error text.
    code: `resend_http_${status}`,
  };
}

export function createResendProvider(
  apiKey: string,
  budget: {
    store: QuoteStore;
    namespace: string;
    limits: BudgetLimits;
    now?: () => number;
    reservationTimeoutMs?: number;
  },
  request: typeof fetch = fetch,
  timeoutMs = DELIVERY_TIMEOUT_MS,
): QuoteEmailProvider {
  return {
    async send(email, idempotencyKey) {
      // The quota counts recipients. The quote path sends exactly one internal
      // notification, never customer/CC/BCC mail or a caller-selected batch.
      if (email.to.length !== 1)
        return { kind: 'permanent', code: 'email_recipient_count_invalid' };
      let reservationTimer: ReturnType<typeof setTimeout> | undefined;
      try {
        const clock = budget.now ?? Date.now;
        const wait = budget.reservationTimeoutMs ?? SEND_RESERVATION_TIMEOUT_MS;
        if (
          !Number.isSafeInteger(wait) ||
          wait <= 0 ||
          wait > SEND_RESERVATION_TIMEOUT_MS
        )
          throw new Error('quote_budget_deadline_invalid');
        const startedAt = clock();
        const latestSendAt = startedAt + wait;
        // Stamp at the latest permissible HTTP start, then refuse a late send.
        // Slow CAS responses cannot age a reservation before its actual attempt.
        const reserved = await Promise.race([
          reserveQuoteBudget(
            budget.store,
            budget.namespace,
            'send',
            budget.limits,
            startedAt,
            latestSendAt,
          ),
          new Promise<never>((_, reject) => {
            reservationTimer = setTimeout(
              () => reject(new Error('quote_budget_timeout')),
              wait,
            );
          }),
        ]);
        if (clock() > latestSendAt) throw new Error('quote_budget_timeout');
        // Do not automatically carry an attack backlog into tomorrow's quota.
        // The lead remains durable and maintenance surfaces manual review.
        if (!reserved.allowed)
          return { kind: 'permanent', code: 'email_budget_exhausted' };
      } catch {
        return { kind: 'permanent', code: 'email_budget_unavailable' };
      } finally {
        clearTimeout(reservationTimer);
      }
      try {
        const response = await request(`${API_ORIGIN}/emails`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify(email),
          signal: AbortSignal.timeout(timeoutMs),
          cache: 'no-store',
          redirect: 'error',
        });
        if (!response.ok) return failure(response.status);
        const result: unknown = await response.json();
        if (
          result &&
          typeof result === 'object' &&
          'id' in result &&
          typeof result.id === 'string' &&
          EMAIL_ID.test(result.id)
        ) {
          return { kind: 'accepted', id: result.id };
        }
        return { kind: 'temporary', code: 'resend_invalid_response' };
      } catch {
        return { kind: 'temporary', code: 'resend_unavailable' };
      }
    },
    async inspect(providerId) {
      if (!EMAIL_ID.test(providerId))
        return { kind: 'permanent', code: 'resend_invalid_id' };
      try {
        const response = await request(
          `${API_ORIGIN}/emails/${encodeURIComponent(providerId)}`,
          {
            headers: { Authorization: `Bearer ${apiKey}` },
            signal: AbortSignal.timeout(timeoutMs),
            cache: 'no-store',
            redirect: 'error',
          },
        );
        if (!response.ok) return failure(response.status);
        const result: unknown = await response.json();
        if (
          result &&
          typeof result === 'object' &&
          'last_event' in result &&
          typeof result.last_event === 'string' &&
          EVENTS.has(result.last_event)
        ) {
          return { kind: 'event', event: result.last_event };
        }
        return { kind: 'temporary', code: 'resend_unknown_event' };
      } catch {
        return { kind: 'temporary', code: 'resend_unavailable' };
      }
    },
  };
}

function crmFailure(status: number) {
  return {
    // 422 field errors and 403 key/source rejections need a person.
    kind:
      status >= 500 || status === 408 || status === 429
        ? ('temporary' as const)
        : ('permanent' as const),
    // Never copy BeRocker error text (it can echo PII) or the key-bearing URL.
    code: `berocker_http_${status}`,
  };
}

function leadReceipt(result: unknown) {
  const receipt: { leadId?: string; bookingLink?: string } = {};
  if (!result || typeof result !== 'object') return receipt;
  if ('id' in result) {
    if (typeof result.id === 'string' && LEAD_ID.test(result.id))
      receipt.leadId = result.id;
    else if (
      typeof result.id === 'number' &&
      Number.isSafeInteger(result.id) &&
      result.id > 0
    )
      receipt.leadId = String(result.id);
  }
  if (
    'bookingLink' in result &&
    typeof result.bookingLink === 'string' &&
    result.bookingLink.length <= 2_048
  ) {
    try {
      if (new URL(result.bookingLink).protocol === 'https:')
        receipt.bookingLink = result.bookingLink;
    } catch {
      // An unusable link is dropped; the lead itself was still created.
    }
  }
  return receipt;
}

export function createBeRockerProvider(
  leadSaveUrl: string,
  request: typeof fetch = fetch,
  timeoutMs = DELIVERY_TIMEOUT_MS,
): QuoteCrmProvider {
  return {
    async createLead(lead): Promise<CrmResult> {
      let response: Response;
      try {
        response = await request(leadSaveUrl, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lead),
          signal: AbortSignal.timeout(timeoutMs),
          cache: 'no-store',
          redirect: 'error',
        });
      } catch {
        // Network errors can quote the URL, so only a fixed code survives.
        return { kind: 'temporary', code: 'berocker_unavailable' };
      }
      if (!response.ok) return crmFailure(response.status);
      // A 2xx means BeRocker saved the lead. An unreadable receipt must not
      // trigger a resend that could duplicate it after the 30-minute window.
      let receipt: unknown = null;
      try {
        receipt = await response.json();
      } catch {
        // Keep the created state without a receipt.
      }
      return { kind: 'created', ...leadReceipt(receipt) };
    },
  };
}
