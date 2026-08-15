import {
  DomainError,
  NotFoundError,
  ProviderId,
  assertLinkAllowed,
  compareBookFormats,
  normalizeBookFormat,
  type BookFormat,
  type CachePort,
  type Clock,
  type EditionRepository,
  type Money,
  type PriceOffer,
  type PriceProvider,
  type PriceQuery,
  type WorkRepository,
} from '@golden/domain';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';
import { settleProviders } from '../settle-providers.js';
import type { UseCase } from '../use-case.js';

/**
 * Module C — the price aggregator.
 *
 * Polls every registered shop plugin in parallel, normalizes what comes back into one shape
 * grouped by book format, and caches the answer briefly. Adding a shop means registering another
 * `PriceProvider` in the composition root; this file does not change (docs/rules.md §1).
 *
 * **The TTL is short on purpose.** Prices and stock move, and a stale price is worse than no
 * price: a reader who clicks through to pay a different number than we showed has been misled.
 * Fifteen minutes is long enough to absorb a page reload and a couple of navigations, short enough
 * that nothing we show is meaningfully old.
 *
 * **A failed provider degrades, it does not fail the request.** Its id and reason travel back in
 * `degraded` so the UI can say which shop is missing rather than silently showing a shorter list.
 */

export interface AggregateEditionPricesInput {
  readonly editionId: string;
  /** ISO 3166-1 alpha-2; decides which shops are offered at all. */
  readonly country?: string | null;
}

export interface PriceOfferDto {
  readonly providerId: string;
  readonly providerName: string;
  readonly format: BookFormat;
  /** Minor units, or `null` when the shop publishes no price — never `0` for "unknown". */
  readonly amountMinor: number | null;
  /** Decimal form of the same amount, for display. */
  readonly amount: number | null;
  readonly currency: string | null;
  readonly url: string;
  readonly availability: 'available' | 'unavailable' | 'unknown';
  readonly note: string | null;
}

export interface PriceGroupDto {
  readonly format: BookFormat;
  readonly offers: readonly PriceOfferDto[];
}

export interface AggregateEditionPricesOutput {
  readonly editionId: string;
  /** Offers grouped by format — hardcover, paperback, ebook, audiobook, then unknown. */
  readonly groups: readonly PriceGroupDto[];
  /** Providers that did not answer, so the UI can name the gap instead of hiding it. */
  readonly degraded: readonly { readonly providerId: string; readonly reason: string }[];
  /** When this answer was assembled — the reader is told how fresh a price is. */
  readonly retrievedAt: string;
}

export interface AggregateEditionPricesDeps {
  readonly editionRepository: EditionRepository;
  /** For the author name in the title+author fallback when an edition carries no ISBN. */
  readonly workRepository: WorkRepository;
  readonly priceProviders: readonly PriceProvider[];
  readonly cache: CachePort;
  readonly clock: Clock;
}

/** Short by design — see the class comment. */
export const PRICES_TTL_SECONDS = 15 * 60;

/**
 * Much shorter TTL for a partial answer. A provider being down for a minute must not freeze an
 * incomplete price list for a quarter of an hour — the same reasoning as `ProcessBackfillJob`'s
 * refusal to negative-cache a transient source error (docs/plan.md §1.4).
 */
export const DEGRADED_TTL_SECONDS = 60;

/**
 * Keyed under the owning work's versioned prefix so the single `cache.deleteByPrefix` that
 * `SyncWorkFromSource` already performs invalidates this too (docs/architecture.md §6).
 */
export function editionPricesCacheKey(
  workId: string,
  editionId: string,
  country: string | null,
): string {
  return `${CACHE_KEY_VERSION}:work:${workId}:edition:${editionId}:prices:${country ?? ''}`;
}

function toDto(offer: PriceOffer): PriceOfferDto {
  const price: Money | null = offer.price;
  return {
    providerId: offer.providerId,
    providerName: offer.providerName,
    format: offer.format,
    amountMinor: price ? price.amountMinor : null,
    amount: price ? price.toDecimal() : null,
    currency: price ? price.currency : null,
    url: offer.url,
    availability: offer.availability,
    note: offer.note,
  };
}

/**
 * Cheapest first within a currency, then the priced offers ahead of the unpriced ones.
 *
 * Offers in different currencies are *not* interleaved by value — there is no exchange rate here
 * and inventing one would rank a shop wrongly (see `Money.compare`). They are grouped by currency
 * instead, in the order the currencies first appear, which puts the reader's own market first
 * because their country's shops are queried first.
 */
