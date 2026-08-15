import {
  Money,
  ProviderId,
  type CachePort,
  type PriceOffer,
  type PriceProvider,
  type PriceQuery,
} from '@golden/domain';
import type { ResilientFetcher } from '../http/resilient-fetch.js';

/**
 * The one price source in this repository that returns a real number.
 *
 * Google Books' `saleInfo` carries an actual `listPrice`/`retailPrice`, but only for Google Play
 * and only with an API key — the keyless quota is zero, confirmed live (docs/plan.md 4.10). With
 * no key configured this provider answers with an empty list rather than a fabricated one; every
 * other retailer would need an affiliate agreement the project does not have, which is why the
 * rest of the shop list is URL-template lookups with no price at all.
 */

interface GoogleBooksSaleInfo {
  country?: string;
  saleability?: string;
  isEbook?: boolean;
  listPrice?: { amount?: number; currencyCode?: string };
  retailPrice?: { amount?: number; currencyCode?: string };
  buyLink?: string;
}

interface GoogleBooksVolume {
  id: string;
  volumeInfo?: { title?: string };
  saleInfo?: GoogleBooksSaleInfo;
}

interface GoogleBooksSearchResponse {
  items?: GoogleBooksVolume[];
}

const CACHE_TTL_SECONDS = 15 * 60;

export class GoogleBooksPriceProvider implements PriceProvider {
  readonly id = ProviderId.create('google-play-books');
  readonly name = 'Google Play Books';

  constructor(
    private readonly fetcher: ResilientFetcher,
    private readonly cache: CachePort,
    private readonly apiKey?: string,
  ) {}

  async quote(query: PriceQuery): Promise<readonly PriceOffer[]> {
    // Without an ISBN there is no way to be sure the volume Google returns is *this* edition, and
    // quoting a price for a different edition is worse than quoting none.
    if (!this.apiKey || !query.isbn13) return [];

    const cacheKey = `provider:google-books:price:${query.isbn13}:${query.country ?? ''}`;
    const cached = await this.cache.get<SerializedOffer[]>(cacheKey);
    if (cached) return cached.map(deserialize);

    const url = new URL('https://www.googleapis.com/books/v1/volumes');
    // A field-scoped query is right here, unlike in search: `isbn:` is an exact identifier lookup,
    // not the free-text recall problem Phase 0 found (docs/research/coverage-phase0.md).
    url.searchParams.set('q', `isbn:${query.isbn13}`);
    url.searchParams.set('key', this.apiKey);
    // Prices are per-market; without this Google answers for the server's location, which is not
    // where the reader is.
    if (query.country) url.searchParams.set('country', query.country);

    const response = await this.fetcher.fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Google Books price lookup failed with status ${response.status}`);
    }

    const data = (await response.json()) as GoogleBooksSearchResponse;
    const offers = (data.items ?? []).flatMap((volume) => this.toOffer(volume, query));

    await this.cache.set(cacheKey, offers.map(serialize), CACHE_TTL_SECONDS);
    return offers;
  }

  private toOffer(volume: GoogleBooksVolume, query: PriceQuery): PriceOffer[] {
    const sale = volume.saleInfo;
    const buyLink = sale?.buyLink;
    if (!sale || !buyLink) return [];

    // `retailPrice` is what the reader pays; `listPrice` is the pre-discount figure. Showing the
    // list price next to a "buy" button would overstate the cost.
    const source = sale.retailPrice ?? sale.listPrice;
    const amount = source?.amount;
    const currency = source?.currencyCode;

    return [
      {
        providerId: this.id.value,
        providerName: this.name,
        // Google states whether the listing is an ebook; when it is not, the edition's own
        // binding is the better answer than a blanket 'unknown'.
        format: sale.isEbook === true ? 'ebook' : query.format,
        price: typeof amount === 'number' && currency ? Money.fromDecimal(amount, currency) : null,
        url: buyLink,
        availability: sale.saleability === 'FOR_SALE' ? 'available' : 'unavailable',
        note: sale.country ? `Google Play, ${sale.country}` : 'Google Play',
      },
    ];
  }
}

/**
 * `Money` does not survive a JSON round trip through Redis, so the cached form is plain data and
 * the value object is rebuilt on read — the alternative, caching the class instance, silently
 * returns `{}` where a price should be.
 */
interface SerializedOffer extends Omit<PriceOffer, 'price'> {
  price: { amountMinor: number; currency: string } | null;
}

function serialize(offer: PriceOffer): SerializedOffer {
  return {
    ...offer,
    price: offer.price
      ? { amountMinor: offer.price.amountMinor, currency: offer.price.currency }
      : null,
  };
}

function deserialize(offer: SerializedOffer): PriceOffer {
  return {
    ...offer,
    price: offer.price ? Money.fromMinor(offer.price.amountMinor, offer.price.currency) : null,
  };
}
