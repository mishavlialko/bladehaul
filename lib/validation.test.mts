import assert from 'node:assert/strict';
import test from 'node:test';

const { quoteSchema, getQuoteDateBounds, QUOTE_CONSENT_VERSION, STEP_FIELDS } =
  (await import(
    new URL('./validation.ts', import.meta.url).href
  )) as typeof import('./validation');

function validQuote() {
  return {
    requestId: 'cf8269e0-5f4e-4d15-8be0-c42a5be38bac',
    pickupZip: '90210',
    deliveryZip: '33101',
    trailerType: 'open',
    vehicleYear: '2020',
    vehicleMake: 'Example',
    vehicleModel: 'Test model',
    bodyType: 'sedan',
    vehicleCondition: 'runs',
    vin: '',
    additionalDetails: '',
    readyDate: getQuoteDateBounds().min,
    firstName: 'Test',
    lastName: 'Request',
    email: 'quote-test@example.com',
    phone: '',
    consentTcpa: false,
    consentVersion: QUOTE_CONSENT_VERSION,
    source: 'main-form',
    website: '',
  };
}

test('accepts an email-only request without inventing phone consent', () => {
  const result = quoteSchema.safeParse(validQuote());
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.consentTcpa, false);
    assert.equal(result.data.phone, '');
    assert.equal(result.data.vin, '');
  }
});

test('uses Central calendar dates at midnight and across daylight saving changes', () => {
  assert.equal(
    getQuoteDateBounds(new Date('2026-09-29T04:59:59Z')).min,
    '2026-09-28',
  );
  assert.equal(
    getQuoteDateBounds(new Date('2026-09-29T05:00:00Z')).min,
    '2026-09-29',
  );
  assert.deepEqual(getQuoteDateBounds(new Date('2026-11-01T06:30:00Z')), {
    min: '2026-11-01',
    max: '2027-04-30',
  });
});

test('accepts both pickup-date boundaries and rejects yesterday and day 181', () => {
  const { min, max } = getQuoteDateBounds();
  const shift = (date: string, days: number) => {
    const value = new Date(`${date}T00:00:00.000Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
  };
  for (const readyDate of [min, max]) {
    assert.equal(
      quoteSchema.safeParse({ ...validQuote(), readyDate }).success,
      true,
    );
  }
  for (const readyDate of [shift(min, -1), shift(max, 1)]) {
    const result = quoteSchema.safeParse({ ...validQuote(), readyDate });
    assert.equal(result.success, false);
    if (!result.success)
      assert.equal(result.error.issues[0].path[0], 'readyDate');
  }
});

test('rejects nonexistent calendar dates instead of accepting their normalized value', () => {
  const year = getQuoteDateBounds().min.slice(0, 4);
  for (const readyDate of [`${year}-02-30`, `${year}-13-01`, 'not-a-date']) {
    const result = quoteSchema.safeParse({ ...validQuote(), readyDate });
    assert.equal(result.success, false);
    if (!result.success) {
      assert.ok(
        result.error.issues.some(
          (issue) => issue.message === 'Pick a valid pickup date',
        ),
      );
    }
  }
});

test('validates VIN on the Vehicle step even before contact fields exist', () => {
  assert.ok(STEP_FIELDS.vehicle.includes('vin'));
  const result = quoteSchema.safeParse({ vehicleYear: '2020', vin: 'SHORT' });
  assert.equal(result.success, false);
  if (!result.success)
    assert.ok(result.error.issues.some((issue) => issue.path[0] === 'vin'));
});

test('keeps modern VIN constraints and permits bounded legacy identifiers', () => {
  assert.equal(
    quoteSchema.safeParse({ ...validQuote(), vin: '1HGCM82633A004352' })
      .success,
    true,
  );
  assert.equal(
    quoteSchema.safeParse({ ...validQuote(), vin: '1IGCM82633A004352' })
      .success,
    false,
  );
  assert.equal(
    quoteSchema.safeParse({
      ...validQuote(),
      vehicleYear: '1965',
      vin: 'OLD-123',
    }).success,
    true,
  );
  assert.equal(
    quoteSchema.safeParse({
      ...validQuote(),
      vehicleYear: '1965',
      vin: '<script>',
    }).success,
    false,
  );
  assert.equal(
    quoteSchema.safeParse({
      ...validQuote(),
      vehicleYear: '1965',
      vin: 'A'.repeat(31),
    }).success,
    false,
  );
});

test('requires a body type and bounds optional extra details', () => {
  assert.equal(
    quoteSchema.safeParse({ ...validQuote(), bodyType: undefined }).success,
    false,
  );
  assert.equal(
    quoteSchema.safeParse({ ...validQuote(), bodyType: 'other' }).success,
    true,
  );
  assert.equal(
    quoteSchema.safeParse({
      ...validQuote(),
      additionalDetails: 'A'.repeat(2000),
    }).success,
    true,
  );
  assert.equal(
    quoteSchema.safeParse({
      ...validQuote(),
      additionalDetails: 'A'.repeat(2001),
    }).success,
    false,
  );
});

test('preserves genuine source and requires a current consent version and UUIDv4', () => {
  const result = quoteSchema.safeParse({
    ...validQuote(),
    source: 'hero-mini',
    consentTcpa: true,
  });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.source, 'hero-mini');
    assert.equal(result.data.consentTcpa, true);
  }
  assert.equal(
    quoteSchema.safeParse({ ...validQuote(), consentVersion: 'old' }).success,
    false,
  );
  assert.equal(
    quoteSchema.safeParse({ ...validQuote(), consentTcpa: undefined }).success,
    false,
  );
  assert.equal(
    quoteSchema.safeParse({ ...validQuote(), requestId: 'not-a-uuid' }).success,
    false,
  );
});
