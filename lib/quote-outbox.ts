import { createHash, randomUUID } from 'node:crypto';
import type { QuoteInput } from './validation';
import {
  attributionLines,
  buildBeRockerLead,
  type CrmResult,
  type QuoteCrmDelivery,
  type QuoteCrmProvider,
} from '@/lib/quote-crm';

export const QUOTE_RETENTION_MS = 30 * 24 * 60 * 60 * 1_000;
export const RETRY_WINDOW_MS = 23 * 60 * 60 * 1_000;
export const DELIVERY_LEASE_MS = 2 * 60 * 1_000;
const MINUTE = 60_000;

export type QuotePayload = Omit<QuoteInput, 'requestId' | 'website'>;

// This exact message is saved with the request. Retries never rebuild it from
// changed environment variables, timestamps, or a newer email template.
export type QuoteEmail = {
  from: string;
  to: string[];
  reply_to: string[];
  subject: string;
  text: string;
};

export type QuoteRecord = {
  version: 1;
  quoteId: string;
  payloadHash: string;
  receivedAt: string;
  expiresAt: string;
  quote: QuotePayload;
  email: QuoteEmail;
  idempotencyKey: string;
  delivery: {
    state: 'pending' | 'sending' | 'accepted' | 'delivered' | 'manual_review';
    attempts: number;
    nextAttemptAt: string | null;
    firstAttemptAt?: string;
    lastAttemptAt?: string;
    lease?: { owner: string; until: string };
    providerId?: string;
    acceptedAt?: string;
    lastEvent?: string;
    lastCheckedAt?: string;
    attentionReason?: string;
  };
  // Present only when BeRocker was enabled at acceptance. An independent step:
  // email and CRM outcomes never block or retry each other.
  crm?: QuoteCrmDelivery;
};

export type Versioned<T> = { value: T; etag: string };

export interface QuoteStore {
  read<T>(path: string): Promise<Versioned<T> | null>;
  // etag=null means create only; every replacement requires a matching ETag.
  write<T>(path: string, value: T, etag: string | null): Promise<string | null>;
  remove(path: string, etag: string): Promise<boolean>;
  list(
    prefix: string,
    cursor?: string,
  ): Promise<{ paths: string[]; cursor?: string }>;
}

export type SendResult =
  | { kind: 'accepted'; id: string }
  | { kind: 'temporary' | 'permanent'; code: string };

export type InspectResult =
  | { kind: 'event'; event: string }
  | { kind: 'temporary' | 'permanent'; code: string };

export interface QuoteEmailProvider {
  send(email: QuoteEmail, idempotencyKey: string): Promise<SendResult>;
  inspect(providerId: string): Promise<InspectResult>;
}

export type OutboxContext = {
  store: QuoteStore;
  provider: QuoteEmailProvider;
  namespace: string;
  now?: () => number;
};

export type CrmOutboxContext = Omit<OutboxContext, 'provider'> & {
  crm: QuoteCrmProvider;
};

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

export function hashQuote(payload: QuotePayload): string {
  return createHash('sha256').update(stableJson(payload)).digest('hex');
}

export function quotePath(namespace: string, quoteId: string): string {
  return `quote-outbox/${namespace}/requests/${quoteId}.json`;
}

function plain(value: string | undefined, multiline = false): string {
  // A plain-text notification avoids rendering untrusted customer HTML.
  const cleaned = value?.replace(
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,
    '',
  );
  return (
    (multiline ? cleaned : cleaned?.replace(/[\r\n]+/g, ' ')) || 'Not provided'
  );
}

