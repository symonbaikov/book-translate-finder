import { describe, expect, it } from 'vitest';
import { compareBookFormats, normalizeBookFormat, type BookFormat } from './book-format.js';

describe('normalizeBookFormat', () => {
  it.each<[string, BookFormat]>([
    // The same binding as five real Open Library `physical_format` values.
    ['Paperback', 'paperback'],
    ['paperback', 'paperback'],
    ['Mass Market Paperback', 'paperback'],
    ['pbk.', 'paperback'],
    ['Taschenbuch', 'paperback'],
    ['Broschiert', 'paperback'],
    ['Hardcover', 'hardcover'],
    ['hardback', 'hardcover'],
    ['Cloth', 'hardcover'],
    ['Gebunden', 'hardcover'],
    ['твёрдый переплет', 'hardcover'],
    ['Kindle Edition', 'ebook'],
    ['EPUB', 'ebook'],
    ['electronic resource', 'ebook'],
    ['Audio CD', 'audiobook'],
    ['MP3 CD', 'audiobook'],
    ['Audiobook', 'audiobook'],
  ])('reads %s as %s', (raw, expected) => {
    expect(normalizeBookFormat(raw)).toBe(expected);
  });

  it.each([null, undefined, '', '   ', 'Unbekannt', 'Leporello'])(
    'leaves %s as unknown rather than guessing',
    (raw) => {
      expect(normalizeBookFormat(raw)).toBe('unknown');
    },
  );

  it('prefers the audiobook reading of a string that also mentions a binding', () => {
    // "Audio CD, paperback insert" is an audiobook; substring order in the table decides this.
    expect(normalizeBookFormat('Audio CD, paperback insert')).toBe('audiobook');
  });
});

describe('compareBookFormats', () => {
  it('sorts physical before digital and unknown last', () => {
    const formats: BookFormat[] = ['unknown', 'ebook', 'hardcover', 'audiobook', 'paperback'];
    expect([...formats].sort(compareBookFormats)).toEqual([
      'hardcover',
      'paperback',
      'ebook',
      'audiobook',
      'unknown',
    ]);
  });
});
