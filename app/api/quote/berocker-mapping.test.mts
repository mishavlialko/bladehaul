import assert from 'node:assert/strict';
import test from 'node:test';
import type { BeRockerLead } from '../../../lib/quote-crm';
import type { QuotePayload } from '../../../lib/quote-outbox';

// Loads the @/lib/quote-* resolver used by the server helpers.
await import(new URL('./test-runtime.mts', import.meta.url).href);
const { buildBeRockerLead } = (await import(
  new URL('../../../lib/quote-crm.ts', import.meta.url).href
)) as typeof import('../../../lib/quote-crm');
const { getQuoteDateBounds, QUOTE_CONSENT_VERSION, quoteSchema } =
  (await import(
    new URL('../../../lib/validation.ts', import.meta.url).href
  )) as typeof import('../../../lib/validation');

// Every field and value below comes from BeRocker's Lead source API page
// (help.berocker.com/integrations/lead-source-api, read 2026-10-16).
const LEAD_FIELDS = new Set([
  'first_name',
  'last_name',
  'email',
  'phone',
  'additional_phone',
  'origin_city',
  'origin_state',
  'origin_postal_code',
  'origin_address',
  'destination_city',
  'destination_state',
  'destination_postal_code',
  'destination_address',
  'origin_country',
  'destination_country',
  'ship_date',
  'drop_off_date',
  'transport_type',
  'comment_from_shipper',
  'customer_comments',
  'secondary_id',
  'booking_number',
  'customer_id_type',
  'customer_id_number',
  'vehicles',
]);
const VEHICLE_FIELDS = new Set([
  'vehicle_model_year',
  'vehicle_make',
  'vehicle_model',
  'vehicle_type',
  'vehicle_inop',
  'vin',
  'is_custom',
]);
const VEHICLE_TYPES = new Set([
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

const RECEIVED_AT = '2026-10-16T21:04:11.000Z';
const today = getQuoteDateBounds().min;

// What the browser posts for one quote, before server validation.
type FormInput = Record<string, unknown>;
function form(overrides: FormInput): FormInput {
  return {
    requestId: '7b0c9a52-3f1e-4c8a-9d21-5e6f7a8b9c0d',
    vin: '',
    additionalDetails: '',
    readyDate: today,
    consentTcpa: true,
    consentVersion: QUOTE_CONSENT_VERSION,
    source: 'main-form',
    website: '',
    ...overrides,
  };
}

// The real path: browser input -> quoteSchema -> saved payload -> lead.
function leadFrom(input: FormInput): { lead: BeRockerLead; quoteId: string } {
  const parsed = quoteSchema.safeParse(input);
  assert.ok(parsed.success, JSON.stringify(parsed.error?.issues));
  const { requestId, ...quote } = parsed.data;
  delete quote.website;
  const lead = buildBeRockerLead(quote as QuotePayload, requestId, RECEIVED_AT);
  assert.ok(lead);
  return { lead, quoteId: requestId };
}

function assertDocumentedShape(lead: BeRockerLead, quoteId: string) {
  // The body is sent as JSON exactly as built: nothing undefined or extra.
  assert.deepEqual(JSON.parse(JSON.stringify(lead)), lead);
  for (const key of Object.keys(lead)) assert.ok(LEAD_FIELDS.has(key), key);
  assert.ok(lead.first_name.length > 0);
  assert.match(lead.phone, /^[2-9]\d{2}[2-9]\d{6}$/);
  assert.match(lead.origin_postal_code, /^\d{5}$/);
  assert.match(lead.destination_postal_code, /^\d{5}$/);
  assert.match(lead.ship_date, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(['open', 'enclosed'].includes(lead.transport_type));
  assert.equal(lead.secondary_id, quoteId);
  assert.ok(lead.vehicles.length >= 1);
  for (const vehicle of lead.vehicles) {
    for (const key of Object.keys(vehicle))
      assert.ok(VEHICLE_FIELDS.has(key), key);
    assert.ok(Number.isInteger(vehicle.vehicle_model_year));
    assert.ok(vehicle.vehicle_make.length > 0);
    assert.ok(vehicle.vehicle_model.length > 0);
    assert.ok(VEHICLE_TYPES.has(vehicle.vehicle_type), vehicle.vehicle_type);
    assert.equal(typeof vehicle.vehicle_inop, 'boolean');
  }
  // Consent, attribution and the request ID always travel in the comment.
  for (const line of [
    /^Contact consent by submitting the quote form \(phone, email, SMS, including automated messages\): Yes$/m,
    new RegExp(`^Consent notice version: ${QUOTE_CONSENT_VERSION}$`, 'm'),
    new RegExp(
      `^Consent recorded at \\(UTC, server receipt\\): ${RECEIVED_AT}$`,
      'm',
    ),
    /^Landing page: /m,
    /^UTM: /m,
    new RegExp(`^Website request ID: ${quoteId}$`, 'm'),
  ])
    assert.match(lead.comment_from_shipper, line);
}

test('fixture: Chicago to Phoenix daily driver from a Google ad lands as a running open-trailer "Car"', () => {
  const { lead, quoteId } = leadFrom(
    form({
      pickupZip: '60614',
      deliveryZip: '85016',
      trailerType: 'open',
      vehicleYear: '2019',
      vehicleMake: 'Toyota',
      vehicleModel: 'Camry',
      bodyType: 'sedan',
      vehicleCondition: 'runs',
      firstName: 'Jordan',
      lastName: 'Ellis',
      email: 'Jordan.Ellis@Example.com',
      phone: '+1 (312) 555-0187',
      additionalDetails: 'Moving for work. Flexible by a few days.',
      landingPage: '/car-shipping-cost',
      utm: { source: 'google', medium: 'cpc', campaign: 'il-az-fall' },
    }),
  );
  assertDocumentedShape(lead, quoteId);
  const { comment_from_shipper: comment, ...fields } = lead;
  assert.deepEqual(fields, {
    first_name: 'Jordan',
    last_name: 'Ellis',
    phone: '3125550187',
    email: 'jordan.ellis@example.com',
    origin_postal_code: '60614',
    destination_postal_code: '85016',
    ship_date: today,
    transport_type: 'open',
    secondary_id: quoteId,
    vehicles: [
      {
        vehicle_model_year: 2019,
        vehicle_make: 'Toyota',
        vehicle_model: 'Camry',
        vehicle_type: 'Car',
        vehicle_inop: false,
      },
    ],
  });
  assert.match(comment, /^Landing page: \/car-shipping-cost$/m);
  assert.match(
    comment,
    /^UTM: source=google, medium=cpc, campaign=il-az-fall$/m,
  );
  assert.match(comment, /^Website body type: sedan$/m);
  assert.ok(comment.endsWith('Moving for work. Flexible by a few days.'));
});

test('fixture: non-running 1969 pickup with a short legacy ID ships enclosed as an inoperable "Pickup"', () => {
  const { lead, quoteId } = leadFrom(
    form({
      source: 'hero-mini',
      pickupZip: '78704',
      deliveryZip: '37203',
      trailerType: 'enclosed',
      vehicleYear: '1969',
      vehicleMake: 'Ford',
      vehicleModel: 'F-100',
      bodyType: 'pickup',
      vehicleCondition: 'inoperable',
      vin: 'f10yrd12345',
      firstName: 'Ramon',
      lastName: 'De La Cruz',
      email: 'ramon.dlc@example.net',
      phone: '512.555.0143',
      additionalDetails:
        'No keys. Rolls and steers, needs a winch.\nGarage is behind the house.',
    }),
  );
  assertDocumentedShape(lead, quoteId);
  assert.equal(lead.transport_type, 'enclosed');
  assert.equal(lead.phone, '5125550143');
  assert.equal(lead.last_name, 'De La Cruz');
  assert.deepEqual(lead.vehicles, [
    {
      vehicle_model_year: 1969,
      vehicle_make: 'Ford',
      vehicle_model: 'F-100',
      vehicle_type: 'Pickup',
      vehicle_inop: true,
      vin: 'F10YRD12345',
    },
  ]);
  assert.match(
    lead.comment_from_shipper,
    /^Source: bladehaul\.com quote form \(hero-mini\)$/m,
  );
  assert.match(lead.comment_from_shipper, /^Landing page: Not recorded$/m);
  assert.match(lead.comment_from_shipper, /^UTM: None$/m);
  assert.ok(
    lead.comment_from_shipper.endsWith(
      'No keys. Rolls and steers, needs a winch.\nGarage is behind the house.',
    ),
  );
});

test('fixture: modern SUV with a full VIN keeps the VIN and maps to "SUV"', () => {
  const { lead, quoteId } = leadFrom(
    form({
      source: 'final-cta',
      pickupZip: '98109',
      deliveryZip: '80202',
      trailerType: 'open',
      vehicleYear: '2023',
      vehicleMake: 'Tesla',
      vehicleModel: 'Model Y',
      bodyType: 'suv',
      vehicleCondition: 'runs',
      vin: '7saygdee5pf123456',
      firstName: 'Priya',
      lastName: 'Natarajan',
      email: 'priya.n@example.org',
      phone: '(206) 555-0119',
      landingPage: '/',
      utm: { source: 'newsletter', medium: 'email' },
    }),
  );
  assertDocumentedShape(lead, quoteId);
  assert.deepEqual(lead.vehicles[0], {
    vehicle_model_year: 2023,
    vehicle_make: 'Tesla',
    vehicle_model: 'Model Y',
    vehicle_type: 'SUV',
    vehicle_inop: false,
    vin: '7SAYGDEE5PF123456',
  });
  assert.match(
    lead.comment_from_shipper,
    /^UTM: source=newsletter, medium=email$/m,
  );
  assert.match(lead.comment_from_shipper, /^Customer notes:\nNone$/m);
});

test('fixture: every website body type lands on a documented BeRocker type', () => {
  const cases = [
    ['sedan', 'Honda', 'Accord', 'Car'],
    ['wagon', 'Subaru', 'Outback', 'Car'],
    ['hatchback', 'Volkswagen', 'Golf GTI', 'Car'],
    ['coupe', 'Chevrolet', 'Camaro', 'Coupe'],
    ['convertible', 'Mazda', 'MX-5 Miata', 'Convertible'],
    ['suv', 'Jeep', 'Grand Cherokee', 'SUV'],
    ['pickup', 'Ram', '1500', 'Pickup'],
    ['van', 'Honda', 'Odyssey', 'Van'],
    ['other', 'Club Car', 'Onward', 'Other'],
  ] as const;
  for (const [bodyType, make, model, type] of cases) {
    const { lead, quoteId } = leadFrom(
      form({
        pickupZip: '33101',
        deliveryZip: '10001',
        trailerType: 'open',
        vehicleYear: '2021',
        vehicleMake: make,
        vehicleModel: model,
        bodyType,
        vehicleCondition: 'runs',
        firstName: 'Sam',
        lastName: 'Lee',
        email: 'sam.lee@example.com',
        phone: '305-555-0110',
      }),
    );
    assertDocumentedShape(lead, quoteId);
    assert.equal(lead.vehicles[0].vehicle_type, type, bodyType);
    assert.match(
      lead.comment_from_shipper,
      new RegExp(`^Website body type: ${bodyType}$`, 'm'),
    );
  }
});

test('fixture: a request saved before phone was required never produces a lead', () => {
  const parsed = quoteSchema.safeParse(
    form({
      pickupZip: '30303',
      deliveryZip: '28202',
      trailerType: 'open',
      vehicleYear: '2015',
      vehicleMake: 'Nissan',
      vehicleModel: 'Altima',
      bodyType: 'sedan',
      vehicleCondition: 'runs',
      firstName: 'Ava',
      lastName: 'Brooks',
      email: 'ava.brooks@example.com',
      phone: '+1 (404) 555-0166',
    }),
  );
  assert.ok(parsed.success);
  const { requestId, ...quote } = parsed.data;
  delete quote.website;
  assert.equal(
    buildBeRockerLead(
      { ...quote, phone: '' } as QuotePayload,
      requestId,
      RECEIVED_AT,
    ),
    null,
  );
});
