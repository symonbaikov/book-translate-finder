// Strip combining marks (NFKD's decomposition of an accented letter into base + mark) only when
// they follow a plain ASCII Latin letter — e.g. "é" (NFKD: "e" + acute) → "e". A blanket strip of
// every \p{Mn} mark is WRONG: NFKD also decomposes letters that are not "a base letter plus a
// decoration" in other scripts, e.g. Cyrillic "й" decomposes into "и" + combining breve, and a
// blanket strip would corrupt it into "и" — a different letter, not the same one without an
// accent. Restricting the strip to Latin bases avoids that.
const LATIN_DIACRITIC_PATTERN = /([A-Za-z])\p{Mn}+/gu;
const APOSTROPHE_PATTERN = /['’ʼ´`]/g;
const NON_WORD_PATTERN = /[^\p{L}\p{N}\s]/gu;
const WHITESPACE_PATTERN = /\s+/g;

/**
 * The single most idempotency-critical function in the project (docs/rules.md §2.2): its output
 * feeds directly into `work.natural_key` and `edition.natural_key`. Changing this function
 * changes every natural key it has ever produced — never edit it without a migration plan to
 * recompute existing keys.
 *
 * Pipeline: Unicode-decompose, strip Latin-script diacritics (`Zafón` → `zafon`) while leaving
 * other scripts' letters intact, re-compose (NFC) so untouched decomposed sequences like
 * Cyrillic "й" return to their single-codepoint form, lowercase, drop apostrophes without
 * introducing a word break (`Alice's` → `alices`, matching how the same title without an
 * apostrophe would normalize), replace all other punctuation with a space, collapse whitespace.
 *
 * Deliberately does NOT attempt cross-script transliteration (Cyrillic/Greek/etc. → Latin) —
 * that would let the same conceptual title in different scripts collide onto one natural key,
 * which is a real product question (do "Война и мир" and a Latin-transliterated variant refer to
 * the same `work`?) but a much larger one, out of scope for Phase 1.1. Titles keep their
 * original script; this only normalizes case, diacritics, and punctuation within that script.
 */
export function normalizeText(input: string): string {
  return input
    .normalize('NFKD')
    .replace(LATIN_DIACRITIC_PATTERN, '$1')
    .normalize('NFC')
    .toLowerCase()
    .replace(APOSTROPHE_PATTERN, '')
    .replace(NON_WORD_PATTERN, ' ')
    .replace(WHITESPACE_PATTERN, ' ')
    .trim();
}
