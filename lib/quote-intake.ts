import { reserveQuoteAdmission } from '@/lib/quote-budget';
import {
  enqueueQuote,
  hashQuote,
  quotePath,
  type QuotePayload,
  type QuoteRecord,
  type QuoteStore,
} from '@/lib/quote-outbox';

export const VERIFICATION_TIMEOUT_MS = 6_000;

export async function verifyQuoteBrowser(
  check: () => Promise<{ isBot: boolean; bypassed?: boolean }>,
  timeoutMs = VERIFICATION_TIMEOUT_MS,
): Promise<'human' | 'rejected' | 'unavailable'> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      check(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('verification_timeout')),
          timeoutMs,
        );
      }),
    ]);
    return result?.isBot === false && result.bypassed !== true
      ? 'human'
      : 'rejected';
  } catch {
    return 'unavailable';
  } finally {
    clearTimeout(timer);
  }
}

export async function admitQuote(
  context: {
    store: QuoteStore;
    namespace: string;
    notification: { from: string; recipient: string };
    verifyBrowser: () => Promise<{ isBot: boolean; bypassed?: boolean }>;
    verificationTimeoutMs?: number;
    now?: () => number;
  },
  quoteId: string,
  quote: QuotePayload,
) {
  const verified = await verifyQuoteBrowser(
    context.verifyBrowser,
    context.verificationTimeoutMs,
  );
  if (verified !== 'human') return { kind: verified };
  const { store, namespace, notification } = context;
  const now = (context.now ?? Date.now)();
  const payloadHash = hashQuote(quote);
  async function receipt() {
    const saved = await store.read<QuoteRecord>(quotePath(namespace, quoteId));
    return saved
      ? {
          kind:
            saved.value.payloadHash === payloadHash
              ? ('duplicate' as const)
              : ('conflict' as const),
          quoteId,
        }
      : null;
  }
  const existing = await receipt();
  if (existing) return existing;
  let allowance;
  try {
    allowance = await reserveQuoteAdmission(store, namespace, now);
  } catch (error) {
    const concurrent = await receipt();
    if (concurrent) return concurrent;
    throw error;
  }
  if (!allowance.allowed)
    return (
      (await receipt()) ?? {
        kind: 'limited' as const,
        retryAfterSeconds: allowance.retryAfterSeconds,
      }
    );
  // Mail credentials/capacity are deliberately absent from this boundary.
  return enqueueQuote(store, namespace, quoteId, quote, notification, now);
}
