import { describe, expect, it } from 'vitest';
import { EditionLinksResponseSchema } from './edition-links.contract.js';

describe('EditionLinksResponseSchema', () => {
  it('accepts links with an explicit rightsStatus per link (docs/legal-policy.md)', () => {
    const result = EditionLinksResponseSchema.safeParse({
      editionId: 'e1',
      links: [
        {
          type: 'download',
          provider: 'gutenberg',
          rightsStatus: 'public_domain',
          url: 'https://gutenberg.org/ebooks/1',
        },
        {
          type: 'buy',
          provider: 'google-books',
          rightsStatus: 'copyrighted',
          url: 'https://books.google.com/books?id=1',
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a link missing rightsStatus', () => {
    const result = EditionLinksResponseSchema.safeParse({
      editionId: 'e1',
      links: [{ type: 'download', provider: 'gutenberg', url: 'https://gutenberg.org/1' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown link type', () => {
    const result = EditionLinksResponseSchema.safeParse({
      editionId: 'e1',
      links: [
        {
          type: 'stream',
          provider: 'x',
          rightsStatus: 'unknown',
          url: 'https://x.example/1',
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-URL url', () => {
    const result = EditionLinksResponseSchema.safeParse({
      editionId: 'e1',
      links: [{ type: 'download', provider: 'x', rightsStatus: 'unknown', url: 'not-a-url' }],
    });
    expect(result.success).toBe(false);
  });
});
