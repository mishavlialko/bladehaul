import assert from 'node:assert/strict';
import test from 'node:test';
import type { QuoteRecord } from '../../../lib/quote-outbox';

const { EMAIL_SETTINGS, MemoryStore, provider, QUOTE, QUOTE_ID, START } =
  (await import(
    new URL('./test-runtime.mts', import.meta.url).href
  )) as typeof import('./test-runtime.mjs');

const {
  buildQuoteEmail,
  DELIVERY_LEASE_MS,
  enqueueQuote,
  hashQuote,
  nextRetryAt,
  processQuote,
  quotePath,
  QUOTE_RETENTION_MS,
  RETRY_WINDOW_MS,
} = (await import(
  new URL('../../../lib/quote-outbox.ts', import.meta.url).href
)) as typeof import('../../../lib/quote-outbox');
const { maintenanceIsHealthy, maintenancePath, runQuoteMaintenance } =
  (await import(
    new URL('../../../lib/quote-maintenance.ts', import.meta.url).href
  )) as typeof import('../../../lib/quote-maintenance');
const path = quotePath('development', QUOTE_ID);

async function saved(store: InstanceType<typeof MemoryStore>) {
  const record = await store.read<QuoteRecord>(path);
  assert.ok(record);
  return record.value;
}

test('no acceptance without a durable create', async () => {
  const store = new MemoryStore();
  store.failWrites = 1;
  await assert.rejects(
    enqueueQuote(store, 'development', QUOTE_ID, QUOTE, EMAIL_SETTINGS, START),
  );
  assert.equal(store.records.size, 0);
});

test('concurrent identical submissions create exactly one record; changed payload conflicts', async () => {
  const store = new MemoryStore();
  const results = await Promise.all(
    Array.from({ length: 8 }, () =>
      enqueueQuote(
        store,
        'development',
        QUOTE_ID,
        QUOTE,
        EMAIL_SETTINGS,
        START,
      ),
    ),
  );
  assert.equal(
    results.filter((result) => result.kind === 'accepted').length,
    1,
  );
  assert.equal(
    results.filter((result) => result.kind === 'duplicate').length,
    7,
  );
  assert.equal(store.records.size, 1);
  const changed = await enqueueQuote(
    store,
    'development',
    QUOTE_ID,
    { ...QUOTE, additionalDetails: 'Changed requirement' },
    EMAIL_SETTINGS,
    START,
  );
  assert.equal(changed.kind, 'conflict');
  assert.equal((await saved(store)).quote.additionalDetails, '');
});

test('payload hashes are insensitive to JSON property order and sensitive to actual consent changes', () => {
  assert.equal(
    hashQuote(QUOTE),
    hashQuote(
      Object.fromEntries(Object.entries(QUOTE).reverse()) as typeof QUOTE,
    ),
  );
  assert.notEqual(hashQuote(QUOTE), hashQuote({ ...QUOTE, consentTcpa: true }));
});

test('message is readable plain text, has Reply-To and includes actual consent/body/details', () => {
  const email = buildQuoteEmail(
    { ...QUOTE, additionalDetails: '<script>example</script>' },
    QUOTE_ID,
    new Date(START).toISOString(),
    EMAIL_SETTINGS.from,
    EMAIL_SETTINGS.recipient,
  );
  assert.deepEqual(email.reply_to, [QUOTE.email]);
  assert.match(email.text, /Body type: sedan/);
  assert.match(email.text, /Phone follow-up consent: No/);
  assert.match(email.text, /<script>example<\/script>/);
  assert.equal('html' in email, false);
});

test('provider call occurs only after durable first-attempt lease; concurrent workers send once', async () => {
  const store = new MemoryStore();
  await enqueueQuote(
    store,
    'development',
    QUOTE_ID,
    QUOTE,
    EMAIL_SETTINGS,
    START,
  );
  let sends = 0;
  const context = {
    store,
    namespace: 'development',
    now: () => START,
    provider: provider({
      send: async () => {
        sends += 1;
        const record = await saved(store);
        assert.equal(record.delivery.state, 'sending');
        assert.equal(
          record.delivery.firstAttemptAt,
          new Date(START).toISOString(),
        );
        assert.ok(record.delivery.lease);
        return { kind: 'accepted', id: 'email-example-1' };
      },
    }),
  };
  await Promise.all([
    processQuote(context, QUOTE_ID),
    processQuote(context, QUOTE_ID),
  ]);
  assert.equal(sends, 1);
  assert.equal((await saved(store)).delivery.state, 'accepted');
});

