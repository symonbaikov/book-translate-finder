export interface SubjectWork {
  title: string;
  author: string;
  /**
   * How many editions the source knows of. The closest thing to a popularity signal that open
   * data actually provides — a book reprinted two hundred times is one people kept buying — and
   * it is a fact from the source rather than a ranking this project invented.
   */
  editionCount: number;
}

/**
 * A source that can answer "which books are in this genre".
 *
 * Separate from `BookMetadataProvider`, which answers "tell me about *this* book". Not every
 * source can do this: Gutenberg and LibriVox have no subject index worth the name. Open Library
 * does — `/subjects/{name}.json`, already ordered by edition count.
 */
export interface SubjectSourcePort {
  fetchWorksForSubject(subject: string, limit: number): Promise<SubjectWork[]>;
}
