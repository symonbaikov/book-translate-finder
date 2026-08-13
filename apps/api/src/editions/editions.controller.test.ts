import type { GetEditionLinks, GetEditionLinksOutput } from '@btf/application';
import { describe, expect, it, vi } from 'vitest';
import { EditionsController } from './editions.controller.js';

function makeUseCase(output: GetEditionLinksOutput): GetEditionLinks {
  return { execute: vi.fn(async () => output) } as unknown as GetEditionLinks;
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
    const controller = new EditionsController(getEditionLinks);

    const result = await controller.links('e1', {});

    expect(result).toEqual(OUTPUT);
    expect(getEditionLinks.execute).toHaveBeenCalledWith({ editionId: 'e1' });
  });

  it('passes the country through so bookstores match where the reader shops', async () => {
    const getEditionLinks = makeUseCase(OUTPUT);
    const controller = new EditionsController(getEditionLinks);

    await controller.links('e1', { country: 'GB' });

    expect(getEditionLinks.execute).toHaveBeenCalledWith({ editionId: 'e1', country: 'GB' });
  });

  it('rejects a malformed country instead of silently ignoring it', async () => {
    const controller = new EditionsController(makeUseCase(OUTPUT));

    await expect(controller.links('e1', { country: 'GBR' })).rejects.toThrow();
  });
});
