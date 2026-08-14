/**
 * The reader's preferred *book* language — distinct from the interface language.
 *
 * Someone reading the site in English may well be looking for books in Ukrainian, so conflating
 * the two would quietly filter away exactly what they came for. Stored in its own cookie, set
 * from the language filter on a work card, and honoured by the genre catalogue.
 *
 * Deliberately free of `next/headers`: this constant is read by a client component too, and one
 * server-only import here makes the whole module unbuildable on the client side.
 */
export const BOOK_LANGUAGE_COOKIE = 'btf.booklang';

/** Two-letter codes only — anything else came from a hand-edited cookie, not from the UI. */
export function parseBookLanguage(value: string | undefined): string | undefined {
  const normalized = value?.trim().toLowerCase();
  return normalized && /^[a-z]{2}$/.test(normalized) ? normalized : undefined;
}
