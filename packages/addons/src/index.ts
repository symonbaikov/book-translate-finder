/**
 * `@golden/addons` — the addon contract and the engine that runs it.
 *
 * This package is a leaf twice over. Like `@golden/plugins` it depends on no workspace package, and
 * unlike it, it must never be imported by `apps/api` or `packages/infrastructure` at all: an addon
 * is the reader's, runs on the reader's device or on its author's server, and the instance is not
 * to learn about it. `pnpm boundaries` enforces both halves.
 *
 * See docs/adr/0009-blind-core-link-policy-scope.md for what the core deliberately does not check,
 * and docs/adr/0010-addon-engine.md for the engine itself.
 */

export {
  AddonError,
  AddonManifestError,
  AddonResponseError,
  AddonTransportError,
} from './errors.js';

export {
  ADDON_API_VERSION,
  AddonCatalogDefinitionSchema,
  AddonContentTypeSchema,
  AddonExtraNameSchema,
  AddonExtraPropSchema,
  AddonManifestSchema,
  AddonPermissionsSchema,
  AddonResourceSchema,
  addonSupports,
  findCatalog,
  parseAddonManifest,
  type AddonCatalogDefinition,
  type AddonContentType,
  type AddonExtraName,
  type AddonExtraProp,
  type AddonManifest,
  type AddonPermissions,
  type AddonResource,
} from './manifest.js';

export {
  AddonSourceSchema,
  BookMetaPreviewSchema,
  BookMetaSchema,
  CatalogEnvelopeSchema,
  MetaResponseSchema,
  PosterShapeSchema,
  SourcesEnvelopeSchema,
  collectValid,
  type AddonSource,
  type BookMeta,
  type BookMetaPreview,
  type CatalogResponse,
  type MetaResponse,
  type PosterShape,
  type SourcesResponse,
} from './resources.js';

export {
  type AddonDescriptor,
  type AddonExtra,
  type AddonTransport,
  type FetchLike,
  type InstalledAddon,
} from './transport.js';

export { isBareHostname, isWebUrl, parseWebUrl, resolveWebUrl } from './url.js';

export { addonBaseUrl, encodeExtra, manifestUrlOf, resourceUrl } from './http/addon-url.js';
export { HttpAddonTransport, installHttpAddon, type HttpAddonOptions } from './http/http-addon.js';

export {
  AddonRegistry,
  describeError,
  settleAddons,
  withTimeout,
  type AddonOutcome,
} from './registry.js';

export {
  SANDBOX_PROTOCOL_VERSION,
  CapabilitySchema,
  SandboxMessageSchema,
  SandboxMethodSchema,
  readSandboxMessage,
  type Capability,
  type HostMessage,
  type SandboxMessage,
  type SandboxMethod,
} from './sandbox/protocol.js';
export { WORKER_SHIM_SOURCE, composeWorkerSource } from './sandbox/worker-shim.js';
export {
  AddonPermissionError,
  AddonRequestInitSchema,
  mediatedFetch,
  type AddonRequestInit,
  type MediatedFetchOptions,
} from './sandbox/host-fetch.js';
export { assertIntegrity, integrityOf, isIntegrityFormat } from './sandbox/integrity.js';
export {
  memoryStorage,
  runCapability,
  type AddonStorage,
  type CapabilityContext,
} from './sandbox/capabilities.js';
export { SandboxedAddon, startLocalAddon, type SandboxOptions } from './sandbox/sandbox-host.js';