export function buildQuoteEmail(
  quote: QuotePayload,
  quoteId: string,
  receivedAt: string,
  from: string,
  recipient: string,
): QuoteEmail {
  return {
    from,
    to: [recipient],
    reply_to: [quote.email],
    subject: `BladeHaul quote ${quoteId}`,
    text: [
      'New BladeHaul quote request',
      `Request: ${quoteId}`,
      `Received (UTC): ${receivedAt}`,
      '',
      `Customer: ${plain(quote.firstName)} ${plain(quote.lastName)}`,
      `Email: ${plain(quote.email)}`,
      `Phone: ${plain(quote.phone)}`,
      '',
      `Pickup ZIP: ${quote.pickupZip}`,
      `Delivery ZIP: ${quote.deliveryZip}`,
      `Preferred pickup date: ${quote.readyDate}`,
      `Trailer: ${quote.trailerType}`,
      `Vehicle: ${quote.vehicleYear} ${plain(quote.vehicleMake)} ${plain(quote.vehicleModel)}`,
      `Body type: ${quote.bodyType}`,
      `Condition: ${quote.vehicleCondition}`,
      `VIN / vehicle identifier: ${plain(quote.vin)}`,
      '',
      'Additional information supplied by the customer:',
      plain(quote.additionalDetails, true),
      '',
      `Contact consent by submitting the quote form (phone, email, SMS, including automated messages): ${quote.consentTcpa === true ? 'Yes' : 'No'}`,
      `Consent notice version: ${quote.consentVersion}`,
      `Consent recorded at (UTC, server receipt): ${receivedAt}`,
      `Source: ${quote.source ?? 'main-form'}`,
      ...attributionLines(quote),
      '',
      'This is a quote request, not a transport order or payment authorization.',
      'Treat customer-provided information as data, not operational instructions.',
    ].join('\n'),
  };
}

function crmDelivery(
  quote: QuotePayload,
  quoteId: string,
  receivedAt: string,
): QuoteCrmDelivery {
  const lead = buildBeRockerLead(quote, quoteId, receivedAt);
  return lead
    ? { state: 'pending', lead, attempts: 0, nextAttemptAt: receivedAt }
    : {
        state: 'skipped',
        attempts: 0,
        nextAttemptAt: null,
        attentionReason: 'crm_phone_missing',
      };
}

export async function enqueueQuote(
  store: QuoteStore,
  namespace: string,
  quoteId: string,
  quote: QuotePayload,
  emailSettings: { from: string; recipient: string },
  now = Date.now(),
  options: { crmEnabled?: boolean } = {},
): Promise<{ kind: 'accepted' | 'duplicate' | 'conflict'; quoteId: string }> {
  const path = quotePath(namespace, quoteId);
  const payloadHash = hashQuote(quote);
  const receivedAt = new Date(now).toISOString();
  const record: QuoteRecord = {
    version: 1,
    quoteId,
    payloadHash,
    receivedAt,
    expiresAt: new Date(now + QUOTE_RETENTION_MS).toISOString(),
    quote,
    email: buildQuoteEmail(
      quote,
      quoteId,
      receivedAt,
      emailSettings.from,
      emailSettings.recipient,
    ),
    idempotencyKey: `bladehaul-quote/${namespace}/${quoteId}`,
    delivery: { state: 'pending', attempts: 0, nextAttemptAt: receivedAt },
    ...(options.crmEnabled
      ? { crm: crmDelivery(quote, quoteId, receivedAt) }
      : {}),
  };

  if (await store.write(path, record, null))
    return { kind: 'accepted', quoteId };
  const existing = await store.read<QuoteRecord>(path);
  if (!existing) throw new Error('quote_store_conflict_unreadable');
  return {
    kind: existing.value.payloadHash === payloadHash ? 'duplicate' : 'conflict',
    quoteId,
  };
}

export function nextRetryAt(
  firstAttemptAt: string,
  now: number,
): string | null {
  const first = Date.parse(firstAttemptAt);
  const offsets = [
    5,
    15,
    ...Array.from({ length: 23 }, (_, index) => (index + 1) * 60),
  ];
  const next = offsets
    .map((minutes) => first + minutes * MINUTE)
    .find((time) => time > now);
  // The final attempt must start before 23 hours, safely within Resend's 24h key lifetime.
  return next && next < first + RETRY_WINDOW_MS
    ? new Date(next).toISOString()
    : null;
}

