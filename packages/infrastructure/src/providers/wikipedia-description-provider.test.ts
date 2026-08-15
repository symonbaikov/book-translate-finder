import type { CachePort } from '@golden/domain';
import { describe, expect, it } from 'vitest';
import type { ResilientFetcher } from '../http/resilient-fetch.js';
import { WikipediaDescriptionProvider } from './wikipedia-description-provider.js';

/** Same local fake the other provider tests use — `packages/domain`'s test fakes are outside this
 * package's tsconfig, and one shared fake is not worth widening the project graph for. */
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

/** Answers by URL fragment, and records every URL asked for — the routing *is* the behaviour here. */
class StubFetcher implements ResilientFetcher {
  readonly requested: string[] = [];

  constructor(private readonly routes: { match: string; body: unknown; status?: number }[]) {}

  async fetch(url: string): Promise<Response> {
    this.requested.push(url);
    const route = this.routes.find((r) => url.includes(r.match));
    if (!route) return new Response('not stubbed', { status: 404 });
    return new Response(JSON.stringify(route.body), { status: route.status ?? 200 });
  }
}

const ENTITY_FOUND = {
  match: 'srsearch=haswbstatement',
  body: { query: { search: [{ title: 'Q161531' }] } },
};

const SITELINK_RU = {
  match: 'wbgetentities',
  body: {
    entities: { Q161531: { sitelinks: { ruwiki: { title: 'Война и мир' } } } },
  },
};

const EXTRACT_RU = {
  match: 'ru.wikipedia.org',
  body: {
    query: {
      pages: {
        '123': {
          title: 'Война и мир',
          extract: '«Война и мир» — роман-эпопея Льва Николаевича Толстого.',
        },
      },
    },
  },
};

function provider(routes: { match: string; body: unknown; status?: number }[]) {
  const fetcher = new StubFetcher(routes);
  return {
    fetcher,
    make(cache = makeInMemoryCache()) {
      return new WikipediaDescriptionProvider(fetcher, cache, 'GoldenLibrary-test');
    },
  };
}

