import type {
  BookMetadataProvider,
  CachePort,
  ProviderEdition,
  ProviderWork,
  ProviderWorkDetails,
  SearchQuery,
} from '@golden/domain';
import { ProviderId } from '@golden/domain';
import type { ResilientFetcher } from '../http/resilient-fetch.js';
import {
  splitQueryHalves,
  cleanCatalogName,
  cleanCatalogTitle,
  extractIsbn,
  extractPages,
  extractYear,
  nameParts,
  numbersAllowTheSameBook,
  sameNamePart,
  type CatalogRecord,
} from './catalog-record.js';
import {
  TRANSLATOR_RELATOR,
  isAuthorRelator,
  isMonograph,
  marcRecordFrom,
  type MarcField,
  type MarcSource,
} from './marc-record.js';

const CACHE_TTL_SECONDS = 6 * 60 * 60;
const ENDPOINT = 'https://data.bn.org.pl/api/institutions/bibs.json';
/** Records per author lookup. Generous: this is the only request made per name. */
const MAX_RECORDS = 50;
/** Title words tried per author name — each is its own request, so keep the product small. */
const MAX_TITLE_TERMS = 2;
/** How this catalogue words a translator's role in `$e`; it states no `$4` relator codes. */
const TRANSLATOR_ROLE = /tłumacz|przekład|przeł\./i;

/**
 * The National Library of Poland (Biblioteka Narodowa), over its open JSON API.
 *
 * Polish is absent from every other source wired in — the two national catalogues here are French
 * and German, the union catalogue is German-speaking, LIBRIS is Swedish — and a Polish edition of
 * a book not written in Polish is a translation by definition, so nearly everything this
 * contributes is a language this instance did not have for that book.
 *
 * **It answers in MARC, and that is why it is worth the separate adapter.** Every record carries
 * its own MARC under `marc`, so the fields that make this project's card — the language as an ISO
 * code rather than the Polish word for it, `041 $h` for what it was translated from, `250` for the
 * edition statement — are read by exactly the same rules as the SRU catalogues (marc-record.ts).
 * The plain top-level JSON alongside it states the language as "polski" and the original as
 * "rosyjski", which is a fact about Polish, not about the book.
 *
 * **Its awkwardness, stated rather than hidden.** The API has no index that searches across
 * fields, and `title` matches only from the *beginning* of the catalogued title — "Lavr" does not
 * find "Laur / Lavr,". An unrecognised parameter is also *ignored* rather than rejected, so a
 * query it cannot express comes back as a page of arbitrary books rather than as an error. Hence
 * one request per (author word, title word) pair, and never an author on its own: asked that way
 * it answers with everyone who shares a word with the name, which attached *Liar's Poker* and
 * *The Magician's Nephew* to *Alice's Adventures in Wonderland* before `splitQueryHalves` existed.
 *
 * Enrichment only, never discovery — a Polish record's title is the Polish title, and discovering
 * a Russian novel through it would file it as a Polish book (see `SruCatalogProvider`).
 */
export class PolishLibraryProvider implements BookMetadataProvider {
  readonly id = ProviderId.create('bn-poland');

  constructor(
    private readonly fetcher: ResilientFetcher,
    private readonly cache: CachePort,
    private readonly userAgent: string,
  ) {}

