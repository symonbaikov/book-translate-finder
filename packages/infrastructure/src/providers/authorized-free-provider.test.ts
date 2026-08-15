import { AUTHORIZED_FREE_BOOKS } from '@golden/domain';
import { describe, expect, it } from 'vitest';
import { AuthorizedFreeProvider } from './authorized-free-provider.js';

const provider = new AuthorizedFreeProvider();

describe('AuthorizedFreeProvider', () => {
  it('finds a curated book by the same "title author" query every source gets', async () => {
    const works = await provider.searchWorks({ text: 'Little Brother Cory Doctorow' });

    expect(works[0]).toMatchObject({
      externalId: 'little-brother-doctorow',
      title: 'Little Brother',
      authorNames: ['Cory Doctorow'],
      languages: ['en'],
    });
  });

  it('returns nothing for a book that is not curated — most books are not', async () => {
    expect(await provider.searchWorks({ text: 'War and Peace Tolstoy' })).toEqual([]);
  });

  it('yields one download link per format, all open_license', async () => {
    const [edition] = await provider.fetchEditions('little-brother-doctorow');

    expect(edition!.rightsSignal).toBe('open_license');
    expect(edition!.links?.map((l) => l.format)).toEqual(['epub', 'pdf', 'txt']);
    expect(edition!.links?.every((l) => l.type === 'download')).toBe(true);
  });

  /**
   * Never `public_domain`: these books are in copyright and free only because the rights holder
   * said so. Claiming public domain would misstate the reader's rights and would survive the
   * policy check for the wrong reason (docs/legal-policy.md I-1).
   */
  it('never claims public domain for any curated book', async () => {
    for (const book of AUTHORIZED_FREE_BOOKS) {
      const [edition] = await provider.fetchEditions(book.id);
      expect(edition!.rightsSignal, book.id).toBe('open_license');
    }
  });

  it('returns no editions for an unknown id instead of inventing one', async () => {
    expect(await provider.fetchEditions('not-in-the-catalog')).toEqual([]);
  });

  it('supplies no description or cover, leaving both to a bibliographic source', async () => {
    expect(await provider.fetchWorkDetails('little-brother-doctorow')).toEqual({
      description: null,
      coverUrl: null,
    });
  });
});
