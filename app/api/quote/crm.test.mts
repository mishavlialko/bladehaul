import assert from 'node:assert/strict';
import test from 'node:test';
import type { QuotePayload, QuoteRecord } from '../../../lib/quote-outbox';

const { EMAIL_SETTINGS, MemoryStore, provider, QUOTE, QUOTE_ID, START } =
  (await import(
    new URL('./test-runtime.mts', import.meta.url).href
  )) as typeof import('./test-runtime.mjs');

const { createBeRockerProvider } = (await import(
  new URL('./delivery.ts', import.meta.url).href
)) as typeof import('./delivery');
const { BEROCKER_VEHICLE_TYPES, buildBeRockerLead } = (await import(
  new URL('../../../lib/quote-crm.ts', import.meta.url).href
)) as typeof import('../../../lib/quote-crm');
const {
  DELIVERY_LEASE_MS,
  enqueueQuote,
  processQuote,
  processQuoteCrm,
  quotePath,
  RETRY_WINDOW_MS,
} = (await import(
  new URL('../../../lib/quote-outbox.ts', import.meta.url).href
)) as typeof import('../../../lib/quote-outbox');
const { maintenanceIsHealthy, runQuoteMaintenance } = (await import(
  new URL('../../../lib/quote-maintenance.ts', import.meta.url).href
)) as typeof import('../../../lib/quote-maintenance');
const { getQuoteCrmConfig, quoteCrmEnabled } = (await import(
  new URL('../../../lib/quote-config.ts', import.meta.url).href
)) as typeof import('../../../lib/quote-config');
const { BODY_TYPES } = (await import(
  new URL('../../../lib/validation.ts', import.meta.url).href
)) as typeof import('../../../lib/validation');

const SECRET = 'synthetic-source-key';
const LEAD_URL = `https://crm.example.test/api/v1/auto-logistics/client/webhooks/lead/${SECRET}/save`;
const PHONE_QUOTE = { ...QUOTE, phone: '+1 (555) 123-4567' };
const RECEIVED_AT = new Date(START).toISOString();
const path = quotePath('development', QUOTE_ID);
const DOCUMENTED_TYPES = new Set([
  'Car',
  'sedan',
  'Coupe',
  'Convertible',
  'SUV',
  'Van',
  'Pickup',
  'pickup_2_doors',
  'pickup_4_doors',
  'Motorcycle',
  'ATV',
  'Boat',
  'RV',
  'Travel Trailer',
  'Other',
]);

function berocker(respond: (call: number) => Response | Promise<Response>) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const crm = createBeRockerProvider(LEAD_URL, async (url, init) => {
    calls.push({ url: String(url), init });
    return respond(calls.length);
  });
  return { crm, calls };
}

const created = () =>
  Response.json({
    id: 4821,
    bookingLink: 'https://app.example.test/booking/synthetic',
    price: null,
    leadProvider: 'Website',
  });

async function enqueued(quote: QuotePayload = PHONE_QUOTE, crmEnabled = true) {
  const store = new MemoryStore();
  await enqueueQuote(
    store,
    'development',
    QUOTE_ID,
    quote,
    EMAIL_SETTINGS,
    START,
    { crmEnabled },
  );
  return store;
}

async function saved(store: InstanceType<typeof MemoryStore>) {
  const record = await store.read<QuoteRecord>(path);
  assert.ok(record);
  return record.value;
}

