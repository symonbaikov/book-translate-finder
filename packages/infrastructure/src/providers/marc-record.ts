import {
  EMPTY_RECORD,
  decodeEntities,
  type CatalogAgent,
  type CatalogRecord,
} from './catalog-record.js';

/**
 * MARC21 (in its `slim` XML serialization) into `CatalogRecord`.
 *
 * **Why a second parser at all.** Every catalogue here can also answer in Dublin Core, and Dublin
 * Core is far less work to read. It is also lossy in exactly the places this project cares about.
 * A printed book's record carries, in MARC:
 *
 * - `250` — the edition statement. "Erstveröffentlichung", "Limited ed., signed", "Izd. 2-e,
 *   ispr. i dop.". Dublin Core has no element for it, so through DC a numbered collector's
 *   printing and the twelfth reprint are indistinguishable — which is the complaint this parser
 *   was written to answer.
 * - `700 $4 trl` — the translator, by relator code. The DC path has to guess from the wording of
 *   the role ("Übersetzer" at the DNB, "Traducteur" at the BnF) and therefore needs a hand-written
 *   regex per catalogue and per language; `trl` means the same thing everywhere.
 * - `041 $h` — the language translated from. This is `Edition.translatedFrom`, the signal Phase 0
 *   found is more often present than a named translator, and the DC path can only ever set it to
 *   `null`.
 *
 * Nothing here is inferred. A field the record does not carry comes back `null`.
 */
export function parseMarcRecords(parsed: unknown): CatalogRecord[] {
  return collectMarcNodes(parsed).map(readMarcXmlRecord).filter(isMonograph).map(marcRecordFrom);
}

/**
 * One MARC record broken into its parts, whichever way it arrived.
 *
 * MARC is a data model with several serializations, and this project meets two of them: MARCXML
 * from the SRU catalogues, and the JSON form the Polish National Library embeds in its own API.
 * They disagree about nothing except punctuation, so they are read down to this and then share
 * every rule below — which is the only reason a fourth catalogue on an entirely different protocol
 * costs a few dozen lines rather than a second parser.
 */
export interface MarcSource {
  leader: string;
  controlFields: ReadonlyMap<string, string>;
  dataFields: readonly MarcField[];
}

export interface MarcSubfield {
  code: string;
  value: string;
}

export interface MarcField {
  tag: string;
  ind2: string;
  subfields: MarcSubfield[];
}

/** MARC relator codes for "wrote it", any of which makes an agent the record's author. */
const AUTHOR_RELATORS = new Set(['aut', 'cre']);
/** MARC relator code for a translator. One code, every language, which is the point. */
export const TRANSLATOR_RELATOR = 'trl';

/**
 * Whether the record describes a book, rather than something filed alongside one.
 *
 * `pica.all` at a union catalogue matches across everything it holds, so a query for a novel also
 * returns the journal article about it, the review, and the series the novel belongs to. None of
 * those is an edition of the book, and all of them would be attached to it as one. The leader
 * settles it without any guessing: position 6 `a` is language material, position 7 `m` is a
 * monograph — an article is `a` at position 7, a serial is `s`, and both are correctly dropped.
 */
export function isMonograph(source: MarcSource): boolean {
  // No leader to judge by — keep the record and let the author filter downstream decide.
  if (source.leader.length < 8) return true;
  return source.leader[6] === 'a' && source.leader[7] === 'm';
}

function readMarcXmlRecord(node: Record<string, unknown>): MarcSource {
  const controlFields = new Map<string, string>();
  for (const field of asArray(node['controlfield'])) {
    const tag = attr(field, 'tag');
    if (tag) controlFields.set(tag, text(field));
  }

  const dataFields: MarcField[] = [];
  for (const field of asArray(node['datafield'])) {
    const tag = attr(field, 'tag');
    if (!tag) continue;
    dataFields.push({
      tag,
      ind2: attr(field, 'ind2') ?? ' ',
      subfields: asArray((field as Record<string, unknown>)['subfield'])
        .map((sub) => ({ code: attr(sub, 'code') ?? '', value: text(sub) }))
        .filter((sub) => sub.code !== '' && sub.value !== ''),
    });
  }

  return { leader: restoreLeader(text(node['leader'])), controlFields, dataFields };
}

