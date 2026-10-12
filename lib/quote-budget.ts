import type { QuoteStore, Versioned } from './quote-outbox';

export type BudgetLimits = { hour: number; day: number; month: number };
type BudgetKind = 'admission' | 'send';
export type QuoteBudgetResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };
type BudgetLedger = { version: 1; reservations: number[] };
type Environment = Record<string, string | undefined>;

const HOUR = 60 * 60 * 1_000;
const DAY = 24 * HOUR;
// A rolling 32 days conservatively covers any provider billing month. These
// limits are an operator-set allocation with headroom, never an assumed plan.
const MONTH = 32 * DAY;
const MAX_RESERVATIONS = 3_500;
const MAX_TIMESTAMP = 8_640_000_000_000_000;
const MAX_CAS_ATTEMPTS = 3;
export const QUOTE_DAILY_ADMISSION_LIMIT = 100;

function validTimestamp(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value >= 0 &&
    value <= MAX_TIMESTAMP
  );
}

function validateLimits(limits: BudgetLimits): void {
  if (
    !limits ||
    ![limits.hour, limits.day, limits.month].every(
      (value) => Number.isSafeInteger(value) && value > 0,
    ) ||
    limits.hour > limits.day ||
    limits.day > limits.month ||
    limits.month > MAX_RESERVATIONS
  )
    throw new Error('quote_budget_config_invalid');
}

// Mail settings are a server allocation with headroom, not a provider plan
// assumption. Missing values block sending independently of lead admission.
export function getQuoteSendBudgetLimits(
  env: Environment = process.env,
): BudgetLimits {
  function required(suffix: string): number {
    const value = env[`QUOTE_EMAIL_${suffix}_LIMIT`];
    if (!value || !/^[1-9][0-9]*$/.test(value))
      throw new Error('quote_budget_config_invalid');
    return Number(value);
  }
  const limits = {
    hour: required('HOURLY'),
    day: required('DAILY'),
    month: required('MONTHLY'),
  };
  validateLimits(limits);
  return limits;
}

function budgetPath(
  namespace: string,
  kind: BudgetKind,
  limits: BudgetLimits,
  now: number,
): string {
  validateLimits(limits);
  if (
    typeof namespace !== 'string' ||
    !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(namespace)
  )
    throw new Error('quote_budget_namespace_invalid');
  if (!['admission', 'send'].includes(kind))
    throw new Error('quote_budget_kind_invalid');
  if (!validTimestamp(now)) throw new Error('quote_budget_clock_invalid');
  return `quote-outbox/${namespace}/controls/${kind}-budget.json`;
}

async function readLedger(
  store: QuoteStore,
  path: string,
): Promise<Versioned<BudgetLedger> | null> {
  const current = await store.read<BudgetLedger>(path);
  if (!current) return null;
  const value = current.value;
  if (
    !value ||
    value.version !== 1 ||
    Object.keys(value).length !== 2 ||
    !Array.isArray(value.reservations) ||
    value.reservations.length > MAX_RESERVATIONS ||
    !value.reservations.every(
      (time, index, times) =>
        validTimestamp(time) && (index === 0 || time >= times[index - 1]),
    )
  )
    throw new Error('quote_budget_ledger_invalid');
  return current;
}

function availability(
  reservations: number[],
  limits: BudgetLimits,
  now: number,
): QuoteBudgetResult {
  let retryAfterSeconds = 0;
  for (const [duration, limit] of [
    [HOUR, limits.hour],
    [DAY, limits.day],
    [MONTH, limits.month],
  ]) {
    const active = reservations.filter((time) => time > now - duration);
    if (active.length >= limit) {
      // A lowered limit can require more than the oldest reservation to expire.
      const until = active[active.length - limit] + duration;
      retryAfterSeconds = Math.max(
        retryAfterSeconds,
        Math.ceil((until - now) / 1_000),
      );
    }
  }
  return retryAfterSeconds > 0
    ? { allowed: false, retryAfterSeconds }
    : { allowed: true };
}

// Read-only admission preflight; actual sends must still reserve atomically.
export async function checkQuoteBudget(
  store: QuoteStore,
  namespace: string,
  kind: BudgetKind,
  limits: BudgetLimits,
  now = Date.now(),
): Promise<QuoteBudgetResult> {
  const path = budgetPath(namespace, kind, limits, now);
  const current = await readLedger(store, path);
  return availability(current?.value.reservations ?? [], limits, now);
}

// Admission counts and every HTTP send attempt are independent global budgets.
// No identity or ingress header can change them. Never refund a reservation:
// provider responses and storage writes can be ambiguous after a timeout.
export async function reserveQuoteBudget(
  store: QuoteStore,
  namespace: string,
  kind: BudgetKind,
  limits: BudgetLimits,
  now = Date.now(),
  recordAt = now,
): Promise<QuoteBudgetResult> {
  const path = budgetPath(namespace, kind, limits, now);
  // Sending may reserve slightly into the future while bounding its CAS wait.
  // Availability is always checked at the real current time, never that pad.
  if (!validTimestamp(recordAt) || recordAt < now || recordAt > now + 6_000)
    throw new Error('quote_budget_clock_invalid');
  for (let attempt = 0; attempt < MAX_CAS_ATTEMPTS; attempt += 1) {
    const current = await readLedger(store, path);
    const reservations = (current?.value.reservations ?? []).filter(
      (time) => time > now - MONTH,
    );
    const result = availability(reservations, limits, now);
    if (!result.allowed) return result;
    // If a function's clock is behind another worker, keep its reservation at
    // least as late as the latest saved timestamp; rollback must not free quota.
    reservations.push(Math.max(recordAt, reservations.at(-1) ?? recordAt));
    const confirmed = await store.write(
      path,
      { version: 1, reservations } satisfies BudgetLedger,
      current?.etag ?? null,
    );
    if (confirmed) return { allowed: true };
    // The store can reconcile an uncertain CREATE as a collision. It cannot
    // distinguish that from another worker, so require a new invocation after
    // either case; a lost response must never authorize sending in this call.
    if (!current) throw new Error('quote_budget_busy');
  }
  throw new Error('quote_budget_busy');
}

export function reserveQuoteAdmission(
  store: QuoteStore,
  namespace: string,
  now = Date.now(),
): Promise<QuoteBudgetResult> {
  // The hourly value adds no restriction beyond 100 per rolling 24 hours.
  // That daily limit permits at most 3,200 reservations in 32 days; the 3,500
  // ledger guard is storage protection, not another business admission cap.
  return reserveQuoteBudget(
    store,
    namespace,
    'admission',
    {
      hour: QUOTE_DAILY_ADMISSION_LIMIT,
      day: QUOTE_DAILY_ADMISSION_LIMIT,
      month: MAX_RESERVATIONS,
    },
    now,
  );
}
