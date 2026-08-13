import { describe, expect, it } from 'vitest';
import { ISO_639_2B_TO_1 } from './iso-639-2-to-1.js';
import { LanguageCode } from './language-code.js';
import { LANGUAGE_NAMES } from './language-names.js';

describe('LanguageCode', () => {
  it('accepts a valid lowercase code', () => {
    const lang = LanguageCode.create('en');
    expect(lang.value).toBe('en');
    expect(lang.names.nameEn).toBe('English');
    expect(lang.names.nameRu).toBe('английский');
  });

  it('normalizes case and surrounding whitespace', () => {
    expect(LanguageCode.create(' RU ').value).toBe('ru');
  });

  it('rejects an unknown code', () => {
    expect(() => LanguageCode.create('xx')).toThrow(/Unknown ISO 639-1\/639-2/);
  });

  it('rejects a three-letter code with no known ISO 639-2/B mapping (e.g. "und"/"mul")', () => {
    expect(() => LanguageCode.create('und')).toThrow();
    expect(() => LanguageCode.create('mul')).toThrow();
  });

  it.each([
    ['eng', 'en'],
    ['rus', 'ru'],
    ['ger', 'de'], // bibliographic (/B) form — what Open Library/MARC actually send
    ['fre', 'fr'],
    ['chi', 'zh'],
    ['jpn', 'ja'],
  ])(
    'accepts and normalizes an ISO 639-2/B three-letter code: %s -> %s',
    (threeLetterCode, expectedTwoLetterCode) => {
      expect(LanguageCode.create(threeLetterCode).value).toBe(expectedTwoLetterCode);
    },
  );

  it('an ISO 639-1 code and its ISO 639-2/B equivalent produce equal value objects', () => {
    expect(LanguageCode.create('en').equals(LanguageCode.create('eng'))).toBe(true);
  });

  it('two instances of the same code are equal', () => {
    expect(LanguageCode.create('fr').equals(LanguageCode.create('fr'))).toBe(true);
    expect(LanguageCode.create('fr').equals(LanguageCode.create('de'))).toBe(false);
  });

  it('toString returns the raw code', () => {
    expect(`${LanguageCode.create('ja')}`).toBe('ja');
  });
});

describe('LanguageCode coverage (a missing code silently drops editions)', () => {
  it('covers the complete ISO 639-1 set, not a "likely codes" subset', () => {
    // Found live in Phase 3: the table held 87 codes, so editions in any other language were
    // skipped outright by SyncWorkFromSource — real data loss, invisible in the UI.
    expect(LANGUAGE_NAMES.size).toBeGreaterThanOrEqual(180);
  });

  it('parses languages that the old 87-code table rejected', () => {
    for (const code of ['zu', 'yo', 'ha', 'ug', 'ii', 'ee', 'nv', 'cr']) {
      expect(() => LanguageCode.create(code), `${code} must parse`).not.toThrow();
    }
  });

  it('maps both bibliographic and terminological 3-letter forms', () => {
    // MARC/Open Library emit /B (ger, chi, dut); other sources emit /T (deu, zho, nld).
    expect(LanguageCode.create('ger').value).toBe('de');
    expect(LanguageCode.create('deu').value).toBe('de');
    expect(LanguageCode.create('chi').value).toBe('zh');
    expect(LanguageCode.create('zho').value).toBe('zh');
    expect(LanguageCode.create('dut').value).toBe('nl');
    expect(LanguageCode.create('nld').value).toBe('nl');
  });

  it('every 3-letter mapping targets a language the table can name', () => {
    for (const [three, two] of ISO_639_2B_TO_1) {
      expect(LANGUAGE_NAMES.has(two), `${three} -> ${two} must be nameable`).toBe(true);
    }
  });
});
