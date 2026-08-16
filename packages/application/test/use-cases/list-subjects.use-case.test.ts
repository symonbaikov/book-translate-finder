import type {
  RecommendBySubjectsQuery,
  RecommendationHit,
  SubjectBrowsePort,
  SubjectBrowseQuery,
  WorkSearchHit,
} from '@golden/domain';
import { describe, expect, it } from 'vitest';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import { ListSubjects, isGenreTag } from '../../src/use-cases/browse-by-subject.use-case.js';

class FakeSubjectBrowse implements SubjectBrowsePort {
  readonly limits: number[] = [];

  constructor(private readonly tags: { subject: string; workCount: number }[]) {}

  async recommendBySubjects(_query: RecommendBySubjectsQuery): Promise<RecommendationHit[]> {
    return [];
  }

  async browseBySubject(_query: SubjectBrowseQuery): Promise<WorkSearchHit[]> {
    return [];
  }

  async popularSubjects(limit: number): Promise<{ subject: string; workCount: number }[]> {
    this.limits.push(limit);
    return this.tags.slice(0, limit);
  }
}

function tag(subject: string, workCount = 10): { subject: string; workCount: number } {
  return { subject, workCount };
}

describe('isGenreTag', () => {
  it('keeps subject matter', () => {
    expect(isGenreTag('Fiction')).toBe(true);
    expect(isGenreTag('Science fiction')).toBe(true);
  });

  it('drops what describes the copy rather than the book', () => {
    expect(isGenreTag('Accessible book')).toBe(false);
    expect(isGenreTag('protected daisy')).toBe(false);
    expect(isGenreTag('In library')).toBe(false);
  });

  it('drops machine tags and cataloguing strings', () => {
    expect(isGenreTag('nyt:combined_print_and_e_book_fiction=2011-11-19')).toBe(false);
    expect(isGenreTag('United States -- History -- 1945-')).toBe(false);
  });

  it('drops a tag too long to be a chip, and an empty one', () => {
    expect(isGenreTag('a'.repeat(41))).toBe(false);
    expect(isGenreTag('   ')).toBe(false);
  });
});

describe('ListSubjects', () => {
  it('returns only browsable genres, in the order the source ranked them', async () => {
    const subjectBrowse = new FakeSubjectBrowse([
      tag('Accessible book', 900),
      tag('Fiction', 800),
      tag('nyt:bestseller=2011', 700),
      tag('Fantasy', 600),
    ]);

    const result = await new ListSubjects({ subjectBrowse, cache: new InMemoryCache() }).execute();

    expect(result.subjects.map((entry) => entry.subject)).toEqual(['Fiction', 'Fantasy']);
  });

  it('asks for more tags than it returns, since the rejects are the common ones', async () => {
    const subjectBrowse = new FakeSubjectBrowse([tag('Fiction')]);

    await new ListSubjects({ subjectBrowse, cache: new InMemoryCache() }).execute();

    expect(subjectBrowse.limits[0]).toBeGreaterThan(40);
  });

  it('serves the second call from the cache', async () => {
    const subjectBrowse = new FakeSubjectBrowse([tag('Fiction')]);
    const useCase = new ListSubjects({ subjectBrowse, cache: new InMemoryCache() });

    await useCase.execute();
    await useCase.execute();

    expect(subjectBrowse.limits).toHaveLength(1);
  });
});
