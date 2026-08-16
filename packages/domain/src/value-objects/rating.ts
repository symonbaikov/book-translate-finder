import { InvalidInputError } from '../errors/domain-error.js';

/**
 * A reader rating of one *edition*, and the arithmetic for comparing several of them.
 *
 * **This is a rating of a book, never a rating of a translation.** No source in this project — and,
 * as of Phase 3, no open source anywhere — publishes an assessment of how well a translator did
 * their work. What Google Books publishes is what its readers thought of the volume they bought,
 * which for a translated edition is some inseparable mixture of the novel, the translation, the
 * paper and the shipping. The class is called `Rating` rather than `TranslationQuality` for that
 * reason, and every reader-facing string that carries one must say whose opinion it is and about
 * what (docs/legal-policy.md's habit applied to a different kind of claim: state what a number is,
 * never let a layout imply more than the source said).
 *
 * What *does* carry a translation signal is the comparison: the same work, the same language, two
 * translators, two populations of readers. That is what `aggregate` exists for, and why `votes`
 * travels with every average instead of being dropped after the mean is taken.
 *
 * **A rating nobody cast is not a rating.** `create` refuses `votes: 0`. Google returns an
 * `averageRating` field on volumes whose `ratingsCount` is absent or zero often enough that
 * accepting it would put a confident "4.0" under an edition literally nobody has rated.
 */

/** Every rating source this project talks to publishes on a five-star scale. */
export const RATING_SCALE = 5;

/**
 * Below this, an average is one person's opinion wearing a decimal point, and comparing two
 * translations on it would be noise presented as evidence. Such ratings are still shown — hiding
 * data is its own distortion — but marked, and never used to rank one translator above another.
 */
export const MIN_VOTES_FOR_COMPARISON = 5;

export class Rating {
  private constructor(
    /** Mean score on the `outOf` scale. */
    readonly average: number,
    /** The top of the scale the average is expressed on — 5 for every current source. */
    readonly outOf: number,
    /** How many readers voted. Always ≥ 1: see the class comment. */
    readonly votes: number,
  ) {}

  static create(average: number, votes: number, outOf: number = RATING_SCALE): Rating {
    if (!Number.isFinite(outOf) || outOf <= 0) {
      throw new InvalidInputError('Rating.outOf must be a positive number');
    }
    if (!Number.isFinite(average) || average < 0 || average > outOf) {
      throw new InvalidInputError(`Rating.average must be between 0 and ${outOf}`);
    }
    if (!Number.isInteger(votes) || votes < 1) {
      throw new InvalidInputError('Rating.votes must be a positive integer');
    }
    return new Rating(average, outOf, votes);
  }

  /** Where this average sits on its own scale, 0…1 — the only form comparable across scales. */
  get fraction(): number {
    return this.average / this.outOf;
  }

  /** Too few voters to compare this translation against another. */
  get isLowConfidence(): boolean {
    return this.votes < MIN_VOTES_FOR_COMPARISON;
  }

  /**
   * One rating out of several, weighted by how many readers stand behind each.
   *
   * Weighted, not a mean of means: a translator with one edition rated 5.0 by two readers and
   * another rated 3.8 by four hundred has not produced a 4.4 average, and showing one next to a
   * rival translator would invert the comparison the reader came for.
   *
   * Inputs are normalized through `fraction`, so a future five-star and hundred-point source can
   * be mixed without either drowning the other; the result is expressed on `RATING_SCALE`.
   * Returns `null` for an empty list — "no ratings" is a real answer, not a zero.
   */
  static aggregate(ratings: readonly Rating[]): Rating | null {
    if (ratings.length === 0) return null;

    const votes = ratings.reduce((sum, rating) => sum + rating.votes, 0);
    const weighted = ratings.reduce((sum, rating) => sum + rating.fraction * rating.votes, 0);

    return Rating.create((weighted / votes) * RATING_SCALE, votes, RATING_SCALE);
  }

  /** Rounded for display; the unrounded value stays available for sorting. */
  toDisplay(digits = 1): number {
    const factor = 10 ** digits;
    return Math.round(this.average * factor) / factor;
  }
}
