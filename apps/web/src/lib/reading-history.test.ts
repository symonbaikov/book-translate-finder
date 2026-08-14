import { describe, expect, it } from 'vitest';
import { buildTasteProfile, type HistoryEntry } from './reading-history';

function entry(workId: string, subjects: string[], at = 0): HistoryEntry {
  return { workId, title: workId, subjects, at };
}

describe('buildTasteProfile', () => {
  it('returns nothing for a reader with no history — no empty shelf, no prompt to be profiled', () => {
    expect(buildTasteProfile([])).toEqual({ subjects: [], workIds: [], lastTitle: null });
  });

  it('ranks a genre seen repeatedly above one seen once', () => {
    const profile = buildTasteProfile([
      entry('a', ['fantasy', 'adventure']),
      entry('b', ['fantasy']),
      entry('c', ['fantasy']),
      entry('d', ['adventure']),
    ]);

    expect(profile.subjects[0]).toBe('fantasy');
  });

  it('weights recent reading more heavily than old reading', () => {
    // Same number of sightings each; the one read most recently should lead.
    const profile = buildTasteProfile([
      entry('new', ['dystopia']),
      entry('mid', ['cookery']),
      entry('old', ['dystopia']),
      entry('older', ['cookery']),
    ]);

    expect(profile.subjects[0]).toBe('dystopia');
  });

  it('drops one-off tags once there is enough history to be choosy', () => {
    // Open Library's contributor tags include things like "Arkenstone" and "thrushes"; a single
    // sighting of one says nothing about anybody's taste.
    const profile = buildTasteProfile([
      entry('a', ['fantasy', 'arkenstone']),
      entry('b', ['fantasy']),
      entry('c', ['fantasy']),
    ]);

    expect(profile.subjects).toContain('fantasy');
    expect(profile.subjects).not.toContain('arkenstone');
  });

  it('keeps single sightings when nothing repeats — an empty section helps nobody', () => {
    // A reader three books in whose tags all differ still has a taste worth acting on; the
    // one-off filter exists to drop noise once a pattern exists, not before.
    const profile = buildTasteProfile([
      entry('a', ['fantasy']),
      entry('b', ['dystopia']),
      entry('c', ['cookery']),
    ]);
    expect(profile.subjects).toEqual(expect.arrayContaining(['fantasy', 'dystopia', 'cookery']));
  });

  it('lists every opened work so none is recommended back', () => {
    const profile = buildTasteProfile([entry('a', ['x']), entry('b', ['x'])]);
    expect(profile.workIds).toEqual(['a', 'b']);
  });

  it('caps the genres sent, so a long tail of tags cannot become the query', () => {
    const many = Array.from({ length: 20 }, (_, i) => `genre-${i}`);
    const profile = buildTasteProfile([entry('a', many), entry('b', many)]);
    expect(profile.subjects).toHaveLength(8);
  });

  it('names the most recent book, so the section can explain itself', () => {
    const profile = buildTasteProfile([entry('newest', ['x']), entry('older', ['x'])]);
    expect(profile.lastTitle).toBe('newest');
  });
});
