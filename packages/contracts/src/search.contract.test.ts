import { describe, expect, it } from 'vitest';
import { SearchQuerySchema, SearchResponseSchema } from './search.contract.js';

describe('SearchQuerySchema', () => {
  it('accepts a plain query and defaults limit', () => {
    const result = SearchQuerySchema.parse({ q: 'War and Peace' });
    expect(result).toEqual({ q: 'War and Peace', limit: 20 });
  });

  it('coerces a string limit from the query string', () => {
    const result = SearchQuerySchema.parse({ q: 'x', limit: '5' });
    expect(result.limit).toBe(5);
  });

  it('rejects an empty query', () => {
    expect(SearchQuerySchema.safeParse({ q: '' }).success).toBe(false);
  });

  it('rejects a limit above the cap', () => {
    expect(SearchQuerySchema.safeParse({ q: 'x', limit: 500 }).success).toBe(false);
  });
});

describe('SearchResponseSchema', () => {
  it('accepts a found response', () => {
    const result = SearchResponseSchema.safeParse({
      status: 'found',
      results: [{ id: 'w1', originalTitle: 'x', author: 'y', firstPublishedYear: 1900 }],
    });
    expect(result.success).toBe(true);
  });

  it('accepts a pending response', () => {
    const result = SearchResponseSchema.safeParse({ status: 'pending', pollAfterMs: 2000 });
    expect(result.success).toBe(true);
  });

  it('accepts a not_found response', () => {
    const result = SearchResponseSchema.safeParse({ status: 'not_found' });
    expect(result.success).toBe(true);
  });

  it('rejects a pending response without pollAfterMs', () => {
    const result = SearchResponseSchema.safeParse({ status: 'pending' });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown status', () => {
    const result = SearchResponseSchema.safeParse({ status: 'loading' });
    expect(result.success).toBe(false);
  });
});
