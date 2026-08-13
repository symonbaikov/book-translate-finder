import { describe, expect, it } from 'vitest';
import { resolveFieldConflict } from './source-priority.js';

describe('resolveFieldConflict', () => {
  it('prefers open-library over google-books for metadata', () => {
    const result = resolveFieldConflict('metadata', [
      { source: 'google-books', value: 'ru' },
      { source: 'open-library', value: 'rus' },
    ]);
    expect(result).toBe('rus');
  });

  it('prefers google-books over open-library for covers', () => {
    const result = resolveFieldConflict('cover', [
      { source: 'open-library', value: 'https://covers.openlibrary.org/b/id/1.jpg' },
      { source: 'google-books', value: 'https://books.google.com/cover1' },
    ]);
    expect(result).toBe('https://books.google.com/cover1');
  });

  it('is order-independent — priority decides, not array position', () => {
    const metadataFirst = resolveFieldConflict('metadata', [
      { source: 'open-library', value: 'A' },
      { source: 'google-books', value: 'B' },
    ]);
    const reversed = resolveFieldConflict('metadata', [
      { source: 'google-books', value: 'B' },
      { source: 'open-library', value: 'A' },
    ]);
    expect(metadataFirst).toBe('A');
    expect(reversed).toBe('A');
  });

  it('falls back to whatever is available when the preferred source is absent', () => {
    const result = resolveFieldConflict('metadata', [
      { source: 'google-books', value: 'only-source' },
    ]);
    expect(result).toBe('only-source');
  });

  it('keeps data from an unrecognized source rather than dropping it', () => {
    const result = resolveFieldConflict('metadata', [
      { source: 'worldcat', value: 'from-worldcat' },
    ]);
    expect(result).toBe('from-worldcat');
  });

  it('returns null for an empty candidate list', () => {
    expect(resolveFieldConflict('metadata', [])).toBeNull();
  });

  it('a single candidate is returned regardless of category', () => {
    expect(resolveFieldConflict('cover', [{ source: 'open-library', value: 'x' }])).toBe('x');
  });
});
