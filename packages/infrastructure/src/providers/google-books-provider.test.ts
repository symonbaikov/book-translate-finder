import type { CachePort } from '@btf/domain';
import { describe, expect, it, vi } from 'vitest';
import type { ResilientFetcher } from '../http/resilient-fetch.js';
import { GoogleBooksProvider } from './google-books-provider.js';

// Hand-built from Google Books' documented response shape — NOT a captured real response.
// Phase 0 found the anonymous API quota already exhausted before any real search could
// complete (docs/research/coverage-phase0.md), so unlike open-library-provider.test.ts this
// can't be verified against a genuine fixture. Verify against a real key before production use.
const SEARCH_RESPONSE = {
  items: [
    {
      id: 'abc123',
      volumeInfo: {
        title: 'War and Peace',
        authors: ['Leo Tolstoy'],
        language: 'en',
        publishedDate: '2007-01-01',
        publisher: 'Penguin Classics',
        industryIdentifiers: [
          { type: 'ISBN_13', identifier: '9780140447934' },
          { type: 'ISBN_10', identifier: '0140447938' },
        ],
      },
      saleInfo: { saleability: 'FOR_SALE', buyLink: 'https://books.google.com/books?id=abc123' },
    },
  ],
};

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

function makeFetcherReturning(body: unknown, status = 200): ResilientFetcher {
  return {
    fetch: vi.fn(async () => new Response(JSON.stringify(body), { status })),
  };
}

describe('GoogleBooksProvider.searchWorks', () => {
  it('maps each search result into a one-edition-implied ProviderWork', async () => {
    const fetcher = makeFetcherReturning(SEARCH_RESPONSE);
    const provider = new GoogleBooksProvider(fetcher, makeInMemoryCache());

    const results = await provider.searchWorks({ text: 'War and Peace Tolstoy' });

    expect(results).toEqual([
      {
        externalId: 'abc123',
        title: 'War and Peace',
        authorNames: ['Leo Tolstoy'],
        languages: ['en'],
        firstPublishedYear: 2007,
        editionCount: 1,
        coverUrl: null,
      },
    ]);
  });

  it('includes the API key as a query param when configured', async () => {
    const fetcher = makeFetcherReturning({ items: [] });
    const provider = new GoogleBooksProvider(fetcher, makeInMemoryCache(), 'test-key');

    await provider.searchWorks({ text: 'test' });

    const [url] = vi.mocked(fetcher.fetch).mock.calls[0] as [string];
    expect(new URL(url).searchParams.get('key')).toBe('test-key');
  });

  it('omits the key param when no API key is configured (self-host without one)', async () => {
    const fetcher = makeFetcherReturning({ items: [] });
    const provider = new GoogleBooksProvider(fetcher, makeInMemoryCache());

    await provider.searchWorks({ text: 'test' });

    const [url] = vi.mocked(fetcher.fetch).mock.calls[0] as [string];
    expect(new URL(url).searchParams.has('key')).toBe(false);
  });

  it('caches results and does not re-fetch for the same query', async () => {
    const fetcher = makeFetcherReturning({ items: [] });
    const provider = new GoogleBooksProvider(fetcher, makeInMemoryCache());

    await provider.searchWorks({ text: 'War and Peace' });
    await provider.searchWorks({ text: 'War and Peace' });

    expect(fetcher.fetch).toHaveBeenCalledTimes(1);
  });

  it('throws on a non-ok response — including the 429 quota-exhausted shape found in Phase 0', async () => {
    const fetcher = makeFetcherReturning({ error: { code: 429 } }, 429);
    const provider = new GoogleBooksProvider(fetcher, makeInMemoryCache());

    await expect(provider.searchWorks({ text: 'test' })).rejects.toThrow(/429/);
  });
});

describe('GoogleBooksProvider.fetchEditions', () => {
  it('fetches the single volume by id and extracts ISBNs + a buy link', async () => {
    const fetcher = makeFetcherReturning(SEARCH_RESPONSE.items[0]);
    const provider = new GoogleBooksProvider(fetcher, makeInMemoryCache());

    const results = await provider.fetchEditions('abc123');

    expect(results).toEqual([
      {
        externalId: 'abc123',
        title: 'War and Peace',
        language: 'en',
        coverUrl: null,
        translator: null,
        translatedFrom: null,
        publisher: 'Penguin Classics',
        year: 2007,
        isbn13: '9780140447934',
        isbn10: '0140447938',
        rightsSignal: 'unknown',
        link: { type: 'buy', url: 'https://books.google.com/books?id=abc123' },
      },
    ]);
  });

  it('omits `link` entirely when the volume is not for sale', async () => {
    const fetcher = makeFetcherReturning({
      id: 'xyz',
      volumeInfo: { title: 'Not For Sale' },
      saleInfo: { saleability: 'NOT_FOR_SALE' },
    });
    const provider = new GoogleBooksProvider(fetcher, makeInMemoryCache());

    const [edition] = await provider.fetchEditions('xyz');

    expect(edition!.link).toBeUndefined();
    expect('link' in edition!).toBe(false);
  });
});
