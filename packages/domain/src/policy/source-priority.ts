/**
 * When two sources disagree on a field's value for the same `work`/`edition` (matched by
 * natural key, docs/rules.md §2.2), this decides which value wins. Priority is per field
 * category, not global — Open Library is more reliable for language/edition metadata, but
 * Google Books tends to have better cover images (docs/architecture.md §5). Lives in domain
 * because it's a business rule, not a detail of how any one adapter happens to work.
 */
export type FieldCategory = 'metadata' | 'cover';

const SOURCE_PRIORITY: Readonly<Record<FieldCategory, readonly string[]>> = {
  metadata: ['open-library', 'google-books'],
  cover: ['google-books', 'open-library'],
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
