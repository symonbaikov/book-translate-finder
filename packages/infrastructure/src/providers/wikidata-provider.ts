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

const SEARCH_CACHE_TTL_SECONDS = 6 * 60 * 60;
const EDITIONS_CACHE_TTL_SECONDS = 6 * 60 * 60;

const ENTITY_SEARCH_URL = 'https://www.wikidata.org/w/api.php';
const SPARQL_URL = 'https://query.wikidata.org/sparql';

/**
 * Wikisource site keys that name no single language and are therefore skipped.
 *
 * `wikisource` is the old undifferentiated wiki and `mulwikisource` the multilingual one; a page
 * on either is not "this book in language X", which is the only thing an edition can be here.
 */
const NON_LANGUAGE_WIKISOURCES: ReadonlySet<string> = new Set(['wikisource', 'mulwikisource']);

/**
 * Wikisource namespace prefixes that are cataloguing apparatus rather than part of a title.
 *
 * Italian Wikisource files a work at `Opera:Le avventure di Alice nel Paese delle Meraviglie`, and
 * printed unstripped that is the name of a book on the page (seen live). A closed list rather than
 * "everything before the first colon", because a colon is perfectly ordinary inside a real title —
 * "Faust: Part One" must survive untouched.
 */
const WIKISOURCE_NAMESPACES: readonly string[] = [
  'Opera', // it
  'Translation', // en — a translation made by Wikisource contributors
  'Traduzione', // it
  'Índice', // pt/es
  'Portal',
  'Author',
  'Index',
  'Page',
];

/**
 * Candidates pulled from the label search before the book filter is applied.
 *
 * Wide on purpose. Wikidata's label search ranks by nothing this project cares about, and a famous
 * title is a crowd: "Le petit prince" returns a 2015 film, its French dub, its soundtrack album, a
 * comic book, an opera and an Antarctic island before it returns the novella — which sits at
 * position 19. At seven candidates the book was simply never among them, and the enrichment that
 * would have added nine languages to it reported "not found" instead.
 *
 * Widening is cheap and safe here: everything found is still filtered by `BOOK_CLASSES`, ranked by
 * author mention, and — on the enrichment path — checked against the work it is being attached to
 * before any of it is written down.
 */
const SEARCH_CANDIDATES = 25;
/**
 * How many trailing words may be dropped when the whole query finds nothing.
 *
 * Wikidata's entity search matches labels and aliases, not free text, so it answers "Обитель" and
 * not "Обитель Прилепин" — while every query this project makes is a title and an author glued
 * together. Dropping trailing words walks back toward the bare title, and the author is then used
 * to *choose* among the candidates rather than to find them.
 */
const MAX_DROPPED_WORDS = 3;

/**
 * What counts as a book here. `P31` (instance of) is checked against this list rather than walked
 * up the subclass tree: the tree is enormous and a `P279*` traversal in every search would be an
 * expensive query for a distinction this list already draws well. It is also what keeps «Метро
 * 2033» the novel and not the video game, and «Обитель» the novel and not the television series —
 * both of which the label search returns first.
 */
const BOOK_CLASSES = [
  'Q7725634', // literary work
  'Q47461344', // written work
  'Q8261', // novel
  'Q571', // book
  'Q49084', // short story
  'Q5185279', // poem
  'Q1667921', // novel series
  'Q25379', // play
] as const;

/** One Wikisource page for the work, in one language. */
interface WikisourceText {
  /** The sitelink key, e.g. `ruwikisource` — kept because it is what makes the id unique. */
  site: string;
  language: string;
  title: string;
  url: string;
}

interface SitelinksResponse {
  entities?: Record<string, { sitelinks?: Record<string, { title?: string; url?: string }> }>;
}

/** Wikidata returns sitelink URLs protocol-relative (`//ru.wikisource.org/...`). */
function absoluteUrl(url: string): string {
  return url.startsWith('//') ? `https:${url}` : url;
}

/** `"Opera:Le avventure di Alice"` → `"Le avventure di Alice"`; a real colon is left alone. */
export function stripWikisourceNamespace(title: string): string {
  for (const namespace of WIKISOURCE_NAMESPACES) {
    if (title.startsWith(`${namespace}:`)) return title.slice(namespace.length + 1).trim();
  }
  return title;
}

interface EntitySearchResponse {
  search?: { id?: string }[];
}

interface SparqlBinding {
  [variable: string]: { value?: string } | undefined;
}

interface SparqlResponse {
  results?: { bindings?: SparqlBinding[] };
}

function binding(row: SparqlBinding, name: string): string | null {
  const value = row[name]?.value;
  return value && value.length > 0 ? value : null;
}

