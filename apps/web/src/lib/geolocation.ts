'use client';

import { sanitizeCoordinates } from '@golden/plugins';

/**
 * Module B's browser half: where the reader is, established on their device and nowhere else.
 *
 * Two ways in, and the second is not a consolation prize. The Geolocation API needs a permission
 * prompt many people decline on principle, and a typed city or postcode is a perfectly good answer
 * for "which bookshops are near me" — so the manual path is offered up front, not only after a
 * refusal (docs/adr/0007).
 *
 * Whichever path is used, the result is rounded to ~110 m before anything is done with it, and it
 * is never sent to this site's own API. The only outbound requests are to OpenStreetMap, from the
 * reader's own browser.
 */

export interface Coordinates {
  readonly lat: number;
  readonly lng: number;
  /** What produced this — shown to the reader so the source of a wrong answer is obvious. */
  readonly source: 'device' | 'place';
  /** Human-readable place name; present only for the manual path. */
  readonly label: string | null;
}

export type GeolocationFailure =
  /** The browser has no Geolocation API at all. */
  | 'unsupported'
  /** The reader declined, or the browser blocked the prompt. */
  | 'denied'
  /** The device could not fix a position, or took too long. */
  | 'unavailable'
  /** A typed place name matched nothing. */
  | 'not-found';

export class GeolocationError extends Error {
  constructor(readonly reason: GeolocationFailure) {
    super(`Could not determine a location: ${reason}`);
    this.name = 'GeolocationError';
  }
}

const DEVICE_TIMEOUT_MS = 10_000;

/**
 * Asks the device.
 *
 * `enableHighAccuracy` is deliberately **off**. It costs battery, takes longer, and buys precision
 * this feature immediately throws away — the coordinates are rounded to a neighbourhood before
 * they are used, because a bookshop three streets over is the answer either way.
 */
export async function locateFromDevice(): Promise<Coordinates> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    throw new GeolocationError('unsupported');
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: DEVICE_TIMEOUT_MS,
      maximumAge: 5 * 60 * 1000,
    });
  }).catch((error: unknown) => {
    const code = (error as GeolocationPositionError | undefined)?.code;
    throw new GeolocationError(code === 1 ? 'denied' : 'unavailable');
  });

  const { lat, lng } = sanitizeCoordinates(position.coords.latitude, position.coords.longitude);
  return { lat, lng, source: 'device', label: null };
}

const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

interface NominatimResult {
  lat?: string;
  lon?: string;
  display_name?: string;
}

/**
 * Turns a typed city or postcode into coordinates, via OpenStreetMap's Nominatim.
 *
 * This is a third-party request, and it is the reason the manual path is *more* private rather
 * than less: what leaves the browser is a place name the reader chose to type — "Kraków" — not a
 * device fix accurate to a doorway. Nothing is sent to this site.
 */
export async function locateFromPlace(query: string, signal?: AbortSignal): Promise<Coordinates> {
  const place = query.trim();
  if (!place) throw new GeolocationError('not-found');

  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set('q', place);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');

  const response = await fetch(url, { signal: signal ?? null });
  if (!response.ok) throw new GeolocationError('unavailable');

  const results = (await response.json()) as NominatimResult[];
  const first = Array.isArray(results) ? results[0] : undefined;
  const lat = Number(first?.lat);
  const lng = Number(first?.lon);
  if (!first || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new GeolocationError('not-found');
  }

  const rounded = sanitizeCoordinates(lat, lng);
  return { ...rounded, source: 'place', label: first.display_name ?? place };
}
