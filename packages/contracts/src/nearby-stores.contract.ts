import { z } from 'zod';

/**
 * `GET /api/stores/nearby` — Module B's **opt-in** server-side path.
 *
 * The web app does not call this. It runs the same lookup in the browser so the reader's
 * coordinates never reach the instance at all (docs/adr/0007); this endpoint exists for clients
 * that cannot do that, and a self-hoster must switch it on with `ENABLE_SERVER_GEO_LOOKUP=true`
 * knowing that it means locations arrive at their server.
 *
 * `availability` is `unknown` for every result the shipped adapter returns, and
 * `availabilityNote` says why. No open dataset maps an ISBN to a shop's shelf, so the answer is
 * "bookshops near you", never "has this book" (docs/plan.md 4.7).
 */

export const NearbyStoresQuerySchema = z.object({
  /** Optional: an edition without an ISBN still deserves an answer. */
  isbn: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  /** Kilometres. Clamped again by the adapter; bounded here so a 400 beats a huge upstream query. */
  radiusKm: z.coerce.number().min(0.5).max(50).default(5),
});

export type NearbyStoresQuery = z.infer<typeof NearbyStoresQuerySchema>;

export const PhysicalStoreSchema = z.object({
  storeId: z.string(),
  storeName: z.string(),
  distanceKm: z.number().nonnegative(),
  availability: z.enum(['in_stock', 'out_of_stock', 'order_only', 'unknown']),
  price: z
    .object({ amountMinor: z.number().int().nonnegative(), currency: z.string().length(3) })
    .nullable(),
  address: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  website: z.string().nullable(),
  phone: z.string().nullable(),
  openingHours: z.string().nullable(),
  source: z.string(),
  /** Shown verbatim next to `unknown`, so it never reads as a loading state. */
  availabilityNote: z.string().nullable(),
});

export type PhysicalStoreDto = z.infer<typeof PhysicalStoreSchema>;

export const NearbyStoresResponseSchema = z.object({
  stores: z.array(PhysicalStoreSchema),
  degraded: z.array(z.object({ providerId: z.string(), reason: z.string() })),
});

export type NearbyStoresResponse = z.infer<typeof NearbyStoresResponseSchema>;