test('maps the quote to a BeRocker lead with SMS consent, timestamp and notes in the shipper comment', () => {
  const lead = buildBeRockerLead(
    {
      ...PHONE_QUOTE,
      trailerType: 'enclosed',
      bodyType: 'suv',
      vehicleCondition: 'inoperable',
      vin: '1HGCM82633A004352',
      additionalDetails: 'Lowered suspension.\nGate code 1234',
      consentTcpa: true,
    },
    QUOTE_ID,
    RECEIVED_AT,
  );
  assert.ok(lead);
  const { comment_from_shipper: comment, ...fields } = lead;
  assert.deepEqual(fields, {
    first_name: 'Example',
    last_name: 'Customer',
    phone: '+15551234567',
    email: 'customer@example.com',
    origin_postal_code: '90210',
    destination_postal_code: '10001',
    ship_date: '2030-01-02',
    transport_type: 'enclosed',
    secondary_id: QUOTE_ID,
    vehicles: [
      {
        vehicle_model_year: 2020,
        vehicle_make: 'Example',
        vehicle_model: 'Test',
        vehicle_type: 'SUV',
        vehicle_inop: true,
        vin: '1HGCM82633A004352',
      },
    ],
  });
  assert.match(
    comment,
    /^Automated quote SMS consent \(including marketing follow-ups\): Yes$/m,
  );
  assert.match(comment, /^Consent notice version: 2026-10-03-sms-v1$/m);
  assert.ok(comment.includes(`(UTC, server receipt): ${RECEIVED_AT}`));
  assert.ok(comment.includes(`Website request ID: ${QUOTE_ID}`));
  assert.ok(comment.endsWith('Lowered suspension.\nGate code 1234'));
});

test('every website body type maps to a documented BeRocker vehicle type; no VIN and runs are explicit', () => {
  for (const bodyType of BODY_TYPES)
    assert.ok(DOCUMENTED_TYPES.has(BEROCKER_VEHICLE_TYPES[bodyType]));
  assert.equal(BEROCKER_VEHICLE_TYPES.pickup, 'Pickup');
  assert.equal(BEROCKER_VEHICLE_TYPES.wagon, 'Car');
  assert.equal(BEROCKER_VEHICLE_TYPES.other, 'Other');
  const lead = buildBeRockerLead(PHONE_QUOTE, QUOTE_ID, RECEIVED_AT);
  assert.ok(lead);
  assert.equal(lead.vehicles[0].vehicle_type, 'sedan');
  assert.equal(lead.vehicles[0].vehicle_inop, false);
  assert.equal('vin' in lead.vehicles[0], false);
  assert.match(lead.comment_from_shipper, /follow-ups\): No$/m);
  assert.match(lead.comment_from_shipper, /Customer notes:\nNone$/);
});

test('success creates the lead once with secondary_id = request ID and stores the BeRocker receipt', async () => {
  const store = await enqueued();
  const { crm, calls } = berocker(created);
  let now = START;
  const context = { store, namespace: 'development', now: () => now, crm };
  assert.equal(await processQuoteCrm(context, QUOTE_ID), 'updated');
  assert.equal(calls.length, 1);
  const record = await saved(store);
  assert.equal(calls[0].url, LEAD_URL);
  assert.equal(calls[0].init?.method, 'POST');
  assert.equal(calls[0].init?.redirect, 'error');
  const headers = new Headers(calls[0].init?.headers);
  assert.equal(headers.get('Content-Type'), 'application/json');
  assert.equal(headers.has('Authorization'), false);
  assert.equal(calls[0].init?.body, JSON.stringify(record.crm?.lead));
  assert.equal(JSON.parse(String(calls[0].init?.body)).secondary_id, QUOTE_ID);
  assert.equal(record.crm?.state, 'created');
  assert.equal(record.crm?.leadId, '4821');
  assert.equal(
    record.crm?.bookingLink,
    'https://app.example.test/booking/synthetic',
  );
  assert.equal(record.crm?.attempts, 1);
  assert.equal(record.crm?.nextAttemptAt, null);
  assert.equal(record.delivery.state, 'pending');
  // Idempotency: neither the immediate path nor cron sends a created lead again.
  assert.equal(await processQuoteCrm(context, QUOTE_ID), 'skipped');
  now += 60 * 60_000;
  await runQuoteMaintenance({ ...context, provider: provider() });
  assert.equal(calls.length, 1);
  assert.equal((await saved(store)).delivery.state, 'accepted');
});

