import type { ProviderId } from '../value-objects/provider-id.js';

/**
 * Module B — physical shops near the reader.
 *
 * **The default implementation cannot answer "in stock", and says so.** No open dataset maps an
 * ISBN to a shelf in a specific shop; OpenStreetMap knows where bookshops are and nothing more
 * (docs/plan.md 4.7). The port still carries `availability` and `price` because a bookseller's own
 * stock API *can* answer them, and someone with such an agreement must be able to add that adapter
 * without the core changing. Until then every result is `unknown`, carrying the reason — and the
 * UI says "bookshops near you", never "has this book".
 *
 * **Coordinates.** The shipped adapter runs in the reader's browser precisely so their location
 * never reaches this instance (docs/adr/0007). An implementation on this side of the port is
 * receiving someone's location and must treat it as such: blur it, never log it, never store it.
 */

export type StoreAvailability = 'in_stock' | 'out_of_stock' | 'order_only' | 'unknown';

export interface StorePrice {
  /** Minor units — see the `Money` value object for why money is never a float here. */
  readonly amountMinor: number;
  /** ISO 4217, uppercase. */
  readonly currency: string;
}

export interface PhysicalStoreResult {
  /** Unique within the answering adapter: `{providerId}:{externalId}`. */
  readonly storeId: string;
  readonly storeName: string;
  /** Great-circle distance from the reader's point, in kilometres. */
  readonly distanceKm: number;
  readonly availability: StoreAvailability;
  readonly price: StorePrice | null;
  readonly address: string | null;
  readonly latitude: number;
  readonly longitude: number;
  readonly website: string | null;
  readonly phone: string | null;
  readonly openingHours: string | null;
  /** Which adapter answered. */
  readonly source: string;
  /** Why `availability` is what it is, in one phrase the UI can show verbatim. */
  readonly availabilityNote: string | null;
}

export interface GeoStoreQuery {
  /** The edition being looked for; may be empty when the edition carries no ISBN. */
  readonly editionIsbn: string;
  readonly userLat: number;
  readonly userLng: number;
  readonly radiusKm: number;
}

export interface GeoStoreAdapter {
  readonly id: ProviderId;
  /** Shown to the reader as the attribution for these results. */
  readonly name: string;
  findStores(query: GeoStoreQuery): Promise<readonly PhysicalStoreResult[]>;
}
