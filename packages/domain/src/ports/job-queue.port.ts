/**
 * Who is waiting for a job, which is the only thing the queue needs in order to order its work.
 *
 * - `interactive` — somebody is watching a spinner for exactly this job. The reader typed a query
 *   the instance has never seen and the page polls until it lands.
 * - `deferred` — nobody is waiting. Filling out a genre page, topping up the home page's lists,
 *   refreshing a stale work: the page that queued these has already rendered without them, and
 *   they exist to make the *next* visit better.
 *
 * The distinction is not cosmetic. Both kinds go through the same backfill queue, and the deferred
 * kind arrives in bursts — one genre page with a thin local result queues twenty books at once —
 * so without it a reader's own search waits behind an arbitrary backlog of work nobody asked for.
 * That is a wait measured in minutes, and it is what the reader experiences as "the search is
 * broken".
 */
export type JobPriority = 'interactive' | 'deferred';

export interface EnqueueOptions {
  /** Defaults to `interactive` — a queue whose callers say nothing should serve people first. */
  priority?: JobPriority;
}

/**
 * Queues background work (docs/architecture.md §5). `jobId` is caller-supplied and deterministic
 * (e.g. `sync:{source}:{workId}:{date}`, docs/rules.md §2.3) — the real BullMQ-backed
 * implementation relies on that for dedup; this port doesn't generate ids itself.
 */
export interface JobQueuePort {
  enqueue(jobId: string, payload: unknown, options?: EnqueueOptions): Promise<void>;
}
