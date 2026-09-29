import { randomUUID } from 'node:crypto';
import { processQuote, quoteIsDue } from '@/lib/quote-outbox';
import type { OutboxContext, QuoteRecord } from '@/lib/quote-outbox';

export type MaintenanceState = {
  version: 1;
  cursor?: string;
  remainingPaths?: string[];
  nextCursor?: string;
  scanHasAttention?: boolean;
  scanInProgress?: boolean;
  attentionOutstanding?: boolean;
  lease?: { owner: string; until: string };
  lastStartedAt: string;
  lastFinishedAt?: string;
  lastCompleteScanAt?: string;
  // Counts describe this bounded batch, not all quotes in the store.
  lastBatch?: {
    scanned: number;
    processed: number;
    deleted: number;
    errors: number;
    deliveryUnavailable: boolean;
    manualReviewIds: string[];
    pendingInBatch: number;
    oldestPendingAt?: string;
  };
};

export function maintenancePath(namespace: string) {
  return `quote-outbox/${namespace}/maintenance.json`;
}

export function maintenanceIsHealthy(
  state: MaintenanceState | null,
  now = Date.now(),
) {
  const recent = (timestamp: string | undefined) =>
    Boolean(timestamp && Date.parse(timestamp) > now - 15 * 60_000);
  return Boolean(
    state &&
    recent(state.lastFinishedAt) &&
    recent(state.lastCompleteScanAt) &&
    !state.scanInProgress &&
    !state.attentionOutstanding &&
    state.lastBatch &&
    !state.lastBatch.errors &&
    !state.lastBatch.deliveryUnavailable,
  );
}

export async function runQuoteMaintenance(
  context: Omit<OutboxContext, 'provider'> & {
    provider?: OutboxContext['provider'];
  },
) {
  const { store, namespace } = context;
  const clock = context.now ?? Date.now;
  const now = clock();
  const path = maintenancePath(namespace);
  const previous = await store.read<MaintenanceState>(path);
  if (previous?.value.lease && Date.parse(previous.value.lease.until) > now)
    return { busy: true as const };
  const state: MaintenanceState = {
    ...previous?.value,
    version: 1,
    lastStartedAt: new Date(now).toISOString(),
    lease: {
      owner: randomUUID(),
      until: new Date(now + 230_000).toISOString(),
    },
  };
  const leasedEtag = await store.write(path, state, previous?.etag ?? null);
  if (!leasedEtag) return { busy: true as const };

  const batch: NonNullable<MaintenanceState['lastBatch']> = {
    scanned: 0,
    processed: 0,
    deleted: 0,
    errors: 0,
    deliveryUnavailable: !context.provider,
    manualReviewIds: [],
    pendingInBatch: 0,
  };
  // Leave room for a worst-case in-flight record and the final checkpoint.
  // Each provider/blob operation has its own ten-second timeout.
  const deadline = now + 140_000;
  let completeScan = false;
  try {
    do {
      const page = state.remainingPaths?.length
        ? { paths: state.remainingPaths, cursor: state.nextCursor }
        : await store.list(`quote-outbox/${namespace}/requests/`, state.cursor);
      let completePage = true;
      for (let index = 0; index < page.paths.length; index += 1) {
        const recordPath = page.paths[index];
        if (clock() >= deadline || batch.scanned >= 200) {
          completePage = false;
          state.remainingPaths = page.paths.slice(index);
          state.nextCursor = page.cursor;
          break;
        }
        batch.scanned += 1;
        try {
          const current = await store.read<QuoteRecord>(recordPath);
          if (!current) continue;
          const record = current.value;
          if (Date.parse(record.expiresAt) <= clock()) {
            if (await store.remove(recordPath, current.etag))
              batch.deleted += 1;
            continue;
          }
          if (context.provider && quoteIsDue(record, clock())) {
            if (
              (await processQuote(
                { ...context, provider: context.provider },
                record.quoteId,
              )) === 'updated'
            )
              batch.processed += 1;
          }
          const latest = await store.read<QuoteRecord>(recordPath);
          if (!latest) continue;
          if (latest.value.delivery.state === 'manual_review')
            batch.manualReviewIds.push(latest.value.quoteId);
          if (
            ['pending', 'sending', 'accepted'].includes(
              latest.value.delivery.state,
            )
          ) {
            batch.pendingInBatch += 1;
            if (
              !batch.oldestPendingAt ||
              latest.value.receivedAt < batch.oldestPendingAt
            )
              batch.oldestPendingAt = latest.value.receivedAt;
          }
        } catch {
          batch.errors += 1;
        }
      }
      // Save the exact unprocessed suffix. Replaying a slow prefix on every
      // invocation could otherwise starve later records in the same page.
      if (!completePage) break;
      delete state.remainingPaths;
      delete state.nextCursor;
      state.cursor = page.cursor;
      if (!page.cursor) {
        completeScan = true;
        break;
      }
    } while (clock() < deadline && batch.scanned < 200);
  } catch {
    batch.errors += 1;
  }
  state.lastFinishedAt = new Date(clock()).toISOString();
  const batchAttention =
    batch.errors > 0 ||
    batch.deliveryUnavailable ||
    batch.manualReviewIds.length > 0 ||
    Boolean(
      batch.oldestPendingAt &&
      Date.parse(batch.oldestPendingAt) < clock() - 15 * 60_000,
    );
  state.scanHasAttention = Boolean(state.scanHasAttention || batchAttention);
  state.attentionOutstanding = Boolean(
    state.attentionOutstanding || batchAttention,
  );
  state.scanInProgress = !completeScan;
  if (completeScan) {
    state.lastCompleteScanAt = state.lastFinishedAt;
    // Clear an earlier warning only after an entire clean scan. A later clean
    // page must not hide an unresolved manual-recovery record on an older page.
    state.attentionOutstanding = state.scanHasAttention;
    delete state.scanHasAttention;
  }
  state.lastBatch = batch;
  delete state.lease;
  if (!(await store.write(path, state, leasedEtag)))
    throw new Error('quote_maintenance_lease_lost');
  return { busy: false as const, state };
}
