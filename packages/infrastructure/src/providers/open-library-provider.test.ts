import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { CachePort } from '@btf/domain';
import { describe, expect, it, vi } from 'vitest';
import type { ResilientFetcher } from '../http/resilient-fetch.js';
import { OpenLibraryProvider } from './open-library-provider.js';

const fixturesDir = fileURLToPath(new URL('../../../../docs/research/fixtures', import.meta.url));
const readFixture = (name: string): unknown =>
  JSON.parse(readFileSync(`${fixturesDir}/${name}`, 'utf8'));

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

/** Routes each call by matching a substring against the request URL — lets a single test mock
 * both the editions.json call and the availability lookup with different bodies. */
function makeFetcherRouting(routes: [string, unknown][]): ResilientFetcher {
  return {
    fetch: vi.fn(async (url: string) => {
      const match = routes.find(([substring]) => url.includes(substring));
      if (!match) throw new Error(`No mock route for ${url}`);
      return new Response(JSON.stringify(match[1]), { status: 200 });
    }),
  };
}

function editionEntry(olid: string, overrides: Record<string, unknown> = {}) {
  return { key: `/books/${olid}`, title: 'Test Edition', ...overrides };
}

/** `fetchEditions` always looks up the work's `ia` list — route it explicitly in every test that
 * doesn't care about that path, so `makeFetcherRouting`'s unmatched-route guard doesn't fire. */
const NO_IA_ROUTE: [string, unknown] = ['search.json', { docs: [{ ia: [] }] }];

describe('OpenLibraryProvider.searchWorks', () => {
  it('maps a real Open Library search response into ProviderWork DTOs', async () => {
    const fixture = readFixture('open-library-search-classic.json');
    const fetcher = makeFetcherReturning(fixture);
    const provider = new OpenLibraryProvider(fetcher, makeInMemoryCache(), 'test-agent');

    const results = await provider.searchWorks({ text: 'The Picture of Dorian Gray Oscar Wilde' });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toMatchObject({
      externalId: '/works/OL8193416W',
      title: 'The Picture of Dorian Gray',
      authorNames: ['Oscar Wilde'],
    });
    expect(results[0]!.languages.length).toBeGreaterThan(3);
  });

  it('sends a plain-text query, never field-scoped (docs/research/coverage-phase0.md)', async () => {
    const fetcher = makeFetcherReturning({ docs: [] });
    const provider = new OpenLibraryProvider(fetcher, makeInMemoryCache(), 'test-agent');

    await provider.searchWorks({ text: 'War and Peace Tolstoy' });

    const [url] = vi.mocked(fetcher.fetch).mock.calls[0] as [string];
    const q = new URL(url).searchParams.get('q');
    expect(q).toBe('War and Peace Tolstoy');
    expect(q).not.toContain('title:');
    expect(q).not.toContain('author:');
  });

  it('sends the given User-Agent header (docs/legal-policy.md §4)', async () => {
    const fetcher = makeFetcherReturning({ docs: [] });
    const provider = new OpenLibraryProvider(
      fetcher,
      makeInMemoryCache(),
      'BookTranslateFinder/0.1 (+contact)',
    );

    await provider.searchWorks({ text: 'test' });

    const [, init] = vi.mocked(fetcher.fetch).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['User-Agent']).toBe(
      'BookTranslateFinder/0.1 (+contact)',
    );
  });

  it('caches results and does not re-fetch for the same query', async () => {
    const fetcher = makeFetcherReturning({ docs: [] });
    const provider = new OpenLibraryProvider(fetcher, makeInMemoryCache(), 'test-agent');

    await provider.searchWorks({ text: 'War and Peace' });
    await provider.searchWorks({ text: 'War and Peace' });

    expect(fetcher.fetch).toHaveBeenCalledTimes(1);
  });

  it('throws on a non-ok response instead of silently returning nothing', async () => {
    const fetcher = makeFetcherReturning({}, 503);
    const provider = new OpenLibraryProvider(fetcher, makeInMemoryCache(), 'test-agent');

    await expect(provider.searchWorks({ text: 'test' })).rejects.toThrow(/503/);
  });
});

