'use client';

/**
 * The reader's shopping country, kept in `localStorage` — no accounts, no cookies, no server-side
 * profile (the project has no user model, and a cookie would drag in consent-banner obligations
 * for a purely cosmetic preference). Country selection only decides which bookstores to offer;
 * nothing about it is sent anywhere except as a `?country=` query on the links request.
 */
const STORAGE_KEY = 'btf.country';

/**
 * Countries with at least one local bookstore — mirrors `supportedBookstoreCountries()` in the
 * domain. Duplicated deliberately: apps/web may only import `@btf/contracts`
 * (docs/architecture.md §2 boundaries), and shipping a static selector's contents through an API
 * call would be worse. Codes only — the names come from the platform's own `Intl.DisplayNames`,
 * so there is no hand-maintained country-name table to drift.
 *
 * Listing a country the catalog has no store for would be worse than omitting it: picking it
 * would silently give the same worldwide-only list as picking nothing, which reads as a bug.
 */
const COUNTRY_CODES: readonly string[] = [
  'AE',
  'AR',
  'AT',
  'AU',
  'BE',
  'BG',
  'BR',
  'CA',
  'CH',
  'CL',
  'CN',
  'CO',
  'CZ',
  'DE',
  'DK',
  'EE',
  'EG',
  'ES',
  'FI',
  'FR',
  'GB',
  'GR',
  'HU',
  'ID',
  'IE',
  'IN',
  'IT',
  'JP',
  'KR',
  'LT',
  'MX',
  'NL',
  'NO',
  'NZ',
  'PL',
  'PT',
  'RO',
  'RU',
  'SA',
  'SE',
  'SG',
  'SK',
  'TR',
  'TW',
  'UA',
  'US',
  'ZA',
];

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export const COUNTRY_OPTIONS: readonly { code: string; name: string }[] = COUNTRY_CODES.map(
  (code) => ({ code, name: safeRegionName(code) }),
).sort((a, b) => a.name.localeCompare(b.name, 'en'));

function safeRegionName(code: string): string {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export function readCountry(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Private-mode/blocked storage: degrade to "no country chosen" rather than breaking the page.
    return null;
  }
}

export function writeCountry(country: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (country) window.localStorage.setItem(STORAGE_KEY, country);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore — see readCountry */
  }
}

/** Fires when the country changes so every mounted links panel refetches without a page reload. */
export const COUNTRY_CHANGE_EVENT = 'btf:country-change';

export function broadcastCountryChange(country: string | null): void {
  writeCountry(country);
  window.dispatchEvent(new CustomEvent(COUNTRY_CHANGE_EVENT, { detail: country }));
}
