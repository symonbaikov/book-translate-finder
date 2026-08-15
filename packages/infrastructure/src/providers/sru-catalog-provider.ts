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

const CACHE_TTL_SECONDS = 6 * 60 * 60;
/** Records asked of a catalogue per query. A heavily translated author fills this easily. */
const MAX_RECORDS = 40;

export interface SruCatalogConfig {
  /** The `ProviderId` this catalogue is known by, e.g. `bnf`. */
  id: string;
  endpoint: string;
  /** SRU protocol version the endpoint speaks — BnF is 1.2, DNB is 1.1. */
  version: '1.1' | '1.2';
  recordSchema: string;
  /** Builds the catalogue's own CQL from the plain words of a query. */
  buildQuery(words: readonly string[]): string;
  /**
   * How this catalogue marks a translator on a contributor line — "Traducteur" at the BnF,
   * "Übersetzer" at the DNB. Matched case-insensitively against the whole line.
   */
  translatorRole: RegExp;
  /** How it marks the author, so a contributor line is not mistaken for one. */
  authorRole: RegExp;
}

interface DublinCoreRecord {
  title: string[];
  creator: string[];
  contributor: string[];
  publisher: string[];
  date: string[];
  language: string[];
  identifier: string[];
  format: string[];
  subject: string[];
}

const EMPTY_RECORD: DublinCoreRecord = {
  title: [],
  creator: [],
  contributor: [],
  publisher: [],
  date: [],
  language: [],
  identifier: [],
  format: [],
  subject: [],
};

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
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

/**
 * The book's title, without the cataloguing apparatus around it.
 *
 * Library records put the whole statement of responsibility in the title field:
 * `"L'archipel des Solovki : roman / Zakhar Prilepine ; traduit du russe par Joëlle Dublanchet"`,
 * and the DNB writes the original title in brackets first:
 * `"[Sankja] ; Sankya / Zakhar Prilepin ; aus dem Russischen von Erich Klein"`. Printed as-is that
 * is not a title a reader recognises, and it is a natural key nothing else will ever match.
 */
export function cleanCatalogTitle(raw: string): string {
  // Everything after " / " is who did what — authors, translators, illustrators.
  let title = raw.split(' / ')[0] ?? raw;
  // "[original title] ; local title" — keep the one this record is actually for.
  const afterBracket = /^\s*\[[^\]]*\]\s*;\s*(.+)$/.exec(title);
  if (afterBracket?.[1]) title = afterBracket[1];
  // " : roman", " : Erzählungen" — a form label, not part of the name.
  title = title.split(' : ')[0] ?? title;
  return title.replace(/\s+/g, ' ').trim();
}

/**
 * `"Prilepin, Zahar (1975-....). Auteur du texte"` → `"Zahar Prilepin"`.
 *
 * Both the life dates and the role are cataloguing metadata, and the inverted form is a filing
 * order. Restoring the natural order is what lets this author meet the same author as spelled by
 * every other source — the work's natural key is built from it.
 */
export function cleanCatalogName(raw: string): string {
  let name = raw
    .replace(/\[[^\]]*\]/g, '') // "[Verfasser]", "[Übersetzer]"
    .replace(/\((?:[^)]*\d{3,4}[^)]*)\)/g, '') // life dates
    .trim()
    .replace(/\.\s*[^.]*$/, (tail) => (/\d/.test(tail) ? tail : '')) // trailing role sentence
    .trim()
    .replace(/[.,;]+$/, '')
    .trim();

  const inverted = /^([^,]+),\s*(.+)$/.exec(name);
  if (inverted?.[1] && inverted[2]) name = `${inverted[2].trim()} ${inverted[1].trim()}`;
  return name.replace(/\s+/g, ' ').trim();
}

/** The first ISBN in a field that may also carry a binding and a price. */
export function extractIsbn(raw: string): string | null {
  const match = /(97[89][\d-]{10,17}|\d[\d-]{8,15}[\dXx])/.exec(raw);
  if (!match?.[1]) return null;
  const digits = match[1].replace(/-/g, '');
  return digits.length === 13 || digits.length === 10 ? digits : null;
}

