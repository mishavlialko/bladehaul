import assert from 'node:assert/strict';
import test from 'node:test';

const { createResendProvider } = (await import(
  new URL('./delivery.ts', import.meta.url).href
)) as typeof import('./delivery');
const email = {
  from: 'BladeHaul <quotes@bladehaul.com>',
  to: ['operator@example.com'],
  reply_to: ['customer@example.com'],
  subject: 'Synthetic quote',
  text: '<img src=x> remains plain text',
};

test('sends the immutable plain-text message with its stable idempotency key', async () => {
  let options: RequestInit | undefined;
  const provider = createResendProvider('test-key', async (url, init) => {
    assert.equal(url, 'https://api.resend.com/emails');
    options = init;
    return Response.json({ id: 'email-example-1' });
  });
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
    const provider = createResendProvider('test-key', async () =>
      Response.json({ message: 'sensitive provider detail' }, { status }),
    );
    assert.deepEqual(await provider.send(email, 'same-request'), {
      kind: 'temporary',
      code: `resend_http_${status}`,
    });
  }
});

test('invalid credentials or sender rejection require manual recovery, not an endless send loop', async () => {
  const provider = createResendProvider('test-key', async () =>
    Response.json({}, { status: 403 }),
  );
  assert.deepEqual(await provider.send(email, 'same-request'), {
    kind: 'permanent',
    code: 'resend_http_403',
  });
});

test('retrieves delivery events without sending another email or retaining message content', async () => {
  const provider = createResendProvider('test-key', async (url, init) => {
    assert.equal(url, 'https://api.resend.com/emails/email-example-1');
    assert.equal(init?.method, undefined);
    return Response.json({ last_event: 'delivered', text: 'private payload' });
  });
  assert.deepEqual(await provider.inspect('email-example-1'), {
    kind: 'event',
    event: 'delivered',
  });
});

test('aborts a stalled provider request and returns a retryable result', async () => {
  let aborted = false;
  const provider = createResendProvider(
    'test-key',
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
  const provider = createResendProvider('test-key', async () => {
    calls += 1;
    return Response.json({});
  });
  assert.equal((await provider.send(email, 'same-request')).kind, 'temporary');
  assert.equal((await provider.inspect('../outside')).kind, 'permanent');
  assert.equal(calls, 1);
});
