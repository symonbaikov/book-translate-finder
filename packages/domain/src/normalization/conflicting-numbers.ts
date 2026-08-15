const NUMBER_PATTERN = /\d+/g;

function numberTokens(text: string): Set<string> {
  return new Set(text.match(NUMBER_PATTERN) ?? []);
}

/**
 * True when both `query` and `candidate` contain a number (a year, a volume, a sequel number)
 * and none of the query's numbers appear anywhere in the candidate's.
 *
 * Exists because trigram similarity barely penalizes swapping one digit in an otherwise identical
 * string: «Metro 2035» (a real, different novel, not yet in this instance's database) matched the
 * already-synced «Metro 2033» edition title at 0.69 similarity — comfortably over
 * `CONFIDENT_MATCH_RANK` — purely because the two strings differ in one character out of ten. The
 * search then answered with the wrong book and, being "confident", never asked the sources about
 * the one actually requested. A shared title with a conflicting number is exactly the shape a
 * sequel/prequel/edition-year mismatch takes, so it downgrades a match to non-confident (still
 * shown — it may be the closest known answer — but the sources get asked too; see
 * `SearchWorks.execute`) regardless of how high the trigram rank scored.
 *
 * A query or candidate with no number at all is never treated as conflicting — this signal exists
 * to catch a specific, sharply wrong kind of confidence, not to second-guess ordinary fuzzy title
 * matches that never had a number to disagree about.
 */
export function hasConflictingNumbers(query: string, candidate: string): boolean {
  const queryNumbers = numberTokens(query);
  if (queryNumbers.size === 0) return false;
  const candidateNumbers = numberTokens(candidate);
  if (candidateNumbers.size === 0) return false;

  for (const number of queryNumbers) {
    if (candidateNumbers.has(number)) return false;
  }
  return true;
}
