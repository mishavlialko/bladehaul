import assert from 'node:assert/strict';
import test from 'node:test';
import type { BudgetLimits } from '../../../lib/quote-budget';
import type { QuoteStore } from '../../../lib/quote-outbox';

const { MemoryStore, START } = (await import(
  new URL('./test-runtime.mts', import.meta.url).href
)) as typeof import('./test-runtime.mjs');
const {
  checkQuoteBudget,
  getQuoteSendBudgetLimits,
  QUOTE_DAILY_ADMISSION_LIMIT,
  reserveQuoteAdmission,
  reserveQuoteBudget,
} = (await import(
  new URL('../../../lib/quote-budget.ts', import.meta.url).href
)) as typeof import('../../../lib/quote-budget');

const HOUR = 60 * 60 * 1_000;
const DAY = 24 * HOUR;
const MONTH = 32 * DAY;
const limits: BudgetLimits = { hour: 2, day: 4, month: 6 };
const path = 'quote-outbox/development/controls/send-budget.json';
const environment = {
  QUOTE_EMAIL_HOURLY_LIMIT: '3',
  QUOTE_EMAIL_DAILY_LIMIT: '5',
  QUOTE_EMAIL_MONTHLY_LIMIT: '7',
};

function client(store: InstanceType<typeof MemoryStore>): QuoteStore {
  // Distinct clients share only the durable backend, as separate functions do.
  return {
    read: store.read.bind(store),
    write: store.write.bind(store),
    remove: store.remove.bind(store),
    list: store.list.bind(store),
  };
}

test('only explicit email allocation settings configure provider attempt limits', () => {
  assert.deepEqual(getQuoteSendBudgetLimits(environment), {
    hour: 3,
    day: 5,
    month: 7,
  });
});

test('missing, invalid or unbounded configuration never chooses a provider plan default', () => {
  assert.throws(
    () => getQuoteSendBudgetLimits({}),
    /quote_budget_config_invalid/,
  );
  for (const name of Object.keys(environment)) {
    for (const value of [
      undefined,
      '',
      '0',
      '-1',
      '1.5',
      '1e2',
      ' 2 ',
      '3501',
    ]) {
      assert.throws(
        () => getQuoteSendBudgetLimits({ ...environment, [name]: value }),
        /quote_budget_config_invalid/,
      );
    }
  }
  assert.throws(
    () =>
      getQuoteSendBudgetLimits({
        ...environment,
        QUOTE_EMAIL_HOURLY_LIMIT: '6',
      }),
    /quote_budget_config_invalid/,
  );
});

test('admission needs no email configuration, permits 100 daily and rejects the 101st', async () => {
  const store = new MemoryStore();
  assert.equal(QUOTE_DAILY_ADMISSION_LIMIT, 100);
  assert.throws(
    () => getQuoteSendBudgetLimits({}),
    /quote_budget_config_invalid/,
  );
  for (let index = 0; index < 100; index += 1) {
    assert.deepEqual(await reserveQuoteAdmission(store, 'development', START), {
      allowed: true,
    });
  }
  assert.deepEqual(await reserveQuoteAdmission(store, 'development', START), {
    allowed: false,
    retryAfterSeconds: DAY / 1_000,
  });
  assert.deepEqual(
    await reserveQuoteAdmission(store, 'development', START + DAY - 1),
    { allowed: false, retryAfterSeconds: 1 },
  );
  assert.deepEqual(
    await reserveQuoteAdmission(store, 'development', START + DAY),
    { allowed: true },
  );
});

test('100 admissions each rolling day remain available across and beyond 32 days', async () => {
  const store = new MemoryStore();
  const admissionPath =
    'quote-outbox/development/controls/admission-budget.json';
  for (let day = 0; day <= 32; day += 1) {
    for (let index = 0; index < 100; index += 1) {
      assert.deepEqual(
        await reserveQuoteAdmission(store, 'development', START + day * DAY),
        { allowed: true },
        `day ${day}, admission ${index + 1}`,
      );
    }
  }
  const ledger = await store.read<{ reservations: number[] }>(admissionPath);
  assert.equal(ledger?.value.reservations.length, 3_200);
  assert.ok(Buffer.byteLength(JSON.stringify(ledger?.value)) < 65_536);
});

test('independent clients cannot race beyond the 100th admission', async () => {
  const store = new MemoryStore();
  for (let index = 0; index < 99; index += 1)
    await reserveQuoteAdmission(store, 'development', START);
  const results = await Promise.all(
    Array.from({ length: 8 }, () =>
      reserveQuoteAdmission(client(store), 'development', START),
    ),
  );
  assert.equal(results.filter((result) => result.allowed).length, 1);
  assert.equal(results.filter((result) => !result.allowed).length, 7);
});

