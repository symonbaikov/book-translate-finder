import type { GeoStoreAdapter, PhysicalStoreResult } from '@golden/domain';
import { settleProviders } from '../settle-providers.js';
import type { UseCase } from '../use-case.js';

/**
 * Module B, server side — merges every registered `GeoStoreAdapter` into one ranked list.
 *
 * **This path is opt-in and off by default.** The shipped bookshop lookup runs in the reader's
 * browser so their coordinates never reach the instance at all (docs/adr/0007). This use case
 * exists for the cases where a server-side lookup is the only option — a bookseller's stock API
 * that needs a secret key, or a non-browser client — and a self-hoster has to enable it
 * deliberately.
 *
 * **Nothing here is cached.** A cache key containing coordinates is a stored location history, and
 * the whole point of the module is not to build one. Rate limiting, not caching, is what protects
 * the upstream endpoints.
 */

export interface FindNearbyStoresInput {
  /** May be empty: an edition without an ISBN still deserves "bookshops near you". */
  readonly editionIsbn: string;
  readonly userLat: number;
  readonly userLng: number;
  readonly radiusKm: number;
}

export interface FindNearbyStoresOutput {
  readonly stores: readonly PhysicalStoreResult[];
  /** Adapters that did not answer — named, so a short list never passes for a complete one. */
  readonly degraded: readonly { readonly providerId: string; readonly reason: string }[];
}

export interface FindNearbyStoresDeps {
  readonly geoStoreAdapters: readonly GeoStoreAdapter[];
}

export class FindNearbyStores implements UseCase<FindNearbyStoresInput, FindNearbyStoresOutput> {
  constructor(private readonly deps: FindNearbyStoresDeps) {}

  async execute(input: FindNearbyStoresInput): Promise<FindNearbyStoresOutput> {
    const outcomes = await settleProviders(
      this.deps.geoStoreAdapters,
      (adapter) => adapter.id.value,
      (adapter) => adapter.findStores(input),
    );

    const seen = new Set<string>();
    const stores = outcomes
      .flatMap((outcome) => (outcome.status === 'ok' ? [...outcome.value] : []))
      // Two adapters can describe the same shop; `storeId` is namespaced per adapter, so this only
      // collapses genuine repeats from one of them.
      .filter((store) => !seen.has(store.storeId) && seen.add(store.storeId))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return {
      stores,
      degraded: outcomes.flatMap((outcome) =>
        outcome.status === 'failed'
          ? [{ providerId: outcome.providerId, reason: outcome.reason }]
          : [],
      ),
    };
  }
}
