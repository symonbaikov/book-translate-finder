const EARTH_RADIUS_KM = 6371.0088;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Great-circle distance. Accurate to a fraction of a percent at city scale, which is the only
 * scale this is used at — a walk to a bookshop, not navigation.
 */
export function haversineKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export class InvalidCoordinatesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCoordinatesError';
  }
}

export const MIN_RADIUS_KM = 0.5;
export const MAX_RADIUS_KM = 50;

/**
 * Coordinates are snapped to three decimals — roughly 110 m — before they are used in any outbound
 * query.
 *
 * This is the privacy control that makes a third-party map lookup acceptable at all. The
 * browser's Geolocation API hands out metre-level precision, which identifies a specific building;
 * 110 m identifies a neighbourhood, and is more than precise enough to rank bookshops within a
 * kilometres-wide radius. Truncating at the source means the precise value never leaves the
 * function that received it (docs/adr/0007).
 */
export function sanitizeCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new InvalidCoordinatesError('Coordinates must be finite numbers');
  }
  if (lat < -90 || lat > 90) {
    throw new InvalidCoordinatesError(`Latitude out of range: ${lat}`);
  }
  if (lng < -180 || lng > 180) {
    throw new InvalidCoordinatesError(`Longitude out of range: ${lng}`);
  }
  return { lat: roundTo(lat, 3), lng: roundTo(lng, 3) };
}

export function clampRadiusKm(radiusKm: number): number {
  if (!Number.isFinite(radiusKm)) return MIN_RADIUS_KM;
  return Math.min(MAX_RADIUS_KM, Math.max(MIN_RADIUS_KM, radiusKm));
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
