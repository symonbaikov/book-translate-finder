import type { JobQueuePort } from '../../src/ports/job-queue.port.js';

export class InMemoryJobQueue implements JobQueuePort {
  readonly enqueued: { jobId: string; payload: unknown }[] = [];
  private readonly seenJobIds = new Set<string>();

  async enqueue(jobId: string, payload: unknown): Promise<void> {
    // Dedup by jobId, same as the real BullMQ-backed queue relies on (docs/rules.md §2.3) — a
    // repeated enqueue of the same deterministic jobId is a no-op, not a second job.
    if (this.seenJobIds.has(jobId)) return;
    this.seenJobIds.add(jobId);
    this.enqueued.push({ jobId, payload });
  }
}
