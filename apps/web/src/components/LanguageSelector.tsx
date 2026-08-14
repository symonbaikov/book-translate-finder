'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { LOCALE_COOKIE, LOCALE_NAMES, LOCALES } from '../i18n/locales';
import { useLocale, useT } from '../i18n/I18nProvider';

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

  function change(next: string): void {
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    // `refresh` re-renders the server components with the new cookie in place; without it only
    // the client half of the page would change language.
    startTransition(() => router.refresh());
  }

  return (
    <label className="language-selector">
      <span className="visually-hidden">{t('nav.language')}</span>
      <select
        value={locale}
        onChange={(event) => change(event.target.value)}
        disabled={pending}
        aria-label={t('nav.language')}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_NAMES[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