test('concurrent workers (after() and cron) create the lead exactly once', async () => {
  const store = await enqueued();
  const { crm, calls } = berocker(created);
  const context = { store, namespace: 'development', now: () => START, crm };
  await Promise.all([
    processQuoteCrm(context, QUOTE_ID),
    processQuoteCrm(context, QUOTE_ID),
    processQuoteCrm(context, QUOTE_ID),
  ]);
  assert.equal(calls.length, 1);
  assert.equal((await saved(store)).crm?.state, 'created');
});

test('422 and 403 are permanent: no retry, manual review, unhealthy, no provider text kept', async () => {
  for (const status of [422, 403]) {
    const store = await enqueued();
    const { crm, calls } = berocker(() =>
      Response.json(
        { message: 'sensitive detail', errors: { phone: ['+15551234567'] } },
        { status },
      ),
    );
    let now = START;
    const context = { store, namespace: 'development', now: () => now, crm };
    await processQuoteCrm(context, QUOTE_ID);
    const record = await saved(store);
    assert.equal(record.crm?.state, 'manual_review');
    assert.equal(record.crm?.attentionReason, `berocker_http_${status}`);
    assert.equal(record.crm?.nextAttemptAt, null);
    assert.equal(JSON.stringify(record).includes('sensitive detail'), false);
    now += 2 * 60 * 60_000;
    const maintenance = await runQuoteMaintenance({
      ...context,
      provider: provider(),
    });
    assert.equal(calls.length, 1);
    assert.equal(maintenance.busy, false);
    if (maintenance.busy) return;
    assert.deepEqual(maintenance.state.lastBatch?.manualReviewIds, [QUOTE_ID]);
    assert.equal(maintenanceIsHealthy(maintenance.state, now), false);
  }
});

test('5xx, 408, 429 and network failures retry from cron with the identical lead body', async () => {
  const failures: Array<[() => Response, string]> = [
    [() => new Response('upstream', { status: 500 }), 'berocker_http_500'],
    [() => new Response('upstream', { status: 503 }), 'berocker_http_503'],
    [() => new Response('timeout', { status: 408 }), 'berocker_http_408'],
    [() => new Response('slow down', { status: 429 }), 'berocker_http_429'],
    [
      () => {
        throw new TypeError(`fetch failed for ${LEAD_URL}`);
      },
      'berocker_unavailable',
    ],
  ];
  for (const [fail, code] of failures) {
    const store = await enqueued();
    const { crm, calls } = berocker((call) =>
      call === 1 ? fail() : created(),
    );
    let now = START;
    const context = { store, namespace: 'development', now: () => now, crm };
    await processQuoteCrm(context, QUOTE_ID);
    const pending = await saved(store);
    assert.equal(pending.crm?.state, 'pending');
    assert.equal(pending.crm?.attentionReason, code);
    assert.equal(pending.crm?.attentionReason?.includes(SECRET), false);
    assert.equal(
      pending.crm?.nextAttemptAt,
      new Date(START + 5 * 60_000).toISOString(),
    );
    now += 60_000;
    assert.equal(await processQuoteCrm(context, QUOTE_ID), 'skipped');
    now = START + 5 * 60_000;
    await runQuoteMaintenance({ ...context, provider: provider() });
    assert.equal(calls.length, 2);
    assert.equal(calls[0].init?.body, calls[1].init?.body);
    const record = await saved(store);
    assert.equal(record.crm?.state, 'created');
    assert.equal(record.crm?.attempts, 2);
    assert.equal(record.crm?.attentionReason, undefined);
  }
});

test('temporary failures stop at the retry window and wait for manual review', async () => {
  const store = await enqueued();
  const { crm, calls } = berocker(() => new Response(null, { status: 503 }));
  let now = START;
  const context = { store, namespace: 'development', now: () => now, crm };
  await processQuoteCrm(context, QUOTE_ID);
  now = START + RETRY_WINDOW_MS;
  await processQuoteCrm(context, QUOTE_ID);
  assert.equal(calls.length, 1);
  const record = await saved(store);
  assert.equal(record.crm?.state, 'manual_review');
  assert.equal(record.crm?.attentionReason, 'retry_window_expired');
});