test('global caps apply across separate clients despite rotating, absent or spoofed ingress headers', async () => {
  const store = new MemoryStore();
  await store.write(path, { version: 1, reservations: [] }, null);
  const ingress = [
    {},
    { 'x-forwarded-for': '192.0.2.1' },
    { 'x-forwarded-for': '198.51.100.1' },
    { 'x-vercel-forwarded-for': '203.0.113.1' },
    { 'x-forwarded-for': 'spoofed' },
    { 'x-real-ip': '192.0.2.2' },
    { 'x-forwarded-for': '198.51.100.2' },
    { 'x-vercel-forwarded-for': '203.0.113.2' },
  ];
  const results = await Promise.all(
    ingress.map((headers) =>
      reserveQuoteBudget(
        Object.assign(client(store), { headers }),
        'development',
        'send',
        limits,
        START,
      ),
    ),
  );
  assert.equal(results.filter((result) => result.allowed).length, 2);
  assert.equal(results.filter((result) => !result.allowed).length, 6);
  const ledger = await store.read(path);
  assert.deepEqual(ledger?.value, { version: 1, reservations: [START, START] });
});

test('admission, sending and deployment namespaces have separate durable ledgers', async () => {
  const store = new MemoryStore();
  const one = { hour: 1, day: 1, month: 1 };
  for (const kind of ['admission', 'send'] as const) {
    for (const namespace of ['development', 'preview']) {
      assert.deepEqual(
        await reserveQuoteBudget(store, namespace, kind, one, START),
        { allowed: true },
      );
      assert.equal(
        (await reserveQuoteBudget(store, namespace, kind, one, START)).allowed,
        false,
      );
    }
  }
  assert.equal(store.records.size, 4);
  assert.ok(
    [...store.records.keys()].every((key) => key.includes('/controls/')),
  );
});

test('availability checks never consume or create a reservation', async () => {
  const store = new MemoryStore();
  const one = { hour: 1, day: 1, month: 1 };
  assert.deepEqual(
    await checkQuoteBudget(store, 'development', 'send', one, START),
    { allowed: true },
  );
  assert.equal(store.records.size, 0);
  await reserveQuoteBudget(store, 'development', 'send', one, START);
  const original = await store.read(path);
  assert.deepEqual(
    await checkQuoteBudget(store, 'development', 'send', one, START),
    { allowed: false, retryAfterSeconds: MONTH / 1_000 },
  );
  assert.deepEqual(
    await checkQuoteBudget(store, 'development', 'send', one, START + MONTH),
    { allowed: true },
  );
  assert.deepEqual(await store.read(path), original);
});

test('hourly cap is rolling across a wall-clock hour and only expires at its full duration', async () => {
  const store = new MemoryStore();
  const now = START + HOUR - 1;
  const onePerHour = { hour: 1, day: 2, month: 3 };
  await reserveQuoteBudget(store, 'development', 'send', onePerHour, now);
  assert.deepEqual(
    await reserveQuoteBudget(store, 'development', 'send', onePerHour, now + 2),
    { allowed: false, retryAfterSeconds: 3_600 },
  );
  assert.deepEqual(
    await reserveQuoteBudget(
      store,
      'development',
      'send',
      onePerHour,
      now + HOUR - 1,
    ),
    { allowed: false, retryAfterSeconds: 1 },
  );
  assert.deepEqual(
    await reserveQuoteBudget(
      store,
      'development',
      'send',
      onePerHour,
      now + HOUR,
    ),
    { allowed: true },
  );
});

test('daily cap spans midnight and a monthly cap spans a full conservative 32 days', async () => {
  for (const [duration, one] of [
    [DAY, { hour: 1, day: 1, month: 2 }],
    [MONTH, { hour: 1, day: 1, month: 1 }],
  ] as const) {
    const store = new MemoryStore();
    await reserveQuoteBudget(store, 'development', 'send', one, START);
    assert.deepEqual(
      await reserveQuoteBudget(
        store,
        'development',
        'send',
        one,
        START + duration - 1,
      ),
      { allowed: false, retryAfterSeconds: 1 },
    );
    assert.deepEqual(
      await reserveQuoteBudget(
        store,
        'development',
        'send',
        one,
        START + duration,
      ),
      { allowed: true },
    );
  }
});

