import { BlobPreconditionFailedError, del, get, list, put } from '@vercel/blob';
import type { QuoteStore } from '@/lib/quote-outbox';

const STORE_TIMEOUT_MS = 10_000;
const MAX_RECORD_BYTES = 65_536;

export function createQuoteBlobStore(
  storeId: string,
  namespace: string,
  client: Pick<
    typeof import('@vercel/blob'),
    'get' | 'put' | 'del' | 'list'
  > = { get, put, del, list },
): QuoteStore {
  const root = `quote-outbox/${namespace}/`;
  const checkPath = (path: string) => {
    if (!path.startsWith(root) || path.includes('..') || path.includes('://'))
      throw new Error('quote_path_invalid');
  };
  const options = () => ({
    storeId,
    abortSignal: AbortSignal.timeout(STORE_TIMEOUT_MS),
  });
  async function readRecord<T>(path: string) {
    checkPath(path);
    const result = await client.get(path, {
      ...options(),
      access: 'private',
      useCache: false,
    });
    if (!result) return null;
    if (
      result.statusCode !== 200 ||
      !result.stream ||
      !result.blob.etag ||
      (result.blob.size ?? 0) > MAX_RECORD_BYTES
    )
      throw new Error('quote_blob_invalid');
    const text = await new Response(result.stream).text();
    if (Buffer.byteLength(text) > MAX_RECORD_BYTES)
      throw new Error('quote_blob_too_large');
    return { value: JSON.parse(text) as T, etag: result.blob.etag };
  }
  return {
    read: readRecord,
    async write<T>(path: string, value: T, etag: string | null) {
      checkPath(path);
      try {
        const result = await client.put(path, JSON.stringify(value), {
          ...options(),
          access: 'private',
          addRandomSuffix: false,
          allowOverwrite: etag !== null,
          ...(etag === null ? {} : { ifMatch: etag }),
          contentType: 'application/json',
          cacheControlMaxAge: 60,
        });
        return result.etag;
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError) return null;
        // SDK 2.8 reports create collisions as a generic BlobError. Confirm a
        // current durable object instead of depending on provider message text.
        // This also covers a successful create whose HTTP response was lost.
        if (etag === null && (await readRecord(path))) return null;
        throw error;
      }
    },
    async remove(path, etag) {
      checkPath(path);
      try {
        await client.del(path, { ...options(), ifMatch: etag });
        return true;
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError) return false;
        throw error;
      }
    },
    async list(prefix, cursor) {
      checkPath(prefix);
      const result = await client.list({
        ...options(),
        prefix,
        cursor,
        limit: 20,
      });
      return {
        paths: result.blobs.map((blob) => blob.pathname),
        cursor: result.hasMore ? result.cursor : undefined,
      };
    },
  };
}