test('a lost save after BeRocker accepted resends only the saved body after the lease', async () => {
  const store = await enqueued();
  const { crm, calls } = berocker((call) => {
    if (call === 1) store.failWrites = 1;
    return created();
  });
  let now = START;
  const context = { store, namespace: 'development', now: () => now, crm };
  await assert.rejects(processQuoteCrm(context, QUOTE_ID));
  assert.equal((await saved(store)).crm?.state, 'sending');
  assert.equal(await processQuoteCrm(context, QUOTE_ID), 'skipped');
  now += DELIVERY_LEASE_MS + 1;
  await processQuoteCrm(context, QUOTE_ID);
  // The retry stays inside BeRocker's documented 30-minute same-lead window.
  assert.ok(now - START < 30 * 60_000);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].init?.body, calls[1].init?.body);
  assert.equal((await saved(store)).crm?.state, 'created');
});

test('email and CRM steps saving concurrently never erase each other', async () => {
  for (const order of ['crm-during-email', 'email-during-crm'] as const) {
    const store = await enqueued();
    let emails = 0;
    let leads = 0;
    const email = provider({
      send: async () => {
        emails += 1;
        if (order === 'crm-during-email')
          assert.equal(await processQuoteCrm(crmContext, QUOTE_ID), 'updated');
        return { kind: 'accepted', id: 'email-example-1' };
      },
    });
    const crmContext = {
      store,
      namespace: 'development',
      now: () => START,
      crm: {
        createLead: async () => {
          leads += 1;
          if (order === 'email-during-crm')
            assert.equal(await processQuote(emailContext, QUOTE_ID), 'updated');
          return { kind: 'created' as const, leadId: 'lead-1' };
        },
      },
    };
    const emailContext = {
      store,
      namespace: 'development',
      now: () => START,
      provider: email,
    };
    assert.equal(
      order === 'crm-during-email'
        ? await processQuote(emailContext, QUOTE_ID)
        : await processQuoteCrm(crmContext, QUOTE_ID),
      'updated',
    );
    const record = await saved(store);
    assert.equal(emails, 1);
    assert.equal(leads, 1);
    assert.equal(record.delivery.state, 'accepted');
    assert.equal(record.delivery.providerId, 'email-example-1');
    assert.equal(record.crm?.state, 'created');
    assert.equal(record.crm?.leadId, 'lead-1');
  }
});

test('a quote without a phone is recorded as skipped, never sent and not an alert', async () => {
  const store = await enqueued(QUOTE);
  const { crm, calls } = berocker(created);
  const context = { store, namespace: 'development', now: () => START, crm };
  assert.equal(buildBeRockerLead(QUOTE, QUOTE_ID, RECEIVED_AT), null);
  assert.equal(await processQuoteCrm(context, QUOTE_ID), 'skipped');
  const maintenance = await runQuoteMaintenance({
    ...context,
    provider: provider(),
  });
  assert.equal(calls.length, 0);
  const record = await saved(store);
  assert.equal(record.crm?.state, 'skipped');
  assert.equal(record.crm?.attentionReason, 'crm_phone_missing');
  assert.equal(maintenance.busy, false);
  if (!maintenance.busy) {
    assert.deepEqual(maintenance.state.lastBatch?.manualReviewIds, []);
    assert.equal(maintenance.state.lastBatch?.crmUnavailable, false);
  }
});

test('a quote accepted while BeRocker is disabled never gets a CRM step later', async () => {
  const store = await enqueued(PHONE_QUOTE, false);
  const { crm, calls } = berocker(created);
  const context = { store, namespace: 'development', now: () => START, crm };
  assert.equal((await saved(store)).crm, undefined);
  assert.equal(await processQuoteCrm(context, QUOTE_ID), 'skipped');
  await runQuoteMaintenance({ ...context, provider: provider() });
  assert.equal(calls.length, 0);
  assert.equal((await saved(store)).delivery.state, 'accepted');
});

