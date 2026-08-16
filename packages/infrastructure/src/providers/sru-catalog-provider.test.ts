import type { CachePort } from '@golden/domain';
import { describe, expect, it, vi } from 'vitest';
import type { ResilientFetcher } from '../http/resilient-fetch.js';
import { romanizationSkeleton, sameNamePart } from './catalog-record.js';
import {
  cleanCatalogName,
  cleanCatalogTitle,
  createBnfProvider,
  createDnbProvider,
  createK10plusProvider,
  createLibrisProvider,
  createLocProvider,
  createMelindaProvider,
  createSwisscoveryProvider,
  extractIsbn,
  extractPages,
} from './sru-catalog-provider.js';

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

/** One `oai_dc` record in the envelope the DNB really returns (captured live). */
function dnbRecord(fields: string): string {
  return `<record><recordSchema>oai_dc</recordSchema><recordData>
    <dc xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
      ${fields}
    </dc></recordData></record>`;
}

function dnbResponse(records: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <searchRetrieveResponse xmlns="http://www.loc.gov/zing/srw/">
      <version>1.1</version><numberOfRecords>${records.length}</numberOfRecords>
      <records>${records.join('')}</records>
    </searchRetrieveResponse>`;
}

const LAURUS = dnbRecord(`
  <dc:title>Laurus / Evgenij Vodolazkin ; aus dem Russischen von Olga Radetzkaja</dc:title>
  <dc:creator>Vodolazkin, Evgenij Germanovič [Verfasser]</dc:creator>
  <dc:creator>Radetzkaja, Olga [Übersetzer]</dc:creator>
  <dc:publisher>Zürich : Dörlemann</dc:publisher>
  <dc:date>2016</dc:date>
  <dc:language>ger</dc:language>
  <dc:identifier xsi:type="tel:ISBN">978-3-03820-027-7 Festeinband : EUR 24.90 (DE)</dc:identifier>
  <dc:format>414 Seiten</dc:format>
`);

/** The dissertation *about* Russian novels that the DNB ranks first for "Vodolazkin Laurus". */
const DISSERTATION = dnbRecord(`
  <dc:title>Auktorialʹnostʹ v sovremennych russkich romanach / Angelina Maslennikova</dc:title>
  <dc:creator>Maslennikova, Angelina [Verfasser]</dc:creator>
  <dc:publisher>Baden-Baden : Georg Olms Verlag</dc:publisher>
  <dc:date>2025</dc:date>
  <dc:language>rus</dc:language>
  <dc:identifier xsi:type="tel:ISBN">978-3-487-17159-3</dc:identifier>
  <dc:format>235 Seiten</dc:format>
`);

function fetcherReturning(body: string): ResilientFetcher {
  return { fetch: vi.fn(async () => new Response(body, { status: 200 })) };
}

describe('catalogue field cleaning', () => {
  it('strips the statement of responsibility from a title', () => {
    expect(
      cleanCatalogTitle(
        "L'archipel des Solovki : roman / Zakhar Prilepine ; traduit du russe par Joëlle Dublanchet",
      ),
    ).toBe("L'archipel des Solovki");
  });

  it('keeps the edition’s own title when the original is bracketed in front of it', () => {
    // The DNB writes the original title first, in brackets. Printed as-is, "[Sankja] ; Sankya"
    // is not a title any reader would recognise — and it is a natural key nothing else matches.
    expect(cleanCatalogTitle('[Sankja] ; Sankya / Zakhar Prilepin ; aus dem Russischen')).toBe(
      'Sankya',
    );
  });

  it('turns a filing-order name with life dates and a role into a person', () => {
    expect(cleanCatalogName('Prilepin, Zahar (1975-....). Auteur du texte')).toBe('Zahar Prilepin');
    expect(cleanCatalogName('Radetzkaja, Olga [Übersetzer]')).toBe('Olga Radetzkaja');
  });

  it('takes the ISBN out of a field that also carries a binding and a price', () => {
    expect(extractIsbn('978-3-948145-41-5 Festeinband : EUR 25.00 (DE), EUR 25.70 (AT)')).toBe(
      '9783948145415',
    );
    expect(extractIsbn('ISBN 9782330081881')).toBe('9782330081881');
    expect(extractIsbn('Code à barres commercial')).toBeNull();
  });

  it('reads a page count in either catalogue’s wording', () => {
    expect(extractPages('1 vol. (820 p.) ; 24 cm')).toBe(820);
    expect(extractPages('381 Seiten')).toBe(381);
    expect(extractPages('1 disque compact')).toBeNull();
  });
});

describe('SruCatalogProvider', () => {
  it('maps a record into an edition with publisher, ISBN, pages and the translator', async () => {
    const provider = createDnbProvider(fetcherReturning(dnbResponse([LAURUS])), makeCache(), 'ua');

    const [work] = await provider.searchWorks({ text: 'Vodolazkin Laurus' });
    const editions = await provider.fetchEditions(work!.externalId);

    expect(work).toMatchObject({ title: 'Laurus', authorNames: ['Evgenij Germanovič Vodolazkin'] });
    expect(editions).toHaveLength(1);
    expect(editions[0]).toMatchObject({
      title: 'Laurus',
      language: 'ger',
      publisher: 'Zürich : Dörlemann',
      year: 2016,
      isbn13: '9783038200277',
      pages: 414,
      // The reason these catalogues are worth the trouble: no other wired source names one.
      translator: 'Olga Radetzkaja',
      rightsSignal: 'unknown',
    });
  });

  it('drops a record by somebody else, however the catalogue ranked it', async () => {
    // Live case: the DNB returns this dissertation *first* for "Vodolazkin Laurus", because it
    // discusses the novel. Anchoring relevance on the top record therefore anchored it on the
    // wrong book, and every edition of it would have been attached to Vodolazkin's work.
    const provider = createDnbProvider(
      fetcherReturning(dnbResponse([DISSERTATION, LAURUS])),
      makeCache(),
      'ua',
    );

    const [work] = await provider.searchWorks({ text: 'Vodolazkin Laurus' });
    const editions = await provider.fetchEditions(work!.externalId);

    expect(work?.authorNames).toEqual(['Evgenij Germanovič Vodolazkin']);
    expect(editions.map((edition) => edition.title)).toEqual(['Laurus']);
  });

  it('offers nothing at all rather than a guess when no record is by anyone named', async () => {
    // A "best available guess" — the only, or the most common, author among the records — is how
    // a French monograph *about* the Iron Guard became an edition of Codreanu's own memoir on the
    // live instance. Enrichment attaches whatever comes back to a book somebody else already
    // identified, so a wrong record here is not a weak answer, it is a false one.
    const provider = createDnbProvider(
      fetcherReturning(dnbResponse([DISSERTATION])),
      makeCache(),
      'ua',
    );

    await expect(provider.searchWorks({ text: 'Vodolazkin Laurus' })).resolves.toEqual([]);
  });

  it('reports the earliest record as the work, since a translation cannot predate its original', async () => {
    const older = dnbRecord(`
      <dc:title>Obitelʹ / Zahar Prilepin</dc:title>
      <dc:creator>Prilepin, Zahar [Verfasser]</dc:creator>
      <dc:date>2014</dc:date><dc:language>rus</dc:language>
    `);
    const newer = dnbRecord(`
      <dc:title>Das Kloster / Zahar Prilepin ; aus dem Russischen</dc:title>
      <dc:creator>Prilepin, Zahar [Verfasser]</dc:creator>
      <dc:date>2018</dc:date><dc:language>ger</dc:language>
    `);
    const provider = createDnbProvider(
      fetcherReturning(dnbResponse([newer, older])),
      makeCache(),
      'ua',
    );

    const [work] = await provider.searchWorks({ text: 'Prilepin Obitel' });

    expect(work).toMatchObject({ title: 'Obitelʹ', languages: ['rus'], firstPublishedYear: 2014 });
  });

  it('gives two printings of the same year and title distinct ids', async () => {
    // The DNB lists Laurus twice for 2016, from "Dörlemann" and "Dörlemann eBook". Keying the two
    // by title, language and year alone made them one id but two natural keys, and the sync then
    // reused the first edition's row id for the second's data: the whole enrichment died with
    // `duplicate key value violates unique constraint "edition_pkey"`, observed live.
    const paper = dnbRecord(`
      <dc:title>Laurus / Evgenij Vodolazkin</dc:title>
      <dc:creator>Vodolazkin, Evgenij [Verfasser]</dc:creator>
      <dc:publisher>Zürich : Dörlemann</dc:publisher>
      <dc:date>2016</dc:date><dc:language>ger</dc:language>
    `);
    const ebook = dnbRecord(`
      <dc:title>Laurus / Evgenij Vodolazkin</dc:title>
      <dc:creator>Vodolazkin, Evgenij [Verfasser]</dc:creator>
      <dc:publisher>Zürich : Dörlemann eBook</dc:publisher>
      <dc:date>2016</dc:date><dc:language>ger</dc:language>
    `);
    const provider = createDnbProvider(
      fetcherReturning(dnbResponse([paper, ebook])),
      makeCache(),
      'ua',
    );

    const [work] = await provider.searchWorks({ text: 'Vodolazkin Laurus' });
    const editions = await provider.fetchEditions(work!.externalId);

    expect(editions).toHaveLength(2);
    expect(new Set(editions.map((edition) => edition.externalId)).size).toBe(2);
  });

  it('identifies an edition by its ISBN when the record carries one', async () => {
    const provider = createDnbProvider(fetcherReturning(dnbResponse([LAURUS])), makeCache(), 'ua');

    const [work] = await provider.searchWorks({ text: 'Vodolazkin Laurus' });
    const editions = await provider.fetchEditions(work!.externalId);

    expect(editions[0]?.externalId).toBe('dnb:isbn:9783038200277');
  });

  it('never offers a link — a catalogue entry is a record of a book, not a copy of it', async () => {
    const provider = createBnfProvider(fetcherReturning(dnbResponse([LAURUS])), makeCache(), 'ua');

    const [work] = await provider.searchWorks({ text: 'Vodolazkin Laurus' });
    const editions = await provider.fetchEditions(work!.externalId);

    expect(editions.every((edition) => edition.links === undefined)).toBe(true);
    await expect(provider.fetchWorkDetails()).resolves.toEqual({
      description: null,
      coverUrl: null,
      subjects: [],
    });
  });

  it('asks the catalogue once per query and serves the rest from cache', async () => {
    const fetcher = fetcherReturning(dnbResponse([LAURUS]));
    const provider = createDnbProvider(fetcher, makeCache(), 'ua');

    const [work] = await provider.searchWorks({ text: 'Vodolazkin Laurus' });
    await provider.fetchEditions(work!.externalId);

    expect(fetcher.fetch).toHaveBeenCalledTimes(1);
  });

  it('fails loudly when the catalogue itself is down', async () => {
    const fetcher: ResilientFetcher = {
      fetch: vi.fn(async () => new Response('', { status: 503 })),
    };
    const provider = createDnbProvider(fetcher, makeCache(), 'ua');

    await expect(provider.searchWorks({ text: 'Vodolazkin Laurus' })).rejects.toThrow(/503/);
  });
});

/** The same book as `LAURUS` above, in the MARCXML the union catalogues really send. */
const LAURUS_MARC = `
  <leader>     cam a22      c 4500</leader>
  <controlfield tag="001">1929616341</controlfield>
  <controlfield tag="008">160702s2016    gw ||||| m    00| ||ger c</controlfield>
  <datafield tag="020" ind1=" " ind2=" "><subfield code="a">9783038200277</subfield></datafield>
  <datafield tag="041" ind1=" " ind2=" ">
    <subfield code="a">ger</subfield><subfield code="h">rus</subfield>
  </datafield>
  <datafield tag="100" ind1="1" ind2=" ">
    <subfield code="a">Vodolazkin, Evgenij Germanovič</subfield><subfield code="4">aut</subfield>
  </datafield>
  <datafield tag="245" ind1="1" ind2="0">
    <subfield code="a">Laurus :</subfield><subfield code="b">Roman /</subfield>
    <subfield code="c">Evgenij Vodolazkin</subfield>
  </datafield>
  <datafield tag="250" ind1=" " ind2=" ">
    <subfield code="a">Limitierte, signierte Auflage</subfield>
  </datafield>
  <datafield tag="264" ind1=" " ind2="1">
    <subfield code="b">Dörlemann</subfield><subfield code="c">2016</subfield>
  </datafield>
  <datafield tag="300" ind1=" " ind2=" "><subfield code="a">414 Seiten</subfield></datafield>
  <datafield tag="700" ind1="1" ind2=" ">
    <subfield code="a">Radetzkaja, Olga</subfield><subfield code="4">trl</subfield>
  </datafield>
`;

function marcResponse(records: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <zs:searchRetrieveResponse xmlns:zs="http://www.loc.gov/zing/srw/">
      <zs:numberOfRecords>${records.length}</zs:numberOfRecords>
      <zs:records>${records
        .map(
          (record) =>
            `<zs:record><zs:recordData><record xmlns="http://www.loc.gov/MARC21/slim">${record}</record></zs:recordData></zs:record>`,
        )
        .join('')}</zs:records>
    </zs:searchRetrieveResponse>`;
}

