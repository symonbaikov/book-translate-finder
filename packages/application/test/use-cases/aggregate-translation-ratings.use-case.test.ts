import {
  Edition,
  Isbn,
  LanguageCode,
  NotFoundError,
  ProviderId,
  Rating,
  Work,
  type Clock,
  type EditionRatingProvider,
  type EditionReviewsProvider,
  type RatingQuery,
  type ReviewLinkQuery,
} from '@golden/domain';
import { describe, expect, it } from 'vitest';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import { InMemoryEditionRepository } from '../../../domain/test/fakes/in-memory-edition-repository.js';
import { InMemoryWorkRepository } from '../../../domain/test/fakes/in-memory-work-repository.js';
import {
  AggregateTranslationRatings,
  MAX_LOOKUPS_PER_WORK,
  RATINGS_DEGRADED_TTL_SECONDS,
  RATINGS_TTL_SECONDS,
  translationRatingsCacheKey,
  type AggregateTranslationRatingsDeps,
} from '../../src/use-cases/aggregate-translation-ratings.use-case.js';

const FIXED_CLOCK: Clock = { now: () => new Date('2026-08-16T10:00:00Z') };

interface EditionSpec {
  id: string;
  language: string;
  translator?: string | null;
  isbn?: string | null;
}

/**
 * A distinct, checksum-valid ISBN-13 per edition. Distinct matters: the edition natural key is
 * built from the ISBN, so two editions sharing one would merge into a single record in the
 * repository fake and the cap test would silently stop testing the cap.
 */
function isbnFor(index: number): string {
  const core = `978${String(index).padStart(9, '0')}`;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(core[i]) * (i % 2 === 0 ? 1 : 3);
  return `${core}${(10 - (sum % 10)) % 10}`;
}

function stubProvider(
  id: string,
  rate: (query: RatingQuery) => Promise<ReturnType<typeof result> | null>,
): EditionRatingProvider {
  return { id: ProviderId.create(id), name: id, rate };
}

function result(providerId: string, average: number, votes: number, url: string | null = null) {
  return {
    providerId,
    providerName: providerId,
    rating: Rating.create(average, votes),
    url,
  };
}

function stubReviewProvider(
  id: string,
  findLinks: EditionReviewsProvider['findLinks'],
): EditionReviewsProvider {
  return { id: ProviderId.create(id), name: id, findLinks };
}

async function makeDeps(
  editions: readonly EditionSpec[],
  providers: readonly EditionRatingProvider[],
  reviewProviders: readonly EditionReviewsProvider[] = [],
) {
  const editionRepository = new InMemoryEditionRepository();
  const workRepository = new InMemoryWorkRepository();
  const cache = new InMemoryCache();

  await workRepository.save(
    Work.create({
      id: 'work-1',
      originalTitle: 'War and Peace',
      originalLanguage: LanguageCode.create('ru'),
      author: 'Leo Tolstoy',
      firstPublishedYear: 1869,
      syncedAt: FIXED_CLOCK.now(),
    }),
  );

  for (const [index, spec] of editions.entries()) {
    await editionRepository.save(
      Edition.create({
        id: spec.id,
        workId: 'work-1',
        title: `Edition ${spec.id}`,
        language: LanguageCode.create(spec.language),
        translator: spec.translator ?? null,
        isbn: spec.isbn === null ? null : Isbn.create(spec.isbn ?? isbnFor(index)),
      }),
    );
  }

  const deps: AggregateTranslationRatingsDeps = {
    editionRepository,
    workRepository,
    ratingProviders: providers,
    reviewProviders,
    cache,
    clock: FIXED_CLOCK,
  };
  return { deps, cache };
}

