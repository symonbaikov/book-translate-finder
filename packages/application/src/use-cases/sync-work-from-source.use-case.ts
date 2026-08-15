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
  inferLanguageFromIsbn,
  InvalidInputError,
  Isbn,
  LanguageCode,
  ProviderId,
  type ProviderEdition,
  type ProviderWork,
  resolveFieldConflict,
  romanizeCyrillicQuery,
  type SourceLinkRepository,
  type SyncLogRepository,
  type UnitOfWork,
  Work,
  type WorkRepository,
} from '@golden/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';

export interface SyncWorkFromSourceInput {
  /** Key into the `providers` map this use case was constructed with — see docs/rules.md §1 Open/Closed. */
  source: string;
  /** Plain-text query, e.g. "War and Peace Tolstoy" — never field-scoped (docs/research/coverage-phase0.md). */
  query: string;
  /**
   * Attach whatever this source finds to an existing work instead of deciding for itself which
   * work it is.
   *
   * Enrichment used to work only by coincidence: a second source's editions land on the first
   * source's work only if it reproduces the same natural key, i.e. spells the title and author
   * identically. That holds for Project Gutenberg, whose English titles match Open Library's, and
   * fails completely for a national library catalogue, whose records are *translations* — the
   * French catalogue calls «Обитель» "L'archipel des Solovki", which is a different natural key
   * and would therefore become a second, half-empty book on the site rather than a French edition
   * of the first. When the caller already knows which work it is asking about, saying so is both
   * simpler and correct.
   *
   * The work's own metadata is never rewritten in this mode — only its editions grow.
   */
  attachToWorkId?: string;
}

/**
 * What a sync resolved a query to, in the shape a search result needs.
 *
 * Carried out of the sync rather than looked up afterwards, because "afterwards" is where the
 * search used to lose it — see `markSearchResolved` in `search-works.use-case.ts`.
 */
export interface SyncedWorkSummary {
  id: string;
  originalTitle: string;
  author: string;
  firstPublishedYear: number | null;
  coverUrl: string | null;
}

