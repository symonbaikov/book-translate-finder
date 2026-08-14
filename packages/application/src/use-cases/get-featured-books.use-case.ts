import {
  FEATURED_BOOKS,
  normalizeText,
  type CachePort,
  type FeaturedList,
  type JobQueuePort,
  type SourceLinkRepository,
  type EditionRepository,
  type WorkRepository,
  type WorkSearchHit,
  type WorkSearchPort,
} from '@btf/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';

const FEATURED_TTL_SECONDS = 30 * 60;
/**
 * How many unknown featured books one request may queue. The home page is the most-hit route on
 * the instance, and without a ceiling a cold database would enqueue the whole list on every
 * request until the first one lands.
 */
const MAX_BACKFILL_PER_REQUEST = 10;
/**
 * While entries are still resolving, the answer is worth re-computing often — a reader who comes
 * back in a minute should see a longer list, not a half-empty one cached for half an hour.
 */
const FILLING_TTL_SECONDS = 60;

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
  /** Fuzzy matching, because sources spell names their own way — see `matchFeatured`. */
  workSearch: WorkSearchPort;
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
    // Two curated entries can resolve to the same work — an author appearing in both lists, or
    // two spellings of one title — and the same cover twice on one page reads as a bug.
    const claimed = new Set<string>();

    for (const featured of FEATURED_BOOKS) {
      const hits = await this.deps.workSearch.search(`${featured.title} ${featured.author}`, 5);
      const match = matchFeatured(featured, hits);
      if (!match) {
        missing.push(`${featured.title} ${featured.author}`);
        continue;
      }
      if (claimed.has(match.id)) continue;
      claimed.add(match.id);

      books.push({
        workId: match.id,
        title: match.originalTitle,
        author: match.author,
        year: featured.year,
        coverUrl: match.coverUrl,
        list: featured.list,
        hasFreeCopy: await this.hasFreeCopy(match.id),
      });
    }

    for (const query of missing.slice(0, MAX_BACKFILL_PER_REQUEST)) {
      // Same deterministic job id shape as search's backfill, so the queue collapses repeats
      // rather than piling up one job per home-page view.
      await this.deps.backfillQueue.enqueue(`backfill-featured-${naturalise(query)}`, { query });
    }

    const output: GetFeaturedBooksOutput = { books, filling: missing.length > 0 };
    await this.deps.cache.set(
      featuredCacheKey(),
      output,
      output.filling ? FILLING_TTL_SECONDS : FEATURED_TTL_SECONDS,
    );
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

/**
 * Decides whether a search hit really is the curated book.
 *
 * An exact natural-key lookup was tried first and was too brittle: sources spell an author their
 * own way, so *James* came back under "Percival L. Everett" and never matched "Percival Everett".
 * Loosening it to "best search hit" is worse in the other direction — searching for *Hamnet*
 * returns "Summary of Hamnet by Maggie O'Farrell" by a different author, and putting a study
 * guide on the home page under the novel's name is a lie the page tells confidently.
 *
 * So both halves must agree: the title normalizes to exactly the curated title, and the hit's
 * author shares a significant word with the curated author. That admits "Percival L. Everett" and
 * rejects the summary.
 */
function matchFeatured(
  featured: { title: string; author: string },
  hits: readonly WorkSearchHit[],
): WorkSearchHit | null {
  const wantedTitle = normalizeText(featured.title);
  // Short words are dropped: initials and particles ("de", "van") identify nobody.
  const wantedAuthorWords = new Set(
    normalizeText(featured.author)
      .split(' ')
      .filter((word) => word.length > 2),
  );

  return (
    hits.find((hit) => {
      if (normalizeText(hit.originalTitle) !== wantedTitle) return false;
      return normalizeText(hit.author)
        .split(' ')
        .some((word) => word.length > 2 && wantedAuthorWords.has(word));
    }) ?? null
  );
}

function naturalise(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}