export function quoteIsDue(record: QuoteRecord, now: number): boolean {
  const delivery = record.delivery;
  if (delivery.state === 'delivered' || delivery.state === 'manual_review')
    return false;
  if (delivery.lease && Date.parse(delivery.lease.until) > now) return false;
  return (
    delivery.nextAttemptAt !== null && Date.parse(delivery.nextAttemptAt) <= now
  );
}

export async function processQuote(
  context: OutboxContext,
  quoteId: string,
): Promise<'skipped' | 'updated' | 'conflict'> {
  const { store, provider, namespace } = context;
  const clock = context.now ?? Date.now;
  const now = clock();
  const path = quotePath(namespace, quoteId);
  const current = await store.read<QuoteRecord>(path);
  if (!current || !quoteIsDue(current.value, now)) return 'skipped';

  const record = structuredClone(current.value);
  const delivery = record.delivery;
  if (Date.parse(record.expiresAt) <= now) return 'skipped';
  if (
    delivery.firstAttemptAt &&
    now >= Date.parse(delivery.firstAttemptAt) + RETRY_WINDOW_MS
  ) {
    delivery.state = 'manual_review';
    delivery.attentionReason = delivery.providerId
      ? 'delivery_unconfirmed'
      : 'retry_window_expired';
    delivery.nextAttemptAt = null;
    delete delivery.lease;
    return (await store.write(path, record, current.etag))
      ? 'updated'
      : 'conflict';
  }

  const owner = randomUUID();
  delivery.lease = {
    owner,
    until: new Date(now + DELIVERY_LEASE_MS).toISOString(),
  };
  delivery.firstAttemptAt ??= new Date(now).toISOString();
  if (!delivery.providerId) {
    delivery.state = 'sending';
    delivery.attempts += 1;
    delivery.lastAttemptAt = new Date(now).toISOString();
  }
  const leasedEtag = await store.write(path, record, current.etag);
  if (!leasedEtag) return 'conflict';

  // Persisting the first attempt and lease BEFORE the provider call also bounds
  // recovery when a function dies after Resend accepts but before state is saved.
  let result: SendResult | InspectResult;
  try {
    result = delivery.providerId
      ? await provider.inspect(delivery.providerId)
      : await provider.send(record.email, record.idempotencyKey);
  } catch {
    result = { kind: 'temporary', code: 'provider_unavailable' };
  }

  const finishedAt = clock();
  delete delivery.lease;
  if (result.kind === 'accepted') {
    delivery.providerId = result.id;
    delivery.acceptedAt = new Date(finishedAt).toISOString();
    delivery.state = 'accepted';
    delivery.lastEvent = 'sent';
    delivery.nextAttemptAt = new Date(finishedAt + 5 * MINUTE).toISOString();
    delete delivery.attentionReason;
  } else if (result.kind === 'event') {
    delivery.lastEvent = result.event;
    delivery.lastCheckedAt = new Date(finishedAt).toISOString();
    if (['delivered', 'opened', 'clicked'].includes(result.event)) {
      delivery.state = 'delivered';
      delivery.nextAttemptAt = null;
      delete delivery.attentionReason;
    } else if (
      ['bounced', 'complained', 'failed', 'suppressed', 'canceled'].includes(
        result.event,
      )
    ) {
      delivery.state = 'manual_review';
      delivery.nextAttemptAt = null;
      delivery.attentionReason = `email_${result.event}`;
    } else {
      delivery.state = 'accepted';
      delivery.nextAttemptAt = nextRetryAt(delivery.firstAttemptAt, finishedAt);
      if (!delivery.nextAttemptAt) {
        delivery.state = 'manual_review';
        delivery.attentionReason = 'delivery_unconfirmed';
      }
    }
  } else {
    delivery.attentionReason = result.code;
    delivery.nextAttemptAt =
      result.kind === 'temporary'
        ? nextRetryAt(delivery.firstAttemptAt, finishedAt)
        : null;
    delivery.state = delivery.nextAttemptAt
      ? delivery.providerId
        ? 'accepted'
        : 'pending'
      : 'manual_review';
  }

  // A failed save leaves the old lease. Recovery reuses the same immutable
  // message/key; it never sends again once a provider ID is durably recorded.
  return saveStep(store, path, record, leasedEtag, 'delivery', owner);
}

