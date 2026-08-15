import type {
  AggregateEditionPrices,
  AggregateEditionPricesOutput,
  GetEditionLinks,
  GetEditionLinksOutput,
} from '@golden/application';
import { describe, expect, it, vi } from 'vitest';
import { EditionsController } from './editions.controller.js';

function makeUseCase(output: GetEditionLinksOutput): GetEditionLinks {
  return { execute: vi.fn(async () => output) } as unknown as GetEditionLinks;
}

const PRICES: AggregateEditionPricesOutput = {
  editionId: 'e1',
  groups: [
    {
      format: 'paperback',
      offers: [
        {
          providerId: 'waterstones',
          providerName: 'Waterstones',
          format: 'paperback',
          amountMinor: null,
          amount: null,
          currency: null,
          url: 'https://www.waterstones.com/books/search/term/9780140447934',
          availability: 'unknown',
          note: 'Shop in your country',
        },
      ],
    },
  ],
  degraded: [],
  retrievedAt: '2026-08-14T10:00:00.000Z',
};

function makePricesUseCase(): AggregateEditionPrices {
  return { execute: vi.fn(async () => PRICES) } as unknown as AggregateEditionPrices;
}

const OUTPUT: GetEditionLinksOutput = {
  editionId: 'e1',
  links: [
    {
      type: 'download',
      provider: 'gutenberg',
      rightsStatus: 'public_domain',
      url: 'https://gutenberg.org/1',
    },
  ],
  bookstores: [
    {
      type: 'buy',
      provider: 'waterstones',
      providerName: 'Waterstones',
      rightsStatus: 'copyrighted',
      url: 'https://www.waterstones.com/books/search/term/9780140447934',
    },
  ],
};

describe('EditionsController', () => {
  it('returns links with each carrying its own rightsStatus (docs/legal-policy.md)', async () => {
    const getEditionLinks = makeUseCase(OUTPUT);
    const controller = new EditionsController(getEditionLinks, makePricesUseCase());

    const result = await controller.links('e1', {});

    expect(result).toEqual(OUTPUT);
    expect(getEditionLinks.execute).toHaveBeenCalledWith({ editionId: 'e1' });
  });

  it('passes the country through so bookstores match where the reader shops', async () => {
    const getEditionLinks = makeUseCase(OUTPUT);
    const controller = new EditionsController(getEditionLinks, makePricesUseCase());

    await controller.links('e1', { country: 'GB' });

    expect(getEditionLinks.execute).toHaveBeenCalledWith({ editionId: 'e1', country: 'GB' });
  });

  it('serves prices grouped by format, with an unpriced shop kept in the list', async () => {
    const prices = makePricesUseCase();
    const controller = new EditionsController(makeUseCase(OUTPUT), prices);

    const result = await controller.prices('e1', { country: 'GB' });

    expect(result.groups[0]?.offers[0]?.amountMinor).toBeNull();
    expect(prices.execute).toHaveBeenCalledWith({ editionId: 'e1', country: 'GB' });
  });

  it('rejects a malformed country instead of silently ignoring it', async () => {
    const controller = new EditionsController(makeUseCase(OUTPUT), makePricesUseCase());

    await expect(controller.links('e1', { country: 'GBR' })).rejects.toThrow();
  });
});
