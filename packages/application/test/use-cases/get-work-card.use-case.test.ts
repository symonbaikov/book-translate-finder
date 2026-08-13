import { Edition, LanguageCode, NotFoundError, Work } from '@btf/domain';
import { describe, expect, it } from 'vitest';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import { InMemoryEditionRepository } from '../../../domain/test/fakes/in-memory-edition-repository.js';
import { InMemoryWorkRepository } from '../../../domain/test/fakes/in-memory-work-repository.js';
import {
  GetWorkCard,
  workCacheKey,
  type GetWorkCardDeps,
} from '../../src/use-cases/get-work-card.use-case.js';

function makeDeps() {
  const workRepository = new InMemoryWorkRepository();
  const editionRepository = new InMemoryEditionRepository();
  const cache = new InMemoryCache();
  const deps: GetWorkCardDeps = { workRepository, editionRepository, cache };
  return { deps, workRepository, editionRepository, cache };
}

async function seedWork(workRepository: InMemoryWorkRepository): Promise<Work> {
  const work = Work.create({
    id: 'work-1',
    originalTitle: 'War and Peace',
    originalLanguage: LanguageCode.create('ru'),
    author: 'Leo Tolstoy',
    firstPublishedYear: 1869,
    syncedAt: new Date('2026-01-01T00:00:00Z'),
  });
  await workRepository.save(work);
  return work;
}

describe('GetWorkCard', () => {
  it('throws NotFoundError for an unknown work', async () => {
    const { deps } = makeDeps();
    const useCase = new GetWorkCard(deps);

    await expect(useCase.execute({ workId: 'missing' })).rejects.toThrow(NotFoundError);
  });

  it('returns the card with distinct translated languages excluding the original', async () => {
    const { deps, workRepository, editionRepository } = makeDeps();
    await seedWork(workRepository);
    await editionRepository.save(
      Edition.create({
        id: 'e1',
        workId: 'work-1',
        title: 'Война и мир',
        language: LanguageCode.create('ru'),
      }),
    );
    await editionRepository.save(
      Edition.create({
        id: 'e2',
        workId: 'work-1',
        title: 'War and Peace',
        language: LanguageCode.create('en'),
      }),
    );
    await editionRepository.save(
      Edition.create({
        id: 'e3',
        workId: 'work-1',
        title: 'Guerre et Paix',
        language: LanguageCode.create('fr'),
      }),
    );

    const useCase = new GetWorkCard(deps);
    const result = await useCase.execute({ workId: 'work-1' });

    expect(result.editionCount).toBe(3);
    expect(result.translatedLanguages).toEqual(['en', 'fr']);
  });

  it('caches the card so a repeat call skips the repositories', async () => {
    const { deps, workRepository, cache } = makeDeps();
    await seedWork(workRepository);
    const useCase = new GetWorkCard(deps);
    await useCase.execute({ workId: 'work-1' });

    expect(await cache.get(workCacheKey('work-1'))).not.toBeNull();

    // Swap in an empty work repository — if the second call still succeeds, it read from cache.
    const emptyRepo = new InMemoryWorkRepository();
    const cachedUseCase = new GetWorkCard({ ...deps, workRepository: emptyRepo });
    const result = await cachedUseCase.execute({ workId: 'work-1' });

    expect(result.id).toBe('work-1');
  });
});