test('retry wait covers every exhausted window and tighter limits do not discard prior counts', async () => {
  const store = new MemoryStore();
  await store.write(
    path,
    { version: 1, reservations: [START - 2 * HOUR, START - HOUR / 2, START] },
    null,
  );
  assert.deepEqual(
    await reserveQuoteBudget(
      store,
      'development',
      'send',
      { hour: 1, day: 2, month: 3 },
      START,
    ),
    { allowed: false, retryAfterSeconds: MONTH / 1_000 - (2 * HOUR) / 1_000 },
  );
  const stored = await store.read<{ reservations: number[] }>(path);
  assert.equal(stored?.value.reservations.length, 3);
});

test('expired reservations are pruned on the next successful reservation and ledger remains under 65 KiB', async () => {
  const store = new MemoryStore();
  const maximum = { hour: 3_500, day: 3_500, month: 3_500 };
  await store.write(
    path,
    { version: 1, reservations: Array.from({ length: 3_499 }, () => START) },
    null,
  );
  assert.deepEqual(
    await reserveQuoteBudget(store, 'development', 'send', maximum, START),
    { allowed: true },
  );
  const full = await store.read<{ reservations: number[] }>(path);
  assert.equal(full?.value.reservations.length, 3_500);
  assert.ok(Buffer.byteLength(JSON.stringify(full?.value)) < 65_536);
  assert.ok(
    Buffer.byteLength(
      JSON.stringify({
        version: 1,
        reservations: Array.from(
          { length: 3_500 },
          () => 8_640_000_000_000_000,
        ),
      }),
    ) < 65_536,
  );
  assert.equal(
    (await reserveQuoteBudget(store, 'development', 'send', maximum, START))
      .allowed,
    false,
  );
  await reserveQuoteBudget(
    store,
    'development',
    'send',
    maximum,
    START + MONTH,
  );
  assert.deepEqual((await store.read(path))?.value, {
    version: 1,
    reservations: [START + MONTH],
  });
});

test('clock rollback cannot erase or move an already consumed reservation earlier', async () => {
  const store = new MemoryStore();
  await reserveQuoteBudget(store, 'development', 'send', limits, START);
  await reserveQuoteBudget(store, 'development', 'send', limits, START - 1_000);
  assert.deepEqual((await store.read(path))?.value, {
    version: 1,
    reservations: [START, START],
  });
  assert.deepEqual(
    await reserveQuoteBudget(
      store,
      'development',
      'send',
      limits,
      START - 1_000,
    ),
    { allowed: false, retryAfterSeconds: 3_601 },
  );
});

test('malformed or oversized ledgers fail closed instead of resetting counts', async () => {
  for (const value of [
    null,
    [],
    {},
    { version: 2, reservations: [] },
    { version: 1, reservations: 'invalid' },
    { version: 1, reservations: [-1] },
    { version: 1, reservations: [1.5] },
    { version: 1, reservations: ['2030-01-01'] },
    { version: 1, reservations: [NaN] },
    { version: 1, reservations: [Infinity] },
    { version: 1, reservations: [START, START - 1] },
    { version: 1, reservations: Array.from({ length: 3_501 }, () => START) },
    { version: 1, reservations: [], unexpected: true },
  ]) {
    const store = new MemoryStore();
    await store.write(path, value, null);
    const original = await store.read(path);
    await assert.rejects(
      reserveQuoteBudget(store, 'development', 'send', limits, START),
      /quote_budget_ledger_invalid/,
    );
    await assert.rejects(
      checkQuoteBudget(store, 'development', 'send', limits, START),
      /quote_budget_ledger_invalid/,
    );
    assert.deepEqual(await store.read(path), original);
  }
});

test('invalid explicit limits, path or clock fail closed before any storage write', async () => {
  const store = new MemoryStore();
  for (const invalid of [
    { hour: 0, day: 2, month: 3 },
    { hour: 2, day: 1, month: 3 },
    { hour: 1, day: 3, month: 2 },
    { hour: 1, day: 2, month: 3_501 },
    { hour: NaN, day: 2, month: 3 },
  ]) {
    await assert.rejects(
      reserveQuoteBudget(store, 'development', 'send', invalid, START),
      /quote_budget_config_invalid/,
    );
  }
  for (const namespace of ['', '../production', 'development/requests']) {
    await assert.rejects(
      reserveQuoteBudget(store, namespace, 'send', limits, START),
      /quote_budget_namespace_invalid/,
    );
  }
  for (const now of [-1, NaN, Infinity, START + 0.5]) {
    await assert.rejects(
      reserveQuoteBudget(store, 'development', 'send', limits, now),
      /quote_budget_clock_invalid/,
    );
  }
  assert.equal(store.records.size, 0);
});

