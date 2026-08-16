import type { CachePort, ReviewLinkQuery } from '@golden/domain';
import { describe, expect, it, vi } from 'vitest';
import type { ResilientFetcher } from '../http/resilient-fetch.js';
import { OpenLibraryReviewLinkProvider } from './open-library-review-link.provider.js';

// Shape captured from a real keyless `api/books?bibkeys=…&jscmd=data` response — this endpoint
// needs no key, so unlike the Google Books fixtures these fields were verified live: the German
// `Der Graf von Monte Christo` really does answer with goodreads 1560198, and `Il piccolo
// principe` really does carry a librarything id that is shared with a different printing.
const RESPONSE = {
  'ISBN:9783423126199': { identifiers: { goodreads: ['1560198'], openlibrary: ['OL1M'] } },
  'ISBN:9788845205118': { identifiers: { goodreads: ['71091'], librarything: ['11883'] } },
  'ISBN:9788423359400': { identifiers: { isbn_13: ['9788423359400'], openlibrary: ['OL2M'] } },
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
  return { fetch: vi.fn(async () => new Response(JSON.stringify(body), { status })) };
}

const QUERIES: ReviewLinkQuery[] = [
  { editionId: 'e1', isbn13: '9783423126199', isbn10: null },
  { editionId: 'e2', isbn13: '9788845205118', isbn10: null },
  { editionId: 'e3', isbn13: '9788423359400', isbn10: null },
];

function makeProvider(fetcher: ResilientFetcher, cache = makeInMemoryCache()) {
  return new OpenLibraryReviewLinkProvider(fetcher, cache, 'golden-library-test/1.0');
}

describe('OpenLibraryReviewLinkProvider', () => {
  it('builds a Goodreads link for each edition that has an id there', async () => {
    const links = await makeProvider(makeFetcherReturning(RESPONSE)).findLinks(QUERIES);

    expect(links).toEqual([
      {
        editionId: 'e1',
        providerId: 'goodreads',
        providerName: 'Goodreads',
        url: 'https://www.goodreads.com/book/show/1560198',
      },
      {
        editionId: 'e2',
        providerId: 'goodreads',
        providerName: 'Goodreads',
        url: 'https://www.goodreads.com/book/show/71091',
      },
    ]);
  });

  it('ignores the LibraryThing id, which names a work rather than a printing', async () => {
    const links = await makeProvider(makeFetcherReturning(RESPONSE)).findLinks(QUERIES);

    expect(links.every((link) => !link.url.includes('librarything'))).toBe(true);
  });

  it('asks for every ISBN in one request', async () => {
    const fetcher = makeFetcherReturning(RESPONSE);

    await makeProvider(fetcher).findLinks(QUERIES);

    expect(fetcher.fetch).toHaveBeenCalledTimes(1);
    const requested = vi.mocked(fetcher.fetch).mock.calls[0]![0] as string;
    expect(requested).toContain('bibkeys=ISBN%3A9783423126199%2CISBN%3A9788845205118');
  });

  it('identifies itself, as Open Library asks keyless callers to', async () => {
    const fetcher = makeFetcherReturning(RESPONSE);

    await makeProvider(fetcher).findLinks(QUERIES);

    const init = vi.mocked(fetcher.fetch).mock.calls[0]![1];
    expect(init?.headers).toEqual({ 'User-Agent': 'golden-library-test/1.0' });
  });

  it('never asks about an edition with no ISBN, and asks nothing at all when none has one', async () => {
    const fetcher = makeFetcherReturning(RESPONSE);

    const links = await makeProvider(fetcher).findLinks([
      { editionId: 'e1', isbn13: null, isbn10: null },
    ]);

    expect(links).toEqual([]);
    expect(fetcher.fetch).not.toHaveBeenCalled();
  });

  it('falls back to the ISBN-10 when an edition carries no ISBN-13', async () => {
    const fetcher = makeFetcherReturning({
      'ISBN:0140447938': { identifiers: { goodreads: ['656'] } },
    });

    const links = await makeProvider(fetcher).findLinks([
      { editionId: 'e1', isbn13: null, isbn10: '0140447938' },
    ]);

    expect(links[0]!.url).toBe('https://www.goodreads.com/book/show/656');
  });

  it('refuses an id that is not digits, so nothing from a source reaches the URL', async () => {
    const fetcher = makeFetcherReturning({
      'ISBN:9783423126199': {
        identifiers: { goodreads: ['https://evil.example/book/show/1?x='] },
      },
    });

    expect(await makeProvider(fetcher).findLinks([QUERIES[0]!])).toEqual([]);
  });

  it('serves a repeat page load from cache, including the editions with no id', async () => {
    const fetcher = makeFetcherReturning(RESPONSE);
    const cache = makeInMemoryCache();

    await makeProvider(fetcher, cache).findLinks(QUERIES);
    const second = await makeProvider(fetcher, cache).findLinks(QUERIES);

    expect(fetcher.fetch).toHaveBeenCalledTimes(1);
    expect(second.map((link) => link.editionId)).toEqual(['e1', 'e2']);
  });

  it('fails loudly on an HTTP error, so the caller can report a degraded source', async () => {
    const provider = makeProvider(makeFetcherReturning({ error: 'nope' }, 503));

    await expect(provider.findLinks(QUERIES)).rejects.toThrow(/503/);
  });
});
