import { ProviderId, type GeoStoreAdapter, type PhysicalStoreResult } from '@golden/domain';
import { describe, expect, it } from 'vitest';
import { FindNearbyStores } from '../../src/use-cases/find-nearby-stores.use-case.js';

function store(overrides: Partial<PhysicalStoreResult> & { storeId: string }): PhysicalStoreResult {
  return {
    storeName: overrides.storeId,
    distanceKm: 1,
    availability: 'unknown',
    price: null,
    address: null,
    latitude: 0,
    longitude: 0,
    website: null,
    phone: null,
    openingHours: null,
    source: 'test',
    availabilityNote: null,
    ...overrides,
  };
}

function adapter(id: string, findStores: GeoStoreAdapter['findStores']): GeoStoreAdapter {
  return { id: ProviderId.create(id), name: id, findStores };
}

const QUERY = { editionIsbn: '9780140447934', userLat: 52.52, userLng: 13.405, radiusKm: 5 };

describe('FindNearbyStores', () => {
  it('merges every adapter and ranks the results by distance', async () => {
    const useCase = new FindNearbyStores({
      geoStoreAdapters: [
        adapter('map', async () => [store({ storeId: 'map:far', distanceKm: 4.2 })]),
        adapter('chain', async () => [store({ storeId: 'chain:near', distanceKm: 0.4 })]),
      ],
    });

    const result = await useCase.execute(QUERY);
    expect(result.stores.map((s) => s.storeId)).toEqual(['chain:near', 'map:far']);
  });

  it('collapses a shop an adapter returned twice', async () => {
    const useCase = new FindNearbyStores({
      geoStoreAdapters: [
        adapter('map', async () => [store({ storeId: 'map:1' }), store({ storeId: 'map:1' })]),
      ],
    });
    expect((await useCase.execute(QUERY)).stores).toHaveLength(1);
  });

  it('keeps the working adapters when one fails, and names the failure', async () => {
    const useCase = new FindNearbyStores({
      geoStoreAdapters: [
        adapter('map', async () => [store({ storeId: 'map:1' })]),
        adapter('broken', async () => {
          throw new Error('overpass gateway timeout');
        }),
      ],
    });

    const result = await useCase.execute(QUERY);
    expect(result.stores.map((s) => s.storeId)).toEqual(['map:1']);
    expect(result.degraded).toEqual([{ providerId: 'broken', reason: 'overpass gateway timeout' }]);
  });

  it('returns an empty list rather than failing when no adapter is registered', async () => {
    const result = await new FindNearbyStores({ geoStoreAdapters: [] }).execute(QUERY);
    expect(result).toEqual({ stores: [], degraded: [] });
  });
});
