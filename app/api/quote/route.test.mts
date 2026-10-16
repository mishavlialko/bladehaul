import assert from 'node:assert/strict';
import test from 'node:test';
import type { QuoteRecord } from '../../../lib/quote-outbox';

const { MemoryStore, QUOTE, QUOTE_ID, START } = (await import(
  new URL('./test-runtime.mts', import.meta.url).href
)) as typeof import('./test-runtime.mjs');

type Verification = { isBot: boolean; bypassed?: boolean };
type Scenario = {
  store: InstanceType<typeof MemoryStore>;
  reads: string[];
  writes: string[];
  verificationCalls: unknown[];
  verify: () => Promise<Verification>;
  callbacks: Array<() => Promise<void>>;
  httpCalls: Array<{ url: string; options?: RequestInit }>;
  logs: unknown[][];
};
const LEAD_URL =
  'https://crm.example.test/api/v1/auto-logistics/client/webhooks/lead/synthetic-route-key/save';
const scenarioKey = Symbol.for('bladehaul.synthetic.quote-route-test');
const globals = globalThis as unknown as Record<symbol, Scenario>;
const stub = (source: string) =>
  `data:text/javascript,${encodeURIComponent(source)}`;
const stateExpression =
  'globalThis[Symbol.for("bladehaul.synthetic.quote-route-test")]';
const modules: Record<string, string> = {
  'next/server': stub(`export const NextResponse = Response;
    export function after(callback) { ${stateExpression}.callbacks.push(callback); }`),
  'botid/server': stub(`export async function checkBotId(options) {
    const state = ${stateExpression}; state.verificationCalls.push(options); return state.verify(); }`),
  '@/lib/quote-blob-store': stub(
    `export function createQuoteBlobStore() { return ${stateExpression}.store; }`,
  ),
};

// Only this test process redirects imports. The actual POST handler, schema,
// intake, outbox, configuration and email guard execute without source hooks.
const { registerHooks } = await import('node:module' as string);
const hooks = registerHooks({
  resolve(
    specifier: string,
    context: { parentURL?: string },
    nextResolve: (
      specifier: string,
      context: { parentURL?: string },
    ) => unknown,
  ) {
    if (modules[specifier])
      return { url: modules[specifier], shortCircuit: true };
    if (specifier.startsWith('@/lib/'))
      return nextResolve(
        new URL(
          `../../../lib/${specifier.slice('@/lib/'.length)}.ts`,
          import.meta.url,
        ).href,
        context,
      );
    if (
      specifier === './delivery' &&
      context.parentURL?.endsWith('/app/api/quote/route.ts')
    )
      return nextResolve(
        new URL('./delivery.ts', import.meta.url).href,
        context,
      );
    return nextResolve(specifier, context);
  },
});
const { POST } = (await import(
  new URL('./route.ts', import.meta.url).href
)) as typeof import('./route');
const { getQuoteDateBounds, quoteSchema } = (await import(
  new URL('../../../lib/validation.ts', import.meta.url).href
)) as typeof import('../../../lib/validation');

test.after(() => {
  hooks.deregister();
  delete globals[scenarioKey];
});

const environment = {
  QUOTE_INTAKE_ENABLED: 'true',
  VERCEL_ENV: 'production',
  QUOTE_STORAGE_NAMESPACE: 'production',
  BLOB_STORE_ID: 'store_synthetic',
  CRON_SECRET: 'synthetic-maintenance-secret-32-characters',
  NEXT_PUBLIC_SITE_URL: 'https://bladehaul.com',
  RESEND_FROM_EMAIL: 'BladeHaul <quotes@bladehaul.com>',
  ADMIN_EMAIL: 'info@bladehaul.com',
  RESEND_API_KEY: 'synthetic-test-key',
  QUOTE_EMAIL_HOURLY_LIMIT: '100',
  QUOTE_EMAIL_DAILY_LIMIT: '100',
  QUOTE_EMAIL_MONTHLY_LIMIT: '2000',
  BEROCKER_ENABLED: 'false',
  BEROCKER_LEAD_SAVE_URL: '',
};

