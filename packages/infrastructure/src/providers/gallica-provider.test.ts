import type { CachePort } from '@golden/domain';
import { describe, expect, it, vi } from 'vitest';
import type { ResilientFetcher } from '../http/resilient-fetch.js';
import { GallicaProvider } from './gallica-provider.js';

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

function gallicaResponse(records: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <srw:searchRetrieveResponse xmlns:srw="http://www.loc.gov/zing/srw/">
      <srw:numberOfRecords>${records.length}</srw:numberOfRecords>
      <srw:records>${records
        .map(
          (record) =>
            `<srw:record><srw:recordData><oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:dc="http://purl.org/dc/elements/1.1/">${record}</oai_dc:dc></srw:recordData></srw:record>`,
        )
        .join('')}</srw:records>
    </srw:searchRetrieveResponse>`;
}

/** The 1869 French printing, in the field shapes captured live. */
const ALICE_1869 = `
  <dc:title>Aventures d'Alice au pays des merveilles / par Lewis Carroll ; traduit de l'anglais par Henri Bué</dc:title>
  <dc:creator>Carroll, Lewis (1832-1898). Auteur du texte</dc:creator>
  <dc:creator>Bué, Henri. Traducteur</dc:creator>
  <dc:publisher>Macmillan (Londres)</dc:publisher>
  <dc:date>1869</dc:date>
  <dc:language>fre</dc:language>
  <dc:language>français</dc:language>
  <dc:rights>domaine public</dc:rights>
  <dc:rights>public domain</dc:rights>
  <dc:type>text</dc:type>
  <dc:type>monographie imprimée</dc:type>
  <dc:identifier>https://gallica.bnf.fr/ark:/12148/bpt6k1045580k</dc:identifier>
`;

function fetcherReturning(body: string): ResilientFetcher {
  return { fetch: vi.fn(async () => new Response(body, { status: 200 })) };
}

describe('GallicaProvider', () => {
  it('offers a free copy when the record states its own item is public domain', async () => {
    const provider = new GallicaProvider(
      fetcherReturning(gallicaResponse([ALICE_1869])),
      makeCache(),
      'ua',
    );

    const [work] = await provider.searchWorks({ text: "Alice's Adventures Carroll, Lewis" });
    const [edition] = await provider.fetchEditions(work!.externalId);

    expect(edition).toMatchObject({
      title: "Aventures d'Alice au pays des merveilles",
      language: 'fre',
      year: 1869,
      translator: 'Henri Bué',
      rightsSignal: 'public_domain',
    });
    expect(edition?.links).toEqual([
      {
        type: 'download',
        url: 'https://gallica.bnf.fr/ark:/12148/bpt6k1045580k',
        provider: 'gallica',
        format: 'HTML',
      },
    ]);
  });

  it('offers no copy at all when the record does not state public domain', async () => {
    // The rule ADR-0013 rests on: Gallica's corpus is not public domain by charter, so silence is
    // not permission. The printing is still listed — it is a real edition — just without a link.
    const restricted = ALICE_1869.replace(/<dc:rights>[^<]*<\/dc:rights>/g, '');
    const provider = new GallicaProvider(
      fetcherReturning(gallicaResponse([restricted])),
      makeCache(),
      'ua',
    );

    const [work] = await provider.searchWorks({ text: "Alice's Adventures Carroll, Lewis" });
    const [edition] = await provider.fetchEditions(work!.externalId);

    expect(edition?.title).toBe("Aventures d'Alice au pays des merveilles");
    expect(edition?.links).toBeUndefined();
    expect(edition?.rightsSignal).toBe('unknown');
  });

  it('pairs the author with a title word, both field-scoped', async () => {
    // Asked for `dc.creator all "Lewis"` on its own it would answer with C. S. Lewis as readily as
    // with Lewis Carroll — the pairing is the safeguard, not the author check.
    const fetcher = fetcherReturning(gallicaResponse([ALICE_1869]));
    const provider = new GallicaProvider(fetcher, makeCache(), 'ua');

    await provider.searchWorks({ text: "Alice's Adventures Carroll, Lewis" });

    const query = new URL(String(vi.mocked(fetcher.fetch).mock.calls[0]?.[0])).searchParams.get(
      'query',
    );
    expect(query).toMatch(/dc\.creator all "(Lewis|Carroll)"/);
    expect(query).toMatch(/dc\.title all "(Alice's|Adventures)"/);
  });

  it('sends the User-Agent the endpoint refuses to answer without', async () => {
    const fetcher = fetcherReturning(gallicaResponse([ALICE_1869]));
    const provider = new GallicaProvider(fetcher, makeCache(), 'GoldenLibrary/0.1');

    await provider.searchWorks({ text: "Alice's Adventures Carroll, Lewis" });

    expect(vi.mocked(fetcher.fetch).mock.calls[0]?.[1]).toMatchObject({
      headers: { 'User-Agent': 'GoldenLibrary/0.1' },
    });
  });

  it('skips what is not a printed book', async () => {
    // Gallica holds newspapers, maps and sheet music alongside books; none of them is an edition.
    const newspaper = ALICE_1869.replace(
      '<dc:type>monographie imprimée</dc:type>',
      '<dc:type>fascicule</dc:type>',
    ).replace('<dc:type>text</dc:type>', '');
    const provider = new GallicaProvider(
      fetcherReturning(gallicaResponse([newspaper])),
      makeCache(),
      'ua',
    );

    await expect(
      provider.searchWorks({ text: "Alice's Adventures Carroll, Lewis" }),
    ).resolves.toEqual([]);
  });

  it('refuses a record by somebody the query does not name', async () => {
    const byAnother = ALICE_1869.replace(
      'Carroll, Lewis (1832-1898). Auteur du texte',
      'Verne, Jules (1828-1905). Auteur du texte',
    );
    const provider = new GallicaProvider(
      fetcherReturning(gallicaResponse([byAnother])),
      makeCache(),
      'ua',
    );

    await expect(
      provider.searchWorks({ text: "Alice's Adventures Carroll, Lewis" }),
    ).resolves.toEqual([]);
  });

  it('fails loudly when the endpoint is down', async () => {
    const fetcher: ResilientFetcher = {
      fetch: vi.fn(async () => new Response('', { status: 403 })),
    };
    const provider = new GallicaProvider(fetcher, makeCache(), 'ua');

    await expect(
      provider.searchWorks({ text: "Alice's Adventures Carroll, Lewis" }),
    ).rejects.toThrow(/403/);
  });
});
