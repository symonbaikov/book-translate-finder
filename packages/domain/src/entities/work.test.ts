import { describe, expect, it } from 'vitest';
import { LanguageCode } from '../value-objects/language-code.js';
import { Work } from './work.js';

const baseParams = () => ({
  id: 'work-1',
  originalTitle: 'War and Peace',
  originalLanguage: LanguageCode.create('ru'),
  author: 'Leo Tolstoy',
  firstPublishedYear: 1869,
  syncedAt: new Date('2026-01-01T00:00:00Z'),
});

describe('Work', () => {
  it('creates a valid work and derives its natural key', () => {
    const work = Work.create(baseParams());
    expect(work.id).toBe('work-1');
    expect(work.naturalKey).toMatch(/^[a-f0-9]{64}$/);
  });

  it('trims title and author', () => {
    const work = Work.create({
      ...baseParams(),
      originalTitle: '  War and Peace  ',
      author: '  Leo Tolstoy  ',
    });
    expect(work.originalTitle).toBe('War and Peace');
    expect(work.author).toBe('Leo Tolstoy');
  });

  it('two works with the same normalized title+author share a natural key even with id/casing differences', () => {
    const a = Work.create(baseParams());
    const b = Work.create({ ...baseParams(), id: 'work-2', originalTitle: 'WAR AND PEACE' });
    expect(a.naturalKey).toBe(b.naturalKey);
    expect(a.id).not.toBe(b.id);
  });

  it('rejects an empty title or author', () => {
    expect(() => Work.create({ ...baseParams(), originalTitle: '   ' })).toThrow();
    expect(() => Work.create({ ...baseParams(), author: '' })).toThrow();
  });

  it('rejects a non-integer firstPublishedYear', () => {
    expect(() => Work.create({ ...baseParams(), firstPublishedYear: 1869.5 })).toThrow();
  });

  it('accepts a null firstPublishedYear', () => {
    expect(() => Work.create({ ...baseParams(), firstPublishedYear: null })).not.toThrow();
  });

  it('accepts a negative (BCE) firstPublishedYear', () => {
    const work = Work.create({
      ...baseParams(),
      originalTitle: 'The Odyssey',
      firstPublishedYear: -800,
    });
    expect(work.firstPublishedYear).toBe(-800);
  });

  it('withSyncedAt returns a new instance without mutating the original', () => {
    const original = Work.create(baseParams());
    const later = new Date('2026-06-01T00:00:00Z');
    const updated = original.withSyncedAt(later);

    expect(updated).not.toBe(original);
    expect(updated.syncedAt).toBe(later);
    expect(original.syncedAt).toEqual(baseParams().syncedAt);
    expect(updated.naturalKey).toBe(original.naturalKey);
  });
});
