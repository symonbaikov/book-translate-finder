import type { CachePort } from '@golden/domain';
import { describe, expect, it, vi } from 'vitest';
import type { ResilientFetcher } from '../http/resilient-fetch.js';
import { PolishLibraryProvider } from './polish-library-provider.js';

function makeCache(): CachePort {
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

/**
 * One `bibs` entry in the shape the API really returns (captured live): the flat fields state the
 * language as the Polish word for it, and the MARC underneath states the code.
 */
const LAUR = {
  id: 4661111,
  language: 'polski',
  languageOfOriginal: 'rosyjski',
  title: 'Laur / Lavr,',
  author: 'Wodołazkin, Jewgienij (1964- ) Skórska, Ewa',
  marc: {
    leader: '02001nam a2200541 i 4500',
    fields: [
      { '001': 'b0000004661111' },
      { '008': '160419s2016    pl |||||||||000 0 pol  ' },
      { '020': { ind1: ' ', ind2: ' ', subfields: [{ a: '9788380491694' }] } },
      { '041': { ind1: '1', ind2: ' ', subfields: [{ a: 'pol' }, { h: 'rus' }] } },
      {
        '100': {
          ind1: '1',
          ind2: ' ',
          subfields: [{ a: 'Wodołazkin, Jewgienij' }, { d: '(1964- )' }],
        },
      },
      {
        '245': {
          ind1: '1',
          ind2: '0',
          subfields: [{ a: 'Laur /' }, { c: 'Jewgienij Wodołazkin ; przełożyła Ewa Skórska.' }],
        },
      },
      { '250': { ind1: ' ', ind2: ' ', subfields: [{ a: 'Wydanie pierwsze' }] } },
      {
        '260': {
          ind1: ' ',
          ind2: ' ',
          subfields: [{ a: 'Warszawa :' }, { b: 'Zysk i S-ka' }, { c: '2016.' }],
        },
      },
      { '300': { ind1: ' ', ind2: ' ', subfields: [{ a: '412 s. ;' }, { c: '21 cm.' }] } },
      {
        '700': {
          ind1: '1',
          ind2: ' ',
          subfields: [{ a: 'Skórska, Ewa' }, { e: 'Tłumaczenie' }],
        },
      },
    ],
  },
};

function fetcherReturning(bibs: unknown[]): ResilientFetcher {
  return {
    fetch: vi.fn(async () => Response.json({ bibs })),
  };
}

describe('PolishLibraryProvider', () => {
  it('reads the language as a code from the record’s own MARC, not the Polish word for it', async () => {
    // The flat JSON says "polski" and "rosyjski", which are facts about Polish rather than about
    // the book — `LanguageCode` would reject both.
    const provider = new PolishLibraryProvider(fetcherReturning([LAUR]), makeCache(), 'ua');

    const [work] = await provider.searchWorks({ text: 'Laur Wodołazkin' });
    const [edition] = await provider.fetchEditions(work!.externalId);

    expect(edition).toMatchObject({ language: 'pol', translatedFrom: 'rus' });
  });

  it('carries the edition statement and the translator through', async () => {
    const provider = new PolishLibraryProvider(fetcherReturning([LAUR]), makeCache(), 'ua');

    const [work] = await provider.searchWorks({ text: 'Laur Wodołazkin' });
    const [edition] = await provider.fetchEditions(work!.externalId);

    expect(edition).toMatchObject({
      title: 'Laur',
      publisher: 'Zysk i S-ka',
      year: 2016,
      isbn13: '9788380491694',
      editionStatement: 'Wydanie pierwsze',
      // This catalogue states no `$4` relator codes at all, so the role is read from `$e` in
      // Polish — the fallback the shared MARC rules leave open for exactly this.
      translator: 'Ewa Skórska',
    });
  });

  it('never offers a link, and has no work details to give', async () => {
    const provider = new PolishLibraryProvider(fetcherReturning([LAUR]), makeCache(), 'ua');

    const [work] = await provider.searchWorks({ text: 'Laur Wodołazkin' });
    const editions = await provider.fetchEditions(work!.externalId);

    expect(editions.every((edition) => edition.links === undefined)).toBe(true);
    await expect(provider.fetchWorkDetails()).resolves.toEqual({
      description: null,
      coverUrl: null,
      subjects: [],
    });
  });

  it('refuses a record by somebody the query does not name', async () => {
    // The API has no all-fields index, so an author lookup is the only question it can be asked —
    // and its answers still have to be about this book.
    const byAnother = {
      ...LAUR,
      marc: {
        ...LAUR.marc,
        fields: LAUR.marc.fields.map((field) =>
          '100' in field
            ? { '100': { ind1: '1', ind2: ' ', subfields: [{ a: 'Masłennikowa, Angelina' }] } }
            : field,
        ),
      },
    };
    const provider = new PolishLibraryProvider(fetcherReturning([byAnother]), makeCache(), 'ua');

    await expect(provider.searchWorks({ text: 'Laur Wodołazkin' })).resolves.toEqual([]);
  });

  it('asks about the words most likely to be the author, not the longest ones', async () => {
    // Only a few words are asked about, so their order decides what gets asked. Ranking by length
    // put "Adventures" and "Wonderland" ahead of "Carroll" and lost the whole of Lewis Carroll —
    // found by running the real sync, not by any test that existed at the time.
    const fetcher = fetcherReturning([]);
    const provider = new PolishLibraryProvider(fetcher, makeCache(), 'ua');

    await provider.searchWorks({ text: "Alice's Adventures in Wonderland Carroll, Lewis" });

    const asked = vi
      .mocked(fetcher.fetch)
      .mock.calls.map((call) => new URL(String(call[0])).searchParams.get('author'));
    expect(asked).toContain('Carroll');
    expect(asked[0]).toBe('Lewis');
  });

  it('always pairs the author with a title word, and sends no parameter it does not know', async () => {
    // Never the author alone: this API answers `author=Lewis` with everyone called Lewis, and the
    // author check cannot tell them apart because their author really is called Lewis. An
    // unrecognised parameter is also *ignored* rather than rejected, so a query it cannot express
    // comes back as a page of arbitrary books rather than as an error.
    const fetcher = fetcherReturning([LAUR]);
    const provider = new PolishLibraryProvider(fetcher, makeCache(), 'ua');

    await provider.searchWorks({ text: 'Laur Wodołazkin' });

    const urls = vi.mocked(fetcher.fetch).mock.calls.map((call) => new URL(String(call[0])));
    expect(
      urls.map((url) => [url.searchParams.get('author'), url.searchParams.get('title')]),
    ).toEqual([['Wodołazkin', 'Laur']]);
    expect(
      urls.every((url) =>
        [...url.searchParams.keys()].every((key) => ['author', 'title', 'limit'].includes(key)),
      ),
    ).toBe(true);
  });

  it('asks nothing at all when the query cannot name both a book and an author', async () => {
    // One word can only be one half. Sending it as an author would be the very thing that
    // attached *Liar's Poker* to *Alice in Wonderland*; contributing nothing is the right answer.
    const fetcher = fetcherReturning([LAUR]);
    const provider = new PolishLibraryProvider(fetcher, makeCache(), 'ua');

    await expect(provider.searchWorks({ text: 'Wodołazkin' })).resolves.toEqual([]);
    expect(fetcher.fetch).not.toHaveBeenCalled();
  });

  it('fails loudly when the catalogue is down, rather than reporting a half-empty shelf', async () => {
    const fetcher: ResilientFetcher = {
      fetch: vi.fn(async () => new Response('', { status: 503 })),
    };
    const provider = new PolishLibraryProvider(fetcher, makeCache(), 'ua');

    await expect(provider.searchWorks({ text: 'Laur Wodołazkin' })).rejects.toThrow(/503/);
  });
});
