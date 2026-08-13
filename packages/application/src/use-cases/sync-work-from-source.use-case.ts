import {
  assertLinkAllowed,
  type BookMetadataProvider,
  type CachePort,
  type Clock,
  computeEditionNaturalKey,
  computeWorkNaturalKey,
  DomainError,
  Edition,
  type EditionRepository,
  ExternalRef,
  type ExternalRefRepository,
  type IdGenerator,
  InvalidInputError,
  Isbn,
  LanguageCode,
  ProviderId,
  type ProviderEdition,
  type SourceLinkRepository,
  type SyncLogRepository,
  type UnitOfWork,
  Work,
  type WorkRepository,
} from '@btf/domain';
import type { UseCase } from '../use-case.js';

export interface SyncWorkFromSourceInput {
  /** Key into the `providers` map this use case was constructed with — see docs/rules.md §1 Open/Closed. */
  source: string;
  /** Plain-text query, e.g. "War and Peace Tolstoy" — never field-scoped (docs/research/coverage-phase0.md). */
  query: string;
}

export interface SyncWorkFromSourceOutput {
  status: 'synced' | 'not_found' | 'error';
  workId?: string;
  editionsSynced?: number;
  linksSynced?: number;
  error?: string;
}

export interface SyncWorkFromSourceDeps {
  providers: ReadonlyMap<string, BookMetadataProvider>;
  workRepository: WorkRepository;
  editionRepository: EditionRepository;
  sourceLinkRepository: SourceLinkRepository;
  externalRefRepository: ExternalRefRepository;
  syncLogRepository: SyncLogRepository;
  unitOfWork: UnitOfWork;
  cache: CachePort;
  clock: Clock;
  idGenerator: IdGenerator;
}

const FALLBACK_LANGUAGE = 'en';

/**
 * docs/architecture.md §2.3 / §5: normalize → dedupe editions → `LinkPolicy` → upsert in one
 * transaction → `sync_log` → cache invalidation. This is the first real use case in the
 * project — everything in Phase 1.1/1.2 (entities, natural keys, `LinkPolicy`, repositories,
 * `PgUnitOfWork`) exists to make this one orchestration correct and idempotent.
 */
export class SyncWorkFromSource implements UseCase<
  SyncWorkFromSourceInput,
  SyncWorkFromSourceOutput
