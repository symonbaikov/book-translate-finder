import type {
  RecommendationHit,
  SubjectBrowsePort,
  SubjectBrowseQuery,
  SubjectSourcePort,
  SubjectWork,
  WorkSearchHit,
  WorkSearchPort,
} from '@golden/domain';
import { describe, expect, it } from 'vitest';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import { InMemoryEditionRepository } from '../../../domain/test/fakes/in-memory-edition-repository.js';
import { InMemoryJobQueue } from '../../../domain/test/fakes/in-memory-job-queue.js';
import { InMemorySourceLinkRepository } from '../../../domain/test/fakes/in-memory-source-link-repository.js';
import { InMemoryWorkRepository } from '../../../domain/test/fakes/in-memory-work-repository.js';
import {
  featuredCacheKey,
  GetFeaturedBooks,
  type GetFeaturedBooksDeps,
} from '../../src/use-cases/get-featured-books.use-case.js';

/** Knows no curated book — the Anglophone lists stay empty so the language list is what is tested. */
class EmptyWorkSearch implements WorkSearchPort {
  async search(): Promise<WorkSearchHit[]> {
    return [];
  }
}

class FakeSubjectBrowse implements SubjectBrowsePort {
  readonly queries: SubjectBrowseQuery[] = [];

  constructor(private readonly hits: WorkSearchHit[]) {}

  async browseBySubject(query: SubjectBrowseQuery): Promise<WorkSearchHit[]> {
    this.queries.push(query);
    return this.hits.slice(0, query.limit);
  }

  async recommendBySubjects(): Promise<RecommendationHit[]> {
    return [];
  }

  async popularSubjects(): Promise<{ subject: string; workCount: number }[]> {
    return [];
  }
}

class FakeSubjectSource implements SubjectSourcePort {
  readonly asked: string[] = [];

  constructor(private readonly works: SubjectWork[]) {}

  async fetchWorksForSubject(subject: string): Promise<SubjectWork[]> {
    this.asked.push(subject);
    return this.works;
  }
}

function hit(id: string, title: string, author: string, year: number | null): WorkSearchHit {
  return { id, originalTitle: title, author, firstPublishedYear: year, coverUrl: null };
}

const RUSSIAN_CLASSICS: WorkSearchHit[] = [
  hit('w1', 'Анна Каренина', 'Лев Толстой', 1876),
  hit('w2', 'Преступление и наказание', 'Фёдор Достоевский', 1866),
  hit('w3', 'Мастер и Маргарита', 'Михаил Булгаков', 1967),
  hit('w4', 'Мёртвые души', 'Николай Гоголь', 1842),
  hit('w5', 'Отцы и дети', 'Иван Тургенев', 1862),
  hit('w6', 'Евгений Онегин', 'Александр Пушкин', 1833),
];

function makeDeps(options: {
  hits?: WorkSearchHit[];
  sourceWorks?: SubjectWork[];
  withSource?: boolean;
}) {
  const cache = new InMemoryCache();
  const backfillQueue = new InMemoryJobQueue();
  const subjectBrowse = new FakeSubjectBrowse(options.hits ?? []);
  const subjectSource = new FakeSubjectSource(options.sourceWorks ?? []);

  const deps: GetFeaturedBooksDeps = {
    workRepository: new InMemoryWorkRepository(),
    workSearch: new EmptyWorkSearch(),
    editionRepository: new InMemoryEditionRepository(),
    sourceLinkRepository: new InMemorySourceLinkRepository(),
    cache,
    backfillQueue,
    subjectBrowse,
    ...(options.withSource === false ? {} : { subjectSource }),
  };
  return { deps, cache, backfillQueue, subjectBrowse, subjectSource };
}