function sortOffers(offers: readonly PriceOfferDto[]): PriceOfferDto[] {
  const currencyOrder = new Map<string, number>();
  for (const offer of offers) {
    if (offer.currency && !currencyOrder.has(offer.currency)) {
      currencyOrder.set(offer.currency, currencyOrder.size);
    }
  }

  return [...offers].sort((a, b) => {
    if ((a.amountMinor === null) !== (b.amountMinor === null)) {
      return a.amountMinor === null ? 1 : -1;
    }
    if (a.amountMinor === null || b.amountMinor === null) return 0;
    const rankA = currencyOrder.get(a.currency!) ?? 0;
    const rankB = currencyOrder.get(b.currency!) ?? 0;
    return rankA === rankB ? a.amountMinor - b.amountMinor : rankA - rankB;
  });
}

export class AggregateEditionPrices implements UseCase<
  AggregateEditionPricesInput,
  AggregateEditionPricesOutput
> {
  constructor(private readonly deps: AggregateEditionPricesDeps) {}

  async execute(input: AggregateEditionPricesInput): Promise<AggregateEditionPricesOutput> {
    const edition = await this.deps.editionRepository.findById(input.editionId);
    if (!edition) throw new NotFoundError(`Edition not found: ${input.editionId}`);

    const country = input.country?.trim().toUpperCase() || null;
    const cacheKey = editionPricesCacheKey(edition.workId, edition.id, country);
    const cached = await this.deps.cache.get<AggregateEditionPricesOutput>(cacheKey);
    if (cached) return cached;

    const work = await this.deps.workRepository.findById(edition.workId);
    const query: PriceQuery = {
      isbn13: edition.isbn?.value ?? null,
      isbn10: null,
      title: edition.title,
      author: work?.author ?? null,
      language: edition.language.value,
      // The binding this edition actually is. A shop lookup keyed by its ISBN lands on this
      // binding's page, so an adapter that uses it is reading the record rather than guessing —
      // and without it every offer would fall into one undifferentiated "format not stated" pile.
      format: normalizeBookFormat(edition.binding),
      country,
    };

    const outcomes = await settleProviders(
      this.deps.priceProviders,
      (provider) => provider.id.value,
      (provider) => provider.quote(query),
    );

    const offers = outcomes.flatMap((outcome) =>
      outcome.status === 'ok' ? this.allowedOffers(outcome.value) : [],
    );
    const degraded = outcomes.flatMap((outcome) =>
      outcome.status === 'failed'
        ? [{ providerId: outcome.providerId, reason: outcome.reason }]
        : [],
    );

    const output: AggregateEditionPricesOutput = {
      editionId: edition.id,
      groups: this.groupByFormat(offers),
      degraded,
      retrievedAt: this.deps.clock.now().toISOString(),
    };

    await this.deps.cache.set(
      cacheKey,
      output,
      degraded.length > 0 ? DEGRADED_TTL_SECONDS : PRICES_TTL_SECONDS,
    );
    return output;
  }

  /**
   * Every offer URL goes through `LinkPolicy` before it can reach the reader, exactly like a
   * stored `SourceLink` (docs/legal-policy.md §2.2). A price plugin is still a plugin: it does not
   * get to put a link on the page the policy would refuse. A rejected offer is dropped, not
   * surfaced; anything that is not a `DomainError` is a real bug and rethrown.
   */
  private allowedOffers(offers: readonly PriceOffer[]): PriceOfferDto[] {
    const now = this.deps.clock.now();
    return offers.flatMap((offer) => {
      try {
        assertLinkAllowed({
          id: `${offer.providerId}-price`,
          editionId: '',
          type: 'buy',
          url: offer.url,
          provider: ProviderId.create(offer.providerId),
          // A shop selling a book is never evidence about its copyright status, and
          // docs/legal-policy.md §3 is explicit that an unclear signal is not permission.
          rightsStatus: 'copyrighted',
          verifiedAt: now,
        });
        return [toDto(offer)];
      } catch (error) {
        if (error instanceof DomainError) return [];
        throw error;
      }
    });
  }

  private groupByFormat(offers: readonly PriceOfferDto[]): PriceGroupDto[] {
    const byFormat = new Map<BookFormat, PriceOfferDto[]>();
    for (const offer of offers) {
      const bucket = byFormat.get(offer.format);
      if (bucket) bucket.push(offer);
      else byFormat.set(offer.format, [offer]);
    }

    return [...byFormat.entries()]
      .map(([format, formatOffers]) => ({ format, offers: sortOffers(formatOffers) }))
      .sort((a, b) => compareBookFormats(a.format, b.format));
  }
}
