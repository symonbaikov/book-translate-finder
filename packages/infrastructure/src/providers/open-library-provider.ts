import type {
  BookMetadataProvider,
  CachePort,
  ProviderEdition,
  ProviderWork,
  ProviderWorkDetails,
  RightsStatus,
  SearchQuery,
} from '@golden/domain';
import { ProviderId } from '@golden/domain';
import type { ResilientFetcher } from '../http/resilient-fetch.js';

const SEARCH_CACHE_TTL_SECONDS = 60 * 60; // 1h — matches docs/architecture.md §6 hot-response TTLs
const EDITIONS_CACHE_TTL_SECONDS = 6 * 60 * 60; // 6h — editions change less often than search rankings
const AVAILABILITY_CACHE_TTL_SECONDS = 6 * 60 * 60; // 6h — same order as editions; lending status isn't second-to-second
/** `/api/volumes/brief` accepts a pipe-separated request list — kept well under any practical
 * URL-length limit, same order of magnitude as editions.json's own `limit=50`. */
const AVAILABILITY_BATCH_SIZE = 50;
/**
 * Caps single-edition lookups triggered by an `ocaid:`-only availability match (see
 * `fetchEditions`'s second pass). A work's `ia` list can carry dozens of scans of the very same
 * copy — bounding this keeps one popular work's sync from firing dozens of extra HTTP requests.
 */
const MAX_EXTRA_AVAILABILITY_EDITIONS = 5;
/** Editions fetched per `editions.json` request — the endpoint's own accepted maximum, confirmed
 * live (`limit=500` returns 500 entries; `limit=1000` returns everything a work has). */
const EDITIONS_PAGE_SIZE = 500;
/** Hard stop on how many editions one work may contribute, so a pathological record cannot turn a
 * single sync into an unbounded crawl. Well above the largest real work observed (1984, 536). */
const MAX_EDITIONS = 1000;
/**
 * Caps how many of a work's own editions get an availability lookup. Paging editions turned a
 * 50-edition batch into a possible 1000, and at `AVAILABILITY_BATCH_SIZE` per request that would
 * be twenty extra calls per sync. Borrow links do not need every edition anyway: the work's `ia`
 * list (added unconditionally below) already names every digitized copy, which is where lendable
 * editions actually come from.
 */
const MAX_AVAILABILITY_EDITION_KEYS = 100;
/**
 * The matching cap on the work's `ia` list. It was previously uncapped, on the reasoning that it
 * is the list without editions.json's blind spot — true, but a heavily digitized classic carries
 * hundreds of scans, and at `AVAILABILITY_BATCH_SIZE` per request that is another six or eight
 * round trips of a reader's first search. 100 keeps the whole availability step to four requests
 * that run together, and the copies past the hundredth are overwhelmingly repeat scans of the
 * same few editions — they contribute no borrow link the first hundred did not already.
 */
const MAX_AVAILABILITY_IA_IDS = 100;

interface OpenLibrarySearchDoc {
  key: string;
  title: string;
  author_name?: string[];
  language?: string[];
  edition_count?: number;
  first_publish_year?: number;
  cover_i?: number;
  /** Internet Archive identifiers for every digitized copy of this *work*, across all editions —
   * unlike `editions.json`, not capped to a handful of records. See `fetchWorkIaIds`. */
  ia?: string[];
}

interface OpenLibrarySearchResponse {
  docs?: OpenLibrarySearchDoc[];
}

interface OpenLibraryEditionEntry {
  key: string;
  title?: string;
  languages?: { key: string }[];
  contributors?: { role?: string; name?: string }[];
  translated_from?: { key: string }[];
  publishers?: string[];
  publish_date?: string;
  isbn_10?: string[];
  isbn_13?: string[];
  number_of_pages?: number;
  physical_format?: string;
  covers?: number[];
}

interface OpenLibraryEditionsResponse {
  entries?: OpenLibraryEditionEntry[];
  /** Total editions the work has, independent of this page's size. See `fetchAllEditionEntries`. */
  size?: number;
}

/** `/api/volumes/brief/json/...` — docs/plan.md §2 research: undocumented on openlibrary.org's
 * own developer pages beyond a short mention, verified live against real ISBNs/OLIDs instead. */
