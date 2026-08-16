import {
  NotFoundError,
  Rating,
  type CachePort,
  type Clock,
  type Edition,
  type EditionRatingProvider,
  type EditionRatingResult,
  type EditionRepository,
  type EditionReviewLink,
  type EditionReviewsProvider,
  type ReviewLinkQuery,
  sha256Hex,
  type RatingQuery,
  type WorkRepository,
} from '@golden/domain';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';
import { settleProviders } from '../settle-providers.js';
import type { UseCase } from '../use-case.js';

/**
 * What readers thought of each *printing* of one work, and — the point of the whole thing — what
 * that adds up to per translator.
 *
 * **The honest framing, stated once here and repeated in every string the reader sees.** Nobody
 * publishes an assessment of translation quality; the sources that come closest publish what their
 * readers thought of a volume. Attaching that number to an edition is accurate. Calling it "the
 * rating of this translation" would not be, and the UI must not — see `Rating`'s class comment.
 *
 * The comparison is what earns its place: two Russian editions of the same novel, two translators,
 * two populations of readers. Neither number means much alone; side by side, with the vote counts
 * visible, they are the closest thing to a translation signal that open data can give.
 *
 * **Only editions with an ISBN are looked up**, because only an ISBN identifies a printing. The
 * ones without are counted into `withoutIsbn` and reported, not silently dropped — a reader
 * comparing four translations must know the page could only ask about two of them.
 */

export interface AggregateTranslationRatingsInput {
  readonly workId: string;
  /** Restricts the answer to one language, mirroring the edition list's own filter. */
  readonly language?: string | null;
  /**
   * The editions the caller actually wants rated — the ones a reader can see.
   *
   * Load-bearing, not a nicety. `/works/:id/editions` returns rows in no particular order and the
   * *client* sorts them (free copies first, then the reader's language); a work like `Emma` has
   * nine hundred printings and the ten on screen are nowhere near the first ten in the table. A
   * server that picked its own two dozen would rate editions nobody is looking at and leave every
   * visible row blank. Unknown ids are ignored, and the cap still applies.
   *
   * Omitted — for a direct API caller with no page to render — the answer falls back to the first
   * `MAX_LOOKUPS_PER_WORK` editions that carry an ISBN.
   */
  readonly editionIds?: readonly string[] | null;
}

export interface EditionRatingDto {
  readonly editionId: string;
  readonly providerId: string;
  readonly providerName: string;
  /** Mean score on `outOf`, rounded for display. */
  readonly average: number;
  readonly outOf: number;
  readonly votes: number;
  /** Too few voters to compare this translation with another — shown, never ranked on. */
  readonly lowConfidence: boolean;
  /** The source's own page for this edition, where the reviews behind the number live. */
  readonly url: string | null;
}

/**
 * Where the reviews of one printing live — an address, not a verdict.
 *
 * Its own type rather than a field on `EditionRatingDto`, because it is an answer to a different
 * question and available on different terms: the number needs an API key, the link does not.
 */
export interface EditionReviewLinkDto {
  readonly editionId: string;
  readonly providerId: string;
  readonly providerName: string;
  readonly url: string;
}

export interface TranslatorRatingDto {
  readonly translator: string;
  readonly language: string;
  readonly average: number;
  readonly outOf: number;
  /** Voters across every rated edition credited to this translator, in this language. */
  readonly votes: number;
  readonly ratedEditions: number;
  readonly lowConfidence: boolean;
}

export interface AggregateTranslationRatingsOutput {
  readonly workId: string;
  readonly editions: readonly EditionRatingDto[];
  /**
   * Reviews of a specific printing, on sites that publish no numbers we can read.
   *
   * Sparse by nature — roughly one printing in six is known to Goodreads through Open Library's
   * identifiers — and independent of `editions`: an edition can have a link and no rating, which
   * is the normal case on an instance with no `GOOGLE_BOOKS_API_KEY`.
   */
  readonly reviewLinks: readonly EditionReviewLinkDto[];
  /**
   * One row per named translator per language, and only where the same language has **two or more**
   * translators with ratings *and* the translator has more than one rated edition. A single
   * translator's average has nothing to be compared against, and printing it alone invites the
   * reader to read it as a verdict on their work; a single-edition "average" is just the edition's
   * own number said twice.
   */
  readonly translators: readonly TranslatorRatingDto[];
  /** Editions that could not be asked about because they carry no ISBN. */
  readonly withoutIsbn: number;
  /** Editions beyond `MAX_LOOKUPS_PER_WORK` that this answer did not cover. */
  readonly notLookedUp: number;
  /** Sources that failed this time, named rather than quietly missing. */
  readonly degraded: readonly { readonly providerId: string; readonly reason: string }[];
  readonly retrievedAt: string;
}

export interface AggregateTranslationRatingsDeps {
  readonly editionRepository: EditionRepository;
  readonly workRepository: WorkRepository;
  readonly ratingProviders: readonly EditionRatingProvider[];
  /** Sources that can say where an edition's reviews are without publishing a number. */
  readonly reviewProviders: readonly EditionReviewsProvider[];
  readonly cache: CachePort;
  readonly clock: Clock;
}

