import { describe, expect, it } from 'vitest';
import { isDirectDownload } from './acquisition.js';
import { OpdsParseError } from './model.js';
import { parseOpds1 } from './parse-atom.js';

const FEED_URL = 'https://m.gutenberg.org/ebooks.opds/';

/**
 * Shaped after a real Project Gutenberg catalog page: a navigation entry, a publication entry with
 * two open-access formats, Dublin Core metadata under the `dcterms` prefix, a protocol-relative
 * cover URL and pagination.
 */
const GUTENBERG_FEED = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"
      xmlns:dcterms="http://purl.org/dc/terms/"
      xmlns:opds="http://opds-spec.org/2010/catalog">
  <id>https://m.gutenberg.org/ebooks.opds/</id>
  <title>Project Gutenberg</title>
  <updated>2026-08-01T00:00:00Z</updated>
  <link rel="self" href="/ebooks.opds/" type="application/atom+xml;profile=opds-catalog"/>
  <link rel="search" href="/ebooks/search.opds/" type="application/opensearchdescription+xml"/>
  <link rel="next" href="/ebooks.opds/?page=2" type="application/atom+xml;profile=opds-catalog"/>
  <entry>
    <title>Popular</title>
    <id>https://m.gutenberg.org/ebooks/search/?sort_order=downloads</id>
    <updated>2026-08-01T00:00:00Z</updated>
    <link type="application/atom+xml;profile=opds-catalog" href="/ebooks/search.opds/?sort_order=downloads"/>
  </entry>
  <entry>
    <title>Alice's Adventures in Wonderland</title>
    <id>urn:gutenberg:11</id>
    <updated>2026-01-02T03:04:05Z</updated>
    <author><name>Lewis Carroll</name></author>
    <summary>Down the rabbit hole.</summary>
    <dcterms:language>en</dcterms:language>
    <dcterms:issued>1865</dcterms:issued>
    <dcterms:publisher>Project Gutenberg</dcterms:publisher>
    <dcterms:identifier>urn:isbn:978-0-14-143976-1</dcterms:identifier>
    <category term="fantasy" label="Fantasy fiction"/>
    <link rel="http://opds-spec.org/image" href="//www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg" type="image/jpeg"/>
    <link rel="http://opds-spec.org/image/thumbnail" href="/cache/epub/11/pg11.cover.small.jpg" type="image/jpeg"/>
    <link rel="http://opds-spec.org/acquisition/open-access" href="/ebooks/11.epub.images" type="application/epub+zip" length="1234567"/>
    <link rel="http://opds-spec.org/acquisition/open-access" href="/ebooks/11.txt.utf-8" type="text/plain"/>
  </entry>
</feed>`;

/** A commercial catalog: a priced purchase, a loan that routes through another feed, and an ACSM. */
const COMMERCIAL_FEED = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:opds="http://opds-spec.org/2010/catalog">
  <id>urn:uuid:commercial</id>
  <title>A bookshop</title>
  <entry>
    <title>A Book For Sale</title>
    <id>urn:uuid:42</id>
    <link rel="http://opds-spec.org/acquisition/buy" href="/buy/42" type="application/epub+zip">
      <opds:price currencycode="usd">3.99</opds:price>
      <opds:indirectAcquisition type="application/vnd.adobe.adept+xml">
        <opds:indirectAcquisition type="application/epub+zip"/>
      </opds:indirectAcquisition>
    </link>
    <link rel="http://opds-spec.org/acquisition/borrow" href="/borrow/42" type="application/atom+xml;type=entry;profile=opds-catalog"/>
    <link rel="http://opds-spec.org/acquisition" href="/acsm/42" type="application/vnd.adobe.adept+xml"/>
  </entry>
</feed>`;

