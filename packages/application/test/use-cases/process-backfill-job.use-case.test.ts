import { describe, expect, it } from 'vitest';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import {
  searchNegativeCacheKey,
  searchResolutionCacheKey,
} from '../../src/use-cases/search-works.use-case.js';
import type { SyncWorkFromSourceOutput } from '../../src/use-cases/sync-work-from-source.use-case.js';
import {
  BackfillSourcesUnavailableError,
  ProcessBackfillJob,
  type ProcessBackfillJobDeps,
  type SourceSyncRunner,
} from '../../src/use-cases/process-backfill-job.use-case.js';

function makeRunner(bySource: Record<string, SyncWorkFromSourceOutput>): SourceSyncRunner {
  return {
    async execute({ source }) {
      return bySource[source] ?? { status: 'not_found' };
    },
  };
}

describe('ProcessBackfillJob', () => {
  it('stops at the first source that syncs successfully', async () => {
    const cache = new InMemoryCache();
    const calls: string[] = [];
    const runner: SourceSyncRunner = {
      async execute({ source }) {
        calls.push(source);
        if (source === 'open-library') return { status: 'synced', workId: 'w1' };
        return { status: 'not_found' };
      },
    };
    const deps: ProcessBackfillJobDeps = {
      syncWorkFromSource: runner,
      cache,
      sources: ['open-library', 'google-books'],
    };
    const useCase = new ProcessBackfillJob(deps);

    const result = await useCase.execute({ query: 'War and Peace' });

    expect(result).toEqual({ status: 'synced', source: 'open-library' });
    expect(calls).toEqual(['open-library']);
  });

  it('records what it resolved, so a poll can be answered without a text match', async () => {
    const cache = new InMemoryCache();
    const runner: SourceSyncRunner = {
      async execute() {
        return {
          status: 'synced',
          workId: 'w1',
          work: {
            id: 'w1',
            originalTitle: 'Prestuplenie i nakazanie',
            author: 'Fyodor Dostoevsky',
            firstPublishedYear: 1866,
            coverUrl: null,
          },
        };
      },
    };
    const useCase = new ProcessBackfillJob({
      syncWorkFromSource: runner,
      cache,
      sources: ['open-library'],
    });

    await useCase.execute({ query: 'Преступление и наказание' });

    expect(await cache.get(searchResolutionCacheKey('Преступление и наказание'))).toEqual([
      {
        id: 'w1',
        originalTitle: 'Prestuplenie i nakazanie',
        author: 'Fyodor Dostoevsky',
        firstPublishedYear: 1866,
        coverUrl: null,
      },
    ]);
  });

  it('tries every source and marks the negative cache when all report not_found', async () => {
    const cache = new InMemoryCache();
    const deps: ProcessBackfillJobDeps = {
      syncWorkFromSource: makeRunner({}),
      cache,
      sources: ['open-library', 'google-books'],
    };
    const useCase = new ProcessBackfillJob(deps);

    const result = await useCase.execute({ query: 'Nonexistent Book' });

    expect(result).toEqual({ status: 'not_found' });
    expect(await cache.get(searchNegativeCacheKey('Nonexistent Book'))).toBe(true);
  });

  it('throws (so the queue retries) and skips the negative cache when a source errored', async () => {
    const cache = new InMemoryCache();
    const runner = makeRunner({
      'open-library': { status: 'error', error: 'timeout' },
      'google-books': { status: 'not_found' },
    });
    const deps: ProcessBackfillJobDeps = {
      syncWorkFromSource: runner,
      cache,
      sources: ['open-library', 'google-books'],
    };
    const useCase = new ProcessBackfillJob(deps);

    // A transient provider failure must FAIL the job, not complete it as not_found — a completed
    // job's deterministic id blocks every retry of the same query (found live in Phase 3).
    await expect(useCase.execute({ query: 'Some Book' })).rejects.toThrow(
      BackfillSourcesUnavailableError,
    );
    expect(await cache.get(searchNegativeCacheKey('Some Book'))).toBeNull();
  });

  it('answers not_found on the last attempt rather than throwing forever', async () => {
    // A source that is *permanently* unhappy — a keyless Google Books answering 429 to everything
    // — used to make every genuinely-missing book unanswerable: throw, retry, never cache, and the
    // reader's page polls until it gives up. Once the retries are spent, the reader gets an answer.
    const cache = new InMemoryCache();
    const runner = makeRunner({
      'open-library': { status: 'not_found' },
      'google-books': { status: 'error', error: 'HTTP 429' },
    });
    const deps: ProcessBackfillJobDeps = {
      syncWorkFromSource: runner,
      cache,
      sources: ['open-library', 'google-books'],
    };
    const useCase = new ProcessBackfillJob(deps);

    const result = await useCase.execute({ query: 'Some Book', lastAttempt: true });

    expect(result).toEqual({ status: 'not_found', degraded: true });
    expect(await cache.get(searchNegativeCacheKey('Some Book'))).toBe(true);
  });

  it('gives a degraded not_found a short life, not the full day a confirmed one gets', async () => {
    const cache = new InMemoryCache();
    const degradedDeps: ProcessBackfillJobDeps = {
      syncWorkFromSource: makeRunner({ 'google-books': { status: 'error', error: 'HTTP 429' } }),
      cache,
      sources: ['open-library', 'google-books'],
    };
    await new ProcessBackfillJob(degradedDeps).execute({ query: 'Shaky', lastAttempt: true });

    const confirmedDeps: ProcessBackfillJobDeps = {
      syncWorkFromSource: makeRunner({}),
      cache,
      sources: ['open-library', 'google-books'],
    };
    await new ProcessBackfillJob(confirmedDeps).execute({ query: 'Certain', lastAttempt: true });

    const degradedTtl = cache.ttlOf(searchNegativeCacheKey('Shaky'));
    const confirmedTtl = cache.ttlOf(searchNegativeCacheKey('Certain'));
    expect(degradedTtl).toBeLessThan(confirmedTtl!);
  });

  it('tries the second source when the first comes back not_found', async () => {
    const cache = new InMemoryCache();
    const runner = makeRunner({
      'open-library': { status: 'not_found' },
      'google-books': { status: 'synced', workId: 'w2' },
    });
    const deps: ProcessBackfillJobDeps = {
      syncWorkFromSource: runner,
      cache,
      sources: ['open-library', 'google-books'],
    };
    const useCase = new ProcessBackfillJob(deps);

    const result = await useCase.execute({ query: 'Some Book' });

    expect(result).toEqual({ status: 'synced', source: 'google-books' });
  });
});

