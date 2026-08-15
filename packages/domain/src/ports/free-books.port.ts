import type { WorkSearchHit } from './work-search.port.js';

export interface FreeBooksQuery {
  /**
   * Only books whose free copy is in this language. Absent means any language.
   *
   * Deliberately the language of the *free edition*, not of any edition the work happens to have:
   * this list exists to answer "what can I read right now", and a Russian reader is not helped by
   * a book that is free in English and merely also exists in Russian behind a paywall.
   */
  language?: string | undefined;
  limit: number;
  /** How many to skip — the catalogue pages through the same list the home page's row starts. */
  offset: number;
}

export interface FreeBookHit extends WorkSearchHit {
  /**
   * The formats the free copies actually come in (`epub`, `pdf`, …), deduplicated and sorted.
   *
   * Empty when the sources state none, which is common and not an error — a link to a public
   * domain reading page has no file format. The UI must therefore treat this as "unknown", never
   * as "no file".
   */
  formats: string[];
}

export interface FreeBooksResult {
  books: FreeBookHit[];
  /** How many works match in total, so a catalogue can say what a page is a page of. */
  total: number;
}

/**
 * The free shelf: works this instance can hand a reader directly.
 *
 * "Free" here is a free `download` or `listen` link — `SourceLink.isLegalFree`, which `LinkPolicy`
 * sets and the storage CHECK enforces, on a link type that actually gives the reader the work
 * (docs/legal-policy.md). The type test is not redundant: `isLegalFree` follows from rights status
 * alone, so a `borrow` link to a public domain scan carries it too, and a place in a library queue
 * is not what a page headed "free to read right now" promises.
 *
 * This port cannot widen either half: it filters on stored facts and nothing else, so a shelf
 * built from it can never contain a link the link policy would have refused.
 *
 * Separate from `SubjectBrowsePort` (docs/rules.md §1 ISP) — that one answers questions about
 * genre tags, this one about rights, and the two share no query shape.
 */
export interface FreeBooksPort {
  listFreeBooks(query: FreeBooksQuery): Promise<FreeBooksResult>;
}