describe('SruCatalogProvider over MARCXML', () => {
  it('puts the edition statement on the edition, which the Dublin Core path cannot', async () => {
    // The point of the whole MARC path: a signed limited printing is now distinguishable from the
    // twelfth reprint of the same book by the same publisher.
    const provider = createK10plusProvider(
      fetcherReturning(marcResponse([LAURUS_MARC])),
      makeCache(),
      'ua',
    );

    const [work] = await provider.searchWorks({ text: 'Vodolazkin Laurus' });
    const [edition] = await provider.fetchEditions(work!.externalId);

    expect(edition).toMatchObject({
      title: 'Laurus',
      language: 'ger',
      publisher: 'Dörlemann',
      year: 2016,
      isbn13: '9783038200277',
      pages: 414,
      editionStatement: 'Limitierte, signierte Auflage',
    });
  });

  it('names the translator and the original language from the relator code and 041 $h', async () => {
    const provider = createLocProvider(
      fetcherReturning(marcResponse([LAURUS_MARC])),
      makeCache(),
      'ua',
    );

    const [work] = await provider.searchWorks({ text: 'Vodolazkin Laurus' });
    const [edition] = await provider.fetchEditions(work!.externalId);

    // Neither fact needs the catalogue's own wording: `trl` and `041 $h` mean the same in every
    // language, which is why a new MARC catalogue costs a config object and no new regexes.
    expect(edition).toMatchObject({ translator: 'Olga Radetzkaja', translatedFrom: 'rus' });
  });

  it('still refuses a record by somebody else, exactly as the Dublin Core path does', async () => {
    const byAnother = LAURUS_MARC.replace(
      'Vodolazkin, Evgenij Germanovič',
      'Maslennikova, Angelina',
    );
    const provider = createLibrisProvider(
      fetcherReturning(marcResponse([byAnother])),
      makeCache(),
      'ua',
    );

    await expect(provider.searchWorks({ text: 'Vodolazkin Laurus' })).resolves.toEqual([]);
  });

  it('asks each catalogue in its own query language', async () => {
    const k10plus = fetcherReturning(marcResponse([LAURUS_MARC]));
    await createK10plusProvider(k10plus, makeCache(), 'ua').searchWorks({
      text: 'Vodolazkin Laurus',
    });
    expect(String(vi.mocked(k10plus.fetch).mock.calls[0]?.[0])).toContain(
      'pica.all%3DVodolazkin+and+pica.all%3DLaurus',
    );

    const loc = fetcherReturning(marcResponse([LAURUS_MARC]));
    await createLocProvider(loc, makeCache(), 'ua').searchWorks({ text: 'Vodolazkin Laurus' });
    // ANDed rather than sent as a phrase: the gateway matches a phrase literally, and a title plus
    // an author is not a phrase anybody catalogued (verified live — it returns nothing).
    expect(String(vi.mocked(loc.fetch).mock.calls[0]?.[0])).toContain(
      'cql.serverChoice%3DVodolazkin+and+cql.serverChoice%3DLaurus',
    );
  });
});

