import assert from 'node:assert/strict';
import test from 'node:test';

const {
  quoteSchema,
  getQuoteDateBounds,
  normalizeUSPhone,
  QUOTE_CONSENT_TEXT,
  QUOTE_CONSENT_VERSION,
  QUOTE_SUBMIT_LABEL,
  STEP_FIELDS,
} = (await import(
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
    phone: '+1 (312) 555-0142',
    consentTcpa: true,
    consentVersion: QUOTE_CONSENT_VERSION,
    source: 'main-form',
    website: '',
  };
}

test('accepts a submitted request and keeps submission consent', () => {
  const result = quoteSchema.safeParse(validQuote());
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.consentTcpa, true);
    assert.equal(result.data.consentVersion, '2026-10-16-submit-v1');
    assert.equal(result.data.phone, '+13125550142');
    assert.equal(result.data.vin, '');
  }
});

test('the consent notice keeps the approved wording and names the submit button', () => {
  assert.equal(QUOTE_SUBMIT_LABEL, 'Get Quote');
  assert.equal(
    QUOTE_CONSENT_TEXT,
    'By clicking Get Quote, you agree that BladeHaul Auto Transport may contact you about your request by phone, email, and text message (SMS), including automated messages, at the number provided. Consent is not a condition of purchase. Msg & data rates may apply. Reply STOP to opt out. See our Privacy Policy and Terms.',
  );
  assert.equal(
    (STEP_FIELDS.contact as readonly string[]).includes('consentTcpa'),
    false,
  );
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

test('submitting is the consent: a missing or false consent flag is rejected', () => {
  for (const consentTcpa of [false, undefined, 'true', 1]) {
    const result = quoteSchema.safeParse({ ...validQuote(), consentTcpa });
    assert.equal(result.success, false);
    if (!result.success)
      assert.ok(
        result.error.issues.some((issue) => issue.path[0] === 'consentTcpa'),
      );
  }
});

test('rejects earlier checkbox and phone-follow-up consent instead of upgrading it', () => {
  for (const consentVersion of ['2026-09-29', '2026-10-03-sms-v1'])
    assert.equal(
      quoteSchema.safeParse({ ...validQuote(), consentVersion }).success,
      false,
    );
});

test('phone is required on the Contact step', () => {
  assert.ok(STEP_FIELDS.contact.includes('phone'));
  for (const phone of ['', '   ', undefined]) {
    const result = quoteSchema.safeParse({ ...validQuote(), phone });
    assert.equal(result.success, false);
    if (!result.success)
      assert.ok(result.error.issues.some((issue) => issue.path[0] === 'phone'));
  }
});

test('US phone spellings normalize to E.164 and re-parse unchanged', () => {
  for (const phone of [
    '+1 (312) 555-0142',
    '(312) 555-0142',
    '312-555-0142',
    '312.555.0142',
    '3125550142',
    '1 312 555 0142',
    '+13125550142',
    '  +1 312 555 0142  ',
  ]) {
    assert.equal(normalizeUSPhone(phone.trim()), '+13125550142', phone);
    const result = quoteSchema.safeParse({ ...validQuote(), phone });
    assert.equal(result.success, true, phone);
    if (result.success) {
      assert.equal(result.data.phone, '+13125550142');
      const again = quoteSchema.safeParse({ ...validQuote(), ...result.data });
      assert.equal(again.success && again.data.phone, '+13125550142');
    }
  }
});

test('rejects phones that are not valid 10-digit US numbers', () => {
  for (const phone of [
    '123',
    '555-0142',
    '+44 20 7946 0958',
    '(012) 555-0142',
    '(112) 555-0142',
    '(312) 055-0142',
    '(312) 155-0142',
    '2 312 555 0142',
    '312 555 01423',
    '312555014x',
    '+1 (312) 555-0142 ext 7',
    '1'.repeat(31),
  ]) {
    assert.equal(normalizeUSPhone(phone), null, phone);
    const result = quoteSchema.safeParse({ ...validQuote(), phone });
    assert.equal(result.success, false, phone);
    if (!result.success)
      assert.ok(result.error.issues.some((issue) => issue.path[0] === 'phone'));
  }
});

test('landing page and UTM tags are optional and an unusable value is dropped, never a rejection', () => {
  const tagged = quoteSchema.safeParse({
    ...validQuote(),
    landingPage: '/car-shipping-cost',
    utm: { source: ' google ', medium: 'cpc', campaign: 'fall sale' },
  });
  assert.equal(tagged.success, true);
  if (tagged.success) {
    assert.equal(tagged.data.landingPage, '/car-shipping-cost');
    assert.deepEqual(JSON.parse(JSON.stringify(tagged.data.utm)), {
      source: 'google',
      medium: 'cpc',
      campaign: 'fall sale',
    });
  }
  for (const junk of [
    { landingPage: 'https://evil.example/', utm: 'google' },
    { landingPage: '/x?email=a@b.com', utm: { source: 'x'.repeat(101) } },
    { landingPage: 42, utm: { source: 7, medium: '' } },
    { landingPage: `/${'a'.repeat(250)}`, utm: null },
  ]) {
    const result = quoteSchema.safeParse({ ...validQuote(), ...junk });
    assert.equal(result.success, true, JSON.stringify(junk));
    if (result.success) {
      assert.equal(result.data.landingPage, undefined);
      assert.equal(
        Object.values(result.data.utm ?? {}).filter(Boolean).length,
        0,
      );
    }
  }
  const untagged = quoteSchema.safeParse(validQuote());
  assert.equal(untagged.success && untagged.data.utm, undefined);
});
