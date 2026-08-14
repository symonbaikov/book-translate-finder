import type { BookFileFormat } from './media-types.js';

/**
 * One normalized shape for both OPDS versions.
 *
 * OPDS 1.2 is Atom XML and OPDS 2.0 is JSON with a completely different document layout, but they
 * describe the same thing. Everything above the parsers — the UI, the download engine, the
 * matching logic — works on this model only, so adding a future OPDS revision means one more
 * parser and no changes anywhere else.
 */

export type OpdsVersion = '1.2' | '2.0';

/**
 * How the reader may obtain this file, from the link's `rel`.
 *
 * `open-access` is the only kind that means "free, no strings" — OPDS 1.2 §2.4.2 defines it as
 * content with no acquisition requirement at all. The others all cost money, a loan, or an
 * account, so the UI must never render them as a plain "Download".
 */
export type AcquisitionKind =
  | 'open-access'
  | 'buy'
  | 'borrow'
  | 'subscribe'
  | 'sample'
  /** Bare `rel="http://opds-spec.org/acquisition"` — the feed did not say which. */
  | 'unspecified';

export interface OpdsPrice {
  /** Decimal amount as the feed states it. */
  readonly amount: number;
  /** ISO 4217, uppercase. */
  readonly currency: string;
}

export interface OpdsAcquisition {
  readonly kind: AcquisitionKind;
  /** Absolute URL — parsers resolve relative hrefs against the feed URL. */
  readonly href: string;
  readonly mediaType: string | null;
  /** `null` when the media type is one we have no mapping for; the link is still shown. */
  readonly format: BookFileFormat | null;
  /** Reader-facing format name ("EPUB"); falls back to the raw media type. */
  readonly formatLabel: string;
  readonly title: string | null;
  readonly price: OpdsPrice | null;
  /** File size in bytes when the feed states one (`opds:price`'s sibling `length` attribute). */
  readonly sizeBytes: number | null;
  /**
   * `true` when this link hands over a DRM licence file rather than the book (Adobe ACSM, LCP) —
   * surfaced so the UI can say so instead of promising a download it cannot deliver.
   */
  readonly requiresDrmApp: boolean;
  readonly isAudio: boolean;
  /**
   * Media types reached *through* this link rather than at it — OPDS's indirect acquisition
   * (`opds:indirectAcquisition`), used when a purchase step precedes the file.
   */
  readonly indirectMediaTypes: readonly string[];
}

export interface OpdsEntry {
  readonly id: string;
  readonly title: string;
  readonly authors: readonly string[];
  readonly summary: string | null;
  readonly language: string | null;
  readonly publisher: string | null;
  /** Publication date as the feed states it (`dcterms:issued`, `published`), unparsed. */
  readonly published: string | null;
  readonly updated: string | null;
  /** Raw `dcterms:identifier`/`identifier` values, e.g. `urn:isbn:9780140447934`. */
  readonly identifiers: readonly string[];
  /** ISBN-13 digits extracted from `identifiers`, when one is present. */
  readonly isbn13: string | null;
  readonly categories: readonly string[];
  readonly coverUrl: string | null;
  readonly thumbnailUrl: string | null;
  readonly acquisitions: readonly OpdsAcquisition[];
  /**
   * Set when the entry is a sub-catalog rather than a publication (a "navigation entry" in OPDS
   * 1.2 terms): its link points at another feed. Such entries have no acquisitions.
   */
  readonly navigationHref: string | null;
}

export interface OpdsNavigationLink {
  readonly rel: string;
  readonly href: string;
  readonly title: string | null;
  readonly mediaType: string | null;
}

export interface OpdsPagination {
  readonly next: string | null;
  readonly previous: string | null;
  readonly first: string | null;
  readonly last: string | null;
}

export interface OpdsFeed {
  readonly version: OpdsVersion;
  readonly id: string | null;
  readonly title: string;
  readonly updated: string | null;
  /** The URL this feed was fetched from — the base every relative href was resolved against. */
  readonly feedUrl: string;
  readonly entries: readonly OpdsEntry[];
  /** Sub-catalogs and structural links (`start`, `up`, `subsection`, `self`, …). */
  readonly navigation: readonly OpdsNavigationLink[];
  readonly pagination: OpdsPagination;
  /**
   * OpenSearch description document URL (`rel="search"`), when the feed offers search. Following
   * it yields a URL template — a second request, so it is exposed rather than resolved here.
   */
  readonly searchDescriptionUrl: string | null;
}

/** Thrown when a document is fetched successfully but is not an OPDS feed we can read. */
export class OpdsParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpdsParseError';
  }
}

/**
 * Resolves a possibly-relative href against the feed URL. OPDS feeds routinely use root-relative
 * hrefs (`/opds/download/123`), and a UI handed those verbatim would build links against its own
 * origin — pointing the reader's download at our web app instead of at their Calibre server.
 */
export function resolveHref(href: string, baseUrl: string): string {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}

/** ISBN-13 out of `urn:isbn:978-0-14-044793-4` and friends; `null` if there is no 13-digit ISBN. */
export function extractIsbn13(identifiers: readonly string[]): string | null {
  for (const identifier of identifiers) {
    const digits = identifier.replace(/^urn:isbn:/i, '').replace(/[^0-9Xx]/g, '');
    if (digits.length === 13 && /^97[89]\d{10}$/.test(digits)) return digits;
  }
  return null;
}
