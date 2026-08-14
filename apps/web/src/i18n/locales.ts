/**
 * The languages the interface is actually available in.
 *
 * Deliberately only the ones with a real, complete dictionary. Listing every language of the
 * world and silently falling back to English for most of them would be the same kind of empty
 * promise this project refuses everywhere else — a reader picking Bengali and getting an English
 * page has been misled, not served.
 *
 * Adding one is a single file in `dictionaries/` plus a line here: no build step, no service, no
 * key. See `apps/web/src/i18n/README.md`.
 */
export const LOCALES = [
  'en',
  'ru',
  'uk',
  'de',
  'fr',
  'es',
  'pt',
  'it',
  'nl',
  'pl',
  'tr',
  'ar',
  'ja',
  'zh',
  'ko',
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Right-to-left scripts, so the page can set `dir` correctly. */
const RTL_LOCALES: ReadonlySet<string> = new Set(['ar', 'he', 'fa', 'ur']);

export function isRtl(locale: string): boolean {
  return RTL_LOCALES.has(locale);
}

export function isLocale(value: string | undefined | null): value is Locale {
  return value !== undefined && value !== null && (LOCALES as readonly string[]).includes(value);
}

/** Each language named in itself — a reader looking for their language reads it in their language. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  uk: 'Українська',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
  it: 'Italiano',
  nl: 'Nederlands',
  pl: 'Polski',
  tr: 'Türkçe',
  ar: 'العربية',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
};

/** Cookie rather than localStorage: server components render half this UI and must know the
 * language before the first paint, or every page would flash English first. */
export const LOCALE_COOKIE = 'btf.lang';
