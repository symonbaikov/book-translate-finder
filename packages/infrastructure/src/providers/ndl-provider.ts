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
  splitQueryHalves,
  cleanCatalogName,
  decodeEntities,
  cleanCatalogTitle,
  extractIsbn,
  extractPages,
  extractYear,
  nameParts,
  numbersAllowTheSameBook,
  sameNamePart,
} from './catalog-record.js';

const CACHE_TTL_SECONDS = 6 * 60 * 60;
const ENDPOINT = 'https://ndlsearch.ndl.go.jp/api/sru';
const MAX_RECORDS = 50;
/** Title words sent per query. Three is enough to pin a book and keeps the URL sane. */
const MAX_TITLE_TERMS = 3;

/**
 * How this catalogue marks a role, as a suffix on the name itself: `中村, 白葉/訳` is the
 * translator, `フョードル・ドストエフスキー/著` the author. `編` is an editor and `監修` a
 * supervisor — both are named on a record and neither wrote the book.
 */
const TRANSLATOR_SUFFIX = /\/訳$/;
/**
 * Not every record carries the suffix. The NDL's own JAPAN/MARC records do
 * (`中村, 白葉/訳`); the records it aggregates from other libraries name the same people with no
 * role at all, and there the translator is simply not stated in a form anything can read. Left
 * `null` rather than guessed at — the second name on a record is not reliably its translator.
 */
const NON_AUTHOR_SUFFIX = /\/(訳|編|編集|監修|絵|画|校訂)$/;

/**
 * The National Diet Library of Japan, over its open SRU API.
 *
 * **Why it is reachable at all from this project.** Every other catalogue here is asked in the
 * Latin alphabet, and a Japanese edition is catalogued in Japanese — 罪と罰, not "Crime and
 * Punishment" — so the obvious expectation is that the two never meet. They do: the NDL records a
 * romanized form of the author alongside the Japanese one, and `creator="Dostoyevsky"` returns
 * 2787 records of which effectively all are Japanese-language editions (measured live). The
 * romanization is the Anglo-American one, which is the same tradition Open Library follows — so
 * the author name this project already holds is usually the one that works.
 *
 * The title reaches it the same way. `anywhere` matches the romanized and original title the NDL
 * records alongside the Japanese one, so `creator="Dostoyevsky" AND anywhere="Crime" AND
 * anywhere="Punishment"` finds Japanese editions of that novel and only that novel. Both halves of
 * the query are always sent: on the author alone the answer is the author's entire shelf — every
 * novel they wrote, plus anthologies they appear in — and all of it would be attached to one book.
 *
 * Enrichment only, never discovery: a Japanese record's title is the Japanese title, and
 * discovering a Russian novel through it would file the book as Japanese.
 */