describe('AggregateTranslationRatings', () => {
  it('rejects an unknown work rather than answering with an empty list', async () => {
    const { deps } = await makeDeps([], []);
    await expect(new AggregateTranslationRatings(deps).execute({ workId: 'nope' })).rejects.toThrow(
      NotFoundError,
    );
  });

  it('reports the rating of each edition with the source that gave it', async () => {
    const { deps } = await makeDeps(
      [{ id: 'e1', language: 'ru' }],
      [stubProvider('google-books', async () => result('google-books', 4.5, 212, 'https://g/e1'))],
    );

    const out = await new AggregateTranslationRatings(deps).execute({ workId: 'work-1' });

    expect(out.editions).toEqual([
      {
        editionId: 'e1',
        providerId: 'google-books',
        providerName: 'google-books',
        average: 4.5,
        outOf: 5,
        votes: 212,
        lowConfidence: false,
        url: 'https://g/e1',
      },
    ]);
  });

  it('never asks about an edition with no ISBN, and says how many it skipped', async () => {
    const asked: RatingQuery[] = [];
    const { deps } = await makeDeps(
      [
        { id: 'e1', language: 'ru' },
        { id: 'e2', language: 'ru', isbn: null },
      ],
      [
        stubProvider('google-books', async (query) => {
          asked.push(query);
          return null;
        }),
      ],
    );

    const out = await new AggregateTranslationRatings(deps).execute({ workId: 'work-1' });

    expect(asked).toHaveLength(1);
    expect(out.withoutIsbn).toBe(1);
  });

  it('filters to one language when the edition list is filtered', async () => {
    const asked: RatingQuery[] = [];
    const { deps } = await makeDeps(
      [
        { id: 'e1', language: 'ru' },
        { id: 'e2', language: 'fr' },
      ],
      [
        stubProvider('google-books', async (query) => {
          asked.push(query);
          return null;
        }),
      ],
    );

    await new AggregateTranslationRatings(deps).execute({ workId: 'work-1', language: 'FR ' });

    expect(asked.map((query) => query.language)).toEqual(['fr']);
  });

  it('stops after the cap and reports what it did not look at', async () => {
    const editions = Array.from({ length: MAX_LOOKUPS_PER_WORK + 3 }, (_, index) => ({
      id: `e${index}`,
      language: 'ru',
    }));
    let calls = 0;
    const { deps } = await makeDeps(editions, [
      stubProvider('google-books', async () => {
        calls += 1;
        return null;
      }),
    ]);

    const out = await new AggregateTranslationRatings(deps).execute({ workId: 'work-1' });

    expect(calls).toBe(MAX_LOOKUPS_PER_WORK);
    expect(out.notLookedUp).toBe(3);
  });

  it('prefers the better-supported answer when two sources disagree, not the higher one', async () => {
    const { deps } = await makeDeps(
      [{ id: 'e1', language: 'ru' }],
      [
        stubProvider('flattering', async () => result('flattering', 5, 3)),
        stubProvider('popular', async () => result('popular', 3.9, 900)),
      ],
    );

    const out = await new AggregateTranslationRatings(deps).execute({ workId: 'work-1' });

    expect(out.editions[0]!.providerId).toBe('popular');
  });

  it('names a source that failed instead of quietly shortening the answer', async () => {
    const { deps, cache } = await makeDeps(
      [
        { id: 'e1', language: 'ru' },
        { id: 'e2', language: 'ru' },
      ],
      [
        stubProvider('google-books', async () => {
          throw new Error('429 Too Many Requests');
        }),
      ],
    );

    const out = await new AggregateTranslationRatings(deps).execute({ workId: 'work-1' });

    // One broken source, one entry — not one per edition it failed on.
    expect(out.degraded).toEqual([{ providerId: 'google-books', reason: '429 Too Many Requests' }]);
    expect(cache.ttlOf(translationRatingsCacheKey('work-1', null, null))).toBe(
      RATINGS_DEGRADED_TTL_SECONDS,
    );
  });

  it('caches a complete answer for a day and serves the next call from it', async () => {
    let calls = 0;
    const { deps, cache } = await makeDeps(
      [{ id: 'e1', language: 'ru' }],
      [
        stubProvider('google-books', async () => {
          calls += 1;
          return result('google-books', 4, 10);
        }),
      ],
    );
    const useCase = new AggregateTranslationRatings(deps);

    await useCase.execute({ workId: 'work-1' });
    await useCase.execute({ workId: 'work-1' });

    expect(calls).toBe(1);
    expect(cache.ttlOf(translationRatingsCacheKey('work-1', null, null))).toBe(RATINGS_TTL_SECONDS);
  });

  it('weights a translator’s average by voters across their rated editions', async () => {
    const ratings: Record<string, [number, number]> = {
      e1: [5, 2],
      e2: [3.8, 400],
      e3: [4.6, 100],
      e4: [4.4, 60],
    };
    const { deps } = await makeDeps(
      [
        { id: 'e1', language: 'ru', translator: 'Наталья Волжина' },
        { id: 'e2', language: 'ru', translator: 'Наталья Волжина' },
        { id: 'e3', language: 'ru', translator: 'Максим Немцов' },
        { id: 'e4', language: 'ru', translator: 'Максим Немцов' },
      ],
      [
        stubProvider('google-books', async (query) => {
          const id = Object.keys(ratings).find((key) => query.title.endsWith(key))!;
          const [average, votes] = ratings[id]!;
          return result('google-books', average, votes);
        }),
      ],
    );

    const out = await new AggregateTranslationRatings(deps).execute({ workId: 'work-1' });

    const volzhina = out.translators.find((row) => row.translator === 'Наталья Волжина')!;
    expect(volzhina.votes).toBe(402);
    expect(volzhina.ratedEditions).toBe(2);
    expect(volzhina.average).toBeCloseTo(3.8, 1);
    // Most-voted first within a language, so the strongest evidence leads.
    expect(out.translators.map((row) => row.translator)).toEqual([
      'Наталья Волжина',
      'Максим Немцов',
    ]);
  });

  it('says nothing about a translator with no rival in the same language', async () => {
    const { deps } = await makeDeps(
      [
        { id: 'e1', language: 'ru', translator: 'Наталья Волжина' },
        { id: 'e2', language: 'fr', translator: 'Boris de Schloezer' },
      ],
      [stubProvider('google-books', async () => result('google-books', 4.2, 50))],
    );

    const out = await new AggregateTranslationRatings(deps).execute({ workId: 'work-1' });

    expect(out.translators).toEqual([]);
  });

  it('marks a handful of votes as too thin to compare on', async () => {
    const { deps } = await makeDeps(
      [{ id: 'e1', language: 'ru' }],
      [stubProvider('google-books', async () => result('google-books', 5, 2))],
    );

    const out = await new AggregateTranslationRatings(deps).execute({ workId: 'work-1' });

    expect(out.editions[0]!.lowConfidence).toBe(true);
  });

  it('rates the editions the caller names, in the order it shows them', async () => {
    const asked: string[] = [];
    const { deps } = await makeDeps(
      [
        { id: 'e1', language: 'ru' },
        { id: 'e2', language: 'ru' },
        { id: 'e3', language: 'ru' },
      ],
      [
        stubProvider('google-books', async (query) => {
          asked.push(query.title);
          return null;
        }),
      ],
    );

    await new AggregateTranslationRatings(deps).execute({
      workId: 'work-1',
      editionIds: ['e3', 'e1'],
    });

    // The page's order, not the table's: the cap has to cut from the bottom of what a reader sees.
    expect(asked).toEqual(['Edition e3', 'Edition e1']);
  });

  it('ignores an edition id that belongs to another work', async () => {
    const asked: string[] = [];
    const { deps } = await makeDeps(
      [{ id: 'e1', language: 'ru' }],
      [
        stubProvider('google-books', async (query) => {
          asked.push(query.title);
          return null;
        }),
      ],
    );

    const out = await new AggregateTranslationRatings(deps).execute({
      workId: 'work-1',
      editionIds: ['e1', 'someone-elses-edition'],
    });

    expect(asked).toEqual(['Edition e1']);
    expect(out.editions).toEqual([]);
  });

  it('caches two different slices of the same list separately', async () => {
    let calls = 0;
    const { deps } = await makeDeps(
      [
        { id: 'e1', language: 'ru' },
        { id: 'e2', language: 'ru' },
      ],
      [
        stubProvider('google-books', async () => {
          calls += 1;
          return result('google-books', 4, 10);
        }),
      ],
    );
    const useCase = new AggregateTranslationRatings(deps);

    await useCase.execute({ workId: 'work-1', editionIds: ['e1'] });
    await useCase.execute({ workId: 'work-1', editionIds: ['e1', 'e2'] });

    expect(calls).toBe(3);
  });

  it('says nothing about a translator with a single rated edition', async () => {
    // Their "average" would be the number already printed on the card above it — read on a live
    // page as a second, independent measurement of the same edition.
    const { deps } = await makeDeps(
      [
        { id: 'e1', language: 'ru', translator: 'Наталья Волжина' },
        { id: 'e2', language: 'ru', translator: 'Наталья Волжина' },
        { id: 'e3', language: 'ru', translator: 'Максим Немцов' },
      ],
      [stubProvider('google-books', async () => result('google-books', 4.2, 50))],
    );

    const out = await new AggregateTranslationRatings(deps).execute({ workId: 'work-1' });

    expect(out.translators.map((row) => row.translator)).toEqual(['Наталья Волжина']);
  });

  it('offers a review link for an edition that has no rating at all', async () => {
    // The whole keyless case: no Google Books key, so no numbers — but Open Library still knows
    // where this printing lives on Goodreads.
    const { deps } = await makeDeps(
      [{ id: 'e1', language: 'ru' }],
      [stubProvider('google-books', async () => null)],
      [
        stubReviewProvider('goodreads', async (queries) =>
          queries.map((query) => ({
            editionId: query.editionId,
            providerId: 'goodreads',
            providerName: 'Goodreads',
            url: 'https://www.goodreads.com/book/show/1560198',
          })),
        ),
      ],
    );

    const out = await new AggregateTranslationRatings(deps).execute({ workId: 'work-1' });

    expect(out.editions).toEqual([]);
    expect(out.reviewLinks).toEqual([
      {
        editionId: 'e1',
        providerId: 'goodreads',
        providerName: 'Goodreads',
        url: 'https://www.goodreads.com/book/show/1560198',
      },
    ]);
  });

  it('asks the review source once for every edition, not once per edition', async () => {
    const batches: ReviewLinkQuery[][] = [];
    const { deps } = await makeDeps(
      [
        { id: 'e1', language: 'ru' },
        { id: 'e2', language: 'ru' },
        { id: 'e3', language: 'ru' },
      ],
      [],
      [
        stubReviewProvider('goodreads', async (queries) => {
          batches.push([...queries]);
          return [];
        }),
      ],
    );

    await new AggregateTranslationRatings(deps).execute({ workId: 'work-1' });

    expect(batches).toHaveLength(1);
    expect(batches[0]!.map((query) => query.editionId)).toEqual(['e1', 'e2', 'e3']);
  });

  it('names a failing review source without losing the ratings it did find', async () => {
    const { deps } = await makeDeps(
      [{ id: 'e1', language: 'ru' }],
      [stubProvider('google-books', async () => result('google-books', 4.2, 90))],
      [
        stubReviewProvider('goodreads', async () => {
          throw new Error('503 Service Unavailable');
        }),
      ],
    );

    const out = await new AggregateTranslationRatings(deps).execute({ workId: 'work-1' });

    expect(out.editions).toHaveLength(1);
    expect(out.degraded).toEqual([{ providerId: 'goodreads', reason: '503 Service Unavailable' }]);
  });
});