> {
  constructor(private readonly deps: SyncWorkFromSourceDeps) {}

  async execute(input: SyncWorkFromSourceInput): Promise<SyncWorkFromSourceOutput> {
    const provider = this.deps.providers.get(input.source);
    if (!provider) {
      throw new InvalidInputError(`Unknown source: ${input.source}`);
    }

    try {
      const [topMatch] = await provider.searchWorks({ text: input.query, limit: 1 });
      if (!topMatch) {
        await this.recordSyncLog(input.source, null, 'error', `not_found: ${input.query}`);
        return { status: 'not_found' };
      }

      const providerEditions = await provider.fetchEditions(topMatch.externalId);

      const result = await this.deps.unitOfWork.runInTransaction(async () => {
        const author = topMatch.authorNames.join(', ') || 'Unknown';
        const originalLanguage = this.inferOriginalLanguage(providerEditions);

        const workExternalRef = ExternalRef.create(input.source, topMatch.externalId);
        const existingWorkLink =
          await this.deps.externalRefRepository.findBySourceAndExternalId(workExternalRef);
        const workNaturalKey = computeWorkNaturalKey(topMatch.title, author);
        const workNaturalKeyMatch = existingWorkLink
          ? null
          : await this.deps.workRepository.findByNaturalKey(workNaturalKey);
        const workId =
          existingWorkLink?.entityId ?? workNaturalKeyMatch?.id ?? this.deps.idGenerator.newId();

        const work = Work.create({
          id: workId,
          originalTitle: topMatch.title,
          originalLanguage,
          author,
          firstPublishedYear: topMatch.firstPublishedYear,
          syncedAt: this.deps.clock.now(),
        });
        await this.deps.workRepository.save(work);
        await this.deps.externalRefRepository.save(workExternalRef, 'work', work.id);

        let editionsSynced = 0;
        let linksSynced = 0;
        for (const providerEdition of providerEditions) {
          const outcome = await this.syncEdition(input.source, work.id, providerEdition);
          if (outcome) {
            editionsSynced += 1;
            linksSynced += outcome.linkSynced ? 1 : 0;
          }
        }

        await this.deps.cache.deleteByPrefix(`v1:work:${work.id}`);

        return { workId: work.id, editionsSynced, linksSynced };
      });

      await this.recordSyncLog(input.source, result.workId, 'ok', null);
      return { status: 'synced', ...result };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.recordSyncLog(input.source, null, 'error', message);
      return { status: 'error', error: message };
    }
  }

  /**
   * Best-effort per-edition sync: a single edition with an unparseable language or ISBN
   * (docs/research/coverage-phase0.md found Open Library data has plenty of these — codes like
   * `und`/`mul` aren't real single languages) is skipped, not fatal to the rest of the work's
   * sync. Returns `null` when skipped.
   */
  private async syncEdition(
    source: string,
    workId: string,
    providerEdition: ProviderEdition,
  ): Promise<{ linkSynced: boolean } | null> {
    const language = this.tryParseLanguage(providerEdition.language);
    if (!language) return null;

    const translatedFrom = this.tryParseLanguage(providerEdition.translatedFrom);
    const isbn =
      this.tryParseIsbn(providerEdition.isbn13) ?? this.tryParseIsbn(providerEdition.isbn10);
    const title = providerEdition.title || '(untitled)';
    const publisher = providerEdition.publisher;
    const year = providerEdition.year;

    const editionExternalRef = ExternalRef.create(source, providerEdition.externalId);
    const existingEditionLink =
      await this.deps.externalRefRepository.findBySourceAndExternalId(editionExternalRef);

    const editionNaturalKey = computeEditionNaturalKey(
      { workId, language: language.value, publisher, year, title },
      isbn?.value,
    );
    const naturalKeyMatch = existingEditionLink
      ? null
      : await this.deps.editionRepository.findByNaturalKey(editionNaturalKey);
    const editionId =
      existingEditionLink?.entityId ?? naturalKeyMatch?.id ?? this.deps.idGenerator.newId();

    const edition = Edition.create({
      id: editionId,
      workId,
      title,
      language,
      translator: providerEdition.translator,
      translatedFrom,
      publisher,
      year,
      isbn,
    });
    await this.deps.editionRepository.save(edition);
    await this.deps.externalRefRepository.save(editionExternalRef, 'edition', edition.id);

    const linkSynced = await this.trySyncLink(source, edition.id, providerEdition);
    return { linkSynced };
  }

  /**
   * A provider-offered link that `LinkPolicy` rejects (docs/legal-policy.md) is skipped, not
   * fatal — a provider suggesting a link is never the same as that link being allowed. Any
   * *other* error still propagates and fails the whole sync.
   */
  private async trySyncLink(
    source: string,
    editionId: string,
    providerEdition: ProviderEdition,
  ): Promise<boolean> {
    if (!providerEdition.link) return false;

    try {
      const sourceLink = assertLinkAllowed({
        id: this.deps.idGenerator.newId(),
        editionId,
        type: providerEdition.link.type,
        url: providerEdition.link.url,
        // A link's actual legal origin can differ from the adapter that surfaced it — see the
        // `link.provider` doc comment on ProviderEdition.
        provider: ProviderId.create(providerEdition.link.provider ?? source),
        rightsStatus: providerEdition.rightsSignal,
        verifiedAt: this.deps.clock.now(),
      });
      await this.deps.sourceLinkRepository.save(sourceLink);
      return true;
    } catch (error) {
      if (error instanceof DomainError) return false;
      throw error;
    }
  }

  private tryParseLanguage(code: string | null): LanguageCode | null {
    if (!code) return null;
    try {
      return LanguageCode.create(code);
    } catch {
      return null;
    }
  }

  private tryParseIsbn(value: string | null): Isbn | null {
    if (!value) return null;
    try {
      return Isbn.create(value);
    } catch {
      return null;
    }
  }

  /**
   * The original language can't be read directly off a search result — Open Library's `language`
   * field lists every language the work has been published in, not which one came first
   * (docs/research/coverage-phase0.md). Heuristic: the language of the earliest-dated edition
   * among what was actually fetched, since a translation can't predate its original. Falls back
   * to English when no edition has a usable year/language — a simplification, not a guarantee.
   */
  private inferOriginalLanguage(editions: ProviderEdition[]): LanguageCode {
    let best: { year: number; language: LanguageCode } | null = null;
    for (const edition of editions) {
      if (edition.year === null) continue;
      const language = this.tryParseLanguage(edition.language);
      if (!language) continue;
      if (best === null || edition.year < best.year) {
        best = { year: edition.year, language };
      }
    }
    return best?.language ?? LanguageCode.create(FALLBACK_LANGUAGE);
  }

  private async recordSyncLog(
    sourceName: string,
    workId: string | null,
    status: 'ok' | 'error',
    error: string | null,
  ): Promise<void> {
    await this.deps.syncLogRepository.record({
      id: this.deps.idGenerator.newId(),
      sourceName,
      workId,
      jobId: null,
      fetchedAt: this.deps.clock.now(),
      status,
      error,
    });
  }
}
