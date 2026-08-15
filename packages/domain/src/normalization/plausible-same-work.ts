import { hasConflictingNumbers } from './conflicting-numbers.js';
import { normalizeText } from './normalize-text.js';
import { romanizeCyrillicQuery } from './romanize-query.js';

/** The book somebody already knows they are looking at. */
export interface KnownWorkIdentity {
  title: string;
  author: string;
}

/** What a source came back with when asked about it. */
export interface CandidateWorkIdentity {
  title: string;
  authorNames: readonly string[];
}

/** Latin letters and digits only — see `authorTokens` on why anything else is not a token here. */
const COMPARABLE_TOKEN = /^[a-z0-9]+$/;

/**
 * Author name tokens, comparable across the two spellings the same person gets in book catalogues:
 * "Stephen King" and "King, Stephen" reduce to the same set, and a Cyrillic name is romanized first
 * so «Водолазкин» can meet "Vodolazkin".
 *
 * Single characters are dropped. Initials are the one part of a name that collides constantly —
 * "J. K. Rowling" and "J. R. R. Tolkien" share two of them — and treating that as agreement would
 * make the check pass exactly when it matters least.
 *
 * Only tokens that came out in the Latin script are kept, and this is what makes the check abstain
 * rather than misfire on scripts it cannot bridge. «川端康成» normalizes to one perfectly good token
 * that simply has nothing in common with "Kawabata" — not because they are different people, but
 * because nothing here transliterates Japanese. Returning it would turn "cannot compare" into
 * "does not match", which is the wrong answer to give about a real book.
 */
function authorTokens(name: string): Set<string> {
  const romanized = romanizeCyrillicQuery(name) ?? name;
  return new Set(
    normalizeText(romanized)
      .split(' ')
      .filter((token) => token.length > 1 && COMPARABLE_TOKEN.test(token)),
  );
}

/**
 * How many leading characters two long surnames must share to be treated as the same name when
 * they are too far apart for the single-edit rule.
 *
 * Transliteration diverges at the *end* of a Slavic surname and agrees at the front: this project's
 * romanization writes «Глуховский» as "glukhovskii" while catalogues write "Glukhovsky" — two
 * edits apart, nine characters identical. Measured on «Метро 2033», whose enrichment this rejected
 * outright before the rule existed. Six characters is short enough to catch that family of endings
 * and long enough that two unrelated surnames rarely reach it.
 */
const SHARED_PREFIX_FOR_AGREEMENT = 6;

function sharedPrefixLength(a: string, b: string): number {
  const limit = Math.min(a.length, b.length);
  let shared = 0;
  while (shared < limit && a[shared] === b[shared]) shared += 1;
  return shared;
}

/**
 * Whether two name tokens are the same name, allowing for the way surnames survive being carried
 * between catalogues in different languages: "Tolstoy" is filed in France as "Tolstoï", Dostoyevsky
 * loses a letter about as often as he keeps it, and requiring character-for-character equality
 * would reject the cross-language matches this project exists to make.
 *
 * One edit, and only for tokens long enough that one edit is a spelling variant rather than a
 * different word — "king" and "ring" are four letters and one edit apart, and nothing about them
 * suggests the same person. Beyond one edit, a long shared prefix stands in, for the transliterated
 * endings that a single edit cannot reach.
 */
function tokensAgree(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 5 || b.length < 5) return false;
  if (sharedPrefixLength(a, b) >= SHARED_PREFIX_FOR_AGREEMENT) return true;
  if (Math.abs(a.length - b.length) > 1) return false;

  // Levenshtein distance, bailing out as soon as it exceeds one — the only answer this needs.
  let edits = 0;
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length === b.length) {
      i += 1;
      j += 1;
    } else if (a.length > b.length) {
      i += 1;
    } else {
      j += 1;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/**
 * Whether a source's answer can plausibly be about the work the caller already identified.
 *
 * This is a guard against a source answering about a *different book*, not record linkage. It is
 * deliberately permissive: it looks for a reason to say no, and says yes otherwise.
 *
 * **Why the author and not the title.** This project's whole subject is the same book under
 * different names — «Het Achterhuis» and "The Diary of a Young Girl" are one work, and any rule
 * requiring titles to resemble each other would reject precisely the translations the product
 * exists to find. Authors survive translation; titles do not.
 *
 * The case that prompted it: enriching Stephen King's *It* asked Project Gutenberg for "It Stephen
 * King", and Gutendex's full-text search answered with *The Diary of a U-boat Commander*. Nothing
 * downstream questioned it, so an unrelated public domain book became an edition of *It* — with a
 * free download button on a novel that is very much in copyright. Every individual fact in that
 * chain was true; only the identity was wrong.
 *
 * **What it cannot do.** Two names in scripts it cannot bring together — a Japanese author name
 * against a Latin one — yield no comparable tokens, and the check then declines to object rather
 * than guessing. Romanization covers Cyrillic, which is where this product's cross-script traffic
 * actually is; anything beyond that is an open limitation, not a solved problem.
 */
export function isPlausibleSameWork(
  known: KnownWorkIdentity,
  candidate: CandidateWorkIdentity,
): boolean {
  const knownAuthors = authorTokens(known.author);
  const candidateAuthors = new Set(
    candidate.authorNames.flatMap((name) => [...authorTokens(name)]),
  );

  // Neither side usable — an unnamed author, or scripts this cannot compare. No opinion.
  if (knownAuthors.size > 0 && candidateAuthors.size > 0) {
    const shared = [...knownAuthors].some((known) =>
      [...candidateAuthors].some((other) => tokensAgree(known, other)),
    );
    if (!shared) return false;
  }

  // Same author, but a title whose numbers disagree: «Metro 2033» is not «Metro 2035», and one
  // author's sequels are the likeliest place for a source to hand back the wrong volume.
  if (hasConflictingNumbers(known.title, candidate.title)) return false;

  return true;
}
