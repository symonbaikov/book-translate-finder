import { describe, expect, it } from 'vitest';
import { libraryEntryOf, sortLibrary, type LibraryEntry } from './library.js';

/**
 * The parts of the library that are decisions rather than plumbing.
 *
 * The IndexedDB half is exercised where a real IndexedDB exists — `apps/web/e2e/reader-csp.spec.ts`
 * keeps a book, reloads, and opens it from storage. A hand-written fake here would test the fake.
 */

const entry = (hash: string, openedAt: number): LibraryEntry => ({
  hash,
  format: 'epub',
  title: null,
  byteLength: 10,
  keepFile: false,
  origin: { kind: 'file', name: 'a.epub' },
  openedAt,
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
  });
});

describe('sortLibrary', () => {
  it('puts the most recently opened first, and leaves the input alone', () => {
    const given = [entry('a', 100), entry('b', 300), entry('c', 200)];
    expect(sortLibrary(given).map((item) => item.hash)).toEqual(['b', 'c', 'a']);
    expect(given.map((item) => item.hash)).toEqual(['a', 'b', 'c']);
  });
});
