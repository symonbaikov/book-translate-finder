import { describe, expect, it } from 'vitest';
import { AUTHORIZED_FREE_BOOKS, findAuthorizedFreeBooks } from './authorized-free-catalog.js';
import { assertLinkAllowed, ForbiddenSourceError } from './link-policy.js';
import { ProviderId } from '../value-objects/provider-id.js';

const KNOWN_FORMATS = new Set(['epub', 'pdf', 'txt', 'html', 'mobi']);

describe('authorized-free catalog', () => {
  it('entry ids are unique — an id is part of a link identity', () => {
    const ids = AUTHORIZED_FREE_BOOKS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  /**
   * The entire premise of this catalog is that a human checked the rights holder's own page. An
   * entry without that evidence, or with a stale-looking date, is indistinguishable from a guess —
   * and a guess here means offering an unauthorized copy as if it were legal.
   */
  it('every entry names an https authorization page and when it was checked', () => {
    for (const book of AUTHORIZED_FREE_BOOKS) {
      expect(book.authorization.startsWith('https://'), `${book.id} authorization`).toBe(true);
      expect(book.license.length, `${book.id} license`).toBeGreaterThan(0);
      expect(book.verifiedOn, `${book.id} verifiedOn`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('every download is an https URL in a format the UI can label', () => {
    for (const book of AUTHORIZED_FREE_BOOKS) {
      expect(book.downloads.length, `${book.id} has downloads`).toBeGreaterThan(0);
      for (const download of book.downloads) {
        expect(download.url.startsWith('https://'), `${book.id} ${download.format}`).toBe(true);
        expect(() => new URL(download.url)).not.toThrow();
        expect(KNOWN_FORMATS.has(download.format), `${book.id} format ${download.format}`).toBe(
          true,
        );
      }
      const formats = book.downloads.map((d) => d.format);
      expect(new Set(formats).size, `${book.id} duplicate formats`).toBe(formats.length);
    }
  });

  /**
   * The catalog is hand-edited, so it is exactly where a bad link would enter the system. Running
   * every entry through the real policy proves no host on the shadow-library denylist can be
   * curated in by mistake (docs/legal-policy.md I-3).
   */
  it('every download survives LinkPolicy as an open_license download', () => {
    for (const book of AUTHORIZED_FREE_BOOKS) {
      for (const download of book.downloads) {
        expect(() =>
          assertLinkAllowed({
            id: `${book.id}-${download.format}`,
            editionId: 'edition-1',
            type: 'download',
            url: download.url,
            provider: ProviderId.create('authorized-free'),
            rightsStatus: 'open_license',
            format: download.format,
            verifiedAt: new Date('2026-08-14T00:00:00Z'),
          }),
        ).not.toThrow();
      }
    }
  });

  it('rejects a curated entry pointing at a shadow library', () => {
    expect(() =>
      assertLinkAllowed({
        id: 'x',
        editionId: 'edition-1',
        type: 'download',
        url: 'https://libgen.is/book.epub',
        provider: ProviderId.create('authorized-free'),
        rightsStatus: 'open_license',
        format: 'epub',
        verifiedAt: new Date('2026-08-14T00:00:00Z'),
      }),
    ).toThrow(ForbiddenSourceError);
  });
});

describe('findAuthorizedFreeBooks', () => {
  it('matches the query shape every source is given ("title author")', () => {
    const found = findAuthorizedFreeBooks('Little Brother Cory Doctorow');
    expect(found.map((b) => b.id)).toContain('little-brother-doctorow');
  });

  it('matches a bare title', () => {
    expect(findAuthorizedFreeBooks('Blindsight').map((b) => b.id)).toEqual(['blindsight-watts']);
  });

  it('is case- and punctuation-insensitive', () => {
    expect(findAuthorizedFreeBooks('PRO GIT!').map((b) => b.id)).toEqual(['pro-git']);
  });

  it('returns nothing for an unrelated book rather than a loose guess', () => {
    // The failure mode worth guarding: a token-overlap match would hand this reader Doctorow's
    // "Homeland" for free, which is a wrong download attached to the wrong book.
    expect(findAuthorizedFreeBooks('Homeland Elegies Ayad Akhtar')).toEqual([]);
    expect(findAuthorizedFreeBooks('War and Peace Tolstoy')).toEqual([]);
  });

  it('returns nothing for an empty query', () => {
    expect(findAuthorizedFreeBooks('   ')).toEqual([]);
  });
});
