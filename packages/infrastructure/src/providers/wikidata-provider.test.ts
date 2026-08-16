import type { CachePort } from '@golden/domain';
import { describe, expect, it, vi } from 'vitest';
import type { ResilientFetcher } from '../http/resilient-fetch.js';
import { WikidataProvider } from './wikidata-provider.js';

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

function bind(values: Record<string, string>): Record<string, { value: string }> {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, { value }]));
}

const item = (qid: string): string => `http://www.wikidata.org/entity/${qid}`;

/**
 * Routes by what the request is: the entity search is a GET to `api.php`, everything else is the
 * SPARQL endpoint. `searches` is consumed one attempt at a time, so a test can say "the whole
 * query finds nothing, the query without its last word finds something".
 */
function makeFetcher(options: {
  searches: string[][];
  sparql?: Record<string, string>[];
}): ResilientFetcher & { searchTerms: string[] } {
  const searchTerms: string[] = [];
  let attempt = 0;
  const fetcher = {
    searchTerms,
    fetch: vi.fn(async (url: string) => {
      if (url.includes('api.php')) {
        searchTerms.push(new URL(url).searchParams.get('search') ?? '');
        const ids = options.searches[attempt] ?? [];
        attempt += 1;
        return new Response(JSON.stringify({ search: ids.map((id) => ({ id })) }), { status: 200 });
      }
      return new Response(
        JSON.stringify({ results: { bindings: (options.sparql ?? []).map(bind) } }),
        { status: 200 },
      );
    }),
  };
  return fetcher;
}