/**
 * A label the label service could not resolve.
 *
 * `wikibase:label` falls back to the entity id when the item has no label in any requested
 * language, so an unlabelled edition arrives as the string `"Q126735031"` — which then went into
 * the database as an edition's title and onto the page as the name of a book. An entity id is not
 * a title; the honest reading of that answer is that this source has no title to give.
 */
function isUnresolvedLabel(label: string | null): boolean {
  return label !== null && /^Q\d+$/.test(label);
}

function resolvedLabel(row: SparqlBinding, name: string): string | null {
  const label = binding(row, name);
  return isUnresolvedLabel(label) ? null : label;
}

function entityId(uri: string | null): string | null {
  if (!uri) return null;
  const id = uri.split('/').pop();
  return id && /^Q\d+$/.test(id) ? id : null;
}

function yearOf(isoDate: string | null): number | null {
  if (!isoDate) return null;
  // Wikidata dates are ISO 8601 with a leading sign: "+2014-00-00T00:00:00Z".
  const match = /^[+-]?(\d{4})/.exec(isoDate);
  return match ? Number(match[1]) : null;
}

/**
 * A Commons file name as an image URL. `Special:FilePath` redirects to the real file, so no second
 * request is needed to resolve it, and `width` keeps a grid cell from downloading a 4000px scan.
 */
