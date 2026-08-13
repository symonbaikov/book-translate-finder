import {
  NotFoundError,
  type CachePort,
  type EditionRepository,
  type SourceLinkRepository,
  type WorkRepository,
} from '@btf/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';

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
  coverUrl: string | null;
  /** How many legal source links this edition has — lets the list surface "where to get it"
   * upfront instead of hiding it behind a per-edition expand (Phase 3 live-UX finding). */
  linkCount: number;
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
    const linkCounts = await this.deps.sourceLinkRepository.countByEditionIds(
      filtered.map((edition) => edition.id),
    );

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
        coverUrl: edition.coverUrl,
        linkCount: linkCounts.get(edition.id) ?? 0,
      })),
    };

    await this.deps.cache.set(cacheKey, output, EDITIONS_TTL_SECONDS);
    return output;
  }
}
