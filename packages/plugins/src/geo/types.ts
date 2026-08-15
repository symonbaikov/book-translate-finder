/**
 * Module B — "is this book available in a shop near me".
 *
 * The interface is deliberately wider than any open data source can currently answer. `availability`
 * and `price` exist because a bookseller's own stock API *can* answer them and someone
 * self-hosting with such an agreement should be able to write that plugin without changing the
 * core. The adapter shipped in this repository (OpenStreetMap Overpass) answers only "there is a
 * bookshop here", and says so by returning `availability: 'unknown'` — never a guess. Presenting a
 * nearby shop as "in stock" would be inventing a fact, which the project does not do
 * (docs/plan.md, Phase 4 note).
 */

export type StoreAvailability =
  /** The shop's own system confirms a copy is on the shelf. */
  | 'in_stock'
  /** The shop's own system confirms it is not. */
  | 'out_of_stock'
  /** Not stocked, but the shop will order it. */
  | 'order_only'
  /** No stock data exists for this shop. The default, and the only honest answer from map data. */
  | 'unknown';

export interface StoreMoney {
  /** Minor units (cents), so no float ever represents money. */
  readonly amountMinor: number;
  /** ISO 4217, uppercase. */
  readonly currency: string;
}

export interface PhysicalStoreResult {
  /** Stable within the answering plugin: `{pluginId}:{externalId}`. */
  readonly storeId: string;
  readonly storeName: string;
  /** Great-circle distance from the reader's point, one decimal place. */
  readonly distanceKm: number;
  readonly availability: StoreAvailability;
  readonly price: StoreMoney | null;
  readonly address: string | null;
  readonly latitude: number;
  readonly longitude: number;
  readonly website: string | null;
  readonly phone: string | null;
  /** Opening hours as the source states them — unparsed, formats vary wildly. */
  readonly openingHours: string | null;
  /** Which plugin answered, so the UI can attribute and the reader can judge. */
  readonly source: string;
  /**
   * Why `availability` is what it is, in one phrase the UI can show verbatim
   * ("map data only — no stock information"). Keeps the honest answer visible instead of letting
   * `unknown` read as a loading state.
   */
  readonly availabilityNote: string | null;
}

export interface GeoStoreQuery {
  /** The edition being looked for. May be empty when the edition has no ISBN. */
  readonly editionIsbn: string;
  readonly userLat: number;
  readonly userLng: number;
  readonly radiusKm: number;
  readonly signal?: AbortSignal;
}

/**
 * The capability a geo plugin implements. Structurally identical to the `GeoStoreAdapter` port in
 * `packages/domain` — deliberately, so one implementation satisfies both without this package
 * importing the domain (which would break its zero-dependency rule and its use in the browser).
 * `packages/infrastructure` holds a compile-time assertion that the two stay in step.
 */
export interface GeoStoreLookup {
  findStores(query: GeoStoreQuery): Promise<readonly PhysicalStoreResult[]>;
}
