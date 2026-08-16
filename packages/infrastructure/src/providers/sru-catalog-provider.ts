import type {
  BookMetadataProvider,
  CachePort,
  ProviderEdition,
  ProviderWork,
  ProviderWorkDetails,
  SearchQuery,
} from '@golden/domain';
import { ProviderId } from '@golden/domain';
import { XMLParser } from 'fast-xml-parser';
import type { ResilientFetcher } from '../http/resilient-fetch.js';
import {
  EMPTY_RECORD,
  cleanCatalogName,
  cleanCatalogTitle,
  decodeEntities,
  extractIsbn,
  extractPages,
  extractYear,
  nameParts,
  numbersAllowTheSameBook,
  sameNamePart,
  type CatalogAgent,
  type CatalogRecord,
} from './catalog-record.js';
import { TRANSLATOR_RELATOR, isAuthorRelator, parseMarcRecords } from './marc-record.js';

// Re-exported because these are this module's published helpers and several of them are covered
// by its own test; they live in catalog-record.ts only so the MARC parser can use them too.
export {
  cleanCatalogName,
  cleanCatalogTitle,
  extractIsbn,
  extractPages,
  type CatalogRecord,
} from './catalog-record.js';

const CACHE_TTL_SECONDS = 6 * 60 * 60;
/** Records asked of a catalogue per query. A heavily translated author fills this easily. */
const DEFAULT_MAX_RECORDS = 40;

/**
 * Which serialization a catalogue is asked for, and therefore which parser reads it.
 *
 * Not a free choice per catalogue: `marcxml` is strictly richer (see marc-record.ts) and is what a
 * new catalogue should use. `dublin-core` stays because the BnF and the DNB were built against it,
 * their role regexes are tuned to its prose, and re-cataloguing two working sources to gain fields
 * they already supply by other means would be churn with a regression surface.
 */
export type CatalogFormat = 'dublin-core' | 'marcxml';

export interface SruCatalogConfig {
  /** The `ProviderId` this catalogue is known by, e.g. `bnf`. */
  id: string;
  endpoint: string;
  /** SRU protocol version the endpoint speaks — BnF is 1.2, DNB is 1.1. */
  version: '1.1' | '1.2';
  recordSchema: string;
  /** How to read `recordSchema` once it arrives. Defaults to `dublin-core`. */
  format?: CatalogFormat;
  /** Builds the catalogue's own CQL from the plain words of a query. */
  buildQuery(words: readonly string[]): string;
  /**
   * How this catalogue marks a translator on a contributor line — "Traducteur" at the BnF,
   * "Übersetzer" at the DNB. Matched case-insensitively against the whole line.
   *
   * Only consulted for a record with no structural role information. A MARC record states the
   * role as a relator code, and a code beats a regex over another language's wording every time.
   */
  translatorRole: RegExp;
  /** How it marks the author, so a contributor line is not mistaken for one. */
  authorRole: RegExp;
  /**
   * How many records to ask for. The default suits a national catalogue; a union catalogue holding
   * the collective stock of hundreds of libraries is exactly where the rare printings are, and
   * cutting it off at forty would throw away the reason for querying it.
   */
  maxRecords?: number;
}

/** Every value a repeated Dublin Core element holds, as plain strings. */
function fieldValues(node: unknown): string[] {
  if (node === undefined || node === null) return [];
  const list = Array.isArray(node) ? node : [node];
  return list
    .map((entry) => {
      if (typeof entry === 'string' || typeof entry === 'number') return String(entry);
      // fast-xml-parser hands back an object when the element carries attributes (DNB's ISBNs
      // are `<dc:identifier xsi:type="tel:ISBN">`), with the text under `#text`.
      if (entry && typeof entry === 'object' && '#text' in entry) {
        return String((entry as { '#text': unknown })['#text']);
      }
      return '';
    })
    .map((value) => decodeEntities(value.trim()))
    .filter((value) => value.length > 0);
}

