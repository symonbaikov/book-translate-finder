import type { Clock, JobQueuePort, WorkRepository } from '@btf/domain';
import type { UseCase } from '../use-case.js';

export interface RefreshStaleWorksInput {
  olderThanDays: number;
  batchSize: number;
}

export interface RefreshStaleWorksOutput {
  enqueued: number;
}

export interface RefreshStaleWorksDeps {
  workRepository: WorkRepository;
  syncQueue: JobQueuePort;
  clock: Clock;
  /** Registered provider names (e.g. `['open-library', 'google-books']`) — refresh checks all of them. */
  sources: readonly string[];
}

function dateStamp(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** `sync-{source}-{workId}-{date}` (docs/rules.md §2.3) — the shape for a *known* work, unlike
 * `syncJobId` in `enqueue-source-sync.use-case.ts`, which hashes an unresolved query. */
export function refreshJobId(source: string, workId: string, now: Date): string {
  return `sync-${source}-${workId}-${dateStamp(now)}`;
}

/**
 * Cron `RefreshStaleWorks` (docs/architecture.md §5) — re-checks works not synced in
 * `olderThanDays`, capped at `batchSize` per run to bound load on a self-hosted instance. Only
 * enqueues into the same `sync` BullMQ queue the regular sync consumer already processes —
 * refresh doesn't duplicate `SyncWorkFromSource`'s logic, it just decides *when* to re-run it.
 */
export class RefreshStaleWorks implements UseCase<RefreshStaleWorksInput, RefreshStaleWorksOutput> {
  constructor(private readonly deps: RefreshStaleWorksDeps) {}

  async execute(input: RefreshStaleWorksInput): Promise<RefreshStaleWorksOutput> {
    const now = this.deps.clock.now();
    const cutoff = new Date(now.getTime() - input.olderThanDays * 24 * 60 * 60 * 1000);
    const staleWorks = await this.deps.workRepository.findStale(cutoff, input.batchSize);

    let enqueued = 0;
    for (const work of staleWorks) {
      const query = `${work.originalTitle} ${work.author}`;
      for (const source of this.deps.sources) {
        await this.deps.syncQueue.enqueue(refreshJobId(source, work.id, now), { source, query });
        enqueued += 1;
      }
    }

    return { enqueued };
  }
}