/**
 * Puts back the leading blanks the XML parser trimmed off the leader.
 *
 * Everything in a MARC leader is addressed by absolute position, and the shared `XMLParser` runs
 * with `trimValues: true` — so `"     cam a22      c 4500"` arrives as `"cam a22      c 4500"` and
 * every position is five to the left. Read that way the type of record is a digit, no record is
 * ever a monograph, and the parser silently returns nothing at all; found exactly that way.
 *
 * Padding is safe rather than a guess: a MARC21 leader is always 24 characters and always ends
 * `4500`, so nothing can have been trimmed from the right and the only question is how much came
 * off the left. Positions 0–4 are the record length, which these catalogues leave blank.
 */
function restoreLeader(leader: string): string {
  return leader.length === 0 ? '' : leader.padStart(24, ' ');
}

/** The MARC rules themselves, on a record that has already been broken into fields. */
export function marcRecordFrom(source: MarcSource): CatalogRecord {
  const fields = source.dataFields;
  const controls = source.controlFields;
  const agents = readAgents(fields);
  return {
    ...EMPTY_RECORD,
    title: readTitles(fields),
    // Both lists are kept populated even though `agents` supersedes them, so a caller that only
    // knows the Dublin Core shape still sees the same people it always did.
    creator: agents.filter((agent) => agent.relator !== TRANSLATOR_RELATOR).map((a) => a.name),
    contributor: agents.map((agent) => agent.name),
    publisher: values(fields, ['264', '260'], 'b'),
    date: [...values(fields, ['264', '260'], 'c'), ...compact([datePart(controls.get('008'))])],
    language: readLanguages(fields, controls.get('008')),
    identifier: [...values(fields, ['020'], 'a'), ...values(fields, ['024'], 'a')],
    format: values(fields, ['300'], 'a'),
    subject: values(fields, ['650', '600'], 'a'),
    agents,
    editionStatement: readEditionStatement(fields),
    languageOfOriginal: first(values(fields, ['041'], 'h')),
    recordId: controls.get('001') ?? null,
  };
}

/**
 * `245` rebuilt as one line: `$a` the title proper, `$b` the rest of it, `$c` who is responsible.
 *
 * Joined rather than filtered because MARC leaves the punctuation on `$a` — "Lavr :" then "roman"
 * then "/ E.G. Vodolazkin" — so the join reproduces exactly the one-line form
 * `cleanCatalogTitle` already knows how to strip down to "Lavr".
 */
function readTitles(fields: readonly MarcField[]): string[] {
  const title = fields.find((field) => field.tag === '245');
  if (!title) return [];
  const line = ['a', 'b', 'c']
    .flatMap((code) => title.subfields.filter((sub) => sub.code === code).map((sub) => sub.value))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return line.length > 0 ? [line] : [];
}

/** `250` — `$a` the statement, `$b` the responsibility for *this* revision ("rev. by …"). */
function readEditionStatement(fields: readonly MarcField[]): string | null {
  const edition = fields.find((field) => field.tag === '250');
  if (!edition) return null;
  const statement = edition.subfields
    .filter((sub) => sub.code === 'a' || sub.code === 'b')
    .map((sub) => sub.value)
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/[.,;/]+$/, '')
    .trim();
  return statement.length > 0 ? statement : null;
}

/**
 * The record's language: `041 $a` when the cataloguer filled it in, otherwise the `008` fixed
 * field, whose positions 35–37 always hold one. The fallback matters more than it sounds — `041`
 * is only required when a record has *several* languages, so a plain single-language edition
 * routinely has no `041` at all and would otherwise come back with no language and be skipped.
 */
function readLanguages(fields: readonly MarcField[], control008: string | undefined): string[] {
  const stated = values(fields, ['041'], 'a').flatMap(splitLanguageCodes);
  if (stated.length > 0) return stated;
  const fromControl = control008?.slice(35, 38).trim();
  return fromControl && /^[a-z]{3}$/.test(fromControl) ? [fromControl] : [];
}

/**
 * `"ruseng"` → `["rus", "eng"]`.
 *
 * Older cataloguing practice packed several three-letter codes into a single `041 $a` instead of
 * repeating the subfield, and plenty of live records still carry it that way — the Polish National
 * Library returns a bilingual Bulgakov as `ruseng`, which read whole is not a language at all and
 * would be rejected as the edition's language, losing the edition. Only split what is exactly a
 * run of three-letter codes; anything else is passed through untouched to be validated as usual.
 */
