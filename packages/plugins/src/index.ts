/**
 * `@golden/plugins` — the isolated integration modules and the contract they are written against.
 *
 * This package has no project dependencies on purpose. It is imported by `apps/web` (where it runs
 * in the reader's browser) and by `packages/infrastructure` (where it runs in the API process),
 * and neither of those may learn about the other. See docs/adr/0007-plugin-architecture.md.
 */

export {
  PluginRegistry,
  describeError,
  settleAll,
  withTimeout,
  type Plugin,
  type PluginAccessMode,
  type PluginKind,
  type PluginManifest,
  type PluginOutcome,
  type PluginRuntime,
} from './plugin.js';

export {
  OpdsParseError,
  extractIsbn13,
  resolveHref,
  type AcquisitionKind,
  type OpdsAcquisition,
  type OpdsEntry,
  type OpdsFeed,
  type OpdsNavigationLink,
  type OpdsPagination,
  type OpdsPrice,
  type OpdsVersion,
} from './opds/model.js';
export {
  bareMediaType,
  describeMediaType,
  isCatalogMediaType,
  mediaTypeParameters,
  type BookFileFormat,
  type MediaTypeInfo,
} from './opds/media-types.js';
export {
  classifyAcquisitionRel,
  classifyAcquisitionRels,
  isDirectDownload,
  splitRel,
  toAcquisition,
  type AcquisitionCandidate,
} from './opds/acquisition.js';
export { parseOpds1 } from './opds/parse-atom.js';
export { parseOpds2 } from './opds/parse-json.js';
export { applySearchTemplate, parseOpdsDocument, parseOpenSearchTemplate } from './opds/parse.js';
export {
  OpdsClient,
  OpdsFetchError,
  assertFetchableFeedUrl,
  type FetchLike,
  type OpdsClientOptions,
  type OpdsCredentials,
  type OpdsFeedPlugin,
  type OpdsRequest,
} from './opds/opds-client.js';
export {
  BUILT_IN_OPDS_FEEDS,
  createCustomFeedPlugin,
  type CustomFeedInput,
} from './opds/feed-catalog.js';

export {
  InvalidCoordinatesError,
  MAX_RADIUS_KM,
  MIN_RADIUS_KM,
  clampRadiusKm,
  haversineKm,
  roundTo,
  sanitizeCoordinates,
} from './geo/distance.js';
export {
  OVERPASS_ENDPOINT,
  OverpassStoreLocator,
  type OverpassStoreLocatorOptions,
} from './geo/overpass-store-locator.js';
export type {
  GeoStoreLookup,
  GeoStoreQuery,
  PhysicalStoreResult,
  StoreAvailability,
  StoreMoney,
} from './geo/types.js';
