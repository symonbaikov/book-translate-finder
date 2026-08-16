import type { CachePort, RatingQuery } from '@golden/domain';
import { describe, expect, it, vi } from 'vitest';
import type { ResilientFetcher } from '../http/resilient-fetch.js';
import { GoogleBooksRatingProvider } from './google-books-rating.provider.js';

// Hand-built from Google Books' documented response shape — NOT a captured real response, for the
// same reason google-books-provider.test.ts says so: the keyless quota is permanently exhausted
// and this repository has no key configured (docs/research/coverage-phase0.md). How many real
// translated editions actually carry `averageRating` is therefore unmeasured — see the note in
// docs/plan.md next to this feature.
const RATED_VOLUME = {
  items: [
    {
      id: 'abc123',
      volumeInfo: {
        title: 'Война и мир',
        averageRating: 4.5,
        ratingsCount: 212,
        infoLink: 'https://books.google.com/books?id=abc123&source=gbs_api',
        canonicalVolumeLink: 'https://books.google.com/books/about/?id=abc123',
      },
    },
  ],
};

function makeInMemoryCache(): CachePort & { store: Map<string, unknown> } {
  const store = new Map<string, unknown>();
  return {
    store,
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
  return { fetch: vi.fn(async () => new Response(JSON.stringify(body), { status })) };
}

const QUERY: RatingQuery = {
  isbn13: '9785171147426',
  isbn10: null,
  title: 'Война и мир',
  author: 'Лев Толстой',
  language: 'ru',
};

describe('GoogleBooksRatingProvider', () => {
  it('reads the average, the vote count and a link to the reviews', async () => {
    const fetcher = makeFetcherReturning(RATED_VOLUME);
    const provider = new GoogleBooksRatingProvider(fetcher, makeInMemoryCache(), 'test-key');

    const result = await provider.rate(QUERY);

    expect(result).not.toBeNull();
    expect(result!.providerId).toBe('google-books');
    expect(result!.providerName).toBe('Google Books');
    expect(result!.rating.average).toBe(4.5);
    expect(result!.rating.votes).toBe(212);
    expect(result!.rating.outOf).toBe(5);
    expect(result!.url).toBe('https://books.google.com/books/about/?id=abc123');
  });

  it('looks the edition up by its ISBN, never by title', async () => {
    const fetcher = makeFetcherReturning(RATED_VOLUME);
    const provider = new GoogleBooksRatingProvider(fetcher, makeInMemoryCache(), 'test-key');

    await provider.rate(QUERY);

    const requested = vi.mocked(fetcher.fetch).mock.calls[0]![0] as string;
    expect(requested).toContain('q=isbn%3A9785171147426');
    expect(requested).not.toContain(encodeURIComponent('Толстой'));
  });

  it('falls back to the ISBN-10 when an edition has no ISBN-13', async () => {
    const fetcher = makeFetcherReturning(RATED_VOLUME);
    const provider = new GoogleBooksRatingProvider(fetcher, makeInMemoryCache(), 'test-key');

    await provider.rate({ ...QUERY, isbn13: null, isbn10: '0140447938' });

    expect(vi.mocked(fetcher.fetch).mock.calls[0]![0]).toContain('q=isbn%3A0140447938');
  });

  it('asks nothing at all for an edition with no ISBN', async () => {
    const fetcher = makeFetcherReturning(RATED_VOLUME);
    const provider = new GoogleBooksRatingProvider(fetcher, makeInMemoryCache(), 'test-key');

    expect(await provider.rate({ ...QUERY, isbn13: null, isbn10: null })).toBeNull();
    expect(fetcher.fetch).not.toHaveBeenCalled();
  });

  it('answers null without a key instead of spending a request on a certain 429', async () => {
    const fetcher = makeFetcherReturning(RATED_VOLUME);
    const provider = new GoogleBooksRatingProvider(fetcher, makeInMemoryCache());

    expect(await provider.rate(QUERY)).toBeNull();
    expect(fetcher.fetch).not.toHaveBeenCalled();
  });

  it('ignores an average that nobody voted on', async () => {
    const fetcher = makeFetcherReturning({
      items: [{ id: 'x', volumeInfo: { averageRating: 4, ratingsCount: 0 } }],
    });
    const provider = new GoogleBooksRatingProvider(fetcher, makeInMemoryCache(), 'test-key');

    expect(await provider.rate(QUERY)).toBeNull();
  });

  it('ignores an average with no vote count at all', async () => {
    const fetcher = makeFetcherReturning({
      items: [{ id: 'x', volumeInfo: { averageRating: 4 } }],
    });
    const provider = new GoogleBooksRatingProvider(fetcher, makeInMemoryCache(), 'test-key');

    expect(await provider.rate(QUERY)).toBeNull();
  });

  it('skips unrated volumes and takes the first rated one', async () => {
    const fetcher = makeFetcherReturning({
      items: [
        { id: 'unrated', volumeInfo: { title: 'Reprint' } },
        { id: 'rated', volumeInfo: { averageRating: 3.5, ratingsCount: 9 } },
      ],
    });
    const provider = new GoogleBooksRatingProvider(fetcher, makeInMemoryCache(), 'test-key');

    expect((await provider.rate(QUERY))!.rating.average).toBe(3.5);
  });

  it('serves a second lookup for the same ISBN from cache', async () => {
    const fetcher = makeFetcherReturning(RATED_VOLUME);
    const provider = new GoogleBooksRatingProvider(fetcher, makeInMemoryCache(), 'test-key');

    await provider.rate(QUERY);
    const second = await provider.rate(QUERY);

    expect(fetcher.fetch).toHaveBeenCalledTimes(1);
    // Rebuilt from plain data: the class instance does not survive Redis (see `Money`'s note).
    expect(second!.rating.votes).toBe(212);
  });

  it('caches "no rating" too, so unrated editions stop costing quota', async () => {
    const fetcher = makeFetcherReturning({ items: [] });
    const provider = new GoogleBooksRatingProvider(fetcher, makeInMemoryCache(), 'test-key');

    expect(await provider.rate(QUERY)).toBeNull();
    expect(await provider.rate(QUERY)).toBeNull();
    expect(fetcher.fetch).toHaveBeenCalledTimes(1);
  });

  it('fails loudly on an HTTP error, so the caller can report a degraded source', async () => {
    const fetcher = makeFetcherReturning({ error: 'quota' }, 429);
    const provider = new GoogleBooksRatingProvider(fetcher, makeInMemoryCache(), 'test-key');

    await expect(provider.rate(QUERY)).rejects.toThrow(/429/);
  });
});
