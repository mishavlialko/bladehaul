import assert from 'node:assert/strict';
import test from 'node:test';

const { submitQuoteRequest, QuoteSubmitTimeoutError, parseQuoteRetryAfter } =
  (await import(
    new URL('./quote-submit.ts', import.meta.url).href
  )) as typeof import('./quote-submit');

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

test('sends the supplied stable request identity and reads the receipt', async () => {
  const payload = { requestId: 'quote-test-id', email: 'test@example.com' };
  let calls = 0;
  const result = await submitQuoteRequest(payload, {
    fetch: async (url, options) => {
      calls++;
      assert.equal(url, '/api/quote');
      assert.equal(options?.method, 'POST');
      assert.deepEqual(options?.headers, {
        'content-type': 'application/json',
      });
      assert.deepEqual(JSON.parse(String(options?.body)), payload);
      assert.equal(options?.signal?.aborted, false);
      return Response.json(
        { success: true, quoteId: payload.requestId },
        { status: 202 },
      );
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.res.status, 202);
  assert.deepEqual(result.body, { success: true, quoteId: payload.requestId });
});

for (const phase of ['fetch', 'body'] as const) {
  test(`the default total deadline is 10 seconds when ${phase} stalls`, async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let signal: AbortSignal | undefined;
    let settled = false;
    const bodyStarted = deferred<void>();
    const result = submitQuoteRequest(
      {},
      {
        fetch: async (_, options) => {
          signal = options?.signal ?? undefined;
          if (phase === 'fetch') return new Promise<Response>(() => {});
          return {
            json: () => {
              bodyStarted.resolve();
              return new Promise(() => {});
            },
          } as unknown as Response;
        },
      },
    );
    void result.then(
      () => {
        settled = true;
      },
      () => {
        settled = true;
      },
    );
    const rejected = assert.rejects(result, QuoteSubmitTimeoutError);
    if (phase === 'body') await bodyStarted.promise;
    t.mock.timers.tick(9999);
    await Promise.resolve();
    assert.equal(settled, false);
    assert.equal(signal?.aborted, false);
    t.mock.timers.tick(1);
    await rejected;
    assert.equal(settled, true);
    assert.equal(signal?.aborted, true);
  });
}

test('fetch and body parsing share one 10-second ceiling', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const fetchResult = deferred<Response>();
  const bodyStarted = deferred<void>();
  const result = submitQuoteRequest({}, { fetch: () => fetchResult.promise });
  const rejected = assert.rejects(result, QuoteSubmitTimeoutError);
  t.mock.timers.tick(6000);
  fetchResult.resolve({
    json: () => {
      bodyStarted.resolve();
      return new Promise(() => {});
    },
  } as unknown as Response);
  await bodyStarted.promise;
  t.mock.timers.tick(3999);
  t.mock.timers.tick(1);
  await rejected;
});

test('bounds a verification interceptor that never resolves or honors abort', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let signal: AbortSignal | undefined;
  const result = submitQuoteRequest(
    { requestId: 'quote-test-id' },
    {
      timeoutMs: 10000,
      fetch: async (_, options) => {
        signal = options?.signal ?? undefined;
        return new Promise<Response>(() => {});
      },
    },
  );
  const rejected = assert.rejects(result, QuoteSubmitTimeoutError);
  t.mock.timers.tick(10000);
  await rejected;
  assert.equal(signal?.aborted, true);
});

test('accepts a slow response before the deadline and cancels its abort timer', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const fetchResult = deferred<Response>();
  let signal: AbortSignal | undefined;
  const result = submitQuoteRequest(
    {},
    {
      timeoutMs: 10000,
      fetch: (_, options) => {
        signal = options?.signal ?? undefined;
        return fetchResult.promise;
      },
    },
  );
  t.mock.timers.tick(9999);
  fetchResult.resolve(
    Response.json({ success: true, quoteId: 'quote-test-id' }, { status: 202 }),
  );
  assert.equal((await result).body?.success, true);
  t.mock.timers.tick(1);
  assert.equal(signal?.aborted, false);
});