interface AvailabilityItem {
  match?: 'exact' | 'similar';
  status?: 'full access' | 'lendable' | 'checked out' | 'restricted' | string;
  'ol-edition-id'?: string;
  itemURL?: string;
}

/** `/works/{id}.json` — `description` is a plain string on some records and `{value}` on others
 * (both shapes confirmed live). */
interface OpenLibraryWorkResponse {
  description?: string | { value?: string };
  covers?: number[];
  /** Contributor-written subject headings — the closest thing Open Library has to genre tags. */
  subjects?: string[];
}

interface AvailabilityResponse {
  [requestKey: string]: { items?: AvailabilityItem[] } | undefined;
}

function coverIdToUrl(coverId: number | undefined): string | null {
  return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : null;
}

function extractYear(publishDate: string | undefined): number | null {
  if (!publishDate) return null;
  const match = /\b(\d{4})\b/.exec(publishDate);
  return match ? Number(match[1]) : null;
}

function extractTranslator(entry: OpenLibraryEditionEntry): string | null {
  // The structured field (docs/research/coverage-phase0.md found this is where it actually
  // lives — a naive text-search over `contributions`/`by_statement` alone missed it entirely).
  const translator = entry.contributors?.find((c) => c.role?.toLowerCase().includes('translat'));
  return translator?.name ?? null;
}

function mapSearchDoc(doc: OpenLibrarySearchDoc): ProviderWork {
  return {
    externalId: doc.key,
    title: doc.title,
    authorNames: doc.author_name ?? [],
    languages: doc.language ?? [],
    firstPublishedYear: doc.first_publish_year ?? null,
    editionCount: doc.edition_count ?? 0,
    coverUrl: coverIdToUrl(doc.cover_i),
  };
}

function editionOlid(entry: OpenLibraryEditionEntry): string {
  return entry.key.replace('/books/', '');
}

function mapEditionEntry(entry: OpenLibraryEditionEntry): ProviderEdition {
  return {
    externalId: entry.key,
    title: entry.title ?? '',
    language: entry.languages?.[0]?.key.replace('/languages/', '') ?? 'und',
    coverUrl: coverIdToUrl(entry.covers?.[0]),
    translator: extractTranslator(entry),
    translatedFrom: entry.translated_from?.[0]?.key.replace('/languages/', '') ?? null,
    publisher: entry.publishers?.[0] ?? null,
    year: extractYear(entry.publish_date),
    isbn13: entry.isbn_13?.[0] ?? null,
    isbn10: entry.isbn_10?.[0] ?? null,
    pages: entry.number_of_pages ?? null,
    binding: entry.physical_format ?? null,
    // Overwritten below from the availability lookup when it has a confident, exact-match
    // answer for this specific edition. editions.json alone has no reliable per-edition
    // public-vs-lending signal (docs/legal-policy.md §3: absence of a clear signal is never
    // treated as permission), so 'unknown'/no link is the honest default in the meantime.
    rightsSignal: 'unknown',
  };
}

/**
 * Maps one availability item to a rights signal + link, or `null` when the status doesn't imply
 * a legal link at all (`restricted`, or anything undocumented). `internet-archive` — not
 * `open-library` — is the link's provider identity: the content is actually hosted and legally
 * vetted by Internet Archive (which runs Open Library), matching docs/legal-policy.md §3 rule 2
 * ("Internet Archive reports an open-access label (not lending) → public_domain") and the
 * `download` allowlist in I-1, which lists `internet-archive`, not `open-library`.
 */
function extractIAIdentifier(url: string): string | null {
  // Match internet-archive URLs: https://archive.org/details/{id}, /download/{id}, or /stream/{id}
  const match = url.match(/archive\.org\/(?:details|download|stream)\/([^/?]+)/);
  return match?.[1] ?? null;
}

/**
 * Парсит доступные форматы из Internet Archive metadata API.
 * Использует regex для определения расширений файлов.
 */
