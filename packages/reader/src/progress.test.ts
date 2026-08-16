import { describe, expect, it } from 'vitest';
import {
  isReadingRecord,
  newReadingRecord,
  withBookmark,
  withKeepFile,
  withPosition,
  withoutBookmark,
} from './progress.js';

const record = () =>
  newReadingRecord({ hash: 'sha256-' + 'a'.repeat(64), format: 'epub', now: 1000 });

describe('withPosition', () => {
  it('records where the reader got to', () => {
    const moved = withPosition(record(), { cfi: 'epubcfi(/6/4!/2)', fraction: 0.25 }, 2000);
    expect(moved.position).toEqual({ cfi: 'epubcfi(/6/4!/2)', fraction: 0.25, updatedAt: 2000 });
  });

  it('returns the same object when the reader has not moved', () => {
    // The renderer emits `relocate` several times per layout pass, most of them repeating the
    // position it already had. Writing each one would be a write amplifier on somebody's quota.
    const moved = withPosition(record(), { cfi: 'x', fraction: 0.5 }, 2000);
    expect(withPosition(moved, { cfi: 'x', fraction: 0.5 }, 3000)).toBe(moved);
  });

  it('clamps a fraction the renderer overshot', () => {
    expect(withPosition(record(), { cfi: 'x', fraction: 1.4 }, 2000).position.fraction).toBe(1);
    expect(withPosition(record(), { cfi: 'x', fraction: -0.2 }, 2000).position.fraction).toBe(0);
    expect(withPosition(record(), { cfi: 'x', fraction: Number.NaN }, 2000).position.fraction).toBe(
      0,
    );
  });

  it('leaves the original record untouched', () => {
    const original = record();
    withPosition(original, { cfi: 'x', fraction: 0.5 }, 2000);
    expect(original.position.cfi).toBeNull();
  });
});

describe('withBookmark', () => {
  it('adds a bookmark', () => {
    const marked = withBookmark(record(), { cfi: 'epubcfi(/6/4)', label: 'Chapter 2' }, 2000);
    expect(marked.bookmarks).toEqual([
      { cfi: 'epubcfi(/6/4)', label: 'Chapter 2', createdAt: 2000 },
    ]);
  });

  it('is idempotent — a double-clicked button is one bookmark', () => {
    const once = withBookmark(record(), { cfi: 'same', label: 'a' }, 2000);
    const twice = withBookmark(once, { cfi: 'same', label: 'a different label' }, 3000);
    expect(twice).toBe(once);
    expect(twice.bookmarks).toHaveLength(1);
  });

  it('removes by locator, and removing a missing one changes nothing', () => {
    const marked = withBookmark(record(), { cfi: 'here', label: 'a' }, 2000);
    expect(withoutBookmark(marked, 'here').bookmarks).toEqual([]);
    expect(withoutBookmark(marked, 'elsewhere')).toBe(marked);
  });
});

describe('withKeepFile', () => {
  it('defaults to off — nobody chose to spend their disk on this', () => {
    expect(record().keepFile).toBe(false);
  });

  it('changes only when the answer changes', () => {
    const kept = withKeepFile(record(), true);
    expect(kept.keepFile).toBe(true);
    expect(withKeepFile(kept, true)).toBe(kept);
  });
});

describe('isReadingRecord', () => {
  it('accepts what this version writes', () => {
    expect(isReadingRecord(withBookmark(record(), { cfi: 'a', label: 'b' }, 2000))).toBe(true);
  });

  it('rejects what an older version, or a hand edit, might have left behind', () => {
    // Storage is the reader's own browser and outlives any deployment of this code.
    expect(isReadingRecord(null)).toBe(false);
    expect(isReadingRecord({ hash: 'x' })).toBe(false);
    expect(isReadingRecord({ ...record(), position: { fraction: 'half' } })).toBe(false);
    expect(isReadingRecord({ ...record(), bookmarks: [{ cfi: 'a' }] })).toBe(false);
  });
});