function splitLanguageCodes(value: string): string[] {
  if (value.length <= 3 || value.length % 3 !== 0 || !/^[a-z]+$/.test(value)) return [value];
  return (value.match(/.{3}/g) ?? [value]).filter((code) => code.length === 3);
}

/** `008` positions 7–10 — the publication year, for a record whose `264 $c` is missing. */
function datePart(control008: string | undefined): string | null {
  const year = control008?.slice(7, 11);
  return year && /^[0-9]{4}$/.test(year) ? year : null;
}

/**
 * Everyone named on the record, with their role.
 *
 * `100`/`110` is the main entry and `700`/`710` the added ones; MARC draws that distinction for
 * filing, not for authorship, so both are read the same way and the relator code decides. A `100`
 * with no `$4` at all is still the main entry, which is what `aut` would have said.
 */
function readAgents(fields: readonly MarcField[]): CatalogAgent[] {
  const agents: CatalogAgent[] = [];
  for (const field of fields) {
    if (!['100', '110', '700', '710'].includes(field.tag)) continue;
    const name = field.subfields.find((sub) => sub.code === 'a')?.value;
    if (!name) continue;

    const relator = field.subfields.find((sub) => sub.code === '4')?.value.toLowerCase() ?? null;
    const roleTerm = field.subfields.find((sub) => sub.code === 'e')?.value ?? null;
    agents.push({
      name,
      relator: relator ?? (isMainEntry(field.tag) && roleTerm === null ? 'aut' : null),
      roleTerm,
    });
  }
  return agents;
}

function isMainEntry(tag: string): boolean {
  return tag === '100' || tag === '110';
}

/** Whether a relator code names the person who wrote the thing. */
export function isAuthorRelator(relator: string | null): boolean {
  return relator !== null && AUTHOR_RELATORS.has(relator);
}

/**
 * Every value of `subfield` across the given tags, in tag order.
 *
 * `264` is tried before `260` by the caller passing it first: `264` is the RDA field that replaced
 * `260`, and a record catalogued under both carries the current statement in `264`. Within `264`,
 * second indicator `1` is publication — `2` is distribution and `3` manufacture, and a printer's
 * name is not a publisher.
 */
function values(fields: readonly MarcField[], tags: readonly string[], subfield: string): string[] {
  for (const tag of tags) {
    const found = fields
      .filter((field) => field.tag === tag && (tag !== '264' || field.ind2 === '1'))
      .flatMap((field) => field.subfields.filter((sub) => sub.code === subfield))
      .map((sub) => sub.value);
    if (found.length > 0) return found;
  }
  return [];
}

/** Walks the SRU envelope for MARC `<record>` payloads, wherever they are nested. */
function collectMarcNodes(node: unknown): Record<string, unknown>[] {
  if (Array.isArray(node)) return node.flatMap(collectMarcNodes);
  if (!node || typeof node !== 'object') return [];

  const record = node as Record<string, unknown>;
  // A MARC record is the only thing in the envelope with these; the surrounding `<zs:record>`
  // wrapper shares its element name once namespace prefixes are stripped, so the name cannot be
  // what identifies it.
  if ('datafield' in record || 'controlfield' in record) return [record];

  return Object.values(record).flatMap(collectMarcNodes);
}

function asArray(node: unknown): unknown[] {
  if (node === undefined || node === null) return [];
  return Array.isArray(node) ? node : [node];
}

function attr(node: unknown, name: string): string | null {
  if (!node || typeof node !== 'object') return null;
  const value = (node as Record<string, unknown>)[`@_${name}`];
  return value === undefined || value === null ? null : String(value);
}

/**
 * An element's text.
 *
 * fast-xml-parser hands back a bare string for an element with no attributes and an object with
 * `#text` for one that has them — and a MARC `<subfield code="a">` always has them, so the object
 * branch is the normal case here, not the exception.
 */
function text(node: unknown): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return decodeEntities(String(node).trim());
  }
  if (node && typeof node === 'object' && '#text' in node) {
    return decodeEntities(String((node as { '#text': unknown })['#text']).trim());
  }
  return '';
}

function first(list: readonly string[]): string | null {
  return list[0] ?? null;
}

function compact(list: readonly (string | null)[]): string[] {
  return list.filter((value): value is string => value !== null);
}
