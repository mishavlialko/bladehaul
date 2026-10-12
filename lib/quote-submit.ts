export type QuoteSubmitBody = {
  success?: boolean;
  quoteId?: string;
  error?: string;
  issues?: { fieldErrors?: Record<string, string[]> };
};

export class QuoteSubmitTimeoutError extends Error {
  constructor() {
    super('Quote submission timed out');
    this.name = 'QuoteSubmitTimeoutError';
  }
}

type SubmitOptions = {
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
};

// Race the whole request, including any fetch verification interceptor and JSON
// parsing. Aborting alone cannot bound a wrapper that ignores the signal.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race#using_promise.race_to_implement_request_timeout
export async function submitQuoteRequest(
  payload: unknown,
  {
    fetch: fetchRequest = globalThis.fetch,
    timeoutMs = 10000,
  }: SubmitOptions = {},
): Promise<{ res: Response; body: QuoteSubmitBody | null }> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new QuoteSubmitTimeoutError());
      controller.abort();
    }, timeoutMs);
  });
  const request = async () => {
    const res = await fetchRequest('/api/quote', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const body: QuoteSubmitBody | null = await res.json().catch(() => null);
    return { res, body };
  };
  try {
    return await Promise.race([request(), deadline]);
  } finally {
    clearTimeout(timeout);
  }
}

// Retry-After can be seconds or an HTTP date. A malformed/missing value uses a
// short fallback; bound a server-supplied wait so it cannot lock the form forever.
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After
export function parseQuoteRetryAfter(
  value: string | null,
  now = Date.now(),
): number {
  const fallback = 60;
  const maxSeconds = 86400;
  const header = value?.trim();
  if (!header) return fallback;
  if (/^\d+$/.test(header)) return Math.min(Number(header), maxSeconds);
  // Do not let Date.parse interpret malformed numeric values as calendar dates.
  if (!/^[A-Za-z]{3}(?:,|\s)/.test(header)) return fallback;
  const date = Date.parse(header);
  if (!Number.isFinite(date)) return fallback;
  return Math.min(maxSeconds, Math.max(0, Math.ceil((date - now) / 1000)));
}
