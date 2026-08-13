import type {
  BookMetadataProvider,
  CachePort,
  Clock,
  Edition,
  EditionRepository,
  ExternalRef,
  ExternalRefEntityType,
  ExternalRefRepository,
  IdGenerator,
  ProviderEdition,
  ProviderWork,
  SearchQuery,
  SourceLink,
  SourceLinkRepository,
  SyncLogEntry,
  UnitOfWork,
  Work,
  WorkRepository,
} from '@btf/domain';
import { InvalidInputError, ProviderId } from '@btf/domain';
import { describe, expect, it } from 'vitest';
import { CACHE_KEY_VERSION } from '../../src/cache-key-version.js';
import {
  SyncWorkFromSource,
  type SyncWorkFromSourceDeps,
} from '../../src/use-cases/sync-work-from-source.use-case.js';

// Small local fakes, not domain's packages/domain/test/fakes/* — a cross-package relative import
// reaching from this package's test/ dir into another package's test/ dir (a double hop: this
// file -> domain/test/fakes/*.ts -> domain/src/*.ts) hit an unresolved Vite module-resolution
// failure specific to that chain (never previously exercised — infrastructure's integration
// tests only reach into domain/test/contract, which stays one hop from domain/src). These fakes
// are trivial enough that duplicating them locally is cheaper than chasing that down.

class InMemoryWorkRepositoryFake implements WorkRepository {
  private readonly byId = new Map<string, Work>();
  private readonly idByNaturalKey = new Map<string, string>();
  async findByNaturalKey(naturalKey: string) {
    const id = this.idByNaturalKey.get(naturalKey);
    return id ? (this.byId.get(id) ?? null) : null;
  }
  async findById(id: string) {
    return this.byId.get(id) ?? null;
  }
  async save(entity: Work) {
    this.byId.set(entity.id, entity);
    this.idByNaturalKey.set(entity.naturalKey, entity.id);
  }
}

class InMemoryEditionRepositoryFake implements EditionRepository {
  private readonly byId = new Map<string, Edition>();
  private readonly idByNaturalKey = new Map<string, string>();
  async findByNaturalKey(naturalKey: string) {
    const id = this.idByNaturalKey.get(naturalKey);
    return id ? (this.byId.get(id) ?? null) : null;
  }
  async findById(id: string) {
    return this.byId.get(id) ?? null;
  }
  async findByWorkId(workId: string) {
    return [...this.byId.values()].filter((e) => e.workId === workId);
  }
  async save(entity: Edition) {
    this.byId.set(entity.id, entity);
    this.idByNaturalKey.set(entity.naturalKey, entity.id);
  }
}

class InMemorySourceLinkRepositoryFake implements SourceLinkRepository {
  private readonly byId = new Map<string, SourceLink>();
  async findByEditionId(editionId: string) {
    return [...this.byId.values()].filter((l) => l.editionId === editionId);
  }
  async save(link: SourceLink) {
    this.byId.set(link.id, link);
  }
}

class InMemoryExternalRefRepositoryFake implements ExternalRefRepository {
  private readonly byKey = new Map<
    string,
    { sourceName: string; entityType: ExternalRefEntityType; entityId: string }
  >();
  private key(ref: ExternalRef) {
    return `${ref.sourceName}|${ref.externalId}`;
  }
  async findBySourceAndExternalId(ref: ExternalRef) {
    return this.byKey.get(this.key(ref)) ?? null;
  }
  async save(ref: ExternalRef, entityType: ExternalRefEntityType, entityId: string) {
    this.byKey.set(this.key(ref), { sourceName: ref.sourceName, entityType, entityId });
  }
  async findSourcesForEntity(entityId: string) {
    return [
      ...new Set(
        [...this.byKey.values()].filter((r) => r.entityId === entityId).map((r) => r.sourceName),
      ),
    ];
  }
}

class RecordingSyncLogRepository {
  readonly entries: SyncLogEntry[] = [];
  async record(entry: SyncLogEntry): Promise<void> {
    this.entries.push(entry);
  }
}

class InMemoryUnitOfWorkFake implements UnitOfWork {
  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return work();
  }
}

class InMemoryCacheFake implements CachePort {
  private readonly store = new Map<string, unknown>();
  async get<T>(key: string) {
    return this.store.has(key) ? (this.store.get(key) as T) : null;
  }
  async set<T>(key: string, value: T) {
    this.store.set(key, value);
  }
  async del(key: string) {
    this.store.delete(key);
  }
  async deleteByPrefix(prefix: string) {
    for (const key of this.store.keys()) if (key.startsWith(prefix)) this.store.delete(key);
  }
}

class FixedClockFake implements Clock {
  constructor(private readonly date: Date) {}
  now() {
    return this.date;
  }
}

