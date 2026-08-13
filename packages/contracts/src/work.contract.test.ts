import { describe, expect, it } from 'vitest';
import {
  EditionsQuerySchema,
  EditionsResponseSchema,
  WorkCardResponseSchema,
} from './work.contract.js';

describe('WorkCardResponseSchema', () => {
  it('accepts a full card', () => {
    const result = WorkCardResponseSchema.safeParse({
      id: 'w1',
      originalTitle: 'War and Peace',
      originalLanguage: 'ru',
      author: 'Leo Tolstoy',
      firstPublishedYear: 1869,
      translatedLanguages: ['en', 'fr'],
      editionCount: 12,
      sources: ['open-library'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a negative edition count', () => {
    const result = WorkCardResponseSchema.safeParse({
      id: 'w1',
      originalTitle: 'x',
      originalLanguage: 'ru',
      author: 'y',
      firstPublishedYear: null,
      translatedLanguages: [],
      editionCount: -1,
      sources: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('EditionsQuerySchema', () => {
  it('accepts an empty query (no filters)', () => {
    expect(EditionsQuerySchema.safeParse({}).success).toBe(true);
  });

  it('coerces year from a query string', () => {
    const result = EditionsQuerySchema.parse({ year: '1990' });
    expect(result.year).toBe(1990);
  });

  it('rejects a language code of the wrong length', () => {
    expect(EditionsQuerySchema.safeParse({ language: 'eng' }).success).toBe(false);
  });
});

describe('EditionsResponseSchema', () => {
  it('accepts a list of editions', () => {
    const result = EditionsResponseSchema.safeParse({
      workId: 'w1',
      editions: [
        {
          id: 'e1',
          title: 'Война и мир',
          language: 'ru',
          translator: null,
          translatedFrom: null,
          publisher: 'Nauka',
          year: 1869,
          isbn: null,
          linkCount: 0,
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});
