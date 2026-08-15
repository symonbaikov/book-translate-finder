import { describe, expect, it } from 'vitest';
import { inferLanguageFromIsbn } from './isbn-language.js';

describe('inferLanguageFromIsbn', () => {
  it('infers Spanish from a Spain-registered ISBN (the live "Metro 2035" case)', () => {
    // The real ISBN-13 of one of "Metro 2035"'s Spanish editions (publisher Booket) — Open
    // Library carries no `languages` field for it at all.
    expect(inferLanguageFromIsbn('9788445015407')).toBe('es');
  });

  it('infers English from both English-language groups', () => {
    expect(inferLanguageFromIsbn('9780141439518')).toBe('en'); // group 0
    expect(inferLanguageFromIsbn('9781400079988')).toBe('en'); // group 1
  });

  it('infers French, German, Japanese, Russian and Chinese from their single-digit groups', () => {
    expect(inferLanguageFromIsbn('9782070360024')).toBe('fr');
    expect(inferLanguageFromIsbn('9783518188248')).toBe('de');
    expect(inferLanguageFromIsbn('9784167158057')).toBe('ja');
    expect(inferLanguageFromIsbn('9785171084961')).toBe('ru');
    expect(inferLanguageFromIsbn('9787020042494')).toBe('zh');
  });

  it('infers a two-digit group correctly rather than falling back to a one-digit prefix', () => {
    expect(inferLanguageFromIsbn('9788817001262')).toBe('it'); // 88, not a stray "8"
    expect(inferLanguageFromIsbn('9789024562286')).toBe('nl'); // 90, not a stray "9"
  });

  it('returns null for a registration group covering more than one language', () => {
    // Group 81 (India) is deliberately not in the table — it spans many languages.
    expect(inferLanguageFromIsbn('9788172234980')).toBeNull();
  });

  it('returns null for a 979-prefixed ISBN (different group assignments entirely)', () => {
    expect(inferLanguageFromIsbn('9798123456789')).toBeNull();
  });

  it('returns null for an unmapped group', () => {
    expect(inferLanguageFromIsbn('9786123456789')).toBeNull();
  });
});