test.beforeEach((t) => {
  if (!('mock' in t) || !('after' in t))
    throw new Error('route tests require an individual test context');
  const previous = Object.fromEntries(
    Object.keys(environment).map((name) => [name, process.env[name]]),
  );
  Object.assign(process.env, environment);
  t.after(() => {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });
  const state: Scenario = {
    store: new MemoryStore(),
    reads: [],
    writes: [],
    verificationCalls: [],
    verify: async () => ({ isBot: false }),
    callbacks: [],
    httpCalls: [],
    logs: [],
  };
  globals[scenarioKey] = state;
  const read = state.store.read.bind(state.store);
  const write = state.store.write.bind(state.store);
  state.store.read = async <T,>(path: string) => {
    state.reads.push(path);
    return read<T>(path);
  };
  state.store.write = async <T,>(
    path: string,
    value: T,
    etag: string | null,
  ) => {
    state.writes.push(path);
    return write(path, value, etag);
  };
  t.mock.method(Date, 'now', () => START);
  t.mock.method(console, 'error', (...args: unknown[]) => {
    state.logs.push(args);
  });
  t.mock.method(
    globalThis,
    'fetch',
    async (url: string | URL | Request, options?: RequestInit) => {
      state.httpCalls.push({ url: String(url), options });
      if (String(url) === LEAD_URL)
        return Response.json({ id: 'synthetic-lead-1', bookingLink: null });
      assert.equal(String(url), 'https://api.resend.com/emails');
      return Response.json({ id: 'synthetic-email-1' });
    },
  );
});

