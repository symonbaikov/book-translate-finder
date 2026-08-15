import {
  assertLinkAllowed,
  bookstoresForGrouped,
  DomainError,
  NotFoundError,
  ProviderId,
  type CachePort,
  type Clock,
  type Edition,
  type EditionRepository,
  type WorkRepository,
  type SourceLinkRepository,
} from '@golden/domain';
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
  /** File format for downloads (`epub`, `txt`, …); absent for buy/borrow links. */
  format?: string | null;
  /**
   * Why this shop is being offered, for bookstore links only:
   * `country` — it is in the country the reader picked in settings;
   * `language` — it is in a country where this edition's language is the market language;
   * `worldwide` — it ships internationally.
   *
   * Sent to the client so the reader's own choice can be labelled as their choice, rather than
   * disappearing into one undifferentiated list.
   */
  group?: 'country' | 'language' | 'worldwide';
  /**
   * Present only when this link was not found on the requested edition itself but on a sibling
   * edition of the same work (see `findFreeCopyOnSiblingEdition`) — a different print of the same
   * text, e.g. an old public-domain scan of a book whose modern reprint has no scan of its own.
   * `label` identifies which edition, so the UI can be honest about what a reader would get.
   */
  viaEdition?: { id: string; label: string };
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
  /** Only for the author name in the title+author shop fallback — see `buildBookstoreLinks`. */
  workRepository: WorkRepository;
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
    const hasFreeCopy = links.some(
      (link) => link.isLegalFree && (link.type === 'download' || link.type === 'listen'),
    );

    const output: GetEditionLinksOutput = {
      editionId: input.editionId,
      links: [
        ...links.map((link) => ({
          type: link.type,
          provider: link.provider.value,
          rightsStatus: link.rightsStatus,
          url: link.url,
          format: link.format,
        })),
        // This edition itself has no free copy — the same text may still be free on a sibling
        // edition (a different print, e.g. an old public-domain scan of a book whose modern
        // reprint has none). A reader who wants to *read* the work is not asking for this exact
        // print, so surfacing that copy here beats a bare "no legal links" for a work that in
        // fact has one — see docs/legal-policy.md: rightsStatus is still carried explicitly.
        ...(hasFreeCopy ? [] : await this.findFreeCopyOnSiblingEdition(edition)),
      ],
      bookstores: await this.buildBookstoreLinks(edition, country),
    };

    await this.deps.cache.set(cacheKey, output, LINKS_TTL_SECONDS);
    return output;
  }

  /**
   * When the requested edition has no free copy of its own, look for one on another edition of
   * the same work — preferring the oldest, since an older print is the one most likely to have
   * fallen into the public domain and been scanned. Picks at most one sibling edition (not every
   * one that has a copy) so the panel offers one honest way to read the text, not a wall of
   * near-duplicate old prints.
   */
  private async findFreeCopyOnSiblingEdition(edition: Edition): Promise<SourceLinkDto[]> {
    // Restricted to the same language as the requested edition: a free scan of a German
    // translation is not "a free copy" of an English edition, whatever the work-level rights
    // status of the original text is (docs/legal-policy.md — rights are a per-edition fact).
    const siblings = (await this.deps.editionRepository.findByWorkId(edition.workId))
      .filter(
        (sibling) => sibling.id !== edition.id && sibling.language.value === edition.language.value,
      )
      .sort((a, b) => (a.year ?? Infinity) - (b.year ?? Infinity));
    if (siblings.length === 0) return [];

    const freeByEditionId = await this.deps.sourceLinkRepository.findFreeDownloadsByEditionIds(
      siblings.map((sibling) => sibling.id),
    );

    const chosen = siblings.find((sibling) => (freeByEditionId.get(sibling.id) ?? []).length > 0);
    if (!chosen) return [];

    const label =
      [chosen.year ?? null, chosen.publisher ?? null].filter(Boolean).join(', ') || chosen.title;

    return (freeByEditionId.get(chosen.id) ?? []).map((link) => ({
      type: link.type,
      provider: link.provider.value,
      rightsStatus: link.rightsStatus,
      url: link.url,
      format: link.format,
      viaEdition: { id: chosen.id, label },
    }));
  }

  /**
   * Bookstore lookups are derived from the edition's ISBN rather than discovered from a source
   * (see `bookstore-catalog.ts` for why), but they still go through `assertLinkAllowed` so the
   * invariant "every link the UI shows was policy-approved" holds for them too. `rightsStatus`
   * is `copyrighted` — a shop selling a book is never evidence it is public domain, and
   * docs/legal-policy.md is explicit that an unclear signal must never be read as permission.
   *
   * Each link carries the reason it is offered (`group`), so the UI can put the reader's chosen
   * country under its own heading instead of blending it into one anonymous list of shops.
   */
  private async buildBookstoreLinks(
    edition: Edition,
    country: string | null,
  ): Promise<SourceLinkDto[]> {
    // An ISBN is the precise lookup, but its absence is not a reason to show nothing: 16% of real
    // editions have none (measured live), and those cards used to read as "nobody sells this
    // book". Falling back to title + author gives the reader the same shop, one search away.
    let term = edition.isbn?.value ?? '';
    if (!term) {
      const work = await this.deps.workRepository.findById(edition.workId);
      term = `${edition.title} ${work?.author ?? ''}`.trim();
    }
    if (!term) return [];

    const now = this.deps.clock.now();
    return bookstoresForGrouped({ country, language: edition.language.value }).flatMap(
      ({ store, group }) => {
        try {
          const link = assertLinkAllowed({
            id: `${edition.id}-${store.id}`,
            editionId: edition.id,
            type: 'buy',
            url: store.buildUrl(term),
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
              group,
            },
          ];
        } catch (error) {
          // A store the policy rejects is dropped, never surfaced — same contract as sync-time
          // links (`SyncWorkFromSource.trySyncLink`). Anything else is a real bug: rethrow.
          if (error instanceof DomainError) return [];
          throw error;
        }
      },
    );
  }
}
