import { NotFoundError } from '@golden/domain';
import type {
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
    const controller = new WorksController(
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
    const controller = new WorksController(
      getWorkCard,
      makeListEditions({ workId: 'w1', editions: [] }),
    );

    await expect(controller.getCard('missing', {})).rejects.toThrow(NotFoundError);
  });

  it("asks the card for a description in the reader's language when one is requested", async () => {
    const getWorkCard = makeGetWorkCard(CARD);
    const controller = new WorksController(
      getWorkCard,
      makeListEditions({ workId: 'w1', editions: [] }),
    );

    await controller.getCard('w1', { language: 'ru' });

    expect(getWorkCard.execute).toHaveBeenCalledWith({ workId: 'w1', language: 'ru' });
  });

  it('omits the language instead of passing undefined (exactOptionalPropertyTypes)', async () => {
    const getWorkCard = makeGetWorkCard(CARD);
    const controller = new WorksController(
      getWorkCard,
      makeListEditions({ workId: 'w1', editions: [] }),
    );

    await controller.getCard('w1', {});

    expect(getWorkCard.execute).toHaveBeenCalledWith({ workId: 'w1' });
  });

  it('passes language and year filters through when present', async () => {
    const listEditions = makeListEditions({ workId: 'w1', editions: [] });
    const controller = new WorksController(makeGetWorkCard(CARD), listEditions);

    await controller.listEditions('w1', { language: 'en', year: '2005' });

    expect(listEditions.execute).toHaveBeenCalledWith({ workId: 'w1', language: 'en', year: 2005 });
  });

  it('omits absent filters instead of passing undefined (exactOptionalPropertyTypes)', async () => {
    const listEditions = makeListEditions({ workId: 'w1', editions: [] });
    const controller = new WorksController(makeGetWorkCard(CARD), listEditions);

    await controller.listEditions('w1', {});

    expect(listEditions.execute).toHaveBeenCalledWith({ workId: 'w1' });
  });
});