class SequentialIdGeneratorFake implements IdGenerator {
  private counter = 0;
  newId(): string {
    this.counter += 1;
    return `id-${this.counter}`;
  }
}

class FakeBookMetadataProvider implements BookMetadataProvider {
  readonly id = ProviderId.create('fake-source');

  constructor(
    private readonly works: ProviderWork[],
    private readonly editionsByExternalId: Record<string, ProviderEdition[]>,
  ) {}

  async searchWorks(_query: SearchQuery): Promise<ProviderWork[]> {
    return this.works;
  }

  async fetchEditions(externalWorkId: string): Promise<ProviderEdition[]> {
    return this.editionsByExternalId[externalWorkId] ?? [];
  }

  async fetchWorkDetails(): Promise<{ description: string | null; coverUrl: string | null }> {
    return { description: 'A test description.', coverUrl: 'https://covers.example.org/w1.jpg' };
  }
}

// Realistic Open Library shapes — three-letter ISO 639-2/B codes, exactly what tripped up the
// two-letter-only version of LanguageCode before this use case existed to exercise it end to end.
const PROVIDER_WORK: ProviderWork = {
  externalId: '/works/OL1W',
  title: 'War and Peace',
  authorNames: ['Leo Tolstoy'],
  languages: ['eng', 'rus'],
  firstPublishedYear: 1869,
  editionCount: 2,
  coverUrl: null,
};

const RUSSIAN_EDITION: ProviderEdition = {
  externalId: '/books/OL1M',
  title: 'Война и мир',
  language: 'rus',
  coverUrl: null,
  translator: null,
  translatedFrom: null,
  publisher: 'Ru Publisher',
  year: 1869,
  isbn13: null,
  isbn10: null,
  rightsSignal: 'unknown',
};

const ENGLISH_EDITION: ProviderEdition = {
  externalId: '/books/OL2M',
  title: 'War and Peace',
  language: 'eng',
  coverUrl: null,
  translator: 'Aylmer Maude',
  translatedFrom: 'rus',
  publisher: 'Penguin Classics',
  year: 2005,
  isbn13: '9780140447934',
  isbn10: null,
  rightsSignal: 'unknown',
};

// Same title/author as PROVIDER_WORK (so it resolves to the same Work via natural key) but a
// different, lower-quality firstPublishedYear — used to exercise cross-source metadata priority
// (docs/architecture.md §5: open-library outranks google-books for 'metadata').
const GOOGLE_BOOKS_PROVIDER_WORK: ProviderWork = {
  externalId: 'gb-war-and-peace',
  title: 'War and Peace',
  authorNames: ['Leo Tolstoy'],
  languages: ['en'],
  firstPublishedYear: 1900, // wrong — open-library's 1869 above is correct
  editionCount: 1,
  coverUrl: null,
};

// Same natural-key-determining fields as ENGLISH_EDITION (language/publisher/year/title/isbn —
// translator is NOT part of the natural key) but a different translator, to exercise
// metadata-priority at the edition level independently of the work level.
const GOOGLE_BOOKS_ENGLISH_EDITION: ProviderEdition = {
  externalId: 'gb-book-1',
  title: 'War and Peace',
  language: 'eng',
  coverUrl: null,
  translator: 'Wrong Translator',
  translatedFrom: null,
  publisher: 'Penguin Classics',
  year: 2005,
  isbn13: '9780140447934',
  isbn10: null,
  rightsSignal: 'unknown',
};

function makeDeps(provider: BookMetadataProvider) {
  const workRepository = new InMemoryWorkRepositoryFake();
  const editionRepository = new InMemoryEditionRepositoryFake();
  const sourceLinkRepository = new InMemorySourceLinkRepositoryFake();
  const externalRefRepository = new InMemoryExternalRefRepositoryFake();
  const syncLogRepository = new RecordingSyncLogRepository();
  const cache = new InMemoryCacheFake();

  const deps: SyncWorkFromSourceDeps = {
    providers: new Map([['open-library', provider]]),
    workRepository,
    editionRepository,
    sourceLinkRepository,
    externalRefRepository,
    syncLogRepository,
    unitOfWork: new InMemoryUnitOfWorkFake(),
    cache,
    clock: new FixedClockFake(new Date('2026-01-01T00:00:00Z')),
    idGenerator: new SequentialIdGeneratorFake(),
  };

  return {
    deps,
    workRepository,
    editionRepository,
    sourceLinkRepository,
    syncLogRepository,
    cache,
  };
}

/** Like `makeDeps`, but registers providers under caller-chosen source names — needed to
 * exercise cross-source metadata-priority conflicts (docs/architecture.md §5). */
