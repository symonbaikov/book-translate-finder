import type { BookFormat } from '../value-objects/book-format.js';
import type { Money } from '../value-objects/money.js';
import type { ProviderId } from '../value-objects/provider-id.js';

/**
 * Module C — one shop or price source.
 *
 * A new retailer is a new implementation of this port plus a line in the composition root; no use
 * case changes (docs/rules.md §1 Open/Closed). If a shop redesigns its site, only its own adapter
 * is affected — and since the project forbids HTML scraping outright (docs/legal-policy.md I-3),
 * an adapter here is talking to a documented API or building a deterministic lookup URL, never
 * reading a page's markup.
 */

export interface PriceQuery {
  /** The strongest key a shop can match on; absent for ~16% of real editions. */
  readonly isbn13: string | null;
  readonly isbn10: string | null;
  /** Fallback lookup terms when there is no ISBN. */
  readonly title: string;
  readonly author: string | null;
  /** The edition's language — decides which national markets plausibly carry it. */
  readonly language: string | null;
  /**
   * The edition's own binding, normalized — `unknown` when the source did not state one.
   *
   * An adapter that looks a shop up **by this edition's ISBN** may adopt it: that lookup lands on
   * exactly this binding's product page, so reporting it is reading the edition record, not
   * guessing. An adapter whose result covers several bindings must not.
   */
  readonly format: BookFormat;
  /** ISO 3166-1 alpha-2 country the reader shops in, when they picked one. */
  readonly country: string | null;
}

/**
 * One offer from one provider.
 *
 * `price: null` is a first-class answer, not a failure. Most retailers publish no price API at
 * all, and the honest result for them is "here is the shop's page for this ISBN, we do not know
 * what it costs" — which is still the answer a reader wants. Presenting a missing price as `0`,
 * or omitting the shop entirely, would both misinform (docs/plan.md 4.10).
 */
export interface PriceOffer {
  readonly providerId: string;
  /** Reader-facing shop name. */
  readonly providerName: string;
  readonly format: BookFormat;
  readonly price: Money | null;
  /** Where the reader goes to buy. Always passed through `LinkPolicy` before it is shown. */
  readonly url: string;
  /**
   * Whether the provider states the book is purchasable. `unknown` for the URL-template shops,
   * where we never fetch the page and therefore cannot know.
   */
  readonly availability: 'available' | 'unavailable' | 'unknown';
  /**
   * Free text from the provider explaining the offer ("Google Play, ebook") — shown as-is, so it
   * must be short and factual.
   */
  readonly note: string | null;
}

export interface PriceProvider {
  readonly id: ProviderId;
  readonly name: string;
  /**
   * Never throws for "no offers" — that is an empty array. A rejected promise means the provider
   * itself failed, and the aggregator degrades that one provider without failing the response
   * (docs/rules.md §3).
   */
  quote(query: PriceQuery): Promise<readonly PriceOffer[]>;
}
