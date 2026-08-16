import { LanguageCode, Work } from '@golden/domain';
import { describe, expect, it } from 'vitest';
import { FixedClock } from '../../../domain/test/fakes/fixed-clock.js';
import { InMemoryJobQueue } from '../../../domain/test/fakes/in-memory-job-queue.js';
import { InMemoryWorkRepository } from '../../../domain/test/fakes/in-memory-work-repository.js';
import {
  refreshJobId,
  RefreshStaleWorks,
  type RefreshStaleWorksDeps,
} from '../../src/use-cases/refresh-stale-works.use-case.js';

const NOW = new Date('2026-08-13T00:00:00Z');

function makeDeps(
  sources: string[] = ['open-library', 'google-books'],
  enrichmentSources: string[] = [],
) {
  const workRepository = new InMemoryWorkRepository();
  const syncQueue = new InMemoryJobQueue();
  const clock = new FixedClock(NOW);
  const deps: RefreshStaleWorksDeps = {
    workRepository,
    syncQueue,
    clock,
    sources,
    enrichmentSources,
  };
  return { deps, workRepository, syncQueue };
}

async function seedWork(
  workRepository: InMemoryWorkRepository,
  id: string,
  syncedAt: Date,
): Promise<void> {
  await workRepository.save(
    Work.create({
      id,
      originalTitle: `Book ${id}`,
      originalLanguage: LanguageCode.create('en'),
      author: 'Some Author',
      firstPublishedYear: 2000,
      syncedAt,
    }),
  );
}

describe('RefreshStaleWorks', () => {
  it('enqueues one sync job per registered source for each stale work', async () => {
    const { deps, workRepository, syncQueue } = makeDeps();
    await seedWork(workRepository, 'work-1', new Date('2026-01-01T00:00:00Z'));
    const useCase = new RefreshStaleWorks(deps);

    const result = await useCase.execute({ olderThanDays: 7, batchSize: 50 });

    expect(result.enqueued).toBe(2);
    expect(syncQueue.enqueued).toHaveLength(2);
    expect(syncQueue.enqueued.map((j) => j.jobId).sort()).toEqual(
      [
        refreshJobId('open-library', 'work-1', NOW),
        refreshJobId('google-books', 'work-1', NOW),
      ].sort(),
    );
  });

  it('does not enqueue a work synced recently (below the staleness cutoff)', async () => {
    const { deps, workRepository, syncQueue } = makeDeps();
    await seedWork(workRepository, 'work-1', new Date('2026-08-10T00:00:00Z'));
    const useCase = new RefreshStaleWorks(deps);

    const result = await useCase.execute({ olderThanDays: 7, batchSize: 50 });

    expect(result.enqueued).toBe(0);
    expect(syncQueue.enqueued).toHaveLength(0);
  });

  it('respects batchSize across multiple stale works', async () => {
    const { deps, workRepository, syncQueue } = makeDeps(['open-library']);
    await seedWork(workRepository, 'work-1', new Date('2026-01-01T00:00:00Z'));
    await seedWork(workRepository, 'work-2', new Date('2026-01-02T00:00:00Z'));
    const useCase = new RefreshStaleWorks(deps);

    const result = await useCase.execute({ olderThanDays: 7, batchSize: 1 });

    expect(result.enqueued).toBe(1);
    expect(syncQueue.enqueued).toHaveLength(1);
  });

  it('builds the payload query from the work title and author', async () => {
    const { deps, workRepository, syncQueue } = makeDeps(['open-library']);
    await seedWork(workRepository, 'work-1', new Date('2026-01-01T00:00:00Z'));
    const useCase = new RefreshStaleWorks(deps);

    await useCase.execute({ olderThanDays: 7, batchSize: 50 });

    expect(syncQueue.enqueued[0]?.payload).toEqual({
      source: 'open-library',
      query: 'Book work-1 Some Author',
    });
  });
});

describe('RefreshStaleWorks and the enrichment sources', () => {
  it('re-runs enrichment, which is the only way a new catalogue reaches an old book', async () => {
    // Enrichment otherwise happens once, when a book is first discovered. A catalogue added
    // afterwards is asked about every book found from then on and about none of the books already
    // in the database — «Метро 2034» sat at zero editions with seven catalogues holding it.
    const { deps, workRepository, syncQueue } = makeDeps(['open-library'], ['k10plus', 'bnf']);
    await seedWork(workRepository, 'work-1', new Date('2026-01-01T00:00:00Z'));

    const result = await new RefreshStaleWorks(deps).execute({ olderThanDays: 7, batchSize: 50 });

    expect(result.enqueued).toBe(3);
    expect(syncQueue.enqueued.map((job) => job.jobId).sort()).toEqual(
      [
        refreshJobId('open-library', 'work-1', NOW),
        refreshJobId('k10plus', 'work-1', NOW),
        refreshJobId('bnf', 'work-1', NOW),
      ].sort(),
    );
  });

  it('asks a catalogue only about the work it already knows', async () => {
    // Without `attachToWorkId` the BnF answers «Обитель» with "L'archipel des Solovki", misses the
    // work's natural key, and creates a second half-empty book — every night. This is precisely
    // why enrichment was left out of the nightly pass until the payload could carry the work id.
    const { deps, workRepository, syncQueue } = makeDeps(['open-library'], ['bnf']);
    await seedWork(workRepository, 'work-1', new Date('2026-01-01T00:00:00Z'));

    await new RefreshStaleWorks(deps).execute({ olderThanDays: 7, batchSize: 50 });

    const byId = new Map(syncQueue.enqueued.map((job) => [job.jobId, job.payload]));
    expect(byId.get(refreshJobId('bnf', 'work-1', NOW))).toMatchObject({
      source: 'bnf',
      attachToWorkId: 'work-1',
    });
    // The discovery half keeps deciding for itself, so a re-run can still correct the work's own
    // metadata — how a wrongly recorded original language ever gets fixed.
    expect(byId.get(refreshJobId('open-library', 'work-1', NOW))).not.toHaveProperty(
      'attachToWorkId',
    );
  });

  it('leaves the queue alone when there is nothing stale, enrichment included', async () => {
    const { deps, workRepository, syncQueue } = makeDeps(['open-library'], ['k10plus']);
    await seedWork(workRepository, 'work-1', new Date('2026-08-12T00:00:00Z'));

    await new RefreshStaleWorks(deps).execute({ olderThanDays: 7, batchSize: 50 });

    expect(syncQueue.enqueued).toHaveLength(0);
  });
});
