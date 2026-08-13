import { describe, expect, it } from 'vitest';
import {
  canonicalizeUrl,
  computeEditionNaturalKey,
  computeUrlHash,
  computeWorkNaturalKey,
} from './natural-key.js';

describe('computeWorkNaturalKey', () => {
  it('is deterministic', () => {
    const a = computeWorkNaturalKey('War and Peace', 'Leo Tolstoy');
    const b = computeWorkNaturalKey('War and Peace', 'Leo Tolstoy');
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it('collides for titles differing only in normalization-insensitive ways', () => {
    const a = computeWorkNaturalKey('War and Peace', 'Leo Tolstoy');
    const b = computeWorkNaturalKey('  WAR   AND PEACE ', 'leo tolstoy');
    expect(a).toBe(b);
  });

  it('differs for a genuinely different title or author', () => {
    const warAndPeace = computeWorkNaturalKey('War and Peace', 'Leo Tolstoy');
    const annaKarenina = computeWorkNaturalKey('Anna Karenina', 'Leo Tolstoy');
    const differentAuthor = computeWorkNaturalKey('War and Peace', 'Someone Else');
    expect(warAndPeace).not.toBe(annaKarenina);
    expect(warAndPeace).not.toBe(differentAuthor);
  });
});

describe('computeEditionNaturalKey', () => {
  const base = {
    workId: 'w1',
    language: 'en',
    publisher: 'Penguin',
    year: 2003,
    title: 'War and Peace',
  };

  it('prefers the ISBN-13 when present, ignoring the rest of the input', () => {
    const key = computeEditionNaturalKey(base, '9780140447934');
    expect(key).toBe('9780140447934');
  });

  it('falls back to a deterministic hash when no ISBN is available', () => {
    const a = computeEditionNaturalKey(base);
    const b = computeEditionNaturalKey(base);
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it('the hash fallback differs when publisher, year, or language differ', () => {
    const key = computeEditionNaturalKey(base);
    expect(computeEditionNaturalKey({ ...base, publisher: 'Other Press' })).not.toBe(key);
    expect(computeEditionNaturalKey({ ...base, year: 1999 })).not.toBe(key);
    expect(computeEditionNaturalKey({ ...base, language: 'ru' })).not.toBe(key);
  });

  it('treats null publisher/year consistently rather than throwing', () => {
    expect(() => computeEditionNaturalKey({ ...base, publisher: null, year: null })).not.toThrow();
  });
});

describe('canonicalizeUrl', () => {
  it.each([
    ['https://archive.org/details/foo', 'https://archive.org/details/foo'],
    ['https://Archive.org/details/foo', 'https://archive.org/details/foo'],
    ['https://archive.org/details/foo/', 'https://archive.org/details/foo'],
    ['https://archive.org/details/foo#page/1', 'https://archive.org/details/foo'],
    ['https://archive.org/', 'https://archive.org/'],
    [
      'https://archive.org/details/foo?bookreader=1',
      'https://archive.org/details/foo?bookreader=1',
    ],
  ])('canonicalizeUrl(%j) === %j', (input, expected) => {
    expect(canonicalizeUrl(input)).toBe(expected);
  });
});

describe('computeUrlHash', () => {
  it('is stable for URLs that canonicalize to the same form', () => {
    const a = computeUrlHash('https://Archive.org/details/foo/');
    const b = computeUrlHash('https://archive.org/details/foo');
    expect(a).toBe(b);
  });

  it('differs for genuinely different URLs', () => {
    const a = computeUrlHash('https://archive.org/details/foo');
    const b = computeUrlHash('https://archive.org/details/bar');
    expect(a).not.toBe(b);
  });
});
