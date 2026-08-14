import type { CachePort, SubjectBrowsePort, WorkSearchHit } from '@btf/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';

const BROWSE_TTL_SECONDS = 15 * 60;
const MAX_RESULTS = 60;

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
}

export function subjectCacheKey(subject: string, language: string | null): string {
  return `${CACHE_KEY_VERSION}:subject:${subject.toLowerCase()}:${language ?? ''}`;
}

/**
 * The genre catalogue behind a clickable tag (docs/plan.md Phase 4.13).
 *
 * Deliberately does not queue a backfill when a tag is thin. Search does that because the reader
 * named a specific book; a genre is not a query any source can answer — "give me everything
 * tagged dystopia" is not an endpoint Open Library has — so a browse page shows what this
 * instance knows and says so, rather than pretending something is on its way.
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

    const output: BrowseBySubjectOutput = { subject, language, works };
    await this.deps.cache.set(key, output, BROWSE_TTL_SECONDS);
    return output;
  }
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