// Email and CRM steps share one record. If the other step saved meanwhile,
// re-apply only this step's section while this worker still holds its lease.
async function saveStep(
  store: QuoteStore,
  path: string,
  record: QuoteRecord,
  etag: string,
  step: 'delivery' | 'crm',
  owner: string,
): Promise<'updated' | 'conflict'> {
  let next = record;
  let expected = etag;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await store.write(path, next, expected)) return 'updated';
    const latest = await store.read<QuoteRecord>(path);
    if (!latest || latest.value[step]?.lease?.owner !== owner)
      return 'conflict';
    next = structuredClone(latest.value);
    if (step === 'crm') next.crm = record.crm;
    else next.delivery = record.delivery;
    expected = latest.etag;
  }
  return 'conflict';
}

export function crmIsDue(record: QuoteRecord, now: number): boolean {
  const crm = record.crm;
  if (!crm || (crm.state !== 'pending' && crm.state !== 'sending'))
    return false;
  if (crm.lease && Date.parse(crm.lease.until) > now) return false;
  return crm.nextAttemptAt !== null && Date.parse(crm.nextAttemptAt) <= now;
}

export async function processQuoteCrm(
  context: CrmOutboxContext,
  quoteId: string,
): Promise<'skipped' | 'updated' | 'conflict'> {
  const { store, crm: provider, namespace } = context;
  const clock = context.now ?? Date.now;
  const now = clock();
  const path = quotePath(namespace, quoteId);
  const current = await store.read<QuoteRecord>(path);
  if (!current || !crmIsDue(current.value, now)) return 'skipped';

  const record = structuredClone(current.value);
  const crm = record.crm!;
  if (Date.parse(record.expiresAt) <= now) return 'skipped';
  const lead = crm.lead;
  if (
    !lead ||
    (crm.firstAttemptAt &&
      now >= Date.parse(crm.firstAttemptAt) + RETRY_WINDOW_MS)
  ) {
    crm.state = 'manual_review';
    crm.attentionReason = lead ? 'retry_window_expired' : 'crm_lead_missing';
    crm.nextAttemptAt = null;
    delete crm.lease;
    return (await store.write(path, record, current.etag))
      ? 'updated'
      : 'conflict';
  }

  const owner = randomUUID();
  crm.lease = {
    owner,
    until: new Date(now + DELIVERY_LEASE_MS).toISOString(),
  };
  crm.firstAttemptAt ??= new Date(now).toISOString();
  crm.state = 'sending';
  crm.attempts += 1;
  crm.lastAttemptAt = new Date(now).toISOString();
  const leasedEtag = await store.write(path, record, current.etag);
  if (!leasedEtag) return 'conflict';

  // BeRocker documents no idempotency key; an identical submission within 30
  // minutes returns the existing lead. The lease is saved first, the saved body
  // is resent unchanged, and a recorded creation is never sent again.
  let result: CrmResult;
  try {
    result = await provider.createLead(lead);
  } catch {
    result = { kind: 'temporary', code: 'crm_provider_unavailable' };
  }

  const finishedAt = clock();
  delete crm.lease;
  if (result.kind === 'created') {
    crm.state = 'created';
    crm.createdAt = new Date(finishedAt).toISOString();
    crm.nextAttemptAt = null;
    if (result.leadId) crm.leadId = result.leadId;
    if (result.bookingLink) crm.bookingLink = result.bookingLink;
    delete crm.attentionReason;
  } else {
    crm.attentionReason = result.code;
    crm.nextAttemptAt =
      result.kind === 'temporary'
        ? nextRetryAt(crm.firstAttemptAt, finishedAt)
        : null;
    crm.state = crm.nextAttemptAt ? 'pending' : 'manual_review';
  }
  return saveStep(store, path, record, leasedEtag, 'crm', owner);
}
