import { createHash } from 'node:crypto';
import { normalizeText } from './normalize-text.js';

/**
 * Exported so `@golden/application` use cases needing a deterministic hash (backfill `jobId`,
 * `Idempotency-Key` request hashing, docs/rules.md §2.4) don't each need their own `node:crypto`
 * import — keeps that import in one place.
 */
export function sha256Hex(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * `work.natural_key` per docs/rules.md §2.2 — deterministic hash of normalized title + author.
 * Two sync runs for the same book, even from different sources with slightly different
 * capitalization/punctuation in the title, collapse onto the same key via `normalizeText`.
 */
export function computeWorkNaturalKey(originalTitle: string, author: string): string {
  return sha256Hex(`${normalizeText(originalTitle)}|${normalizeText(author)}`);
}

export interface EditionNaturalKeyInput {
  workId: string;
  language: string;
  publisher: string | null;
  year: number | null;
  title: string;
}

/**
 * `edition.natural_key` per docs/rules.md §2.2. Prefer the ISBN-13 when present — a real-world
 * identifier is a stronger dedup key than any derived hash. Fall back to a hash of
 * (work, language, publisher, year, normalized title) only when no ISBN is available.
 */
export function computeEditionNaturalKey(input: EditionNaturalKeyInput, isbn13?: string): string {
  if (isbn13) return isbn13;
  const parts = [
    input.workId,
    input.language,
    input.publisher ?? '',
    input.year !== null ? String(input.year) : '',
    normalizeText(input.title),
  ];
  return sha256Hex(parts.join('|'));
}

/**
 * `source_link.url_hash` per docs/rules.md §2.2 — hashed over a canonicalized form of the URL so
 * that trivially-different-but-equivalent URLs (trailing slash, uppercase host, a `#fragment`
 * that has no server-side meaning) don't produce spurious duplicate links. Does NOT sort query
 * parameters — every source we control emits them in a stable order, and sorting has its own
 * edge cases with repeated parameter names that aren't worth taking on here.
 */
export function computeUrlHash(url: string): string {
  return sha256Hex(canonicalizeUrl(url));
}

export function canonicalizeUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hash = '';
  const pathname =
    parsed.pathname.length > 1 ? parsed.pathname.replace(/\/+$/, '') : parsed.pathname;
  const search = parsed.search;
  return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${pathname}${search}`;
}