function parseIAFormats(files: Array<{ name: string; format?: string }> | undefined): string[] {
  if (!files) return [];

  const formats = new Set<string>();
  const formatRegex = /\.([a-z0-9]+)$/i;

  for (const file of files) {
    // Приоритет: используем поле `format` если есть, иначе парсим расширение из имени файла
    if (file.format) {
      formats.add(file.format.toLowerCase());
    } else {
      const match = file.name.match(formatRegex);
      if (match?.[1]) {
        const ext = match[1].toLowerCase();
        // Отфильтровываем служебные расширения
        if (!['xml', 'json', 'txt', 'pdf_bak', 'orig', 'old'].includes(ext)) {
          formats.add(ext);
        }
      }
    }
  }

  // Сортируем по приоритету: популярные форматы в начале
  const priorityOrder = ['pdf', 'epub', 'mobi', 'txt', 'html', 'djvu'];
  const sorted = [
    ...priorityOrder.filter(f => formats.has(f)),
    ...Array.from(formats).filter(f => !priorityOrder.includes(f)).sort(),
  ];

  return sorted;
}

function mapAvailability(
  item: AvailabilityItem,
  iaFormats?: Map<string, string[]>,
): {
  rightsSignal: RightsStatus;
  link: { type: 'download' | 'borrow'; url: string; provider: string; format?: string };
} | null {
  if (!item.itemURL) return null;

  const iaId = extractIAIdentifier(item.itemURL);
  const formats = iaId && iaFormats ? iaFormats.get(iaId) : undefined;
  const format = formats?.[0];

  const baseLink = {
    url: item.itemURL,
    provider: 'internet-archive' as const,
    ...(format && { format }),
  };

  switch (item.status) {
    case 'full access':
      return {
        rightsSignal: 'public_domain',
        link: { type: 'download' as const, ...baseLink },
      };
    case 'lendable':
    case 'checked out':
      // Still legal to *try* to borrow even while checked out by someone else (docs/legal-policy.md
      // I-2/I-4) — the reader joins IA's own waitlist, that's not our concern to model.
      return {
        rightsSignal: 'copyrighted',
        link: { type: 'borrow' as const, ...baseLink },
      };
    default:
      return null;
  }
}

/**
 * docs/architecture.md §2.2 `BookMetadataProvider` implementation for Open Library. Two rules
 * are non-negotiable, both found the hard way in Phase 0 (docs/research/coverage-phase0.md):
 * plain-text search only (field-scoped queries fragment across duplicate records and undercount
 * language coverage by a wide margin), and every request goes through the resilient fetcher
 * (76% of naive sequential requests failed under load without retry/backoff).
 */
export class OpenLibraryProvider implements BookMetadataProvider {
  readonly id = ProviderId.create('open-library');

  constructor(
    private readonly fetcher: ResilientFetcher,
    private readonly cache: CachePort,
    private readonly userAgent: string,
  ) {}

  async searchWorks(query: SearchQuery): Promise<ProviderWork[]> {
    const cacheKey = `provider:open-library:search:${encodeURIComponent(query.text.trim().toLowerCase())}:${query.limit ?? 5}`;
    const cached = await this.cache.get<ProviderWork[]>(cacheKey);
    if (cached) return cached;

    const url = `https://openlibrary.org/search.json?${new URLSearchParams({
      q: query.text,
      fields: 'key,title,author_name,language,edition_count,first_publish_year,cover_i',
      limit: String(query.limit ?? 5),
    })}`;

    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!res.ok) throw new Error(`Open Library search failed with status ${res.status}`);

    const data = (await res.json()) as OpenLibrarySearchResponse;
    const results = (data.docs ?? []).map(mapSearchDoc);

