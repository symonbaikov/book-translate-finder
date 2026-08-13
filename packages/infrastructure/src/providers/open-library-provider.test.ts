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
    expect(results.every((e) => e.link === undefined)).toBe(true);
  });

  it('caches editions per work id', async () => {
    const fetcher = makeFetcherReturning({ entries: [] });
    const provider = new OpenLibraryProvider(fetcher, makeInMemoryCache(), 'test-agent');

    await provider.fetchEditions('/works/OL1W');
    await provider.fetchEditions('/works/OL1W');
    await provider.fetchEditions('/works/OL2W');

    expect(fetcher.fetch).toHaveBeenCalledTimes(2);
  });
});