/**
 * A day, matching the adapter's own per-ISBN cache. Ratings move by a decimal over months; the
 * binding constraint is Google's daily quota, not freshness.
 */
export const RATINGS_TTL_SECONDS = 24 * 60 * 60;

/** Short, for the same reason `AggregateEditionPrices` shortens it: a minute of source trouble
 *  must not freeze a half-empty answer for a day. */
export const RATINGS_DEGRADED_TTL_SECONDS = 5 * 60;

/**
 * `Хаджи-Мурат` has over two hundred editions. One outbound request per edition per page view
 * would exhaust a daily Google quota on a handful of readers, so the page asks about the editions
 * a reader actually sees first and says so when it stopped.
 */
export const MAX_LOOKUPS_PER_WORK = 24;

/** How many lookups run at once. Enough to stay well inside a page load, gentle on the quota. */
const LOOKUP_CONCURRENCY = 6;

/**
 * Keyed under the owning work's versioned prefix, so the `cache.deleteByPrefix` that
 * `SyncWorkFromSource` already runs invalidates this too (docs/architecture.md §6). The requested
 * editions are folded in as a hash: the same page asks the same question every time, and two
 * different slices of a long edition list are two different answers.
 */
export function translationRatingsCacheKey(
  workId: string,
  language: string | null,
  editionIds: readonly string[] | null,
): string {
  const scope =
    editionIds && editionIds.length > 0 ? sha256Hex(editionIds.join(',')).slice(0, 16) : 'all';
  return `${CACHE_KEY_VERSION}:work:${workId}:ratings:${language ?? ''}:${scope}`;
}

/** Runs `task` over `items` with a fixed number in flight, preserving input order. */
async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (let index = next++; index < items.length; index = next++) {
      results[index] = await task(items[index]!);
    }
  });

  await Promise.all(workers);
  return results;
}

export class AggregateTranslationRatings implements UseCase<
  AggregateTranslationRatingsInput,
  AggregateTranslationRatingsOutput
> {
  constructor(private readonly deps: AggregateTranslationRatingsDeps) {}

  async execute(
    input: AggregateTranslationRatingsInput,
  ): Promise<AggregateTranslationRatingsOutput> {
    const work = await this.deps.workRepository.findById(input.workId);
    if (!work) throw new NotFoundError(`Work not found: ${input.workId}`);

    const language = input.language?.trim().toLowerCase() || null;
    const requested = input.editionIds?.length ? input.editionIds : null;
    const cacheKey = translationRatingsCacheKey(work.id, language, requested);
    const cached = await this.deps.cache.get<AggregateTranslationRatingsOutput>(cacheKey);
    if (cached) return cached;

    const all = await this.deps.editionRepository.findByWorkId(work.id);
    const byLanguage = language ? all.filter((e) => e.language.value === language) : all;
    // The caller's order is kept: it is the order the reader sees, so the cap cuts from the
    // bottom of *their* list rather than from an arbitrary point in the table.
    const inScope = requested
      ? requested.flatMap((id) => byLanguage.filter((edition) => edition.id === id))
      : byLanguage;

    const withIsbn = inScope.filter((edition) => edition.isbn !== null);
    const looked = withIsbn.slice(0, MAX_LOOKUPS_PER_WORK);

    // The two run together: a keyed instance gets numbers and links, a keyless one gets links
    // alone, and neither waits on the other.
    const [perEdition, reviews] = await Promise.all([
      mapWithConcurrency(looked, LOOKUP_CONCURRENCY, async (edition) =>
        this.rateEdition(edition, work.author),
      ),
      this.findReviewLinks(looked),
    ]);

    const editions = perEdition.flatMap((entry) => (entry.dto ? [entry.dto] : []));
    const degraded = dedupeDegraded([
      ...perEdition.flatMap((entry) => entry.degraded),
      ...reviews.degraded,
    ]);

    const output: AggregateTranslationRatingsOutput = {
      workId: work.id,
      editions,
      reviewLinks: reviews.links,
      translators: aggregateByTranslator(looked, perEdition),
      withoutIsbn: inScope.length - withIsbn.length,
      notLookedUp: withIsbn.length - looked.length,
      degraded,
      retrievedAt: this.deps.clock.now().toISOString(),
    };

    await this.deps.cache.set(
      cacheKey,
      output,
      degraded.length > 0 ? RATINGS_DEGRADED_TTL_SECONDS : RATINGS_TTL_SECONDS,
    );
    return output;
  }

  /**
   * Where the reader can read opinions about these exact printings.
   *
   * Batched per source, not per edition — see `EditionReviewsProvider`. A link is offered for an
   * edition whether or not a number was found for it: on an instance with no Google Books key
   * these links are the entire feature, and they are the one part of it that costs no key.
   */
  private async findReviewLinks(editions: readonly Edition[]): Promise<{
    links: EditionReviewLinkDto[];
    degraded: { providerId: string; reason: string }[];
  }> {
    const queries: ReviewLinkQuery[] = editions.map((edition) => ({
      editionId: edition.id,
      isbn13: edition.isbn?.value ?? null,
      isbn10: null,
    }));

    const outcomes = await settleProviders(
      this.deps.reviewProviders,
      (provider) => provider.id.value,
      (provider) => provider.findLinks(queries),
    );

    return {
      links: outcomes.flatMap((outcome): EditionReviewLink[] =>
        outcome.status === 'ok' ? [...outcome.value] : [],
      ),
      degraded: outcomes.flatMap((outcome) =>
        outcome.status === 'failed'
          ? [{ providerId: outcome.providerId, reason: outcome.reason }]
          : [],
      ),
    };
  }

  /**
   * Every source asked about one edition; the best-supported answer wins.
   *
   * "Best supported" is most voters, not highest score — with one provider today it decides
   * nothing, and with two it must not turn into a quiet search for the flattering number.
   */
  private async rateEdition(
    edition: Edition,
    author: string,
  ): Promise<{
    editionId: string;
    rating: Rating | null;
    dto: EditionRatingDto | null;
    degraded: { providerId: string; reason: string }[];
  }> {
    const query: RatingQuery = {
      isbn13: edition.isbn?.value ?? null,
      isbn10: null,
      title: edition.title,
      author,
      language: edition.language.value,
    };

    const outcomes = await settleProviders(
      this.deps.ratingProviders,
      (provider) => provider.id.value,
      (provider) => provider.rate(query),
    );

    const found = outcomes.flatMap((outcome) =>
      outcome.status === 'ok' && outcome.value ? [outcome.value] : [],
    );
    const degraded = outcomes.flatMap((outcome) =>
      outcome.status === 'failed'
        ? [{ providerId: outcome.providerId, reason: outcome.reason }]
        : [],
    );

    const best = found.reduce<EditionRatingResult | null>(
      (winner, candidate) =>
        winner === null || candidate.rating.votes > winner.rating.votes ? candidate : winner,
      null,
    );

    return {
      editionId: edition.id,
      rating: best?.rating ?? null,
      dto: best ? toDto(edition.id, best) : null,
      degraded,
    };
  }
}