test('cron without a configured CRM keeps the step pending and reports it unhealthy', async () => {
  const store = await enqueued();
  const result = await runQuoteMaintenance({
    store,
    namespace: 'development',
    now: () => START,
    provider: provider(),
  });
  assert.equal(result.busy, false);
  if (result.busy) return;
  assert.equal(result.state.lastBatch?.crmUnavailable, true);
  assert.equal(result.state.attentionOutstanding, true);
  assert.equal(maintenanceIsHealthy(result.state, START), false);
  assert.equal((await saved(store)).crm?.state, 'pending');
});

test('unexpected 2xx receipts count as created without retry; only safe receipt values are kept', async () => {
  for (const [response, leadId, bookingLink] of [
    [() => new Response('not json', { status: 200 }), undefined, undefined],
    [
      () => Response.json({ id: '../x', bookingLink: 'javascript:alert(1)' }),
      undefined,
      undefined,
    ],
    [
      () => Response.json({ id: 'abc-123' }, { status: 201 }),
      'abc-123',
      undefined,
    ],
  ] as const) {
    const { crm, calls } = berocker(response);
    const lead = buildBeRockerLead(PHONE_QUOTE, QUOTE_ID, RECEIVED_AT)!;
    const result = await crm.createLead(lead);
    assert.deepEqual(result, {
      kind: 'created',
      ...(leadId ? { leadId } : {}),
      ...(bookingLink ? { bookingLink } : {}),
    });
    assert.equal(calls.length, 1);
  }
});

test('a stalled BeRocker request is aborted and retryable', async () => {
  let aborted = false;
  const crm = createBeRockerProvider(
    LEAD_URL,
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
  const lead = buildBeRockerLead(PHONE_QUOTE, QUOTE_ID, RECEIVED_AT)!;
  assert.deepEqual(await crm.createLead(lead), {
    kind: 'temporary',
    code: 'berocker_unavailable',
  });
  assert.equal(aborted, true);
});

test('the CRM path logs nothing and never stores the credential URL', async (t) => {
  const logs: unknown[][] = [];
  for (const method of ['log', 'info', 'warn', 'error'] as const)
    t.mock.method(console, method, (...args: unknown[]) => {
      logs.push(args);
    });
  const store = await enqueued();
  const { crm } = berocker((call) => {
    if (call === 1) throw new TypeError(`connect failed ${LEAD_URL}`);
    return Response.json({ id: 1 }, { status: 422 });
  });
  let now = START;
  const context = { store, namespace: 'development', now: () => now, crm };
  await processQuoteCrm(context, QUOTE_ID);
  now += 5 * 60_000;
  await processQuoteCrm(context, QUOTE_ID);
  assert.deepEqual(logs, []);
  assert.equal(JSON.stringify(await saved(store)).includes(SECRET), false);
});

test('configuration: off unless exactly "true"; URL must be an https lead save endpoint; errors never echo it', () => {
  assert.equal(quoteCrmEnabled({}), false);
  assert.equal(quoteCrmEnabled({ BEROCKER_ENABLED: 'TRUE' }), false);
  assert.equal(getQuoteCrmConfig({ BEROCKER_LEAD_SAVE_URL: LEAD_URL }), null);
  assert.deepEqual(
    getQuoteCrmConfig({
      BEROCKER_ENABLED: 'true',
      BEROCKER_LEAD_SAVE_URL: ` ${LEAD_URL} `,
    }),
    { leadSaveUrl: LEAD_URL },
  );
  for (const [value, message] of [
    [undefined, 'quote_crm_url_missing'],
    ['  ', 'quote_crm_url_missing'],
    ['not a url', 'quote_crm_url_invalid'],
    [LEAD_URL.replace('https:', 'http:'), 'quote_crm_url_invalid'],
    [
      LEAD_URL.replace('https://', 'https://user:pass@'),
      'quote_crm_url_invalid',
    ],
    [`${LEAD_URL}/hot`, 'quote_crm_url_invalid'],
  ] as const) {
    assert.throws(
      () =>
        getQuoteCrmConfig({
          BEROCKER_ENABLED: 'true',
          BEROCKER_LEAD_SAVE_URL: value,
        }),
      (error: Error) => error.message === message,
    );
  }
});
