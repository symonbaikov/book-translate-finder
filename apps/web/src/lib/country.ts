'use client';

/**
 * The reader's shopping country, kept in `localStorage` — no accounts, no cookies, no server-side
 * profile (the project has no user model, and a cookie would drag in consent-banner obligations
 * for a purely cosmetic preference). Country selection only decides which bookstores to offer;
 * nothing about it is sent anywhere except as a `?country=` query on the links request.
 */
const STORAGE_KEY = 'btf.country';

/** Countries with at least one bookstore — mirrors `supportedBookstoreCountries()` in the domain.
 * Duplicated deliberately: apps/web may only import `@btf/contracts` (docs/architecture.md §2
 * boundaries), and shipping this list through an API call for a static selector would be worse. */
export const COUNTRY_OPTIONS: readonly { code: string; name: string }[] = [
  { code: 'AU', name: 'Australia' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CA', name: 'Canada' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'JP', name: 'Japan' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'PL', name: 'Poland' },
  { code: 'RU', name: 'Russia' },
  { code: 'ES', name: 'Spain' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
];

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
