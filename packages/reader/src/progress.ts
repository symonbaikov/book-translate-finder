/**
 * What the reader accumulates about a book, as a value rather than a place.
 *
 * Every function here is pure and returns a new record: `library.ts` decides where this lives
 * (IndexedDB, in the reader's own browser — ADR-0013 §4), and this module decides only what a valid
 * record is and how one changes. That split is what makes the rules testable without a browser.
 *
 * **Applying the same change twice leaves the same record.** That is rules.md §2.1 and it is not
 * decoration here: a reader turning pages produces a `relocate` event per layout pass, several of
 * which carry the position they already had, and a bookmark button is a thing people double-click.
 * Every operation below is therefore idempotent, and the tests say so out loud.
 *
 * ## One record, after briefly being two
 *
 * 11.2 wrote `ReadingRecord` before there was anywhere to put it, and 11.4 wrote `LibraryEntry` when
 * the storage arrived — two shapes for one thing, overlapping in four fields and guaranteed to drift
 * on the first change to either. They are one type again. What is *not* in it is the file itself:
 * bytes live in their own object store, because a list of books must not deserialize a 40 MB EPUB
 * per row.
 */

import type { BookOrigin } from './acquisition.js';

/** Where the reader is. `cfi` is foliate's own locator; `fraction` is for the progress bar. */
export interface ReadingPosition {
  /** An EPUB CFI, or whatever locator the format's loader produced. `null` before the first paint. */
  readonly cfi: string | null;
  /** 0–1 through the book. Clamped, because a renderer overshooting the last page is normal. */
  readonly fraction: number;
  readonly updatedAt: number;
}

export interface Bookmark {
  /** The locator is the identity: bookmarking the same spot twice is one bookmark. */
  readonly cfi: string;
  readonly label: string;
  /** The reader's own words, if they wrote any. Never leaves this browser. */
  readonly note: string;
  readonly createdAt: number;
}

export interface ReadingRecord {
  /** `contentHashOf(file)` — see identity.ts for why it is the file and not the URL. */
  readonly hash: string;
  readonly format: string;
  /** From the book's own metadata. Shown in the reader's list; never sent anywhere. */
  readonly title: string | null;
  readonly position: ReadingPosition;
  readonly bookmarks: readonly Bookmark[];
  /**
   * Whether the reader asked this browser to keep the file itself. Off by default: progress is a
   * few hundred bytes, a 40 MB EPUB is somebody's disk, and helping yourself to it is not a default
   * anyone chose (ADR-0013 §4).
   */
  readonly keepFile: boolean;
  /** How large the file was, for the list. The bytes themselves are in the other store. */
  readonly byteLength: number;
  /**
   * Where it came from, for the reader's own recognition. Never sent anywhere — ADR-0013 §1 covers
   * the URL as much as the bytes.
   */
  readonly origin: BookOrigin;
  readonly openedAt: number;
}

const clampFraction = (fraction: number): number =>
  Number.isFinite(fraction) ? Math.min(1, Math.max(0, fraction)) : 0;

export function newReadingRecord(input: {
  hash: string;
  format: string;
  title?: string | null;
  byteLength?: number;
  origin?: BookOrigin;
  now: number;
}): ReadingRecord {
  return {
    hash: input.hash,
    format: input.format,
    title: input.title ?? null,
    byteLength: input.byteLength ?? 0,
    origin: input.origin ?? { kind: 'stored' },
    position: { cfi: null, fraction: 0, updatedAt: input.now },
    bookmarks: [],
    keepFile: false,
    openedAt: input.now,
  };
}

/**
 * Move the position.
 *
 * Returns the record **unchanged** — the same object, so a caller can skip a write with `===` —
 * when the reader has not actually moved. Persisting an identical position on every layout pass
 * would turn "where I was" into a write amplifier and, on a browser near its quota, into the reason
 * a real change fails to land.
 */
export function withPosition(
  record: ReadingRecord,
  position: { cfi: string | null; fraction: number },
  now: number,
): ReadingRecord {
  const fraction = clampFraction(position.fraction);
  if (record.position.cfi === position.cfi && record.position.fraction === fraction) return record;
  return { ...record, position: { cfi: position.cfi, fraction, updatedAt: now } };
}

/** Add a bookmark, or leave the record alone if that spot is already bookmarked. */
export function withBookmark(
  record: ReadingRecord,
  bookmark: { cfi: string; label: string; note?: string },
  now: number,
): ReadingRecord {
  if (record.bookmarks.some((existing) => existing.cfi === bookmark.cfi)) return record;
  const added: Bookmark = {
    cfi: bookmark.cfi,
    label: bookmark.label,
    note: bookmark.note ?? '',
    createdAt: now,
  };
  return { ...record, bookmarks: [...record.bookmarks, added] };
}

/**
 * Change what a bookmark says.
 *
 * Separate from adding one because the identity is the locator: re-adding the same spot with a new
 * note must not be how a note gets edited, or a double-click would silently overwrite one.
 */
export function withBookmarkNote(record: ReadingRecord, cfi: string, note: string): ReadingRecord {
  const existing = record.bookmarks.find((bookmark) => bookmark.cfi === cfi);
  if (!existing || existing.note === note) return record;
  return {
    ...record,
    bookmarks: record.bookmarks.map((bookmark) =>
      bookmark.cfi === cfi ? { ...bookmark, note } : bookmark,
    ),
  };
}

/** Remove a bookmark. Removing one that is not there is not an error — the end state is the same. */
export function withoutBookmark(record: ReadingRecord, cfi: string): ReadingRecord {
  if (!record.bookmarks.some((bookmark) => bookmark.cfi === cfi)) return record;
  return { ...record, bookmarks: record.bookmarks.filter((bookmark) => bookmark.cfi !== cfi) };
}

/** Flip "keep this file in this browser". The popup that announces it lives in `apps/web`. */
export function withKeepFile(record: ReadingRecord, keepFile: boolean): ReadingRecord {
  return record.keepFile === keepFile ? record : { ...record, keepFile };
}

/**
 * Whether a value read back out of storage is still a record this version understands.
 *
 * Storage here is the reader's own browser and outlives any deployment: a record written by a
 * version of this package that no longer exists must be recognised as unusable rather than
 * destructure into `undefined` halfway through a render.
 */
export function isReadingRecord(value: unknown): value is ReadingRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Partial<ReadingRecord>;
  return (
    typeof record.hash === 'string' &&
    typeof record.format === 'string' &&
    (record.title === null || typeof record.title === 'string') &&
    typeof record.keepFile === 'boolean' &&
    typeof record.openedAt === 'number' &&
    typeof record.position === 'object' &&
    record.position !== null &&
    typeof record.position.fraction === 'number' &&
    (record.position.cfi === null || typeof record.position.cfi === 'string') &&
    Array.isArray(record.bookmarks) &&
    record.bookmarks.every(
      (bookmark) =>
        typeof bookmark?.cfi === 'string' &&
        typeof bookmark.label === 'string' &&
        typeof bookmark.note === 'string' &&
        typeof bookmark.createdAt === 'number',
    )
  );
}
