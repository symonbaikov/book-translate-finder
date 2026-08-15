import { DomainError, InvalidInputError } from '../errors/domain-error.js';
import { SourceLink } from '../entities/source-link.js';
import { computeUrlHash } from '../normalization/natural-key.js';
import type { LinkType } from '../value-objects/link-type.js';
import type { ProviderId } from '../value-objects/provider-id.js';
import type { RightsStatus } from '../value-objects/rights-status.js';

/** Thrown when a link's host matches a known shadow-library domain — see docs/legal-policy.md I-3. */
export class ForbiddenSourceError extends DomainError {
  readonly code = 'forbidden_source';
  constructor(readonly host: string) {
    super(`Host is on the shadow-library denylist and can never be used as a link source: ${host}`);
  }
}

/** Thrown when a `download` link doesn't satisfy I-1 (public domain, from an allowlisted provider). */
export class IllegalDownloadLinkError extends DomainError {
  readonly code = 'illegal_download_link';
}

export interface LinkCandidate {
  id: string;
  editionId: string;
  type: LinkType;
  url: string;
  provider: ProviderId;
  rightsStatus: RightsStatus;
  /** File format for downloads (`epub`, `txt`, …) — carried through so the UI can tell the
   * reader what they will actually get, not just that "a download exists". */
  format?: string | null;
  verifiedAt: Date;
}

/**
 * Providers allowed to back a `download` link (docs/legal-policy.md I-1). Adding an entry here
 * is a legal decision, not a routine code change — requires an ADR (docs/legal-policy.md §5).
 */
const DOWNLOAD_ALLOWLIST: ReadonlySet<string> = new Set([
  'gutenberg',
  'internet-archive',
  'wikisource',
  'standard-ebooks',
  // Public domain audiobooks, read by volunteers and released into the public domain by
  // LibriVox's own charter — the audio equivalent of Project Gutenberg (ADR-0005).
  'librivox',
  // Books the rights holder themselves publishes for free — see `authorized-free-catalog.ts` and
  // ADR-0004. Unlike the others this is not a repository we trust wholesale: each entry names the
  // page where the author or publisher grants the permission, and is reviewed one book at a time.
  'authorized-free',
]);

/**
 * Known shadow-library domains (docs/legal-policy.md I-3). Full registrable domains, not bare
 * name fragments — matched by exact host or proper subdomain (`host === d || host.endsWith('.'+d)`).
 * A fragment-based substring match (e.g. bare `"libgen"`) would falsely flag an unrelated domain
 * that merely contains the fragment as a name prefix (e.g. a hypothetical "libgenuine-authors.com"
 * is not Library Genesis). This list isn't the primary control — it's a defense-in-depth check
 * against a bug, since only reviewed provider adapters we write ever produce link candidates in
 * the first place. Extending it (new mirror domains) is a legal decision — requires an ADR.
 */
export const DENYLIST_DOMAINS: readonly string[] = [
  'libgen.rs',
  'libgen.is',
  'libgen.st',
  'libgen.gs',
  'libgen.li',
  'annas-archive.org',
  'annas-archive.se',
  'z-lib.io',
  'z-lib.gs',
  'zlibrary.to',
  '1lib.sk',
  'sci-hub.se',
  'sci-hub.ru',
  'sci-hub.st',
];

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    throw new InvalidInputError(`Not a valid absolute URL: ${JSON.stringify(url)}`);
  }
}

function isDenylisted(hostname: string): boolean {
  return DENYLIST_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

/**
 * The single place in the codebase allowed to decide whether a link may exist
 * (docs/architecture.md §2.2). Every `SourceLink` is created here or not at all — the entity's
 * constructor is private specifically to make this the only path. Enforces all of
 * docs/legal-policy.md's invariants:
 *
 * - I-3: reject any host on the shadow-library denylist, regardless of link type.
 * - I-1: a `download` link requires BOTH an allowlisted provider AND a `public_domain` or
 *   `open_license` rights status — `unknown` is treated as `copyrighted` (never permission).
 * - I-2/I-4: `buy`/`borrow` links carry whatever rights status is known (never gated on it —
 *   purchasing or borrowing a book is always legal regardless of its copyright status), and
 *   `rightsStatus` is a required field on every `SourceLink`, so "status unknown" is always
 *   visible, never silently absent.
 */
export function assertLinkAllowed(candidate: LinkCandidate): SourceLink {
  const hostname = extractHostname(candidate.url);

  if (isDenylisted(hostname)) {
    throw new ForbiddenSourceError(hostname);
  }

  // `listen` is held to the same bar as `download`: it is still us pointing a reader at a full
  // copy of a work, and the fact that it streams rather than saves changes nothing legally.
  if (candidate.type === 'download' || candidate.type === 'listen') {
    if (!DOWNLOAD_ALLOWLIST.has(candidate.provider.value)) {
      throw new IllegalDownloadLinkError(
        `${candidate.type} links require an allowlisted provider, got: ${candidate.provider.value}`,
      );
    }
    if (candidate.rightsStatus !== 'public_domain' && candidate.rightsStatus !== 'open_license') {
      throw new IllegalDownloadLinkError(
        `${candidate.type} links require public_domain or open_license status, got: ${candidate.rightsStatus}`,
      );
    }
  }

  return SourceLink.unsafeCreateForPolicyUse({
    id: candidate.id,
    editionId: candidate.editionId,
    type: candidate.type,
    url: candidate.url,
    urlHash: computeUrlHash(candidate.url),
    provider: candidate.provider,
    rightsStatus: candidate.rightsStatus,
    isLegalFree:
      candidate.rightsStatus === 'public_domain' || candidate.rightsStatus === 'open_license',
    format: candidate.format ?? null,
    verifiedAt: candidate.verifiedAt,
  });
}
