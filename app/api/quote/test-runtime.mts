import type {
  QuoteEmailProvider,
  QuotePayload,
  QuoteStore,
  Versioned,
} from '../../../lib/quote-outbox';

// Node 24's native TypeScript support does not expand Next's @/ alias. Keep the
// test-only resolver limited to this repository's server helpers.
const { registerHooks } = await import('node:module' as string);
registerHooks({
  resolve(
    specifier: string,
    context: unknown,
    nextResolve: (specifier: string, context: unknown) => unknown,
  ) {
    return nextResolve(
      specifier.startsWith('@/lib/quote-')
        ? new URL(
            `../../../lib/${specifier.slice('@/lib/'.length)}.ts`,
            import.meta.url,
          ).href
        : specifier,
      context,
    );
  },
});

export const QUOTE_ID = '00000000-0000-4000-8000-000000000001';
export const START = Date.parse('2030-01-01T12:00:00.000Z');
export const EMAIL_SETTINGS = {
  from: 'BladeHaul <quotes@bladehaul.com>',
  recipient: 'operator@example.com',
};
export const QUOTE: QuotePayload = {
  pickupZip: '90210',
  deliveryZip: '10001',
  trailerType: 'open',
  vehicleYear: '2020',
  vehicleMake: 'Example',
  vehicleModel: 'Test',
  bodyType: 'sedan',
  vehicleCondition: 'runs',
  vin: '',
  additionalDetails: '',
  readyDate: '2030-01-02',
  firstName: 'Example',
  lastName: 'Customer',
  email: 'customer@example.com',
  phone: '',
  consentTcpa: false,
  consentVersion: '2026-10-03-sms-v1',
  source: 'main-form',
};

export class MemoryStore implements QuoteStore {
  records = new Map<string, Versioned<unknown>>();
  revision = 0;
  failWrites = 0;

  async read<T>(path: string) {
    return structuredClone(
      this.records.get(path) ?? null,
    ) as Versioned<T> | null;
  }

  async write<T>(path: string, value: T, etag: string | null) {
    if (this.failWrites > 0) {
      this.failWrites -= 1;
      throw new Error('simulated_store_outage');
    }
    const previous = this.records.get(path);
    if (etag === null ? previous !== undefined : previous?.etag !== etag)
      return null;
    const nextEtag = String(++this.revision);
    this.records.set(path, { value: structuredClone(value), etag: nextEtag });
    return nextEtag;
  }

  async remove(path: string, etag: string) {
    if (this.records.get(path)?.etag !== etag) return false;
    return this.records.delete(path);
  }

  async list(prefix: string, cursor?: string) {
    const all = [...this.records.keys()]
      .filter((path) => path.startsWith(prefix) && (!cursor || path > cursor))
      .sort();
    const paths = all.slice(0, 20);
    return {
      paths,
      cursor: all.length > paths.length ? paths.at(-1) : undefined,
    };
  }
}

export function provider(
  overrides: Partial<QuoteEmailProvider> = {},
): QuoteEmailProvider {
  return {
    send: async () => ({ kind: 'accepted', id: 'email-example-1' }),
    inspect: async () => ({ kind: 'event', event: 'delivered' }),
    ...overrides,
  };
}
