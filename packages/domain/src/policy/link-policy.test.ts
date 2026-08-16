import { describe, expect, it } from 'vitest';
import { ProviderId } from '../value-objects/provider-id.js';
import {
  assertLinkAllowed,
  ForbiddenSourceError,
  IllegalDownloadLinkError,
  ImplausiblePublicDomainClaimError,
  type LinkCandidate,
} from './link-policy.js';

const baseCandidate = (overrides: Partial<LinkCandidate> = {}): LinkCandidate => ({
  id: 'link-1',
  editionId: 'edition-1',
  type: 'download',
  url: 'https://www.gutenberg.org/ebooks/1342',
  provider: ProviderId.create('gutenberg'),
  rightsStatus: 'public_domain',
  verifiedAt: new Date('2026-01-01T00:00:00Z'),
  ...overrides,
});

describe('assertLinkAllowed — I-3 shadow libraries are never a source, regardless of link type', () => {
  it.each([
    'https://libgen.rs/book/12345',
    'https://LIBGEN.RS/book/12345', // case
    'https://download.libgen.rs/book/12345', // subdomain
    'https://annas-archive.org/md5/abc',
    'https://z-lib.io/book/1',
    'https://sci-hub.se/10.1000/xyz',
  ])('rejects a link hosted on a denylisted domain: %s', (url) => {
    expect(() =>
      assertLinkAllowed(baseCandidate({ url, type: 'buy', rightsStatus: 'copyrighted' })),
    ).toThrow(ForbiddenSourceError);
  });

  it('does not false-positive on an unrelated domain that merely contains a denylist fragment as a prefix', () => {
    // "libgenuine-authors.com" is not Library Genesis — a bare-fragment substring match would
    // wrongly block it; the real check is exact-or-proper-subdomain on the full registrable
    // domain (see the comment on DENYLIST_DOMAINS).
    expect(() =>
      assertLinkAllowed(
        baseCandidate({
          url: 'https://libgenuine-authors.com/book/1',
          type: 'buy',
          rightsStatus: 'copyrighted',
        }),
      ),
    ).not.toThrow();
  });

  it('checks only the host, not the full URL string — a query param mentioning a denylisted name does not trigger it', () => {
    expect(() =>
      assertLinkAllowed(
        baseCandidate({
          url: 'https://safe-retailer.example/redirect?to=libgen.rs',
          type: 'buy',
          rightsStatus: 'copyrighted',
        }),
      ),
    ).not.toThrow();
  });

  it('rejects a malformed URL rather than crashing', () => {
    expect(() => assertLinkAllowed(baseCandidate({ url: 'not a url' }))).toThrow();
  });
});

describe('assertLinkAllowed — I-1 download requires allowlisted provider + public status', () => {
  it('allows a download from an allowlisted provider with public_domain status', () => {
    const link = assertLinkAllowed(baseCandidate());
    expect(link.type).toBe('download');
    expect(link.isLegalFree).toBe(true);
  });

  it('allows a download with open_license status', () => {
    expect(() => assertLinkAllowed(baseCandidate({ rightsStatus: 'open_license' }))).not.toThrow();
  });

  it('rejects a download for a copyrighted edition even from an allowlisted provider', () => {
    expect(() => assertLinkAllowed(baseCandidate({ rightsStatus: 'copyrighted' }))).toThrow(
      IllegalDownloadLinkError,
    );
  });

  it('rejects a download when rights status is unknown — unknown is never treated as permission', () => {
    expect(() => assertLinkAllowed(baseCandidate({ rightsStatus: 'unknown' }))).toThrow(
      IllegalDownloadLinkError,
    );
  });

  it('rejects a download from a non-allowlisted provider even when status is public_domain', () => {
    expect(() =>
      assertLinkAllowed(
        baseCandidate({
          provider: ProviderId.create('some-random-site'),
          rightsStatus: 'public_domain',
        }),
      ),
    ).toThrow(IllegalDownloadLinkError);
  });

  it.each(['gutenberg', 'internet-archive', 'wikisource', 'standard-ebooks', 'gallica'])(
    'allows every allowlisted download provider: %s',
    (provider) => {
      expect(() =>
        assertLinkAllowed(baseCandidate({ provider: ProviderId.create(provider) })),
      ).not.toThrow();
    },
  );
});

