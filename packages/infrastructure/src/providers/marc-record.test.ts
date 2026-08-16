import { XMLParser } from 'fast-xml-parser';
import { describe, expect, it } from 'vitest';
import { parseMarcRecords } from './marc-record.js';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  parseTagValue: false,
  trimValues: true,
});

/** One MARCXML record inside the SRU envelope K10plus and the Library of Congress really send. */
function marcResponse(records: string[]): unknown {
  return parser.parse(`<?xml version="1.0" encoding="UTF-8"?>
    <zs:searchRetrieveResponse xmlns:zs="http://www.loc.gov/zing/srw/">
      <zs:version>1.1</zs:version>
      <zs:numberOfRecords>${records.length}</zs:numberOfRecords>
      <zs:records>${records
        .map(
          (record) => `<zs:record><zs:recordSchema>marcxml</zs:recordSchema>
            <zs:recordData><record xmlns="http://www.loc.gov/MARC21/slim">${record}</record>
            </zs:recordData></zs:record>`,
        )
        .join('')}</zs:records>
    </zs:searchRetrieveResponse>`);
}

/** A German translation of a Russian novel, in the field shapes captured live from K10plus. */
const LAURUS = `
  <leader>     cam a22      c 4500</leader>
  <controlfield tag="001">1929616341</controlfield>
  <controlfield tag="008">160702s2016    gw ||||| m    00| ||ger c</controlfield>
  <datafield tag="020" ind1=" " ind2=" ">
    <subfield code="a">9783038200277</subfield>
    <subfield code="q"> : : circa EUR 24.90 (DE)</subfield>
  </datafield>
  <datafield tag="041" ind1=" " ind2=" ">
    <subfield code="a">ger</subfield>
    <subfield code="h">rus</subfield>
  </datafield>
  <datafield tag="100" ind1="1" ind2=" ">
    <subfield code="a">Vodolazkin, Evgenij Germanovič</subfield>
    <subfield code="e">VerfasserIn</subfield>
    <subfield code="4">aut</subfield>
  </datafield>
  <datafield tag="245" ind1="1" ind2="0">
    <subfield code="a">Laurus :</subfield>
    <subfield code="b">Roman /</subfield>
    <subfield code="c">Evgenij Vodolazkin</subfield>
  </datafield>
  <datafield tag="250" ind1=" " ind2=" ">
    <subfield code="a">Erste Auflage</subfield>
  </datafield>
  <datafield tag="264" ind1=" " ind2="1">
    <subfield code="a">Zürich</subfield>
    <subfield code="b">Dörlemann</subfield>
    <subfield code="c">2016</subfield>
  </datafield>
  <datafield tag="300" ind1=" " ind2=" ">
    <subfield code="a">414 Seiten</subfield>
    <subfield code="c">21 cm</subfield>
  </datafield>
  <datafield tag="700" ind1="1" ind2=" ">
    <subfield code="a">Radetzkaja, Olga</subfield>
    <subfield code="e">ÜbersetzerIn</subfield>
    <subfield code="4">trl</subfield>
  </datafield>
`;

