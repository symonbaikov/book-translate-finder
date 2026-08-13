import type { WorkSearchHit, WorkSearchPort } from '@btf/domain';
import { describe, expect, it } from 'vitest';
import { FixedClock } from '../../../domain/test/fakes/fixed-clock.js';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import { InMemoryJobQueue } from '../../../domain/test/fakes/in-memory-job-queue.js';
import {
  backfillJobId,
  searchNegativeCacheKey,
  searchResultsCacheKey,
  SearchWorks,
  type SearchWorksDeps,
} from '../../src/use-cases/search-works.use-case.js';

class FakeWorkSearchPort implements WorkSearchPort {
  constructor(private readonly hits: WorkSearchHit[]) {}
  async search(_query: string, limit: number): Promise<WorkSearchHit[]> {
    return this.hits.slice(0, limit);
  }
}

const NOW = new Date('2026-01-01T00:00:00Z');

function makeDeps(hits: WorkSearchHit[]) {
  const cache = new InMemoryCache();
  const backfillQueue = new InMemoryJobQueue();
  const clock = new FixedClock(NOW);
  const deps: SearchWorksDeps = {
    workSearch: new FakeWorkSearchPort(hits),
    cache,
    backfillQueue,
    clock,
  };
  return { deps, cache, backfillQueue, clock };
}

const WAR_AND_PEACE: WorkSearchHit = {
  id: 'work-1',
  originalTitle: 'War and Peace',
  author: 'Leo Tolstoy',
  firstPublishedYear: 1869,
};

describe('SearchWorks', () => {
  it('returns found with results when the search hits', async () => {
    const { deps } = makeDeps([WAR_AND_PEACE]);
    const useCase = new SearchWorks(deps);

    const result = await useCase.execute({ query: 'War and Peace', limit: 20 });

    expect(result).toEqual({ status: 'found', results: [WAR_AND_PEACE] });
  });

  it('caches found results so a repeat query does not hit the search port again', async () => {
    let calls = 0;
    const cache = new InMemoryCache();
    const backfillQueue = new InMemoryJobQueue();
    const clock = new FixedClock(NOW);
    const countingSearch: WorkSearchPort = {
      async search(_query, limit) {
        calls += 1;
        return [WAR_AND_PEACE].slice(0, limit);
      },
    };
    const useCase = new SearchWorks({ workSearch: countingSearch, cache, backfillQueue, clock });

    await useCase.execute({ query: 'War and Peace', limit: 20 });
    await useCase.execute({ query: 'War and Peace', limit: 20 });

    expect(calls).toBe(1);
  });

  it('enqueues a backfill job and returns pending on a miss (ADR-0003)', async () => {
    const { deps, backfillQueue } = makeDeps([]);
    const useCase = new SearchWorks(deps);

    const result = await useCase.execute({ query: 'Some Untranslated Book', limit: 20 });

    expect(result).toEqual({ status: 'pending', pollAfterMs: 3000 });
    expect(backfillQueue.enqueued).toHaveLength(1);
    expect(backfillQueue.enqueued[0]?.jobId).toBe(backfillJobId('Some Untranslated Book', NOW));
    expect(backfillQueue.enqueued[0]?.payload).toEqual({ query: 'Some Untranslated Book' });
  });

  it('does not enqueue a second backfill job for the same normalized query same-day (dedup)', async () => {
    const { deps, backfillQueue } = makeDeps([]);
    const useCase = new SearchWorks(deps);

    await useCase.execute({ query: 'Some Untranslated Book', limit: 20 });
    await useCase.execute({ query: 'some   untranslated book', limit: 20 });

    expect(backfillQueue.enqueued).toHaveLength(1);
  });

  it('returns not_found without re-enqueuing once the negative cache is set', async () => {
    const { deps, cache, backfillQueue } = makeDeps([]);
    await cache.set(searchNegativeCacheKey('Some Untranslated Book'), true, 86_400);
    const useCase = new SearchWorks(deps);

    const result = await useCase.execute({ query: 'Some Untranslated Book', limit: 20 });

    expect(result).toEqual({ status: 'not_found' });
    expect(backfillQueue.enqueued).toHaveLength(0);
  });

  it('exposes the same cache key a backfill consumer would need to invalidate/populate', () => {
    const key = searchResultsCacheKey('War and Peace', 20);
    expect(key).toMatch(/^v1:search:[0-9a-f]{64}:20$/);
  });
});
