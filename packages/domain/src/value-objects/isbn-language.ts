/**
 * Best-effort language guess from an ISBN-13's registration group — the digits right after the
 * `978` GS1 prefix, which the International ISBN Agency assigns per country/language area. Exists
 * because a source can carry an edition's ISBN without ever tagging its language: found live —
 * every one of "Metro 2035"'s seven Spanish-market editions (`978-84-...`, publishers Booket and
 * Minotauro) has no `languages` field on Open Library at all, so all seven were silently dropped
 * by `SyncWorkFromSource.syncEdition` and the work showed zero editions despite the source
 * genuinely knowing about them.
 *
 * Deliberately narrow, not a full ISBN Agency range table: only registration groups where the
 * group names a single, unambiguous language are listed below. A group that covers more than one
 * language (India, the former Yugoslavia's successor states, ...) is left out rather than guessed
 * at — this is a fallback for an edition the source gave *no* language for at all (see the call
 * site), never a reason to override a language the source actually reported.
 *
 * Scoped to the classic `978` prefix only: `979` reuses these same group digits for entirely
 * different assignments (979-8 is US/Canada self-publishing, 979-10 is France, ...), which would
 * silently mismap under this table, so `979` ISBNs always return `null`.
 */
const ISBN_GROUP_LANGUAGE: ReadonlyMap<string, string> = new Map([
  ['0', 'en'],
  ['1', 'en'],
  ['2', 'fr'],
  ['3', 'de'],
  ['4', 'ja'],
  ['5', 'ru'],
  ['7', 'zh'],
  ['82', 'no'],
  ['83', 'pl'],
  ['84', 'es'],
  ['85', 'pt'],
  ['87', 'da'],
  ['88', 'it'],
  ['89', 'ko'],
  ['90', 'nl'],
  ['91', 'sv'],
  ['94', 'nl'],
]);

// Longer (2-digit) groups first: every 2-digit group above starts with 8 or 9, neither of which
// is itself a mapped 1-digit group, but checking longest-prefix-first keeps this correct if a
// shorter, conflicting group is ever added.
const GROUP_LENGTHS = [2, 1];

/** `isbn13` must already be a validated, digits-only ISBN-13 (see `Isbn.value`). */
export function inferLanguageFromIsbn(isbn13: string): string | null {
  if (!isbn13.startsWith('978')) return null;
  const rest = isbn13.slice(3);
  for (const length of GROUP_LENGTHS) {
    const language = ISBN_GROUP_LANGUAGE.get(rest.slice(0, length));
    if (language) return language;
  }
  return null;
}
