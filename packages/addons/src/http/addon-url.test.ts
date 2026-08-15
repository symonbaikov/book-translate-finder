import { describe, expect, it } from 'vitest';
import { addonBaseUrl, encodeExtra, manifestUrlOf, resourceUrl } from './addon-url.js';

describe('addonBaseUrl', () => {
  it('strips the manifest filename', () => {
    expect(addonBaseUrl('https://addon.example/manifest.json')).toBe('https://addon.example');
  });

  it('keeps a path prefix — several addons may share one host', () => {
    expect(addonBaseUrl('https://addon.example/books/v2/manifest.json')).toBe(
      'https://addon.example/books/v2',
    );
  });

  it('drops a query string and a fragment, which are not part of the addon address', () => {
    expect(addonBaseUrl('https://addon.example/manifest.json?token=1#x')).toBe(
      'https://addon.example',
    );
  });

  it('round-trips with manifestUrlOf', () => {
    const url = 'https://addon.example/books/manifest.json';
    expect(manifestUrlOf(addonBaseUrl(url))).toBe(url);
  });
});

describe('resourceUrl', () => {
  const base = 'https://addon.example';

  it('builds the Stremio layout, with source where Stremio says stream', () => {
    expect(resourceUrl(base, 'catalog', 'book', 'top')).toBe(
      'https://addon.example/catalog/book/top.json',
    );
    expect(resourceUrl(base, 'meta', 'book', 'ol:OL1W')).toBe(
      'https://addon.example/meta/book/ol%3AOL1W.json',
    );
    expect(resourceUrl(base, 'source', 'audiobook', 'lv:123')).toBe(
      'https://addon.example/source/audiobook/lv%3A123.json',
    );
  });

  it('encodes an id containing a slash instead of letting it become a path segment', () => {
    expect(resourceUrl(base, 'meta', 'book', '/works/OL1W')).toBe(
      'https://addon.example/meta/book/%2Fworks%2FOL1W.json',
    );
  });

  it('puts the extras in one segment, ahead of the .json', () => {
    expect(resourceUrl(base, 'catalog', 'book', 'top', { search: 'dune', skip: 100 })).toBe(
      'https://addon.example/catalog/book/top/search=dune&skip=100.json',
    );
  });
});

describe('encodeExtra', () => {
  it('is empty when there is nothing to say', () => {
    expect(encodeExtra(undefined)).toBe('');
    expect(encodeExtra({})).toBe('');
    expect(encodeExtra({ search: '', skip: 0 })).toBe('');
  });

  it('escapes a value so it cannot become another segment or another parameter', () => {
    expect(encodeExtra({ search: 'a/b&genre=x' })).toBe('search=a%2Fb%26genre%3Dx');
  });

  /** Two requests for the same thing must produce the same URL — caches depend on it. */
  it('orders parameters the same way regardless of how the object was built', () => {
    expect(encodeExtra({ skip: 20, genre: 'sci-fi', search: 'dune' })).toBe(
      encodeExtra({ search: 'dune', genre: 'sci-fi', skip: 20 }),
    );
    expect(encodeExtra({ skip: 20, search: 'dune' })).toBe('search=dune&skip=20');
  });

  it('floors a fractional offset rather than sending one', () => {
    expect(encodeExtra({ skip: 20.7 })).toBe('skip=20');
  });
});
