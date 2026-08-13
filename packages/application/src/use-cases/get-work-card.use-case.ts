import {
  NotFoundError,
  type CachePort,
  type EditionRepository,
  type WorkRepository,
} from '@btf/domain';
import type { UseCase } from '../use-case.js';

export interface GetWorkCardInput {
  workId: string;
}

export interface GetWorkCardOutput {
  id: string;
  originalTitle: string;
  originalLanguage: string;
  author: string;
  firstPublishedYear: number | null;
  translatedLanguages: string[];
  editionCount: number;
}

export interface GetWorkCardDeps {
  workRepository: WorkRepository;
  editionRepository: EditionRepository;
  cache: CachePort;
}

const CARD_TTL_SECONDS = 60 * 60;

export function workCacheKey(workId: string): string {
  return `v1:work:${workId}:card`;
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

    const output: GetWorkCardOutput = {
      id: work.id,
      originalTitle: work.originalTitle,
      originalLanguage: work.originalLanguage.value,
      author: work.author,
      firstPublishedYear: work.firstPublishedYear,
      translatedLanguages,
      editionCount: editions.length,
    };

    await this.deps.cache.set(cacheKey, output, CARD_TTL_SECONDS);
    return output;
  }
}
