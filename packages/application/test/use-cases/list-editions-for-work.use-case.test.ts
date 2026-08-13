import { Edition, LanguageCode, NotFoundError, Work } from '@btf/domain';
import { describe, expect, it } from 'vitest';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import { InMemoryEditionRepository } from '../../../domain/test/fakes/in-memory-edition-repository.js';
import { InMemoryWorkRepository } from '../../../domain/test/fakes/in-memory-work-repository.js';
import {
  ListEditionsForWork,
  type ListEditionsForWorkDeps,
} from '../../src/use-cases/list-editions-for-work.use-case.js';

function makeDeps() {
  const workRepository = new InMemoryWorkRepository();
  const editionRepository = new InMemoryEditionRepository();
  const cache = new InMemoryCache();
  const deps: ListEditionsForWorkDeps = { workRepository, editionRepository, cache };
  return { deps, workRepository, editionRepository, cache };
}

async function seed(
  workRepository: InMemoryWorkRepository,
  editionRepository: InMemoryEditionRepository,
) {
  await workRepository.save(
    Work.create({
      id: 'work-1',
      originalTitle: 'War and Peace',
      originalLanguage: LanguageCode.create('ru'),
      author: 'Leo Tolstoy',
      firstPublishedYear: 1869,
      syncedAt: new Date('2026-01-01T00:00:00Z'),
    }),
  );
  await editionRepository.save(
    Edition.create({
      id: 'e1',
      workId: 'work-1',
      title: 'War and Peace',
      language: LanguageCode.create('en'),
      publisher: 'Penguin',
      year: 2005,
    }),
  );
  await editionRepository.save(
    Edition.create({
      id: 'e2',
      workId: 'work-1',
      title: 'War and Peace',
      language: LanguageCode.create('en'),
      publisher: 'Oxford',
      year: 1990,
    }),
  );
  await editionRepository.save(
    Edition.create({
      id: 'e3',
      workId: 'work-1',
      title: 'Guerre et Paix',
      language: LanguageCode.create('fr'),
      year: 1990,
    }),
  );
}

describe('ListEditionsForWork', () => {
  it('throws NotFoundError for an unknown work', async () => {
    const { deps } = makeDeps();
    const useCase = new ListEditionsForWork(deps);

    await expect(useCase.execute({ workId: 'missing' })).rejects.toThrow(NotFoundError);
  });

  it('returns all editions with no filters', async () => {
    const { deps, workRepository, editionRepository } = makeDeps();
    await seed(workRepository, editionRepository);
    const useCase = new ListEditionsForWork(deps);

    const result = await useCase.execute({ workId: 'work-1' });

    expect(result.editions).toHaveLength(3);
  });

  it('filters by language', async () => {
    const { deps, workRepository, editionRepository } = makeDeps();
    await seed(workRepository, editionRepository);
    const useCase = new ListEditionsForWork(deps);

    const result = await useCase.execute({ workId: 'work-1', language: 'fr' });

    expect(result.editions.map((e) => e.id)).toEqual(['e3']);
  });

  it('filters by year', async () => {
    const { deps, workRepository, editionRepository } = makeDeps();
    await seed(workRepository, editionRepository);
    const useCase = new ListEditionsForWork(deps);

    const result = await useCase.execute({ workId: 'work-1', year: 1990 });

    expect(result.editions.map((e) => e.id).sort()).toEqual(['e2', 'e3']);
  });

  it('combines language and year filters', async () => {
    const { deps, workRepository, editionRepository } = makeDeps();
    await seed(workRepository, editionRepository);
    const useCase = new ListEditionsForWork(deps);

    const result = await useCase.execute({ workId: 'work-1', language: 'en', year: 1990 });

    expect(result.editions.map((e) => e.id)).toEqual(['e2']);
  });

  it('caches results per distinct filter combination', async () => {
    const { deps, workRepository, editionRepository, cache } = makeDeps();
    await seed(workRepository, editionRepository);
    const useCase = new ListEditionsForWork(deps);

    await useCase.execute({ workId: 'work-1', language: 'en' });
    await useCase.execute({ workId: 'work-1', language: 'fr' });

    // Two distinct cache entries, not one overwritten by the other.
    const emptyDeps: ListEditionsForWorkDeps = {
      workRepository: new InMemoryWorkRepository(),
      editionRepository: new InMemoryEditionRepository(),
      cache,
    };
    const cachedUseCase = new ListEditionsForWork(emptyDeps);
    const enResult = await cachedUseCase.execute({ workId: 'work-1', language: 'en' });
    const frResult = await cachedUseCase.execute({ workId: 'work-1', language: 'fr' });

    expect(enResult.editions.map((e) => e.id)).toEqual(['e1', 'e2']);
    expect(frResult.editions.map((e) => e.id)).toEqual(['e3']);
  });
});
