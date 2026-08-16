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
  cleanCatalogName,
  cleanCatalogTitle,
  decodeEntities,
  extractYear,
  nameParts,
  numbersAllowTheSameBook,
  sameNamePart,
  splitQueryHalves,
} from './catalog-record.js';

const CACHE_TTL_SECONDS = 6 * 60 * 60;
const ENDPOINT = 'https://gallica.bnf.fr/SRU';
const MAX_RECORDS = 50;
/** (author word, title word) pairs tried. Each is a request; three covers the realistic shapes. */
const MAX_LOOKUPS = 3;

/**
 * What the BnF writes in `dc:rights` for a digitised public domain item — in French and in
 * English, both of which appear on the same record.
 */
const PUBLIC_DOMAIN_RIGHTS = /domaine public|public domain/i;
/** Gallica holds newspapers, maps and sheet music too; only a printed book is an edition here. */
const MONOGRAPH_TYPE = /monographie|text/i;
const NOT_A_BOOK_TYPE = /fascicule|périodique|publication en série|carte|partition|image/i;

/**
 * Gallica, the digital library of the Bibliothèque nationale de France (ADR-0013).
 *
 * The first source here that hands a reader a **free legal copy in French**. Everything else that
 * offers a free copy is English-dominated — Project Gutenberg overwhelmingly so — and a reader
 * after a nineteenth-century French book got nothing, though France digitised it long ago.
 *
 * **The rights rule, which is the whole reason this provider is allowed to exist.** Gallica states
 * `dc:rights` per record, and for a digitised public domain book it reads "domaine public". That
 * is a statement about the *work*, made by the national library of the country whose law governs
 * it — not an access label of the kind
 * [ADR-0011](docs/adr/0011-access-label-is-not-a-rights-statement.md) refuses to read as
 * permission. So: a record that says it is public domain yields a download link; a record that
 * says anything else, or nothing, yields the edition and **no link**. Nothing is inferred, and
 * `LinkPolicy` re-checks the claim afterwards regardless — Gallica is deliberately not on the
 * chartered list, so the 95-year plausibility guard still applies to everything it offers.
 *
 * Unlike the library catalogues this is not enrichment-by-translation: a Gallica record is a
 * French printing, so it is registered as an enrichment source for the same reason they are —
 * discovering a book through it would file an English novel under its French title.
 *
 * Two limits found live and worth stating. It catalogues names in French romanization, so
 * `dc.creator all "Dostoyevsky"` finds nothing where "Dostoïevski" would — a book reaches this
 * source only if the author's name happens to agree. And, in common with every catalogue here, it
 * answers a title word rather than a work: an "Alice" query also returns *Through the Looking-Glass
 * and What Alice Found There*, which is a sequel rather than another printing of the same book.
 */
export class GallicaProvider implements BookMetadataProvider {
  readonly id = ProviderId.create('gallica');
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

    const earliest = [...relevant].sort(
      (a, b) => (extractYear(a.dates) ?? 9999) - (extractYear(b.dates) ?? 9999),
    )[0]!;
    const author = authorOf(earliest);
    if (!author) return [];

    return [
      {
        externalId: queryExternalId(query.text),
        title: cleanCatalogTitle(earliest.titles[0] ?? ''),
        authorNames: [author],
        languages: earliest.languages,
        firstPublishedYear: extractYear(earliest.dates),
        editionCount: relevant.length,
        coverUrl: null, // The SRU records carry no cover; the scan itself is behind the ark.
      },
    ].filter((work) => work.title.length > 0);
  }

  async fetchEditions(externalWorkId: string): Promise<ProviderEdition[]> {
    const query = queryFromExternalId(externalWorkId);
    if (!query) return [];

    const editions: ProviderEdition[] = [];
    for (const record of this.relevantRecords(await this.fetchRecords(query), query)) {
      const language = record.languages.find((code) => code.length === 3 || code.length === 2);
      const title = cleanCatalogTitle(record.titles[0] ?? '');
      if (!language || title.length === 0) continue;

      // The link exists only when this record says its own item is public domain. A record that
      // does not say so is still a real printing worth listing — it just comes without a copy.
      const isPublicDomain = record.rights.some((value) => PUBLIC_DOMAIN_RIGHTS.test(value));
      const links =
        isPublicDomain && record.arkUrl
          ? [{ type: 'download' as const, url: record.arkUrl, provider: 'gallica', format: 'HTML' }]
          : undefined;

      editions.push({
        externalId: `gallica:${record.arkUrl ?? `${title}:${language}`}`,
        title,
        language,
        coverUrl: null,
        translator: translatorOf(record),
        // Gallica states the source language in prose ("traduit de l'anglais"), never as a code —
        // and reading it out of that sentence would put a fabricated fact on a card.
        translatedFrom: null,
        publisher: record.publishers[0] ?? null,
        year: extractYear(record.dates),
        isbn13: null,
        isbn10: null,
        pages: null,
        binding: null,
        editionStatement: null,
        rightsSignal: isPublicDomain ? 'public_domain' : 'unknown',
        ...(links ? { links } : {}),
      });
    }
    return editions;
  }

  /** A digital library describes copies, not works — no blurb, no cover, no genre to give. */
  async fetchWorkDetails(): Promise<ProviderWorkDetails> {
    return { description: null, coverUrl: null, subjects: [] };
  }

  /**
   * One request per (author word, title word) pair.
   *
   * Both halves always, and field-scoped: `dc.creator` for the author and `dc.title` for the book.
   * That pairing is what stops this from behaving like the Polish catalogue did before
   * `splitQueryHalves` — asked for `dc.creator all "Lewis"` alone it would answer with C. S. Lewis
   * as readily as with Lewis Carroll.
   *
   * One title word at a time rather than all of them, because Gallica catalogues in French and the
   * query carries the book's own title: ANDing "Crime" and "Punishment" against "Crime et
   * châtiment" matches nothing, while "Crime" alone paired with the author finds it.
   */
  private async fetchRecords(queryText: string): Promise<GallicaRecord[]> {
    const { title, author } = splitQueryHalves(queryText);
    if (title.length === 0 || author.length === 0) return [];

    const cacheKey = `provider:gallica:records:${encodeURIComponent([...title, ...author].join(' '))}`;
    const cached = await this.cache.get<GallicaRecord[]>(cacheKey);
    if (cached) return cached;

    const pairs = author
      .flatMap((name) => title.map((titleWord) => [name, titleWord] as const))
      .slice(0, MAX_LOOKUPS);

    const byId = new Map<string, GallicaRecord>();
    for (const [name, titleWord] of pairs) {
      for (const record of await this.fetchPair(name, titleWord)) {
        byId.set(record.arkUrl ?? `${record.titles[0] ?? ''}:${record.dates[0] ?? ''}`, record);
      }
    }

    const records = [...byId.values()];
    await this.cache.set(cacheKey, records, CACHE_TTL_SECONDS);
    return records;
  }

  private async fetchPair(name: string, titleWord: string): Promise<GallicaRecord[]> {
    const url = `${ENDPOINT}?${new URLSearchParams({
      operation: 'searchRetrieve',
      version: '1.2',
      maximumRecords: String(MAX_RECORDS),
      query: `dc.creator all "${name}" and dc.title all "${titleWord}"`,
    })}`;

    // Without a User-Agent this endpoint answers 403 — our etiquette header is load-bearing here,
    // not decoration.
    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!res.ok) throw new Error(`gallica SRU search failed with status ${res.status}`);

    return this.parseRecords(await res.text());
  }

  private parseRecords(xml: string): GallicaRecord[] {
    const parsed = this.parser.parse(xml) as Record<string, unknown>;
    return collectDcNodes(parsed).map(readRecord).filter(isBook);
  }

  /** The same author rule every catalogue here uses — see `SruCatalogProvider.relevantRecords`. */
  private relevantRecords(records: GallicaRecord[], queryText: string): GallicaRecord[] {
    const wanted = splitQueryHalves(queryText).author.map((word) => word.toLowerCase());
    return records.filter((record) => {
      if (!numbersAllowTheSameBook(queryText, record.titles[0] ?? '')) return false;
      const author = authorOf(record);
      if (author === null) return false;
      return nameParts(author).some((part) => wanted.some((word) => sameNamePart(part, word)));
    });
  }
}