describe('WikipediaDescriptionProvider', () => {
  it('walks Open Library id → Wikidata entity → article and returns the lead with its URL', async () => {
    const { make } = provider([ENTITY_FOUND, SITELINK_RU, EXTRACT_RU]);

    const result = await make().fetchDescription({
      openLibraryWorkId: '/works/OL267096W',
      language: 'ru',
    });

    expect(result).toEqual({
      text: '«Война и мир» — роман-эпопея Льва Николаевича Толстого.',
      language: 'ru',
      sourceName: 'wikipedia',
      sourceUrl:
        'https://ru.wikipedia.org/wiki/%D0%92%D0%BE%D0%B9%D0%BD%D0%B0_%D0%B8_%D0%BC%D0%B8%D1%80',
    });
  });

  it('matches on the bare olid, since external_ref stores Open Library’s "/works/…" key', async () => {
    const { fetcher, make } = provider([ENTITY_FOUND, SITELINK_RU, EXTRACT_RU]);

    await make().fetchDescription({ openLibraryWorkId: '/works/OL267096W', language: 'ru' });

    expect(fetcher.requested[0]).toContain('P648%3DOL267096W');
  });

  it('returns null when Wikidata knows the book but there is no article in that language', async () => {
    const { make } = provider([
      ENTITY_FOUND,
      { match: 'wbgetentities', body: { entities: { Q161531: { sitelinks: {} } } } },
    ]);

    const result = await make().fetchDescription({
      openLibraryWorkId: 'OL267096W',
      language: 'ru',
    });

    expect(result).toBeNull();
  });

  it('returns null when no Wikidata entity records this Open Library id', async () => {
    const { make } = provider([
      { match: 'srsearch=haswbstatement', body: { query: { search: [] } } },
    ]);

    expect(
      await make().fetchDescription({ openLibraryWorkId: 'OL999999W', language: 'ru' }),
    ).toBeNull();
  });

  it('never invents a description from an unrelated search hit', async () => {
    // A non-item title in the search index must be rejected rather than passed on as an entity id.
    const { make } = provider([
      {
        match: 'srsearch=haswbstatement',
        body: { query: { search: [{ title: 'Help:Contents' }] } },
      },
    ]);

    expect(
      await make().fetchDescription({ openLibraryWorkId: 'OL267096W', language: 'ru' }),
    ).toBeNull();
  });

  it('rejects an id that is not an Open Library key without asking anyone', async () => {
    const { fetcher, make } = provider([ENTITY_FOUND, SITELINK_RU, EXTRACT_RU]);

    expect(await make().fetchDescription({ openLibraryWorkId: 'gb-1', language: 'ru' })).toBeNull();
    expect(fetcher.requested).toEqual([]);
  });

  it('returns null for a page Wikipedia reports as missing', async () => {
    const { make } = provider([
      ENTITY_FOUND,
      SITELINK_RU,
      { match: 'ru.wikipedia.org', body: { query: { pages: { '-1': { missing: '' } } } } },
    ]);

    expect(
      await make().fetchDescription({ openLibraryWorkId: 'OL267096W', language: 'ru' }),
    ).toBeNull();
  });

  it('swallows a source failure — a card without a blurb beats a card that will not render', async () => {
    const { make } = provider([{ match: 'srsearch=haswbstatement', body: {}, status: 503 }]);

    expect(
      await make().fetchDescription({ openLibraryWorkId: 'OL267096W', language: 'ru' }),
    ).toBeNull();
  });

  it('caches the answer, so a second reader of the same card costs no requests', async () => {
    const { fetcher, make } = provider([ENTITY_FOUND, SITELINK_RU, EXTRACT_RU]);
    const subject = make();

    await subject.fetchDescription({ openLibraryWorkId: 'OL267096W', language: 'ru' });
    const requestsAfterFirst = fetcher.requested.length;
    await subject.fetchDescription({ openLibraryWorkId: 'OL267096W', language: 'ru' });

    expect(fetcher.requested).toHaveLength(requestsAfterFirst);
  });

  it('caches a miss too, so an undescribed book is not re-walked on every view', async () => {
    const { fetcher, make } = provider([
      { match: 'srsearch=haswbstatement', body: { query: { search: [] } } },
    ]);
    const subject = make();

    await subject.fetchDescription({ openLibraryWorkId: 'OL999999W', language: 'ru' });
    await subject.fetchDescription({ openLibraryWorkId: 'OL999999W', language: 'ru' });

    expect(fetcher.requested).toHaveLength(1);
  });

  it('keeps a long lead to whole paragraphs rather than cutting mid-sentence', async () => {
    const paragraph = 'а'.repeat(700);
    const { make } = provider([
      ENTITY_FOUND,
      SITELINK_RU,
      {
        match: 'ru.wikipedia.org',
        body: {
          query: {
            pages: { '1': { extract: `${paragraph}\n${paragraph}\nПоследний абзац.` } },
          },
        },
      },
    ]);

    const result = await make().fetchDescription({
      openLibraryWorkId: 'OL267096W',
      language: 'ru',
    });

    // Two of these paragraphs exceed the blurb budget, so the second is dropped whole — the cut
    // never lands inside a sentence.
    expect(result?.text).toBe(paragraph);
  });

  it('keeps a short lead’s paragraphs, separated so they read as paragraphs', async () => {
    const { make } = provider([
      ENTITY_FOUND,
      SITELINK_RU,
      {
        match: 'ru.wikipedia.org',
        body: { query: { pages: { '1': { extract: 'Первый абзац.\n\nВторой абзац.' } } } },
      },
    ]);

    const result = await make().fetchDescription({
      openLibraryWorkId: 'OL267096W',
      language: 'ru',
    });

    expect(result?.text).toBe('Первый абзац.\n\nВторой абзац.');
  });
});