test('a lost post-send state save recovers the same provider key and exact message after lease expiry', async () => {
  const store = new MemoryStore();
  await enqueueQuote(
    store,
    'development',
    QUOTE_ID,
    QUOTE,
    EMAIL_SETTINGS,
    START,
  );
  let now = START;
  const sentBodies = new Map<string, string>();
  let uniqueMessages = 0;
  let attempts = 0;
  const context = {
    store,
    namespace: 'development',
    now: () => now,
    provider: provider({
      send: async (email, key) => {
        attempts += 1;
        if (sentBodies.has(key))
          assert.equal(sentBodies.get(key), JSON.stringify(email));
        else {
          sentBodies.set(key, JSON.stringify(email));
          uniqueMessages += 1;
        }
        if (attempts === 1) store.failWrites = 1;
        return { kind: 'accepted', id: 'email-example-1' };
      },
    }),
  };
  await assert.rejects(processQuote(context, QUOTE_ID));
  assert.equal((await saved(store)).delivery.state, 'sending');
  assert.equal(await processQuote(context, QUOTE_ID), 'skipped');
  now += DELIVERY_LEASE_MS + 1;
  await processQuote(context, QUOTE_ID);
  assert.equal(uniqueMessages, 1);
  assert.equal(attempts, 2);
  assert.equal((await saved(store)).delivery.state, 'accepted');
});

test('accepted messages are inspected, never sent again; a bounce is a manual-recovery state', async () => {
  const store = new MemoryStore();
  await enqueueQuote(
    store,
    'development',
    QUOTE_ID,
    QUOTE,
    EMAIL_SETTINGS,
    START,
  );
  let now = START;
  let sends = 0;
  const context = {
    store,
    namespace: 'development',
    now: () => now,
    provider: provider({
      send: async () => {
        sends += 1;
        return { kind: 'accepted', id: 'email-example-1' };
      },
      inspect: async () => ({ kind: 'event', event: 'bounced' }),
    }),
  };
  await processQuote(context, QUOTE_ID);
  now += 5 * 60_000;
  await processQuote(context, QUOTE_ID);
  assert.equal(sends, 1);
  assert.equal((await saved(store)).delivery.state, 'manual_review');
  assert.equal((await saved(store)).delivery.attentionReason, 'email_bounced');
  now += 60_000;
  assert.equal(await processQuote(context, QUOTE_ID), 'skipped');
});

test('retry schedule uses 5/15/60 minutes then hourly within the 23-hour cutoff', () => {
  const first = new Date(START).toISOString();
  assert.equal(Date.parse(nextRetryAt(first, START)!) - START, 5 * 60_000);
  assert.equal(
    Date.parse(nextRetryAt(first, START + 5 * 60_000)!) - START,
    15 * 60_000,
  );
  assert.equal(
    Date.parse(nextRetryAt(first, START + 15 * 60_000)!) - START,
    60 * 60_000,
  );
  assert.equal(
    Date.parse(nextRetryAt(first, START + 60 * 60_000)!) - START,
    120 * 60_000,
  );
  assert.equal(nextRetryAt(first, START + RETRY_WINDOW_MS), null);
});

test('an uncertain send is never retried outside the provider idempotency window', async () => {
  const store = new MemoryStore();
  await enqueueQuote(
    store,
    'development',
    QUOTE_ID,
    QUOTE,
    EMAIL_SETTINGS,
    START,
  );
  let now = START;
  let sends = 0;
  const context = {
    store,
    namespace: 'development',
    now: () => now,
    provider: provider({
      send: async () => {
        sends += 1;
        return { kind: 'temporary', code: 'resend_unavailable' };
      },
    }),
  };
  await processQuote(context, QUOTE_ID);
  now += RETRY_WINDOW_MS;
  await processQuote(context, QUOTE_ID);
  assert.equal(sends, 1);
  assert.equal((await saved(store)).delivery.state, 'manual_review');
  assert.equal(
    (await saved(store)).delivery.attentionReason,
    'retry_window_expired',
  );
});

