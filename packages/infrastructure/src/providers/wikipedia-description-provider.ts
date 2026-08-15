import type {
  CachePort,
  LocalizedDescription,
  LocalizedDescriptionPort,
  LocalizedDescriptionQuery,
} from '@golden/domain';
import type { ResilientFetcher } from '../http/resilient-fetch.js';

/** An article's lead paragraph moves on the scale of months; a day of staleness costs nothing. */
const CACHE_TTL_SECONDS = 24 * 60 * 60;
/** A miss is cached too, and for less long — a book may get its article next month. */
const MISS_TTL_SECONDS = 6 * 60 * 60;
/**
 * How much of the lead section to keep. A card wants a blurb, not an encyclopedia article, and
 * some leads run to a full screen of plot summary before the reader reaches the editions list.
 */
const MAX_DESCRIPTION_CHARS = 1200;

interface WikidataSearchResponse {
  query?: { search?: { title?: string }[] };
}

interface WikidataEntitiesResponse {
  entities?: Record<string, { sitelinks?: Record<string, { title?: string }> }>;
}

interface WikipediaExtractResponse {
  query?: { pages?: Record<string, { title?: string; extract?: string; missing?: unknown }> };
}

/** Cached shape: a wrapper, so "we looked and there is nothing" is cacheable and not a miss. */
interface CachedLookup {
  value: LocalizedDescription | null;
}

/**
 * `external_ref` stores Open Library's own key verbatim (`/works/OL267096W`), while Wikidata's
 * `P648` holds the bare olid. Normalizing here rather than at the call site keeps that detail
 * where Open Library's formats already live — the port promises an id, not a URL path.
 */
function toOlid(externalId: string): string | null {
  const olid = externalId.trim().replace(/^\/(works|books)\//, '');
  return /^OL\d+[WM]$/.test(olid) ? olid : null;
}

/**
 * Cuts the lead section down to a blurb on a paragraph boundary — never mid-sentence, which is
 * how a truncated encyclopedia article reads as broken data rather than as a summary.
 */
function toBlurb(extract: string): string {
  const paragraphs = extract
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const kept: string[] = [];
  let length = 0;
  for (const paragraph of paragraphs) {
    if (kept.length > 0 && length + paragraph.length > MAX_DESCRIPTION_CHARS) break;
    kept.push(paragraph);
    length += paragraph.length;
  }
  // A single paragraph longer than the budget is kept whole for the same reason: half a sentence
  // is worse than a long one.
  return kept.join('\n\n');
}

/**
 * Book descriptions in the reader's own language, via Wikidata → Wikipedia.
 *
 * **Why this source.** Neither Open Library nor Google Books holds a description per language:
 * Open Library's `/works/{id}.json` has exactly one `description`, written in English whoever is
 * reading, and Google Books returns the volume's own blurb but only with an API key that most
 * self-hosts do not have (docs/plan.md 4.10 — the keyless quota is zero, confirmed live).
 * Wikipedia has an article about the same book in every language this interface speaks, needs no
 * key, and is free to reuse with attribution.
 *
 * **Why it is not guesswork.** The join is an identifier, not a name: Wikidata records Open
 * Library ids as property `P648`, so `haswbstatement:P648=OL267096W` returns the entity for
 * exactly that work, and its `ruwiki` sitelink is exactly that book's Russian article. Matching by
 * title and author instead would be hopeless anyway — the Russian article for *The Dutch House*
 * is not called "The Dutch House" — and would risk describing a different book with total
 * confidence, which is the failure mode this project cares about most.
 *
 * **Attribution.** Wikipedia text is CC BY-SA, not public domain: the port returns the article URL
 * and the UI shows it. Dropping the link would make this a licence violation, not a style choice.
 *
 * Every failure returns `null`. A book card whose description is missing is a smaller problem than
 * a book card that will not render.
 */
export class WikipediaDescriptionProvider implements LocalizedDescriptionPort {
  constructor(
    private readonly fetcher: ResilientFetcher,
    private readonly cache: CachePort,
    private readonly userAgent: string,
  ) {}

  async fetchDescription(query: LocalizedDescriptionQuery): Promise<LocalizedDescription | null> {
    const workId = toOlid(query.openLibraryWorkId);
    const language = query.language.trim().toLowerCase();
    if (!workId || !/^[a-z]{2}$/.test(language)) return null;

    const cacheKey = `provider:wikipedia:description:${workId}:${language}`;
    const cached = await this.cache.get<CachedLookup>(cacheKey);
    if (cached) return cached.value;

    const result = await this.lookup(workId, language);
    await this.cache.set(
      cacheKey,
      { value: result },
      result ? CACHE_TTL_SECONDS : MISS_TTL_SECONDS,
    );
    return result;
  }

  private async lookup(workId: string, language: string): Promise<LocalizedDescription | null> {
    try {
      const entityId = await this.findEntityByOpenLibraryId(workId);
      if (!entityId) return null;

      const articleTitle = await this.findArticleTitle(entityId, language);
      if (!articleTitle) return null;

      const extract = await this.fetchIntro(articleTitle, language);
      if (!extract) return null;

      return {
        text: extract,
        language,
        sourceName: 'wikipedia',
        sourceUrl: `https://${language}.wikipedia.org/wiki/${encodeURIComponent(
          articleTitle.replace(/ /g, '_'),
        )}`,
      };
    } catch {
      // Best-effort by port contract — see the class comment.
      return null;
    }
  }

  private async json<T>(url: string): Promise<T | null> {
    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  }

  /** `P648` is Wikidata's "Open Library ID" — an exact identifier match, never a title search. */
  private async findEntityByOpenLibraryId(workId: string): Promise<string | null> {
    const url = `https://www.wikidata.org/w/api.php?${new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: `haswbstatement:P648=${workId}`,
      srlimit: '1',
      format: 'json',
      origin: '*',
    })}`;
    const data = await this.json<WikidataSearchResponse>(url);
    const title = data?.query?.search?.[0]?.title;
    // The search index answers with page titles; for items in the main namespace that *is* the
    // Q-id, but a stray non-item hit would poison the next call, so it is checked rather than cast.
    return title && /^Q\d+$/.test(title) ? title : null;
  }

  private async findArticleTitle(entityId: string, language: string): Promise<string | null> {
    const site = `${language}wiki`;
    const url = `https://www.wikidata.org/w/api.php?${new URLSearchParams({
      action: 'wbgetentities',
      ids: entityId,
      props: 'sitelinks',
      sitefilter: site,
      format: 'json',
      origin: '*',
    })}`;
    const data = await this.json<WikidataEntitiesResponse>(url);
    return data?.entities?.[entityId]?.sitelinks?.[site]?.title ?? null;
  }

  /** `exintro` + `explaintext`: the lead section as plain text, no wiki markup to strip. */
  private async fetchIntro(articleTitle: string, language: string): Promise<string | null> {
    const url = `https://${language}.wikipedia.org/w/api.php?${new URLSearchParams({
      action: 'query',
      prop: 'extracts',
      exintro: '1',
      explaintext: '1',
      redirects: '1',
      titles: articleTitle,
      format: 'json',
      origin: '*',
    })}`;
    const data = await this.json<WikipediaExtractResponse>(url);
    const pages = Object.values(data?.query?.pages ?? {});
    const extract = pages.find((page) => page.missing === undefined)?.extract?.trim();
    if (!extract) return null;

    const blurb = toBlurb(extract);
    return blurb.length > 0 ? blurb : null;
  }
}