export class NdlProvider implements BookMetadataProvider {
  readonly id = ProviderId.create('ndl');
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    parseTagValue: false,
    trimValues: true,
  });

  constructor(
    private readonly fetcher: ResilientFetcher,
    private readonly cache: CachePort,
    private readonly userAgent: string,
  ) {}

  async searchWorks(query: SearchQuery): Promise<ProviderWork[]> {
    const relevant = this.relevantRecords(await this.fetchRecords(query.text), query.text);
    if (relevant.length === 0) return [];

    const earliest = [...relevant].sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999))[0]!;
    const author = authorOf(earliest);
    if (!author) return [];

    return [
      {
        externalId: queryExternalId(query.text),
        title: cleanCatalogTitle(earliest.title),
        authorNames: [author],
        languages: earliest.languages,
        firstPublishedYear: earliest.year,
        editionCount: relevant.length,
        coverUrl: null, // The API publishes no cover images.
      },
    ].filter((work) => work.title.length > 0);
  }

  async fetchEditions(externalWorkId: string): Promise<ProviderEdition[]> {
    const query = queryFromExternalId(externalWorkId);
    if (!query) return [];

    const editions: ProviderEdition[] = [];
    for (const record of this.relevantRecords(await this.fetchRecords(query), query)) {
      const language = record.languages[0];
      const title = cleanCatalogTitle(record.title);
      if (!language || title.length === 0) continue;

      editions.push({
        externalId: `ndl:rec:${record.id}`,
        title,
        language,
        coverUrl: null,
        translator: translatorOf(record),
        // The record states no language-of-original anywhere, and inferring "this is a translation
        // from Russian" from the author's nationality would be a fabricated fact.
        translatedFrom: null,
        publisher: record.publisher,
        year: record.year,
        isbn13: record.isbns.find((isbn) => isbn.length === 13) ?? null,
        isbn10: record.isbns.find((isbn) => isbn.length === 10) ?? null,
        pages: record.extent.map(extractPages).find((pages) => pages !== null) ?? null,
        binding: null,
        editionStatement: record.edition,
        rightsSignal: 'unknown',
      });
    }
    return editions;
  }

  /** A catalogue describes editions, not works — no blurb, no cover, no genre to give. */
  async fetchWorkDetails(): Promise<ProviderWorkDetails> {
    return { description: null, coverUrl: null, subjects: [] };
  }

  private async fetchRecords(queryText: string): Promise<NdlRecord[]> {
    const { title, author } = splitQueryHalves(queryText);
    // Both halves are required. Asked by author alone this catalogue answers with that author's
    // entire shelf — every one of their novels, not this one — see `splitQueryHalves`.
    if (title.length === 0 || author.length === 0) return [];

    const cacheKey = `provider:ndl:records:v2:${encodeURIComponent([...title, ...author].join(' '))}`;
    const cached = await this.cache.get<NdlRecord[]>(cacheKey);
    if (cached) return cached;

    const byId = new Map<string, NdlRecord>();
    for (const name of author) {
      for (const record of await this.fetchByCreator(name, title)) byId.set(record.id, record);
    }

    const records = [...byId.values()];
    await this.cache.set(cacheKey, records, CACHE_TTL_SECONDS);
    return records;
  }

  private async fetchByCreator(name: string, titleWords: readonly string[]): Promise<NdlRecord[]> {
    // `anywhere` rather than `title` for the title words: it reaches the romanized and original
    // title the NDL records alongside the Japanese one, which is the only way an English title can
    // find a Japanese edition (`creator="Dostoyevsky" AND anywhere="Crime" AND anywhere="Punishment"`
    // returns 100 records; the same query without the title words returns that author's whole shelf).
    const terms = [
      `creator="${name}"`,
      ...titleWords.slice(0, MAX_TITLE_TERMS).map((word) => `anywhere="${word}"`),
      // `mediatype="books"` keeps out the journal articles and conference papers the NDL indexes
      // alongside them — a paper about a novel is not an edition of it.
      'mediatype="books"',
    ];

    const url = `${ENDPOINT}?${new URLSearchParams({
      operation: 'searchRetrieve',
      version: '1.2',
      recordSchema: 'dcndl',
      maximumRecords: String(MAX_RECORDS),
      query: terms.join(' AND '),
    })}`;

    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!res.ok) throw new Error(`ndl SRU search failed with status ${res.status}`);

    return this.parseRecords(await res.text());
  }

  /**
   * The NDL nests its records as **escaped XML inside `<recordData>`**, not as child elements —
   * so the envelope is parsed first, and each record's text is then parsed again as a document of
   * its own. Parsing the response in one pass finds no fields at all.
   */
  private parseRecords(xml: string): NdlRecord[] {
    const envelope = this.parser.parse(xml) as Record<string, unknown>;
    return collectStrings(envelope, 'recordData')
      .flatMap((recordXml) => {
        const parsed = this.parser.parse(recordXml) as Record<string, unknown>;
        return collectNodes(parsed, 'BibResource');
      })
      .map(readRecord)
      .filter((record): record is NdlRecord => record !== null);
  }

  /**
   * The same rule the other catalogues use — see `SruCatalogProvider.relevantRecords` — judged
   * against the same words the catalogue was *asked* about, never against the whole query.
   */
  private relevantRecords(records: NdlRecord[], queryText: string): NdlRecord[] {
    const wanted = splitQueryHalves(queryText).author.map((word) => word.toLowerCase());
    return records.filter(
      (record) =>
        numbersAllowTheSameBook(queryText, record.title) &&
        // Every name on the record that is not marked as somebody else's contribution, rather than
        // only the one chosen as *the* author. A record carries the same person twice — once in
        // Japanese and once romanized — and only the romanized spelling can meet the query.
        record.agents
          .filter((agent) => !NON_AUTHOR_SUFFIX.test(agent))
          .some((agent) =>
            nameParts(cleanCatalogName(stripRole(agent))).some((part) =>
              wanted.some((word) => sameNamePart(part, word)),
            ),
          ),
    );
  }
}

interface NdlRecord {
  id: string;
  title: string;
  agents: string[];
  publisher: string | null;
  year: number | null;
  languages: string[];
  isbns: string[];
  extent: string[];
  edition: string | null;
}

