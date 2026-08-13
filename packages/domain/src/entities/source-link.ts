import type { LinkType } from '../value-objects/link-type.js';
import type { ProviderId } from '../value-objects/provider-id.js';
import type { RightsStatus } from '../value-objects/rights-status.js';

export interface SourceLinkParams {
  id: string;
  editionId: string;
  type: LinkType;
  url: string;
  urlHash: string;
  provider: ProviderId;
  rightsStatus: RightsStatus;
  isLegalFree: boolean;
  verifiedAt: Date;
}

/**
 * Immutable. The constructor is private — a `SourceLink` can only come from one of two factories
 * below, never a bare `new SourceLink(...)`. This makes an illegal state ("a link that skipped
 * the legal policy") unrepresentable in the common case: nothing in `@btf/application` can
 * fabricate one, since `unsafeCreateForPolicyUse` is not meant to be called from there — only
 * `policy/link-policy.ts` calls it. This is a naming/code-review convention, not a hard runtime
 * barrier: TypeScript has no "friend class" mechanism, so anything that imports `SourceLink` as
 * a value (not `import type`) can technically call either static method. Two ports guard the
 * two legitimate use cases:
 *
 * - `unsafeCreateForPolicyUse` — for genuinely NEW links, called only by `LinkPolicy` after it
 *   has run docs/legal-policy.md's checks.
 * - `rehydrateFromStorage` — for repository adapters (docs/architecture.md §2.4) reconstructing
 *   an entity from an already-persisted row. Safe by construction: the only way a row got into
 *   storage in the first place was through `unsafeCreateForPolicyUse`, so anything read back is
 *   already policy-checked — rehydration is not re-validation.
 */
export class SourceLink {
  private constructor(
    readonly id: string,
    readonly editionId: string,
    readonly type: LinkType,
    readonly url: string,
    readonly urlHash: string,
    readonly provider: ProviderId,
    readonly rightsStatus: RightsStatus,
    readonly isLegalFree: boolean,
    readonly verifiedAt: Date,
  ) {}

  static unsafeCreateForPolicyUse(params: SourceLinkParams): SourceLink {
    return new SourceLink(
      params.id,
      params.editionId,
      params.type,
      params.url,
      params.urlHash,
      params.provider,
      params.rightsStatus,
      params.isLegalFree,
      params.verifiedAt,
    );
  }

  static rehydrateFromStorage(params: SourceLinkParams): SourceLink {
    return new SourceLink(
      params.id,
      params.editionId,
      params.type,
      params.url,
      params.urlHash,
      params.provider,
      params.rightsStatus,
      params.isLegalFree,
      params.verifiedAt,
    );
  }
}