describe('the union catalogues added last', () => {
  it('asks Melinda and swisscovery in each one’s own query language', async () => {
    const melinda = fetcherReturning(marcResponse([LAURUS_MARC]));
    await createMelindaProvider(melinda, makeCache(), 'ua').searchWorks({
      text: 'Vodolazkin Laurus',
    });
    expect(String(vi.mocked(melinda.fetch).mock.calls[0]?.[0])).toContain(
      'cql.serverChoice%3DVodolazkin+and+cql.serverChoice%3DLaurus',
    );

    const swiss = fetcherReturning(marcResponse([LAURUS_MARC]));
    await createSwisscoveryProvider(swiss, makeCache(), 'ua').searchWorks({
      text: 'Vodolazkin Laurus',
    });
    // Alma's all-fields index, ANDed per word so the catalogue narrows to the book itself.
    expect(String(vi.mocked(swiss.fetch).mock.calls[0]?.[0])).toContain(
      'alma.all_for_ui%3D%22Vodolazkin%22+and+alma.all_for_ui%3D%22Laurus%22',
    );
  });

  it('reads both as MARC, so an edition statement survives', async () => {
    const provider = createMelindaProvider(
      fetcherReturning(marcResponse([LAURUS_MARC])),
      makeCache(),
      'ua',
    );

    const [work] = await provider.searchWorks({ text: 'Vodolazkin Laurus' });
    const [edition] = await provider.fetchEditions(work!.externalId);

    expect(edition).toMatchObject({
      editionStatement: 'Limitierte, signierte Auflage',
      translator: 'Olga Radetzkaja',
      translatedFrom: 'rus',
    });
  });
});

