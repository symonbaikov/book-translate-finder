import { hasConflictingNumbers } from '@golden/domain';

/**
 * One bibliographic record, in the shape `SruCatalogProvider` reads — whatever format the
 * catalogue actually sent.
 *
 * The field names are Dublin Core's because that is what the first two catalogues (BnF, DNB)
 * speak, but the shape is deliberately wider than Dublin Core: `agents`, `editionStatement` and
 * `languageOfOriginal` have no DC element at all and are filled only by the MARC parser. A parser
 * that cannot know one of them sets it to `null` rather than leaving it out, so "this catalogue
 * does not say" stays distinguishable from "nobody has looked yet".
 */
export interface CatalogRecord {
  title: string[];
  creator: string[];
  contributor: string[];
  publisher: string[];
  date: string[];
  language: string[];
  identifier: string[];
  format: string[];
  subject: string[];
  /**
   * Who did what on this edition, when the format states it structurally.
   *
   * `null` for Dublin Core, where a role is prose inside the name line ("Prilepin, Zahar (1975-....).
   * Auteur du texte") and the only way to it is the catalogue-specific regexes in `SruCatalogConfig`.
   * MARC carries it in `$4` as a relator code from a fixed vocabulary — `trl` means translator in
   * Uppsala and in Washington alike — which is a fact, not a guess at another language's wording.
   */
  agents: CatalogAgent[] | null;
  /**
   * MARC 250 — "First edition", "Limited ed.", "Izd. 2-e, ispr. i dop.", "Erstveröffentlichung".
   *
   * Dublin Core has no element for this, which is the whole reason the MARC parser exists: in DC
   * a numbered collector's printing and the twelfth mass-market reprint are the same record with
   * the same fields, and a reader looking for the first one has nothing to look at.
   */
  editionStatement: string | null;
  /** MARC 041 `$h` — the language this edition was translated from, as the cataloguer recorded it. */
  languageOfOriginal: string | null;
  /** The catalogue's own record number (MARC 001), when the format carries one. */
  recordId: string | null;
}

/** A person or body named on a record, with the role the catalogue gave them. */
export interface CatalogAgent {
  name: string;
  /**
   * The MARC relator code from `$4` — `aut`, `trl`, `edt`, `ill`. A closed, language-independent
   * vocabulary, so this is the one role signal worth trusting without a per-catalogue regex.
   */
  relator: string | null;
  /** The role in the catalogue's own words (`$e`): "VerfasserIn", "Übersetzer", "translator". */
  roleTerm: string | null;
}

export const EMPTY_RECORD: CatalogRecord = {
  title: [],
  creator: [],
  contributor: [],
  publisher: [],
  date: [],
  language: [],
  identifier: [],
  format: [],
  subject: [],
  agents: null,
  editionStatement: null,
  languageOfOriginal: null,
  recordId: null,
};

/**
 * The book's title, without the cataloguing apparatus around it.
 *
 * Library records put the whole statement of responsibility in the title field:
 * `"L'archipel des Solovki : roman / Zakhar Prilepine ; traduit du russe par Joëlle Dublanchet"`,
 * and the DNB writes the original title in brackets first:
 * `"[Sankja] ; Sankya / Zakhar Prilepin ; aus dem Russischen von Erich Klein"`. Printed as-is that
 * is not a title a reader recognises, and it is a natural key nothing else will ever match.
 */
export function cleanCatalogTitle(raw: string): string {
  // Everything after " / " is who did what — authors, translators, illustrators.
  let title = raw.split(' / ')[0] ?? raw;
  // "[original title] ; local title" — keep the one this record is actually for.
  const afterBracket = /^\s*\[[^\]]*\]\s*;\s*(.+)$/.exec(title);
  if (afterBracket?.[1]) title = afterBracket[1];
  // " : roman", " : Erzählungen" — a form label, not part of the name.
  title = title.split(' : ')[0] ?? title;
  return title.replace(/\s+/g, ' ').trim();
}

/**
 * `"Prilepin, Zahar (1975-....). Auteur du texte"` → `"Zahar Prilepin"`.
 *
 * Both the life dates and the role are cataloguing metadata, and the inverted form is a filing
 * order. Restoring the natural order is what lets this author meet the same author as spelled by
 * every other source — the work's natural key is built from it.
 */
export function cleanCatalogName(raw: string): string {
  let name = raw
    .replace(/\[[^\]]*\]/g, '') // "[Verfasser]", "[Übersetzer]"
    .replace(/\((?:[^)]*\d{3,4}[^)]*)\)/g, '') // life dates
    .trim()
    .replace(/\.\s*[^.]*$/, (tail) => (/\d/.test(tail) ? tail : '')) // trailing role sentence
    .trim()
    .replace(/[.,;]+$/, '')
    .trim();

  const inverted = /^([^,]+),\s*(.+)$/.exec(name);
  if (inverted?.[1] && inverted[2]) name = `${inverted[2].trim()} ${inverted[1].trim()}`;
  return name.replace(/\s+/g, ' ').trim();
}