  /** Same shape as `SruCatalogProvider.searchWorks`: the catalogue has no notion of a work, so one
   * is composed from the records, and the query itself is the only handle it can be re-asked by. */
  async searchWorks(query: SearchQuery): Promise<ProviderWork[]> {
    const relevant = this.relevantRecords(await this.fetchRecords(query.text), query.text);
    if (relevant.length === 0) return [];

    // The earliest record: a translation cannot predate its original.
    const earliest = [...relevant].sort(
      (a, b) => (extractYear(a.date) ?? 9999) - (extractYear(b.date) ?? 9999),
    )[0]!;
    const author = authorOf(earliest);
    if (!author) return [];

    return [
      {
        externalId: queryExternalId(query.text),
        title: cleanCatalogTitle(earliest.title[0] ?? ''),
        authorNames: [author],
        languages: earliest.language,
        firstPublishedYear: extractYear(earliest.date),
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
      const language = record.language[0];
      const title = cleanCatalogTitle(record.title[0] ?? '');
      if (!language || title.length === 0) continue;

      const isbns = record.identifier.map(extractIsbn).filter((v): v is string => v !== null);
      editions.push({
        externalId: `bn-poland:rec:${record.recordId ?? `${title}:${language}`}`,
        title,
        language,
        coverUrl: null,
        translator: translatorOf(record),
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

  /** A catalogue describes editions, not works — no blurb, no cover, no genre to give. */
  async fetchWorkDetails(): Promise<ProviderWorkDetails> {
    return { description: null, coverUrl: null, subjects: [] };
  }

  /**
   * One lookup per (author word, title word) pair, merged and de-duplicated on the record id.
   *
   * A failing lookup is not swallowed: this provider only ever runs as enrichment, where the
   * caller already treats a thrown error as "this source had nothing to add" and keeps the work
   * it has. Silently returning the successful half instead would put a partial edition list on a
   * card and call it complete.
   */
  private async fetchRecords(queryText: string): Promise<CatalogRecord[]> {
    const { title, author } = splitQueryHalves(queryText);
    // Both halves, always. Asked by author alone this catalogue answers with everyone who shares a
    // word with that name — see `splitQueryHalves` for what that did to *Alice in Wonderland*.
    if (title.length === 0 || author.length === 0) return [];

    const cacheKey = `provider:bn-poland:records:v2:${encodeURIComponent([...title, ...author].join(' '))}`;
    const cached = await this.cache.get<CatalogRecord[]>(cacheKey);
    if (cached) return cached;

    const byId = new Map<string, CatalogRecord>();
    for (const name of author) {
      for (const titleWord of title.slice(0, MAX_TITLE_TERMS)) {
        for (const record of await this.fetchByAuthorAndTitle(name, titleWord)) {
          byId.set(
            record.recordId ?? `${record.title[0] ?? ''}:${record.language[0] ?? ''}`,
            record,
          );
        }
      }
    }

    const records = [...byId.values()];
    await this.cache.set(cacheKey, records, CACHE_TTL_SECONDS);
    return records;
  }

  /**
   * One pair at a time, because `title` here matches only from the *beginning* of the catalogued
   * title: "Lavr" does not find "Laur / Lavr,", so the right title word cannot be guessed in
   * advance and each is tried. The catalogue records the original title alongside the Polish one
   * — `author=Carroll&title=Alice` returns "Alice's adventures in Wonderland (pol.)" — which is
   * what lets an English title reach a Polish edition.
   */
  private async fetchByAuthorAndTitle(name: string, titleWord: string): Promise<CatalogRecord[]> {
    const url = `${ENDPOINT}?${new URLSearchParams({
      author: name,
      title: titleWord,
      limit: String(MAX_RECORDS),
    })}`;

    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!res.ok) {
      throw new Error(`bn-poland search failed with status ${res.status}`);
    }

    const body = (await res.json()) as { bibs?: unknown };
    if (!Array.isArray(body.bibs)) return [];

    return body.bibs
      .map(marcSourceOf)
      .filter((source): source is MarcSource => source !== null)
      .filter(isMonograph)
      .map(marcRecordFrom);
  }

  /** The same rule as `SruCatalogProvider.relevantRecords` — see its comment for why only this. */
  private relevantRecords(records: CatalogRecord[], queryText: string): CatalogRecord[] {
    // Judged against the same words the catalogue was asked about — see `splitQueryHalves`.
    const wanted = splitQueryHalves(queryText).author.map((word) => word.toLowerCase());
    return records.filter((record) => {
      if (!numbersAllowTheSameBook(queryText, record.title[0] ?? '')) return false;
      const author = authorOf(record);
      if (author === null) return false;
      return nameParts(author).some((part) => wanted.some((word) => sameNamePart(part, word)));
    });
  }
}

/** This catalogue states no `$4` codes, so a role is only ever `$e` in Polish. */
function authorOf(record: CatalogRecord): string | null {
  const agents = record.agents ?? [];
  const chosen =
    agents.find((agent) => isAuthorRelator(agent.relator)) ??
    agents.find((agent) => !isTranslator(agent.relator, agent.roleTerm));
  if (!chosen) return null;
  const name = cleanCatalogName(chosen.name);
  return name.length > 0 ? name : null;
}

function translatorOf(record: CatalogRecord): string | null {
  const chosen = (record.agents ?? []).find((agent) => isTranslator(agent.relator, agent.roleTerm));
  if (!chosen) return null;
  const name = cleanCatalogName(chosen.name);
  return name.length > 0 ? name : null;
}

function isTranslator(relator: string | null, roleTerm: string | null): boolean {
  if (relator === TRANSLATOR_RELATOR) return true;
  if (relator !== null) return false;
  return roleTerm !== null && TRANSLATOR_ROLE.test(roleTerm);
}

/**
 * `bib.marc` in the shape the shared MARC rules read.
 *
 * The serialization is the only difference from MARCXML: fields are a list of one-key objects,
 * a control field's value is the string itself, and a data field's subfields are one-key objects
 * too — `{"a": "Vodolazkin, Evgenij"}` where MARCXML writes `<subfield code="a">`.
 */
function marcSourceOf(bib: unknown): MarcSource | null {
  if (!bib || typeof bib !== 'object') return null;
  const marc = (bib as { marc?: unknown }).marc;
  if (!marc || typeof marc !== 'object') return null;

  const { leader, fields } = marc as { leader?: unknown; fields?: unknown };
  if (!Array.isArray(fields)) return null;

  const controlFields = new Map<string, string>();
  const dataFields: MarcField[] = [];

  for (const entry of fields) {
    if (!entry || typeof entry !== 'object') continue;
    for (const [tag, value] of Object.entries(entry as Record<string, unknown>)) {
      if (typeof value === 'string') {
        controlFields.set(tag, value);
        continue;
      }
      if (!value || typeof value !== 'object') continue;
      const { ind2, subfields } = value as { ind2?: unknown; subfields?: unknown };
      if (!Array.isArray(subfields)) continue;
      dataFields.push({
        tag,
        ind2: typeof ind2 === 'string' ? ind2 : ' ',
        subfields: subfields.flatMap((sub) =>
          sub && typeof sub === 'object'
            ? Object.entries(sub as Record<string, unknown>)
                .map(([code, text]) => ({ code, value: String(text).trim() }))
                .filter((subfield) => subfield.value.length > 0)
            : [],
        ),
      });
    }
  }

  return { leader: typeof leader === 'string' ? leader : '', controlFields, dataFields };
}

function queryExternalId(queryText: string): string {
  return `query:${queryText.trim()}`;
}

function queryFromExternalId(externalId: string): string | null {
  return externalId.startsWith('query:') ? externalId.slice('query:'.length) : null;
}
