import type { ProviderId } from '../value-objects/provider-id.js';
import type { Rating } from '../value-objects/rating.js';

/**
 * One source of reader ratings for a specific edition.
 *
 * Shaped like `PriceProvider` on purpose: a rating, like a price, belongs to *one printing* and is
 * worthless attached to the wrong one. Which is why the query is built around the ISBN and why an
 * adapter with nothing but a title is expected to answer `null` rather than pick the closest
 * volume — the whole feature exists to tell two translations of the same book apart, and a lookup
 * that cannot tell them apart has no business contributing to it.
 *
 * Same standing rule as every other outbound source in this repository: an adapter here talks to a
 * documented API, never to a page's markup (docs/legal-policy.md I-3). Goodreads, LiveLib and
 * Babelio all rate editions and none of them publishes an API — so they are absent, and stay
 * absent, rather than being scraped.
 */

export interface RatingQuery {
  /** The only key that identifies an edition across sources. Absent for ~16% of real editions. */
  readonly isbn13: string | null;
  readonly isbn10: string | null;
  /** Present for adapters that can match on more than an ISBN — never enough on its own. */
  readonly title: string;
  readonly author: string | null;
  readonly language: string | null;
}

export interface EditionRatingResult {
  readonly providerId: string;
  /** Reader-facing source name — a rating is always shown with whose readers gave it. */
  readonly providerName: string;
  readonly rating: Rating;
  /** Where the reader can read the reviews behind the number, when the source has such a page. */
  readonly url: string | null;
}

export interface EditionRatingProvider {
  readonly id: ProviderId;
  readonly name: string;
  /**
   * `null` means "this source has no rating for this edition" — the common case, and not an error.
   * A rejected promise means the source itself failed, which degrades that provider without
   * failing the response (docs/rules.md §3).
   */
  rate(query: RatingQuery): Promise<EditionRatingResult | null>;
}