describe('parseMarcRecords', () => {
  it('reads the edition statement Dublin Core has no element for', () => {
    // The whole reason this parser exists: through Dublin Core a first printing and the twelfth
    // reprint are the same record.
    const [record] = parseMarcRecords(marcResponse([LAURUS]));
    expect(record?.editionStatement).toBe('Erste Auflage');
  });

  it('names the translator from the relator code rather than the wording of the role', () => {
    const [record] = parseMarcRecords(marcResponse([LAURUS]));
    expect(record?.agents).toEqual([
      { name: 'Vodolazkin, Evgenij Germanovič', relator: 'aut', roleTerm: 'VerfasserIn' },
      { name: 'Radetzkaja, Olga', relator: 'trl', roleTerm: 'ÜbersetzerIn' },
    ]);
  });

  it('reads the language translated from, which the Dublin Core path can only leave null', () => {
    const [record] = parseMarcRecords(marcResponse([LAURUS]));
    expect(record?.language).toEqual(['ger']);
    expect(record?.languageOfOriginal).toBe('rus');
  });

  it('rebuilds the title as one line the shared cleaner can strip', () => {
    const [record] = parseMarcRecords(marcResponse([LAURUS]));
    expect(record?.title).toEqual(['Laurus : Roman / Evgenij Vodolazkin']);
  });

  it('takes publisher, year, ISBN and extent from the fields that carry them', () => {
    const [record] = parseMarcRecords(marcResponse([LAURUS]));
    expect(record).toMatchObject({
      publisher: ['Dörlemann'],
      identifier: ['9783038200277'],
      format: ['414 Seiten'],
      recordId: '1929616341',
    });
    expect(record?.date[0]).toBe('2016');
  });

  it('falls back to the 008 fixed field when a record states no 041', () => {
    // 041 is only required of a record with *several* languages, so a plain single-language
    // edition routinely has none — and with no language at all the sync skips the edition.
    const noLanguageField = LAURUS.replace(/<datafield tag="041"[\s\S]*?<\/datafield>/, '');
    const [record] = parseMarcRecords(marcResponse([noLanguageField]));
    expect(record?.language).toEqual(['ger']);
  });

  it('prefers the RDA publication field over the one it replaced, and ignores a distributor', () => {
    const withBoth = LAURUS.replace(
      '<datafield tag="300"',
      `<datafield tag="260" ind1=" " ind2=" ">
         <subfield code="b">Alter Verlag</subfield><subfield code="c">1998</subfield>
       </datafield>
       <datafield tag="264" ind1=" " ind2="2">
         <subfield code="b">Ein Auslieferer</subfield><subfield code="c">2017</subfield>
       </datafield>
       <datafield tag="300"`,
    );
    const [record] = parseMarcRecords(marcResponse([withBoth]));
    expect(record?.publisher).toEqual(['Dörlemann']);
  });

  it('drops a journal article, which a union catalogue returns alongside the book', () => {
    // Leader position 7 is `a` for an article — it mentions the novel, it is not an edition of it,
    // and without this it would be attached to the work as one.
    const article = LAURUS.replace(
      '<leader>     cam a22      c 4500</leader>',
      '<leader>     caa a22      c 4500</leader>',
    );
    expect(parseMarcRecords(marcResponse([article, LAURUS]))).toHaveLength(1);
  });

  it('treats a main entry with no relator code at all as the author', () => {
    // The Library of Congress routinely omits `$4`; a 100 field is the main entry regardless.
    const noRelator = LAURUS.replace('<subfield code="e">VerfasserIn</subfield>', '').replace(
      '<subfield code="4">aut</subfield>',
      '',
    );
    const [record] = parseMarcRecords(marcResponse([noRelator]));
    expect(record?.agents?.[0]).toMatchObject({ relator: 'aut', roleTerm: null });
  });
});

describe('language codes packed into one subfield', () => {
  it('splits a run of three-letter codes older records write as one word', () => {
    // The Polish National Library returns a bilingual Bulgakov as `ruseng`. Read whole that is not
    // a language, so the edition would be dropped for having none.
    const bilingual = LAURUS.replace(
      '<subfield code="a">ger</subfield>',
      '<subfield code="a">ruseng</subfield>',
    );
    const [record] = parseMarcRecords(marcResponse([bilingual]));
    expect(record?.language).toEqual(['rus', 'eng']);
  });

  it('leaves anything that is not such a run alone, to be validated as usual', () => {
    const odd = LAURUS.replace(
      '<subfield code="a">ger</subfield>',
      '<subfield code="a">gerX</subfield>',
    );
    const [record] = parseMarcRecords(marcResponse([odd]));
    expect(record?.language).toEqual(['gerX']);
  });
});

describe('character references left by the parser', () => {
  it('decodes what a double-escaped catalogue leaves behind', () => {
    // Melinda escapes its records twice over, so `ä` arrives as `&amp;#xE4;` and the parser
    // resolves only the outer layer. Found in the database as `Alices &#xE4;ventyr i underlandet`.
    const swedish = LAURUS.replace(
      '<subfield code="a">Laurus :</subfield>',
      '<subfield code="a">Alices &amp;#xE4;ventyr :</subfield>',
    );
    const [record] = parseMarcRecords(marcResponse([swedish]));
    expect(record?.title[0]).toContain('Alices äventyr');
  });
});
