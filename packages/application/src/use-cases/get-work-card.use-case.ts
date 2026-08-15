import {
  NotFoundError,
  type CachePort,
  type Edition,
  type EditionRepository,
  type ExternalRefRepository,
  type LocalizedDescriptionPort,
  type WorkRepository,
} from '@golden/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';

export interface GetWorkCardInput {
  workId: string;
  /**
   * The language the reader is reading the site in, when they have chosen one. Only ever used to
   * *look for* a description in that language — never to translate anything, and never to filter
   * what the card shows.
   */
  language?: string | undefined;
}

export interface GetWorkCardOutput {
  id: string;
  originalTitle: string;
  originalLanguage: string;
  author: string;
  firstPublishedYear: number | null;
  description: string | null;
  /**
   * The language `description` is actually in, when it is known — `null` for the stored blurb,
   * whose language the source never states. The UI needs this to be honest with a reader who
   * asked for Russian and got English: it says so instead of leaving them to guess.
   */
  descriptionLanguage: string | null;
  /** Where a localized description came from. Attribution, not decoration: Wikipedia is CC BY-SA. */
  descriptionSource: { name: string; url: string } | null;
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
  /** Absent on an instance with no such source — the card then shows the stored description. */
  localizedDescription?: LocalizedDescriptionPort | undefined;
}

const CARD_TTL_SECONDS = 60 * 60;

/**
 * Per language, because the card's description varies with it. The key stays `…:card` for the
 * no-language case so an instance upgrading into this feature does not have to warm a whole new
 * key space for the requests it already serves.
 */
export function workCacheKey(workId: string, language?: string | undefined): string {
  const base = `${CACHE_KEY_VERSION}:work:${workId}:card`;
  return language ? `${base}:${language}` : base;
}

/** The source whose ids the localized-description lookup is keyed by (Wikidata's `P648`). */
const OPEN_LIBRARY_SOURCE = 'open-library';

/**
 * The first edition that actually carries a cover.
 *
 * This used to fall back to an ISBN-derived URL per edition, which made the *first* edition with
 * an ISBN win — and that URL is a 404 in practice (see `ListEditionsForWork` for the measurement),
 * so the guess reliably beat a real cover sitting on some later edition. Removing it does not lose
 * a cover; it stops one from being hidden.
 */
function firstEditionCover(editions: readonly Edition[]): string | null {
  for (const edition of editions) {
    if (edition.coverUrl) return edition.coverUrl;
  }
  return null;
}

/** `GET /api/works/:id` (docs/architecture.md §4). */
export class GetWorkCard implements UseCase<GetWorkCardInput, GetWorkCardOutput> {
  constructor(private readonly deps: GetWorkCardDeps) {}

  async execute(input: GetWorkCardInput): Promise<GetWorkCardOutput> {
    const language = input.language?.trim().toLowerCase() || undefined;
    const cacheKey = workCacheKey(input.workId, language);
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
    const localized = language ? await this.describeIn(work.id, language) : null;

    const output: GetWorkCardOutput = {
      id: work.id,
      originalTitle: work.originalTitle,
      originalLanguage: work.originalLanguage.value,
      author: work.author,
      firstPublishedYear: work.firstPublishedYear,
      description: localized?.text ?? work.description,
      // The stored blurb's language is genuinely unknown — Open Library states it nowhere — so it
      // is reported as unknown rather than assumed to be the work's original language, which for
      // a Russian novel described in English would be exactly backwards.
      descriptionLanguage: localized?.language ?? null,
      descriptionSource: localized
        ? { name: localized.sourceName, url: localized.sourceUrl }
        : null,
      // A work without its own cover borrows the first edition that has one — a book card with a
      // blank cover is the most visible failure in the whole UI, and one of its editions usually
      // has an image.
      coverUrl: work.coverUrl ?? firstEditionCover(editions),
      subjects: work.subjects,
      translatedLanguages,
      editionCount: editions.length,
      sources,
    };

    await this.deps.cache.set(cacheKey, output, CARD_TTL_SECONDS);
    return output;
  }

  /**
   * A description in the reader's language, or `null` when this instance cannot get one.
   *
   * Keyed by the work's Open Library id because that is what the source can be looked up by; a
   * work synced from somewhere else simply has no such id and gets no localized description,
   * which is the honest outcome rather than a fuzzy title match.
   */
  private async describeIn(workId: string, language: string) {
    const { localizedDescription, externalRefRepository } = this.deps;
    if (!localizedDescription) return null;

    const externalIds = await externalRefRepository.findExternalIdsForEntity(
      workId,
      OPEN_LIBRARY_SOURCE,
    );
    for (const openLibraryWorkId of externalIds) {
      const found = await localizedDescription.fetchDescription({ openLibraryWorkId, language });
      if (found) return found;
    }
    return null;
  }
}