const state = () => globals[scenarioKey];
const path = (id = QUOTE_ID) => `quote-outbox/production/requests/${id}.json`;
function payload(id = QUOTE_ID) {
  return {
    ...QUOTE,
    requestId: id,
    website: '',
    readyDate: getQuoteDateBounds().min,
  };
}
function request(body: unknown = payload()) {
  return new Request('https://bladehaul.com/api/quote', {
    method: 'POST',
    headers: {
      Origin: 'https://bladehaul.com',
      'Content-Type': 'application/json',
      'Sec-Fetch-Site': 'same-origin',
    },
    body: JSON.stringify(body),
  });
}
async function background() {
  const callbacks = state().callbacks.splice(0);
  for (const callback of callbacks) await callback();
}
async function saved(id = QUOTE_ID) {
  return state().store.read<QuoteRecord>(path(id));
}
function id(index: number) {
  return `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;
}

test('actual POST returns the exact durable receipt before a single immutable notification', async () => {
  const response = await POST(request());
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { success: true, quoteId: QUOTE_ID });
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.ok(await saved());
  assert.equal(state().httpCalls.length, 0);
  assert.deepEqual(state().verificationCalls, [
    {
      advancedOptions: { checkLevel: 'basic' },
      developmentOptions: { isDevelopment: false },
    },
  ]);
  const frozen = (await saved())?.value;
  await background();
  assert.equal(state().httpCalls.length, 1);
  assert.equal(
    new Headers(state().httpCalls[0].options?.headers).get('Idempotency-Key'),
    frozen?.idempotencyKey,
  );
  assert.equal(
    state().httpCalls[0].options?.body,
    JSON.stringify(frozen?.email),
  );
  assert.equal((await saved())?.value.delivery.state, 'accepted');
});

test('actual POST with BeRocker enabled notifies and creates the CRM lead once in the background', async () => {
  process.env.BEROCKER_ENABLED = 'true';
  process.env.BEROCKER_LEAD_SAVE_URL = LEAD_URL;
  const body = { ...payload(), phone: '+1 (312) 555-0142' };
  const response = await POST(request(body));
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { success: true, quoteId: QUOTE_ID });
  assert.equal(state().httpCalls.length, 0);
  assert.equal((await saved())?.value.crm?.state, 'pending');
  await background();
  assert.deepEqual(
    state().httpCalls.map((call) => call.url),
    ['https://api.resend.com/emails', LEAD_URL],
  );
  const lead = JSON.parse(String(state().httpCalls[1].options?.body));
  assert.equal(lead.secondary_id, QUOTE_ID);
  assert.equal(lead.phone, '+13125550142');
  assert.equal((await saved())?.value.quote.phone, '+13125550142');
  const record = (await saved())?.value;
  assert.equal(record?.delivery.state, 'accepted');
  assert.equal(record?.crm?.state, 'created');
  assert.equal(record?.crm?.leadId, 'synthetic-lead-1');
  assert.equal(record?.crm?.bookingLink, undefined);
  assert.equal((await POST(request(body))).status, 202);
  await background();
  assert.equal(state().httpCalls.length, 2);
  assert.deepEqual(state().logs, []);
});

test('actual POST with a misconfigured BeRocker URL keeps the CRM step and logs only the request ID', async () => {
  process.env.BEROCKER_ENABLED = 'true';
  process.env.BEROCKER_LEAD_SAVE_URL = LEAD_URL.replace('https:', 'http:');
  const body = { ...payload(), phone: '+1 (312) 555-0142' };
  assert.equal((await POST(request(body))).status, 202);
  await background();
  assert.deepEqual(
    state().httpCalls.map((call) => call.url),
    ['https://api.resend.com/emails'],
  );
  assert.equal((await saved())?.value.crm?.state, 'pending');
  assert.deepEqual(state().logs, [
    ['[quote] background_crm_unavailable', { quoteId: QUOTE_ID }],
  ]);
  const logged = JSON.stringify(state().logs);
  for (const secret of ['synthetic-route-key', '555', QUOTE.email])
    assert.equal(logged.includes(secret), false);
});

test('actual POST saves and acknowledges when the Resend key is missing', async () => {
  delete process.env.RESEND_API_KEY;
  const response = await POST(request());
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { success: true, quoteId: QUOTE_ID });
  await background();
  assert.equal(state().httpCalls.length, 0);
  assert.equal((await saved())?.value.delivery.state, 'pending');
  assert.ok(
    state().logs.some(
      (entry) => entry[0] === '[quote] background_delivery_unavailable',
    ),
  );
});

test('actual POST saves with missing or invalid send allocation and never calls Resend', async () => {
  for (const value of [undefined, 'invalid', '0', '3501']) {
    state().store = new MemoryStore();
    if (value === undefined) delete process.env.QUOTE_EMAIL_MONTHLY_LIMIT;
    else process.env.QUOTE_EMAIL_MONTHLY_LIMIT = value;
    const response = await POST(request());
    assert.equal(response.status, 202);
    assert.deepEqual(await response.json(), {
      success: true,
      quoteId: QUOTE_ID,
    });
    await background();
    assert.equal(state().httpCalls.length, 0);
    assert.equal((await saved())?.value.delivery.state, 'pending');
  }
});

test('actual POST still saves when send capacity is exhausted, retaining the lead for manual review', async () => {
  await state().store.write(
    'quote-outbox/production/controls/send-budget.json',
    {
      version: 1,
      reservations: Array.from({ length: 100 }, () => START),
    },
    null,
  );
  const response = await POST(request());
  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { success: true, quoteId: QUOTE_ID });
  await background();
  assert.equal(state().httpCalls.length, 0);
  const record = (await saved())?.value;
  assert.equal(record?.delivery.state, 'manual_review');
  assert.equal(record?.delivery.attentionReason, 'email_budget_exhausted');
  assert.equal(record?.quote.email, QUOTE.email);
});

test('actual POST rejects bot classification and verification outages before any storage access', async () => {
  for (const [verify, status] of [
    [async () => ({ isBot: true }), 403],
    [async () => ({ isBot: false, bypassed: true }), 403],
    [
      async () => {
        throw new Error('synthetic_verification_outage');
      },
      503,
    ],
  ] as const) {
    state().verify = verify;
    const response = await POST(request());
    assert.equal(response.status, status);
    assert.equal((await response.json()).success, false);
    assert.equal(state().reads.length, 0);
    assert.equal(state().writes.length, 0);
    assert.equal(state().store.records.size, 0);
    assert.equal(state().callbacks.length, 0);
    assert.equal(state().httpCalls.length, 0);
  }
});

test('actual POST bounds a stalled verification without storing a lead', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let started!: () => void;
  const verificationStarted = new Promise<void>((resolve) => {
    started = resolve;
  });
  state().verify = async () => {
    started();
    return new Promise(() => {});
  };
  const pending = POST(request());
  await verificationStarted;
  t.mock.timers.tick(6_000);
  assert.equal((await pending).status, 503);
  assert.equal(state().reads.length, 0);
  assert.equal(state().writes.length, 0);
  assert.equal(state().httpCalls.length, 0);
});

test('actual POST recovers the same receipt and rejects a same-key payload change', async () => {
  assert.equal((await POST(request())).status, 202);
  await background();
  const retry = await POST(request());
  assert.equal(retry.status, 202);
  assert.deepEqual(await retry.json(), { success: true, quoteId: QUOTE_ID });
  await background();
  assert.equal(state().httpCalls.length, 1);
  const conflict = await POST(
    request({ ...payload(), vehicleModel: 'Changed' }),
  );
  assert.equal(conflict.status, 409);
  assert.equal((await conflict.json()).success, false);
  assert.equal(state().callbacks.length, 0);
  assert.equal((await saved())?.value.quote.vehicleModel, QUOTE.vehicleModel);
});

test('actual POST accepts 100 new daily requests, limits the 101st, and recovers a receipt at the cap', async () => {
  delete process.env.RESEND_API_KEY;
  for (let index = 1; index <= 100; index++) {
    const response = await POST(request(payload(id(index))));
    assert.equal(response.status, 202);
    assert.deepEqual(await response.json(), {
      success: true,
      quoteId: id(index),
    });
  }
  const denied = await POST(request(payload(id(101))));
  assert.equal(denied.status, 429);
  assert.equal(denied.headers.get('Retry-After'), '86400');
  assert.equal((await denied.json()).success, false);
  assert.equal(await saved(id(101)), null);
  const retry = await POST(request());
  assert.equal(retry.status, 202);
  assert.deepEqual(await retry.json(), { success: true, quoteId: QUOTE_ID });
  await background();
  assert.equal(state().httpCalls.length, 0);
  assert.equal(
    [...state().store.records.keys()].filter((recordPath) =>
      recordPath.includes('/requests/'),
    ).length,
    100,
  );
});

test('actual POST rejects an old checkbox-era tab before storage and asks for a refresh', async () => {
  for (const stale of [
    { consentTcpa: false, consentVersion: '2026-10-03-sms-v1' },
    { consentTcpa: true, consentVersion: '2026-10-03-sms-v1' },
    { consentTcpa: false },
  ]) {
    const response = await POST(request({ ...payload(), ...stale }));
    assert.equal(response.status, 400);
    assert.equal(
      (await response.json()).error,
      'Refresh the page to see the current consent notice before sending your request.',
    );
    assert.equal(await saved(), null);
  }
});

test('actual POST requires a valid US phone before storage and stores it as E.164', async () => {
  for (const phone of ['', '555-0142', '+44 20 7946 0958', undefined]) {
    const response = await POST(request({ ...payload(), phone }));
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'Please check the highlighted details.');
    assert.equal(typeof body.issues.fieldErrors.phone?.[0], 'string');
    assert.equal(await saved(), null);
  }
  const response = await POST(
    request({ ...payload(), phone: '(312) 555-0142' }),
  );
  assert.equal(response.status, 202);
  assert.equal((await saved())?.value.quote.phone, '+13125550142');
});

test('actual POST applies the shared schema without additional name, email-domain or route heuristics', async () => {
  const unusual = {
    ...payload(),
    firstName: '李',
    lastName: 'Q',
    email: 'unusual+tag@odd.example',
    pickupZip: '00000',
    deliveryZip: '00000',
    vehicleMake: 'Qq',
    vehicleModel: '?',
    bodyType: 'other',
  };
  assert.equal(quoteSchema.safeParse(unusual).success, true);
  assert.equal((await POST(request(unusual))).status, 202);
  const record = (await saved())?.value;
  assert.equal(record?.quote.firstName, unusual.firstName);
  assert.equal(record?.quote.email, unusual.email);
  assert.equal(record?.quote.pickupZip, unusual.pickupZip);
});

test('actual POST cannot acknowledge a lead-storage failure; an uncertain saved lead is recovered on same-ID retry', async () => {
  const write = state().store.write.bind(state().store);
  state().store.write = async (recordPath, value, etag) => {
    if (recordPath.includes('/requests/')) {
      await write(recordPath, value, etag);
      throw new Error('synthetic_lost_storage_receipt');
    }
    return write(recordPath, value, etag);
  };
  const first = await POST(request());
  assert.equal(first.status, 503);
  assert.equal((await first.json()).success, false);
  assert.ok(await saved());
  assert.equal(state().callbacks.length, 0);
  assert.equal(state().httpCalls.length, 0);
  state().store.write = write;
  const retry = await POST(request());
  assert.equal(retry.status, 202);
  assert.deepEqual(await retry.json(), { success: true, quoteId: QUOTE_ID });
  await background();
  assert.equal(state().httpCalls.length, 1);
  assert.equal(
    [...state().store.records.keys()].filter((recordPath) =>
      recordPath.includes('/requests/'),
    ).length,
    1,
  );
});
