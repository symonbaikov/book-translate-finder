import {
  ProviderId,
  bookstoresForGrouped,
  type PriceOffer,
  type PriceProvider,
  type PriceQuery,
} from '@golden/domain';

/**
 * Every shop in the curated bookstore catalog, as a price provider that never knows a price.
 *
 * That sounds like a contradiction until you look at what the alternative would be. No open API
 * says which shops sell an ISBN or for how much (`bookstore-catalog.ts` explains why), so the
 * choice is between "here is this shop's own lookup page for your ISBN, we do not know the price"
 * and showing the reader nothing. The first is useful and true; inventing a number, or omitting
 * the shop because we lack one, are both worse.
 *
 * The URL is built, never fetched — so this is a lookup, not a stock check, and it involves no
 * scraping (docs/legal-policy.md I-3).
 */
export class BookstoreCatalogPriceProvider implements PriceProvider {
  readonly id = ProviderId.create('bookstore-catalog');
  readonly name = 'Bookshop lookups';

  async quote(query: PriceQuery): Promise<readonly PriceOffer[]> {
    // The ISBN is the precise lookup; without one, title + author still lands the reader on the
    // shop's own search results, which beats an empty shop list (16% of real editions have no
    // ISBN — measured live, see get-edition-links.use-case.ts).
    const term = query.isbn13 ?? `${query.title} ${query.author ?? ''}`.trim();
    if (!term) return [];

    return bookstoresForGrouped({ country: query.country, language: query.language }).map(
      ({ store, group }): PriceOffer => ({
        providerId: store.id,
        providerName: store.name,
        // The lookup is keyed by this edition's ISBN, so it lands on this edition's binding —
        // reporting it is reading the edition record, not claiming knowledge of the shop's stock.
        // Falls back to `unknown` on its own when the edition has no stated binding.
        format: query.format,
        price: null,
        url: store.buildUrl(term),
        availability: 'unknown',
        note:
          group === 'country'
            ? 'Shop in your country'
            : group === 'language'
              ? "Shop in this edition's language market"
              : 'Ships worldwide',
      }),
    );
  }
}