describe('parseOpds1', () => {
  const feed = parseOpds1(GUTENBERG_FEED, FEED_URL);

  it('reads the catalog envelope', () => {
    expect(feed.version).toBe('1.2');
    expect(feed.title).toBe('Project Gutenberg');
    expect(feed.updated).toBe('2026-08-01T00:00:00Z');
    expect(feed.feedUrl).toBe(FEED_URL);
  });

  it('resolves pagination and search links against the feed URL', () => {
    expect(feed.pagination.next).toBe('https://m.gutenberg.org/ebooks.opds/?page=2');
    expect(feed.pagination.previous).toBeNull();
    expect(feed.searchDescriptionUrl).toBe('https://m.gutenberg.org/ebooks/search.opds/');
  });

  it('keeps pagination out of the navigation list', () => {
    expect(feed.navigation.map((link) => link.rel)).not.toContain('next');
  });

  it('treats an entry that links only to another catalog as navigation, not a book', () => {
    const navigation = feed.entries[0];
    expect(navigation?.title).toBe('Popular');
    expect(navigation?.acquisitions).toHaveLength(0);
    expect(navigation?.navigationHref).toBe(
      'https://m.gutenberg.org/ebooks/search.opds/?sort_order=downloads',
    );
  });

  it('reads Dublin Core metadata regardless of the namespace prefix', () => {
    const book = feed.entries[1];
    expect(book?.title).toBe("Alice's Adventures in Wonderland");
    expect(book?.authors).toEqual(['Lewis Carroll']);
    expect(book?.language).toBe('en');
    expect(book?.publisher).toBe('Project Gutenberg');
    expect(book?.published).toBe('1865');
    expect(book?.categories).toEqual(['Fantasy fiction']);
  });

  it('extracts an ISBN-13 from a hyphenated urn identifier', () => {
    expect(feed.entries[1]?.isbn13).toBe('9780141439761');
  });

  it('resolves protocol-relative and root-relative image URLs', () => {
    expect(feed.entries[1]?.coverUrl).toBe(
      'https://www.gutenberg.org/cache/epub/11/pg11.cover.medium.jpg',
    );
    expect(feed.entries[1]?.thumbnailUrl).toBe(
      'https://m.gutenberg.org/cache/epub/11/pg11.cover.small.jpg',
    );
  });

  it('maps each acquisition link to a labelled format', () => {
    const acquisitions = feed.entries[1]?.acquisitions ?? [];
    expect(acquisitions).toHaveLength(2);
    expect(acquisitions[0]).toMatchObject({
      kind: 'open-access',
      href: 'https://m.gutenberg.org/ebooks/11.epub.images',
      format: 'epub',
      formatLabel: 'EPUB',
      sizeBytes: 1234567,
      requiresDrmApp: false,
    });
    expect(acquisitions[1]).toMatchObject({ format: 'txt', formatLabel: 'Plain text' });
    expect(acquisitions.every(isDirectDownload)).toBe(true);
  });
});

describe('parseOpds1 — acquisitions that are not plain downloads', () => {
  const entry = parseOpds1(COMMERCIAL_FEED, 'https://shop.example/opds').entries[0];

  it('reads the price and the indirect acquisition chain of a purchase', () => {
    const buy = entry?.acquisitions.find((acquisition) => acquisition.kind === 'buy');
    expect(buy?.price).toEqual({ amount: 3.99, currency: 'USD' });
    expect(buy?.indirectMediaTypes).toEqual([
      'application/vnd.adobe.adept+xml',
      'application/epub+zip',
    ]);
    expect(isDirectDownload(buy!)).toBe(false);
  });

  it('drops an acquisition link that points at another catalog document', () => {
    // The borrow link's media type is an OPDS entry, not a file — rendering it as a download
    // would promise the reader a book and hand them a feed.
    expect(entry?.acquisitions.map((acquisition) => acquisition.kind)).not.toContain('borrow');
  });

  it('flags a DRM licence as needing a separate application', () => {
    const acsm = entry?.acquisitions.find((acquisition) => acquisition.format === 'drm-license');
    expect(acsm?.requiresDrmApp).toBe(true);
    expect(acsm?.formatLabel).toBe('Adobe DRM licence');
    expect(isDirectDownload(acsm!)).toBe(false);
  });
});

describe('parseOpds1 — rejections', () => {
  it('rejects a document that is not a feed', () => {
    expect(() => parseOpds1('<html><body>Not OPDS</body></html>', FEED_URL)).toThrow(
      OpdsParseError,
    );
  });

  /**
   * Not an edge case: this is how Project Gutenberg's catalog is actually shaped. Its browse and
   * search pages list each book as a navigation entry pointing at that book's own entry document,
   * and the acquisition links exist only there — so rejecting these documents meant the shelf
   * could never reach a single download. Caught by walking the live catalog, not by a unit test.
   */
  it('reads a complete-entry document as a one-entry feed', () => {
    const entryDocument = `<?xml version="1.0"?>
<entry xmlns="http://www.w3.org/2005/Atom">
  <title>Ulysses</title>
  <id>urn:gutenberg:4300</id>
  <link rel="http://opds-spec.org/acquisition/open-access" href="/ebooks/4300.epub.images" type="application/epub+zip"/>
</entry>`;

    const feed = parseOpds1(entryDocument, FEED_URL);
    expect(feed.title).toBe('Ulysses');
    expect(feed.entries).toHaveLength(1);
    expect(feed.entries[0]?.acquisitions[0]).toMatchObject({ kind: 'open-access', format: 'epub' });
  });

  it('refuses to expand custom XML entities (billion laughs)', () => {
    const bomb = `<?xml version="1.0"?>
<!DOCTYPE feed [<!ENTITY a "aaaaaaaaaa"><!ENTITY b "&a;&a;&a;&a;&a;">]>
<feed xmlns="http://www.w3.org/2005/Atom"><title>&b;</title></feed>`;
    expect(() => parseOpds1(bomb, FEED_URL)).toThrow(/entities/i);
  });
});