describe('WikidataProvider', () => {
  it('returns the book with its author, original language and first publication', async () => {
    const fetcher = makeFetcher({
      searches: [['Q18117395']],
      sparql: [
        {
          item: item('Q18117395'),
          itemLabel: 'The Monastery (Prilepin novel)',
          authorLabel: 'Zakhar Prilepin',
          langCode: 'ru',
          date: '+2014-00-00T00:00:00Z',
          genreLabel: 'historical fiction',
        },
      ],
    });
    const provider = new WikidataProvider(fetcher, makeCache(), 'ua');

    await expect(provider.searchWorks({ text: 'Обитель Прилепин' })).resolves.toEqual([
      {
        externalId: 'Q18117395',
        title: 'The Monastery (Prilepin novel)',
        authorNames: ['Zakhar Prilepin'],
        languages: ['ru'],
        firstPublishedYear: 2014,
        editionCount: 0,
        coverUrl: null,
      },
    ]);
  });

  it('drops trailing words until the label search finds something', async () => {
    // Wikidata matches labels and aliases, not free text: it knows «Обитель» and has never heard
    // of "Обитель Прилепин". Every query this project makes is a title and an author glued
    // together, so without walking back toward the bare title the book is simply never found.
    const fetcher = makeFetcher({
      searches: [[], ['Q18117395']],
      sparql: [
        {
          item: item('Q18117395'),
          itemLabel: 'The Monastery (Prilepin novel)',
          authorLabel: 'Zakhar Prilepin',
        },
      ],
    });
    const provider = new WikidataProvider(fetcher, makeCache(), 'ua');

    const works = await provider.searchWorks({ text: 'Обитель Прилепин' });

    expect(fetcher.searchTerms).toEqual(['Обитель Прилепин', 'Обитель']);
    expect(works[0]?.externalId).toBe('Q18117395');
  });

  it('prefers the candidate whose author the reader actually named', async () => {
    // The bare title finds five different novels called «Обитель»; the rest of the query is what
    // chooses between them, and Wikidata's own label ranking must not overrule the reader.
    const fetcher = makeFetcher({
      searches: [['Q1', 'Q18117395']],
      sparql: [
        { item: item('Q1'), itemLabel: 'Обитель Ангелов', authorLabel: 'Kaori Yuki' },
        {
          item: item('Q18117395'),
          itemLabel: 'The Monastery (Prilepin novel)',
          authorLabel: 'Zakhar Prilepin',
        },
      ],
    });
    const provider = new WikidataProvider(fetcher, makeCache(), 'ua');

    const works = await provider.searchWorks({ text: 'Обитель Prilepin' });

    expect(works.map((work) => work.externalId)).toEqual(['Q18117395', 'Q1']);
  });

  it('folds the row-per-combination result set back into one book', async () => {
    // SPARQL returns the cross product of every optional value, so one novel with three genres
    // and two publication dates arrives six times.
    const fetcher = makeFetcher({
      searches: [['Q916423']],
      sparql: [
        {
          item: item('Q916423'),
          itemLabel: 'Metro 2033',
          authorLabel: 'Dmitry Glukhovsky',
          genreLabel: 'science fiction',
          date: '+2010-00-00T00:00:00Z',
        },
        {
          item: item('Q916423'),
          itemLabel: 'Metro 2033',
          authorLabel: 'Dmitry Glukhovsky',
          genreLabel: 'dystopian fiction',
          date: '+2007-00-00T00:00:00Z',
        },
      ],
    });
    const provider = new WikidataProvider(fetcher, makeCache(), 'ua');

    const works = await provider.searchWorks({ text: 'Metro 2033' });

    expect(works).toHaveLength(1);
    // The earliest date: a novel reprinted in 2010 was still first published in 2007.
    expect(works[0]?.firstPublishedYear).toBe(2007);
  });

  it('skips an edition with no language, which cannot go on a translation list', async () => {
    const fetcher = makeFetcher({
      searches: [[]],
      sparql: [
        {
          ed: item('Q100'),
          edLabel: 'Guerre et paix',
          langCode: 'fr',
          translatorLabel: 'Irina P.',
        },
        { ed: item('Q101'), edLabel: 'Untitled edition' },
      ],
    });
    const provider = new WikidataProvider(fetcher, makeCache(), 'ua');

    const editions = await provider.fetchEditions('Q161531');

    expect(editions).toHaveLength(1);
    expect(editions[0]).toMatchObject({ language: 'fr', translator: 'Irina P.' });
    // Wikidata describes books, it never hosts them — so nothing here can reach `LinkPolicy`.
    expect(editions[0]).not.toHaveProperty('links');
  });

  it('skips an edition whose label the label service could not resolve', async () => {
    // `wikibase:label` falls back to the entity id when an item has no label, and "Q126735031"
    // went into the database as an edition title and onto a page as the name of a book.
    const fetcher = makeFetcher({
      searches: [[]],
      sparql: [
        { ed: item('Q126735031'), edLabel: 'Q126735031', langCode: 'ru' },
        { ed: item('Q100'), edLabel: 'Guerre et paix', langCode: 'fr' },
      ],
    });
    const provider = new WikidataProvider(fetcher, makeCache(), 'ua');

    const editions = await provider.fetchEditions('Q161531');

    expect(editions.map((edition) => edition.title)).toEqual(['Guerre et paix']);
  });

  it('refuses an external id that is not an entity id, without any request', async () => {
    const fetcher = makeFetcher({ searches: [[]] });
    const provider = new WikidataProvider(fetcher, makeCache(), 'ua');

    await expect(provider.fetchEditions('/works/OL1W')).resolves.toEqual([]);
    expect(fetcher.fetch).not.toHaveBeenCalled();
  });

  it('fails loudly when Wikidata itself is down', async () => {
    const fetcher: ResilientFetcher = {
      fetch: vi.fn(async () => new Response('', { status: 503 })),
    };
    const provider = new WikidataProvider(fetcher, makeCache(), 'ua');

    await expect(provider.searchWorks({ text: 'anything' })).rejects.toThrow(/503/);
  });
});

/**
 * Routes the three requests `fetchEditions` now makes: the entity search, the SPARQL edition
 * query, and the sitelinks lookup that finds the free texts.
 */
function makeSitelinkFetcher(options: {
  sparql?: Record<string, string>[];
  sitelinks?: Record<string, { title: string; url: string }>;
  sitelinksStatus?: number;
}): ResilientFetcher {
  return {
    fetch: vi.fn(async (url: string) => {
      if (url.includes('wbgetentities')) {
        if (options.sitelinksStatus && options.sitelinksStatus !== 200) {
          return new Response('', { status: options.sitelinksStatus });
        }
        return new Response(
          JSON.stringify({ entities: { Q165318: { sitelinks: options.sitelinks ?? {} } } }),
          { status: 200 },
        );
      }
      if (url.includes('api.php')) {
        return new Response(JSON.stringify({ search: [{ id: 'Q165318' }] }), { status: 200 });
      }
      return new Response(
        JSON.stringify({ results: { bindings: (options.sparql ?? []).map(bind) } }),
        { status: 200 },
      );
    }),
  };
}

