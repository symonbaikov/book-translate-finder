import type { Plugin, PluginManifest } from '../plugin.js';
import type { FetchLike } from '../opds/opds-client.js';
import { clampRadiusKm, haversineKm, roundTo, sanitizeCoordinates } from './distance.js';
import type { GeoStoreLookup, GeoStoreQuery, PhysicalStoreResult } from './types.js';

/**
 * Bookshops near a point, from OpenStreetMap via the Overpass API.
 *
 * **What it can and cannot answer.** Overpass answers "there is a shop tagged `shop=books` here".
 * It has no idea what any shop stocks, and no open dataset does — so every result comes back
 * `availability: 'unknown'` with the reason attached, and the UI must say "bookshops near you",
 * never "in stock" (docs/plan.md 4.7). The `editionIsbn` on the query is accepted and ignored
 * here; it is part of the port because a bookseller's own stock API would need it.
 *
 * **Why it runs in the browser.** Overpass is a third party. Routing the query through our API
 * would mean the reader's coordinates arrive at our servers, which is exactly what the
 * privacy-first design forbids — so the request goes straight from the reader's device, with the
 * coordinates already blurred to ~110 m (`sanitizeCoordinates`). Overpass sends
 * `Access-Control-Allow-Origin: *`, so this works without a proxy.
 */

export const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';

interface OverpassElement {
  type?: string;
  id?: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

export interface OverpassStoreLocatorOptions {
  readonly fetch?: FetchLike;
  readonly endpoint?: string;
  readonly timeoutMs?: number;
  /** Caps how many shops one lookup returns; the nearest are kept. */
  readonly maxResults?: number;
}

const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_MAX_RESULTS = 25;

const AVAILABILITY_NOTE =
  'Map data only — OpenStreetMap knows where the shop is, not what it stocks';

/**
 * `shop=books` is the OSM tag for a bookshop; `shop=second_hand` with `books` in `second_hand`
 * covers used-book dealers, which readers looking for an out-of-print translation care about most.
 * Ways and relations are included because larger stores are mapped as building outlines rather
 * than points — `out center` gives them a representative coordinate.
 */
function buildQuery(lat: number, lng: number, radiusMeters: number): string {
  const area = `(around:${radiusMeters},${lat},${lng})`;
  return [
    '[out:json][timeout:25];',
    '(',
    `  node["shop"="books"]${area};`,
    `  way["shop"="books"]${area};`,
    `  relation["shop"="books"]${area};`,
    `  node["shop"="second_hand"]["second_hand"~"books",i]${area};`,
    ');',
    'out center tags;',
  ].join('\n');
}

function coordinatesOf(element: OverpassElement): { lat: number; lng: number } | null {
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  return typeof lat === 'number' && typeof lon === 'number' ? { lat, lng: lon } : null;
}

/** OSM addresses arrive as separate `addr:*` tags; joined in the order most countries write them. */
function formatAddress(tags: Record<string, string>): string | null {
  const street = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ');
  const city = [tags['addr:postcode'], tags['addr:city']].filter(Boolean).join(' ');
  const address = [street, city].filter(Boolean).join(', ');
  return address || null;
}

export class OverpassStoreLocator implements Plugin, GeoStoreLookup {
  readonly manifest: PluginManifest = {
    id: 'openstreetmap',
    name: 'OpenStreetMap bookshops',
    kind: 'geo-store',
    accessMode: 'official-api',
    runtime: 'client',
    homepage: 'https://www.openstreetmap.org',
  };

  private readonly fetchImpl: FetchLike;
  private readonly endpoint: string;
  private readonly timeoutMs: number;
  private readonly maxResults: number;

  constructor(options: OverpassStoreLocatorOptions = {}) {
    this.fetchImpl = options.fetch ?? ((url, init) => fetch(url, init));
    this.endpoint = options.endpoint ?? OVERPASS_ENDPOINT;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxResults = options.maxResults ?? DEFAULT_MAX_RESULTS;
  }

  async findStores(query: GeoStoreQuery): Promise<readonly PhysicalStoreResult[]> {
    const origin = sanitizeCoordinates(query.userLat, query.userLng);
    const radiusKm = clampRadiusKm(query.radiusKm);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    query.signal?.addEventListener('abort', () => controller.abort(), { once: true });

    try {
      const response = await this.fetchImpl(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(buildQuery(origin.lat, origin.lng, Math.round(radiusKm * 1000)))}`,
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Overpass request failed with HTTP ${response.status}`);
      }
      const data = (await response.json()) as OverpassResponse;
      return this.toResults(data.elements ?? [], origin);
    } finally {
      clearTimeout(timer);
    }
  }

  private toResults(
    elements: readonly OverpassElement[],
    origin: { lat: number; lng: number },
  ): PhysicalStoreResult[] {
    return elements
      .flatMap((element): PhysicalStoreResult[] => {
        const point = coordinatesOf(element);
        const tags = element.tags ?? {};
        // An unnamed point on a map is not something a reader can walk to; skipping it is better
        // than listing "(unnamed) — 400 m".
        const name = tags['name'] ?? tags['brand'];
        if (!point || !name) return [];

        return [
          {
            storeId: `openstreetmap:${element.type ?? 'node'}/${element.id ?? 0}`,
            storeName: name,
            distanceKm: roundTo(haversineKm(origin, point), 1),
            availability: 'unknown',
            price: null,
            address: formatAddress(tags),
            latitude: point.lat,
            longitude: point.lng,
            website: tags['website'] ?? tags['contact:website'] ?? null,
            phone: tags['phone'] ?? tags['contact:phone'] ?? null,
            openingHours: tags['opening_hours'] ?? null,
            source: this.manifest.id,
            availabilityNote: AVAILABILITY_NOTE,
          },
        ];
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, this.maxResults);
  }
}
