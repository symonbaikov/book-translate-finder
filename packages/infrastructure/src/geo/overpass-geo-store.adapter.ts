import {
  ProviderId,
  type GeoStoreAdapter,
  type GeoStoreQuery,
  type PhysicalStoreResult,
} from '@golden/domain';
import { OverpassStoreLocator, type GeoStoreLookup } from '@golden/plugins';

/**
 * The domain `GeoStoreAdapter` port, backed by the same OpenStreetMap plugin the browser uses.
 *
 * **The browser is the default path, not this one.** `apps/web` calls `OverpassStoreLocator`
 * directly so the reader's coordinates never reach this instance (docs/adr/0007). This adapter
 * exists for the server-side path, which a self-hoster has to switch on deliberately
 * (`ENABLE_SERVER_GEO_LOOKUP`) and which means accepting someone's location into their logs and
 * their upstream requests. One implementation serves both so the two can never drift apart.
 *
 * `locator` is deliberately typed as the *plugin* interface rather than the concrete class. The
 * plugins package cannot import the domain — it has to stay dependency-free to run in the browser
 * — so the port and the plugin capability are two declarations of the same shape, and this file is
 * where the compiler checks that they still agree: `findStores` returns the plugin's result under
 * the port's return type, which stops compiling the moment either side drifts.
 */
export class OverpassGeoStoreAdapter implements GeoStoreAdapter {
  readonly id = ProviderId.create('openstreetmap');
  readonly name = 'OpenStreetMap bookshops';

  private readonly locator: GeoStoreLookup;

  constructor(options: ConstructorParameters<typeof OverpassStoreLocator>[0] = {}) {
    this.locator = new OverpassStoreLocator(options);
  }

  async findStores(query: GeoStoreQuery): Promise<readonly PhysicalStoreResult[]> {
    return this.locator.findStores(query);
  }
}