describe('matching a name across romanization systems', () => {
  it('folds every spelling of Глуховский onto one', () => {
    // The four a reader could meet: K10plus, the Library of Congress, an English jacket, and this
    // project's own romanizer. Without this, «Метро 2034» is twelve records at K10plus that the
    // relevance check throws away, and the card shows zero editions for a book the source has.
    const spellings = ['gluchovskij', 'glukhovskiĭ', 'glukhovsky', 'glukhovskii'];
    const skeletons = new Set(spellings.map(romanizationSkeleton));
    expect(skeletons).toEqual(new Set(['gluhovski']));
  });

  it.each([
    ['gluchovskij', 'glukhovskii'],
    ['alekseevič', 'alekseevich'],
    ['dmitrij', 'dmitrii'],
    ['dostoyevsky', 'dostoevskii'],
    ['tolstoy', 'tolstoi'],
    ['chekhov', 'čechov'],
    // The tail a language adds, which is what this check originally existed for.
    ['prilepine', 'prilepin'],
  ])('treats %s and %s as the same person', (a, b) => {
    expect(sameNamePart(a, b)).toBe(true);
  });

  it.each([
    ['carroll', 'lewis'],
    ['bulgakov', 'prilepin'],
    ['tolstoy', 'turgenev'],
    ['maslennikova', 'vodolazkin'],
    ['steiner', 'dostoevsky'],
  ])('still keeps %s and %s apart', (a, b) => {
    expect(sameNamePart(a, b)).toBe(false);
  });
});

