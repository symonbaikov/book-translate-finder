import {
  assertLinkAllowed,
  Edition,
  Isbn,
  LanguageCode,
  NotFoundError,
  ProviderId,
  Work,
} from '@golden/domain';
import { describe, expect, it } from 'vitest';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import { InMemoryEditionRepository } from '../../../domain/test/fakes/in-memory-edition-repository.js';
import { InMemorySourceLinkRepository } from '../../../domain/test/fakes/in-memory-source-link-repository.js';
import { InMemoryWorkRepository } from '../../../domain/test/fakes/in-memory-work-repository.js';
import {
  ListEditionsForWork,
  type ListEditionsForWorkDeps,
} from '../../src/use-cases/list-editions-for-work.use-case.js';

function makeDeps() {
  const workRepository = new InMemoryWorkRepository();
  const editionRepository = new InMemoryEditionRepository();
  const sourceLinkRepository = new InMemorySourceLinkRepository();
  const cache = new InMemoryCache();
  const deps: ListEditionsForWorkDeps = {
    workRepository,
    editionRepository,
    sourceLinkRepository,
    cache,
  };
  return { deps, workRepository, editionRepository, sourceLinkRepository, cache };
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
      sourceLinkRepository: new InMemorySourceLinkRepository(),
      cache,
    };
    const cachedUseCase = new ListEditionsForWork(emptyDeps);
    const enResult = await cachedUseCase.execute({ workId: 'work-1', language: 'en' });
    const frResult = await cachedUseCase.execute({ workId: 'work-1', language: 'fr' });

    expect(enResult.editions.map((e) => e.id)).toEqual(['e1', 'e2']);
    expect(frResult.editions.map((e) => e.id)).toEqual(['e3']);
  });

  it("reports each edition's legal-link count so the list can surface availability upfront", async () => {
    const { deps, workRepository, editionRepository, sourceLinkRepository } = makeDeps();
    await seed(workRepository, editionRepository);
    await sourceLinkRepository.save(
      assertLinkAllowed({
        id: 'link-1',
        editionId: 'e1',
        type: 'borrow',
        url: 'https://openlibrary.org/books/OL1M/x/borrow',
        provider: ProviderId.create('internet-archive'),
        rightsStatus: 'copyrighted',
        verifiedAt: new Date('2026-01-01T00:00:00Z'),
      }),
    );
    const useCase = new ListEditionsForWork(deps);

    const result = await useCase.execute({ workId: 'work-1' });

    const byId = new Map(result.editions.map((e) => [e.id, e.linkCount]));
    expect(byId.get('e1')).toBe(1);
    expect(byId.get('e2')).toBe(0);
    expect(byId.get('e3')).toBe(0);
  });

  it('carries an edition’s free copies on the list itself, so the page need not open a panel to know', async () => {
    const { deps, workRepository, editionRepository, sourceLinkRepository } = makeDeps();
    await seed(workRepository, editionRepository);
    await sourceLinkRepository.save(
      assertLinkAllowed({
        id: 'link-1',
        editionId: 'e1',
        type: 'download',
        url: 'https://www.gutenberg.org/ebooks/2600.epub.noimages',
        provider: ProviderId.create('gutenberg'),
        rightsStatus: 'public_domain',
        format: 'epub',
        verifiedAt: new Date('2026-01-01T00:00:00Z'),
      }),
    );
    const useCase = new ListEditionsForWork(deps);

    const result = await useCase.execute({ workId: 'work-1' });

    const byId = new Map(result.editions.map((e) => [e.id, e.freeDownloads]));
    expect(byId.get('e1')).toEqual([
      {
        url: 'https://www.gutenberg.org/ebooks/2600.epub.noimages',
        format: 'epub',
        provider: 'gutenberg',
        type: 'download',
        rightsStatus: 'public_domain',
      },
    ]);
    // An edition nobody gives away says so with an empty list, not with a missing field.
    expect(byId.get('e2')).toEqual([]);
  });

  it('does not call a public domain borrow link a free copy', async () => {
    // `isLegalFree` is derived from rights status alone, so a public domain scan behind a library
    // queue carries it. Putting that edition first under a "free download" badge would promise a
    // file where there is a waiting list.
    const { deps, workRepository, editionRepository, sourceLinkRepository } = makeDeps();
    await seed(workRepository, editionRepository);
    await sourceLinkRepository.save(
      assertLinkAllowed({
        id: 'link-1',
        editionId: 'e1',
        type: 'borrow',
        url: 'https://openlibrary.org/books/OL1M/x/borrow',
        provider: ProviderId.create('internet-archive'),
        rightsStatus: 'public_domain',
        verifiedAt: new Date('2026-01-01T00:00:00Z'),
      }),
    );
    const useCase = new ListEditionsForWork(deps);

    const result = await useCase.execute({ workId: 'work-1' });

    const edition = result.editions.find((e) => e.id === 'e1');
    expect(edition?.freeDownloads).toEqual([]);
    // Still a link the page should count — it is just not a free copy.
    expect(edition?.linkCount).toBe(1);
  });

  it('flags every edition as buyable — a missing ISBN falls back to a title search', async () => {
    // Found live in Phase 3: an edition with no borrow/download link showed no badge at all, even
    // though bookstore lookups were available behind the expand. Since shops fall back to a title
    // search, that is true of every edition — including the 16% that carry no ISBN.
    const { deps, workRepository, editionRepository } = makeDeps();
    await seed(workRepository, editionRepository);
    await editionRepository.save(
      Edition.create({
        id: 'e-isbn',
        workId: 'work-1',
        title: 'War and Peace',
        language: LanguageCode.create('en'),
        publisher: 'Vintage',
        year: 2008,
        isbn: Isbn.create('9780140447934'),
      }),
    );
    const useCase = new ListEditionsForWork(deps);

    const result = await useCase.execute({ workId: 'work-1' });

    const byId = new Map(result.editions.map((e) => [e.id, e.hasBookstores]));
    expect(byId.get('e-isbn')).toBe(true);
    expect(byId.get('e1')).toBe(true); // seeded without an ISBN — searched by title instead
  });

  it('offers no cover at all when the source gave none, rather than guessing one from the ISBN', async () => {
    const { deps, workRepository, editionRepository } = makeDeps();
    await seed(workRepository, editionRepository);
    await editionRepository.save(
      Edition.create({
        id: 'e-isbn',
        workId: 'work-1',
        title: 'War and Peace',
        language: LanguageCode.create('en'),
        publisher: 'Vintage',
        year: 2008,
        isbn: Isbn.create('9780140447934'),
      }),
    );
    const useCase = new ListEditionsForWork(deps);

    const result = await useCase.execute({ workId: 'work-1' });

    // The ISBN-keyed cover endpoint answers 404 for exactly these editions (35 of 35 sampled from
    // real data — see the use case), so a derived URL was a round trip that bought a placeholder.
    // The UI's typographic fallback is the same placeholder, arrived at instantly.
    const uncovered = result.editions.find((e) => e.id === 'e-isbn');
    expect(uncovered?.isbn).toBe('9780140447934');
    expect(uncovered?.coverUrl).toBeNull();
  });
});