describe('assertLinkAllowed — an access label is not a rights statement (ADR-0011)', () => {
  // The case that prompted the rule: a 2007 Tibetan translation of a 1997 novel, scanned and
  // hosted on archive.org, which Open Library's availability API reported as "full access". The
  // adapter turned that into public_domain and the card offered a free download of a book that is
  // very much in copyright.
  const modernOnInternetArchive = (overrides: Partial<LinkCandidate> = {}) =>
    baseCandidate({
      provider: ProviderId.create('internet-archive'),
      url: 'http://www.archive.org/stream/bdrc-W1KG14543',
      rightsStatus: 'public_domain',
      workFirstPublishedYear: 1997,
      verifiedAt: new Date('2026-08-15T00:00:00Z'),
      ...overrides,
    });

  it('rejects a public_domain download for a work young enough to still be in copyright', () => {
    expect(() => assertLinkAllowed(modernOnInternetArchive())).toThrow(
      ImplausiblePublicDomainClaimError,
    );
  });

  it.each(['download', 'listen'] as const)('applies to %s links alike', (type) => {
    expect(() => assertLinkAllowed(modernOnInternetArchive({ type }))).toThrow(
      ImplausiblePublicDomainClaimError,
    );
  });

  it('still allows the same host to claim public_domain for a genuinely old work', () => {
    expect(() =>
      assertLinkAllowed(modernOnInternetArchive({ workFirstPublishedYear: 1897 })),
    ).not.toThrow();
  });

  it('does not fire on a chartered public domain repository — Gutenberg states it about the work', () => {
    // Gutenberg carries modern public domain texts too (a 1970s government report, a recent
    // translation released into the public domain). Its whole corpus is the claim, not a label.
    expect(() =>
      assertLinkAllowed(
        modernOnInternetArchive({
          provider: ProviderId.create('gutenberg'),
          url: 'https://www.gutenberg.org/ebooks/1342',
        }),
      ),
    ).not.toThrow();
  });

  it('does not fire on open_license — a rights holder may licence a book published last year', () => {
    expect(() =>
      assertLinkAllowed(
        modernOnInternetArchive({ rightsStatus: 'open_license', workFirstPublishedYear: 2024 }),
      ),
    ).not.toThrow();
  });

  it('treats a missing year as no evidence rather than as grounds to refuse', () => {
    // Refusing every link whose source omitted the year would delete most of Project Gutenberg
    // to catch nothing: absence of data cuts both ways, and this rule only ever withholds.
    expect(() =>
      assertLinkAllowed(modernOnInternetArchive({ workFirstPublishedYear: null })),
    ).not.toThrow();

    // And the same when the field is absent altogether rather than explicitly null.
    const { workFirstPublishedYear: _omitted, ...withoutYear } = modernOnInternetArchive();
    expect(() => assertLinkAllowed(withoutYear)).not.toThrow();
  });

  it('moves with the clock rather than pinning a hardcoded year', () => {
    // A work published in 1935 is inside the window when checked in 2026 and outside it in 2031.
    const candidate = (verifiedAt: Date) =>
      modernOnInternetArchive({ workFirstPublishedYear: 1935, verifiedAt });

    expect(() => assertLinkAllowed(candidate(new Date('2026-08-15T00:00:00Z')))).toThrow(
      ImplausiblePublicDomainClaimError,
    );
    expect(() => assertLinkAllowed(candidate(new Date('2031-08-15T00:00:00Z')))).not.toThrow();
  });

  it('never gates buy or borrow — pointing at a library is legal whatever the status', () => {
    expect(() =>
      assertLinkAllowed(modernOnInternetArchive({ type: 'borrow', rightsStatus: 'copyrighted' })),
    ).not.toThrow();
  });
});

