import type { GetEditionLinks, GetEditionLinksOutput } from '@btf/application';
import { describe, expect, it, vi } from 'vitest';
import { EditionsController } from './editions.controller.js';

describe('EditionsController', () => {
  it('returns links with each carrying its own rightsStatus (docs/legal-policy.md)', async () => {
    const output: GetEditionLinksOutput = {
      editionId: 'e1',
      links: [
        {
          type: 'download',
          provider: 'gutenberg',
          rightsStatus: 'public_domain',
          url: 'https://gutenberg.org/1',
        },
      ],
    };
    const getEditionLinks = { execute: vi.fn(async () => output) } as unknown as GetEditionLinks;
    const controller = new EditionsController(getEditionLinks);

    const result = await controller.links('e1');

    expect(result).toEqual(output);
    expect(getEditionLinks.execute).toHaveBeenCalledWith({ editionId: 'e1' });
  });
});