function makeMultiSourceDeps(providersByName: Record<string, BookMetadataProvider>) {
  const workRepository = new InMemoryWorkRepositoryFake();
  const editionRepository = new InMemoryEditionRepositoryFake();
  const sourceLinkRepository = new InMemorySourceLinkRepositoryFake();
  const externalRefRepository = new InMemoryExternalRefRepositoryFake();
  const syncLogRepository = new RecordingSyncLogRepository();
  const cache = new InMemoryCacheFake();

  const deps: SyncWorkFromSourceDeps = {
    providers: new Map(Object.entries(providersByName)),
    workRepository,
    editionRepository,
    sourceLinkRepository,
    externalRefRepository,
    syncLogRepository,
    unitOfWork: new InMemoryUnitOfWorkFake(),
    cache,
    clock: new FixedClockFake(new Date('2026-01-01T00:00:00Z')),
    idGenerator: new SequentialIdGeneratorFake(),
  };

  return { deps, workRepository, editionRepository };
}

describe('SyncWorkFromSource', () => {
  it('throws for a source with no registered provider', async () => {
    const { deps } = makeDeps(new FakeBookMetadataProvider([], {}));
    const useCase = new SyncWorkFromSource(deps);

    await expect(useCase.execute({ source: 'nonexistent', query: 'x' })).rejects.toThrow(
      InvalidInputError,
    );
  });

  it('records a not_found sync_log entry and returns status not_found when the search misses', async () => {
    const provider = new FakeBookMetadataProvider([], {});
    const { deps, syncLogRepository } = makeDeps(provider);
    const useCase = new SyncWorkFromSource(deps);

    const result = await useCase.execute({ source: 'open-library', query: 'nothing matches this' });

    expect(result).toEqual({ status: 'not_found' });
    expect(syncLogRepository.entries).toHaveLength(1);
    expect(syncLogRepository.entries[0]?.status).toBe('error');
  });

  it('syncs a work and its editions end to end, correctly parsing three-letter language codes', async () => {
    const provider = new FakeBookMetadataProvider([PROVIDER_WORK], {
      '/works/OL1W': [RUSSIAN_EDITION, ENGLISH_EDITION],
    });
    const { deps, workRepository, editionRepository, syncLogRepository } = makeDeps(provider);
    const useCase = new SyncWorkFromSource(deps);

    const result = await useCase.execute({
      source: 'open-library',
      query: 'War and Peace Tolstoy',
    });

    expect(result.status).toBe('synced');
    expect(result.editionsSynced).toBe(2);

    const work = await workRepository.findById(result.workId!);
    expect(work?.originalTitle).toBe('War and Peace');
    // Earliest-dated edition (1869, Russian) wins the original-language heuristic.
    expect(work?.originalLanguage.value).toBe('ru');

    const editions = await editionRepository.findByWorkId(result.workId!);
    expect(editions).toHaveLength(2);
    const english = editions.find((e) => e.language.value === 'en');
    expect(english?.translator).toBe('Aylmer Maude');
    expect(english?.translatedFrom?.value).toBe('ru');
    expect(english?.isbn?.value).toBe('9780140447934');

    expect(syncLogRepository.entries).toHaveLength(1);
    expect(syncLogRepository.entries[0]?.status).toBe('ok');
  });

  it('is idempotent: re-syncing the same query does not create duplicate work/edition rows', async () => {
    const provider = new FakeBookMetadataProvider([PROVIDER_WORK], {
      '/works/OL1W': [RUSSIAN_EDITION, ENGLISH_EDITION],
    });
    const { deps, workRepository, editionRepository } = makeDeps(provider);
    const useCase = new SyncWorkFromSource(deps);

    const first = await useCase.execute({ source: 'open-library', query: 'War and Peace' });
    const second = await useCase.execute({ source: 'open-library', query: 'War and Peace' });

    expect(second.workId).toBe(first.workId);
    expect(await workRepository.findById(first.workId!)).not.toBeNull();
    const editions = await editionRepository.findByWorkId(first.workId!);
    expect(editions).toHaveLength(2); // not 4 — re-sync upserted onto the same two editions
  });

  it('skips an edition with an unparseable language rather than failing the whole sync', async () => {
    const badEdition: ProviderEdition = {
      ...RUSSIAN_EDITION,
      externalId: '/books/OLBad',
      language: 'und',
    };
    const provider = new FakeBookMetadataProvider([PROVIDER_WORK], {
      '/works/OL1W': [badEdition, ENGLISH_EDITION],
    });
    const { deps, editionRepository } = makeDeps(provider);
    const useCase = new SyncWorkFromSource(deps);

    const result = await useCase.execute({ source: 'open-library', query: 'War and Peace' });

    expect(result.status).toBe('synced');
    expect(result.editionsSynced).toBe(1); // the bad one was skipped, not fatal
    const editions = await editionRepository.findByWorkId(result.workId!);
    expect(editions).toHaveLength(1);
    expect(editions[0]?.language.value).toBe('en');
  });

  it('skips a link LinkPolicy rejects without failing the edition it belongs to', async () => {
    const editionWithBadLink: ProviderEdition = {
      ...ENGLISH_EDITION,
      // 'download' from a non-allowlisted provider — LinkPolicy will reject this.
      link: { type: 'download', url: 'https://example.com/book.pdf' },
    };
    const provider = new FakeBookMetadataProvider([PROVIDER_WORK], {
      '/works/OL1W': [editionWithBadLink],
    });
    const { deps, editionRepository, sourceLinkRepository } = makeDeps(provider);
    const useCase = new SyncWorkFromSource(deps);

    const result = await useCase.execute({ source: 'open-library', query: 'War and Peace' });

    expect(result.status).toBe('synced');
    expect(result.editionsSynced).toBe(1);
    expect(result.linksSynced).toBe(0);
    const editions = await editionRepository.findByWorkId(result.workId!);
    expect(editions).toHaveLength(1); // edition itself still saved
    expect(await sourceLinkRepository.findByEditionId(editions[0]!.id)).toHaveLength(0);
  });

  it('invalidates the work cache after a successful sync', async () => {
    const provider = new FakeBookMetadataProvider([PROVIDER_WORK], {
      '/works/OL1W': [ENGLISH_EDITION],
    });
    const { deps, cache } = makeDeps(provider);
    const useCase = new SyncWorkFromSource(deps);

    const result = await useCase.execute({ source: 'open-library', query: 'War and Peace' });
    await cache.set(`${CACHE_KEY_VERSION}:work:${result.workId}:card`, 'stale', 60);

    await useCase.execute({ source: 'open-library', query: 'War and Peace' });

    expect(await cache.get(`${CACHE_KEY_VERSION}:work:${result.workId}:card`)).toBeNull();
  });

  describe('source-priority metadata conflicts (docs/architecture.md §5)', () => {
    it('a lower-priority resync does not overwrite a work already owned by a higher-priority source', async () => {
      const { deps, workRepository } = makeMultiSourceDeps({
        'open-library': new FakeBookMetadataProvider([PROVIDER_WORK], {}),
        'google-books': new FakeBookMetadataProvider([GOOGLE_BOOKS_PROVIDER_WORK], {}),
      });
      const useCase = new SyncWorkFromSource(deps);

      const first = await useCase.execute({ source: 'open-library', query: 'War and Peace' });
      await useCase.execute({ source: 'google-books', query: 'War and Peace' });

      const work = await workRepository.findById(first.workId!);
      expect(work?.firstPublishedYear).toBe(1869); // open-library's value, not overwritten
    });

    it('a higher-priority sync overwrites a work previously created by a lower-priority source', async () => {
      const { deps, workRepository } = makeMultiSourceDeps({
        'open-library': new FakeBookMetadataProvider([PROVIDER_WORK], {}),
        'google-books': new FakeBookMetadataProvider([GOOGLE_BOOKS_PROVIDER_WORK], {}),
      });
      const useCase = new SyncWorkFromSource(deps);

      const first = await useCase.execute({ source: 'google-books', query: 'War and Peace' });
      expect((await workRepository.findById(first.workId!))?.firstPublishedYear).toBe(1900);

      await useCase.execute({ source: 'open-library', query: 'War and Peace' });

      const work = await workRepository.findById(first.workId!);
      expect(work?.firstPublishedYear).toBe(1869); // now overwritten by the higher-priority sync
    });

    it('a lower-priority resync does not overwrite an edition already owned by a higher-priority source', async () => {
      const { deps, editionRepository } = makeMultiSourceDeps({
        'open-library': new FakeBookMetadataProvider([PROVIDER_WORK], {
          '/works/OL1W': [ENGLISH_EDITION],
        }),
        'google-books': new FakeBookMetadataProvider([GOOGLE_BOOKS_PROVIDER_WORK], {
          'gb-war-and-peace': [GOOGLE_BOOKS_ENGLISH_EDITION],
        }),
      });
      const useCase = new SyncWorkFromSource(deps);

      const first = await useCase.execute({ source: 'open-library', query: 'War and Peace' });
      await useCase.execute({ source: 'google-books', query: 'War and Peace' });

      const editions = await editionRepository.findByWorkId(first.workId!);
      expect(editions).toHaveLength(1); // same natural key — one edition, not two
      expect(editions[0]?.translator).toBe('Aylmer Maude'); // open-library's value, not overwritten
    });
  });
});