/**
 * A national library catalogue over SRU, as a `BookMetadataProvider` (docs/architecture.md §2.2).
 *
 * These are **edition** catalogues, and that is exactly why they are here. Open Library knows that
 * a Russian novel exists; the Bibliothèque nationale de France knows that it came out in French in
 * 2017 from Actes Sud, translated by Joëlle Dublanchet, 820 pages, with an ISBN — which is the
 * question this whole project exists to answer, and which no source already wired in could answer
 * for contemporary literature. Measured live: 39 records for Zakhar Prilepin at the BnF and 9 at
 * the DNB, against one Open Library work.
 *
 * They are registered as *enrichment* sources, never discovery ones. A catalogue record is a
 * translation, so its title is the translated title — discovering «Обитель» through the BnF would
 * file the book under "L'archipel des Solovki" and call its original language French. Enrichment
 * hands them a work id instead (`attachToWorkId`), and they contribute editions to a book someone
 * else has already identified.
 *
 * No links: a catalogue entry is a record of a printed book, not a copy of it, so nothing here
 * reaches `LinkPolicy` (docs/legal-policy.md).
 *
 * A catalogue answers in whichever format `config.format` asks for. Prefer `marcxml` for anything
 * new: Dublin Core drops the edition statement entirely, so through it a signed limited printing
 * and the twelfth paperback reprint are the same record — the reason rare and collector's editions
 * were invisible even for books this instance already held.
 */
