'use client';

import { useEffect } from 'react';
import { BOOK_LANGUAGE_COOKIE } from '../lib/book-language';

const COOKIE_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

/**
 * Remembers the book language the reader filtered by, so the genre catalogue can honour it
 * without asking again.
 *
 * Renders nothing. It exists because the filter is a plain GET form — the honest, no-JavaScript
 * way to filter a server-rendered list — and a form cannot set a cookie. Clearing the filter
 * clears the memory too: a preference the reader just switched off must not come back.
 */
export function RememberBookLanguage({ language }: { language: string | null }) {
  useEffect(() => {
    const value = language && /^[a-z]{2}$/i.test(language) ? language.toLowerCase() : '';
    document.cookie = value
      ? `${BOOK_LANGUAGE_COOKIE}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
      : `${BOOK_LANGUAGE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }, [language]);

  return null;
}
