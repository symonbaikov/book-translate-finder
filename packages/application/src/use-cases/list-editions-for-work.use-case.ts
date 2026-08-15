import {
  NotFoundError,
  type CachePort,
  type EditionRepository,
  type SourceLink,
  type SourceLinkRepository,
  type WorkRepository,
} from '@golden/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';

export interface ListEditionsForWorkInput {
  workId: string;
  language?: string;
  year?: number;
}

/**
 * A copy of this edition the reader can have for nothing, right now.
 *
 * Carries its own `rightsStatus` even though only two values can appear here: the client must
 * never infer legality from a link's mere presence (docs/legal-policy.md), and a rule that holds
 * "because of how the list was built" is a rule the next change quietly breaks.
 */
export interface EditionFreeDownloadDto {
  url: string;
  /** `epub`, `txt`, `mp3`… or null when the source states none — a reading page, not a file. */
  format: string | null;
  provider: string;
  type: 'download' | 'listen';
  rightsStatus: 'public_domain' | 'open_license';
}

export interface EditionSummaryDto {
  id: string;
  title: string;
  language: string;
  translator: string | null;
  translatedFrom: string | null;
  publisher: string | null;
  year: number | null;
  isbn: string | null;
  coverUrl: string | null;
  pages: number | null;
  binding: string | null;
  /** How many legal source links this edition has — lets the list surface "where to get it"
   * upfront instead of hiding it behind a per-edition expand (Phase 3 live-UX finding). */
  linkCount: number;
  /** Whether bookstore lookups are possible for this edition (it has an ISBN). Separate from
   * `linkCount` because a bookstore lookup is derived, not a discovered source link — but the
   * list still needs it: an edition with only bookstores looked empty until this existed. */
  hasBookstores: boolean;
  /**
   * The free copies of *this* edition, sent with the list rather than left behind the per-edition
   * links panel. Two reasons: the client orders the list by it (an edition you can read now goes
   * first), and a promise the reader has to click twice to collect is not much of a promise.
   * Empty for almost every edition — a copyrighted printing has none.
   */
  freeDownloads: EditionFreeDownloadDto[];
}

export interface ListEditionsForWorkOutput {
  workId: string;
  editions: EditionSummaryDto[];
}

export interface ListEditionsForWorkDeps {
  workRepository: WorkRepository;
  editionRepository: EditionRepository;
  sourceLinkRepository: SourceLinkRepository;
  cache: CachePort;
}

const EDITIONS_TTL_SECONDS = 60 * 60;
/** How many free copies of one edition get a button of their own on the card. */
const MAX_FREE_DOWNLOADS_PER_EDITION = 4;

export function editionsCacheKey(workId: string, language?: string, year?: number): string {
  return `${CACHE_KEY_VERSION}:work:${workId}:editions:${language ?? ''}:${year ?? ''}`;
}

/** `GET /api/works/:id/editions?language=&year=` (docs/architecture.md §4). */
export class ListEditionsForWork implements UseCase<
  ListEditionsForWorkInput,
  ListEditionsForWorkOutput
> {
  constructor(private readonly deps: ListEditionsForWorkDeps) {}

  async execute(input: ListEditionsForWorkInput): Promise<ListEditionsForWorkOutput> {
    const cacheKey = editionsCacheKey(input.workId, input.language, input.year);
    const cached = await this.deps.cache.get<ListEditionsForWorkOutput>(cacheKey);
    if (cached) return cached;

    const work = await this.deps.workRepository.findById(input.workId);
    if (!work) {
      throw new NotFoundError(`Work not found: ${input.workId}`);
    }

    const editions = await this.deps.editionRepository.findByWorkId(input.workId);
    const filtered = editions.filter((edition) => {
      if (input.language && edition.language.value !== input.language) return false;
      if (input.year !== undefined && edition.year !== input.year) return false;
      return true;
    });
    const editionIds = filtered.map((edition) => edition.id);
    const linkCounts = await this.deps.sourceLinkRepository.countByEditionIds(editionIds);
    const freeDownloads =
      await this.deps.sourceLinkRepository.findFreeDownloadsByEditionIds(editionIds);

    const output: ListEditionsForWorkOutput = {
      workId: input.workId,
      editions: filtered.map((edition) => ({
        id: edition.id,
        title: edition.title,
        language: edition.language.value,
        translator: edition.translator,
        translatedFrom: edition.translatedFrom?.value ?? null,
        publisher: edition.publisher,
        year: edition.year,
        isbn: edition.isbn?.value ?? null,
        // The cover the source actually gave us, or none. There used to be an ISBN-derived
        // fallback here on the theory that Open Library resolves a cover for any ISBN; measured
        // against real data it does not. Of 35 ISBNs sampled from editions with no cover of their
        // own (across two heavily reprinted works, 964 and 936 such editions), 35 returned 404 —
        // while ISBNs of editions that *did* carry a cover resolved fine, which is the tell: the
        // ISBN endpoint finds a cover exactly when the record already has one. So the fallback
        // produced no images at all, and charged about a second of Open Library round trip per
        // edition for it — plus a share of the 100-per-5-minutes budget Open Library allows for
        // ISBN-keyed cover lookups, which is the same budget the covers that *do* work draw on.
        coverUrl: edition.coverUrl,
        pages: edition.pages,
        binding: edition.binding,
        linkCount: linkCounts.get(edition.id) ?? 0,
        // Every edition now has shops: without an ISBN they are searched by title + author.
        hasBookstores: true,
        freeDownloads: toFreeDownloads(freeDownloads.get(edition.id) ?? []),
      })),
    };

    await this.deps.cache.set(cacheKey, output, EDITIONS_TTL_SECONDS);
    return output;
  }
}

/**
 * The port already filtered these to free `download`/`listen` links; this only shapes them.
 *
 * Deduplicated by URL and capped: Gutenberg alone offers one edition half a dozen files, and a
 * card with eight identical-looking buttons on it is a card nobody reads. The cap is on the
 * buttons, not on the truth — every link stays available in the edition's own links panel.
 */
function toFreeDownloads(links: readonly SourceLink[]): EditionFreeDownloadDto[] {
  const seen = new Set<string>();
  const result: EditionFreeDownloadDto[] = [];

  for (const link of links) {
    if (seen.has(link.url)) continue;
    seen.add(link.url);
    if (link.type !== 'download' && link.type !== 'listen') continue;
    if (link.rightsStatus !== 'public_domain' && link.rightsStatus !== 'open_license') continue;
    result.push({
      url: link.url,
      format: link.format,
      provider: link.provider.value,
      type: link.type,
      rightsStatus: link.rightsStatus,
    });
    if (result.length === MAX_FREE_DOWNLOADS_PER_EDITION) break;
  }

  return result;
}
