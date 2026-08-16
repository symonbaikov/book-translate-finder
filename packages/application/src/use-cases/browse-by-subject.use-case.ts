import type {
  CachePort,
  JobQueuePort,
  SubjectBrowsePort,
  SubjectSourcePort,
  WorkSearchHit,
} from '@golden/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';
import { backfillJobId } from '../backfill-job-id.js';

const BROWSE_TTL_SECONDS = 15 * 60;
const MAX_RESULTS = 60;
/** Below this a genre page looks broken rather than sparse, so it is worth going out to fetch. */
const THIN_RESULT_THRESHOLD = 10;
/** How many of a subject's works to pull in per visit. Open Library orders them by edition count,
 * so the first twenty are the ones a reader is most likely to have heard of. */
const SUBJECT_FETCH_LIMIT = 20;

export interface BrowseBySubjectInput {
  subject: string;
  /** The reader's chosen book language, if they set one — carried through from the UI. */
  language?: string | undefined;
}

export interface BrowseBySubjectOutput {
  subject: string;
  language: string | null;
  works: WorkSearchHit[];
}

export interface BrowseBySubjectDeps {
  subjectBrowse: SubjectBrowsePort;
  cache: CachePort;
  /** Absent on an instance with no subject-capable source; the page then shows what it knows. */
  subjectSource?: SubjectSourcePort | undefined;
  backfillQueue?: JobQueuePort | undefined;
}

export function subjectCacheKey(subject: string, language: string | null): string {
  return `${CACHE_KEY_VERSION}:subject:${subject.toLowerCase()}:${language ?? ''}`;
}

/**
 * The genre catalogue behind a clickable tag (docs/plan.md Phase 4.13).
 *
 * A thin page queues a fetch. An earlier version of this comment claimed a genre "is not a query
 * any source can answer" — that was wrong: Open Library has `/subjects/{name}.json`, which for
 * "greeks" reports 3,979 works already ordered by edition count. So when a tag has fewer than
 * `THIN_RESULT_THRESHOLD` books locally, the top works for that subject are queued through the
 * ordinary sync pipeline and appear on a later visit.
 *
 * The ordering is by edition count rather than anything called "popularity". A book reprinted two
 * hundred times is one people kept buying, and it is a fact the source states — unlike a
 * bestseller ranking, which no open source publishes and which this project will not invent.
 */
export class BrowseBySubject implements UseCase<BrowseBySubjectInput, BrowseBySubjectOutput> {
  constructor(private readonly deps: BrowseBySubjectDeps) {}

  async execute(input: BrowseBySubjectInput): Promise<BrowseBySubjectOutput> {
    const subject = input.subject.trim();
    const language = input.language?.trim().toLowerCase() || null;
    const key = subjectCacheKey(subject, language);

    const cached = await this.deps.cache.get<BrowseBySubjectOutput>(key);
    if (cached) return cached;

    const works = await this.deps.subjectBrowse.browseBySubject({
      subject,
      ...(language ? { language } : {}),
      limit: MAX_RESULTS,
    });

    if (works.length < THIN_RESULT_THRESHOLD) {
      await this.requestMore(subject);
    }

    const output: BrowseBySubjectOutput = { subject, language, works };
    await this.deps.cache.set(key, output, BROWSE_TTL_SECONDS);
    return output;
  }

  /**
   * Asks the source which books are in this genre and queues the ones this instance lacks.
   *
   * Every failure is swallowed: the page the reader is looking at is already rendered, and a
   * genre that cannot be enriched is a thinner page, not an error.
   */
  private async requestMore(subject: string): Promise<void> {
    const { subjectSource, backfillQueue } = this.deps;
    if (!subjectSource || !backfillQueue) return;

    try {
      const works = await subjectSource.fetchWorksForSubject(subject, SUBJECT_FETCH_LIMIT);
      for (const work of works) {
        const query = `${work.title} ${work.author}`;
        // The same deterministic job-id shape the rest of the backfill uses, so a genre visited
        // twice in a minute enqueues each book once rather than twice.
        //
        // `deferred`, and this is the burst the priority exists for: one thin genre page queues
        // twenty books in a single breath, and the reader who opened it is already looking at the
        // page. A search typed a second later must not wait behind all twenty.
        await backfillQueue.enqueue(
          backfillJobId('backfill-subject', query),
          { query },
          { priority: 'deferred' },
        );
      }
    } catch {
      // Intentionally ignored — see the doc comment.
    }
  }
}

export interface ListSubjectsDeps {
  subjectBrowse: SubjectBrowsePort;
  cache: CachePort;
}

/**
 * Tags Open Library carries that describe a *copy*, not a book: whether a scan exists, whether a
 * library lends it, which accessibility format it was produced in. They are among the most common
 * tags in the data — an unfiltered "popular tags" list is mostly these — and none of them answers
 * "what is this book about", which is the only question a genre chip is asked.
 */
const NON_GENRE_TAGS = new Set([
  'accessible book',
  'in library',
  'internet archive wishlist',
  'lending library',
  'overdrive',
  'popular print disabled books',
  'protected daisy',
  'large type books',
  'reading level',
]);

/** Chips are one line of text, so a tag that cannot be one is unusable however popular it is. */
const MAX_TAG_LENGTH = 40;

/**
 * Whether a contributor-written tag is a genre a reader would choose to browse.
 *
 * Deliberately a rejection list rather than a taxonomy: the tags are free text and this project
 * does not invent categories for them (see the note in the Open Library adapter). What is thrown
 * out is only what is demonstrably *not* subject matter — machine tags (`nyt:bestseller=…`), the
 * cataloguing states above, LCSH subdivision strings (`United States -- History -- 1945-`), and
 * anything too long to render as a chip.
 */
export function isGenreTag(tag: string): boolean {
  const normalized = tag.trim().toLowerCase();
  if (normalized.length === 0 || normalized.length > MAX_TAG_LENGTH) return false;
  if (normalized.includes(':') || normalized.includes('=') || normalized.includes('--')) {
    return false;
  }
  return !NON_GENRE_TAGS.has(normalized);
}

/** The tag cloud: only tags that actually have works behind them. */
export class ListSubjects implements UseCase<
  void,
  { subjects: { subject: string; workCount: number }[] }
> {
  private static readonly LIMIT = 40;
  /** Over-fetched because the rejects above are common enough to eat a whole page of tags. */
  private static readonly CANDIDATE_LIMIT = ListSubjects.LIMIT * 4;

  constructor(private readonly deps: ListSubjectsDeps) {}

  async execute(): Promise<{ subjects: { subject: string; workCount: number }[] }> {
    const key = `${CACHE_KEY_VERSION}:subjects`;
    const cached = await this.deps.cache.get<{
      subjects: { subject: string; workCount: number }[];
    }>(key);
    if (cached) return cached;

    const candidates = await this.deps.subjectBrowse.popularSubjects(ListSubjects.CANDIDATE_LIMIT);
    const subjects = candidates
      .filter((entry) => isGenreTag(entry.subject))
      .slice(0, ListSubjects.LIMIT);
    const output = { subjects };
    await this.deps.cache.set(key, output, BROWSE_TTL_SECONDS);
    return output;
  }
}
