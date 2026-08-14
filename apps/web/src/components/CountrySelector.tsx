'use client';

import { useEffect, useState } from 'react';
import { broadcastCountryChange, COUNTRY_OPTIONS, readCountry } from '../lib/country';
import { useT } from '../i18n/I18nProvider';

/**
 * Lets the reader pick the country they shop in, which decides which bookstores the link panels
 * offer. Renders nothing until mounted so the server-rendered HTML (which cannot know
 * `localStorage`) and the first client render agree — otherwise React hydration mismatches.
 */
export function CountrySelector() {
  const t = useT();
  const [country, setCountry] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCountry(readCountry());
    setMounted(true);
  }, []);

  function handleChange(value: string): void {
    const next = value || null;
    setCountry(next);
    broadcastCountryChange(next);
  }

  return (
    <div className="field" style={{ maxWidth: '18rem' }}>
      <label htmlFor="country-select">{t('country.label')}</label>
      <select
        id="country-select"
        value={mounted ? (country ?? '') : ''}
        onChange={(e) => handleChange(e.target.value)}
      >
        <option value="">{t('country.worldwideOnly')}</option>
        {COUNTRY_OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
