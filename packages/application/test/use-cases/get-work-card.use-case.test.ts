import {
  Edition,
  ExternalRef,
  LanguageCode,
  NotFoundError,
  Work,
  type LocalizedDescription,
  type LocalizedDescriptionPort,
  type LocalizedDescriptionQuery,
} from '@golden/domain';
import { describe, expect, it } from 'vitest';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import { InMemoryEditionRepository } from '../../../domain/test/fakes/in-memory-edition-repository.js';
import { InMemoryExternalRefRepository } from '../../../domain/test/fakes/in-memory-external-ref-repository.js';
import { InMemoryWorkRepository } from '../../../domain/test/fakes/in-memory-work-repository.js';
import {
  GetWorkCard,
  workCacheKey,
  type GetWorkCardDeps,
} from '../../src/use-cases/get-work-card.use-case.js';

function makeDeps() {
  const workRepository = new InMemoryWorkRepository();
  const editionRepository = new InMemoryEditionRepository();
  const externalRefRepository = new InMemoryExternalRefRepository();
  const cache = new InMemoryCache();
  const deps: GetWorkCardDeps = {
    workRepository,
    editionRepository,
    externalRefRepository,
    cache,
  };
  return { deps, workRepository, editionRepository, externalRefRepository, cache };
}

class FakeLocalizedDescriptions implements LocalizedDescriptionPort {
  readonly asked: LocalizedDescriptionQuery[] = [];

  constructor(private readonly byOlid: Record<string, LocalizedDescription>) {}

  async fetchDescription(query: LocalizedDescriptionQuery): Promise<LocalizedDescription | null> {
    this.asked.push(query);
    return this.byOlid[`${query.openLibraryWorkId}:${query.language}`] ?? null;
  }
}

const RU_DESCRIPTION: LocalizedDescription = {
  text: 'Роман-эпопея Льва Толстого.',
  language: 'ru',
  sourceName: 'wikipedia',
  sourceUrl: 'https://ru.wikipedia.org/wiki/Война_и_мир',
};

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

  it('returns every distinct source that has contributed to the work, sorted alphabetically', async () => {
    const { deps, workRepository, externalRefRepository } = makeDeps();
    await seedWork(workRepository);
    await externalRefRepository.save(ExternalRef.create('google-books', 'gb-1'), 'work', 'work-1');
    await externalRefRepository.save(
      ExternalRef.create('open-library', '/works/OL1W'),
      'work',
      'work-1',
    );

    const useCase = new GetWorkCard(deps);
    const result = await useCase.execute({ workId: 'work-1' });

    expect(result.sources).toEqual(['google-books', 'open-library']);
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

  it('describes the book in the reader’s language when a source has one', async () => {
    const { deps, workRepository, externalRefRepository } = makeDeps();
    await seedWork(workRepository);
    await externalRefRepository.save(
      ExternalRef.create('open-library', '/works/OL267096W'),
      'work',
      'work-1',
    );
    const descriptions = new FakeLocalizedDescriptions({
      '/works/OL267096W:ru': RU_DESCRIPTION,
    });

    const useCase = new GetWorkCard({ ...deps, localizedDescription: descriptions });
    const result = await useCase.execute({ workId: 'work-1', language: 'ru' });

    expect(result.description).toBe('Роман-эпопея Льва Толстого.');
    expect(result.descriptionLanguage).toBe('ru');
    expect(result.descriptionSource).toEqual({
      name: 'wikipedia',
      url: 'https://ru.wikipedia.org/wiki/Война_и_мир',
    });
  });

  it('keeps the stored description and claims no language for it when the source has none', async () => {
    const { deps, workRepository, externalRefRepository } = makeDeps();
    await workRepository.save(
      Work.create({
        id: 'work-1',
        originalTitle: 'War and Peace',
        originalLanguage: LanguageCode.create('ru'),
        author: 'Leo Tolstoy',
        firstPublishedYear: 1869,
        description: 'A novel of Russia during the Napoleonic wars.',
        syncedAt: new Date('2026-01-01T00:00:00Z'),
      }),
    );
    await externalRefRepository.save(
      ExternalRef.create('open-library', '/works/OL267096W'),
      'work',
      'work-1',
    );

    const useCase = new GetWorkCard({
      ...deps,
      localizedDescription: new FakeLocalizedDescriptions({}),
    });
    const result = await useCase.execute({ workId: 'work-1', language: 'ru' });

    expect(result.description).toBe('A novel of Russia during the Napoleonic wars.');
    // Not 'en': Open Library never states the language, and guessing it is how a card starts lying.
    expect(result.descriptionLanguage).toBeNull();
    expect(result.descriptionSource).toBeNull();
  });

  it('does not go looking when the reader asked for no particular language', async () => {
    const { deps, workRepository, externalRefRepository } = makeDeps();
    await seedWork(workRepository);
    await externalRefRepository.save(
      ExternalRef.create('open-library', '/works/OL267096W'),
      'work',
      'work-1',
    );
    const descriptions = new FakeLocalizedDescriptions({ '/works/OL267096W:ru': RU_DESCRIPTION });

    await new GetWorkCard({ ...deps, localizedDescription: descriptions }).execute({
      workId: 'work-1',
    });

    expect(descriptions.asked).toEqual([]);
  });

  it('asks nothing for a work no Open Library id points at — an exact id or nothing', async () => {
    const { deps, workRepository, externalRefRepository } = makeDeps();
    await seedWork(workRepository);
    await externalRefRepository.save(ExternalRef.create('google-books', 'gb-1'), 'work', 'work-1');
    const descriptions = new FakeLocalizedDescriptions({ '/works/OL267096W:ru': RU_DESCRIPTION });

    const result = await new GetWorkCard({
      ...deps,
      localizedDescription: descriptions,
    }).execute({ workId: 'work-1', language: 'ru' });

    expect(descriptions.asked).toEqual([]);
    expect(result.descriptionLanguage).toBeNull();
  });

  it('caches per language, so the Russian card never comes back for a German reader', async () => {
    const { deps, workRepository, externalRefRepository, cache } = makeDeps();
    await seedWork(workRepository);
    await externalRefRepository.save(
      ExternalRef.create('open-library', '/works/OL267096W'),
      'work',
      'work-1',
    );
    const useCase = new GetWorkCard({
      ...deps,
      localizedDescription: new FakeLocalizedDescriptions({
        '/works/OL267096W:ru': RU_DESCRIPTION,
      }),
    });

    await useCase.execute({ workId: 'work-1', language: 'ru' });

    expect(await cache.get(workCacheKey('work-1', 'ru'))).not.toBeNull();
    expect(await cache.get(workCacheKey('work-1'))).toBeNull();
    expect(await cache.get(workCacheKey('work-1', 'de'))).toBeNull();
  });
});
