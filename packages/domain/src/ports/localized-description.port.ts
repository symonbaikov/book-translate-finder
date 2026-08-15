export interface LocalizedDescriptionQuery {
  /**
   * The work's Open Library id (`OL267096W`). An *exact* identifier is the whole point: matching a
   * book to an article by title and author would mean guessing, and a confidently-shown blurb
   * about the wrong book is precisely the kind of invented data this project refuses elsewhere.
   */
  openLibraryWorkId: string;
  /** Two-letter code of the language the reader is reading the site in. */
  language: string;
}

export interface LocalizedDescription {
  text: string;
  /** Always the requested language — an adapter that cannot answer in it returns `null` instead. */
  language: string;
  /** For attribution in the UI; free-text descriptions are licensed, not public domain. */
  sourceName: string;
  sourceUrl: string;
}

/**
 * A source that can describe a book *in a given language*.
 *
 * Separate from `BookMetadataProvider`, which returns whatever single description its source
 * happens to hold — for Open Library and Google Books that is English regardless of who is
 * reading. Kept narrow (docs/rules.md §1 ISP): the only question is "describe this work in this
 * language", and an implementation that cannot answer says so with `null` rather than falling
 * back to another language on the caller's behalf.
 */
export interface LocalizedDescriptionPort {
  fetchDescription(query: LocalizedDescriptionQuery): Promise<LocalizedDescription | null>;
}
