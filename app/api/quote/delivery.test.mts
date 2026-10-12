import assert from 'node:assert/strict';
import test from 'node:test';
const { EMAIL_SETTINGS, MemoryStore, QUOTE, QUOTE_ID, START } = (await import(
  new URL('./test-runtime.mts', import.meta.url).href
)) as typeof import('./test-runtime.mjs');

const budget = () => ({
  store: new MemoryStore(),
  namespace: 'development',
  limits: { hour: 100, day: 100, month: 100 },
  now: () => START,
});

const { createResendProvider } = (await import(
  new URL('./delivery.ts', import.meta.url).href
)) as typeof import('./delivery');
const { enqueueQuote, processQuote, quotePath, RETRY_WINDOW_MS } =
  (await import(
    new URL('../../../lib/quote-outbox.ts', import.meta.url).href
  )) as typeof import('../../../lib/quote-outbox');
const { runQuoteMaintenance } = (await import(
  new URL('../../../lib/quote-maintenance.ts', import.meta.url).href
)) as typeof import('../../../lib/quote-maintenance');
import type { QuoteRecord } from '../../../lib/quote-outbox';
const email = {
  from: 'BladeHaul <quotes@bladehaul.com>',
  to: ['operator@example.com'],
  reply_to: ['customer@example.com'],
  subject: 'Synthetic quote',
  text: '<img src=x> remains plain text',
};

test('sends the immutable plain-text message with its stable idempotency key', async () => {
  let options: RequestInit | undefined;
  const provider = createResendProvider(
    'test-key',
    budget(),
    async (url, init) => {
      assert.equal(url, 'https://api.resend.com/emails');
      options = init;
      return Response.json({ id: 'email-example-1' });
    },
  );
  assert.deepEqual(await provider.send(email, 'same-request'), {
    kind: 'accepted',
    id: 'email-example-1',
  });
  assert.equal(
    new Headers(options?.headers).get('Idempotency-Key'),
    'same-request',
  );
  assert.equal(options?.body, JSON.stringify(email));
  assert.equal(options?.redirect, 'error');
  assert.equal('html' in JSON.parse(String(options?.body)), false);
});

test('classifies rate limits and transient failure for safe retry without retaining provider error text', async () => {
  for (const status of [408, 409, 429, 500, 503]) {
    const provider = createResendProvider('test-key', budget(), async () =>
      Response.json({ message: 'sensitive provider detail' }, { status }),
    );
    assert.deepEqual(await provider.send(email, 'same-request'), {
      kind: 'temporary',
      code: `resend_http_${status}`,
    });
  }
});

test('invalid credentials or sender rejection require manual recovery, not an endless send loop', async () => {
  const provider = createResendProvider('test-key', budget(), async () =>
    Response.json({}, { status: 403 }),
  );
  assert.deepEqual(await provider.send(email, 'same-request'), {
    kind: 'permanent',
    code: 'resend_http_403',
  });
});

test('retrieves delivery events without sending another email or retaining message content', async () => {
  const provider = createResendProvider(
    'test-key',
    budget(),
    async (url, init) => {
      assert.equal(url, 'https://api.resend.com/emails/email-example-1');
      assert.equal(init?.method, undefined);
      return Response.json({
        last_event: 'delivered',
        text: 'private payload',
      });
    },
  );
  assert.deepEqual(await provider.inspect('email-example-1'), {
    kind: 'event',
    event: 'delivered',
  });
});

test('aborts a stalled provider request and returns a retryable result', async () => {
  let aborted = false;
  const provider = createResendProvider(
    'test-key',
    budget(),
    async (_url, init) =>
      new Promise((_resolve, reject) => {
        const keepAlive = setTimeout(
          () => reject(new Error('should abort first')),
          100,
        );
        init?.signal?.addEventListener('abort', () => {
          aborted = true;
          clearTimeout(keepAlive);
          reject(new Error('timeout'));
        });
      }),
    5,
  );
  assert.deepEqual(await provider.send(email, 'same-request'), {
    kind: 'temporary',
    code: 'resend_unavailable',
  });
  assert.equal(aborted, true);
});

test('an unexpected successful response is retried with the same key; invalid provider IDs are never fetched', async () => {
  let calls = 0;
  const provider = createResendProvider('test-key', budget(), async () => {
    calls += 1;
    return Response.json({});
  });
  assert.equal((await provider.send(email, 'same-request')).kind, 'temporary');
  assert.equal((await provider.inspect('../outside')).kind, 'permanent');
  assert.equal(calls, 1);
});

