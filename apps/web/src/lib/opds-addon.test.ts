import { describe, expect, it, vi } from 'vitest';
import { OpdsClient } from '@golden/plugins';
import { OpdsAddonTransport } from './opds-addon';

/**
 * A small but realistic OPDS 1.2 feed: two books, one of them with an ISBN, and one navigation
 * entry. The navigation entry is the point of half these tests — a catalog list must not present a
 * sub-catalog as a book, and Project Gutenberg's root is nothing but sub-catalogs.
 */
const FEED = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:dcterms="http://purl.org/dc/terms/"
      xmlns:opds="http://opds-spec.org/2010/catalog">
  <id>urn:my-library</id>
  <title>My Library</title>
  <link rel="search" type="application/opensearchdescription+xml" href="/opds/search.xml"/>
  <entry>
    <id>urn:book:1</id>
    <title>Dune</title>
    <author><name>Frank Herbert</name></author>
    <summary>A desert planet.</summary>
    <dcterms:language>en</dcterms:language>
    <dcterms:issued>1965</dcterms:issued>
    <dcterms:identifier>urn:isbn:9780441013593</dcterms:identifier>
    <link rel="http://opds-spec.org/image/thumbnail" href="/covers/1.jpg" type="image/jpeg"/>
    <link rel="http://opds-spec.org/acquisition" href="/get/epub/1" type="application/epub+zip"/>
  </entry>
  <entry>
    <id>urn:book:2</id>
    <title>A Book Without An ISBN</title>
    <author><name>Anon</name></author>
    <link rel="http://opds-spec.org/acquisition/buy" href="/buy/2" type="text/html"/>
  </entry>
  <entry>
    <id>urn:nav:recent</id>
    <title>Recently added</title>
    <link rel="subsection" href="/opds/recent" type="application/atom+xml;profile=opds-catalog"/>
  </entry>
</feed>`;

function transport(pages: Record<string, string> = {}) {
  const calls: string[] = [];
  const fetchImpl = vi.fn(async (url: string) => {
    calls.push(url);
    const body = pages[url] ?? FEED;
    return new Response(body, {
      status: 200,
      headers: { 'content-type': 'application/atom+xml' },
    });
  });
  const client = new OpdsClient({ fetch: fetchImpl as never });
  return {
    calls,
    addon: new OpdsAddonTransport(
      { id: 'feed-1', name: 'My Library', url: 'https://library.example/opds' },
      client,
      fetchImpl as never,
    ),
  };
}

describe('the manifest an OPDS catalog presents', () => {
  it('claims only what a feed can actually answer', () => {
    const { addon } = transport();
    expect(addon.manifest.resources).toEqual(['catalog', 'source']);
    expect(addon.manifest.id).toBe('opds.feed-1');
    expect(addon.manifest.catalogs[0]?.extra?.[0]?.name).toBe('search');
  });

  it('declares the feed’s own host and nothing else', () => {
    const { addon } = transport();
    expect(addon.manifest.permissions?.hosts).toEqual(['library.example']);
  });

  it('does not offer meta — the catalog row already carries everything the feed said', async () => {
    const { addon } = transport();
    expect(addon.manifest.resources).not.toContain('meta');
    await expect(addon.getMeta()).rejects.toThrow(/does not answer meta/);
  });
});

describe('getCatalog', () => {
  it('returns the publications', async () => {
    const { addon } = transport();
    const result = await addon.getCatalog('book', 'feed');
    expect(result.metas.map((meta) => meta.name)).toEqual(['Dune', 'A Book Without An ISBN']);
  });

  /**
   * The regression this whole transport is shaped around: a sub-catalog is not a book. Phase 5
   * found the same thing from the other direction — Gutenberg's browse results *are* navigation
   * entries, which is why browsing stays in the shelf rather than moving here.
   */
  it('leaves navigation entries out — a sub-catalog is not a book', async () => {
    const { addon } = transport();
    const result = await addon.getCatalog('book', 'feed');
    expect(result.metas.map((meta) => meta.name)).not.toContain('Recently added');
  });

  it('identifies a book by ISBN when the feed gives one, and by its own id otherwise', async () => {
    const { addon } = transport();
    const [first, second] = (await addon.getCatalog('book', 'feed')).metas;
    expect(first?.id).toBe('isbn:9780441013593');
    expect(second?.id).toBe('opds:urn:book:2');
  });

  it('carries across what the feed stated and invents nothing', async () => {
    const { addon } = transport();
    const [dune] = (await addon.getCatalog('book', 'feed')).metas;
    expect(dune).toMatchObject({
      authors: ['Frank Herbert'],
      description: 'A desert planet.',
      releaseInfo: '1965',
      language: 'en',
    });
    const [, second] = (await addon.getCatalog('book', 'feed')).metas;
    expect(second).not.toHaveProperty('description');
    expect(second).not.toHaveProperty('releaseInfo');
  });

  it('uses the feed’s own search endpoint when it advertises one', async () => {
    const { addon, calls } = transport({
      'https://library.example/opds/search.xml':
        '<OpenSearchDescription><Url type="application/atom+xml" template="https://library.example/opds/search?q={searchTerms}"/></OpenSearchDescription>',
      'https://library.example/opds/search?q=dune': FEED,
    });
    await addon.getCatalog('book', 'feed', { search: 'dune' });
    expect(calls).toContain('https://library.example/opds/search?q=dune');
  });

  it('answers from the root rather than pretending a term was applied, when it cannot search', async () => {
    const withoutSearch = FEED.replace(/<link rel="search"[^/]*\/>/, '');
    const { addon, calls } = transport({ 'https://library.example/opds': withoutSearch });
    const result = await addon.getCatalog('book', 'feed', { search: 'dune' });
    expect(result.metas).toHaveLength(2);
    expect(calls.every((url) => !url.includes('q=dune'))).toBe(true);
  });
});

describe('getSources', () => {
  it('finds a book by ISBN and offers its acquisition links', async () => {
    const { addon } = transport();
    const result = await addon.getSources('book', 'isbn:9780441013593');
    expect(result.sources).toHaveLength(1);
    expect(result.sources[0]).toMatchObject({
      name: 'My Library',
      url: 'https://library.example/get/epub/1',
      format: 'EPUB',
    });
  });

  it('says nothing at all for a book the feed does not have', async () => {
    const { addon } = transport();
    await expect(addon.getSources('book', 'isbn:9780000000000')).resolves.toEqual({
      sources: [],
      dropped: 0,
    });
  });

  it('marks a purchase link as a page to visit rather than a file', async () => {
    const { addon } = transport();
    const result = await addon.getSources('book', 'opds:urn:book:2');
    expect(result.sources[0]?.behaviorHints?.externalPage).toBe(true);
  });

  it('does not offer a DRM licence file as though it were the book', async () => {
    const drm = FEED.replace(
      'href="/get/epub/1" type="application/epub+zip"',
      'href="/get/acsm/1" type="application/vnd.adobe.adept+xml"',
    );
    const { addon } = transport({ 'https://library.example/opds': drm });
    await expect(addon.getSources('book', 'isbn:9780441013593')).resolves.toMatchObject({
      sources: [],
    });
  });
});
