/**
 * Cyrillic → Latin romanization for SEARCH QUERIES only. Open Library stores Russian editions
 * under romanized titles ("Voina i mir", "Voĭna i mir"), so a Cyrillic query shares zero
 * trigrams with them and silently finds nothing (found live in Phase 3 while verifying
 * any-language input). Romanizing the query as a fallback search arm bridges that.
 *
 * Deliberately NOT part of `normalizeText()` in the domain: that function feeds natural keys,
 * and its doc comment explicitly rules out cross-script transliteration there (same conceptual
 * title in two scripts must NOT collide onto one natural key). A query-side romanization has no
 * such identity implications — it only widens what a search can find.
 *
 * The mapping is a practical BGN/PCGN-flavored one, close to how Open Library romanizes; exact
 * ALA-LC (with diacritics like "ĭ") is unnecessary — trigram similarity absorbs the difference.
 */
const CYRILLIC_TO_LATIN: Readonly<Record<string, string>> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
  // Ukrainian / Belarusian extras that appear in book titles.
  є: 'ye',
  і: 'i',
  ї: 'yi',
  ґ: 'g',
  ў: 'u',
};

const HAS_CYRILLIC = /[Ѐ-ӿ]/;

/**
 * Returns the romanized form of `query`, or `null` when the query contains no Cyrillic (nothing
 * to romanize — the caller should skip the fallback pass entirely).
 */
export function romanizeCyrillicQuery(query: string): string | null {
  if (!HAS_CYRILLIC.test(query)) return null;

  let out = '';
  for (const char of query) {
    const lower = char.toLowerCase();
    const mapped = CYRILLIC_TO_LATIN[lower];
    if (mapped === undefined) {
      out += char;
      continue;
    }
    // Preserve capitalization of the first mapped letter ("Война" → "Voina", not "voina").
    out += char === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1);
  }
  return out;
}