function readRecord(node: Record<string, unknown>): NdlRecord | null {
  const title = text(node['title']);
  if (!title) return null;

  const agents = collectStrings(node['creator'], 'name');
  const identifiers = collectValues(node['identifier']);
  const dates = [...collectValues(node['issued']), ...collectValues(node['date'])];

  return {
    id: attr(node, 'about') ?? title,
    title,
    agents,
    publisher: collectStrings(node['publisher'], 'name')[0] ?? null,
    year: extractYear(dates),
    languages: collectValues(node['language']),
    isbns: identifiers.map(extractIsbn).filter((isbn): isbn is string => isbn !== null),
    extent: collectValues(node['extent']),
    edition: text(node['edition']) || null,
  };
}

/** `"中村, 白葉/訳"` → `"中村, 白葉"`. The suffix is the role, not part of the name. */
function stripRole(name: string): string {
  return name.replace(/\/[^/]*$/, '').trim();
}

function authorOf(record: NdlRecord): string | null {
  const chosen = record.agents.find((agent) => !NON_AUTHOR_SUFFIX.test(agent));
  if (!chosen) return null;
  const name = cleanCatalogName(stripRole(chosen));
  return name.length > 0 ? name : null;
}

function translatorOf(record: NdlRecord): string | null {
  const chosen = record.agents.find((agent) => TRANSLATOR_SUFFIX.test(agent));
  if (!chosen) return null;
  const name = cleanCatalogName(stripRole(chosen));
  return name.length > 0 ? name : null;
}

function queryExternalId(queryText: string): string {
  return `query:${queryText.trim()}`;
}

function queryFromExternalId(externalId: string): string | null {
  return externalId.startsWith('query:') ? externalId.slice('query:'.length) : null;
}

/** Every node under `node` whose element name is `name`, at any depth. */
function collectNodes(node: unknown, name: string): Record<string, unknown>[] {
  if (Array.isArray(node)) return node.flatMap((entry) => collectNodes(entry, name));
  if (!node || typeof node !== 'object') return [];

  const record = node as Record<string, unknown>;
  const found = record[name];
  if (found !== undefined) {
    return (Array.isArray(found) ? found : [found]).filter(
      (entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object',
    );
  }
  return Object.values(record).flatMap((child) => collectNodes(child, name));
}

/** Every string value found under `name`, at any depth — `foaf:name` is two levels down. */
function collectStrings(node: unknown, name: string): string[] {
  if (Array.isArray(node)) return node.flatMap((entry) => collectStrings(entry, name));
  if (!node || typeof node !== 'object') return [];

  const record = node as Record<string, unknown>;
  const found = record[name];
  const here =
    found === undefined
      ? []
      : (Array.isArray(found) ? found : [found]).map(text).filter((value) => value.length > 0);
  const deeper = Object.entries(record)
    .filter(([key]) => key !== name)
    .flatMap(([, child]) => collectStrings(child, name));
  return [...here, ...deeper];
}

/** Repeated simple elements (`dcterms:language`, `dcterms:identifier`) as plain strings. */
function collectValues(node: unknown): string[] {
  if (node === undefined || node === null) return [];
  return (Array.isArray(node) ? node : [node]).map(text).filter((value) => value.length > 0);
}

/**
 * An element's text, whether it is a bare string, an element with attributes, or the
 * `<rdf:Description><rdf:value>` wrapper the NDL uses for anything with a reading attached.
 *
 * The array case is not defensive padding: stripping namespace prefixes collapses `dcterms:title`
 * and `dc:title` onto the same key, so the parser hands back both spellings of the title as a
 * list. Read as a single node that is an empty string, and every record is silently discarded for
 * having no title — which is exactly what happened before this branch existed.
 */
function text(node: unknown): string {
  if (Array.isArray(node)) {
    for (const entry of node) {
      const value = text(entry);
      if (value.length > 0) return value;
    }
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return decodeEntities(String(node).trim());
  }
  if (!node || typeof node !== 'object') return '';

  const record = node as Record<string, unknown>;
  if ('#text' in record) return String(record['#text']).trim();
  if (record['Description'])
    return text((record['Description'] as Record<string, unknown>)['value']);
  if (record['value'] !== undefined) return text(record['value']);
  return '';
}

function attr(node: Record<string, unknown>, name: string): string | null {
  const value = node[`@_${name}`];
  return value === undefined || value === null ? null : String(value);
}