export interface SyncWorkFromSourceOutput {
  status: 'synced' | 'not_found' | 'error';
  workId?: string;
  /** Present exactly when `status` is `synced`. */
  work?: SyncedWorkSummary;
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
 * Builds the work's author line, dropping repeats.
 *
 * A source can list the same person twice — Open Library returns `["Peter Watts", "Peter Watts"]`
 * for /works/OL17091839W, verified live. Joined naively that becomes "Peter Watts, Peter Watts",
 * a different natural key from every other source's "Peter Watts", so the same book splits into
 * two works: one carrying the editions, the other carrying the download links. The reader then
 * opens the card that has neither half of what they wanted.
 */
export function joinAuthorNames(names: readonly string[]): string {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const name of names) {
    const trimmed = name.trim();
    const key = trimmed.toLowerCase();
    if (trimmed.length === 0 || seen.has(key)) continue;
    seen.add(key);
    unique.push(trimmed);
  }
  return unique.join(', ') || 'Unknown';
}

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
      const topMatch = await this.findTopMatch(provider, input.query);
      if (!topMatch) {
        await this.recordSyncLog(input.source, null, 'error', `not_found: ${input.query}`);
        return { status: 'not_found' };
      }

      // Concurrent, not sequential: the two calls share only the work id, and awaiting them in
      // turn made every sync pay for the slower one *after* the faster one. Against real Open
      // Library latency (9–22s per request, docs/research/coverage-phase0.md) that ordering was
      // worth tens of seconds of a reader watching a spinner, for nothing.
      const [providerEditions, workDetails] = await Promise.all([
        provider.fetchEditions(topMatch.externalId),
        provider.fetchWorkDetails(topMatch.externalId),
      ]);

      const result = await this.deps.unitOfWork.runInTransaction(async () => {
        const author = joinAuthorNames(topMatch.authorNames);
        const originalLanguage = this.inferOriginalLanguage(providerEditions, topMatch.languages);

        const workExternalRef = ExternalRef.create(input.source, topMatch.externalId);
        const existingWorkLink =
          await this.deps.externalRefRepository.findBySourceAndExternalId(workExternalRef);
        const workNaturalKey = computeWorkNaturalKey(topMatch.title, author);
        const workNaturalKeyMatch =
          existingWorkLink || input.attachToWorkId
            ? null
            : await this.deps.workRepository.findByNaturalKey(workNaturalKey);
        // `attachToWorkId` wins over everything: the caller is not asking "which book is this",
        // it already knows, and is asking this source for that book's editions.
        const workId =
          input.attachToWorkId ??
          existingWorkLink?.entityId ??
          workNaturalKeyMatch?.id ??
          this.deps.idGenerator.newId();

        // A higher-priority source already owns this work's metadata (docs/architecture.md §5
        // source priority) — keep its fields and only bump syncedAt, rather than overwrite them
        // with this lower-priority source's data. The lookup is not asserted non-null: `workId`
        // can come from an `external_ref` row whose entity no longer exists, and a stale pointer
        // must degrade to "write the work" rather than crash the whole sync.
        const existingWork =
          input.attachToWorkId || !(await this.shouldApplyMetadata(input.source, workId))
            ? await this.deps.workRepository.findById(workId)
            : null;

        const work =
          existingWork?.withSyncedAt(this.deps.clock.now()) ??
          Work.create({
            id: workId,
            originalTitle: topMatch.title,
            originalLanguage,
            author,
            firstPublishedYear: topMatch.firstPublishedYear,
            description: workDetails.description,
            subjects: workDetails.subjects ?? [],
            coverUrl: workDetails.coverUrl ?? topMatch.coverUrl,
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
            linksSynced += outcome.linksSynced;
          }
        }

        await this.deps.cache.deleteByPrefix(`${CACHE_KEY_VERSION}:work:${work.id}`);

        return {
          workId: work.id,
          work: {
            id: work.id,
            originalTitle: work.originalTitle,
            author: work.author,
            firstPublishedYear: work.firstPublishedYear,
            coverUrl: work.coverUrl,
          },
          editionsSynced,
          linksSynced,
        };
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
   * The source's best answer for this query, asked in Cyrillic and then in Latin.
   *
   * A source's own search is not script-neutral, and Open Library's is dramatically not: measured
   * live, «Анна Каренина» returns 2 results and "Anna Karenina" returns 331; «Преступление и
   * наказание» returns 6 topped by a German edition, "Prestuplenie i nakazanie" returns 136 topped
   * by the Russian one. The project already romanized queries — but only when searching its *own*
   * Postgres, so a Russian reader's question reached the source in the form it answers worst, and
   * a book the source did have under a romanized title came back "not found" and was never synced
   * at all. The romanized pass runs only when the first one finds nothing, so a query the source
   * does answer in Cyrillic keeps that answer.
   */
  private async findTopMatch(
    provider: BookMetadataProvider,
    query: string,
  ): Promise<ProviderWork | undefined> {
    const [direct] = await provider.searchWorks({ text: query, limit: 1 });
    if (direct) return direct;

    const romanized = romanizeCyrillicQuery(query);
    if (romanized === null) return undefined;

    const [transliterated] = await provider.searchWorks({ text: romanized, limit: 1 });
    return transliterated;
  }

  /**
   * Best-effort per-edition sync: a single edition with an unparseable language or ISBN
   * (docs/research/coverage-phase0.md found Open Library data has plenty of these — codes like
   * `und`/`mul` aren't real single languages) is skipped, not fatal to the rest of the work's
   * sync. Returns `null` when skipped.
   *
   * Before giving up on a missing language, the ISBN gets one more say: found live, every one of
   * "Metro 2035"'s seven Spanish editions has an ISBN but no `languages` field at all on Open
   * Library, so all seven were dropped and the work showed zero editions despite the source
   * genuinely listing them. `inferLanguageFromIsbn` is deliberately narrow (see its doc comment)
   * and never overrides a language the source *did* report — only asked when there is none.
   */
  private async syncEdition(
    source: string,
    workId: string,
    providerEdition: ProviderEdition,
  ): Promise<{ linksSynced: number } | null> {
    const isbn =
      this.tryParseIsbn(providerEdition.isbn13) ?? this.tryParseIsbn(providerEdition.isbn10);
    const language =
      this.tryParseLanguage(providerEdition.language) ??
      this.tryParseLanguage(isbn && inferLanguageFromIsbn(isbn.value));
    if (!language) return null;

    const translatedFrom = this.tryParseLanguage(providerEdition.translatedFrom);
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

    // A higher-priority source already owns this edition's metadata (docs/architecture.md §5
    // source priority) — keep its fields as-is rather than overwrite them with this
    // lower-priority source's data. As with the work above, a missing row is treated as "create
    // it", not as an impossible state: asserting non-null here turned a stale `external_ref` into
    // a failed sync with the opaque message "Cannot read properties of null (reading 'id')".
    const existingEdition = (await this.shouldApplyMetadata(source, editionId))
      ? null
      : await this.deps.editionRepository.findById(editionId);

    const edition =
      existingEdition ??
      Edition.create({
        id: editionId,
        workId,
        title,
        language,
        translator: providerEdition.translator,
        translatedFrom,
        publisher,
        year,
        isbn,
        coverUrl: providerEdition.coverUrl,
        pages: providerEdition.pages ?? null,
        binding: providerEdition.binding ?? null,
      });
    await this.deps.editionRepository.save(edition);
    await this.deps.externalRefRepository.save(editionExternalRef, 'edition', edition.id);

    const linksSynced = await this.syncLinks(source, edition.id, providerEdition);
    return { linksSynced };
  }

  /**
   * Saves every provider-offered link that `LinkPolicy` accepts, and returns how many made it
   * through. A rejected link (docs/legal-policy.md) is skipped, not fatal — a provider offering
   * a link is never the same as that link being allowed — and one rejection must not discard the
   * edition's other formats. Any *other* error still propagates and fails the whole sync.
   */
  private async syncLinks(
    source: string,
    editionId: string,
    providerEdition: ProviderEdition,
  ): Promise<number> {
    let saved = 0;
    for (const candidate of providerEdition.links ?? []) {
      try {
        const sourceLink = assertLinkAllowed({
          id: this.deps.idGenerator.newId(),
          editionId,
          type: candidate.type,
          url: candidate.url,
          // A link's actual legal origin can differ from the adapter that surfaced it — see the
          // `links` doc comment on ProviderEdition.
          provider: ProviderId.create(candidate.provider ?? source),
          rightsStatus: providerEdition.rightsSignal,
          format: candidate.format ?? null,
          verifiedAt: this.deps.clock.now(),
        });
        await this.deps.sourceLinkRepository.save(sourceLink);
        saved += 1;
      } catch (error) {
        if (error instanceof DomainError) continue;
        throw error;
      }
    }
    return saved;
  }

  /**
   * Whether `source`'s metadata should overwrite `entityId`'s current fields. Sync stores merged
   * field values, not raw per-source snapshots, so the only record of "who's contributed here" is
   * every distinct source that has ever saved an `ExternalRef` to this entity (docs/architecture.md
   * §5). Feeding those sources — plus this sync's own — through `resolveFieldConflict` as
   * `{source, value: source}` candidates answers "does this source have the entity's top
   * metadata priority (self included)?": true when it does (including a brand-new entity, where
   * the only known source is this sync's own), false when a higher-priority source is already on
   * record and should stay authoritative.
   */
  private async shouldApplyMetadata(source: string, entityId: string): Promise<boolean> {
    const knownSources = await this.deps.externalRefRepository.findSourcesForEntity(entityId);
    const candidates = [...new Set([...knownSources, source])].map((s) => ({
      source: s,
      value: s,
    }));
    return resolveFieldConflict('metadata', candidates) === source;
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
   * among what was actually fetched, since a translation can't predate its original.
   *
   * When no edition can answer, the source's own declared languages are tried before English.
   * That matters for a source that knows the answer outright and has no editions to infer it
   * from: Wikidata records `P407` "language of the work" as a fact, and defaulting «Обитель» to
   * English because Wikidata happens to list no editions would print a plain falsehood on the
   * card. English remains the last resort — a simplification, not a guarantee.
   */
  private inferOriginalLanguage(
    editions: ProviderEdition[],
    declaredLanguages: readonly string[] = [],
  ): LanguageCode {
    let best: { year: number; language: LanguageCode } | null = null;
    for (const edition of editions) {
      if (edition.year === null) continue;
      const language = this.tryParseLanguage(edition.language);
      if (!language) continue;
      if (best === null || edition.year < best.year) {
        best = { year: edition.year, language };
      }
    }
    if (best) return best.language;

    for (const code of declaredLanguages) {
      const language = this.tryParseLanguage(code);
      if (language) return language;
    }
    return LanguageCode.create(FALLBACK_LANGUAGE);
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