test('storage read and write outages never return permission', async () => {
  const unreadable = new MemoryStore();
  unreadable.read = async () => {
    throw new Error('simulated_store_outage');
  };
  await assert.rejects(
    reserveQuoteBudget(unreadable, 'development', 'send', limits, START),
    /simulated_store_outage/,
  );
  const unwritable = new MemoryStore();
  unwritable.failWrites = 1;
  await assert.rejects(
    reserveQuoteBudget(unwritable, 'development', 'send', limits, START),
    /simulated_store_outage/,
  );
  assert.equal(unwritable.records.size, 0);
});

test('bounded compare-and-swap conflicts never grant an unconfirmed reservation', async () => {
  const store = new MemoryStore();
  await store.write(path, { version: 1, reservations: [] }, null);
  let writes = 0;
  store.write = async () => {
    writes += 1;
    return null;
  };
  await assert.rejects(
    reserveQuoteBudget(store, 'development', 'send', limits, START),
    /quote_budget_busy/,
  );
  assert.equal(writes, 3);
  assert.deepEqual((await store.read(path))?.value, {
    version: 1,
    reservations: [],
  });
});

test('concurrent reservations are bounded even when high contention exhausts conflict retries', async () => {
  const store = new MemoryStore();
  await store.write(path, { version: 1, reservations: [] }, null);
  const results = await Promise.allSettled(
    Array.from({ length: 12 }, () =>
      reserveQuoteBudget(
        client(store),
        'development',
        'send',
        { hour: 5, day: 5, month: 5 },
        START,
      ),
    ),
  );
  const allowed = results.filter(
    (result) => result.status === 'fulfilled' && result.value.allowed,
  );
  const stored = await store.read<{ reservations: number[] }>(path);
  assert.ok(allowed.length > 0 && allowed.length <= 5);
  assert.equal(stored?.value.reservations.length, allowed.length);
  for (const result of results) {
    if (result.status === 'rejected')
      assert.match(String(result.reason), /quote_budget_busy/);
  }
});

test('ambiguous successful creates reported as collisions never authorize a send in that invocation', async () => {
  const store = new MemoryStore();
  const originalWrite = store.write.bind(store);
  let writes = 0;
  store.write = async (key, value, etag) => {
    writes += 1;
    const result = await originalWrite(key, value, etag);
    // The Blob adapter rereads an uncertain CREATE and reports null when an
    // object exists. That is indistinguishable from another worker's create.
    return etag === null ? null : result;
  };
  let sends = 0;
  await assert.rejects(async () => {
    const result = await reserveQuoteBudget(
      store,
      'development',
      'send',
      limits,
      START,
    );
    if (result.allowed) sends += 1;
  }, /quote_budget_busy/);
  assert.equal(sends, 0);
  assert.equal(writes, 1);
  assert.deepEqual((await store.read(path))?.value, {
    version: 1,
    reservations: [START],
  });
});

test('concurrent first creates confirm one reservation and require the others to retry', async () => {
  const store = new MemoryStore();
  const results = await Promise.allSettled(
    Array.from({ length: 8 }, () =>
      reserveQuoteBudget(client(store), 'development', 'send', limits, START),
    ),
  );
  assert.equal(
    results.filter(
      (result) => result.status === 'fulfilled' && result.value.allowed,
    ).length,
    1,
  );
  for (const result of results) {
    if (result.status === 'rejected')
      assert.match(String(result.reason), /quote_budget_busy/);
  }
  assert.deepEqual((await store.read(path))?.value, {
    version: 1,
    reservations: [START],
  });
  assert.deepEqual(
    await reserveQuoteBudget(store, 'development', 'send', limits, START),
    { allowed: true },
  );
  assert.equal(
    (await reserveQuoteBudget(store, 'development', 'send', limits, START))
      .allowed,
    false,
  );
});

test('lost write responses consume the reservation without authorizing a provider call or refund', async () => {
  const store = new MemoryStore();
  const originalWrite = store.write.bind(store);
  store.write = async (key, value, etag) => {
    await originalWrite(key, value, etag);
    throw new Error('simulated_response_loss');
  };
  const one = { hour: 1, day: 1, month: 1 };
  let sends = 0;
  await assert.rejects(async () => {
    const result = await reserveQuoteBudget(
      store,
      'development',
      'send',
      one,
      START,
    );
    if (result.allowed) sends += 1;
  }, /simulated_response_loss/);
  assert.equal(sends, 0);
  store.write = originalWrite;
  assert.deepEqual(
    await reserveQuoteBudget(store, 'development', 'send', one, START),
    { allowed: false, retryAfterSeconds: MONTH / 1_000 },
  );
  assert.deepEqual((await store.read(path))?.value, {
    version: 1,
    reservations: [START],
  });
});