    await this.cache.set(cacheKey, results, SEARCH_CACHE_TTL_SECONDS);
    return results;
  }

  async fetchEditions(externalWorkId: string): Promise<ProviderEdition[]> {
    const cacheKey = `provider:open-library:editions:${externalWorkId}`;
    const cached = await this.cache.get<ProviderEdition[]>(cacheKey);
    if (cached) return cached;

    // The work's `ia` list has no dependency on its editions — it comes from a different endpoint
    // and is only *combined* with them below — so the two runs start together. Sequentially this
    // was one full Open Library round trip (up to 22s under load) of pure waiting per sync.
    const [entries, iaIds] = await Promise.all([
      this.fetchAllEditionEntries(externalWorkId),
      this.fetchWorkIaIds(externalWorkId),
    ]);
    const editions = entries.map(mapEditionEntry);
    const knownOlids = new Set(entries.map(editionOlid));

    // `ocaid:` request keys (the Internet Archive identifier — confirmed live: the endpoint
    // accepts `ocaid:`, not `ia:`, despite the field being named `ia` on search.json's own docs)
    // alongside the fetched editions' own `olid:` keys. A heavily-reprinted classic can have
    // hundreds of editions (docs/plan.md §2 finding: live-verified against "1984", 536 total),
    // and editions.json's ordering has no relationship to which ones are actually lendable, so
    // the batch of 50 we just fetched can easily miss every one of them. The work's own `ia` list
    // (from search.json, not capped like editions.json) doesn't have that blind spot.
    const requestKeys = [
      ...entries.slice(0, MAX_AVAILABILITY_EDITION_KEYS).map((e) => `olid:${editionOlid(e)}`),
      ...iaIds.slice(0, MAX_AVAILABILITY_IA_IDS).map((id) => `ocaid:${id}`),
    ];
    const availability = await this.fetchAvailability(requestKeys);

    // Подготовим карту форматов для всех IA идентификаторов
    const iaFormatsCache = new Map<string, string[]>();
    const iaIdentifiersToFetch = new Set<string>();
    for (const item of availability.values()) {
      const iaId = extractIAIdentifier(item.itemURL ?? '');
      if (iaId) iaIdentifiersToFetch.add(iaId);
    }
    // Получаем форматы параллельно для всех идентификаторов
    await Promise.all(
      Array.from(iaIdentifiersToFetch).map(async (iaId) => {
        const formats = await this.fetchIAFormats(iaId);
        iaFormatsCache.set(iaId, formats);
      }),
    );

    for (let i = 0; i < editions.length; i++) {
      const olid = editionOlid(entries[i]!);
      const item = availability.get(olid);
      if (!item) continue;
      const iaId = extractIAIdentifier(item.itemURL ?? '');
      const formats = iaId ? iaFormatsCache.get(iaId) : undefined;
      const formatsMap = iaId && formats ? new Map([[iaId, formats]]) : undefined;
      const mapped = mapAvailability(item, formatsMap);
      if (!mapped) continue;
      editions[i] = { ...editions[i]!, rightsSignal: mapped.rightsSignal, links: [mapped.link] };
    }

    // An `ocaid:`-sourced match can point at an edition outside the fetched batch entirely — fetch
    // that specific edition directly (capped, see MAX_EXTRA_AVAILABILITY_EDITIONS) rather than
    // silently dropping a real, confirmed deep link just because it wasn't among the first 50.
    let extraFetched = 0;
    for (const [olid, item] of availability) {
      if (knownOlids.has(olid) || extraFetched >= MAX_EXTRA_AVAILABILITY_EDITIONS) continue;
      const iaId = extractIAIdentifier(item.itemURL ?? '');
      const formats = iaId ? iaFormatsCache.get(iaId) : undefined;
      const formatsMap = iaId && formats ? new Map([[iaId, formats]]) : undefined;
      const mapped = mapAvailability(item, formatsMap);
      if (!mapped) continue;
      const extra = await this.fetchSingleEdition(olid);
      extraFetched += 1;
      if (!extra) continue;
      editions.push({ ...extra, rightsSignal: mapped.rightsSignal, links: [mapped.link] });
      knownOlids.add(olid);
    }

    await this.cache.set(cacheKey, editions, EDITIONS_CACHE_TTL_SECONDS);
    return editions;
  }

  async fetchWorkDetails(externalWorkId: string): Promise<ProviderWorkDetails> {
    const cacheKey = `provider:open-library:work-details:${externalWorkId}`;
    const cached = await this.cache.get<ProviderWorkDetails>(cacheKey);
    if (cached) return cached;

    const url = `https://openlibrary.org${externalWorkId}.json`;
    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    // Best-effort by port contract: a missing/failing work record must not fail the sync.
    if (!res.ok) return { description: null, coverUrl: null, subjects: [] };

    const data = (await res.json()) as OpenLibraryWorkResponse;
    const description =
      typeof data.description === 'string' ? data.description : (data.description?.value ?? null);
    const details: ProviderWorkDetails = {
      description,
      coverUrl: coverIdToUrl(data.covers?.[0]),
      // Open Library's subjects are the only genre signal any of the sources offer. They are
      // contributor-written free text, so they are passed through as-is; `Work` caps and
      // de-duplicates them rather than this adapter inventing a taxonomy.
      subjects: data.subjects ?? [],
    };
    await this.cache.set(cacheKey, details, EDITIONS_CACHE_TTL_SECONDS);
    return details;
  }

  /**
   * The `ia` field is a search-index projection, not a stored work property, so it's only
   * reachable through `search.json` — scoped to this exact work via `key:` so it stays a
   * single-document lookup, not a re-run of the original text search.
   */
  private async fetchWorkIaIds(workId: string): Promise<string[]> {
    const cacheKey = `provider:open-library:work-ia:${workId}`;
    const cached = await this.cache.get<string[]>(cacheKey);
    if (cached) return cached;

    const url = `https://openlibrary.org/search.json?${new URLSearchParams({
      q: `key:${workId}`,
      fields: 'key,ia',
      limit: '1',
    })}`;
    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!res.ok) return []; // best-effort — same reasoning as fetchAvailability

    const data = (await res.json()) as OpenLibrarySearchResponse;
    const ia = data.docs?.[0]?.ia ?? [];
    await this.cache.set(cacheKey, ia, EDITIONS_CACHE_TTL_SECONDS);
    return ia;
  }

  /**
   * Looks up lending/availability status for a batch of `olid:`/`ocaid:` request keys
   * (docs/plan.md §2 finding — verified live: `/api/volumes/brief/json/olid:A|ocaid:B|...`;
   * `ia:` looks plausible but silently returns `{}` for every request), keyed in the result
   * by `ol-edition-id` regardless of which kind of key was used to find it. Only `match: 'exact'`
   * items are kept — the API can otherwise answer a request with a *different* edition's
   * availability instead of "no data for this one" (`match: 'similar'`), which would misattribute
   * one edition's lending status to another. Batched (`AVAILABILITY_BATCH_SIZE`) rather than one
   * request per key — the same etiquette reasoning as `editions.json`'s own `limit=50`.
   */
  /**
   * Walks `editions.json` to the end of the work instead of taking the first page.
   *
   * This is the whole reason the app used to show four languages for a book translated into
   * twenty. Open Library returns editions in no meaningful order, and for a heavily reprinted
   * classic the first page is almost entirely English reprints: measured live on "1984"
   * (536 editions) the first 50 carry 10 languages, the full set carries 23. Paging is the
   * difference between "this book exists in English and Spanish" and the truth.
   *
   * Bounded on both ends — `EDITIONS_PAGE_SIZE` pages (so even a 536-edition work costs two
   * requests, not eleven) and a hard `MAX_EDITIONS` stop, because a work with a pathological
   * edition count must not turn one sync into an unbounded crawl of someone else's API.
   */
  private async fetchAllEditionEntries(externalWorkId: string): Promise<OpenLibraryEditionEntry[]> {
    const entries: OpenLibraryEditionEntry[] = [];
    // The work's true edition count, learned from the first response. Trusting it — rather than
    // "a short page means the last page" — is deliberate: Open Library sometimes serves a page of
    // 50 for a `limit=500` request (observed live on /works/OL1168083W, "1984", while the same
    // URL from a shell returned 500). Treating that as the end silently truncated the work to 50
    // editions and 10 languages when it has 536 and 23.
    let total = MAX_EDITIONS;

    while (entries.length < Math.min(total, MAX_EDITIONS)) {
      const url =
        `https://openlibrary.org${externalWorkId}/editions.json` +
        `?limit=${EDITIONS_PAGE_SIZE}&offset=${entries.length}`;
      const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
      // Only the first page is load-bearing: without it there is nothing to sync. A later page
      // failing costs some editions, and reporting the whole work as broken over that would be
      // strictly worse than syncing what we already have.
      if (!res.ok) {
        if (entries.length === 0) {
          throw new Error(`Open Library editions failed with status ${res.status}`);
        }
        break;
      }

      const data = (await res.json()) as OpenLibraryEditionsResponse;
      const page = data.entries ?? [];
      // An empty page always stops the walk — without it a `size` that can never be reached (a
      // filtered or deleted record) would spin all the way to MAX_EDITIONS.
      if (page.length === 0) break;
      entries.push(...page);

      if (typeof data.size === 'number') {
        total = data.size;
      } else if (page.length < EDITIONS_PAGE_SIZE) {
        break; // no `size` to trust, so a short page is the only end-of-list signal left
      }
    }

    return entries.slice(0, MAX_EDITIONS);
  }

  /**
   * Получает доступные форматы для документа Internet Archive через metadata API.
   * Использует regex для парсинга расширений файлов.
   */
  private async fetchIAFormats(iaIdentifier: string): Promise<string[]> {
    const cacheKey = `provider:open-library:ia-formats:${iaIdentifier}`;
    const cached = await this.cache.get<string[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://archive.org/metadata/${iaIdentifier}`;
      const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
      if (!res.ok) return [];

      interface IAMetadata {
        files?: Array<{ name: string; format?: string }>;
      }
      const data = (await res.json()) as IAMetadata;
      const formats = parseIAFormats(data.files);
      await this.cache.set(cacheKey, formats, EDITIONS_CACHE_TTL_SECONDS);
      return formats;
    } catch {
      // best-effort — формат определен из URL, если API не доступен
      return [];
    }
  }

  private async fetchAvailability(requestKeys: string[]): Promise<Map<string, AvailabilityItem>> {
    const result = new Map<string, AvailabilityItem>();
    if (requestKeys.length === 0) return result;

    const cacheKey = `provider:open-library:availability:${requestKeys.slice().sort().join(',')}`;
    const cached = await this.cache.get<[string, AvailabilityItem][]>(cacheKey);
    if (cached) return new Map(cached);

    const batches: string[][] = [];
    for (let i = 0; i < requestKeys.length; i += AVAILABILITY_BATCH_SIZE) {
      batches.push(requestKeys.slice(i, i + AVAILABILITY_BATCH_SIZE));
    }

    // Concurrent, because the batches are a page-size artefact, not a sequence: no batch's request
    // depends on any other's answer, and running them in turn simply multiplied one work's sync by
    // the number of pages. Bounded to four by the two caps above (`MAX_AVAILABILITY_EDITION_KEYS`
    // + `MAX_AVAILABILITY_IA_IDS` at `AVAILABILITY_BATCH_SIZE` each), which is a burst Open
    // Library's rate limits absorb comfortably — the caps are what make this safe to fan out, so
    // raising either one means reconsidering this line.
    const pages = await Promise.all(
      batches.map(async (batch) => {
        const url = `https://openlibrary.org/api/volumes/brief/json/${batch.join('|')}`;
        const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
        // best-effort — a failed availability lookup shouldn't fail the whole sync
        if (!res.ok) return { batch, data: {} as AvailabilityResponse };
        return { batch, data: (await res.json()) as AvailabilityResponse };
      }),
    );

    for (const { batch, data } of pages) {
      for (const key of batch) {
        const items = data[key]?.items ?? [];
        const exact = items.find((item) => item.match === 'exact' && item['ol-edition-id']);
        if (exact) result.set(exact['ol-edition-id']!, exact);
      }
    }

    await this.cache.set(cacheKey, [...result.entries()], AVAILABILITY_CACHE_TTL_SECONDS);
    return result;
  }

  /** Single-edition fallback for an availability match outside the fetched editions.json batch.
   * `/books/{OLID}.json`'s shape is field-compatible with `editions.json`'s own entries (same
   * key names — verified live), so `mapEditionEntry` handles both. */
  private async fetchSingleEdition(olid: string): Promise<ProviderEdition | null> {
    const url = `https://openlibrary.org/books/${olid}.json`;
    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!res.ok) return null; // best-effort — same reasoning as fetchAvailability

    const entry = (await res.json()) as OpenLibraryEditionEntry;
    return mapEditionEntry(entry);
  }
}
