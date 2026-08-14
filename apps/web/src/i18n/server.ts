import { cookies } from 'next/headers';
import { makeTranslate, type Dictionary, type Translate } from './dictionary';
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from './locales';
import { loadDictionary } from './load-dictionary';

/**
 * The locale for a server-rendered page, read from the cookie the selector sets.
 *
 * Reading `cookies()` opts the route out of static rendering, which is the deliberate trade:
 * these pages are already per-request (they fetch a work from the API), and the alternative —
 * rendering English and correcting it on the client — makes every page flash the wrong language.
 */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getDictionary(): Promise<{ locale: Locale; dictionary: Dictionary }> {
  const locale = await getLocale();
  return { locale, dictionary: await loadDictionary(locale) };
}

export async function getT(): Promise<Translate> {
  return makeTranslate((await getDictionary()).dictionary);
}