describe('OpenLibraryProvider.fetchEditions', () => {
  it('maps a real editions response, extracting the structured translator field', async () => {
    const fixture = readFixture('open-library-editions-with-translators.json');
    const fetcher = makeFetcherReturning(fixture);
    const provider = new OpenLibraryProvider(fetcher, makeInMemoryCache(), 'test-agent');

    const results = await provider.fetchEditions('/works/OL8193416W');

    expect(results.length).toBeGreaterThan(0);
    const withTranslator = results.find((e) => e.translator !== null);
    expect(withTranslator).toBeDefined();
    // Every edition mapped honestly declines to guess a rights status — see the comment in
    // open-library-provider.ts on why editions.json has no reliable per-edition signal.
    expect(results.every((e) => e.rightsSignal === 'unknown')).toBe(true);
    expect(results.every((e) => e.links === undefined)).toBe(true);
  });

  it('caches editions per work id', async () => {
    // Same generic body for every call: editions.json sees {entries: []}, and the ia lookup
    // (also always fired) sees the same shape, which has no `docs` — an empty ia list.
    const fetcher = makeFetcherReturning({ entries: [] });
    const provider = new OpenLibraryProvider(fetcher, makeInMemoryCache(), 'test-agent');

    await provider.fetchEditions('/works/OL1W');
    await provider.fetchEditions('/works/OL1W');
    await provider.fetchEditions('/works/OL2W');

    // 2 network calls per uncached work id (editions.json + the work-ia lookup), 0 for the
    // repeated call — see fetchWorkIaIds's doc comment for why the ia lookup can't be skipped.
    expect(fetcher.fetch).toHaveBeenCalledTimes(4);
  });
});

describe('OpenLibraryProvider.fetchEditions paging', () => {
  /** Serves `size` editions in pages of `pageSize`, honouring the requested `offset`. */
  function makePagingFetcher(size: number, pageSize: number): ResilientFetcher {
    return {
      fetch: vi.fn(async (url: string) => {
        if (url.includes('search.json')) {
          return new Response(JSON.stringify({ docs: [{ ia: [] }] }), { status: 200 });
        }
        const offset = Number(new URL(url).searchParams.get('offset') ?? 0);
        const entries = Array.from(
          { length: Math.max(0, Math.min(pageSize, size - offset)) },
          (_, i) =>
            editionEntry(`OL${offset + i}M`, { languages: [{ key: `/languages/l${offset + i}` }] }),
        );
        return new Response(JSON.stringify({ size, entries }), { status: 200 });
      }),
    };
  }

  it('walks every page instead of stopping at the first one', async () => {
    // The bug this guards: taking only the first page. Open Library returns editions in no
    // meaningful order, so for a heavily reprinted classic the first page is nearly all English
    // reprints — measured live on "1984", the first 50 of 536 editions carry 10 languages while
    // the full set carries 23.
    const provider = new OpenLibraryProvider(
      makePagingFetcher(1200, 500),
      makeInMemoryCache(),
      'a',
    );

    const results = await provider.fetchEditions('/works/OL1W');

    expect(results).toHaveLength(1000); // MAX_EDITIONS, the deliberate hard stop
  });

  it('keeps paging when the server silently serves a smaller page than requested', async () => {
    // Observed live: a `limit=500` request for /works/OL1168083W came back with 50 entries even
    // though the work has 536. Treating a short page as "the last page" truncated the work to 48
    // editions and 10 languages, so the loop trusts the response's own `size` instead.
    const provider = new OpenLibraryProvider(makePagingFetcher(536, 50), makeInMemoryCache(), 'a');

    const results = await provider.fetchEditions('/works/OL1W');

    expect(results).toHaveLength(536);
  });

  it('stops on an empty page even when `size` claims there is more', async () => {
    // Without this, a `size` that can never be reached (a filtered or deleted record) would spin
    // all the way to MAX_EDITIONS, firing a request per page against someone else's API.
    const fetcher: ResilientFetcher = {
      fetch: vi.fn(async (url: string) => {
        if (url.includes('search.json')) {
          return new Response(JSON.stringify({ docs: [{ ia: [] }] }), { status: 200 });
        }
        return new Response(JSON.stringify({ size: 9999, entries: [] }), { status: 200 });
      }),
    };
    const provider = new OpenLibraryProvider(fetcher, makeInMemoryCache(), 'a');

    await expect(provider.fetchEditions('/works/OL1W')).resolves.toEqual([]);
    // One editions page + the work-ia lookup, and nothing more.
    expect(fetcher.fetch).toHaveBeenCalledTimes(2);
  });
});

