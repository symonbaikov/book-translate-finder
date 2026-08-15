import { describe, expect, it, vi } from 'vitest';
import { InvalidCoordinatesError, haversineKm, sanitizeCoordinates } from './distance.js';
import { OverpassStoreLocator } from './overpass-store-locator.js';

const OVERPASS_RESPONSE = {
  elements: [
    {
      type: 'node',
      id: 1,
      lat: 52.5205,
      lon: 13.4095,
      tags: {
        shop: 'books',
        name: 'Dussmann das KulturKaufhaus',
        'addr:street': 'Friedrichstraße',
        'addr:housenumber': '90',
        'addr:postcode': '10117',
        'addr:city': 'Berlin',
        website: 'https://www.kulturkaufhaus.de',
        opening_hours: 'Mo-Sa 09:00-24:00',
      },
    },
    {
      type: 'way',
      id: 2,
      center: { lat: 52.53, lon: 13.42 },
      tags: { shop: 'books', name: 'Far Away Books', 'contact:phone': '+49 30 000000' },
    },
    // No name: a dot on a map the reader cannot walk to by name.
    { type: 'node', id: 3, lat: 52.521, lon: 13.41, tags: { shop: 'books' } },
    // No coordinates at all.
    { type: 'relation', id: 4, tags: { shop: 'books', name: 'Nowhere Books' } },
  ],
};

function fetchReturning(body: unknown, status = 200) {
  return vi.fn(
    async (_url: string, _init?: RequestInit) => new Response(JSON.stringify(body), { status }),
  );
}

describe('OverpassStoreLocator', () => {
  const origin = { userLat: 52.520008, userLng: 13.404954 };

  it('declares itself a client-side, official-API geo plugin', () => {
    expect(new OverpassStoreLocator().manifest).toMatchObject({
      id: 'openstreetmap',
      kind: 'geo-store',
      accessMode: 'official-api',
      runtime: 'client',
    });
  });

  it('blurs the coordinates before they reach the third-party endpoint', async () => {
    const fetchMock = fetchReturning({ elements: [] });
    await new OverpassStoreLocator({ fetch: fetchMock }).findStores({
      editionIsbn: '9780140447934',
      userLat: 52.520008123,
      userLng: 13.404954987,
      radiusKm: 3,
    });

    const body = String(fetchMock.mock.calls[0]?.[1]?.body);
    const query = decodeURIComponent(body.replace(/^data=/, ''));
    expect(query).toContain('around:3000,52.52,13.405');
    expect(query).not.toContain('52.520008123');
  });

  it('clamps an absurd radius instead of forwarding it', async () => {
    const fetchMock = fetchReturning({ elements: [] });
    await new OverpassStoreLocator({ fetch: fetchMock }).findStores({
      editionIsbn: '',
      ...origin,
      radiusKm: 10_000,
    });
    const query = decodeURIComponent(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(query).toContain('around:50000,');
  });

  it('maps shops to results sorted by distance, nearest first', async () => {
    const stores = await new OverpassStoreLocator({
      fetch: fetchReturning(OVERPASS_RESPONSE),
    }).findStores({ editionIsbn: '9780140447934', ...origin, radiusKm: 5 });

    expect(stores.map((store) => store.storeName)).toEqual([
      'Dussmann das KulturKaufhaus',
      'Far Away Books',
    ]);
    expect(stores[0]).toMatchObject({
      storeId: 'openstreetmap:node/1',
      address: 'Friedrichstraße 90, 10117 Berlin',
      website: 'https://www.kulturkaufhaus.de',
      openingHours: 'Mo-Sa 09:00-24:00',
      source: 'openstreetmap',
    });
    expect(stores[1]?.phone).toBe('+49 30 000000');
    expect(stores[0]!.distanceKm).toBeLessThan(stores[1]!.distanceKm);
  });

  it('never claims to know whether a shop stocks the book', async () => {
    const stores = await new OverpassStoreLocator({
      fetch: fetchReturning(OVERPASS_RESPONSE),
    }).findStores({ editionIsbn: '9780140447934', ...origin, radiusKm: 5 });

    // Map data cannot answer stock, and inventing an answer is the one thing this must not do
    // (docs/plan.md 4.7). The note travels with the result so the UI can show why.
    for (const store of stores) {
      expect(store.availability).toBe('unknown');
      expect(store.price).toBeNull();
      expect(store.availabilityNote).toMatch(/map data only/i);
    }
  });

  it('reports a failing endpoint rather than an empty neighbourhood', async () => {
    await expect(
      new OverpassStoreLocator({ fetch: fetchReturning({}, 504) }).findStores({
        editionIsbn: '',
        ...origin,
        radiusKm: 5,
      }),
    ).rejects.toThrow(/HTTP 504/);
  });
});

describe('coordinate handling', () => {
  it.each([
    [Number.NaN, 0],
    [91, 0],
    [0, 181],
  ])('rejects (%s, %s)', (lat, lng) => {
    expect(() => sanitizeCoordinates(lat, lng)).toThrow(InvalidCoordinatesError);
  });

  it('measures a known distance to within a few metres', () => {
    // Berlin Hbf → Alexanderplatz, ~2.4 km.
    const distance = haversineKm({ lat: 52.525, lng: 13.369 }, { lat: 52.5219, lng: 13.4132 });
    expect(distance).toBeGreaterThan(2.9);
    expect(distance).toBeLessThan(3.1);
  });
});