/** `"1 vol. (820 p.) ; 24 cm"`, `"381 Seiten"` → the page count. */
export function extractPages(raw: string): number | null {
  const match = /(\d{2,5})\s*(?:p\b|pages?\b|S\.|Seiten\b)/i.exec(raw);
  if (!match?.[1]) return null;
  const pages = Number(match[1]);
  return Number.isFinite(pages) && pages > 0 ? pages : null;
}

function extractYear(values: readonly string[]): number | null {
  for (const value of values) {
    const match = /\b(1[0-9]{3}|20[0-9]{2})\b/.exec(value);
    if (match?.[1]) return Number(match[1]);
  }
  return null;
}

function nameParts(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, ' ')
    .split(/\s+/)
    .filter((part) => part.length >= 4);
}

/**
 * Whether two spellings of a name are the same person's, allowing for the tail each language adds.
 *
 * The BnF files Прилепин as "Prilepine", the DNB as "Prilepin", and a reader may type either.
 * Prefix matching in both directions covers that, and the four-character floor keeps short
 * particles ("van", "de") from matching everything.
 */
function sameNamePart(a: string, b: string): boolean {
  return a === b || a.startsWith(b) || b.startsWith(a);
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
        // The catalogues state the source language in prose ("traduit du russe par…") rather than
        // as a code, and guessing at it from that sentence would put a fabricated fact on a card.
        translatedFrom: null,
        publisher: record.publisher[0] ?? null,
        year: extractYear(record.date),
        isbn13: isbns.find((isbn) => isbn.length === 13) ?? null,
        isbn10: isbns.find((isbn) => isbn.length === 10) ?? null,
        pages: record.format.map(extractPages).find((pages) => pages !== null) ?? null,
        binding: null,
        rightsSignal: 'unknown',
      });
    }
    return editions;
  }

  /** A catalogue describes editions, not works — it has no blurb, no cover and no genre to give. */
  async fetchWorkDetails(): Promise<ProviderWorkDetails> {
    return { description: null, coverUrl: null, subjects: [] };
  }

  private async fetchRecords(queryText: string): Promise<DublinCoreRecord[]> {
    const words = queryWords(queryText);
    if (words.length === 0) return [];

    const cacheKey = `provider:${this.config.id}:records:${encodeURIComponent(words.join(' ').toLowerCase())}`;
    const cached = await this.cache.get<DublinCoreRecord[]>(cacheKey);
    if (cached) return cached;

    const url = `${this.config.endpoint}?${new URLSearchParams({
      version: this.config.version,
      operation: 'searchRetrieve',
      recordSchema: this.config.recordSchema,
      maximumRecords: String(MAX_RECORDS),
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

  private parseRecords(xml: string): DublinCoreRecord[] {
    const parsed = this.parser.parse(xml) as Record<string, unknown>;
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

  /** The record's author, preferring a line the catalogue explicitly marks as one. */
  private authorOf(record: DublinCoreRecord): string | null {
    const marked = record.creator.find((line) => this.config.authorRole.test(line));
    const unmarked = record.creator.find((line) => !this.config.translatorRole.test(line));
    const chosen = marked ?? unmarked ?? record.creator[0];
    if (!chosen) return null;
    const name = cleanCatalogName(chosen);
    return name.length > 0 ? name : null;
  }

  private translatorOf(record: DublinCoreRecord): string | null {
    const line = [...record.contributor, ...record.creator].find((entry) =>
      this.config.translatorRole.test(entry),
    );
    if (!line) return null;
    const name = cleanCatalogName(line);
    return name.length > 0 ? name : null;
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
    records: DublinCoreRecord[],
    queryWords: readonly string[],
  ): DublinCoreRecord[] {
    const wanted = queryWords.map((word) => word.toLowerCase()).filter((word) => word.length >= 4);
    return records.filter((record) => {
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
    record: DublinCoreRecord,
    title: string,
    language: string,
    isbns: readonly string[],
  ): string {
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