describe('ProcessBackfillJob enrichment sources', () => {
  it('runs enrichment sources even after another source already won', async () => {
    // Gutenberg is the only source that yields downloadable files. Stopping at the first
    // successful source would mean a public domain book Open Library found first shows borrow
    // links and no way to just download it.
    const cache = new InMemoryCache();
    const calls: string[] = [];
    const runner: SourceSyncRunner = {
      async execute({ source }) {
        calls.push(source);
        return source === 'open-library'
          ? { status: 'synced', workId: 'w1' }
          : { status: 'not_found' };
      },
    };
    const useCase = new ProcessBackfillJob({
      syncWorkFromSource: runner,
      cache,
      sources: ['open-library', 'google-books'],
      enrichmentSources: ['gutenberg'],
    });

    const result = await useCase.execute({ query: 'War and Peace' });

    expect(result).toEqual({ status: 'synced', source: 'open-library' });
    expect(calls).toEqual(['open-library', 'gutenberg']);
  });

  it('tells each enrichment source which work it is enriching', async () => {
    // Without this, a source contributes to the discovered work only if it spells the title and
    // author identically — true for Gutenberg's English titles, false for a national library
    // catalogue whose records are translations. The BnF calls «Обитель» "L'archipel des Solovki",
    // which is a different natural key, so its French edition would have quietly become a second,
    // half-empty book on the site instead of an edition of the first.
    const cache = new InMemoryCache();
    const seen: { source: string; query: string; attachToWorkId?: string }[] = [];
    const runner: SourceSyncRunner = {
      async execute({ source, query, attachToWorkId }) {
        seen.push({ source, query, ...(attachToWorkId ? { attachToWorkId } : {}) });
        return source === 'open-library'
          ? {
              status: 'synced',
              workId: 'work-42',
              work: {
                id: 'work-42',
                originalTitle: 'Laurus',
                author: 'Eugene Vodolazkin',
                firstPublishedYear: 2012,
                coverUrl: null,
              },
            }
          : { status: 'not_found' };
      },
    };
    const useCase = new ProcessBackfillJob({
      syncWorkFromSource: runner,
      cache,
      sources: ['open-library'],
      enrichmentSources: ['bnf', 'dnb'],
    });

    await useCase.execute({ query: 'Лавр Водолазкин' });

    expect(seen).toEqual([
      { source: 'open-library', query: 'Лавр Водолазкин' },
      // Asked in the book's own words, not the reader's: a German catalogue files this novel as
      // "Laurus" by "Vodolazkin" and knows nothing at all by «Лавр Водолазкин».
      { source: 'bnf', query: 'Laurus Eugene Vodolazkin', attachToWorkId: 'work-42' },
      { source: 'dnb', query: 'Laurus Eugene Vodolazkin', attachToWorkId: 'work-42' },
    ]);
  });

  it('asks a source that drew a blank again, once the book has a canonical name', async () => {
    // «Моим легионерам» drew a blank at Open Library in both scripts, so discovery fell through to
    // Wikidata — which named the book *For My Legionaries* by Corneliu Zelea Codreanu, a name Open
    // Library does have, with editions. Without the second question the reader gets a page with no
    // editions, no translations and nowhere to buy it, which reads as the truth about the book
    // rather than as the truth about one spelling.
    const cache = new InMemoryCache();
    const asked: { source: string; query: string }[] = [];
    const runner: SourceSyncRunner = {
      async execute({ source, query }) {
        asked.push({ source, query });
        return source === 'wikidata'
          ? {
              status: 'synced',
              workId: 'work-7',
              work: {
                id: 'work-7',
                originalTitle: 'For My Legionaries',
                author: 'Corneliu Zelea Codreanu',
                firstPublishedYear: 1936,
                coverUrl: null,
              },
            }
          : { status: 'not_found' };
      },
    };

    await new ProcessBackfillJob({
      syncWorkFromSource: runner,
      cache,
      sources: ['open-library', 'gutenberg', 'wikidata'],
      enrichmentSources: ['gutenberg', 'bnf'],
    }).execute({ query: 'Моим легионерам' });

    expect(asked).toEqual([
      { source: 'open-library', query: 'Моим легионерам' },
      { source: 'gutenberg', query: 'Моим легионерам' },
      { source: 'wikidata', query: 'Моим легионерам' },
      // Gutenberg is both an enrichment source and a discovery source that drew a blank, and is
      // asked once for it rather than twice in a row.
      { source: 'gutenberg', query: 'For My Legionaries Corneliu Zelea Codreanu' },
      { source: 'bnf', query: 'For My Legionaries Corneliu Zelea Codreanu' },
      { source: 'open-library', query: 'For My Legionaries Corneliu Zelea Codreanu' },
    ]);
  });

  it('does not re-run the sources when the canonical name is what was already asked', async () => {
    // Re-running everything on a query that already worked doubles the cost of an ordinary search
    // and can buy nothing: the sources were asked the right question the first time.
    const cache = new InMemoryCache();
    const asked: string[] = [];
    const runner: SourceSyncRunner = {
      async execute({ source }) {
        asked.push(source);
        return source === 'google-books'
          ? {
              status: 'synced',
              workId: 'work-8',
              work: {
                id: 'work-8',
                originalTitle: 'War and Peace',
                author: 'Leo Tolstoy',
                firstPublishedYear: 1869,
                coverUrl: null,
              },
            }
          : { status: 'not_found' };
      },
    };

    await new ProcessBackfillJob({
      syncWorkFromSource: runner,
      cache,
      sources: ['open-library', 'google-books'],
      enrichmentSources: [],
    }).execute({ query: 'War and Peace Leo Tolstoy' });

    expect(asked).toEqual(['open-library', 'google-books']);
  });

  it('never lets an enrichment failure undo a successful sync', async () => {
    const cache = new InMemoryCache();
    const runner: SourceSyncRunner = {
      async execute({ source }) {
        if (source === 'gutenberg') throw new Error('gutenberg is down');
        return { status: 'synced', workId: 'w1' };
      },
    };
    const useCase = new ProcessBackfillJob({
      syncWorkFromSource: runner,
      cache,
      sources: ['open-library'],
      enrichmentSources: ['gutenberg'],
    });

    await expect(useCase.execute({ query: 'War and Peace' })).resolves.toEqual({
      status: 'synced',
      source: 'open-library',
    });
  });

  it('does not run the winner twice when it is also an enrichment source', async () => {
    const cache = new InMemoryCache();
    const calls: string[] = [];
    const runner: SourceSyncRunner = {
      async execute({ source }) {
        calls.push(source);
        return { status: 'synced', workId: 'w1' };
      },
    };
    const useCase = new ProcessBackfillJob({
      syncWorkFromSource: runner,
      cache,
      sources: ['gutenberg'],
      enrichmentSources: ['gutenberg'],
    });

    await useCase.execute({ query: 'War and Peace' });

    expect(calls).toEqual(['gutenberg']);
  });
});
