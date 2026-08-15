/**
 * Human-readable language names for ISO 639-1 codes via the platform's own `Intl.DisplayNames` —
 * no dependency on `packages/domain`'s LANGUAGE_NAMES (apps/web may only import `@golden/contracts`,
 * docs/architecture.md §2 boundaries) and no hand-maintained copy of the same table. Works
 * identically in Node (SSR) and the browser. Falls back to the raw code for anything the runtime
 * can't name, so an unexpected code degrades to exactly what the UI showed before this existed.
 *
 * Named *in the reader's language* when a locale is given: a page in Russian that lists a book's
 * translations as "Russian, German, French" is half-translated, and this is the one part of the
 * book data that can honestly be localized — a language's name is not a book's title (see
 * `i18n/README.md` on why titles never are).
 */
const cache = new Map<string, Intl.DisplayNames>();

function displayNamesFor(locale: string): Intl.DisplayNames {
  const existing = cache.get(locale);
  if (existing) return existing;
  const created = new Intl.DisplayNames([locale], { type: 'language' });
  cache.set(locale, created);
  return created;
}

export function languageName(code: string, locale = 'en'): string {
  try {
    return displayNamesFor(locale).of(code) ?? code;
  } catch {
    return code;
  }
}
