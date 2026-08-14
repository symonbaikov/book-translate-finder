import {
  computeWorkNaturalKey,
  FEATURED_BOOKS,
  type CachePort,
  type FeaturedList,
  type JobQueuePort,
  type SourceLinkRepository,
  type EditionRepository,
  type WorkRepository,
} from '@btf/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';

const FEATURED_TTL_SECONDS = 30 * 60;
/**
 * How many unknown featured books one request may queue. The home page is the most-hit route on
 * the instance, and without a ceiling a cold database would enqueue the whole list on every
 * request until the first one lands.
 */
const MAX_BACKFILL_PER_REQUEST = 3;

export interface FeaturedBookDto {
  workId: string;
  title: string;
  author: string;
  year: number;
  coverUrl: string | null;
  list: FeaturedList;
  /** True when at least one legal free copy exists — the badge that makes a card worth clicking. */
  hasFreeCopy: boolean;
}

export interface GetFeaturedBooksOutput {
  books: FeaturedBookDto[];
  /** True while some entries are still being fetched, so the page can say so instead of lying. */
  filling: boolean;
}

export interface GetFeaturedBooksDeps {
  workRepository: WorkRepository;
  editionRepository: EditionRepository;
  sourceLinkRepository: SourceLinkRepository;
  cache: CachePort;
  backfillQueue: JobQueuePort;
}

export function featuredCacheKey(): string {
  return `${CACHE_KEY_VERSION}:featured`;
}

/**
 * The home page's book lists (docs/plan.md Phase 4.6).
 *
 * The catalogue is curated (`featured-books-catalog.ts`); this resolves it against whatever the
 * instance actually knows. A fresh install knows nothing, so unresolved entries are queued on the
 * same lazy-backfill queue that search uses (ADR-0003) and appear on a later visit — which is why
 * the home page of a brand-new instance fills itself in over the first few minutes instead of
 * being permanently empty or demanding a seed step.
 *
 * Only books that resolved are returned. Showing a title the instance cannot open would be a card
 * that goes nowhere.
 */
export class GetFeaturedBooks implements UseCase<void, GetFeaturedBooksOutput> {
  constructor(private readonly deps: GetFeaturedBooksDeps) {}

  async execute(): Promise<GetFeaturedBooksOutput> {
    const cached = await this.deps.cache.get<GetFeaturedBooksOutput>(featuredCacheKey());
    if (cached) return cached;

    const books: FeaturedBookDto[] = [];
    const missing: string[] = [];

    for (const featured of FEATURED_BOOKS) {
      const naturalKey = computeWorkNaturalKey(featured.title, featured.author);
      const work = await this.deps.workRepository.findByNaturalKey(naturalKey);
      if (!work) {
        missing.push(`${featured.title} ${featured.author}`);
        continue;
      }

      books.push({
        workId: work.id,
        title: work.originalTitle,
        author: work.author,
        year: featured.year,
        coverUrl: work.coverUrl,
        list: featured.list,
        hasFreeCopy: await this.hasFreeCopy(work.id),
      });
    }

    for (const query of missing.slice(0, MAX_BACKFILL_PER_REQUEST)) {
      // Same deterministic job id shape as search's backfill, so the queue collapses repeats
      // rather than piling up one job per home-page view.
      await this.deps.backfillQueue.enqueue(`backfill-featured-${naturalise(query)}`, { query });
    }

    const output: GetFeaturedBooksOutput = { books, filling: missing.length > 0 };
    // Cached even while filling: a shorter list now beats hammering the database on every view,
    // and the TTL is well under how long a backfill takes to land.
    await this.deps.cache.set(featuredCacheKey(), output, FEATURED_TTL_SECONDS);
    return output;
  }

  private async hasFreeCopy(workId: string): Promise<boolean> {
    const editions = await this.deps.editionRepository.findByWorkId(workId);
    for (const edition of editions) {
      const links = await this.deps.sourceLinkRepository.findByEditionId(edition.id);
      if (links.some((link) => link.isLegalFree)) return true;
    }
    return false;
  }
}

function naturalise(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}
