import { describe, expect, it } from 'vitest';
import { romanizeCyrillicQuery } from './romanize-query.js';

describe('romanizeCyrillicQuery', () => {
  it('returns null for a query with no Cyrillic (no fallback pass needed)', () => {
    expect(romanizeCyrillicQuery('War and Peace Tolstoy')).toBeNull();
    expect(romanizeCyrillicQuery('Der Meister und Margarita')).toBeNull();
    expect(romanizeCyrillicQuery('1984')).toBeNull();
  });

  it('romanizes a Russian title the way Open Library stores it', () => {
    // The exact live case this exists for: OL stores the Russian edition as "Voina i mir".
    expect(romanizeCyrillicQuery('Война и мир')).toBe('Voina i mir');
  });

  it('preserves capitalization of mapped first letters', () => {
    expect(romanizeCyrillicQuery('Мастер и Маргарита')).toBe('Master i Margarita');
  });

  it('handles multi-letter mappings and hard/soft signs', () => {
    expect(romanizeCyrillicQuery('Жизнь и судьба')).toBe('Zhizn i sudba');
    expect(romanizeCyrillicQuery('Щит и меч')).toBe('Shchit i mech');
  });

  it('leaves non-Cyrillic characters in a mixed query untouched', () => {
    expect(romanizeCyrillicQuery('Мастер and Margarita 1966')).toBe('Master and Margarita 1966');
  });
});