/** The first ISBN in a field that may also carry a binding and a price. */
export function extractIsbn(raw: string): string | null {
  const match = /(97[89][\d-]{10,17}|\d[\d-]{8,15}[\dXx])/.exec(raw);
  if (!match?.[1]) return null;
  const digits = match[1].replace(/-/g, '');
  return digits.length === 13 || digits.length === 10 ? digits : null;
}

/** `"1 vol. (820 p.) ; 24 cm"`, `"381 Seiten"` → the page count. */
export function extractPages(raw: string): number | null {
  // `S\.` is case-insensitive here, so it already covers the Swedish "319 s." as well as the
  // German "381 S.".
  const match = /(\d{2,5})\s*(?:p\b|pages?\b|S\.|Seiten\b|sidor\b)/i.exec(raw);
  if (!match?.[1]) return null;
  const pages = Number(match[1]);
  return Number.isFinite(pages) && pages > 0 ? pages : null;
}

export function extractYear(values: readonly string[]): number | null {
  for (const value of values) {
    const match = /\b(1[0-9]{3}|20[0-9]{2})\b/.exec(value);
    if (match?.[1]) return Number(match[1]);
  }
  return null;
}

/**
 * How many trailing words of a query may be treated as the author's name.
 *
 * The query these providers receive is a title followed by an author, and an author is at most a
 * couple of words ("Lewis Carroll", "Carroll, Lewis", "García Márquez").
 */
const AUTHOR_WORD_WINDOW = 2;

/**
 * A query split into the part that names the book and the part that names who wrote it.
 *
 * **Both halves have to reach the catalogue.** A catalogue asked only "who wrote it" answers with
 * that author's whole shelf, and this project then attaches all of it to one book — every novel
 * by the author, plus every book by everyone who shares a word with their name. That is not a
 * hypothetical: asking the Polish National Library for `author=Lewis` on behalf of *Alice's
 * Adventures in Wonderland* attached *Liar's Poker* by Michael Lewis, *The Magician's Nephew* by
 * C. S. Lewis and *American English for Poles* to Carroll's novel, and the author check passed
 * every one of them, because their author really is called Lewis.
 *
 * The catalogues that never had this problem — the BnF, the DNB, K10plus — are the ones asked with
 * every word at once, so the catalogue's own index does the narrowing. The fix for the other two is
 * to do the same thing in the shape their APIs allow: pair a title word with an author word. Both
 * index the *original* title alongside the translated one (verified live: `author=Carroll&title=Alice`
 * at the Polish library returns "Alice's adventures in Wonderland (pol.)"), which is what makes
 * this possible across languages at all.
 */
export interface QueryHalves {
  /** Words naming the book. Empty means the query is too short to constrain — ask nothing. */
  title: string[];
  /** Words naming the author, also used to judge which records came back about the right person. */
  author: string[];
}