export class SruCatalogProvider implements BookMetadataProvider {
  readonly id: ProviderId;
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    parseTagValue: false,
    trimValues: true,
  });

  constructor(
    private readonly config: SruCatalogConfig,
    private readonly fetcher: ResilientFetcher,
    private readonly cache: CachePort,
    private readonly userAgent: string,
  ) {
    this.id = ProviderId.create(config.id);
  }

  /**
   * The catalogue has no concept of a work, so the answer is built from the records: the author
   * they agree on, and the earliest title among them. `externalId` is the query itself, because
   * that is the only handle this catalogue can be asked the same question by again.
   */
  async searchWorks(query: SearchQuery): Promise<ProviderWork[]> {
    const words = queryWords(query.text);
    const relevant = this.relevantRecords(await this.fetchRecords(query.text), words);
    if (relevant.length === 0) return [];

    // The earliest record, because a translation cannot predate its original — so the oldest
    // edition a catalogue holds is the one most likely to carry the book's own title and language.
    const earliest = [...relevant].sort(
      (a, b) => (extractYear(a.date) ?? 9999) - (extractYear(b.date) ?? 9999),
    )[0]!;
    const author = this.authorOf(earliest);
    if (!author) return [];

    return [
      {
        externalId: queryExternalId(query.text),
        title: cleanCatalogTitle(earliest.title[0] ?? ''),
        authorNames: [author],
        languages: earliest.language,
        firstPublishedYear: extractYear(earliest.date),
        editionCount: relevant.length,
        coverUrl: null, // Neither catalogue publishes cover images.
      },
    ].filter((work) => work.title.length > 0);
  }

  async fetchEditions(externalWorkId: string): Promise<ProviderEdition[]> {
    const query = queryFromExternalId(externalWorkId);
    if (!query) return [];

    const records = await this.fetchRecords(query);
    if (records.length === 0) return [];

    const editions: ProviderEdition[] = [];
    for (const record of this.relevantRecords(records, queryWords(query))) {
      const language = record.language[0];
      const title = cleanCatalogTitle(record.title[0] ?? '');
      if (!language || title.length === 0) continue;

      const isbns = record.identifier.map(extractIsbn).filter((v): v is string => v !== null);
      editions.push({
        externalId: this.recordId(record, title, language, isbns),
        title,
        language,
        coverUrl: null,
        translator: this.translatorOf(record),
        // Dublin Core states the source language in prose ("traduit du russe par…") rather than as
        // a code, and guessing at it from that sentence would put a fabricated fact on a card. A
        // MARC record has `041 $h`, which is the code itself and needs no guessing.
        translatedFrom: record.languageOfOriginal,
        publisher: record.publisher[0] ?? null,
        year: extractYear(record.date),
        isbn13: isbns.find((isbn) => isbn.length === 13) ?? null,
        isbn10: isbns.find((isbn) => isbn.length === 10) ?? null,
        pages: record.format.map(extractPages).find((pages) => pages !== null) ?? null,
        binding: null,
        editionStatement: record.editionStatement,
        rightsSignal: 'unknown',
      });
    }
    return editions;
  }

  /** A catalogue describes editions, not works — it has no blurb, no cover and no genre to give. */
  async fetchWorkDetails(): Promise<ProviderWorkDetails> {
    return { description: null, coverUrl: null, subjects: [] };
  }

  private async fetchRecords(queryText: string): Promise<CatalogRecord[]> {
    const words = queryWords(queryText);
    if (words.length === 0) return [];

    // `v2` because `CatalogRecord` is wider than the Dublin Core shape cached before it: an entry
    // written by the old code would come back missing `editionStatement` and `agents` and quietly
    // look like a catalogue that has neither.
    const cacheKey = `provider:${this.config.id}:records:v2:${encodeURIComponent(words.join(' ').toLowerCase())}`;
    const cached = await this.cache.get<CatalogRecord[]>(cacheKey);
    if (cached) return cached;

    const url = `${this.config.endpoint}?${new URLSearchParams({
      version: this.config.version,
      operation: 'searchRetrieve',
      recordSchema: this.config.recordSchema,
      maximumRecords: String(this.config.maxRecords ?? DEFAULT_MAX_RECORDS),
      query: this.config.buildQuery(words),
    })}`;

    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!res.ok) {
      throw new Error(`${this.config.id} SRU search failed with status ${res.status}`);
    }

    const records = this.parseRecords(await res.text());
    await this.cache.set(cacheKey, records, CACHE_TTL_SECONDS);
    return records;
  }

  private parseRecords(xml: string): CatalogRecord[] {
    const parsed = this.parser.parse(xml) as Record<string, unknown>;
    if (this.config.format === 'marcxml') return parseMarcRecords(parsed);

    const nodes = collectDcNodes(parsed);
    return nodes.map((node) => ({
      ...EMPTY_RECORD,
      title: fieldValues(node['title']),
      creator: fieldValues(node['creator']),
      contributor: fieldValues(node['contributor']),
      publisher: fieldValues(node['publisher']),
      date: fieldValues(node['date']),
      language: fieldValues(node['language']),
      identifier: fieldValues(node['identifier']),
      format: fieldValues(node['format']),
      subject: fieldValues(node['subject']),
    }));
  }

  /**
   * The record's author.
   *
   * A MARC record says so outright — `$4 aut` — and that answer is taken as given. Dublin Core
   * does not, so the catalogue-specific role wording is the only thing left to go on, and the
   * fallback is "whoever is not marked as the translator".
   */
  private authorOf(record: CatalogRecord): string | null {
    const chosen = record.agents
      ? this.authorAgentOf(record.agents)
      : (record.creator.find((line) => this.config.authorRole.test(line)) ??
        record.creator.find((line) => !this.config.translatorRole.test(line)) ??
        record.creator[0]);
    if (!chosen) return null;
    const name = cleanCatalogName(chosen);
    return name.length > 0 ? name : null;
  }

  private authorAgentOf(agents: readonly CatalogAgent[]): string | undefined {
    const byRelator = agents.find((agent) => isAuthorRelator(agent.relator));
    if (byRelator) return byRelator.name;
    // No relator code anywhere on the record — fall back to the role in the catalogue's own words,
    // then to anyone not named as the translator.
    const byTerm = agents.find(
      (agent) => agent.roleTerm !== null && this.config.authorRole.test(agent.roleTerm),
    );
    return (byTerm ?? agents.find((agent) => !this.isTranslatorAgent(agent)))?.name;
  }

  /** Same shape as `authorOf`: the relator code when there is one, the wording when there is not. */
  private translatorOf(record: CatalogRecord): string | null {
    const chosen = record.agents
      ? record.agents.find((agent) => this.isTranslatorAgent(agent))?.name
      : [...record.contributor, ...record.creator].find((entry) =>
          this.config.translatorRole.test(entry),
        );
    if (!chosen) return null;
    const name = cleanCatalogName(chosen);
    return name.length > 0 ? name : null;
  }

  private isTranslatorAgent(agent: CatalogAgent): boolean {
    if (agent.relator === TRANSLATOR_RELATOR) return true;
    // A stated relator code is the record's answer, so the wording is not asked a second time —
    // otherwise a record naming someone `aut` whose role term merely mentions a translation would
    // have the book's author printed on the card as its translator.
    if (agent.relator !== null) return false;
    return agent.roleTerm !== null && this.config.translatorRole.test(agent.roleTerm);
  }

  /**
   * The records that are actually about the book being asked for.
   *
   * A catalogue matches words across every field, so a query pulls in whatever mentions them:
   * "Vodolazkin Laurus" at the DNB returns, first, a dissertation *about* modern Russian novels
   * by an entirely different author — and everything gathered here is about to be attached to one
   * book, where a record by somebody else is not a weaker match but the wrong book. Anchoring on
   * the first record's author (which is what this did) therefore anchors on whatever the
   * catalogue's relevance ranking happened to put on top.
   *
   * So the query decides, and only the query: a record counts when its author is one of the people
   * it names. Nothing else counts — not the top-ranked record's author, and not the most common
   * author among the records. That last one was tried as a "best available guess" for a title-only
   * query, and it is exactly how a French monograph *about* the Iron Guard became an edition of
   * Codreanu's own memoir: no record was by anyone the query named, so the only author present won
   * by default. These providers only ever run to enrich a book somebody else has already
   * identified, and the query they are handed is that book's own title and author — so "no record
   * is by this person" is a complete answer, and contributing nothing is the right outcome.
   */
  private relevantRecords(
    records: CatalogRecord[],
    queryWords: readonly string[],
  ): CatalogRecord[] {
    const wanted = queryWords.map((word) => word.toLowerCase()).filter((word) => word.length >= 4);
    const queryText = queryWords.join(' ');
    return records.filter((record) => {
      if (!numbersAllowTheSameBook(queryText, record.title[0] ?? '')) return false;
      const author = this.authorOf(record);
      if (author === null) return false;
      return nameParts(author).some((part) => wanted.some((word) => sameNamePart(part, word)));
    });
  }

  /**
   * A stable id for one record.
   *
   * It has to be at least as discriminating as the edition natural key the sync builds
   * (work + language + publisher + year + title), because the sync trusts a repeated id to mean a
   * repeated *edition*: two records sharing an id but not a natural key make it reuse the first
   * edition's row id for the second edition's data, and Postgres rejects that on the primary key.
   * Found exactly that way — the DNB lists Laurus twice for 2016, from "Dörlemann" and "Dörlemann
   * eBook", and the whole enrichment failed with `duplicate key value violates unique constraint
   * "edition_pkey"`.
   *
   * So: the catalogue's own record identifier when it has one, then the ISBN — which *is* an
   * edition's identity — and only then the fields the natural key itself uses.
   */
  private recordId(
    record: CatalogRecord,
    title: string,
    language: string,
    isbns: readonly string[],
  ): string {
    // MARC 001, the catalogue's own control number — the most discriminating handle there is, and
    // the only one that separates two records agreeing on every bibliographic field.
    if (record.recordId) return `${this.config.id}:rec:${record.recordId}`;

    const ark = record.identifier.find((value) => value.includes('ark:'));
    if (ark) return ark;

    const isbn = isbns[0];
    if (isbn) return `${this.config.id}:isbn:${isbn}`;

    const year = extractYear(record.date) ?? 0;
    const publisher = (record.publisher[0] ?? '').toLowerCase();
    return `${this.config.id}:${title.toLowerCase()}:${language}:${publisher}:${year}`;
  }
}

