import { describe, expect, it } from 'vitest';
import { WorkRatingsQuerySchema, WorkRatingsResponseSchema } from './ratings.contract.js';

const RESPONSE = {
  workId: 'w1',
  editions: [
    {
      editionId: 'e1',
      providerId: 'google-books',
      providerName: 'Google Books',
      average: 4.3,
      outOf: 5,
      votes: 212,
      lowConfidence: false,
      url: 'https://books.google.com/books/about/?id=abc123',
    },
  ],
  reviewLinks: [
    {
      editionId: 'e2',
      providerId: 'goodreads',
      providerName: 'Goodreads',
      url: 'https://www.goodreads.com/book/show/1560198',
    },
  ],
  translators: [
    {
      translator: 'Наталья Волжина',
      language: 'ru',
      average: 4.1,
      outOf: 5,
      votes: 402,
      ratedEditions: 2,
      lowConfidence: false,
    },
  ],
  withoutIsbn: 3,
  notLookedUp: 0,
  degraded: [],
  retrievedAt: '2026-08-16T10:00:00.000Z',
};

describe('WorkRatingsQuerySchema', () => {
  it('reads a blank language as no filter, which is what an untouched select submits', () => {
    expect(WorkRatingsQuerySchema.parse({ language: '  ' }).language).toBeUndefined();
  });

  it('rejects anything that is not a two-letter code', () => {
    expect(WorkRatingsQuerySchema.safeParse({ language: 'rus' }).success).toBe(false);
  });
});

describe('WorkRatingsResponseSchema', () => {
  it('accepts a full answer', () => {
    expect(WorkRatingsResponseSchema.parse(RESPONSE)).toEqual(RESPONSE);
  });

  it('accepts an edition with no link to the source page', () => {
    const response = {
      ...RESPONSE,
      editions: [{ ...RESPONSE.editions[0], url: null }],
    };
    expect(WorkRatingsResponseSchema.safeParse(response).success).toBe(true);
  });

  it('refuses an average nobody voted on', () => {
    const response = {
      ...RESPONSE,
      editions: [{ ...RESPONSE.editions[0], votes: 0 }],
    };
    expect(WorkRatingsResponseSchema.safeParse(response).success).toBe(false);
  });

  it('refuses a translator row covering no rated edition', () => {
    const response = {
      ...RESPONSE,
      translators: [{ ...RESPONSE.translators[0], ratedEditions: 0 }],
    };
    expect(WorkRatingsResponseSchema.safeParse(response).success).toBe(false);
  });

  it('keeps the gaps in the successful answer rather than making them optional', () => {
    const { withoutIsbn: _withoutIsbn, ...withoutTheGap } = RESPONSE;
    expect(WorkRatingsResponseSchema.safeParse(withoutTheGap).success).toBe(false);
  });

  it('names a degraded source', () => {
    const response = {
      ...RESPONSE,
      degraded: [{ providerId: 'google-books', reason: '429 Too Many Requests' }],
    };
    expect(WorkRatingsResponseSchema.parse(response).degraded).toHaveLength(1);
  });

  it('accepts an answer that is nothing but review links — the keyless case', async () => {
    const response = { ...RESPONSE, editions: [], translators: [] };
    expect(WorkRatingsResponseSchema.safeParse(response).success).toBe(true);
  });

  it('refuses a review link that is not a URL', async () => {
    const response = {
      ...RESPONSE,
      reviewLinks: [{ ...RESPONSE.reviewLinks[0], url: '1560198' }],
    };
    expect(WorkRatingsResponseSchema.safeParse(response).success).toBe(false);
  });
});
