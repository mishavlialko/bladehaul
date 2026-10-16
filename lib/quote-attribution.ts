// Where a quote request came from: the first page this tab opened on the site
// and the UTM tags of the link that brought the visitor. Only the path and the
// five standard UTM tags are kept, never the full URL: its query can carry
// click IDs or personal data. The quote form is on the home page, so the page
// it was submitted from says nothing; the landing page does.
export const QUOTE_ATTRIBUTION_KEY = 'bladehaul:attribution';
export const UTM_TAGS = [
  'source',
  'medium',
  'campaign',
  'term',
  'content',
] as const;
export const MAX_LANDING_PAGE_LENGTH = 200;
export const MAX_UTM_LENGTH = 100;

export type QuoteUtm = Partial<Record<(typeof UTM_TAGS)[number], string>>;
export type QuoteAttribution = { landingPage?: string; utm?: QuoteUtm };

type Place = Pick<Location, 'pathname' | 'search'>;
type SessionStore = Pick<Storage, 'getItem' | 'setItem'>;

function text(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const cleaned = value
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max)
    .trim();
  return cleaned || undefined;
}

function landingPage(value: unknown): string | undefined {
  const path = text(value, MAX_LANDING_PAGE_LENGTH);
  return path && /^\/[^\s?#]*$/.test(path) ? path : undefined;
}

function utm(read: (tag: (typeof UTM_TAGS)[number]) => unknown) {
  const tags: QuoteUtm = {};
  for (const tag of UTM_TAGS) {
    const value = text(read(tag), MAX_UTM_LENGTH);
    if (value) tags[tag] = value;
  }
  return Object.keys(tags).length > 0 ? tags : undefined;
}

// Storage access itself throws when the browser blocks it.
export function sessionStore(): SessionStore | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

// Runs once per full page load. A load whose link has UTM tags replaces what
// the tab remembered; otherwise the tab's first page is kept.
export function rememberQuoteAttribution(
  place: Place,
  storage: SessionStore | null,
) {
  try {
    if (!storage) return;
    const params = new URLSearchParams(place.search);
    const tags = utm((tag) => params.get(`utm_${tag}`));
    if (!tags && storage.getItem(QUOTE_ATTRIBUTION_KEY)) return;
    const attribution: QuoteAttribution = {
      landingPage: landingPage(place.pathname),
      ...(tags ? { utm: tags } : {}),
    };
    storage.setItem(QUOTE_ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // Attribution is optional; the form works without it.
  }
}

export function readQuoteAttribution(
  storage: SessionStore | null,
): QuoteAttribution {
  try {
    const saved: unknown = JSON.parse(
      storage?.getItem(QUOTE_ATTRIBUTION_KEY) ?? 'null',
    );
    if (!saved || typeof saved !== 'object') return {};
    const page =
      'landingPage' in saved ? landingPage(saved.landingPage) : undefined;
    const savedUtm =
      'utm' in saved && saved.utm && typeof saved.utm === 'object'
        ? (saved.utm as Record<string, unknown>)
        : {};
    const tags = utm((tag) => savedUtm[tag]);
    return {
      ...(page ? { landingPage: page } : {}),
      ...(tags ? { utm: tags } : {}),
    };
  } catch {
    return {};
  }
}
