import type { SourceLinkRepository, WorkSearchHit, WorkSearchPort } from '@golden/domain';
import { describe, expect, it } from 'vitest';
import { CACHE_KEY_VERSION } from '../../src/cache-key-version.js';
import { FixedClock } from '../../../domain/test/fakes/fixed-clock.js';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import { InMemoryJobQueue } from '../../../domain/test/fakes/in-memory-job-queue.js';
import {
  backfillJobId,
  markSearchResolved,
  searchNegativeCacheKey,
  searchResolutionCacheKey,
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

/** Reports whichever work ids `freeWorkIds` names as having a free copy — nothing by default. */
class FakeSourceLinkRepository implements Pick<SourceLinkRepository, 'hasFreeCopyByWorkIds'> {
  freeWorkIds = new Set<string>();
  async hasFreeCopyByWorkIds(workIds: readonly string[]): Promise<Set<string>> {
    return new Set(workIds.filter((id) => this.freeWorkIds.has(id)));
  }
}

const NOW = new Date('2026-01-01T00:00:00Z');

function makeDeps(hits: WorkSearchHit[]) {
  const cache = new InMemoryCache();
  const backfillQueue = new InMemoryJobQueue();
  const clock = new FixedClock(NOW);
  const sourceLinkRepository = new FakeSourceLinkRepository();
  const deps: SearchWorksDeps = {
    workSearch: new FakeWorkSearchPort(hits),
    cache,
    backfillQueue,
    clock,
    sourceLinkRepository: sourceLinkRepository as SourceLinkRepository,
  };
  return { deps, cache, backfillQueue, clock, sourceLinkRepository };
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

    expect(result).toEqual({
      status: 'found',
      results: [{ ...WAR_AND_PEACE, hasFreeCopy: false }],
    });
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
    const useCase = new SearchWorks({
      workSearch: countingSearch,
      cache,
      backfillQueue,
      clock,
      sourceLinkRepository: new FakeSourceLinkRepository() as SourceLinkRepository,
    });

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
    // Somebody is watching a spinner for this exact job, so it must not queue behind the bursts
    // of `deferred` work a genre page or the home page puts on the very same queue.
    expect(backfillQueue.enqueued[0]?.priority).toBe('interactive');
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

  it('shows a weak match but still asks the sources about it', async () => {
    // Live case: «Шантарам» returned *The Mountain Shadow* — a different novel by the same author,
    // scored 0.459 on the author's name alone. Because a hit is what stops this instance going out
    // to the sources, Shantaram itself was never fetched, on that search or on any later one.
    const { deps, backfillQueue } = makeDeps([{ ...WAR_AND_PEACE, rank: 0.46 }]);

    const result = await new SearchWorks(deps).execute({ query: 'Shantaram Roberts', limit: 20 });

    expect(result.status).toBe('found');
    expect(backfillQueue.enqueued).toHaveLength(1);
    // What the reader gets back is still the hit, and nothing about the ranking leaks into it.
    expect(result).toMatchObject({ results: [WAR_AND_PEACE] });
  });

  it('shows a high-ranked match but still asks the sources when its number conflicts with the query', async () => {
    // Live case: «Metro 2035» matched the already-synced «Metro 2033» edition title at 0.69 —
    // over CONFIDENT_MATCH_RANK — purely because the two strings differ by one digit. Being
    // "confident" meant the sources were never asked about the actual book requested.
    const METRO_2033: WorkSearchHit = {
      id: 'work-metro',
      originalTitle: 'Metro 2033',
      author: 'Dmitry Glukhovsky',
      firstPublishedYear: 2007,
    };
    const { deps, backfillQueue } = makeDeps([{ ...METRO_2033, rank: 0.69 }]);

    const result = await new SearchWorks(deps).execute({ query: 'Metro 2035', limit: 20 });

    expect(result.status).toBe('found');
    expect(result).toMatchObject({ results: [METRO_2033] });
    expect(backfillQueue.enqueued).toHaveLength(1);
  });

  it('leaves the sources alone when the match is a good one', async () => {
    const { deps, backfillQueue } = makeDeps([{ ...WAR_AND_PEACE, rank: 0.76 }]);

    await new SearchWorks(deps).execute({ query: 'War and Peace Tolstoy', limit: 20 });

    expect(backfillQueue.enqueued).toEqual([]);
  });

  it('treats an unranked hit as a good one, so browse-shaped ports are unaffected', async () => {
    const { deps, backfillQueue } = makeDeps([WAR_AND_PEACE]);

    await new SearchWorks(deps).execute({ query: 'War and Peace', limit: 20 });

    expect(backfillQueue.enqueued).toEqual([]);
  });

  it('answers with what the backfill resolved when no stored text matches the query', async () => {
    // The dead loop this closes: a Russian reader types «Преступление и наказание», the sync finds
    // the book at the source and stores it as `Prestuplenie i nakazanie`, and the trigram search
    // then cannot recognise its own row — so every poll returned `pending` for a book already in
    // this instance's database, until the page gave up and blamed the sources.
    const { deps, cache } = makeDeps([]);
    await markSearchResolved(cache, 'Преступление и наказание', [
      {
        id: 'work-9',
        originalTitle: 'Prestuplenie i nakazanie',
        author: 'Fyodor Dostoevsky',
        firstPublishedYear: 1866,
        coverUrl: null,
      },
    ]);

    const result = await new SearchWorks(deps).execute({
      query: 'Преступление и наказание',
      limit: 20,
    });

    expect(result.status).toBe('found');
    expect(result).toMatchObject({ results: [{ id: 'work-9' }] });
  });

  it('prefers the database’s own ranked answer over the single work a backfill resolved', async () => {
    // Order matters: the resolution memo is a rescue, not a replacement. A query the search *can*
    // answer keeps every hit it ranked, not just the one work one sync happened to pick.
    const { deps, cache } = makeDeps([WAR_AND_PEACE]);
    await markSearchResolved(cache, 'War and Peace', [
      {
        id: 'some-other-work',
        originalTitle: 'War and Peace (abridged)',
        author: 'Leo Tolstoy',
        firstPublishedYear: 1990,
        coverUrl: null,
      },
    ]);

    const result = await new SearchWorks(deps).execute({ query: 'War and Peace', limit: 20 });

    expect(result).toEqual({
      status: 'found',
      results: [{ ...WAR_AND_PEACE, hasFreeCopy: false }],
    });
  });

  it('still enqueues a backfill when nothing has resolved this query yet', async () => {
    const { deps, cache, backfillQueue } = makeDeps([]);
    // An empty list must not count as an answer, or a query would resolve to zero results forever.
    await cache.set(searchResolutionCacheKey('Some Untranslated Book'), [], 60);

    const result = await new SearchWorks(deps).execute({
      query: 'Some Untranslated Book',
      limit: 20,
    });

    expect(result.status).toBe('pending');
    expect(backfillQueue.enqueued).toHaveLength(1);
  });

  it('exposes the same cache key a backfill consumer would need to invalidate/populate', () => {
    const key = searchResultsCacheKey('War and Peace', 20);
    expect(key).toMatch(new RegExp(`^${CACHE_KEY_VERSION}:search:[0-9a-f]{64}:20$`));
  });

  describe('hasFreeCopy', () => {
    it('is attached on a fresh search hit', async () => {
      const { deps, sourceLinkRepository } = makeDeps([WAR_AND_PEACE]);
      sourceLinkRepository.freeWorkIds.add(WAR_AND_PEACE.id);

      const result = await new SearchWorks(deps).execute({ query: 'War and Peace', limit: 20 });

      expect(result).toMatchObject({ results: [{ id: WAR_AND_PEACE.id, hasFreeCopy: true }] });
    });

    it('is recomputed on a cache hit rather than reused from cache-write time', async () => {
      const { deps, sourceLinkRepository } = makeDeps([WAR_AND_PEACE]);
      // First call caches the base hit while nothing is free yet.
      const first = await new SearchWorks(deps).execute({ query: 'War and Peace', limit: 20 });
      expect(first).toMatchObject({ results: [{ hasFreeCopy: false }] });

      // A download link lands afterwards — a cached hit must reflect it on the very next request.
      sourceLinkRepository.freeWorkIds.add(WAR_AND_PEACE.id);
      const second = await new SearchWorks(deps).execute({ query: 'War and Peace', limit: 20 });

      expect(second).toMatchObject({ results: [{ hasFreeCopy: true }] });
    });

    it('is attached on a backfill-resolved hit', async () => {
      const { deps, cache, sourceLinkRepository } = makeDeps([]);
      await markSearchResolved(cache, 'Преступление и наказание', [
        {
          id: 'work-9',
          originalTitle: 'Prestuplenie i nakazanie',
          author: 'Fyodor Dostoevsky',
          firstPublishedYear: 1866,
          coverUrl: null,
        },
      ]);
      sourceLinkRepository.freeWorkIds.add('work-9');

      const result = await new SearchWorks(deps).execute({
        query: 'Преступление и наказание',
        limit: 20,
      });

      expect(result).toMatchObject({ results: [{ id: 'work-9', hasFreeCopy: true }] });
    });
  });
});