interface GallicaRecord {
  titles: string[];
  creators: string[];
  publishers: string[];
  dates: string[];
  languages: string[];
  rights: string[];
  types: string[];
  arkUrl: string | null;
}

function isBook(record: GallicaRecord): boolean {
  if (record.types.some((type) => NOT_A_BOOK_TYPE.test(type))) return false;
  return record.types.some((type) => MONOGRAPH_TYPE.test(type));
}

function readRecord(node: Record<string, unknown>): GallicaRecord {
  const identifiers = values(node['identifier']);
  return {
    titles: values(node['title']),
    creators: values(node['creator']),
    publishers: values(node['publisher']),
    dates: values(node['date']),
    languages: values(node['language']),
    rights: values(node['rights']),
    types: values(node['type']),
    arkUrl: identifiers.find((value) => value.startsWith('https://gallica.bnf.fr/ark:')) ?? null,
  };
}

/** The BnF writes roles in prose, the same way its main catalogue does: "Auteur du texte". */
const TRANSLATOR_ROLE = /traducteur|traductrice|trad\./i;
const AUTHOR_ROLE = /auteur|autrice/i;

function authorOf(record: GallicaRecord): string | null {
  const chosen =
    record.creators.find((line) => AUTHOR_ROLE.test(line) && !TRANSLATOR_ROLE.test(line)) ??
    record.creators.find((line) => !TRANSLATOR_ROLE.test(line)) ??
    record.creators[0];
  if (!chosen) return null;
  const name = cleanCatalogName(chosen);
  return name.length > 0 ? name : null;
}

function translatorOf(record: GallicaRecord): string | null {
  const chosen = record.creators.find((line) => TRANSLATOR_ROLE.test(line));
  if (!chosen) return null;
  const name = cleanCatalogName(chosen);
  return name.length > 0 ? name : null;
}

function values(node: unknown): string[] {
  if (node === undefined || node === null) return [];
  return (Array.isArray(node) ? node : [node])
    .map((entry) => {
      if (typeof entry === 'string' || typeof entry === 'number') return String(entry);
      if (entry && typeof entry === 'object' && '#text' in entry) {
        return String((entry as { '#text': unknown })['#text']);
      }
      return '';
    })
    .map((value) => decodeEntities(value.trim()))
    .filter((value) => value.length > 0);
}

/** Walks the SRU envelope for `<dc>` payloads, whatever the surrounding element names are. */
function collectDcNodes(node: unknown): Record<string, unknown>[] {
  if (Array.isArray(node)) return node.flatMap(collectDcNodes);
  if (!node || typeof node !== 'object') return [];

  const record = node as Record<string, unknown>;
  const dc = record['dc'];
  if (dc)
    return Array.isArray(dc) ? (dc as Record<string, unknown>[]) : [dc as Record<string, unknown>];

  return Object.values(record).flatMap(collectDcNodes);
}

function queryExternalId(queryText: string): string {
  return `query:${queryText.trim()}`;
}

function queryFromExternalId(externalId: string): string | null {
  return externalId.startsWith('query:') ? externalId.slice('query:'.length) : null;
}
