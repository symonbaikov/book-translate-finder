import type { CachePort, RecommendationHit, SubjectBrowsePort } from '@btf/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';

/** Subjects the reader sends are the only input; nothing about the reader is stored. */
export interface RecommendBooksInput {
  subjects: readonly string[];
  /** Works the reader has already opened — suggesting those back is not a recommendation. */
  excludeWorkIds: readonly string[];
}

export interface RecommendBooksOutput {
  books: RecommendationHit[];
}

export interface RecommendBooksDeps {
  subjectBrowse: SubjectBrowsePort;
  cache: CachePort;
}

const RESULT_SIZE = 12;
/**
 * Fetched wider than shown so the reader's own already-read list can be filtered out afterwards
 * without leaving an empty section — and, more importantly, so the cached query depends only on
 * the genres, never on which specific books this person has opened.
 */
const FETCH_MULTIPLIER = 4;
const CACHE_TTL_SECONDS = 10 * 60;
/** More genres than this is noise: a long tail of one-off tags stops describing anyone's taste. */
const MAX_SUBJECTS = 8;

export function recommendationsCacheKey(subjects: readonly string[]): string {
  return `${CACHE_KEY_VERSION}:recommend:${[...subjects].sort().join('|')}`;
}

/**
 * Books like the ones the reader has been opening (docs/adr/0006-local-recommendations.md).
 *
 * The reader's history never reaches this layer. The browser keeps it, derives the genres, and
 * sends only those — so this use case receives "fantasy, dystopia" and has no idea, and no way to
 * learn, whose genres they are. That is what makes the promise on the sign-in page ("no profile,
 * no tracking") remain true while the feature exists.
 *
 * The consequence worth naming: recommendations do not follow a reader between devices, and
 * clearing site data clears them. Both are honest costs of not building a profile.
 */
export class RecommendBooks implements UseCase<RecommendBooksInput, RecommendBooksOutput> {
  constructor(private readonly deps: RecommendBooksDeps) {}

  async execute(input: RecommendBooksInput): Promise<RecommendBooksOutput> {
    const subjects = [...new Set(input.subjects.map((s) => s.trim().toLowerCase()))]
      .filter(Boolean)
      .slice(0, MAX_SUBJECTS);
    if (subjects.length === 0) return { books: [] };

    const key = recommendationsCacheKey(subjects);
    let candidates = await this.deps.cache.get<RecommendationHit[]>(key);
    if (!candidates) {
      candidates = await this.deps.subjectBrowse.recommendBySubjects({
        subjects,
        limit: RESULT_SIZE * FETCH_MULTIPLIER,
      });
      await this.deps.cache.set(key, candidates, CACHE_TTL_SECONDS);
    }

    const seen = new Set(input.excludeWorkIds);
    return { books: candidates.filter((book) => !seen.has(book.id)).slice(0, RESULT_SIZE) };
  }
}
