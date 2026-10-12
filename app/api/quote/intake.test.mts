import assert from 'node:assert/strict';
import test from 'node:test';
import type { QuoteRecord } from '../../../lib/quote-outbox';

const { EMAIL_SETTINGS, MemoryStore, QUOTE, QUOTE_ID, START } = (await import(
  new URL('./test-runtime.mts', import.meta.url).href
)) as typeof import('./test-runtime.mjs');
const { admitQuote, verifyQuoteBrowser } = (await import(
  new URL('../../../lib/quote-intake.ts', import.meta.url).href
)) as typeof import('../../../lib/quote-intake');
const { quotePath } = (await import(
  new URL('../../../lib/quote-outbox.ts', import.meta.url).href
)) as typeof import('../../../lib/quote-outbox');

const admissionPath = 'quote-outbox/development/controls/admission-budget.json';
const DAY = 24 * 60 * 60_000;

function context(store = new MemoryStore()) {
  return {
    store,
    namespace: 'development',
    notification: EMAIL_SETTINGS,
    verifyBrowser: async () => ({ isBot: false }),
    now: () => START,
  };
}

function id(index: number) {
  return `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;
}

test('bot, bypassed, missing, and unavailable verification never access storage', async () => {
  const ctx = context();
  let reads = 0;
  ctx.store.read = async () => {
    reads++;
    throw new Error('must_not_read');
  };
  for (const [check, expected] of [
    [async () => ({ isBot: true }), 'rejected'],
    [async () => ({ isBot: false, bypassed: true }), 'rejected'],
    [async () => ({}) as { isBot: boolean }, 'rejected'],
    [
      async () => {
        throw new Error('synthetic_verification_outage');
      },
      'unavailable',
    ],
  ] as const) {
    assert.equal(
      (await admitQuote({ ...ctx, verifyBrowser: check }, QUOTE_ID, QUOTE))
        .kind,
      expected,
    );
  }
  assert.equal(reads, 0);
  assert.equal(ctx.store.records.size, 0);
});

test('a stalled verification has a bounded deadline without authorizing storage', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const pending = verifyQuoteBrowser(() => new Promise(() => {}), 6_000);
  t.mock.timers.tick(5_999);
  let settled = false;
  void pending.then(() => {
    settled = true;
  });
  await Promise.resolve();
  assert.equal(settled, false);
  t.mock.timers.tick(1);
  assert.equal(await pending, 'unavailable');
});

test('100 new daily admissions are independent of mail capacity; receipt retries do not consume admission', async () => {
  const ctx = context();
  await ctx.store.write(
    'quote-outbox/development/controls/send-budget.json',
    {
      version: 1,
      reservations: Array.from({ length: 100 }, () => START),
    },
    null,
  );
  for (let index = 1; index <= 100; index++) {
    assert.equal((await admitQuote(ctx, id(index), QUOTE)).kind, 'accepted');
  }
  const before = await ctx.store.read(admissionPath);
  assert.deepEqual(await admitQuote(ctx, id(101), QUOTE), {
    kind: 'limited',
    retryAfterSeconds: DAY / 1_000,
  });
  assert.equal((await admitQuote(ctx, QUOTE_ID, QUOTE)).kind, 'duplicate');
  assert.equal(
    (await admitQuote(ctx, QUOTE_ID, { ...QUOTE, vehicleModel: 'Changed' }))
      .kind,
    'conflict',
  );
  assert.deepEqual(await ctx.store.read(admissionPath), before);
  assert.equal(
    [...ctx.store.records.keys()].filter((path) => path.includes('/requests/'))
      .length,
    100,
  );
});

test('crossing midnight does not reset the daily admission allowance', async () => {
  const ctx = context();
  const beforeMidnight = Date.parse('2030-01-01T23:59:59.000Z');
  await ctx.store.write(
    admissionPath,
    {
      version: 1,
      reservations: Array.from({ length: 100 }, () => beforeMidnight),
    },
    null,
  );
  assert.deepEqual(
    await admitQuote(
      { ...ctx, now: () => beforeMidnight + 2_000 },
      QUOTE_ID,
      QUOTE,
    ),
    {
      kind: 'limited',
      retryAfterSeconds: (DAY - 2_000) / 1_000,
    },
  );
  assert.equal(
    (
      await admitQuote(
        { ...ctx, now: () => beforeMidnight + DAY },
        QUOTE_ID,
        QUOTE,
      )
    ).kind,
    'accepted',
  );
});

test('concurrent same-ID submissions recover one receipt and one admission', async () => {
  const ctx = context();
  const results = await Promise.all(
    Array.from({ length: 8 }, () => admitQuote(ctx, QUOTE_ID, QUOTE)),
  );
  assert.equal(
    results.filter((result) => result.kind === 'accepted').length,
    1,
  );
  assert.equal(
    results.filter((result) => result.kind === 'duplicate').length,
    7,
  );
  assert.equal(
    [...ctx.store.records.keys()].filter((path) => path.includes('/requests/'))
      .length,
    1,
  );
  assert.deepEqual((await ctx.store.read(admissionPath))?.value, {
    version: 1,
    reservations: [START],
  });
});

test('concurrent distinct submissions cannot exceed the remaining daily admission', async () => {
  const ctx = context();
  await ctx.store.write(
    admissionPath,
    { version: 1, reservations: Array.from({ length: 99 }, () => START) },
    null,
  );
  const results = await Promise.all(
    Array.from({ length: 8 }, (_, index) =>
      admitQuote(ctx, id(index + 1), QUOTE),
    ),
  );
  assert.equal(
    results.filter((result) => result.kind === 'accepted').length,
    1,
  );
  assert.equal(results.filter((result) => result.kind === 'limited').length, 7);
  assert.equal(
    [...ctx.store.records.keys()].filter((path) => path.includes('/requests/'))
      .length,
    1,
  );
});

test('a lead-storage failure never returns an accepted receipt or refunds uncertain capacity', async () => {
  const ctx = context();
  const write = ctx.store.write.bind(ctx.store);
  ctx.store.write = async (path, value, etag) => {
    if (path.includes('/requests/'))
      throw new Error('synthetic_lead_storage_outage');
    return write(path, value, etag);
  };
  await assert.rejects(
    admitQuote(ctx, QUOTE_ID, QUOTE),
    /synthetic_lead_storage_outage/,
  );
  assert.equal(await ctx.store.read(quotePath(ctx.namespace, QUOTE_ID)), null);
  assert.deepEqual((await ctx.store.read(admissionPath))?.value, {
    version: 1,
    reservations: [START],
  });
});

test('a concurrent receipt is recovered after an ambiguous admission reservation', async () => {
  const ctx = context();
  const write = ctx.store.write.bind(ctx.store);
  const { enqueueQuote } = (await import(
    new URL('../../../lib/quote-outbox.ts', import.meta.url).href
  )) as typeof import('../../../lib/quote-outbox');
  ctx.store.write = async (path, value, etag) => {
    if (path === admissionPath) {
      await enqueueQuote(
        ctx.store,
        ctx.namespace,
        QUOTE_ID,
        QUOTE,
        EMAIL_SETTINGS,
        START,
      );
      return null;
    }
    return write(path, value, etag);
  };
  assert.equal((await admitQuote(ctx, QUOTE_ID, QUOTE)).kind, 'duplicate');
  const saved = await ctx.store.read<QuoteRecord>(
    quotePath(ctx.namespace, QUOTE_ID),
  );
  assert.equal(
    saved?.value.idempotencyKey,
    `bladehaul-quote/development/${QUOTE_ID}`,
  );
});
