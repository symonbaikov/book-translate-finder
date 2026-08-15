import { describe, expect, it } from 'vitest';
import { AddonManifestError } from './errors.js';
import {
  ADDON_API_VERSION,
  addonSupports,
  findCatalog,
  parseAddonManifest,
  type AddonManifest,
} from './manifest.js';

/** A minimal manifest in the shape a Stremio author would recognise. */
function manifestFixture(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'example-books',
    version: '1.0.0',
    name: 'Example Books',
    apiVersion: ADDON_API_VERSION,
    resources: ['catalog', 'meta', 'source'],
    types: ['book'],
    catalogs: [
      { type: 'book', id: 'top', name: 'Top', extra: [{ name: 'search', isRequired: false }] },
    ],
    ...overrides,
  };
}

describe('parseAddonManifest', () => {
  it('accepts a manifest in the documented shape', () => {
    const manifest = parseAddonManifest(manifestFixture(), 'https://addon.example/manifest.json');
    expect(manifest.id).toBe('example-books');
    expect(manifest.catalogs).toHaveLength(1);
  });

  it('defaults catalogs to empty — an addon may answer only meta and source', () => {
    const manifest = parseAddonManifest(
      manifestFixture({ resources: ['meta', 'source'], catalogs: undefined }),
      'https://addon.example/manifest.json',
    );
    expect(manifest.catalogs).toEqual([]);
  });

  it('refuses another protocol version rather than guessing what it means', () => {
    expect(() =>
      parseAddonManifest(manifestFixture({ apiVersion: 2 }), 'https://addon.example/manifest.json'),
    ).toThrow(AddonManifestError);
  });

  it('names the offending field, because the message is shown to the reader deciding to install', () => {
    expect(() =>
      parseAddonManifest(
        manifestFixture({ id: 'Not A Slug' }),
        'https://addon.example/manifest.json',
      ),
    ).toThrow(/at "id"/);
  });

  it.each(['https://evil.example', '*.example.com', 'EXAMPLE.com', 'example.com/path'])(
    'refuses %s as a declared host — a permission the reader cannot evaluate is not consent',
    (host) => {
      expect(() =>
        parseAddonManifest(
          manifestFixture({ permissions: { hosts: [host] } }),
          'https://addon.example/manifest.json',
        ),
      ).toThrow(AddonManifestError);
    },
  );

  it('accepts a private address as a declared host — reaching one is why local addons exist', () => {
    const manifest = parseAddonManifest(
      manifestFixture({ permissions: { hosts: ['192.168.1.10', 'calibre.home.arpa'] } }),
      'https://addon.example/manifest.json',
    );
    expect(manifest.permissions?.hosts).toEqual(['192.168.1.10', 'calibre.home.arpa']);
  });

  /**
   * The blind core, asserted rather than described: a host `packages/domain` refuses for the
   * instance's own pipeline is an ordinary declaration here (ADR-0009).
   */
  it('does not judge which hosts an addon declares', () => {
    const manifest = parseAddonManifest(
      manifestFixture({ permissions: { hosts: ['libgen.rs'] } }),
      'https://addon.example/manifest.json',
    );
    expect(manifest.permissions?.hosts).toContain('libgen.rs');
  });
});

describe('addonSupports', () => {
  const manifest: AddonManifest = parseAddonManifest(
    manifestFixture({ idPrefixes: ['ol'] }),
    'https://addon.example/manifest.json',
  );

  it('is false for a resource the addon never claimed', () => {
    const metaOnly = parseAddonManifest(
      manifestFixture({ resources: ['meta'] }),
      'https://addon.example/manifest.json',
    );
    expect(addonSupports(metaOnly, 'catalog', 'book')).toBe(false);
  });

  it('is false for a type the addon never claimed', () => {
    expect(addonSupports(manifest, 'meta', 'audiobook')).toBe(false);
  });

  /**
   * The regression this test exists for: `idPrefixes` describes book ids, and a catalog id is not
   * one. Checking a catalog called `all` against `['ol']` made a perfectly good addon unaskable.
   */
  it('does not test a catalog id against the book id prefixes', () => {
    expect(addonSupports(manifest, 'catalog', 'book', 'all')).toBe(true);
    expect(addonSupports(manifest, 'catalog', 'book', 'anything-at-all')).toBe(true);
  });

  it('skips an addon whose declared prefixes cannot match the id', () => {
    expect(addonSupports(manifest, 'meta', 'book', 'ol:OL1W')).toBe(true);
    expect(addonSupports(manifest, 'meta', 'book', 'isbn:9780141439518')).toBe(false);
  });

  it('asks an addon that declared no prefixes at all', () => {
    const anyId = parseAddonManifest(manifestFixture(), 'https://addon.example/manifest.json');
    expect(addonSupports(anyId, 'meta', 'book', 'isbn:9780141439518')).toBe(true);
  });
});

describe('findCatalog', () => {
  const manifest = parseAddonManifest(manifestFixture(), 'https://addon.example/manifest.json');

  it('finds a catalog by type and id', () => {
    expect(findCatalog(manifest, 'book', 'top')?.name).toBe('Top');
  });

  it('returns null rather than throwing — an addon simply may not have it', () => {
    expect(findCatalog(manifest, 'book', 'missing')).toBeNull();
    expect(findCatalog(manifest, 'audiobook', 'top')).toBeNull();
  });
});
