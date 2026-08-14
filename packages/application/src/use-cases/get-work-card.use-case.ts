import {
  coverUrlFromIsbn,
  NotFoundError,
  type CachePort,
  type Edition,
  type EditionRepository,
  type ExternalRefRepository,
  type WorkRepository,
} from '@btf/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';

export interface GetWorkCardInput {
  workId: string;
}

export interface GetWorkCardOutput {
  id: string;
  originalTitle: string;
  originalLanguage: string;
  author: string;
  firstPublishedYear: number | null;
  description: string | null;
  coverUrl: string | null;
  subjects: readonly string[];
  translatedLanguages: string[];
  editionCount: number;
  /** Every distinct source that has contributed data to this work (docs/architecture.md §5) —
   * lets the UI show where a work's metadata came from. Sorted alphabetically for a stable,
   * cache-friendly order (not priority order — that's an internal sync-time decision, not
   * something worth surfacing to a reader). */
  sources: string[];
}

export interface GetWorkCardDeps {
  workRepository: WorkRepository;
  editionRepository: EditionRepository;
  externalRefRepository: ExternalRefRepository;
  cache: CachePort;
}

const CARD_TTL_SECONDS = 60 * 60;

export function workCacheKey(workId: string): string {
  return `${CACHE_KEY_VERSION}:work:${workId}:card`;
}

function firstEditionCover(editions: readonly Edition[]): string | null {
  for (const edition of editions) {
    const cover = edition.coverUrl ?? coverUrlFromIsbn(edition.isbn?.value);
    if (cover) return cover;
  }
  return null;
}

/** `GET /api/works/:id` (docs/architecture.md §4). */
export class GetWorkCard implements UseCase<GetWorkCardInput, GetWorkCardOutput> {
  constructor(private readonly deps: GetWorkCardDeps) {}

  async execute(input: GetWorkCardInput): Promise<GetWorkCardOutput> {
    const cacheKey = workCacheKey(input.workId);
    const cached = await this.deps.cache.get<GetWorkCardOutput>(cacheKey);
    if (cached) return cached;

    const work = await this.deps.workRepository.findById(input.workId);
    if (!work) {
      throw new NotFoundError(`Work not found: ${input.workId}`);
    }

    const editions = await this.deps.editionRepository.findByWorkId(input.workId);
    const translatedLanguages = [
      ...new Set(
        editions
          .map((edition) => edition.language.value)
          .filter((language) => language !== work.originalLanguage.value),
      ),
    ].sort();
    const sources = (await this.deps.externalRefRepository.findSourcesForEntity(work.id)).sort();

    const output: GetWorkCardOutput = {
      id: work.id,
      originalTitle: work.originalTitle,
      originalLanguage: work.originalLanguage.value,
      author: work.author,
      firstPublishedYear: work.firstPublishedYear,
      description: work.description,
      // A work without its own cover borrows the first edition that has one (or that has an
      // ISBN we can derive one from) — a book card with a blank cover is the most visible
      // failure in the whole UI, and one of its editions almost always has an image.
      coverUrl: work.coverUrl ?? firstEditionCover(editions),
      subjects: work.subjects,
      translatedLanguages,
      editionCount: editions.length,
      sources,
    };

    await this.deps.cache.set(cacheKey, output, CARD_TTL_SECONDS);
    return output;
  }
}
