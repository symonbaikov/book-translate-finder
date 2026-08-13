import { InvalidInputError, type JobQueuePort } from '@btf/domain';
import { Queue, type ConnectionOptions } from 'bullmq';

export interface BullMqQueueOptions {
  attempts?: number;
  backoffDelayMs?: number;
}

const DEFAULTS: Required<BullMqQueueOptions> = {
  attempts: 3,
  backoffDelayMs: 5_000,
};

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
 * purpose (`removeOnFail: false` keeps failed jobs inspectable/retriable instead of vanishing),
 * which is simpler than standing up a second queue for the same data.
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

  async enqueue(jobId: string, payload: unknown): Promise<void> {
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
      removeOnComplete: { age: 24 * 60 * 60 },
      removeOnFail: false,
    });
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
