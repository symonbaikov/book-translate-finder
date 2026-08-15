/**
 * The Open Library subject heading that means "literature written in this language".
 *
 * **Why this exists.** A reader who switches the site to Russian is telling us something about the
 * books they want, not only about the labels on the buttons. The curated home-page catalogue
 * (`featured-books-catalog.ts`) is Anglophone by construction, so on its own it answers that with
 * a wall of English novels.
 *
 * **Why not a language filter instead.** Open Library can be asked for works with an edition in a
 * language — `search.json?q=language:rus&sort=editions` — and the answer is the Bible, *Pride and
 * Prejudice* and *Alice in Wonderland*: books translated *into* Russian, ordered by how often
 * anyone anywhere reprinted them. That is not "books in Russian", it is "world classics that also
 * exist in Russian", and it is the exact list the reader was already complaining about.
 * `/subjects/russian_literature.json` answers the actual question — *Анна Каренина*,
 * *Преступление и наказание* — because it is a classification of the work, not of one edition.
 *
 * **What it is not.** Not a claim that these headings are a taxonomy: they are contributor-written
 * strings, like every other subject in this project (see `Work.subjects`). A language missing from
 * this map simply gets no such section, which is why every entry here was checked live against
 * Open Library's own work counts rather than guessed from the pattern.
 */
export const LITERATURE_SUBJECT_BY_LANGUAGE: Readonly<Record<string, string>> = {
  ar: 'Arabic literature',
  de: 'German literature',
  en: 'English literature',
  es: 'Spanish literature',
  fr: 'French literature',
  it: 'Italian literature',
  ja: 'Japanese literature',
  ko: 'Korean literature',
  nl: 'Dutch literature',
  pl: 'Polish literature',
  pt: 'Portuguese literature',
  ru: 'Russian literature',
  tr: 'Turkish literature',
  uk: 'Ukrainian literature',
  zh: 'Chinese literature',
};

/** The heading for a language, or `null` when this project has no verified one for it. */
export function literatureSubjectFor(language: string | undefined | null): string | null {
  if (!language) return null;
  return LITERATURE_SUBJECT_BY_LANGUAGE[language.trim().toLowerCase()] ?? null;
}