test('maintenance recovers pending work, records a heartbeat, and deletes at 30 days by CAS', async () => {
  const store = new MemoryStore();
  await enqueueQuote(
    store,
    'development',
    QUOTE_ID,
    QUOTE,
    EMAIL_SETTINGS,
    START,
  );
  let now = START;
  const context = {
    store,
    namespace: 'development',
    now: () => now,
    provider: provider(),
  };
  const first = await runQuoteMaintenance(context);
  assert.equal(first.busy, false);
  assert.equal((await saved(store)).delivery.state, 'accepted');
  now += 5 * 60_000;
  await runQuoteMaintenance(context);
  assert.equal((await saved(store)).delivery.state, 'delivered');
  now = START + QUOTE_RETENTION_MS;
  const cleanup = await runQuoteMaintenance(context);
  assert.equal(cleanup.busy, false);
  assert.equal(await store.read(path), null);
  assert.ok(await store.read(maintenancePath('development')));
  if (!cleanup.busy) {
    assert.equal(cleanup.state.lastBatch?.deleted, 1);
    assert.equal(cleanup.state.lastFinishedAt, new Date(now).toISOString());
  }
});

test('overlapping maintenance invocations cannot own the same batch', async () => {
  const store = new MemoryStore();
  const context = {
    store,
    namespace: 'development',
    now: () => START,
    provider: provider(),
  };
  const results = await Promise.all([
    runQuoteMaintenance(context),
    runQuoteMaintenance(context),
  ]);
  assert.equal(results.filter((result) => result.busy).length, 1);
});

test('retention cleanup continues during missing-email configuration and health reports the outage', async () => {
  const store = new MemoryStore();
  await enqueueQuote(
    store,
    'development',
    QUOTE_ID,
    QUOTE,
    EMAIL_SETTINGS,
    START,
  );
  const result = await runQuoteMaintenance({
    store,
    namespace: 'development',
    now: () => START + QUOTE_RETENTION_MS,
  });
  assert.equal(await store.read(path), null);
  assert.equal(result.busy, false);
  if (!result.busy) {
    assert.equal(result.state.lastBatch?.deleted, 1);
    assert.equal(result.state.lastBatch?.deliveryUnavailable, true);
    assert.equal(
      maintenanceIsHealthy(result.state, START + QUOTE_RETENTION_MS),
      false,
    );
  }
});

test('slow early records cannot starve later records in an interrupted page', async () => {
  const store = new MemoryStore();
  const ids = Array.from(
    { length: 20 },
    (_, index) =>
      `00000000-0000-4000-8000-${(index + 1).toString(16).padStart(12, '0')}`,
  );
  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];
    await enqueueQuote(store, 'development', id, QUOTE, EMAIL_SETTINGS, START);
    if (index < 15) {
      const record = (await store.read<QuoteRecord>(
        quotePath('development', id),
      ))!;
      record.value.delivery.state = 'delivered';
      record.value.delivery.nextAttemptAt = null;
      await store.write(
        quotePath('development', id),
        record.value,
        record.etag,
      );
    }
  }
  let now = START;
  const originalRead = store.read.bind(store);
  store.read = async <T,>(recordPath: string) => {
    now += 8_000;
    return originalRead<T>(recordPath);
  };
  let sends = 0;
  const context = {
    store,
    namespace: 'development',
    now: () => now,
    provider: provider({
      send: async () => {
        sends += 1;
        return { kind: 'accepted', id: 'email-example-1' };
      },
    }),
  };
  for (let index = 0; index < 4; index += 1) {
    await runQuoteMaintenance(context);
    now += 5 * 60_000;
  }
  assert.equal(sends, 5);
  const last = await originalRead<QuoteRecord>(
    quotePath('development', ids[19]),
  );
  assert.equal(last?.value.delivery.attempts, 1);
});

test('health cannot turn green from a clean later batch while an earlier record still needs recovery', async () => {
  const store = new MemoryStore();
  await enqueueQuote(
    store,
    'development',
    QUOTE_ID,
    QUOTE,
    EMAIL_SETTINGS,
    START,
  );
  const result = await runQuoteMaintenance({
    store,
    namespace: 'development',
    now: () => START,
    provider: provider({
      send: async () => ({ kind: 'permanent', code: 'resend_http_403' }),
    }),
  });
  assert.equal(result.busy, false);
  if (result.busy) return;
  assert.equal(result.state.attentionOutstanding, true);
  assert.equal(
    maintenanceIsHealthy(
      {
        ...result.state,
        lastBatch: {
          ...result.state.lastBatch!,
          manualReviewIds: [],
          errors: 0,
        },
      },
      START,
    ),
    false,
  );
  assert.equal(
    maintenanceIsHealthy(
      { ...result.state, attentionOutstanding: false, scanInProgress: true },
      START,
    ),
    false,
  );
});
