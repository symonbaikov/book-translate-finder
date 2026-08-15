import { InvalidInputError, type EnqueueOptions, type JobQueuePort } from '@golden/domain';
import { Queue, type ConnectionOptions } from 'bullmq';
import { Redis } from 'ioredis';

/**
 * BullMQ hard-requires `maxRetriesPerRequest: null` on its Redis connection (it does its own
 * blocking-command retry loop) — `createRedisClient` in `cache/redis-client.ts` sets a finite
 * retry count instead, which is correct for `RedisCache` but wrong here, so BullMQ always gets
 * its own connection, never a shared one.
 */
export function createBullMqConnection(redisUrl: string): Redis {
  return new Redis(redisUrl, { maxRetriesPerRequest: null });
}

export interface BullMqQueueOptions {
  attempts?: number;
  backoffDelayMs?: number;
}

const DEFAULTS: Required<BullMqQueueOptions> = {
  attempts: 3,
  backoffDelayMs: 5_000,
};

/**
 * BullMQ's priority number for a `deferred` job. Any positive value would do — what matters is
 * that it is not zero.
 *
 * BullMQ does not sort one queue by priority; it keeps two, and `moveToActive` empties the plain
 * `wait` list before it ever looks at the `prioritized` sorted set (read from the Lua source of
 * bullmq 5.81.3, `moveToActive-11.lua`: `RPOPLPUSH wait active` first, then
 * `moveJobFromPrioritizedToActive`). A job added *without* a priority lands in `wait`, so the
 * absence of this option is itself the strongest priority there is. That is why `interactive`
 * passes no `priority` at all rather than a low number — and why a `deferred` job needs only to
 * be prioritized to yield.
 *
 * The trade-off is deliberate and worth stating: a continuous stream of reader searches can
 * starve the deferred backlog indefinitely. That is the correct outcome. Deferred work exists to
 * make a later visit better, and there is no later visit if the reader in front of us leaves.
 */
const DEFERRED_PRIORITY = 10;

/**
 * `JobQueuePort` backed by BullMQ (docs/architecture.md §5). `enqueue`'s `jobId` is the
 * dedup key BullMQ itself enforces — a repeated `enqueue` with the same `jobId` while that job
 * is still queued/active/delayed is a no-op, which is exactly what deterministic ids
 * (docs/rules.md §2.3) rely on. **BullMQ rejects any `jobId` containing `:`** (found the hard
 * way: the colon-delimited `sync:{source}:{workId}:{date}` format originally documented in
 * rules.md/plan.md throws `Custom Id cannot contain :` at `enqueue` time) — the convention is
 * hyphen-delimited instead, e.g. `sync-{source}-{workId}-{date}`; docs updated to match.
 *
 * No separate physical "dead letter queue" — BullMQ's own failed-job set already serves that
 * purpose (failed jobs are retained for an hour before aging out — see the comment on the
 * `removeOnFail` option below), which is simpler than standing up a second queue for the same data.
 *
 * BullMQ requires its Redis connection to have `maxRetriesPerRequest: null` — reusing the
 * connection `RedisCache` uses (which sets a finite retry count for cache purposes) would be
 * wrong here, so this takes its own `connection`, not a shared client.
 */
export class BullMqQueue implements JobQueuePort {
  private readonly queue: Queue;
  private readonly options: Required<BullMqQueueOptions>;

  constructor(queueName: string, connection: ConnectionOptions, options: BullMqQueueOptions = {}) {
    this.queue = new Queue(queueName, { connection });
    this.options = { ...DEFAULTS, ...options };
  }

  async enqueue(jobId: string, payload: unknown, options?: EnqueueOptions): Promise<void> {
    if (jobId.includes(':')) {
      // Fails fast with a message that names the actual constraint, instead of surfacing
      // BullMQ's less obvious internal error at the call site.
      throw new InvalidInputError(
        `BullMQ job ids cannot contain ":" — got: ${JSON.stringify(jobId)}`,
      );
    }
    await this.queue.add(jobId, payload, {
      jobId,
      attempts: this.options.attempts,
      backoff: { type: 'exponential', delay: this.options.backoffDelayMs },
      // Both removal windows are deliberately short because BullMQ's jobId dedup counts
      // *retained* completed/failed jobs, not just in-flight ones — live testing in Phase 3
      // found a completed backfill (whose date-scoped id lived for 24h under the original `age`
      // setting) silently blocked every re-enqueue of the same query for the rest of the day.
      // But `removeOnComplete: true` (immediate) overshot: the web UI polls a pending search
      // every 3s and each poll re-enqueues, so once jobs completed faster than the poll interval
      // the dedup stopped absorbing the loop — observed live as 11 back-to-back syncs of the
      // same work in 40 seconds. 60s keeps a completed job just long enough to absorb a polling
      // session, short enough that a deliberate user retry a minute later still works. Durable
      // history lives in Postgres `sync_log`, not in Redis.
      //
      // A *failed* job is retained the same way and for the same reason, and the window used to be
      // an hour — which meant a query whose backfill had failed could not be re-asked for an hour:
      // the dedup swallowed every re-enqueue, `GET /api/search` kept answering `pending` against a
      // job that would never run again, and the reader's retry button did nothing but restart the
      // same doomed poll. Five minutes still catches an incident anyone is actually looking at,
      // while the record that outlives it is the one in Postgres `sync_log`.
      removeOnComplete: { age: 60 },
      removeOnFail: { age: 5 * 60 },
      ...(options?.priority === 'deferred' ? { priority: DEFERRED_PRIORITY } : {}),
    });
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
