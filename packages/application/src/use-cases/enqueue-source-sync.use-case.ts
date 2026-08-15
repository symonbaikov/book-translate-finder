import {
  ConflictError,
  normalizeText,
  sha256Hex,
  type Clock,
  type IdempotencyStore,
  type JobQueuePort,
} from '@golden/domain';
import type { UseCase } from '../use-case.js';

export interface EnqueueSourceSyncInput {
  source: string;
  query: string;
  idempotencyKey: string;
  /** The concrete route this request hit, e.g. `POST /api/sync/open-library` — scopes the key. */
  endpoint: string;
}

export interface EnqueueSourceSyncOutput {
  status: 'queued';
  jobId: string;
  replayed: boolean;
}

export interface EnqueueSourceSyncDeps {
  idempotencyStore: IdempotencyStore;
  syncQueue: JobQueuePort;
  clock: Clock;
}

const IDEMPOTENCY_KEY_TTL_MS = 24 * 60 * 60 * 1000;

function dateStamp(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Deterministic jobId for a query-triggered sync — distinct from Cron `RefreshStaleWorks`'s
 * `sync-{source}-{workId}-{date}` (docs/rules.md §2.3), which knows the `workId` upfront. This
 * endpoint doesn't: the work may not exist yet, so it hashes the normalized query instead, same
 * shape as `backfillJobId` in `search-works.use-case.ts`. Both land in the same `sync` queue and
 * are handled identically by the worker (payload is always `{source, query}`).
 */
export function syncJobId(source: string, query: string, now: Date): string {
  return `sync-${source}-${sha256Hex(normalizeText(query))}-${dateStamp(now)}`;
}

function requestHash(input: Pick<EnqueueSourceSyncInput, 'source' | 'query'>): string {
  return sha256Hex(JSON.stringify({ source: input.source, query: input.query }));
}

/**
 * `POST /api/sync/:source` (docs/architecture.md §4/§5, docs/rules.md §2.4). Only enqueues —
 * `SyncWorkFromSource` itself runs in the worker, never inline on the request. `Idempotency-Key`
 * handling is a secondary, fast-path dedup on top of BullMQ's own `jobId` dedup: if the process
 * dies after `enqueue()` but before the idempotency record is saved, a retry with the same key
 * re-enqueues under the *same* deterministic `jobId`, which BullMQ itself no-ops — so the two
 * steps don't need to share a Postgres transaction to stay safe.
 */
export class EnqueueSourceSync implements UseCase<EnqueueSourceSyncInput, EnqueueSourceSyncOutput> {
  constructor(private readonly deps: EnqueueSourceSyncDeps) {}

  async execute(input: EnqueueSourceSyncInput): Promise<EnqueueSourceSyncOutput> {
    const hash = requestHash(input);
    const existing = await this.deps.idempotencyStore.find(input.idempotencyKey, input.endpoint);

    if (existing) {
      if (existing.requestHash !== hash) {
        throw new ConflictError(
          `Idempotency-Key ${input.idempotencyKey} was already used with a different request body`,
        );
      }
      const body = existing.responseBody as EnqueueSourceSyncOutput;
      return { ...body, replayed: true };
    }

    const now = this.deps.clock.now();
    const jobId = syncJobId(input.source, input.query, now);
    await this.deps.syncQueue.enqueue(jobId, { source: input.source, query: input.query });

    const responseBody: EnqueueSourceSyncOutput = { status: 'queued', jobId, replayed: false };
    await this.deps.idempotencyStore.save({
      key: input.idempotencyKey,
      endpoint: input.endpoint,
      requestHash: hash,
      responseBody,
      statusCode: 202,
      createdAt: now,
      expiresAt: new Date(now.getTime() + IDEMPOTENCY_KEY_TTL_MS),
    });

    return responseBody;
  }
}