const RU_TEXT = {
  title: 'Преступление и наказание (Достоевский)',
  url: '//ru.wikisource.org/wiki/%D0%9F%D1%80%D0%B5%D1%81%D1%82%D1%83%D0%BF%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5',
};

describe('WikidataProvider — Wikisource full texts', () => {
  it('adds one free edition per Wikisource language, attributed to wikisource', async () => {
    // The attribution is not bookkeeping: `wikisource` is on LinkPolicy's DOWNLOAD_ALLOWLIST and
    // `wikidata` is not, so a link left under the discovering provider's name would be refused —
    // rightly, since Wikidata hosts no texts at all.
    const provider = new WikidataProvider(
      makeSitelinkFetcher({ sitelinks: { ruwikisource: RU_TEXT } }),
      makeCache(),
      'ua',
    );

    const editions = await provider.fetchEditions('Q165318');

    expect(editions).toHaveLength(1);
    expect(editions[0]).toMatchObject({
      language: 'ru',
      title: 'Преступление и наказание (Достоевский)',
      rightsSignal: 'public_domain',
      publisher: null,
      year: null,
    });
    expect(editions[0]?.links).toEqual([
      {
        type: 'download',
        url: 'https://ru.wikisource.org/wiki/%D0%9F%D1%80%D0%B5%D1%81%D1%82%D1%83%D0%BF%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5',
        provider: 'wikisource',
        format: 'HTML',
      },
    ]);
  });

  it('never hangs a free download off an edition somebody else described', async () => {
    // Two texts in one language are routinely two different translations: the lapsed one on
    // Wikisource and a modern one still in copyright. Merging them would have this project state
    // that a copyrighted translation is free to take.
    const provider = new WikidataProvider(
      makeSitelinkFetcher({
        sparql: [
          {
            ed: item('Q111'),
            edLabel: 'Преступление и наказание',
            langCode: 'ru',
            date: '+2019-00-00T00:00:00Z',
            publisherLabel: 'Азбука',
          },
        ],
        sitelinks: { ruwikisource: RU_TEXT },
      }),
      makeCache(),
      'ua',
    );

    const editions = await provider.fetchEditions('Q165318');

    expect(editions).toHaveLength(2);
    const modern = editions.find((edition) => edition.publisher === 'Азбука');
    expect(modern?.links).toBeUndefined();
    expect(modern?.rightsSignal).toBe('unknown');
  });

  it('strips a namespace prefix that is cataloguing apparatus, not a title', async () => {
    const provider = new WikidataProvider(
      makeSitelinkFetcher({
        sitelinks: {
          itwikisource: {
            title: 'Opera:Le avventure di Alice nel Paese delle Meraviglie',
            url: '//it.wikisource.org/wiki/Opera:Le_avventure',
          },
        },
      }),
      makeCache(),
      'ua',
    );

    const editions = await provider.fetchEditions('Q165318');
    expect(editions[0]?.title).toBe('Le avventure di Alice nel Paese delle Meraviglie');
  });

  it('skips the wikis that name no single language', async () => {
    const provider = new WikidataProvider(
      makeSitelinkFetcher({
        sitelinks: {
          wikisource: { title: 'Old', url: '//wikisource.org/wiki/Old' },
          mulwikisource: { title: 'Multi', url: '//mul.wikisource.org/wiki/Multi' },
          enwiki: { title: 'Crime and Punishment', url: '//en.wikipedia.org/wiki/Crime' },
        },
      }),
      makeCache(),
      'ua',
    );

    await expect(provider.fetchEditions('Q165318')).resolves.toEqual([]);
  });

  it('keeps the editions it already has when the sitelinks lookup fails', async () => {
    const provider = new WikidataProvider(
      makeSitelinkFetcher({
        sparql: [{ ed: item('Q111'), edLabel: 'Crime and Punishment', langCode: 'en' }],
        sitelinksStatus: 503,
      }),
      makeCache(),
      'ua',
    );

    const editions = await provider.fetchEditions('Q165318');
    expect(editions).toHaveLength(1);
    expect(editions[0]?.links).toBeUndefined();
  });
});