/** The searchable words of a query, with anything that would break CQL quoting removed. */
function queryWords(queryText: string): string[] {
  return queryText
    .split(/\s+/)
    .map((word) => word.replace(/["\\]/g, '').trim())
    .filter((word) => word.length > 1);
}

/** `fetchEditions` is only ever given back what `searchWorks` produced — see the class comment. */
function queryExternalId(queryText: string): string {
  return `query:${queryText.trim()}`;
}

function queryFromExternalId(externalId: string): string | null {
  return externalId.startsWith('query:') ? externalId.slice('query:'.length) : null;
}

/** Walks the parsed SRU envelope for `<dc>` payloads, whatever the surrounding element names are. */
function collectDcNodes(node: unknown): Record<string, unknown>[] {
  if (Array.isArray(node)) return node.flatMap(collectDcNodes);
  if (!node || typeof node !== 'object') return [];

  const record = node as Record<string, unknown>;
  const dc = record['dc'];
  if (dc)
    return Array.isArray(dc) ? (dc as Record<string, unknown>[]) : [dc as Record<string, unknown>];

  return Object.values(record).flatMap(collectDcNodes);
}

/**
 * Bibliothèque nationale de France. `bib.anywhere` matches across every indexed field including
 * the uniform title, which is what lets a romanized Russian title find its French translation.
 */
export function createBnfProvider(
  fetcher: ResilientFetcher,
  cache: CachePort,
  userAgent: string,
): SruCatalogProvider {
  return new SruCatalogProvider(
    {
      id: 'bnf',
      endpoint: 'http://catalogue.bnf.fr/api/SRU',
      version: '1.2',
      recordSchema: 'dublincore',
      buildQuery: (words) => `bib.anywhere all "${words.join(' ')}"`,
      translatorRole: /traducteur|trad\./i,
      authorRole: /auteur/i,
    },
    fetcher,
    cache,
    userAgent,
  );
}

/** Deutsche Nationalbibliothek. `WOE` is its all-words index; the words are ANDed explicitly. */
export function createDnbProvider(
  fetcher: ResilientFetcher,
  cache: CachePort,
  userAgent: string,
): SruCatalogProvider {
  return new SruCatalogProvider(
    {
      id: 'dnb',
      endpoint: 'https://services.dnb.de/sru/dnb',
      version: '1.1',
      recordSchema: 'oai_dc',
      buildQuery: (words) => words.map((word) => `WOE=${word}`).join(' and '),
      translatorRole: /übersetzer|übers\./i,
      authorRole: /verfasser|autor/i,
    },
    fetcher,
    cache,
    userAgent,
  );
}

/**
 * K10plus — the union catalogue of the GBV and SWB library networks, some ninety million records
 * from several hundred German, Austrian and Swiss libraries.
 *
 * It is here because it is a *union* catalogue and the DNB is not. The DNB holds what a German
 * publisher deposited; K10plus holds what those libraries actually own, which is where the
 * out-of-print printings, the numbered and the limited ones, and the pre-war editions live.
 * Measured live: 78 records for "Vodolazkin" against the DNB's 9.
 *
 * `pica.all` searches every index at once. The breadth is why `relevantRecords` matters — a union
 * catalogue answers a novel's title with the dissertations about it too — and why the MARC leader
 * check in the parser drops the journal articles before the author filter ever sees them.
 */
export function createK10plusProvider(
  fetcher: ResilientFetcher,
  cache: CachePort,
  userAgent: string,
): SruCatalogProvider {
  return new SruCatalogProvider(
    {
      id: 'k10plus',
      endpoint: 'https://sru.k10plus.de/gvk',
      version: '1.1',
      recordSchema: 'marcxml',
      format: 'marcxml',
      buildQuery: (words) => words.map((word) => `pica.all=${word}`).join(' and '),
      // Only ever consulted for a record with no `$4` at all — K10plus fills it in, so these are
      // a safety net rather than the working path.
      translatorRole: /übersetzer|übers\./i,
      authorRole: /verfasser|autor/i,
      maxRecords: 100,
    },
    fetcher,
    cache,
    userAgent,
  );
}

/**
 * The Library of Congress, over its public SRU gateway.
 *
 * The English-language counterpart to the two continental catalogues, and the one that knows an
 * American or British printing exists. Its records carry `250` heavily — "Izd. 2-e, ispr. i dop.",
 * "First edition", "Limited ed." — which is the edition statement this project needs and the
 * reason the whole MARC path was written.
 *
 * `cql.serverChoice` is the only index the gateway advertises that matches across fields; the
 * words are ANDed rather than sent as a phrase, because as a phrase the gateway matches literally
 * and a query is a title and an author, never a phrase anyone catalogued (verified live: the
 * phrase form returns nothing at all for a book the ANDed form finds).
 *
 * It romanizes rather than transliterating to the original script, and files the Russian novel as
 * "Lavr" — so it answers the book's own title, not an English translation's, which is exactly what
 * enrichment hands it.
 */
export function createLocProvider(
  fetcher: ResilientFetcher,
  cache: CachePort,
  userAgent: string,
): SruCatalogProvider {
  return new SruCatalogProvider(
    {
      id: 'loc',
      endpoint: 'http://lx2.loc.gov:210/lcdb',
      version: '1.1',
      recordSchema: 'marcxml',
      format: 'marcxml',
      buildQuery: (words) => words.map((word) => `cql.serverChoice=${word}`).join(' and '),
      translatorRole: /translator|translated/i,
      authorRole: /author/i,
      maxRecords: 100,
    },
    fetcher,
    cache,
    userAgent,
  );
}

/**
 * LIBRIS, the Swedish national union catalogue.
 *
 * Scandinavian translations are absent from every source wired in before it, and a Swedish
 * edition is a translation by definition for all but a handful of the books here — so almost
 * everything it contributes is a language this instance did not have.
 *
 * MARCXML is not a preference here but the only option: the endpoint accepts `recordSchema=dc`
 * and answers in MARCXML regardless (verified live), so a Dublin Core parser would have found
 * nothing in a perfectly good response.
 */
export function createLibrisProvider(
  fetcher: ResilientFetcher,
  cache: CachePort,
  userAgent: string,
): SruCatalogProvider {
  return new SruCatalogProvider(
    {
      id: 'libris',
      endpoint: 'https://libris.kb.se/sru/libris',
      version: '1.1',
      recordSchema: 'marcxml',
      format: 'marcxml',
      // Each term quoted. Bare terms work until one carries an apostrophe — "Alice's" makes the
      // endpoint answer 400 with a CQL diagnostic, while the same query quoted returns 590
      // records (both verified live). `queryWords` has already removed the quote character
      // itself, so nothing here can escape the quoting.
      buildQuery: (words) => words.map((word) => `"${word}"`).join(' and '),
      translatorRole: /översättare|övers\./i,
      authorRole: /författare/i,
      maxRecords: 100,
    },
    fetcher,
    cache,
    userAgent,
  );
}

/**
 * Melinda — the union catalogue of the Finnish libraries.
 *
 * Finnish is a language no other source here reaches, and almost every Finnish edition of a book
 * not originally written in Finnish is a translation, so nearly everything this contributes is a
 * language this instance did not have for that book. `cql.serverChoice` is its all-fields index;
 * the words are ANDed, so the catalogue itself narrows to the right book (238 records for
 * "Carroll Liisa", 2 for "Vodolazkin Laurus" — verified live).
 */
export function createMelindaProvider(
  fetcher: ResilientFetcher,
  cache: CachePort,
  userAgent: string,
): SruCatalogProvider {
  return new SruCatalogProvider(
    {
      id: 'melinda',
      endpoint: 'https://sru.api.melinda.kansalliskirjasto.fi/bib',
      version: '1.1',
      recordSchema: 'marcxml',
      format: 'marcxml',
      buildQuery: (words) => words.map((word) => `cql.serverChoice=${word}`).join(' and '),
      // Only reached for a record with no `$4` relator code — Melinda's MARC generally has one.
      translatorRole: /kääntäjä|suom\./i,
      authorRole: /kirjoittaja|tekijä/i,
      maxRecords: 100,
    },
    fetcher,
    cache,
    userAgent,
  );
}

/**
 * swisscovery — the union catalogue of the Swiss library network, on Ex Libris Alma.
 *
 * The most marginal catalogue here, and worth saying so: Switzerland's holdings overlap K10plus in
 * German and the BnF in French, so much of what it returns is already known. It earns its place on
 * the parts that do not overlap — Swiss imprints, and Italian-language editions, which no other
 * source here covers at all. `alma.all_for_ui` is Alma's all-fields index, ANDed per word for the
 * same reason as everywhere else (1045 records for "Carroll Alice", 5 for "Vodolazkin Laurus").
 */
export function createSwisscoveryProvider(
  fetcher: ResilientFetcher,
  cache: CachePort,
  userAgent: string,
): SruCatalogProvider {
  return new SruCatalogProvider(
    {
      id: 'swisscovery',
      endpoint: 'https://swisscovery.slsp.ch/view/sru/41SLSP_NETWORK',
      version: '1.2',
      recordSchema: 'marcxml',
      format: 'marcxml',
      buildQuery: (words) => words.map((word) => `alma.all_for_ui="${word}"`).join(' and '),
      // Switzerland catalogues in four languages, so both wordings are worth having.
      translatorRole: /übersetzer|übers\.|traducteur|trad\./i,
      authorRole: /verfasser|autor|auteur/i,
      maxRecords: 100,
    },
    fetcher,
    cache,
    userAgent,
  );
}
