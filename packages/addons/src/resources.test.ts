import { describe, expect, it } from 'vitest';
import {
  AddonSourceSchema,
  BookMetaPreviewSchema,
  BookMetaSchema,
  collectValid,
} from './resources.js';

describe('AddonSource', () => {
  it('accepts an ordinary offer', () => {
    const parsed = AddonSourceSchema.parse({
      name: 'Example',
      title: 'EPUB · 1.2 MB',
      url: 'https://addon.example/files/1.epub',
      format: 'epub',
    });
    expect(parsed.url).toBe('https://addon.example/files/1.epub');
  });

  /**
   * The blind core is about *where* a link points, never about what kind of string it is. These
   * four all execute or read in this origin if put in an `href`, which makes rejecting them an
   * injection defence rather than a revival of the denylist (src/url.ts).
   */
  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'blob:https://golden.example/1234',
    'file:///etc/passwd',
  ])('refuses %s', (url) => {
    expect(AddonSourceSchema.safeParse({ name: 'x', url }).success).toBe(false);
  });

  it('accepts any host at all, which is the whole point', () => {
    for (const url of ['https://libgen.rs/get/1', 'http://192.168.1.10:8083/download/2']) {
      expect(AddonSourceSchema.safeParse({ name: 'x', url }).success).toBe(true);
    }
  });

  /**
   * ADR-0009: the addon knows what it is offering and this project does not. A status we would
   * have to invent is worse than none, so the field does not exist and an addon sending one is
   * simply not heard on the subject.
   */
  it('drops a rights status an addon tries to assert', () => {
    const parsed = AddonSourceSchema.parse({
      name: 'x',
      url: 'https://addon.example/1.epub',
      rightsStatus: 'public_domain',
    });
    expect(parsed).not.toHaveProperty('rightsStatus');
  });
});

describe('BookMeta', () => {
  it('requires an id, a type and a name, and nothing else', () => {
    const parsed = BookMetaSchema.parse({ id: 'ol:OL1W', type: 'book', name: 'Dune' });
    expect(parsed.authors).toBeUndefined();
  });

  it('refuses a poster that is not an http(s) URL', () => {
    const result = BookMetaPreviewSchema.safeParse({
      id: 'ol:OL1W',
      type: 'book',
      name: 'Dune',
      poster: 'javascript:alert(1)',
    });
    expect(result.success).toBe(false);
  });
});

describe('collectValid', () => {
  it('keeps the readable entries and counts the rest', () => {
    const { kept, dropped } = collectValid(BookMetaPreviewSchema, [
      { id: 'a', type: 'book', name: 'A' },
      { id: 'b', type: 'not-a-type', name: 'B' },
      { id: 'c', type: 'book', name: 'C' },
      null,
    ]);
    expect(kept.map((meta) => meta.id)).toEqual(['a', 'c']);
    expect(dropped).toBe(2);
  });

  it('does not lose a whole page to one malformed book', () => {
    const entries = Array.from({ length: 40 }, (_unused, index) =>
      index === 7 ? { broken: true } : { id: `b${index}`, type: 'book', name: `Book ${index}` },
    );
    const { kept, dropped } = collectValid(BookMetaPreviewSchema, entries);
    expect(kept).toHaveLength(39);
    expect(dropped).toBe(1);
  });
});
