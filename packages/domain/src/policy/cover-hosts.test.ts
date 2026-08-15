import { describe, expect, it } from 'vitest';
import { assertCoverHostsWellFormed, coverSourceUrl, isAllowedCoverHost } from './cover-hosts.js';

describe('cover host allowlist', () => {
  it('accepts the hosts this project actually gets covers from', () => {
    expect(isAllowedCoverHost('covers.openlibrary.org')).toBe(true);
    expect(isAllowedCoverHost('COVERS.OPENLIBRARY.ORG')).toBe(true);
    expect(isAllowedCoverHost('upload.wikimedia.org')).toBe(true);
  });

  it('accepts the per-request Internet Archive node a cover redirect lands on', () => {
    // `covers.openlibrary.org` answers 302 to archive.org, which answers 302 to whichever node
    // holds the zip — the number is assigned per request, so it cannot be listed literally.
    expect(isAllowedCoverHost('ia902809.us.archive.org')).toBe(true);
    expect(isAllowedCoverHost('ia600123.us.archive.org')).toBe(true);
  });

  it('refuses a host that merely ends with an allowed one', () => {
    // The attack this exists for: an endpoint that fetches whatever it is given is an open proxy,
    // and `covers.openlibrary.org.example.com` is a host somebody else controls.
    expect(isAllowedCoverHost('covers.openlibrary.org.example.com')).toBe(false);
    expect(isAllowedCoverHost('evil-covers.openlibrary.org')).toBe(false);
    expect(isAllowedCoverHost('notarchive.org')).toBe(false);
  });

  it('refuses the addresses that make an open proxy dangerous', () => {
    expect(coverSourceUrl('https://localhost/secret')).toBeNull();
    expect(coverSourceUrl('https://127.0.0.1/secret')).toBeNull();
    expect(coverSourceUrl('https://169.254.169.254/latest/meta-data/')).toBeNull();
    expect(coverSourceUrl('https://192.168.1.10:8083/opds')).toBeNull();
  });

  it('refuses anything that is not https', () => {
    expect(coverSourceUrl('http://covers.openlibrary.org/b/id/1-L.jpg')).toBeNull();
    expect(coverSourceUrl('file:///etc/passwd')).toBeNull();
    expect(coverSourceUrl('data:image/png;base64,AAAA')).toBeNull();
    expect(coverSourceUrl('not a url at all')).toBeNull();
  });

  it('returns the parsed url for an allowed source', () => {
    const url = coverSourceUrl('https://covers.openlibrary.org/b/id/8443266-L.jpg');
    expect(url?.hostname).toBe('covers.openlibrary.org');
    expect(url?.pathname).toBe('/b/id/8443266-L.jpg');
  });

  it('keeps the allowlist to bare hostnames', () => {
    expect(() => assertCoverHostsWellFormed()).not.toThrow();
  });
});
