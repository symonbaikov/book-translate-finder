import type { ProviderId } from '../value-objects/provider-id.js';

/**
 * Where a reader can go and read opinions about **this exact printing**.
 *
 * A separate port from `EditionRatingProvider`, and separate on purpose: the two make different
 * claims. A rating is a number this instance publishes and therefore vouches for the arithmetic
 * of; a review link is an address, and the site at the other end is nobody's responsibility here.
 * Collapsing them into one type would let a source with no number quietly borrow the authority of
 * one that has it (the same reasoning that keeps addon results and core links apart, ADR-0009).
 *
 * **This is the answer for an instance with no API key.** Every source that publishes a *number*
 * per edition wants a key; the identifiers that say where an edition lives on a review site do
 * not. Coverage is thin — around one printing in six — and that is honest: fewer links, never a
 * link to the wrong printing.
 *
 * **Batch by design.** The one real implementation asks Open Library about many ISBNs in a single
 * request, which is both what its API is built for and what keeps a page of two dozen editions
 * from becoming two dozen outbound calls. A per-edition signature would throw that away.
 */

export interface ReviewLinkQuery {
  readonly editionId: string;
  readonly isbn13: string | null;
  readonly isbn10: string | null;
}

export interface EditionReviewLink {
  readonly editionId: string;
  readonly providerId: string;
  /** Reader-facing site name — the link always says where it leads. */
  readonly providerName: string;
  readonly url: string;
}

export interface EditionReviewsProvider {
  readonly id: ProviderId;
  readonly name: string;
  /**
   * Links for whichever of `queries` this source can place; an edition it does not know simply
   * has no entry. A rejected promise means the source itself failed and is reported as degraded
   * (docs/rules.md §3).
   */
  findLinks(queries: readonly ReviewLinkQuery[]): Promise<readonly EditionReviewLink[]>;
}
