import { z } from 'zod';
import { AddonManifestError } from './errors.js';
import { isBareHostname, isWebUrl } from './url.js';

/**
 * What an addon says about itself.
 *
 * The shape is Stremio's, translated to books: `stream` became `source`, and `movie`/`series`
 * became `book`/`audiobook`. Keeping the shape rather than inventing one is deliberate — the model
 * is proven, and an author who has written a Stremio addon should recognise every field here.
 *
 * A manifest is data from a stranger. Everything below is validated before a single request is made
 * on its behalf, and validation failures are the addon author's problem, reported at install time
 * where the reader can still decline.
 */

/** The engine's protocol version. An addon declaring anything else is not installed. */
export const ADDON_API_VERSION = 1;

export const AddonContentTypeSchema = z.enum(['book', 'audiobook']);
export type AddonContentType = z.infer<typeof AddonContentTypeSchema>;

/**
 * `catalog` — lists of books, the thing search and browse are built on.
 * `meta` — everything about one book.
 * `source` — how to actually get it. Stremio calls this `stream`.
 */
export const AddonResourceSchema = z.enum(['catalog', 'meta', 'source']);
export type AddonResource = z.infer<typeof AddonResourceSchema>;

/**
 * The catalog parameters an addon accepts. Deliberately the same three Stremio settled on: free
 * text, a genre, and an offset. Anything richer belongs in the addon's own configuration page,
 * because a parameter the core does not understand is a parameter the core cannot offer a control
 * for.
 */
export const AddonExtraNameSchema = z.enum(['search', 'genre', 'skip']);
export type AddonExtraName = z.infer<typeof AddonExtraNameSchema>;

export const AddonExtraPropSchema = z.object({
  name: AddonExtraNameSchema,
  isRequired: z.boolean().optional(),
  /** For `genre`, the values this catalog actually has. Lets the interface offer a list. */
  options: z.array(z.string().min(1)).max(500).optional(),
});
export type AddonExtraProp = z.infer<typeof AddonExtraPropSchema>;

export const AddonCatalogDefinitionSchema = z.object({
  type: AddonContentTypeSchema,
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(120),
  extra: z.array(AddonExtraPropSchema).max(8).optional(),
});
export type AddonCatalogDefinition = z.infer<typeof AddonCatalogDefinitionSchema>;

/**
 * An addon id is a storage key, a React key, and the label under which the reader will blame or
 * trust this addon. It has to be stable and printable, so it is a slug rather than free text.
 */
const AddonIdSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9][a-z0-9._-]*$/, 'an addon id is lowercase alphanumeric, with . _ or -');

/**
 * Hosts a **local** addon may contact. This is a security boundary and not a content one: any host
 * may be declared, including ones `packages/domain` refuses for the instance's own pipeline, and
 * the engine will allow it. The list exists so the reader knows who their addon talks to before
 * installing it, and so an addon cannot quietly send their reading elsewhere afterwards
 * (docs/adr/0010-addon-engine.md §4).
 *
 * An HTTP addon declares nothing — its origin is the answer, and the reader read it in the URL
 * they pasted.
 */
export const AddonPermissionsSchema = z.object({
  hosts: z
    .array(
      z.string().refine(isBareHostname, 'a bare lowercase hostname, no scheme and no wildcard'),
    )
    .max(50),
});
export type AddonPermissions = z.infer<typeof AddonPermissionsSchema>;

export const AddonManifestSchema = z.object({
  id: AddonIdSchema,
  version: z.string().min(1).max(40),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  apiVersion: z.literal(ADDON_API_VERSION),
  resources: z.array(AddonResourceSchema).min(1).max(3),
  types: z.array(AddonContentTypeSchema).min(1).max(2),
  catalogs: z.array(AddonCatalogDefinitionSchema).max(100).default([]),
  /**
   * Which book ids this addon recognises (`ol`, `isbn`, …). Present so the engine can skip an
   * addon that provably cannot answer for a given book rather than pay its latency to be told so.
   */
  idPrefixes: z.array(z.string().min(1).max(40)).max(20).optional(),
  logo: z.string().refine(isWebUrl, 'must be an http(s) URL').optional(),
  homepage: z.string().refine(isWebUrl, 'must be an http(s) URL').optional(),
  contactUrl: z.string().refine(isWebUrl, 'must be an http(s) URL').optional(),
  permissions: AddonPermissionsSchema.optional(),
  behaviorHints: z
    .object({
      /** The addon has a settings page of its own, which the interface links to. */
      configurable: z.boolean().optional(),
      /** It does nothing useful until that page has been visited; the interface says so. */
      configurationRequired: z.boolean().optional(),
    })
    .optional(),
});

export type AddonManifest = z.infer<typeof AddonManifestSchema>;

/**
 * Validates a manifest and, on failure, produces a message aimed at a reader deciding whether to
 * install — not a zod dump. Whoever wrote the addon can read the same message and fix it.
 */
export function parseAddonManifest(value: unknown, origin: string): AddonManifest {
  const result = AddonManifestSchema.safeParse(value);
  if (result.success) return result.data;

  const issue = result.error.issues[0];
  const where = issue && issue.path.length > 0 ? ` at "${issue.path.join('.')}"` : '';
  const why = issue ? issue.message : 'it does not match the addon manifest format';
  throw new AddonManifestError(`${origin} is not a usable addon manifest${where}: ${why}`);
}

/** Whether this addon claims to answer `resource` for `type` — and, if given, for this id. */
export function addonSupports(
  manifest: AddonManifest,
  resource: AddonResource,
  type: AddonContentType,
  id?: string,
): boolean {
  if (!manifest.resources.includes(resource)) return false;
  if (!manifest.types.includes(type)) return false;
  // `idPrefixes` describes the ids of *books*, so it has nothing to say about a catalog id. Testing
  // one against the other rejects every catalog whose id does not happen to start like an ISBN,
  // which is most of them — an addon with `idPrefixes: ['isbn']` and a catalog called `all` would
  // never be asked for its catalog at all. Found by running a real addon against a real page, not
  // by any of the fixtures.
  if (resource === 'catalog') return true;
  // No declared prefixes means "any id" — the same default Stremio uses, and the right one: an
  // addon that has not thought about ids should still be asked rather than silently skipped.
  if (id === undefined || manifest.idPrefixes === undefined) return true;
  return manifest.idPrefixes.some((prefix) => id.startsWith(prefix));
}

/** The catalog definition under `catalogId`, or `null` — the addon may simply not have it. */
export function findCatalog(
  manifest: AddonManifest,
  type: AddonContentType,
  catalogId: string,
): AddonCatalogDefinition | null {
  return (
    manifest.catalogs.find((catalog) => catalog.type === type && catalog.id === catalogId) ?? null
  );
}