function toDto(editionId: string, result: EditionRatingResult): EditionRatingDto {
  return {
    editionId,
    providerId: result.providerId,
    providerName: result.providerName,
    average: result.rating.toDisplay(),
    outOf: result.rating.outOf,
    votes: result.rating.votes,
    lowConfidence: result.rating.isLowConfidence,
    url: result.url,
  };
}

/** One provider failing on twenty editions is one degraded source, not twenty. */
function dedupeDegraded(
  entries: readonly { providerId: string; reason: string }[],
): { providerId: string; reason: string }[] {
  const byProvider = new Map<string, string>();
  for (const entry of entries) {
    if (!byProvider.has(entry.providerId)) byProvider.set(entry.providerId, entry.reason);
  }
  return [...byProvider].map(([providerId, reason]) => ({ providerId, reason }));
}

/**
 * Translator averages, per language, and only where there is something to compare them to.
 *
 * Grouped by language as well as by name because the same translator may have rendered the book
 * into more than one language, and averaging those together would answer a question nobody asked.
 * A language whose ratings all belong to one translator produces no rows at all: see the field
 * comment on `translators`.
 *
 * A translator with a single rated edition produces no row either. Their "average" would be that
 * one edition's number repeated under it — first seen on a live page, where it read as a second,
 * independent measurement of the same thing.
 */
function aggregateByTranslator(
  editions: readonly Edition[],
  rated: readonly { editionId: string; rating: Rating | null }[],
): TranslatorRatingDto[] {
  const ratingById = new Map(rated.map((entry) => [entry.editionId, entry.rating]));
  const groups = new Map<string, { translator: string; language: string; ratings: Rating[] }>();

  for (const edition of editions) {
    const rating = ratingById.get(edition.id);
    if (!rating || !edition.translator) continue;

    const language = edition.language.value;
    const key = `${language} ${edition.translator.toLowerCase()}`;
    const group = groups.get(key);
    if (group) group.ratings.push(rating);
    else groups.set(key, { translator: edition.translator, language, ratings: [rating] });
  }

  const rows = [...groups.values()].flatMap((group) => {
    const aggregate = Rating.aggregate(group.ratings);
    if (!aggregate) return [];
    return [
      {
        translator: group.translator,
        language: group.language,
        average: aggregate.toDisplay(),
        outOf: aggregate.outOf,
        votes: aggregate.votes,
        ratedEditions: group.ratings.length,
        lowConfidence: aggregate.isLowConfidence,
      },
    ];
  });

  const rivalled = new Set(
    rows
      .map((row) => row.language)
      .filter((language, index, all) => all.indexOf(language) !== index),
  );

  return rows
    .filter((row) => row.ratedEditions > 1 && rivalled.has(row.language))
    .sort((a, b) =>
      a.language === b.language ? b.votes - a.votes : a.language.localeCompare(b.language),
    );
}
