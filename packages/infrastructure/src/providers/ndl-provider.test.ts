import type { CachePort } from '@golden/domain';
import { describe, expect, it, vi } from 'vitest';
import type { ResilientFetcher } from '../http/resilient-fetch.js';
import { NdlProvider } from './ndl-provider.js';

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
 * The NDL escapes each record's RDF *inside* the SRU envelope, so the fixture has to escape it
 * twice to reproduce what arrives — which is exactly the shape that defeats a single parse.
 */
function ndlResponse(records: string[]): string {
  const escape = (value: string): string =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<?xml version="1.0" encoding="UTF-8"?>
    <searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/">
      <numberOfRecords>${records.length}</numberOfRecords>
      <records>${records
        .map(
          (record) =>
            `<record><recordSchema>dcndl</recordSchema><recordData>${escape(
              `<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcndl="http://ndl.go.jp/dcndl/terms/" xmlns:foaf="http://xmlns.com/foaf/0.1/">${record}</rdf:RDF>`,
            )}</recordData></record>`,
        )
        .join('')}</records>
    </searchRetrieveResponse>`;
}

/** A Japanese edition of Crime and Punishment, in the field shapes captured live. */
const TSUMI_TO_BATSU = `
  <dcndl:BibResource rdf:about="https://ndlsearch.ndl.go.jp/books/R100000001-I000001">
    <dcterms:title>改訳罪と罰</dcterms:title>
    <dc:title><rdf:Description><rdf:value>改訳罪と罰</rdf:value></rdf:Description></dc:title>
    <dcterms:creator><foaf:Agent><foaf:name>Dostoyevsky, Fyodor, 1821-1881/著</foaf:name></foaf:Agent></dcterms:creator>
    <dcterms:creator><foaf:Agent><foaf:name>中村, 白葉/訳</foaf:name></foaf:Agent></dcterms:creator>
    <dcterms:publisher><foaf:Agent><foaf:name>岩波書店</foaf:name></foaf:Agent></dcterms:publisher>
    <dcterms:issued>1959</dcterms:issued>
    <dcterms:language>jpn</dcterms:language>
    <dcterms:identifier>9784003261019</dcterms:identifier>
    <dcterms:extent>412p ; 15cm</dcterms:extent>
    <dcndl:edition>改訳</dcndl:edition>
  </dcndl:BibResource>
`;

function fetcherReturning(body: string): ResilientFetcher {
  return { fetch: vi.fn(async () => new Response(body, { status: 200 })) };
}

describe('NdlProvider', () => {
  it('reads a record the API escapes twice over', async () => {
    // The RDF arrives as escaped text inside the envelope, so it is parsed as a document of its
    // own. Parsed in one pass, every field comes back empty and every record is silently dropped.
    const provider = new NdlProvider(
      fetcherReturning(ndlResponse([TSUMI_TO_BATSU])),
      makeCache(),
      'ua',
    );

    const [work] = await provider.searchWorks({ text: 'Crime and Punishment Fyodor Dostoyevsky' });
    const [edition] = await provider.fetchEditions(work!.externalId);

    expect(edition).toMatchObject({
      title: '改訳罪と罰',
      language: 'jpn',
      publisher: '岩波書店',
      year: 1959,
      isbn13: '9784003261019',
      pages: 412,
      editionStatement: '改訳',
      translator: '白葉 中村',
    });
  });

  it('asks about the book and its author together, never the author alone', async () => {
    // Asked by author alone this catalogue answers with that author's entire shelf — Demons and
    // The Idiot would be filed as editions of Crime and Punishment.
    const fetcher = fetcherReturning(ndlResponse([TSUMI_TO_BATSU]));
    const provider = new NdlProvider(fetcher, makeCache(), 'ua');

    await provider.searchWorks({ text: 'Crime and Punishment Fyodor Dostoyevsky' });

    const queries = vi
      .mocked(fetcher.fetch)
      .mock.calls.map((call) => new URL(String(call[0])).searchParams.get('query'));
    expect(queries[0]).toContain('creator="Dostoyevsky"');
    expect(queries[0]).toContain('anywhere="Crime"');
    expect(queries[0]).toContain('anywhere="Punishment"');
    // Without this the answer is padded with journal articles *about* the novel.
    expect(queries[0]).toContain('mediatype="books"');
  });

  it('asks nothing when the query cannot name both a book and an author', async () => {
    const fetcher = fetcherReturning(ndlResponse([TSUMI_TO_BATSU]));
    const provider = new NdlProvider(fetcher, makeCache(), 'ua');

    await expect(provider.searchWorks({ text: 'Dostoyevsky' })).resolves.toEqual([]);
    expect(fetcher.fetch).not.toHaveBeenCalled();
  });

  it('refuses a record by somebody the query does not name', async () => {
    const byAnother = TSUMI_TO_BATSU.replace(
      'Dostoyevsky, Fyodor, 1821-1881/著',
      'Steiner, George, 1929-2020/著',
    ).replace('中村, 白葉/訳', '中村, 白葉/編');
    const provider = new NdlProvider(fetcherReturning(ndlResponse([byAnother])), makeCache(), 'ua');

    await expect(
      provider.searchWorks({ text: 'Crime and Punishment Fyodor Dostoyevsky' }),
    ).resolves.toEqual([]);
  });

  it('decodes the character references that survive the double escaping', async () => {
    // `'` reaches us as `&amp;#39;`, and the XML parser does not touch numeric references on the
    // second pass — so `Alice&#39;s adventures` is what would be printed as the title of a book.
    const withEntity = TSUMI_TO_BATSU.replace(
      '<dcterms:title>改訳罪と罰</dcterms:title>',
      '<dcterms:title>Alice&amp;#39;s adventures</dcterms:title>',
    );
    const provider = new NdlProvider(
      fetcherReturning(ndlResponse([withEntity])),
      makeCache(),
      'ua',
    );

    const [work] = await provider.searchWorks({ text: 'Crime and Punishment Fyodor Dostoyevsky' });
    expect(work?.title).toBe("Alice's adventures");
  });

  it('fails loudly when the catalogue is down', async () => {
    const fetcher: ResilientFetcher = {
      fetch: vi.fn(async () => new Response('', { status: 503 })),
    };
    const provider = new NdlProvider(fetcher, makeCache(), 'ua');

    await expect(
      provider.searchWorks({ text: 'Crime and Punishment Fyodor Dostoyevsky' }),
    ).rejects.toThrow(/503/);
  });
});
