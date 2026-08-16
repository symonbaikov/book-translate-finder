import type { Clock, JobQueuePort, WorkRepository } from '@golden/domain';
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
  /**
   * Discovery provider names (e.g. `['open-library', 'google-books']`). Asked without a work id,
   * so a re-run can also correct the work's own metadata — which is how a book whose original
   * language was wrongly recorded ever gets it fixed.
   */
  sources: readonly string[];
  /**
   * Enrichment provider names — the library catalogues and the free-copy sources. Always asked
   * *about a known work* (`attachToWorkId`), never allowed to decide which book they answered.
   *
   * Each stale work therefore costs `sources.length + enrichmentSources.length` jobs rather than
   * `sources.length`, which is roughly two and a half times the nightly volume at the time of
   * writing. `batchSize` remains the lever: an instance that finds the new figure too heavy turns
   * it down, and the pass simply takes more nights to walk the catalog.
   */
  enrichmentSources: readonly string[];
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
 *
 * **It re-runs enrichment too, and that is the only way a new source ever reaches an old book.**
 * Enrichment otherwise happens exactly once, inside `ProcessBackfillJob`, at the moment a book is
 * first discovered — so a catalogue added afterwards is asked about every book found from then on
 * and about none of the books already in the database. Adding six library catalogues left a
 * shelf's worth of books that would never see any of them: «Метро 2034» sat at zero editions with
 * seven catalogues holding it, because it had been discovered before they existed.
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
        // `deferred`: a nightly freshness pass enqueues `batchSize × sources` jobs at 03:00, and
        // whoever is awake and searching then must not queue behind all of them.
        await this.deps.syncQueue.enqueue(
          refreshJobId(source, work.id, now),
          { source, query },
          { priority: 'deferred' },
        );
        enqueued += 1;
      }

      for (const source of this.deps.enrichmentSources) {
        // `attachToWorkId` is what makes this safe, and its absence is why enrichment was left out
        // of the nightly pass to begin with. A catalogue's records are *translations*: asked
        // without it, the BnF would answer «Обитель» with "L'archipel des Solovki", fail to match
        // the work's natural key, and create a second, half-empty book — every night.
        await this.deps.syncQueue.enqueue(
          refreshJobId(source, work.id, now),
          { source, query, attachToWorkId: work.id },
          { priority: 'deferred' },
        );
        enqueued += 1;
      }
    }

    return { enqueued };
  }
}
