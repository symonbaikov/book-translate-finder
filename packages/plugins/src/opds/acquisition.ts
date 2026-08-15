import { describeMediaType, isCatalogMediaType } from './media-types.js';
import type { AcquisitionKind, OpdsAcquisition, OpdsPrice } from './model.js';
import { resolveHref } from './model.js';

/**
 * Link relations defined by OPDS. The spec namespaces them under `http://opds-spec.org/`, and both
 * versions of the standard use the same strings, so one table serves the Atom and the JSON parser.
 */
const OPDS_REL_PREFIX = 'http://opds-spec.org/';

const ACQUISITION_RELS: Readonly<Record<string, AcquisitionKind>> = {
  'http://opds-spec.org/acquisition': 'unspecified',
  'http://opds-spec.org/acquisition/open-access': 'open-access',
  'http://opds-spec.org/acquisition/buy': 'buy',
  'http://opds-spec.org/acquisition/borrow': 'borrow',
  'http://opds-spec.org/acquisition/subscribe': 'subscribe',
  'http://opds-spec.org/acquisition/sample': 'sample',
};

/**
 * Feeds in the wild abbreviate the rel. Calibre-Web and COPS emit the full URI, but several
 * OPDS 2.0 generators emit the short form the JSON spec's examples use, and a reader whose
 * download button vanishes because of a prefix has been failed by us, not by their server.
 */
const SHORT_ACQUISITION_RELS: Readonly<Record<string, AcquisitionKind>> = {
  acquisition: 'unspecified',
  'acquisition/open-access': 'open-access',
  'acquisition/buy': 'buy',
  'acquisition/borrow': 'borrow',
  'acquisition/subscribe': 'subscribe',
  'acquisition/sample': 'sample',
  /** IANA-registered rel used by OPDS 2.0 for the publication file itself. */
  'http://opds-spec.org/acquisition/': 'unspecified',
};

/** Cover-image rels, in the order the UI prefers them. */
export const IMAGE_RELS = [`${OPDS_REL_PREFIX}image`, 'cover'] as const;
export const THUMBNAIL_RELS = [
  `${OPDS_REL_PREFIX}image/thumbnail`,
  `${OPDS_REL_PREFIX}thumbnail`,
  'http://opds-spec.org/cover',
] as const;

export function classifyAcquisitionRel(rel: string): AcquisitionKind | null {
  const normalized = rel.trim().toLowerCase();
  return ACQUISITION_RELS[normalized] ?? SHORT_ACQUISITION_RELS[normalized] ?? null;
}

/** `rel` may hold several space-separated relations (Atom allows it); any acquisition one wins. */
export function classifyAcquisitionRels(rels: readonly string[]): AcquisitionKind | null {
  const kinds = rels
    .map(classifyAcquisitionRel)
    .filter((kind): kind is AcquisitionKind => kind !== null);
  if (kinds.length === 0) return null;
  // A more specific rel beats the bare `acquisition` one when a feed sends both.
  return kinds.find((kind) => kind !== 'unspecified') ?? 'unspecified';
}

export function splitRel(rel: string | null | undefined): string[] {
  if (!rel) return [];
  return rel.split(/\s+/).filter(Boolean);
}

export interface AcquisitionCandidate {
  readonly rels: readonly string[];
  readonly href: string;
  readonly mediaType: string | null;
  readonly title: string | null;
  readonly price: OpdsPrice | null;
  readonly sizeBytes: number | null;
  readonly indirectMediaTypes: readonly string[];
}

/**
 * Turns one link into an acquisition, or returns `null` when it is not one.
 *
 * A link is rejected when it carries an acquisition rel but points at another catalog document
 * (`application/atom+xml;profile=opds-catalog`). Some feeds do this for "borrow" flows that route
 * through a loan page; rendering it as a file download would promise the reader a book and hand
 * them a feed.
 */
export function toAcquisition(
  candidate: AcquisitionCandidate,
  feedUrl: string,
): OpdsAcquisition | null {
  const kind = classifyAcquisitionRels(candidate.rels);
  if (kind === null) return null;
  if (isCatalogMediaType(candidate.mediaType)) return null;

  const info = describeMediaType(candidate.mediaType);
  return {
    kind,
    href: resolveHref(candidate.href, feedUrl),
    mediaType: candidate.mediaType,
    format: info?.format ?? null,
    formatLabel: info?.label ?? candidate.mediaType ?? 'File',
    title: candidate.title,
    price: candidate.price,
    sizeBytes: candidate.sizeBytes,
    requiresDrmApp: info?.requiresDrmApp ?? false,
    isAudio: info?.isAudio ?? false,
    indirectMediaTypes: candidate.indirectMediaTypes,
  };
}

/**
 * Free-and-direct: the only combination the UI may present as a plain download button. Everything
 * else needs its own wording — a price, a loan, a DRM app — because a link that says "Download"
 * and then asks for money or an Adobe ID has misinformed the reader.
 */
export function isDirectDownload(acquisition: OpdsAcquisition): boolean {
  return (
    (acquisition.kind === 'open-access' || acquisition.kind === 'unspecified') &&
    !acquisition.requiresDrmApp &&
    acquisition.price === null
  );
}