function commonsImageUrl(value: string | null): string | null {
  if (!value) return null;
  const fileName = value.split('/').pop();
  if (!fileName) return null;
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=600`;
}

/** One work, after the SPARQL rows for it have been folded back together. */
interface WikidataWork {
  qid: string;
  title: string;
  authors: string[];
  languageCodes: string[];
  year: number | null;
  imageUrl: string | null;
  genres: string[];
  description: string | null;
}

function foldRows(rows: SparqlBinding[]): WikidataWork[] {
  // A row per combination of optional values, so one work with three genres and two publication
  // dates arrives six times. Folding by QID is what turns that back into one book.
  const byQid = new Map<string, WikidataWork>();
  for (const row of rows) {
    const qid = entityId(binding(row, 'item'));
    if (!qid) continue;

    let work = byQid.get(qid);
    if (!work) {
      work = {
        qid,
        title: resolvedLabel(row, 'itemLabel') ?? '',
        authors: [],
        languageCodes: [],
        year: null,
        imageUrl: commonsImageUrl(binding(row, 'image')),
        genres: [],
        description: binding(row, 'desc'),
      };
      byQid.set(qid, work);
    }

    const author = resolvedLabel(row, 'authorLabel');
    if (author && !work.authors.includes(author)) work.authors.push(author);

    const language = binding(row, 'langCode');
    if (language && !work.languageCodes.includes(language)) work.languageCodes.push(language);

    const genre = resolvedLabel(row, 'genreLabel');
    if (genre && !work.genres.includes(genre)) work.genres.push(genre);

    // The earliest date: a work republished in 2010 was still first published in 2007.
    const year = yearOf(binding(row, 'date'));
    if (year !== null && (work.year === null || year < work.year)) work.year = year;
  }
  return [...byQid.values()];
}

function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/**
 * Ranks candidates by whether the query names their author.
 *
 * The label search found these by title alone, so «Обитель» comes back as five different novels.
 * The rest of the reader's query — almost always the author — is what picks between them, and a
 * candidate the reader clearly did not mean should not win just because Wikidata ranked its label
 * higher. Surname-only matching is deliberate: readers write "Прилепин", Wikidata stores "Zakhar
 * Prilepin", and after romanization those meet on the surname.
 */
function rankByAuthorMention(works: WikidataWork[], query: string): WikidataWork[] {
  const haystack = ` ${normalizeForMatch(query)} `;
  const mentionsAuthor = (work: WikidataWork): boolean =>
    work.authors.some((author) =>
      normalizeForMatch(author)
        .split(' ')
        .filter((part) => part.length >= 4)
        .some((part) => haystack.includes(` ${part} `)),
    );
  // A stable partition, not a sort: within each group Wikidata's own relevance order is kept.
  return [...works.filter(mentionsAuthor), ...works.filter((w) => !mentionsAuthor(w))];
}

/**
 * Wikidata as a `BookMetadataProvider` (docs/architecture.md §2.2) — the source of last resort for
 * *finding* a book at all.
 *
 * It earns its place on one measurement: of seven books that this instance could not find under
 * any spelling — «Моим легионерам», «Обитель», «Інтернат», 房思琪的初戀樂園 among them — Open
 * Library knew one and Wikidata knew all seven. That is the difference between a reader being told
 * "nothing found" about a book that plainly exists and being shown the book.
 *
 * What it is **not** is an editions source. Wikidata models editions with `P629`, but the coverage
 * is a fraction of a library catalogue's: *War and Peace* has 15 there and «Мастер и Маргарита»
 * has none. So this provider is registered last among the discovery sources and contributes
 * identity — title, author, original language, first publication, genre — while the catalogues
 * contribute what a reader can actually hold.
 *
 * No links, ever: Wikidata describes books, it does not host them, so nothing here reaches
 * `LinkPolicy` (docs/legal-policy.md).
 */
export class WikidataProvider implements BookMetadataProvider {
  readonly id = ProviderId.create('wikidata');

  constructor(
    private readonly fetcher: ResilientFetcher,
    private readonly cache: CachePort,
    private readonly userAgent: string,
  ) {}

  async searchWorks(query: SearchQuery): Promise<ProviderWork[]> {
    const text = query.text.trim();
    const limit = query.limit ?? 5;
    const cacheKey = `provider:wikidata:search:${encodeURIComponent(text.toLowerCase())}:${limit}`;
    const cached = await this.cache.get<ProviderWork[]>(cacheKey);
    if (cached) return cached;

    const qids = await this.findCandidateIds(text);
    const works = qids.length === 0 ? [] : await this.describeWorks(qids);
    const results = rankByAuthorMention(works, text)
      .slice(0, limit)
      .map((work): ProviderWork => ({
        externalId: work.qid,
        title: work.title,
        authorNames: work.authors,
        languages: work.languageCodes,
        firstPublishedYear: work.year,
        // Wikidata does not count editions, and reporting 0 would be read as "no editions
        // exist" by anything ranking on it. It is unknown, and 0 is the only way this field
        // can say so.
        editionCount: 0,
        coverUrl: work.imageUrl,
      }));

    await this.cache.set(cacheKey, results, SEARCH_CACHE_TTL_SECONDS);
    return results;
  }

  /**
   * Editions and translations recorded against the work (`P629`).
   *
   * Usually few and often none — see the class comment. What is here is high quality: real
   * publication years, languages, ISBNs and, unusually among open sources, named translators.
   */
  async fetchEditions(externalWorkId: string): Promise<ProviderEdition[]> {
    const cacheKey = `provider:wikidata:editions:${externalWorkId}`;
    const cached = await this.cache.get<ProviderEdition[]>(cacheKey);
    if (cached) return cached;

    if (!/^Q\d+$/.test(externalWorkId)) return [];

    const rows = await this.sparql(`
      SELECT ?ed ?edLabel ?langCode ?date ?isbn13 ?isbn10 ?publisherLabel ?translatorLabel WHERE {
        ?ed wdt:P629 wd:${externalWorkId} .
        OPTIONAL { ?ed wdt:P407 ?lang . ?lang wdt:P218 ?langCode }
        OPTIONAL { ?ed wdt:P577 ?date }
        OPTIONAL { ?ed wdt:P212 ?isbn13 }
        OPTIONAL { ?ed wdt:P957 ?isbn10 }
        OPTIONAL { ?ed wdt:P123 ?publisher }
        OPTIONAL { ?ed wdt:P655 ?translator }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
      }
      LIMIT 200
    `);

    const byId = new Map<string, ProviderEdition>();
    for (const row of rows) {
      const id = entityId(binding(row, 'ed'));
      const language = binding(row, 'langCode');
      const title = resolvedLabel(row, 'edLabel');
      // An edition with no language cannot be placed on the translation list, which is the whole
      // reason this project stores editions — so it is skipped rather than filed under a guess.
      // One with no title is skipped for the plainer reason that there is nothing to show: the
      // alternative put the string "Q126735031" on a page as the name of a book, observed live.
      if (!id || !language || !title) continue;

      if (!byId.has(id)) {
        byId.set(id, {
          externalId: id,
          title,
          language,
          coverUrl: null,
          translator: resolvedLabel(row, 'translatorLabel'),
          translatedFrom: null,
          publisher: resolvedLabel(row, 'publisherLabel'),
          year: yearOf(binding(row, 'date')),
          isbn13: binding(row, 'isbn13'),
          isbn10: binding(row, 'isbn10'),
          pages: null,
          binding: null,
          rightsSignal: 'unknown',
        });
      }
    }

    const editions = await this.withWikisourceTexts(externalWorkId, [...byId.values()]);
    await this.cache.set(cacheKey, editions, EDITIONS_CACHE_TTL_SECONDS);
    return editions;
  }

  /**
   * Adds the free full texts Wikisource holds for this work, one per language.
   *
   * **Why this lives in the Wikidata adapter rather than a `WikisourceProvider`.** Finding the
   * right Wikisource page means first knowing which Wikidata item the book is — and that is not a
   * lookup, it is this class's hardest problem: the label search answers "Crime and Punishment"
   * with a 1984 video game before the novel, which is what `BOOK_CLASSES` and the author ranking
   * exist to sort out. A separate provider would have to repeat all of it, and would drift from
   * it. Wikidata already holds the sitelinks, so this is one more request on an item already
   * identified.
   *
   * The link is still attributed to **`wikisource`**, not to `wikidata` — the documented pattern
   * for a provider that discovers a link somebody else hosts (see `ProviderEdition.links`, and
   * Open Library attributing its availability links to `internet-archive`). It matters more than
   * bookkeeping here: `wikisource` is on `DOWNLOAD_ALLOWLIST` and `wikidata` is not, so a link
   * mislabelled as Wikidata's would be refused by `LinkPolicy` — correctly, since Wikidata hosts
   * no texts at all.
   *
   * A language Wikidata has no edition item for still gets an edition, because that is the common
   * case and the whole value: «Преступление и наказание» has Wikisource texts in Russian,
   * Ukrainian, Serbian, Estonian, Hebrew, Spanish and English, and Wikidata edition items for
   * almost none of them. Without this the reader is told the book is free in English (Gutenberg)
   * and nothing about the six other languages they could read it in for nothing.
   *
   * Failure is swallowed: the editions already built are worth returning without it.
   */
  private async withWikisourceTexts(
    qid: string,
    editions: ProviderEdition[],
  ): Promise<ProviderEdition[]> {
    let texts: WikisourceText[];
    try {
      texts = await this.fetchWikisourceTexts(qid);
    } catch {
      return editions;
    }

    for (const text of texts) {
      const link = {
        type: 'download' as const,
        url: text.url,
        provider: 'wikisource',
        // The page *is* the full text, so this is the same kind of link as Project Gutenberg's
        // own HTML one. The EPUB exporter was considered and rejected: rendering a novel through
        // it did not finish inside thirty seconds (measured), and a download link that hangs is
        // worse than one that opens.
        format: 'HTML',
      };

      // Always its own edition, never a link bolted onto one that already exists in the same
      // language — even though that would look tidier on the page.
      //
      // Two texts in one language are routinely two *different* translations: Wikisource carries
      // the old one whose copyright has lapsed, while the edition Wikidata knows about may be a
      // translation published last decade and firmly in copyright. Hanging a
      // `public_domain` download off that edition would be this project stating that a
      // copyrighted translation is free to take — the exact claim docs/legal-policy.md exists to
      // prevent. Kept separate, each record says only what is true of itself.
      const edition: ProviderEdition = {
        externalId: `wikisource:${text.site}:${text.title}`,
        title: text.title,
        language: text.language,
        coverUrl: null,
        translator: null,
        translatedFrom: null,
        publisher: null,
        // A wiki page is not a printed edition and has no imprint. Inventing one would put a
        // fabricated publisher and year on a card.
        year: null,
        isbn13: null,
        isbn10: null,
        pages: null,
        binding: null,
        editionStatement: null,
        rightsSignal: 'public_domain',
        links: [link],
      };
      editions.push(edition);
    }

    return editions;
  }

  /** The work item's Wikisource sitelinks — every language in one request. */
  private async fetchWikisourceTexts(qid: string): Promise<WikisourceText[]> {
    const url = `${ENTITY_SEARCH_URL}?${new URLSearchParams({
      action: 'wbgetentities',
      ids: qid,
      props: 'sitelinks/urls',
      format: 'json',
    })}`;

    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!res.ok) throw new Error(`Wikidata sitelinks lookup failed with status ${res.status}`);

    const data = (await res.json()) as SitelinksResponse;
    const sitelinks = data.entities?.[qid]?.sitelinks ?? {};

    const texts: WikisourceText[] = [];
    for (const [site, entry] of Object.entries(sitelinks)) {
      if (!site.endsWith('wikisource') || NON_LANGUAGE_WIKISOURCES.has(site)) continue;
      const language = site.slice(0, -'wikisource'.length);
      const title = stripWikisourceNamespace(entry.title?.trim() ?? '');
      const pageUrl = entry.url;
      if (!language || !title || !pageUrl) continue;
      texts.push({ site, language, title, url: absoluteUrl(pageUrl) });
    }
    return texts;
  }

  async fetchWorkDetails(externalWorkId: string): Promise<ProviderWorkDetails> {
    const empty: ProviderWorkDetails = { description: null, coverUrl: null, subjects: [] };
    if (!/^Q\d+$/.test(externalWorkId)) return empty;

    const cacheKey = `provider:wikidata:work-details:${externalWorkId}`;
    const cached = await this.cache.get<ProviderWorkDetails>(cacheKey);
    if (cached) return cached;

    const works = await this.describeWorks([externalWorkId]);
    const work = works[0];
    if (!work) return empty;

    const details: ProviderWorkDetails = {
      // Wikidata's description is one line ("2014 novel by Zakhar Prilepin") — a caption, not a
      // blurb. Offered anyway: a caption beats an empty card, and any source with a real
      // description outranks this one at merge time (docs/architecture.md §5).
      description: work.description,
      coverUrl: work.imageUrl,
      // `P136` is a curated genre property, not free-text subject headings — so unlike Open
      // Library's, these arrive already de-duplicated and spelled one way.
      subjects: work.genres,
    };
    await this.cache.set(cacheKey, details, EDITIONS_CACHE_TTL_SECONDS);
    return details;
  }

  /**
   * Entity ids whose label or alias matches the query, retrying with fewer trailing words.
   *
   * Everything found here is a candidate and nothing more — the class filter and the author
   * ranking in `searchWorks` decide what actually counts.
   */
  private async findCandidateIds(text: string): Promise<string[]> {
    const words = text.split(/\s+/).filter((word) => word.length > 0);

    for (let dropped = 0; dropped <= MAX_DROPPED_WORDS; dropped += 1) {
      const attempt = words.slice(0, words.length - dropped);
      if (attempt.length === 0) break;

      const url = `${ENTITY_SEARCH_URL}?${new URLSearchParams({
        action: 'wbsearchentities',
        search: attempt.join(' '),
        // Wikidata matches labels and aliases in *every* language regardless of this parameter —
        // it selects the language the labels come back in, which the SPARQL pass overrides anyway.
        language: 'en',
        uselang: 'en',
        type: 'item',
        limit: String(SEARCH_CANDIDATES),
        format: 'json',
      })}`;

      const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
      if (!res.ok) throw new Error(`Wikidata entity search failed with status ${res.status}`);

      const data = (await res.json()) as EntitySearchResponse;
      const ids = (data.search ?? [])
        .map((hit) => hit.id)
        .filter((id): id is string => typeof id === 'string' && /^Q\d+$/.test(id));
      if (ids.length > 0) return ids;
    }

    return [];
  }

  /** The book-shaped subset of `qids`, with every label already resolved by the label service. */
  private async describeWorks(qids: readonly string[]): Promise<WikidataWork[]> {
    if (qids.length === 0) return [];

    const items = qids.map((qid) => `wd:${qid}`).join(' ');
    const classes = BOOK_CLASSES.map((qid) => `wd:${qid}`).join(' ');
    const rows = await this.sparql(`
      SELECT ?item ?itemLabel ?authorLabel ?langCode ?date ?image ?genreLabel ?desc WHERE {
        VALUES ?item { ${items} }
        VALUES ?class { ${classes} }
        ?item wdt:P31 ?class .
        OPTIONAL { ?item wdt:P50 ?author }
        OPTIONAL { ?item wdt:P407 ?lang . ?lang wdt:P218 ?langCode }
        OPTIONAL { ?item wdt:P577 ?date }
        OPTIONAL { ?item wdt:P18 ?image }
        OPTIONAL { ?item wdt:P136 ?genre }
        OPTIONAL { ?item schema:description ?desc FILTER(LANG(?desc) = "en") }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
      }
    `);

    const works = foldRows(rows).filter((work) => work.title.length > 0);
    // SPARQL's `VALUES` has no order, so the label search's own relevance ranking is re-applied
    // here — otherwise the best match would arrive in an arbitrary position.
    const order = new Map(qids.map((qid, index) => [qid, index]));
    return works.sort((a, b) => (order.get(a.qid) ?? 0) - (order.get(b.qid) ?? 0));
  }

  private async sparql(query: string): Promise<SparqlBinding[]> {
    const res = await this.fetcher.fetch(SPARQL_URL, {
      method: 'POST',
      headers: {
        'User-Agent': this.userAgent,
        Accept: 'application/sparql-results+json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ query }).toString(),
    });
    if (!res.ok) throw new Error(`Wikidata SPARQL failed with status ${res.status}`);

    const data = (await res.json()) as SparqlResponse;
    return data.results?.bindings ?? [];
  }
}
