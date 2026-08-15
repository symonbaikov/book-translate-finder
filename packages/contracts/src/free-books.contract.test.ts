import { describe, expect, it } from 'vitest';
import { FreeBooksQuerySchema, FreeBooksResponseSchema } from './free-books.contract.js';

describe('FreeBooksQuerySchema', () => {
  it('defaults to the first page of the whole shelf', () => {
    expect(FreeBooksQuerySchema.parse({})).toEqual({ limit: 24, offset: 0 });
  });

  it('coerces the numbers a query string actually carries', () => {
    const result = FreeBooksQuerySchema.parse({ limit: '12', offset: '24' });
    expect(result).toEqual({ limit: 12, offset: 24 });
  });

  it('reads a blank language as no filter, which is what an untouched select submits', () => {
    expect(FreeBooksQuerySchema.parse({ language: '  ' }).language).toBeUndefined();
  });

  it('normalizes the language', () => {
    expect(FreeBooksQuerySchema.parse({ language: ' RU ' }).language).toBe('ru');
  });

  it('rejects a limit above the cap, so one request cannot dump the shelf', () => {
    expect(FreeBooksQuerySchema.safeParse({ limit: 500 }).success).toBe(false);
  });

  it('rejects a negative offset', () => {
    expect(FreeBooksQuerySchema.safeParse({ offset: -1 }).success).toBe(false);
  });
});

describe('FreeBooksResponseSchema', () => {
  const book = {
    id: 'w1',
    originalTitle: 'Anna Karenina',
    author: 'Leo Tolstoy',
    firstPublishedYear: 1878,
    coverUrl: null,
    formats: ['epub', 'txt'],
  };

  it('accepts a page of the shelf', () => {
    const result = FreeBooksResponseSchema.safeParse({
      books: [book],
      total: 137,
      language: null,
      limit: 24,
      offset: 0,
    });
    expect(result.success).toBe(true);
  });

  it('requires the total, since the catalogue pages against it', () => {
    const result = FreeBooksResponseSchema.safeParse({
      books: [book],
      language: null,
      limit: 24,
      offset: 0,
    });
    expect(result.success).toBe(false);
  });
});
