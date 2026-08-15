import { describe, expect, it } from 'vitest';
import { BUILT_IN_OPDS_FEEDS, createCustomFeedPlugin } from './feed-catalog.js';
import { OpdsFetchError, assertFetchableFeedUrl } from './opds-client.js';

describe('a reader-supplied feed URL', () => {
  it('accepts a private-network address — that is the point of client-side feeds', () => {
    expect(assertFetchableFeedUrl('http://192.168.1.10:8083/opds').hostname).toBe('192.168.1.10');
  });

  it('is refused only for being unfetchable, never for what it points at', () => {
    expect(() => assertFetchableFeedUrl('file:///etc/passwd')).toThrow(OpdsFetchError);
    expect(() => assertFetchableFeedUrl('not a url')).toThrow(OpdsFetchError);
  });

  /**
   * The counterpart of the removed denylist, kept as a test so the change stays deliberate: after
   * ADR-0009 this module asks whether a URL can be fetched, not whether the catalog behind it is
   * one this project would have shipped. The domain policy still refuses these hosts for
   * everything the server itself does — see packages/domain/src/policy/link-policy.ts, whose
   * snapshot test is untouched.
   */
  it('no longer judges the host — that boundary moved to the instance side (ADR-0009)', () => {
    expect(assertFetchableFeedUrl('https://libgen.rs/opds').hostname).toBe('libgen.rs');
    expect(() =>
      createCustomFeedPlugin({ id: 'x', name: 'x', url: 'https://z-lib.io/opds' }),
    ).not.toThrow();
  });
});

describe('createCustomFeedPlugin', () => {
  it('describes a reader-added catalog as user-hosted and client-only', () => {
    const plugin = createCustomFeedPlugin({
      id: 'my-calibre',
      name: 'My Calibre',
      url: 'http://calibre.local:8083/opds',
    });
    expect(plugin.manifest).toMatchObject({
      kind: 'opds-feed',
      accessMode: 'user-hosted',
      runtime: 'client',
    });
    expect(plugin.credentials).toBeUndefined();
  });

  it('refuses an address the browser could not fetch at all', () => {
    expect(() =>
      createCustomFeedPlugin({ id: 'x', name: 'x', url: 'ftp://example.org/opds' }),
    ).toThrow(OpdsFetchError);
  });
});

describe('BUILT_IN_OPDS_FEEDS', () => {
  /**
   * A snapshot in the spirit of docs/legal-policy.md §2.3: the shipped catalogs are a legal
   * decision, so adding one has to be a deliberate edit that breaks this test, not a quiet commit.
   */
  it('ships only allowlisted public domain catalogs', () => {
    expect(BUILT_IN_OPDS_FEEDS.map((feed) => feed.manifest.id)).toEqual(['gutenberg']);
  });

  it('points every built-in feed at a fetchable https or http URL', () => {
    for (const feed of BUILT_IN_OPDS_FEEDS) {
      expect(() => assertFetchableFeedUrl(feed.url)).not.toThrow();
    }
  });
});
