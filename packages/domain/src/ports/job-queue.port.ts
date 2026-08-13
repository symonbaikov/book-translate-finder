/**
 * Queues background work (docs/architecture.md §5). `jobId` is caller-supplied and deterministic
 * (e.g. `sync:{source}:{workId}:{date}`, docs/rules.md §2.3) — the real BullMQ-backed
 * implementation relies on that for dedup; this port doesn't generate ids itself.
 */
export interface JobQueuePort {
  enqueue(jobId: string, payload: unknown): Promise<void>;
}
