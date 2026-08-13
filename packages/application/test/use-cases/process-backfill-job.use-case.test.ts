import { describe, expect, it } from 'vitest';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import { searchNegativeCacheKey } from '../../src/use-cases/search-works.use-case.js';
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
