import assert from 'node:assert/strict';
import test from 'node:test';

const {
  authorizedMaintenance,
  hasTrustedOrigin,
  MAX_QUOTE_BODY_BYTES,
  readQuoteBody,
} = (await import(
  new URL('../../../lib/quote-request.ts', import.meta.url).href
)) as typeof import('../../../lib/quote-request');
const { getQuoteEmailConfig, getQuoteStorageConfig, quoteAllowedOrigins } =
  (await import(
    new URL('../../../lib/quote-config.ts', import.meta.url).href
  )) as typeof import('../../../lib/quote-config');

function request(body = '{}', headers: Record<string, string> = {}) {
  return new Request('https://bladehaul.com/api/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });
}

test('enforces JSON and actual body size even when Content-Length understates it', async () => {
  assert.deepEqual(await readQuoteBody(request('{"example":true}')), {
    example: true,
  });
  await assert.rejects(
    readQuoteBody(request('{}', { 'Content-Type': 'text/plain' })),
    /unsupported_content_type/,
  );
  await assert.rejects(
    readQuoteBody(request('{}', { 'Content-Type': 'application/jsonp' })),
    /unsupported_content_type/,
  );
  await assert.rejects(
    readQuoteBody(
      request('x'.repeat(MAX_QUOTE_BODY_BYTES + 1), { 'Content-Length': '1' }),
    ),
    /body_too_large/,
  );
  await assert.rejects(readQuoteBody(request('{not-json}')));
});

test('accepts only an expected browser origin; a claimed cross-site request is rejected', () => {
  assert.equal(
    hasTrustedOrigin(request('{}', { Origin: 'https://bladehaul.com' }), [
      'https://bladehaul.com',
    ]),
    true,
  );
  assert.equal(
    hasTrustedOrigin(request('{}', { Origin: 'https://outside.example' }), [
      'https://bladehaul.com',
    ]),
    false,
  );
  assert.equal(hasTrustedOrigin(request(), ['https://bladehaul.com']), false);
  assert.equal(
    hasTrustedOrigin(
      request('{}', {
        Origin: 'https://bladehaul.com',
        'Sec-Fetch-Site': 'cross-site',
      }),
      ['https://bladehaul.com'],
    ),
    false,
  );
});

test('cron/recovery data needs the exact strong Authorization secret', () => {
  const secret = 'test-only-placeholder-with-32-characters';
  assert.equal(
    authorizedMaintenance(
      request('{}', { Authorization: `Bearer ${secret}` }),
      secret,
    ),
    true,
  );
  assert.equal(authorizedMaintenance(request(), secret), false);
  assert.equal(
    authorizedMaintenance(
      request('{}', { Authorization: 'Bearer wrong' }),
      secret,
    ),
    false,
  );
  assert.equal(
    authorizedMaintenance(
      request('{}', { Authorization: 'Bearer short' }),
      'short',
    ),
    false,
  );
  assert.equal(
    authorizedMaintenance(
      new Request(
        `https://bladehaul.com/api/internal/quote-maintenance?secret=${secret}`,
      ),
      secret,
    ),
    false,
  );
});

test('environment mismatch fails closed and preview never uses the production namespace/origin', () => {
  const base = {
    BLOB_STORE_ID: 'store-test',
    CRON_SECRET: 'test-only-placeholder-with-32-characters',
  };
  assert.throws(
    () =>
      getQuoteStorageConfig({
        ...base,
        VERCEL_ENV: 'preview',
        QUOTE_STORAGE_NAMESPACE: 'production',
      }),
    /namespace_mismatch/,
  );
  assert.throws(
    () =>
      getQuoteStorageConfig({ ...base, QUOTE_STORAGE_NAMESPACE: 'production' }),
    /namespace_mismatch/,
  );
  assert.equal(
    getQuoteStorageConfig({
      ...base,
      VERCEL_ENV: 'preview',
      QUOTE_STORAGE_NAMESPACE: 'preview',
    }).namespace,
    'preview',
  );
  const origins = quoteAllowedOrigins('https://preview.example/api/quote', {
    VERCEL_ENV: 'preview',
    VERCEL_URL: 'preview.example',
    NEXT_PUBLIC_SITE_URL: 'https://bladehaul.com',
  });
  assert.deepEqual(origins, ['https://preview.example']);
  assert.deepEqual(quoteAllowedOrigins('http://localhost:3000/api/quote', {}), [
    'http://localhost:3000',
  ]);
});

test('missing or malformed delivery settings cannot silently fall back to an old recipient', () => {
  assert.throws(
    () => getQuoteEmailConfig({ RESEND_API_KEY: 'test-key' }),
    /email_missing/,
  );
  assert.throws(
    () =>
      getQuoteEmailConfig({
        RESEND_API_KEY: 'test-key',
        RESEND_FROM_EMAIL: 'customer@outside.example',
        ADMIN_EMAIL: 'operator@example.com',
      }),
    /sender_invalid/,
  );
  const config = getQuoteEmailConfig({
    RESEND_API_KEY: 'test-key',
    RESEND_FROM_EMAIL: 'BladeHaul <quotes@bladehaul.com>',
    ADMIN_EMAIL: 'operator@example.com',
  });
  assert.equal(config.recipient, 'operator@example.com');
});