describe('OpenLibraryProvider.fetchEditions availability (Open Library Lending)', () => {
  it('maps an exact "full access" match to a public-domain download link from internet-archive', async () => {
    const fetcher = makeFetcherRouting([
      ['editions.json', { entries: [editionEntry('OL1M')] }],
      [
        '/api/volumes/brief/json/',
        {
          'olid:OL1M': {
            items: [
              {
                match: 'exact',
                status: 'full access',
                'ol-edition-id': 'OL1M',
                itemURL: 'https://archive.org/details/foo',
              },
            ],
          },
        },
      ],
      NO_IA_ROUTE,
    ]);
    const provider = new OpenLibraryProvider(fetcher, makeInMemoryCache(), 'test-agent');

    const [edition] = await provider.fetchEditions('/works/OL1W');

    expect(edition?.rightsSignal).toBe('public_domain');
    expect(edition?.links?.[0]).toEqual({
      type: 'download',
      url: 'https://archive.org/details/foo',
      provider: 'internet-archive',
    });
  });

  it.each(['lendable', 'checked out'])(
    'maps an exact "%s" match to a copyrighted borrow link from internet-archive',
    async (status) => {
      const fetcher = makeFetcherRouting([
        ['editions.json', { entries: [editionEntry('OL2M')] }],
        [
          '/api/volumes/brief/json/',
          {
            'olid:OL2M': {
              items: [
                {
                  match: 'exact',
                  status,
                  'ol-edition-id': 'OL2M',
                  itemURL: 'https://archive.org/details/bar',
                },
              ],
            },
          },
        ],
        NO_IA_ROUTE,
      ]);
      const provider = new OpenLibraryProvider(fetcher, makeInMemoryCache(), 'test-agent');

      const [edition] = await provider.fetchEditions('/works/OL2W');

      expect(edition?.rightsSignal).toBe('copyrighted');
      expect(edition?.links?.[0]).toEqual({
        type: 'borrow',
        url: 'https://archive.org/details/bar',
        provider: 'internet-archive',
      });
    },
  );

  it('leaves the edition at "unknown" with no link when the status is "restricted"', async () => {
    const fetcher = makeFetcherRouting([
      ['editions.json', { entries: [editionEntry('OL3M')] }],
      [
        '/api/volumes/brief/json/',
        {
          'olid:OL3M': {
            items: [
              {
                match: 'exact',
                status: 'restricted',
                'ol-edition-id': 'OL3M',
                itemURL: 'https://archive.org/details/baz',
              },
            ],
          },
        },
      ],
      NO_IA_ROUTE,
    ]);
    const provider = new OpenLibraryProvider(fetcher, makeInMemoryCache(), 'test-agent');

    const [edition] = await provider.fetchEditions('/works/OL3W');

    expect(edition?.rightsSignal).toBe('unknown');
    expect(edition?.links?.[0]).toBeUndefined();
  });

  it('never attributes a "similar" match to the edition — only an exact match counts', async () => {
    const fetcher = makeFetcherRouting([
      ['editions.json', { entries: [editionEntry('OL4M')] }],
      [
        '/api/volumes/brief/json/',
        {
          'olid:OL4M': {
            items: [
              {
                match: 'similar',
                status: 'full access',
                'ol-edition-id': 'OL9999M',
                itemURL: 'https://archive.org/details/other-edition',
              },
            ],
          },
        },
      ],
      NO_IA_ROUTE,
    ]);
    const provider = new OpenLibraryProvider(fetcher, makeInMemoryCache(), 'test-agent');

    const [edition] = await provider.fetchEditions('/works/OL4W');

    expect(edition?.rightsSignal).toBe('unknown');
    expect(edition?.links?.[0]).toBeUndefined();
  });

  it('does not call the availability endpoint at all when there are no editions and no ia ids', async () => {
    const fetcher = makeFetcherReturning({ entries: [] });
    const provider = new OpenLibraryProvider(fetcher, makeInMemoryCache(), 'test-agent');

    await provider.fetchEditions('/works/OL5W');

    // editions.json + the work-ia lookup — no request keys left over for /api/volumes/brief.
    expect(fetcher.fetch).toHaveBeenCalledTimes(2);
  });

  it('fetches and appends an edition outside the batch when only its ocaid has an exact match', async () => {
    const fetcher = makeFetcherRouting([
      ['editions.json', { entries: [editionEntry('OL5M')] }], // fetched batch, no availability of its own
      ['search.json', { docs: [{ ia: ['scan001'] }] }],
      [
        '/api/volumes/brief/json/',
        {
          'olid:OL5M': {},
          'ocaid:scan001': {
            items: [
              {
                match: 'exact',
                status: 'full access',
                'ol-edition-id': 'OL6M', // not in the fetched batch at all
                itemURL: 'https://archive.org/details/scan001',
              },
            ],
          },
        },
      ],
      [
        '/books/OL6M.json',
        editionEntry('OL6M', { title: 'Extra Edition', languages: [{ key: '/languages/eng' }] }),
      ],
    ]);
    const provider = new OpenLibraryProvider(fetcher, makeInMemoryCache(), 'test-agent');

    const editions = await provider.fetchEditions('/works/OL5W');

    expect(editions).toHaveLength(2);
    const extra = editions.find((e) => e.externalId === '/books/OL6M');
    expect(extra).toMatchObject({
      title: 'Extra Edition',
      language: 'eng',
      rightsSignal: 'public_domain',
      links: [
        {
          type: 'download',
          url: 'https://archive.org/details/scan001',
          provider: 'internet-archive',
        },
      ],
    });
  });

  it('caps how many out-of-batch editions it fetches per sync (MAX_EXTRA_AVAILABILITY_EDITIONS)', async () => {
    const extraOlids = ['OLX1M', 'OLX2M', 'OLX3M', 'OLX4M', 'OLX5M', 'OLX6M'];
    const availabilityItems: Record<string, { items: unknown[] }> = {};
    for (const [i, olid] of extraOlids.entries()) {
      availabilityItems[`ocaid:scan${i}`] = {
        items: [
          {
            match: 'exact',
            status: 'full access',
            'ol-edition-id': olid,
            itemURL: `https://archive.org/details/scan${i}`,
          },
        ],
      };
    }
    const fetcher = makeFetcherRouting([
      ['editions.json', { entries: [] }],
      ['search.json', { docs: [{ ia: extraOlids.map((_, i) => `scan${i}`) }] }],
      ['/api/volumes/brief/json/', availabilityItems],
      [
        '/books/',
        editionEntry('OLXNM', { title: 'Extra', languages: [{ key: '/languages/eng' }] }),
      ],
    ]);
    const provider = new OpenLibraryProvider(fetcher, makeInMemoryCache(), 'test-agent');

    const editions = await provider.fetchEditions('/works/OL6W');

    // 6 exact matches found, but only MAX_EXTRA_AVAILABILITY_EDITIONS (5) get fetched and appended.
    expect(editions).toHaveLength(5);
  });
});
