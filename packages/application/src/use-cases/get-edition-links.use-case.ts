import {
  NotFoundError,
  type CachePort,
  type EditionRepository,
  type SourceLinkRepository,
} from '@btf/domain';
import type { UseCase } from '../use-case.js';

export interface GetEditionLinksInput {
  editionId: string;
}

export interface SourceLinkDto {
  type: string;
  provider: string;
  rightsStatus: string;
  url: string;
}

export interface GetEditionLinksOutput {
  editionId: string;
  links: SourceLinkDto[];
}

export interface GetEditionLinksDeps {
  editionRepository: EditionRepository;
  sourceLinkRepository: SourceLinkRepository;
  cache: CachePort;
}

const LINKS_TTL_SECONDS = 6 * 60 * 60;

/**
 * Keyed under the owning work's `v1:work:{workId}` prefix (not `v1:edition:{id}`) so the single
 * `cache.deleteByPrefix('v1:work:{id}')` call `SyncWorkFromSource` already does on every
 * successful sync (docs/architecture.md §6) invalidates this too, without a second invalidation
 * path to keep in sync.
 */
export function editionLinksCacheKey(workId: string, editionId: string): string {
  return `v1:work:${workId}:edition:${editionId}:links`;
}

/**
 * `GET /api/editions/:id/links` (docs/architecture.md §4) — every link carries its own explicit
 * `rightsStatus`; the client must never infer legality from a link merely existing
 * (docs/legal-policy.md).
 */
export class GetEditionLinks implements UseCase<GetEditionLinksInput, GetEditionLinksOutput> {
  constructor(private readonly deps: GetEditionLinksDeps) {}

  async execute(input: GetEditionLinksInput): Promise<GetEditionLinksOutput> {
    const edition = await this.deps.editionRepository.findById(input.editionId);
    if (!edition) {
      throw new NotFoundError(`Edition not found: ${input.editionId}`);
    }

    const cacheKey = editionLinksCacheKey(edition.workId, edition.id);
    const cached = await this.deps.cache.get<GetEditionLinksOutput>(cacheKey);
    if (cached) return cached;

    const links = await this.deps.sourceLinkRepository.findByEditionId(input.editionId);

    const output: GetEditionLinksOutput = {
      editionId: input.editionId,
      links: links.map((link) => ({
        type: link.type,
        provider: link.provider.value,
        rightsStatus: link.rightsStatus,
        url: link.url,
      })),
    };

    await this.deps.cache.set(cacheKey, output, LINKS_TTL_SECONDS);
    return output;
  }
}
