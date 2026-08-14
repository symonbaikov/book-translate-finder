'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { makeTranslate, type Dictionary, type Translate } from './dictionary';
import { DEFAULT_LOCALE, type Locale } from './locales';
import { en } from './dictionaries/en';

interface I18nValue {
  locale: Locale;
  t: Translate;
}

const I18nContext = createContext<I18nValue>({
  locale: DEFAULT_LOCALE,
  t: makeTranslate(en),
});

/** Client components read the same dictionary the server rendered with — one language per page. */
export function useT(): Translate {
  return useContext(I18nContext).t;
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, t: makeTranslate(dictionary) }}>
      {children}
    </I18nContext.Provider>
  );
}
