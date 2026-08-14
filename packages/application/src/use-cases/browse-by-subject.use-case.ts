import type {
  CachePort,
  JobQueuePort,
  SubjectBrowsePort,
  SubjectSourcePort,
  WorkSearchHit,
} from '@btf/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';

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
        await backfillQueue.enqueue(`backfill-subject-${naturalise(query)}`, { query });
      }
    } catch {
      // Intentionally ignored — see the doc comment.
    }
  }
}

function naturalise(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export interface ListSubjectsDeps {
  subjectBrowse: SubjectBrowsePort;
  cache: CachePort;
}

/** The tag cloud: only tags that actually have works behind them. */
export class ListSubjects implements UseCase<
  void,
  { subjects: { subject: string; workCount: number }[] }
> {
  private static readonly LIMIT = 40;

  constructor(private readonly deps: ListSubjectsDeps) {}

  async execute(): Promise<{ subjects: { subject: string; workCount: number }[] }> {
    const key = `${CACHE_KEY_VERSION}:subjects`;
    const cached = await this.deps.cache.get<{
      subjects: { subject: string; workCount: number }[];
    }>(key);
    if (cached) return cached;

    const subjects = await this.deps.subjectBrowse.popularSubjects(ListSubjects.LIMIT);
    const output = { subjects };
    await this.deps.cache.set(key, output, BROWSE_TTL_SECONDS);
    return output;
  }
}