export function splitQueryHalves(queryText: string): QueryHalves {
  const words = [
    ...new Set(
      queryText
        .split(/\s+/)
        .map((word) => word.replace(/[^\p{L}\p{N}'-]/gu, '').trim())
        .filter((word) => word.length >= 4),
    ),
  ];

  // At least one word must be left to name the book, so a two-word query spends only one on the
  // author. A single-word query can constrain nothing and gets an empty title half, which the
  // callers treat as "do not ask".
  const authorCount = Math.min(AUTHOR_WORD_WINDOW, Math.max(0, words.length - 1));
  return {
    title: words.slice(0, words.length - authorCount),
    author: words.slice(words.length - authorCount).reverse(),
  };
}

export function nameParts(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, ' ')
    .split(/\s+/)
    .filter((part) => part.length >= 4);
}

/**
 * Letters one romanization system writes with a diacritic and another spells out.
 *
 * Applied before the diacritics are stripped, because stripping first destroys the information:
 * `Alekseevič` would become `alekseevic` while the same name written `Alekseevich` keeps its `h`,
 * and the two would never meet again.
 */
const ROMANIZATION_LETTERS: readonly (readonly [RegExp, string])[] = [
  [/č/g, 'ch'],
  [/š/g, 'sh'],
  [/ž/g, 'zh'],
  [/ĭ/g, 'i'],
  [/ë/g, 'e'],
  [/ě/g, 'e'],
];

/**
 * Digraphs that different systems use for the same Cyrillic letter, folded onto one representative.
 * `х` is `kh` in one system and `ch` in another; `ий` ends up as `ii`, `ij`, `iy` or plain `y`.
 */
const ROMANIZATION_DIGRAPHS: readonly (readonly [RegExp, string])[] = [
  [/shch/g, 's'],
  [/sch/g, 's'],
  [/sh/g, 's'],
  [/zh/g, 'z'],
  [/kh/g, 'h'],
  [/ch/g, 'h'],
  [/ts/g, 'c'],
];

/**
 * A name reduced to what every romanization of it has in common.
 *
 * Two catalogues romanizing the same Russian name rarely agree, and nothing downstream can tell
 * that they meant the same person: Глуховский is `Gluchovskij` at K10plus, `Glukhovskiĭ` at the
 * Library of Congress, `Glukhovsky` on an English jacket, and `Glukhovskii` from this project's
 * own romanizer. All four fold to `gluhovski`.
 */
export function romanizationSkeleton(name: string): string {
  let folded = name.toLowerCase();
  for (const [pattern, replacement] of ROMANIZATION_LETTERS)
    folded = folded.replace(pattern, replacement);
  folded = folded.normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const [pattern, replacement] of ROMANIZATION_DIGRAPHS)
    folded = folded.replace(pattern, replacement);
  // `j` and `y` stand in for `и`/`й` depending on the system; doubled letters are an artefact of
  // the same disagreement (`ii` against `i`).
  folded = folded.replace(/[jy]/g, 'i').replace(/(.)\1+/g, '$1');
  // A glide between two vowels is written by some systems and not by others — "Dostoyevsky"
  // against "Dostoevsky". Dropped only in that position, where it carries no sound of its own.
  return folded.replace(/([aeou])i([aeou])/g, '$1$2');
}

/**
 * Whether two spellings of a name are the same person's, allowing for the tail each language adds
 * and for the romanization system each catalogue chose.
 *
 * The BnF files Прилепин as "Prilepine", the DNB as "Prilepin", and a reader may type either.
 * Prefix matching in both directions covers that, and the four-character floor in `nameParts`
 * keeps short particles ("van", "de") from matching everything.
 *
 * Comparing the romanization skeletons rather than the raw strings is what makes Russian books
 * work at all. Without it a catalogue could hold the book, this project's own romanized query
 * could find it, and the relevance check would still throw all of it away: «Метро 2034» is twelve
 * records at K10plus under `Gluchovskij, Dmitrij Alekseevič`, and the query asked about
 * `Glukhovskii` — which shares no prefix with it. The card showed zero editions for a book the
 * source plainly had.
 */
export function sameNamePart(a: string, b: string): boolean {
  const left = romanizationSkeleton(a);
  const right = romanizationSkeleton(b);
  return left === right || left.startsWith(right) || right.startsWith(left);
}

const NAMED_ENTITIES: ReadonlyMap<string, string> = new Map([
  ['amp', '&'],
  ['lt', '<'],
  ['gt', '>'],
  ['quot', '"'],
  ['apos', "'"],
  ['nbsp', ' '],
]);

/**
 * Decodes the character references an XML parser leaves behind.
 *
 * Several of these catalogues escape their records *twice* — once for the record and once for the
 * SRU envelope it travels in — so `\u00e4` arrives as `&amp;#xE4;`, the parser resolves only the outer
 * layer, and `&#xE4;` is what would be printed. Found in the database as
 * `Alices &#xE4;ventyr i underlandet`, which is a title no reader would recognise. Applied to
 * every field of every catalogue rather than to the ones known to need it: the cost is a string
 * scan that exits immediately when there is no `&`, and the failure mode is silent and ugly.
 */
export function decodeEntities(value: string): string {
  if (!value.includes('&')) return value;
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith('#')) {
      const code =
        entity.startsWith('#x') || entity.startsWith('#X')
          ? Number.parseInt(entity.slice(2), 16)
          : Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES.get(entity.toLowerCase()) ?? match;
  });
}

/**
 * Whether a catalogue record can be about the book the query names, judged on its numbers alone.
 *
 * A catalogue answers a *title*, and in a numbered series every volume shares one. Asked for
 * «Метро 2034», K10plus and the DNB return Metro 2033 and Metro 2035 as well — different novels,
 * filed as editions of this one. `hasConflictingNumbers` is the domain rule already written for
 * exactly this shape (it is what stops the search confidently answering «Metro 2035» with
 * «Metro 2033»); it was simply never applied on the enrichment path.
 *
 * Deliberately one-sided: it only ever *rejects*, and only when both sides carry numbers that do
 * not overlap. A record with no number in its title — an omnibus, a plain reprint — is kept.
 */
export function numbersAllowTheSameBook(queryText: string, recordTitle: string): boolean {
  return !hasConflictingNumbers(queryText, recordTitle);
}
