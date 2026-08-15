/**
 * When two sources disagree on a field's value for the same `work`/`edition` (matched by
 * natural key, docs/rules.md §2.2), this decides which value wins. Priority is per field
 * category, not global — Open Library is more reliable for language/edition metadata, but
 * Google Books tends to have better cover images (docs/architecture.md §5). Lives in domain
 * because it's a business rule, not a detail of how any one adapter happens to work.
 */
export type FieldCategory = 'metadata' | 'cover';

/**
 * The national library catalogues (`bnf`, `dnb`) are absent on purpose rather than ranked last:
 * they only ever contribute editions to a work another source identified, so they never hold an
 * opinion about a work's metadata for this to arbitrate. Wikidata is ranked below the two
 * bibliographic sources for both categories — it is the source that knows a book *exists*, not
 * the one that describes it best, and its `P18` image is as often a portrait of the author or a
 * photograph of a monument as it is a jacket.
 */
const SOURCE_PRIORITY: Readonly<Record<FieldCategory, readonly string[]>> = {
  metadata: ['open-library', 'google-books', 'wikidata'],
  cover: ['google-books', 'open-library', 'wikidata'],
};

export interface FieldCandidate<T> {
  source: string;
  value: T;
}

/**
 * Picks the value from the highest-priority source (for `category`) that actually supplied one.
 * A source not listed in the priority order is treated as lowest priority, in the order given,
 * rather than dropped — an unrecognized-but-present source's data still beats having none.
 * Returns `null` only when `candidates` is empty.
 */
export function resolveFieldConflict<T>(
  category: FieldCategory,
  candidates: ReadonlyArray<FieldCandidate<T>>,
): T | null {
  if (candidates.length === 0) return null;

  const priority = SOURCE_PRIORITY[category];
  for (const sourceName of priority) {
    const match = candidates.find((c) => c.source === sourceName);
    if (match) return match.value;
  }
  // None of the candidates came from a known-priority source — keep first-seen order rather
  // than silently dropping the data.
  return candidates[0]!.value;
}
