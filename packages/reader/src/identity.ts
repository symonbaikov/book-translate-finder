/**
 * What names a book in this reader's storage.
 *
 * The SHA-256 of the file itself, computed in the tab, and deliberately **not** the URL and **not**
 * this application's work id:
 *
 * - a URL is not the book — the same edition fetched from another mirror should resume where the
 *   reader left it, and a URL that starts serving a different file must not inherit their bookmarks;
 * - a work id is not available at all for a file picked off a disk, which is the path CORS makes
 *   the common one (ADR-0013 §7).
 *
 * The hash is an identifier **for the file**, so it is covered by the invariant in ADR-0013 §1 like
 * the bytes themselves: it stays in the browser, it is never sent anywhere, and it never appears in
 * a URL this instance would see. Anything that would send it is a leak wearing a shorter name.
 */
import { ReaderError } from './errors.js';

const PREFIX = 'sha256-';

/** `crypto.subtle` is only present in a secure context; without it there is no stable key at all. */
function subtleOf(subtle: SubtleCrypto | null): SubtleCrypto {
  if (!subtle) {
    throw new ReaderError(
      'Web Crypto is unavailable, which means this page is not in a secure context. Reading ' +
        'positions cannot be stored without a stable key for the file.',
    );
  }
  return subtle;
}

/**
 * `sha256-<64 lowercase hex>`.
 *
 * Prefixed because a bare hex string in storage is indistinguishable from any other hex string, and
 * a stored key outlives the code that chose its algorithm. When SHA-256 stops being the right
 * choice, the prefix is what lets old records be recognised rather than silently orphaned.
 */
export async function contentHashOf(
  bytes: BufferSource,
  // `null` rather than `undefined` for "there is none": a default parameter is also used when the
  // caller passes `undefined`, so an optional-chained lookup could never be tested for absence.
  subtle: SubtleCrypto | null = globalThis.crypto?.subtle ?? null,
): Promise<string> {
  const digest = await subtleOf(subtle).digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
  return `${PREFIX}${hex}`;
}

/** Guards storage lookups: a hand-edited or truncated key should miss, not throw. */
export function isContentHash(value: unknown): value is string {
  return typeof value === 'string' && /^sha256-[0-9a-f]{64}$/.test(value);
}
