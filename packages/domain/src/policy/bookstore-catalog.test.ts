import { describe, expect, it } from 'vitest';
import {
  BOOKSTORES,
  bookstoresForCountry,
  supportedBookstoreCountries,
  WORLDWIDE,
} from './bookstore-catalog.js';
import { ProviderId } from '../value-objects/provider-id.js';

const ISBN = '9780140447934';

describe('bookstore catalog', () => {
  it('every store id is a valid ProviderId (it becomes a link provider)', () => {
    for (const store of BOOKSTORES) {
      expect(() => ProviderId.create(store.id)).not.toThrow();
    }
  });

  it('store ids are unique', () => {
    const ids = BOOKSTORES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every store builds an https URL containing the ISBN', () => {
    for (const store of BOOKSTORES) {
      const url = store.buildUrl(ISBN);
      expect(url.startsWith('https://'), `${store.id} must be https`).toBe(true);
      expect(url).toContain(ISBN);
      // Must parse as a real URL — a malformed template would otherwise reach the UI.
      expect(() => new URL(url)).not.toThrow();
    }
  });

  it('carries no affiliate/tracking parameters (docs/legal-policy.md I-5 disclosure rule)', () => {
    for (const store of BOOKSTORES) {
      const url = store.buildUrl(ISBN).toLowerCase();
      for (const marker of ['tag=', 'affiliate', 'utm_', 'partner', 'ref=as_']) {
        expect(url.includes(marker), `${store.id} must not carry ${marker}`).toBe(false);
      }
    }
  });
});

describe('bookstoresForCountry', () => {
  it("puts the country's own stores before the worldwide ones", () => {
    const stores = bookstoresForCountry('GB');
    const firstWorldwideIndex = stores.findIndex((s) => s.country === WORLDWIDE);
    const lastLocalIndex = stores.map((s) => s.country).lastIndexOf('GB');

    expect(lastLocalIndex).toBeGreaterThanOrEqual(0);
    expect(lastLocalIndex).toBeLessThan(firstWorldwideIndex);
  });

  it('returns only worldwide stores for an unknown country — a neutral default, not an error', () => {
    const stores = bookstoresForCountry('ZZ');
    expect(stores.length).toBeGreaterThan(0);
    expect(stores.every((s) => s.country === WORLDWIDE)).toBe(true);
  });

  it('returns only worldwide stores when no country is chosen', () => {
    expect(bookstoresForCountry(null).every((s) => s.country === WORLDWIDE)).toBe(true);
  });

  it('accepts a lowercase country code (the UI must not have to normalize)', () => {
    expect(bookstoresForCountry('de')).toEqual(bookstoresForCountry('DE'));
  });
});

describe('supportedBookstoreCountries', () => {
  it('lists every country that has a store, sorted, without WORLDWIDE', () => {
    const countries = supportedBookstoreCountries();

    expect(countries).toContain('GB');
    expect(countries).toContain('RU');
    expect(countries).not.toContain(WORLDWIDE);
    expect([...countries].sort()).toEqual(countries);
  });
});