test('every retry attempt consumes budget and exhausted accepted leads stay for manual review', async () => {
  const state = budget();
  state.limits = { hour: 1, day: 1, month: 1 };
  let now = START;
  state.now = () => now;
  let calls = 0;
  const guarded = createResendProvider('test-key', state, async () => {
    calls++;
    return Response.json({}, { status: 503 });
  });
  await enqueueQuote(
    state.store,
    state.namespace,
    QUOTE_ID,
    QUOTE,
    EMAIL_SETTINGS,
    START,
  );
  const ctx = { ...state, provider: guarded, now: () => now };
  await processQuote(ctx, QUOTE_ID);
  now += 5 * 60_000;
  await runQuoteMaintenance(ctx);
  const saved = await state.store.read<QuoteRecord>(
    quotePath(state.namespace, QUOTE_ID),
  );
  assert.equal(calls, 1);
  assert.equal(saved?.value.delivery.state, 'manual_review');
  assert.equal(saved?.value.delivery.attentionReason, 'email_budget_exhausted');
  now += 24 * 60 * 60_000;
  const maintenance = await runQuoteMaintenance(ctx);
  assert.equal(calls, 1);
  assert.equal(maintenance.busy, false);
  if (!maintenance.busy)
    assert.equal(maintenance.state.attentionOutstanding, true);
});

test('independent provider instances share budget; storage outage and multi-recipient mail never call Resend', async () => {
  const state = budget();
  state.limits = { hour: 1, day: 1, month: 1 };
  let calls = 0;
  const request: typeof fetch = async () => {
    calls++;
    return Response.json({ id: 'email-example' });
  };
  const result = await Promise.all(
    Array.from({ length: 8 }, (_, i) =>
      createResendProvider('test-key', state, request).send(email, String(i)),
    ),
  );
  assert.equal(calls, 1);
  assert.equal(result.filter((r) => r.kind === 'accepted').length, 1);
  state.store.failWrites = 1;
  assert.equal(
    (
      await createResendProvider('test-key', budget(), request).send(
        { ...email, to: ['one@example.com', 'two@example.com'] },
        'multi',
      )
    ).kind,
    'permanent',
  );
  const broken = budget();
  broken.store.failWrites = 1;
  assert.deepEqual(
    await createResendProvider('test-key', broken, request).send(
      email,
      'outage',
    ),
    { kind: 'permanent', code: 'email_budget_unavailable' },
  );
  assert.equal(calls, 1);
});

test('a saved never-attempted lead remains recoverable after an outage without changing the production retry clock', async () => {
  const state = budget();
  state.now = () => START + RETRY_WINDOW_MS;
  let calls = 0;
  const guarded = createResendProvider('test-key', state, async () => {
    calls++;
    return Response.json({ id: 'email-example' });
  });
  await enqueueQuote(
    state.store,
    state.namespace,
    QUOTE_ID,
    QUOTE,
    EMAIL_SETTINGS,
    START,
  );
  await processQuote(
    { ...state, provider: guarded, now: () => START + RETRY_WINDOW_MS },
    QUOTE_ID,
  );
  const saved = await state.store.read<QuoteRecord>(
    quotePath(state.namespace, QUOTE_ID),
  );
  assert.equal(calls, 1);
  assert.equal(saved?.value.delivery.state, 'accepted');
  assert.equal(
    saved?.value.delivery.firstAttemptAt,
    new Date(START + RETRY_WINDOW_MS).toISOString(),
  );
});

test('slow reservation responses cannot expire capacity before the actual HTTP send', async () => {
  const state = budget();
  state.limits = { hour: 1, day: 2, month: 2 };
  let now = START;
  state.now = () => now;
  const write = state.store.write.bind(state.store);
  state.store.write = async (path, value, etag) => {
    const result = await write(path, value, etag);
    now += 2_000;
    return result;
  };
  let calls = 0;
  const guarded = createResendProvider('test-key', state, async () => {
    calls++;
    return Response.json({ id: 'email-example' });
  });
  assert.equal((await guarded.send(email, 'first')).kind, 'accepted');
  now = START + 60 * 60_000 + 1_000;
  assert.deepEqual(await guarded.send(email, 'second'), {
    kind: 'permanent',
    code: 'email_budget_exhausted',
  });
  assert.equal(calls, 1);
});

test('stalled or excessively late reservation does not call the provider, even if it later saves', async () => {
  for (const stalled of [true, false]) {
    const state = { ...budget(), reservationTimeoutMs: 5 };
    let now = START;
    state.now = () => now;
    const write = state.store.write.bind(state.store);
    state.store.write = async (path, value, etag) => {
      if (stalled) await new Promise((resolve) => setTimeout(resolve, 15));
      else now += 6;
      return write(path, value, etag);
    };
    let calls = 0;
    const guarded = createResendProvider('test-key', state, async () => {
      calls++;
      return Response.json({ id: 'email-example' });
    });
    assert.deepEqual(await guarded.send(email, 'deadline'), {
      kind: 'permanent',
      code: 'email_budget_unavailable',
    });
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.equal(calls, 0);
    assert.equal(state.store.records.size, 1);
  }
});
