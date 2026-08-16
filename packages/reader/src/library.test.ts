import { describe, expect, it } from 'vitest';
import { libraryEntryOf, reviveEntry, sortLibrary, type LibraryEntry } from './library.js';
import { newReadingRecord } from './progress.js';

/**
 * The parts of the library that are decisions rather than plumbing.
 *
 * The IndexedDB half is exercised where a real IndexedDB exists — `apps/web/e2e/reader-csp.spec.ts`
 * keeps a book, reloads, and opens it from storage. A hand-written fake here would test the fake.
 */

const entry = (hash: string, openedAt: number): LibraryEntry =>
  newReadingRecord({
    hash,
    format: 'epub',
    origin: { kind: 'file', name: 'a.epub' },
    now: openedAt,
  });

describe('libraryEntryOf', () => {
  it('does not keep the file by default', () => {
    // ADR-0013 §4: progress is a few hundred bytes, a 40 MB EPUB is somebody's disk.
    const made = libraryEntryOf(
      {
        hash: `sha256-${'a'.repeat(64)}`,
        format: 'epub',
        bytes: new ArrayBuffer(2048),
        origin: { kind: 'url', url: 'https://example.org/a.epub' },
      },
      'A Title',
      1000,
    );

    expect(made.keepFile).toBe(false);
    expect(made.byteLength).toBe(2048);
    expect(made.title).toBe('A Title');
    expect(made.openedAt).toBe(1000);
    // A new book starts unread and unmarked rather than at a position it was never at.
    expect(made.position).toEqual({ cfi: null, fraction: 0, updatedAt: 1000 });
    expect(made.bookmarks).toEqual([]);
  });
});

describe('sortLibrary', () => {
  it('puts the most recently opened first, and leaves the input alone', () => {
    const given = [entry('a', 100), entry('b', 300), entry('c', 200)];
    expect(sortLibrary(given).map((item) => item.hash)).toEqual(['b', 'c', 'a']);
    expect(given.map((item) => item.hash)).toEqual(['a', 'b', 'c']);
  });
});

describe('reviveEntry', () => {
  it('upgrades a record written before positions existed, rather than dropping it', () => {
    // This is not a hypothetical: the build that added positions read back the build that did not,
    // and threw on `position.cfi` for every book already in somebody's library.
    const older = {
      hash: `sha256-${'b'.repeat(64)}`,
      format: 'epub',
      title: 'An Older Book',
      byteLength: 4096,
      keepFile: true,
      origin: { kind: 'file', name: 'older.epub' },
      openedAt: 500,
    };

    const revived = reviveEntry(older);
    expect(revived?.title).toBe('An Older Book');
    // The file they chose to keep is still kept — losing that to a schema change would be the worse
    // half of the trade.
    expect(revived?.keepFile).toBe(true);
    expect(revived?.position).toEqual({ cfi: null, fraction: 0, updatedAt: 500 });
    expect(revived?.bookmarks).toEqual([]);
  });

  it('passes a current record through untouched', () => {
    const current = libraryEntryOf(
      {
        hash: `sha256-${'c'.repeat(64)}`,
        format: 'epub',
        bytes: new ArrayBuffer(8),
        origin: { kind: 'stored' },
      },
      null,
      1,
    );
    expect(reviveEntry(current)).toBe(current);
  });

  it('discards what cannot be a book at all', () => {
    expect(reviveEntry(null)).toBeNull();
    expect(reviveEntry('a string')).toBeNull();
    expect(reviveEntry({ hash: 42 })).toBeNull();
  });
});
