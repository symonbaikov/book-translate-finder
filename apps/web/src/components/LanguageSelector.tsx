'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { LOCALE_COOKIE, LOCALE_NAMES, LOCALES, type Locale } from '../i18n/locales';
import { useLocale, useT } from '../i18n/I18nProvider';
import { writeCookie } from '../lib/cookies';
import { outcomeOfWrite } from '../lib/setting-change';
import { useSettingChangeToast } from '../lib/settings-toast';
import { tourTarget } from '../lib/tour-targets';
import { Select } from '../ui';
import styles from './LanguageSelector.module.css';

/** A year: long enough that a reader sets their language once and never thinks about it again. */
const COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

/**
 * Site language, in the header.
 *
 * The choice is written to a cookie rather than localStorage because half of this interface is
 * server-rendered — without the cookie the server would have no way to know, and every page would
 * arrive in English and then correct itself.
 */
export function LanguageSelector() {
  const locale = useLocale();
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const announce = useSettingChangeToast();

  function change(next: string): void {
    const persisted = writeCookie(LOCALE_COOKIE, next, COOKIE_MAX_AGE_SECONDS);
    // Named before the refresh, and in the language being left behind: this popup is rendered by
    // the dictionary that is on screen now, so it reads in the language the reader can still read
    // if they picked the wrong entry.
    announce({
      setting: 'interface-language',
      outcome: outcomeOfWrite(persisted, 'set'),
      title: t('settings.language.title'),
      detail: t('settings.language.changed', {
        from: LOCALE_NAMES[locale],
        to: LOCALE_NAMES[next as Locale] ?? next,
      }),
    });
    // `refresh` re-renders the server components with the new cookie in place; without it only
    // the client half of the page would change language.
    startTransition(() => router.refresh());
  }

  return (
    // The wrapper exists only so the onboarding tour has an element to highlight: `Select` takes a
    // fixed set of props and is not going to grow a pass-through for one caller's data attribute.
    <div {...tourTarget('navLanguage')} className={styles.anchor}>
      <Select
        size="compact"
        bare
        align="end"
        value={locale}
        onChange={change}
        disabled={pending}
        aria-label={t('nav.language')}
        className={styles.selector}
        options={LOCALES.map((code) => ({ value: code, label: LOCALE_NAMES[code] }))}
      />
    </div>
  );
}