describe('assertLinkAllowed — I-2/I-4 buy/borrow links are not status-gated but always carry a status', () => {
  it.each(['buy', 'borrow'] as const)('allows a %s link for a copyrighted work', (type) => {
    const link = assertLinkAllowed(
      baseCandidate({
        type,
        provider: ProviderId.create('amazon'),
        url: 'https://amazon.com/dp/xyz',
        rightsStatus: 'copyrighted',
      }),
    );
    expect(link.rightsStatus).toBe('copyrighted');
    expect(link.isLegalFree).toBe(false);
  });

  it('every successfully created link has a non-empty rightsStatus', () => {
    const link = assertLinkAllowed(baseCandidate());
    expect(link.rightsStatus).toBeTruthy();
  });

  it('a buy/borrow link never sets isLegalFree unless the status actually says so', () => {
    const link = assertLinkAllowed(
      baseCandidate({
        type: 'borrow',
        provider: ProviderId.create('openlibrary'),
        url: 'https://openlibrary.org/borrow/1',
        rightsStatus: 'unknown',
      }),
    );
    expect(link.isLegalFree).toBe(false);
  });
});

describe('assertLinkAllowed — url_hash is always populated deterministically', () => {
  it('computes a stable hash from the URL', () => {
    const link = assertLinkAllowed(baseCandidate());
    expect(link.urlHash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('policy lists are change-controlled (docs/legal-policy.md §5)', () => {
  it('DOWNLOAD_ALLOWLIST and DENYLIST_DOMAINS match their known, reviewed contents', () => {
    // Changing this test is the trip-wire: any edit to the allow/deny lists must also touch
    // this assertion, forcing a deliberate review (and, per policy, a dedicated ADR) rather than
    // a silent change buried in an unrelated PR.
    const allowlistedProviders = [
      'gutenberg',
      'internet-archive',
      'wikisource',
      'standard-ebooks',
      'gallica',
    ];
    for (const provider of allowlistedProviders) {
      expect(() =>
        assertLinkAllowed(baseCandidate({ provider: ProviderId.create(provider) })),
      ).not.toThrow();
    }

    const denylistedDomains = [
      'libgen.rs',
      'libgen.is',
      'libgen.st',
      'libgen.gs',
      'libgen.li',
      'annas-archive.org',
      'annas-archive.se',
      'z-lib.io',
      'z-lib.gs',
      'zlibrary.to',
      '1lib.sk',
      'sci-hub.se',
      'sci-hub.ru',
      'sci-hub.st',
    ];
    for (const domain of denylistedDomains) {
      expect(() =>
        assertLinkAllowed(
          baseCandidate({ url: `https://${domain}/x`, type: 'buy', rightsStatus: 'copyrighted' }),
        ),
      ).toThrow(ForbiddenSourceError);
    }
  });
});

describe('assertLinkAllowed — Gallica is allowlisted but not chartered (ADR-0013)', () => {
  const gallicaCandidate = (overrides: Partial<LinkCandidate> = {}): LinkCandidate =>
    baseCandidate({
      provider: ProviderId.create('gallica'),
      url: 'https://gallica.bnf.fr/ark:/12148/bpt6k10733944',
      ...overrides,
    });

  it('allows a download of a work old enough for the BnF’s public domain claim to hold', () => {
    expect(() =>
      assertLinkAllowed(gallicaCandidate({ workFirstPublishedYear: 1865 })),
    ).not.toThrow();
  });

  it('still refuses a public domain claim about a work young enough to be in copyright', () => {
    // The point of leaving Gallica out of CHARTERED_PUBLIC_DOMAIN_PROVIDERS: its corpus is not
    // public domain by charter — it hosts in-copyright material under agreement too — so the
    // 95-year plausibility guard is not switched off merely because the source is a national
    // library. Gutenberg, whose whole corpus *is* public domain by charter, is exempt; Gallica
    // is not.
    expect(() => assertLinkAllowed(gallicaCandidate({ workFirstPublishedYear: 2015 }))).toThrow(
      ImplausiblePublicDomainClaimError,
    );
    expect(() =>
      assertLinkAllowed(
        baseCandidate({ provider: ProviderId.create('gutenberg'), workFirstPublishedYear: 2015 }),
      ),
    ).not.toThrow();
  });
});