describe('a numbered series is not one book', () => {
  it('refuses the volume next to the one asked for', async () => {
    // Asked for «Метро 2034», K10plus and the DNB return Metro 2033 and Metro 2035 too — different
    // novels by the same author with the same title, which is precisely what the search's own
    // `hasConflictingNumbers` rule exists for. It was never applied on the enrichment path, so all
    // three were filed as editions of one book.
    const sequel = LAURUS_MARC.replace(
      '<subfield code="a">Laurus :</subfield>',
      '<subfield code="a">Metro 2033 :</subfield>',
    );
    const asked = LAURUS_MARC.replace(
      '<subfield code="a">Laurus :</subfield>',
      '<subfield code="a">Metro 2034 :</subfield>',
    );
    const provider = createK10plusProvider(
      fetcherReturning(marcResponse([sequel, asked])),
      makeCache(),
      'ua',
    );

    const [work] = await provider.searchWorks({ text: 'Metro 2034 Vodolazkin' });
    const editions = await provider.fetchEditions(work!.externalId);

    expect(editions.map((edition) => edition.title)).toEqual(['Metro 2034']);
  });

  it('keeps a record whose title carries no number to disagree about', async () => {
    // An omnibus or a plain reprint has nothing to conflict on, and dropping it would cost real
    // editions to catch a problem it does not have.
    const omnibus = LAURUS_MARC.replace(
      '<subfield code="a">Laurus :</subfield>',
      '<subfield code="a">Metro - Die Trilogie :</subfield>',
    );
    const provider = createK10plusProvider(
      fetcherReturning(marcResponse([omnibus])),
      makeCache(),
      'ua',
    );

    const [work] = await provider.searchWorks({ text: 'Metro 2034 Vodolazkin' });
    expect(work).toBeDefined();
  });
});
