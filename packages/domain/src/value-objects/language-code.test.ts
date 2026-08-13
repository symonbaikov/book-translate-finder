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
    expect(() => LanguageCode.create('xx')).toThrow(/Unknown ISO 639-1/);
  });

  it('rejects a three-letter (ISO 639-2) code', () => {
    expect(() => LanguageCode.create('eng')).toThrow();
  });

  it('two instances of the same code are equal', () => {
    expect(LanguageCode.create('fr').equals(LanguageCode.create('fr'))).toBe(true);
    expect(LanguageCode.create('fr').equals(LanguageCode.create('de'))).toBe(false);
  });

  it('toString returns the raw code', () => {
    expect(`${LanguageCode.create('ja')}`).toBe('ja');
  });
});
