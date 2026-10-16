import assert from 'node:assert/strict';
import test from 'node:test';

const {
  QUOTE_ATTRIBUTION_KEY,
  readQuoteAttribution,
  rememberQuoteAttribution,
} = (await import(
  new URL('./quote-attribution.ts', import.meta.url).href
)) as typeof import('./quote-attribution');

class TabStorage {
  items = new Map<string, string>();
  getItem(key: string) {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.items.set(key, value);
  }
}

const place = (pathname: string, search = '') => ({ pathname, search });

test('keeps the landing path and the five UTM tags, never the query, click IDs or other parameters', () => {
  const storage = new TabStorage();
  rememberQuoteAttribution(
    place(
      '/car-shipping-cost',
      '?utm_source=google&utm_medium=cpc&utm_campaign=fall+sale&utm_term=ship%20car%20to%20florida&utm_content=ad-2&gclid=abc123&email=a%40b.com',
    ),
    storage,
  );
  assert.deepEqual(readQuoteAttribution(storage), {
    landingPage: '/car-shipping-cost',
    utm: {
      source: 'google',
      medium: 'cpc',
      campaign: 'fall sale',
      term: 'ship car to florida',
      content: 'ad-2',
    },
  });
  const raw = storage.getItem(QUOTE_ATTRIBUTION_KEY) ?? '';
  assert.equal(raw.includes('gclid'), false);
  assert.equal(raw.includes('a@b.com'), false);
});

test('the first page of the tab is kept until a link with UTM tags arrives', () => {
  const storage = new TabStorage();
  rememberQuoteAttribution(place('/open-vs-enclosed-car-shipping'), storage);
  rememberQuoteAttribution(place('/'), storage);
  assert.deepEqual(readQuoteAttribution(storage), {
    landingPage: '/open-vs-enclosed-car-shipping',
  });
  rememberQuoteAttribution(place('/', '?utm_source=facebook'), storage);
  rememberQuoteAttribution(place('/contact'), storage);
  assert.deepEqual(readQuoteAttribution(storage), {
    landingPage: '/',
    utm: { source: 'facebook' },
  });
});

test('long or control-character values are trimmed; empty tags are dropped', () => {
  const storage = new TabStorage();
  rememberQuoteAttribution(
    place(
      `/${'a'.repeat(300)}`,
      `?utm_source=${'x'.repeat(150)}&utm_medium=%0Aemail%0D&utm_campaign=%20%20`,
    ),
    storage,
  );
  const attribution = readQuoteAttribution(storage);
  assert.equal(attribution.landingPage?.length, 200);
  assert.equal(attribution.utm?.source?.length, 100);
  assert.equal(attribution.utm?.medium, 'email');
  assert.equal('campaign' in (attribution.utm ?? {}), false);
});

test('blocked or tampered storage never breaks the form', () => {
  const blocked = {
    getItem() {
      throw new Error('SecurityError');
    },
    setItem() {
      throw new Error('QuotaExceededError');
    },
  };
  assert.doesNotThrow(() =>
    rememberQuoteAttribution(place('/', '?utm_source=x'), blocked),
  );
  assert.deepEqual(readQuoteAttribution(blocked), {});
  assert.deepEqual(readQuoteAttribution(null), {});
  const storage = new TabStorage();
  for (const raw of [
    'not json',
    '"text"',
    JSON.stringify({ landingPage: 'https://evil.example/x', utm: 'google' }),
    JSON.stringify({ landingPage: '/x?email=a@b.com', utm: { source: 7 } }),
  ]) {
    storage.setItem(QUOTE_ATTRIBUTION_KEY, raw);
    assert.deepEqual(readQuoteAttribution(storage), {});
  }
});
