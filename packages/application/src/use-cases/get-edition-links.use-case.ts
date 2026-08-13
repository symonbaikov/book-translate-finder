import {
  assertLinkAllowed,
  bookstoresForCountry,
  DomainError,
  NotFoundError,
  ProviderId,
  type CachePort,
  type Clock,
  type Edition,
  type EditionRepository,
  type SourceLinkRepository,
} from '@btf/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';

export interface GetEditionLinksInput {
  editionId: string;
  /** ISO 3166-1 alpha-2 country the reader shops in; `null`/absent yields worldwide stores only. */
  country?: string | null;
}

export interface SourceLinkDto {
  type: string;
  provider: string;
  rightsStatus: string;
  url: string;
  /** Human-readable store/provider name, when the link is a bookstore lookup. */
  providerName?: string;
}

export interface GetEditionLinksOutput {
  editionId: string;
  links: SourceLinkDto[];
  /** Bookstore lookups for the requested country — kept separate from `links` because these are
   * derived from the ISBN rather than discovered from a source, and are lookups, not stock checks. */
  bookstores: SourceLinkDto[];
}

export interface GetEditionLinksDeps {
  editionRepository: EditionRepository;
  sourceLinkRepository: SourceLinkRepository;
  cache: CachePort;
  clock: Clock;
}

const LINKS_TTL_SECONDS = 6 * 60 * 60;

/**
 * Keyed under the owning work's versioned `work:{workId}` prefix (not `edition:{id}`) so the single
 * `cache.deleteByPrefix` call `SyncWorkFromSource` already does on every
 * successful sync (docs/architecture.md §6) invalidates this too, without a second invalidation
 * path to keep in sync. The country is part of the key because the bookstore list varies by it.
 */
export function editionLinksCacheKey(
  workId: string,
  editionId: string,
  country: string | null,
): string {
  return `${CACHE_KEY_VERSION}:work:${workId}:edition:${editionId}:links:${country ?? ''}`;
}

/**
 * `GET /api/editions/:id/links?country=` (docs/architecture.md §4) — every link carries its own
 * explicit `rightsStatus`; the client must never infer legality from a link merely existing
 * (docs/legal-policy.md).
 */
export class GetEditionLinks implements UseCase<GetEditionLinksInput, GetEditionLinksOutput> {
  constructor(private readonly deps: GetEditionLinksDeps) {}

  async execute(input: GetEditionLinksInput): Promise<GetEditionLinksOutput> {
    const edition = await this.deps.editionRepository.findById(input.editionId);
    if (!edition) {
      throw new NotFoundError(`Edition not found: ${input.editionId}`);
    }

    const country = input.country?.trim().toUpperCase() || null;
    const cacheKey = editionLinksCacheKey(edition.workId, edition.id, country);
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
      bookstores: this.buildBookstoreLinks(edition, country),
    };

    await this.deps.cache.set(cacheKey, output, LINKS_TTL_SECONDS);
    return output;
  }

  /**
   * Bookstore lookups are derived from the edition's ISBN rather than discovered from a source
   * (see `bookstore-catalog.ts` for why), but they still go through `assertLinkAllowed` so the
   * invariant "every link the UI shows was policy-approved" holds for them too. `rightsStatus`
   * is `copyrighted` — a shop selling a book is never evidence it is public domain, and
   * docs/legal-policy.md is explicit that an unclear signal must never be read as permission.
   * Without an ISBN there is nothing to look up, so the list is simply empty.
   */
  private buildBookstoreLinks(edition: Edition, country: string | null): SourceLinkDto[] {
    const isbn = edition.isbn?.value;
    if (!isbn) return [];

    const now = this.deps.clock.now();
    return bookstoresForCountry(country).flatMap((store) => {
      try {
        const link = assertLinkAllowed({
          id: `${edition.id}-${store.id}`,
          editionId: edition.id,
          type: 'buy',
          url: store.buildUrl(isbn),
          provider: ProviderId.create(store.id),
          rightsStatus: 'copyrighted',
          verifiedAt: now,
        });
        return [
          {
            type: link.type,
            provider: link.provider.value,
            providerName: store.name,
            rightsStatus: link.rightsStatus,
            url: link.url,
          },
        ];
      } catch (error) {
        // A store the policy rejects is dropped, never surfaced — same contract as sync-time
        // links (`SyncWorkFromSource.trySyncLink`). Anything else is a real bug: rethrow.
        if (error instanceof DomainError) return [];
        throw error;
      }
    });
  }
}
