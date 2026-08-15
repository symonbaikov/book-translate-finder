'use client';

import { useEffect } from 'react';
import { BOOK_LANGUAGE_COOKIE, parseBookLanguage } from '../lib/book-language';
import { deleteCookie, readCookie, writeCookie } from '../lib/cookies';
import { languageName } from '../lib/language-names';
import { useLocale, useT } from '../i18n/I18nProvider';
import { outcomeOfWrite } from '../lib/setting-change';
import { useSettingChangeToast } from '../lib/settings-toast';

const COOKIE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

/**
 * Remembers the book language the reader filtered by, so the genre catalogue can honour it
 * without asking again.
 *
 * Renders nothing. It exists because the filter is a plain GET form — the honest, no-JavaScript
 * way to filter a server-rendered list — and a form cannot set a cookie. Clearing the filter
 * clears the memory too: a preference the reader just switched off must not come back.
 *
 * The popup fires only when the stored value actually moves. This component runs on every visit
 * to a work page, and announcing "book language: French" to someone who merely opened another
 * book would turn the notification into wallpaper.
 */
export function RememberBookLanguage({ language }: { language: string | null }) {
  const t = useT();
  const locale = useLocale();
  const announce = useSettingChangeToast();

  useEffect(() => {
    const next = parseBookLanguage(language ?? undefined) ?? null;
    const current = parseBookLanguage(readCookie(BOOK_LANGUAGE_COOKIE) ?? undefined) ?? null;
    if (next === current) return;

    const persisted = next
      ? writeCookie(BOOK_LANGUAGE_COOKIE, next, COOKIE_MAX_AGE_SECONDS)
      : deleteCookie(BOOK_LANGUAGE_COOKIE);

    announce({
      setting: 'book-language',
      outcome: outcomeOfWrite(persisted, next ? 'set' : 'clear'),
      title: t('settings.bookLanguage.title'),
      detail: next
        ? t('settings.bookLanguage.changed', { language: languageName(next, locale) })
        : t('settings.bookLanguage.cleared'),
    });
  }, [language, announce, t, locale]);

  return null;
}
