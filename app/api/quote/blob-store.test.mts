import assert from 'node:assert/strict';
import test from 'node:test';
import { BlobPreconditionFailedError } from '@vercel/blob';

const { createQuoteBlobStore } = (await import(
  new URL('../../../lib/quote-blob-store.ts', import.meta.url).href
)) as typeof import('../../../lib/quote-blob-store');
type Client = NonNullable<Parameters<typeof createQuoteBlobStore>[2]>;
const path = 'quote-outbox/development/requests/test.json';

function fakeClient(overrides: Record<string, unknown> = {}) {
  return {
    get: async () => null,
    put: async () => ({ etag: 'next-etag' }),
    del: async () => undefined,
    list: async () => ({ blobs: [], hasMore: false }),
    ...overrides,
  } as unknown as Client;
}

test('Blob writes are private and deterministic; replacements require the exact ETag', async () => {
  const seen: Record<string, unknown>[] = [];
  const store = createQuoteBlobStore(
    'store-test',
    'development',
    fakeClient({
      put: async (
        _path: string,
        _body: string,
        options: Record<string, unknown>,
      ) => {
        seen.push(options);
        return { etag: 'next-etag' };
      },
    }),
  );
  await store.write(path, { example: true }, null);
  await store.write(path, { example: false }, 'previous-etag');
  assert.equal(seen[0].access, 'private');
  assert.equal(seen[0].addRandomSuffix, false);
  assert.equal(seen[0].allowOverwrite, false);
  assert.equal(seen[0].ifMatch, undefined);
  assert.equal(seen[1].ifMatch, 'previous-etag');
  assert.equal(seen[1].allowOverwrite, true);
  assert.equal(seen[0].oidcToken, undefined);
});

test('fresh reads bypass the Blob CDN cache', async () => {
  const store = createQuoteBlobStore(
    'store-test',
    'development',
    fakeClient({
      get: async (_path: string, options: Record<string, unknown>) => {
        assert.equal(options.useCache, false);
        assert.equal(options.access, 'private');
        return {
          statusCode: 200,
          stream: new Response('{"example":true}').body,
          blob: { etag: 'read-etag', size: 16 },
        };
      },
    }),
  );
  assert.deepEqual(await store.read(path), {
    value: { example: true },
    etag: 'read-etag',
  });
});

test('Brotli weak ETags from private get() are stored as the strong tag If-Match accepts', async () => {
  const seen: Record<string, unknown>[] = [];
  const store = createQuoteBlobStore(
    'store-test',
    'development',
    fakeClient({
      get: async () => ({
        statusCode: 200,
        stream: new Response('{"example":true}').body,
        blob: { etag: 'W/"strong-etag"', size: 16 },
      }),
      put: async (
        _path: string,
        _body: string,
        options: Record<string, unknown>,
      ) => {
        seen.push(options);
        return { etag: '"next-etag"' };
      },
      del: async (_path: string, options: Record<string, unknown>) => {
        seen.push(options);
      },
    }),
  );
  assert.equal((await store.read(path))?.etag, '"strong-etag"');
  await store.write(path, { example: false }, 'W/"strong-etag"');
  assert.equal(await store.remove(path, 'W/"strong-etag"'), true);
  assert.equal(seen[0].ifMatch, '"strong-etag"');
  assert.equal(seen[0].allowOverwrite, true);
  assert.equal(seen[1].ifMatch, '"strong-etag"');
});

test('generic create collision/lost-response is reconciled only when a durable object can be read', async () => {
  const store = createQuoteBlobStore(
    'store-test',
    'development',
    fakeClient({
      put: async () => {
        throw new Error('generic SDK collision');
      },
      get: async () => ({
        statusCode: 200,
        stream: new Response('{"example":true}').body,
        blob: { etag: 'existing', size: 16 },
      }),
    }),
  );
  assert.equal(await store.write(path, {}, null), null);
  const offline = createQuoteBlobStore(
    'store-test',
    'development',
    fakeClient({
      put: async () => {
        throw new Error('storage offline');
      },
    }),
  );
  await assert.rejects(offline.write(path, {}, null), /storage offline/);
});

test('ETag mismatch cannot overwrite or delete a newer record; cross-namespace paths are rejected', async () => {
  const store = createQuoteBlobStore(
    'store-test',
    'development',
    fakeClient({
      put: async () => {
        throw new BlobPreconditionFailedError();
      },
      del: async () => {
        throw new BlobPreconditionFailedError();
      },
    }),
  );
  assert.equal(await store.write(path, {}, 'stale'), null);
  assert.equal(await store.remove(path, 'stale'), false);
  await assert.rejects(
    store.read('quote-outbox/production/requests/test.json'),
    /path_invalid/,
  );
  await assert.rejects(
    store.read('quote-outbox/development/../production/test.json'),
    /path_invalid/,
  );
});
