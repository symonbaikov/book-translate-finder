'use client';

import { useEffect, useState } from 'react';
import { broadcastCountryChange, COUNTRY_OPTIONS, readCountry } from '../lib/country';
import { useT } from '../i18n/I18nProvider';
import { outcomeOfWrite } from '../lib/setting-change';
import { useSettingChangeToast } from '../lib/settings-toast';
import { Field, Select } from '../ui';
import styles from './CountrySelector.module.css';

/**
 * Lets the reader pick the country they shop in, which decides which bookstores the link panels
 * offer. Renders nothing until mounted so the server-rendered HTML (which cannot know
 * `localStorage`) and the first client render agree — otherwise React hydration mismatches.
 */
export function CountrySelector() {
  const t = useT();
  const [country, setCountry] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const announce = useSettingChangeToast();

  useEffect(() => {
    setCountry(readCountry());
    setMounted(true);
  }, []);

  function handleChange(value: string): void {
    const next = value || null;
    setCountry(next);
    const persisted = broadcastCountryChange(next);
    // The panels below refetch by re-reading storage, so a refused write leaves them on the old
    // country. Snapping the select back to what is really in force keeps the page telling one
    // story — a box reading "France" above worldwide-only links is the worse failure.
    if (!persisted) setCountry(readCountry());
    // Worth spelling out because the effect is invisible from here: the links panels further
    // down the page have just refetched, and the reader may not be looking at them.
    announce({
      setting: 'shopping-country',
      outcome: outcomeOfWrite(persisted, next ? 'set' : 'clear'),
      title: t('settings.country.title'),
      detail: next
        ? t('settings.country.changed', {
            country: COUNTRY_OPTIONS.find((option) => option.code === next)?.name ?? next,
          })
        : t('settings.country.cleared'),
    });
  }

  return (
    <Field label={t('country.label')} htmlFor="country-select" className={styles.field}>
      <Select
        id="country-select"
        block
        value={mounted ? (country ?? '') : ''}
        onChange={handleChange}
        options={[
          { value: '', label: t('country.worldwideOnly') },
          ...COUNTRY_OPTIONS.map((option) => ({ value: option.code, label: option.name })),
        ]}
      />
    </Field>
  );
}
