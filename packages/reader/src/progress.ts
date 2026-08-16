/**
 * What the reader accumulates while reading, as a value rather than a place.
 *
 * Every function here is pure and returns a new record: the storage layer decides where this lives
 * (IndexedDB, in the reader's own browser — ADR-0013 §4), and this module decides only what a valid
 * record is and how one changes. That split is what makes the rules testable without a browser.
 *
 * **Applying the same change twice leaves the same record.** That is rules.md §2.1 and it is not
 * decoration here: a reader turning pages produces a `relocate` event per layout pass, several of
 * which carry the position they already had, and a bookmark button is a thing people double-click.
 * Every operation below is therefore idempotent, and the tests say so out loud.
 */

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
  readonly openedAt: number;
}

const clampFraction = (fraction: number): number =>
  Number.isFinite(fraction) ? Math.min(1, Math.max(0, fraction)) : 0;

export function newReadingRecord(input: {
  hash: string;
  format: string;
  title?: string | null;
  now: number;
}): ReadingRecord {
  return {
    hash: input.hash,
    format: input.format,
    title: input.title ?? null,
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
  bookmark: { cfi: string; label: string },
  now: number,
): ReadingRecord {
  if (record.bookmarks.some((existing) => existing.cfi === bookmark.cfi)) return record;
  const added: Bookmark = { cfi: bookmark.cfi, label: bookmark.label, createdAt: now };
  return { ...record, bookmarks: [...record.bookmarks, added] };
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
        typeof bookmark.createdAt === 'number',
    )
  );
}
