import {
  computeUrlHash,
  Edition,
  LanguageCode,
  NotFoundError,
  ProviderId,
  SourceLink,
} from '@btf/domain';
import { describe, expect, it } from 'vitest';
import { CACHE_KEY_VERSION } from '../../src/cache-key-version.js';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import { InMemoryEditionRepository } from '../../../domain/test/fakes/in-memory-edition-repository.js';
import { InMemorySourceLinkRepository } from '../../../domain/test/fakes/in-memory-source-link-repository.js';
import {
  editionLinksCacheKey,
  GetEditionLinks,
  type GetEditionLinksDeps,
} from '../../src/use-cases/get-edition-links.use-case.js';

function makeDeps() {
  const editionRepository = new InMemoryEditionRepository();
  const sourceLinkRepository = new InMemorySourceLinkRepository();
  const cache = new InMemoryCache();
  const deps: GetEditionLinksDeps = { editionRepository, sourceLinkRepository, cache };
  return { deps, editionRepository, sourceLinkRepository, cache };
}

async function seedEdition(editionRepository: InMemoryEditionRepository): Promise<void> {
  await editionRepository.save(
    Edition.create({
      id: 'e1',
      workId: 'work-1',
      title: 'War and Peace',
      language: LanguageCode.create('en'),
    }),
  );
}

function makeLink(
  url: string,
  overrides: Partial<Parameters<typeof SourceLink.rehydrateFromStorage>[0]> = {},
) {
  return SourceLink.rehydrateFromStorage({
    id: `link-${url}`,
    editionId: 'e1',
    type: 'download',
    url,
    urlHash: computeUrlHash(url),
    provider: ProviderId.create('gutenberg'),
    rightsStatus: 'public_domain',
    isLegalFree: true,
    verifiedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  });
}

describe('GetEditionLinks', () => {
  it('throws NotFoundError for an unknown edition', async () => {
    const { deps } = makeDeps();
    const useCase = new GetEditionLinks(deps);

    await expect(useCase.execute({ editionId: 'missing' })).rejects.toThrow(NotFoundError);
  });

  it('returns links with an explicit rightsStatus each (docs/legal-policy.md)', async () => {
    const { deps, editionRepository, sourceLinkRepository } = makeDeps();
    await seedEdition(editionRepository);
    await sourceLinkRepository.save(makeLink('https://gutenberg.org/ebooks/1'));

    const useCase = new GetEditionLinks(deps);
    const result = await useCase.execute({ editionId: 'e1' });

    expect(result.links).toEqual([
      {
        type: 'download',
        provider: 'gutenberg',
        rightsStatus: 'public_domain',
        url: 'https://gutenberg.org/ebooks/1',
      },
    ]);
  });

  it('returns an empty link list for an edition with no links, not an error', async () => {
    const { deps, editionRepository } = makeDeps();
    await seedEdition(editionRepository);

    const useCase = new GetEditionLinks(deps);
    const result = await useCase.execute({ editionId: 'e1' });

    expect(result.links).toEqual([]);
  });

  it('caches under a key prefixed by the owning work id (docs/architecture.md §6)', async () => {
    const { deps, editionRepository, sourceLinkRepository, cache } = makeDeps();
    await seedEdition(editionRepository);
    await sourceLinkRepository.save(makeLink('https://gutenberg.org/ebooks/1'));
    const useCase = new GetEditionLinks(deps);

    await useCase.execute({ editionId: 'e1' });

    expect(await cache.get(editionLinksCacheKey('work-1', 'e1'))).not.toBeNull();

    // A prefix-based invalidation of the owning work must be able to reach this key.
    await cache.deleteByPrefix(`${CACHE_KEY_VERSION}:work:work-1`);
    expect(await cache.get(editionLinksCacheKey('work-1', 'e1'))).toBeNull();
  });
});
