import { describe, expect, it } from 'vitest';
import { LanguageCode } from './language-code.js';

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
