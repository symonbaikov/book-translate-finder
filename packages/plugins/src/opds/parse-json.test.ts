import { describe, expect, it } from 'vitest';
import { OpdsParseError } from './model.js';
import { parseOpds2 } from './parse-json.js';

const FEED_URL = 'https://kavita.example/api/opds/key/';

/**
 * Shaped after an OPDS 2.0 home feed: metadata in a schema.org-flavoured object, publications both
 * at the top level and inside a `group`, `author` in each of the three spellings the spec's own
 * examples use, and the price hanging off `links[].properties`.
 */
const FEED = {
  metadata: { title: 'My library', modified: '2026-08-01T00:00:00Z', identifier: 'urn:uuid:lib' },
  links: [
    { rel: 'self', href: './', type: 'application/opds+json' },
    { rel: ['next'], href: '?page=2', type: 'application/opds+json' },
    { rel: 'search', href: 'search', type: 'application/opensearchdescription+xml' },
  ],
  navigation: [
    { href: 'libraries', title: 'Libraries', type: 'application/opds+json', rel: 'subsection' },
  ],
  publications: [
    {
      metadata: {
        title: 'Dune',
        author: { name: 'Frank Herbert' },
        identifier: 'urn:isbn:9780441013593',
        language: 'en',
        publisher: 'Ace',
        published: '1965-08-01',
        subject: [{ name: 'Science fiction' }, 'Classics'],
        description: 'Arrakis.',
      },
      images: [
        { href: 'covers/1/full', type: 'image/jpeg', width: 1400 },
        { href: 'covers/1/thumb', type: 'image/jpeg', width: 200 },
      ],
      links: [
        {
          rel: 'http://opds-spec.org/acquisition/open-access',
          href: 'download/1',
          type: 'application/epub+zip',
          length: 900_000,
        },
        {
          rel: 'http://opds-spec.org/acquisition/buy',
          href: 'buy/1',
          type: 'application/epub+zip',
          properties: {
            price: { value: 9.5, currency: 'eur' },
            indirectAcquisition: [
              {
                type: 'application/vnd.readium.lcp.license.v1.0+json',
                child: [{ type: 'application/epub+zip' }],
              },
            ],
          },
        },
      ],
    },
  ],
  groups: [
    {
      metadata: { title: 'On deck' },
      navigation: [{ href: 'on-deck', title: 'More', type: 'application/opds+json' }],
      publications: [
        {
          metadata: { title: 'Piranesi', author: ['Susanna Clarke'], identifier: 'urn:uuid:pir' },
          links: [
            {
              rel: 'acquisition/open-access',
              href: 'download/2',
              type: 'application/pdf',
            },
          ],
        },
      ],
    },
  ],
};

describe('parseOpds2', () => {
  const feed = parseOpds2(FEED, FEED_URL);

  it('reads the catalog envelope', () => {
    expect(feed.version).toBe('2.0');
    expect(feed.title).toBe('My library');
    expect(feed.updated).toBe('2026-08-01T00:00:00Z');
  });

  it('resolves relative pagination and search links', () => {
    expect(feed.pagination.next).toBe('https://kavita.example/api/opds/key/?page=2');
    expect(feed.searchDescriptionUrl).toBe('https://kavita.example/api/opds/key/search');
  });

  it('folds group publications and navigation into the flat lists', () => {
    expect(feed.entries.map((entry) => entry.title)).toEqual(['Dune', 'Piranesi']);
    expect(feed.navigation.map((link) => link.title)).toEqual(['Libraries', 'More']);
  });

  it('reads contributors and subjects in every spelling the spec allows', () => {
    expect(feed.entries[0]?.authors).toEqual(['Frank Herbert']);
    expect(feed.entries[0]?.categories).toEqual(['Science fiction', 'Classics']);
    expect(feed.entries[1]?.authors).toEqual(['Susanna Clarke']);
  });

  it('extracts the ISBN and picks cover before thumbnail', () => {
    expect(feed.entries[0]?.isbn13).toBe('9780441013593');
    expect(feed.entries[0]?.coverUrl).toBe('https://kavita.example/api/opds/key/covers/1/full');
    expect(feed.entries[0]?.thumbnailUrl).toBe(
      'https://kavita.example/api/opds/key/covers/1/thumb',
    );
  });

  it('maps acquisitions, prices and the indirect chain', () => {
    const acquisitions = feed.entries[0]?.acquisitions ?? [];
    expect(acquisitions[0]).toMatchObject({
      kind: 'open-access',
      href: 'https://kavita.example/api/opds/key/download/1',
      format: 'epub',
      sizeBytes: 900_000,
      price: null,
    });
    expect(acquisitions[1]).toMatchObject({
      kind: 'buy',
      price: { amount: 9.5, currency: 'EUR' },
      indirectMediaTypes: ['application/vnd.readium.lcp.license.v1.0+json', 'application/epub+zip'],
    });
  });

  it('accepts the abbreviated acquisition rel some 2.0 generators emit', () => {
    expect(feed.entries[1]?.acquisitions[0]).toMatchObject({ kind: 'open-access', format: 'pdf' });
  });
});

describe('parseOpds2 — rejections', () => {
  it('rejects a non-object document', () => {
    expect(() => parseOpds2([], FEED_URL)).toThrow(OpdsParseError);
  });

  it('rejects JSON that has none of the OPDS 2.0 top-level members', () => {
    expect(() => parseOpds2({ hello: 'world' }, FEED_URL)).toThrow(/metadata\/publications/);
  });
});