describe('GetFeaturedBooks', () => {
  it('asks for no language list at all when the reader has not chosen a language', async () => {
    const { deps, subjectBrowse } = makeDeps({ hits: RUSSIAN_CLASSICS });

    const result = await new GetFeaturedBooks(deps).execute();

    expect(subjectBrowse.queries).toEqual([]);
    expect(result.language).toBeNull();
    expect(result.books).toEqual([]);
  });

  it('answers a Russian reader with books written in Russian, not English books translated into it', async () => {
    const { deps, subjectBrowse } = makeDeps({ hits: RUSSIAN_CLASSICS });

    const result = await new GetFeaturedBooks(deps).execute({ language: 'ru' });

    expect(subjectBrowse.queries).toEqual([
      { subject: 'Russian literature', language: 'ru', limit: 12 },
    ]);
    expect(result.language).toBe('ru');
    expect(result.books.map((book) => book.title)).toEqual([
      'Анна Каренина',
      'Преступление и наказание',
      'Мастер и Маргарита',
      'Мёртвые души',
      'Отцы и дети',
      'Евгений Онегин',
    ]);
    expect(result.books.every((book) => book.list === 'in-language')).toBe(true);
  });

  it('puts the language list before the curated ones — the reader’s own language leads the page', async () => {
    const curated: WorkSearchHit[] = [hit('c1', 'Tom Lake', 'Ann Patchett', 2023)];
    const { deps } = makeDeps({ hits: RUSSIAN_CLASSICS });
    // A search that resolves exactly one curated entry, so both lists are non-empty.
    deps.workSearch = {
      async search(query: string) {
        return query.startsWith('Tom Lake') ? curated : [];
      },
    };

    const result = await new GetFeaturedBooks(deps).execute({ language: 'ru' });

    expect(result.books[0]?.list).toBe('in-language');
    expect(result.books.at(-1)?.list).toBe('books-of-the-year');
  });

  it('queues the subject’s top works when the language list is thin, and says it is filling', async () => {
    const { deps, backfillQueue } = makeDeps({
      hits: RUSSIAN_CLASSICS.slice(0, 2),
      sourceWorks: [
        { title: 'Анна Каренина', author: 'Лев Толстой', editionCount: 1315 },
        { title: 'Идиот', author: 'Фёдор Достоевский', editionCount: 437 },
      ],
    });

    const result = await new GetFeaturedBooks(deps).execute({ language: 'ru' });

    // The curated lists queue their own misses too, so only the subject jobs are inspected here.
    const subjectJobs = backfillQueue.enqueued.filter((job) =>
      job.jobId.startsWith('backfill-subject'),
    );
    expect(result.filling).toBe(true);
    expect(subjectJobs.map((job) => job.payload)).toEqual([
      { query: 'Анна Каренина Лев Толстой' },
      { query: 'Идиот Фёдор Достоевский' },
    ]);
    // Distinct ids, or BullMQ would collapse a whole language's books into one job.
    expect(new Set(subjectJobs.map((job) => job.jobId)).size).toBe(2);
    // Nobody is waiting for these: the page has already rendered without them. They yield to a
    // reader's own search, which shares this queue.
    expect(backfillQueue.enqueued.map((job) => job.priority)).toEqual(
      backfillQueue.enqueued.map(() => 'deferred'),
    );
  });

  it('does not go out to the source when the language list is already full', async () => {
    const { deps, backfillQueue, subjectSource } = makeDeps({ hits: RUSSIAN_CLASSICS });

    await new GetFeaturedBooks(deps).execute({ language: 'ru' });

    expect(subjectSource.asked).toEqual([]);
    expect(
      backfillQueue.enqueued.filter((job) => job.jobId.startsWith('backfill-subject')),
    ).toEqual([]);
  });

  it('offers no language list for a language this project has no verified subject for', async () => {
    const { deps, subjectBrowse } = makeDeps({ hits: RUSSIAN_CLASSICS });

    const result = await new GetFeaturedBooks(deps).execute({ language: 'sv' });

    expect(subjectBrowse.queries).toEqual([]);
    expect(result.language).toBeNull();
    expect(result.books).toEqual([]);
  });

  it('survives a source that throws — a thinner row, not a broken home page', async () => {
    const { deps } = makeDeps({ hits: [] });
    deps.subjectSource = {
      async fetchWorksForSubject(): Promise<SubjectWork[]> {
        throw new Error('Open Library is down');
      },
    };

    await expect(new GetFeaturedBooks(deps).execute({ language: 'ru' })).resolves.toMatchObject({
      books: [],
      filling: true,
      language: 'ru',
    });
  });

  it('caches per language, so a Russian reader never gets the German reader’s page', async () => {
    const { deps, cache } = makeDeps({ hits: RUSSIAN_CLASSICS });
    const useCase = new GetFeaturedBooks(deps);

    await useCase.execute({ language: 'ru' });

    expect(await cache.get(featuredCacheKey('ru'))).not.toBeNull();
    expect(await cache.get(featuredCacheKey())).toBeNull();
    expect(await cache.get(featuredCacheKey('de'))).toBeNull();
  });

  it('normalizes the language before caching, so "RU" and "ru" are one entry', async () => {
    const { deps, cache, subjectBrowse } = makeDeps({ hits: RUSSIAN_CLASSICS });
    const useCase = new GetFeaturedBooks(deps);

    await useCase.execute({ language: 'RU' });
    await useCase.execute({ language: 'ru' });

    expect(subjectBrowse.queries).toHaveLength(1);
    expect(await cache.get(featuredCacheKey('ru'))).not.toBeNull();
  });
});
