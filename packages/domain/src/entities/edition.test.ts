import { describe, expect, it } from 'vitest';
import { Isbn } from '../value-objects/isbn.js';
import { LanguageCode } from '../value-objects/language-code.js';
import { Edition } from './edition.js';

const baseParams = () => ({
  id: 'edition-1',
  workId: 'work-1',
  title: 'War and Peace',
  language: LanguageCode.create('en'),
  publisher: 'Penguin Classics',
  year: 2005,
});

describe('Edition', () => {
  it('creates a valid edition and derives a natural key from the ISBN when present', () => {
    const isbn = Isbn.create('9780140447934');
    const edition = Edition.create({ ...baseParams(), isbn });
    expect(edition.naturalKey).toBe('9780140447934');
  });

  it('falls back to a hash-based natural key when no ISBN is given', () => {
    const edition = Edition.create(baseParams());
    expect(edition.naturalKey).toMatch(/^[a-f0-9]{64}$/);
  });

  it('rejects an empty title or workId', () => {
    expect(() => Edition.create({ ...baseParams(), title: '  ' })).toThrow();
    expect(() => Edition.create({ ...baseParams(), workId: '' })).toThrow();
  });

  it('rejects a non-integer year', () => {
    expect(() => Edition.create({ ...baseParams(), year: 2005.5 })).toThrow();
  });

  it('isTranslation is true when a translator is set', () => {
    const edition = Edition.create({ ...baseParams(), translator: 'Aylmer Maude' });
    expect(edition.isTranslation).toBe(true);
  });

  it('isTranslation is true when translatedFrom is set even without a named translator', () => {
    const edition = Edition.create({ ...baseParams(), translatedFrom: LanguageCode.create('ru') });
    expect(edition.isTranslation).toBe(true);
    expect(edition.translator).toBeNull();
  });

  it('isTranslation is false when neither signal is present', () => {
    const edition = Edition.create(baseParams());
    expect(edition.isTranslation).toBe(false);
  });

  it('blank translator/publisher strings normalize to null, not empty string', () => {
    const edition = Edition.create({ ...baseParams(), translator: '   ', publisher: '  ' });
    expect(edition.translator).toBeNull();
    expect(edition.publisher).toBeNull();
  });
});
