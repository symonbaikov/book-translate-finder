import type { CachePort } from '@golden/domain';
import { describe, expect, it, vi } from 'vitest';
import type { ResilientFetcher } from '../http/resilient-fetch.js';
import { LibriVoxProvider } from './librivox-provider.js';

function makeInMemoryCache(): CachePort {
  const store = new Map<string, unknown>();
  return {
    async get<T>(key: string) {
      return store.has(key) ? (store.get(key) as T) : null;
    },
    async set<T>(key: string, value: T) {
      store.set(key, value);
    },
    async del(key: string) {
      store.delete(key);
    },
    async deleteByPrefix(prefix: string) {
      for (const key of store.keys()) if (key.startsWith(prefix)) store.delete(key);
    },
  };
}

function makeFetcher(body: unknown, status: number): ResilientFetcher {
  return { fetch: vi.fn(async () => new Response(JSON.stringify(body), { status })) };
}

describe('LibriVoxProvider', () => {
  it('reads a 404 as an empty catalogue, not as a source failure', async () => {
    // The real API's answer for a book nobody has recorded, captured live: a 404 whose body says
    // exactly that. Throwing here used to fail the whole backfill job — which skipped the 24h
    // negative cache and left the query answering `pending` to the reader until the poll gave up.
    const fetcher = makeFetcher({ error: 'Audiobooks could not be found' }, 404);
    const provider = new LibriVoxProvider(fetcher, makeInMemoryCache(), 'test-agent');

    await expect(provider.searchWorks({ text: 'A Book Nobody Recorded' })).resolves.toEqual([]);
  });

  it('caches the empty answer, so a second sync of the same query costs no request', async () => {
    const fetcher = makeFetcher({ error: 'Audiobooks could not be found' }, 404);
    const provider = new LibriVoxProvider(fetcher, makeInMemoryCache(), 'test-agent');

    await provider.searchWorks({ text: 'A Book Nobody Recorded' });
    await provider.searchWorks({ text: 'A Book Nobody Recorded' });

    expect(fetcher.fetch).toHaveBeenCalledTimes(1);
  });

  it('still treats a server-side failure as a failure', async () => {
    // The distinction the fix rests on: 404 is an answer about the catalogue, 503 is the source
    // being unavailable — and only the second one should make a backfill retry.
    const fetcher = makeFetcher({}, 503);
    const provider = new LibriVoxProvider(fetcher, makeInMemoryCache(), 'test-agent');

    await expect(provider.searchWorks({ text: 'Pride and Prejudice' })).rejects.toThrow(
      /status 503/,
    );
  });

  it('maps a hit to a work with its language code and author', async () => {
    const fetcher = makeFetcher(
      {
        books: [
          {
            id: '253',
            title: 'Pride and Prejudice',
            authors: [{ first_name: 'Jane', last_name: 'Austen' }],
            language: 'English',
          },
        ],
      },
      200,
    );
    const provider = new LibriVoxProvider(fetcher, makeInMemoryCache(), 'test-agent');

    await expect(provider.searchWorks({ text: 'Pride and Prejudice' })).resolves.toEqual([
      {
        externalId: '253',
        title: 'Pride and Prejudice',
        authorNames: ['Jane Austen'],
        languages: ['en'],
        firstPublishedYear: null,
        editionCount: 1,
        coverUrl: null,
      },
    ]);
  });
});
