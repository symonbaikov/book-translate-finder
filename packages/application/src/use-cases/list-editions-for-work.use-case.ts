import {
  NotFoundError,
  type CachePort,
  type EditionRepository,
  type WorkRepository,
} from '@btf/domain';
import type { UseCase } from '../use-case.js';

export interface ListEditionsForWorkInput {
  workId: string;
  language?: string;
  year?: number;
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
}

export interface ListEditionsForWorkOutput {
  workId: string;
  editions: EditionSummaryDto[];
}

export interface ListEditionsForWorkDeps {
  workRepository: WorkRepository;
  editionRepository: EditionRepository;
  cache: CachePort;
}

const EDITIONS_TTL_SECONDS = 60 * 60;

export function editionsCacheKey(workId: string, language?: string, year?: number): string {
  return `v1:work:${workId}:editions:${language ?? ''}:${year ?? ''}`;
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
      })),
    };

    await this.deps.cache.set(cacheKey, output, EDITIONS_TTL_SECONDS);
    return output;
  }
}
