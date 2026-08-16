import { NotFoundError } from '@golden/domain';
import type {
  AggregateTranslationRatings,
  AggregateTranslationRatingsOutput,
  GetWorkCard,
  GetWorkCardOutput,
  ListEditionsForWork,
  ListEditionsForWorkOutput,
} from '@golden/application';
import { describe, expect, it, vi } from 'vitest';
import { WorksController } from './works.controller.js';

function makeGetWorkCard(output: GetWorkCardOutput): GetWorkCard {
  return { execute: vi.fn(async () => output) } as unknown as GetWorkCard;
}

function makeListEditions(output: ListEditionsForWorkOutput): ListEditionsForWork {
  return { execute: vi.fn(async () => output) } as unknown as ListEditionsForWork;
}

const RATINGS: AggregateTranslationRatingsOutput = {
  workId: 'w1',
  editions: [],
  reviewLinks: [],
  translators: [],
  withoutIsbn: 0,
  notLookedUp: 0,
  degraded: [],
  retrievedAt: '2026-08-16T10:00:00.000Z',
};

function makeRatings(
  output: AggregateTranslationRatingsOutput = RATINGS,
): AggregateTranslationRatings {
  return { execute: vi.fn(async () => output) } as unknown as AggregateTranslationRatings;
}

function makeController(
  getWorkCard: GetWorkCard,
  listEditions: ListEditionsForWork,
  ratings: AggregateTranslationRatings = makeRatings(),
): WorksController {
  return new WorksController(getWorkCard, listEditions, ratings);
}

const CARD: GetWorkCardOutput = {
  id: 'w1',
  originalTitle: 'War and Peace',
  originalLanguage: 'ru',
  author: 'Leo Tolstoy',
  firstPublishedYear: 1869,
  description: null,
  descriptionLanguage: null,
  descriptionSource: null,
  coverUrl: null,
  subjects: ['dystopia'],
  translatedLanguages: ['en'],
  editionCount: 2,
  sources: ['open-library'],
};

describe('WorksController', () => {
  it('returns the card for a known work', async () => {
    const getWorkCard = makeGetWorkCard(CARD);
    const controller = makeController(
      getWorkCard,
      makeListEditions({ workId: 'w1', editions: [] }),
    );

    const result = await controller.getCard('w1', {});

    expect(result).toEqual(CARD);
  });

  it('propagates NotFoundError for an unknown work', async () => {
    const getWorkCard = {
      execute: vi.fn(async () => {
        throw new NotFoundError('Work not found: missing');
      }),
    } as unknown as GetWorkCard;
    const controller = makeController(
      getWorkCard,
      makeListEditions({ workId: 'w1', editions: [] }),
    );

    await expect(controller.getCard('missing', {})).rejects.toThrow(NotFoundError);
  });

  it("asks the card for a description in the reader's language when one is requested", async () => {
    const getWorkCard = makeGetWorkCard(CARD);
    const controller = makeController(
      getWorkCard,
      makeListEditions({ workId: 'w1', editions: [] }),
    );

    await controller.getCard('w1', { language: 'ru' });

    expect(getWorkCard.execute).toHaveBeenCalledWith({ workId: 'w1', language: 'ru' });
  });

  it('omits the language instead of passing undefined (exactOptionalPropertyTypes)', async () => {
    const getWorkCard = makeGetWorkCard(CARD);
    const controller = makeController(
      getWorkCard,
      makeListEditions({ workId: 'w1', editions: [] }),
    );

    await controller.getCard('w1', {});

    expect(getWorkCard.execute).toHaveBeenCalledWith({ workId: 'w1' });
  });

  it('passes language and year filters through when present', async () => {
    const listEditions = makeListEditions({ workId: 'w1', editions: [] });
    const controller = makeController(makeGetWorkCard(CARD), listEditions);

    await controller.listEditions('w1', { language: 'en', year: '2005' });

    expect(listEditions.execute).toHaveBeenCalledWith({ workId: 'w1', language: 'en', year: 2005 });
  });

  it('omits absent filters instead of passing undefined (exactOptionalPropertyTypes)', async () => {
    const listEditions = makeListEditions({ workId: 'w1', editions: [] });
    const controller = makeController(makeGetWorkCard(CARD), listEditions);

    await controller.listEditions('w1', {});

    expect(listEditions.execute).toHaveBeenCalledWith({ workId: 'w1' });
  });

  it('passes a language filter through to the ratings, so the two lists agree', async () => {
    const ratings = makeRatings();
    const controller = makeController(
      makeGetWorkCard(CARD),
      makeListEditions({ workId: 'w1', editions: [] }),
      ratings,
    );

    await controller.ratings('w1', { language: 'ru' });

    expect(ratings.execute).toHaveBeenCalledWith({ workId: 'w1', language: 'ru' });
  });

  it('omits an absent language instead of passing undefined (exactOptionalPropertyTypes)', async () => {
    const ratings = makeRatings();
    const controller = makeController(
      makeGetWorkCard(CARD),
      makeListEditions({ workId: 'w1', editions: [] }),
      ratings,
    );

    await controller.ratings('w1', {});

    expect(ratings.execute).toHaveBeenCalledWith({ workId: 'w1' });
  });

  it('returns the gaps in the answer, not only the ratings it found', async () => {
    const controller = makeController(
      makeGetWorkCard(CARD),
      makeListEditions({ workId: 'w1', editions: [] }),
      makeRatings({
        ...RATINGS,
        editions: [
          {
            editionId: 'e1',
            providerId: 'google-books',
            providerName: 'Google Books',
            average: 4.3,
            outOf: 5,
            votes: 212,
            lowConfidence: false,
            url: null,
          },
        ],
        reviewLinks: [
          {
            editionId: 'e2',
            providerId: 'goodreads',
            providerName: 'Goodreads',
            url: 'https://www.goodreads.com/book/show/1560198',
          },
        ],
        withoutIsbn: 4,
        notLookedUp: 2,
      }),
    );

    const result = await controller.ratings('w1', {});

    expect(result.editions).toHaveLength(1);
    // A link for an edition with no rating survives the contract parse — the keyless normal case.
    expect(result.reviewLinks).toHaveLength(1);
    expect(result.withoutIsbn).toBe(4);
    expect(result.notLookedUp).toBe(2);
  });
});
