import type { CachePort, SubjectSourcePort, SubjectWork } from '@golden/domain';
import type { ResilientFetcher } from '../http/resilient-fetch.js';

const CACHE_TTL_SECONDS = 24 * 60 * 60;

interface OpenLibrarySubjectResponse {
  works?: {
    title?: string;
    authors?: { name?: string }[];
    edition_count?: number;
  }[];
}

/**
 * Open Library's subject index — `/subjects/{name}.json`.
 *
 * This endpoint is why the genre pages can be filled at all. An earlier comment in
 * `BrowseBySubject` claimed a genre "is not a question any source can answer"; that was simply
 * wrong, and this adapter is the correction. Verified live: `/subjects/greeks.json` reports 3,979
 * works, already ordered by edition count.
 *
 * Cached for a day: a subject's contents move on the scale of months, and this is the one call
 * that fires when a reader clicks a tag nobody has clicked before.
 */
export class OpenLibrarySubjectSource implements SubjectSourcePort {
  constructor(
    private readonly fetcher: ResilientFetcher,
    private readonly cache: CachePort,
    private readonly userAgent: string,
  ) {}

  async fetchWorksForSubject(subject: string, limit: number): Promise<SubjectWork[]> {
    // Open Library's own slug form: lowercase, spaces as underscores.
    const slug = subject.trim().toLowerCase().replace(/\s+/g, '_');
    if (!slug) return [];

    const cacheKey = `provider:open-library:subject:${encodeURIComponent(slug)}:${limit}`;
    const cached = await this.cache.get<SubjectWork[]>(cacheKey);
    if (cached) return cached;

    const url = `https://openlibrary.org/subjects/${encodeURIComponent(slug)}.json?limit=${limit}`;
    const res = await this.fetcher.fetch(url, { headers: { 'User-Agent': this.userAgent } });
    // Best-effort: an unknown subject is a 404, and a tag with nothing behind it is a normal
    // outcome rather than a failure worth propagating.
    if (!res.ok) return [];

    const data = (await res.json()) as OpenLibrarySubjectResponse;
    const works: SubjectWork[] = (data.works ?? [])
      .map((work) => ({
        title: (work.title ?? '').trim(),
        author:
          (work.authors ?? [])
            .map((a) => a.name ?? '')
            .find(Boolean)
            ?.trim() ?? '',
        editionCount: work.edition_count ?? 0,
      }))
      // A work with no author is unmatchable against anything the sync would store later.
      .filter((work) => work.title.length > 0 && work.author.length > 0);

    await this.cache.set(cacheKey, works, CACHE_TTL_SECONDS);
    return works;
  }
}