test('the same deadline includes a stalled response body', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const bodyStarted = deferred<void>();
  const result = submitQuoteRequest(
    {},
    {
      timeoutMs: 10000,
      fetch: async () =>
        ({
          json: () => {
            bodyStarted.resolve();
            return new Promise(() => {});
          },
        }) as unknown as Response,
    },
  );
  const rejected = assert.rejects(result, QuoteSubmitTimeoutError);
  await bodyStarted.promise;
  t.mock.timers.tick(10000);
  await rejected;
});

test('late success after the deadline cannot turn the result into a receipt', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const fetchResult = deferred<Response>();
  let received = false;
  const result = submitQuoteRequest(
    {},
    {
      timeoutMs: 10000,
      fetch: () => fetchResult.promise,
    },
  ).then((value) => {
    received = true;
    return value;
  });
  const rejected = assert.rejects(result, QuoteSubmitTimeoutError);
  t.mock.timers.tick(10000);
  await rejected;
  fetchResult.resolve(
    Response.json({ success: true, quoteId: 'quote-test-id' }, { status: 202 }),
  );
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(received, false);
});

test('a late parsed receipt also cannot replace the timeout result', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const body = deferred<{ success: boolean; quoteId: string }>();
  const bodyStarted = deferred<void>();
  let received = false;
  const result = submitQuoteRequest(
    {},
    {
      timeoutMs: 10000,
      fetch: async () =>
        ({
          json: () => {
            bodyStarted.resolve();
            return body.promise;
          },
        }) as unknown as Response,
    },
  ).then(() => {
    received = true;
  });
  const rejected = assert.rejects(result, QuoteSubmitTimeoutError);
  await bodyStarted.promise;
  t.mock.timers.tick(10000);
  await rejected;
  body.resolve({ success: true, quoteId: 'quote-test-id' });
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(received, false);
});

test('network/browser verification rejection propagates without retrying', async () => {
  const blocked = new TypeError('Synthetic blocked verification request');
  let calls = 0;
  await assert.rejects(
    submitQuoteRequest(
      {},
      {
        fetch: async () => {
          calls++;
          throw blocked;
        },
      },
    ),
    (error: unknown) => error === blocked,
  );
  assert.equal(calls, 1);
});

test('returns rejection statuses and handles non-JSON bodies without claiming success', async () => {
  for (const status of [403, 429, 503]) {
    const result = await submitQuoteRequest(
      {},
      {
        fetch: async () => new Response('Synthetic provider error', { status }),
      },
    );
    assert.equal(result.res.status, status);
    assert.equal(result.body, null);
  }
});

test('a rejected response body resolves to null inside the deadline', async () => {
  const result = await submitQuoteRequest(
    {},
    {
      fetch: async () =>
        ({
          json: async () => Promise.reject(new Error('Synthetic body error')),
        }) as unknown as Response,
    },
  );
  assert.equal(result.body, null);
});

test('parses seconds and HTTP dates, rounds up, and bounds cooldown', () => {
  const now = Date.parse('2026-10-12T12:00:00Z');
  assert.equal(parseQuoteRetryAfter('120', now), 120);
  assert.equal(parseQuoteRetryAfter(' 5 ', now), 5);
  assert.equal(parseQuoteRetryAfter('0', now), 0);
  assert.equal(parseQuoteRetryAfter('99999999999999999999999', now), 86400);
  assert.equal(parseQuoteRetryAfter('Mon, 12 Oct 2026 12:02:00 GMT', now), 120);
  assert.equal(
    parseQuoteRetryAfter('Mon, 12 Oct 2026 12:02:00 GMT', now + 1),
    120,
  );
  assert.equal(
    parseQuoteRetryAfter('Tue, 13 Oct 2026 13:00:00 GMT', now),
    86400,
  );
  assert.equal(parseQuoteRetryAfter('Mon, 12 Oct 2026 11:59:00 GMT', now), 0);
});

test('missing or malformed cooldown headers use the 60-second fallback', () => {
  for (const value of [null, '', ' ', '-1', '1.5', 'NaN', 'Infinity', 'soon']) {
    assert.equal(parseQuoteRetryAfter(value), 60);
  }
});
