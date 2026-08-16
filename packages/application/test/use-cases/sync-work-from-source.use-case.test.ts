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
} from '@golden/domain';
import { InvalidInputError, ProviderId } from '@golden/domain';
import { describe, expect, it } from 'vitest';
import { CACHE_KEY_VERSION } from '../../src/cache-key-version.js';
import {
  joinAuthorNames,
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

  it('falls back to the ISBN registration group when the source gives no language at all', async () => {
    // Live case: every one of "Metro 2035"'s seven Spanish editions carries an ISBN but no
    // `languages` field on Open Library, so all seven were dropped and the work showed zero
    // editions despite the source genuinely listing them.
    const spanishEdition: ProviderEdition = {
      ...RUSSIAN_EDITION,
      externalId: '/books/OLEs',
      language: 'und',
      isbn13: '9788445015407', // real ISBN of a "Metro 2035" Spanish edition (group 84)
    };
    const provider = new FakeBookMetadataProvider([PROVIDER_WORK], {
      '/works/OL1W': [spanishEdition],
    });
    const { deps, editionRepository } = makeDeps(provider);
    const useCase = new SyncWorkFromSource(deps);

    const result = await useCase.execute({ source: 'open-library', query: 'War and Peace' });

    expect(result.status).toBe('synced');
    expect(result.editionsSynced).toBe(1);
    const editions = await editionRepository.findByWorkId(result.workId!);
    expect(editions[0]?.language.value).toBe('es');
  });

  it('never lets the ISBN fallback override a language the source actually reported', async () => {
    const editionWithSourceLanguage: ProviderEdition = {
      ...RUSSIAN_EDITION,
      isbn13: '9788445015407', // group 84 (Spanish) — must not win over the source's own 'rus'
    };
    const provider = new FakeBookMetadataProvider([PROVIDER_WORK], {
      '/works/OL1W': [editionWithSourceLanguage],
    });
    const { deps, editionRepository } = makeDeps(provider);
    const useCase = new SyncWorkFromSource(deps);

    const result = await useCase.execute({ source: 'open-library', query: 'War and Peace' });

    const editions = await editionRepository.findByWorkId(result.workId!);
    expect(editions[0]?.language.value).toBe('ru');
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

/** Answers only the exact query strings it was given — everything else is a miss. */
class ScriptSensitiveProvider implements BookMetadataProvider {
  readonly id = ProviderId.create('fake-source');
  readonly asked: string[] = [];

  constructor(private readonly answers: Record<string, ProviderWork[]>) {}

  async searchWorks(query: SearchQuery): Promise<ProviderWork[]> {
    this.asked.push(query.text);
    return this.answers[query.text] ?? [];
  }

  async fetchEditions(): Promise<ProviderEdition[]> {
    return [];
  }

  async fetchWorkDetails(): Promise<{ description: string | null; coverUrl: string | null }> {
    return { description: null, coverUrl: null };
  }
}

describe('SyncWorkFromSource attaching to a known work', () => {
  /**
   * A catalogue record for the same book under its translated title — the enrichment case.
   *
   * The author is the same person as `PROVIDER_WORK`'s, spelled the way a French catalogue spells
   * him. That is not decoration: the sync refuses to attach a source's answer to a known work
   * unless the answer is plausibly about that work, so a fixture naming a different author would
   * be describing a mismatch rather than a translation.
   */
  const FRENCH_TRANSLATION: ProviderWork = {
    externalId: 'query:Tolstoi La Guerre et la Paix',
    title: 'La Guerre et la Paix',
    authorNames: ['Tolstoï, Léon'],
    languages: ['fre'],
    firstPublishedYear: 1869,
    editionCount: 1,
    coverUrl: null,
  };
  const FRENCH_EDITION: ProviderEdition = {
    externalId: 'ark:/12148/cb45374973s',
    title: 'La Guerre et la Paix',
    language: 'fre',
    coverUrl: null,
    translator: 'Boris de Schlœzer',
    translatedFrom: null,
    publisher: 'Gallimard (Paris)',
    year: 2017,
    isbn13: '9782330081881',
    isbn10: null,
    pages: 820,
    binding: null,
    rightsSignal: 'unknown',
  };

  it('adds the editions to the given work instead of creating a second book', async () => {
    const openLibrary = new FakeBookMetadataProvider([PROVIDER_WORK], {
      '/works/OL1W': [RUSSIAN_EDITION],
    });
    const bnf = new FakeBookMetadataProvider([FRENCH_TRANSLATION], {
      'query:Tolstoi La Guerre et la Paix': [FRENCH_EDITION],
    });
    const { deps, workRepository, editionRepository } = makeMultiSourceDeps({
      'open-library': openLibrary,
      bnf,
    });

    const discovered = await new SyncWorkFromSource(deps).execute({
      source: 'open-library',
      query: 'Obitel Prilepin',
    });
    await new SyncWorkFromSource(deps).execute({
      source: 'bnf',
      query: 'Tolstoi La Guerre et la Paix',
      attachToWorkId: discovered.workId!,
    });

    const editions = await editionRepository.findByWorkId(discovered.workId!);
    expect(editions.map((edition) => edition.language.value).sort()).toEqual(['fr', 'ru']);
    // And the work is still the one the reader searched for — the French title did not take over.
    const work = await workRepository.findById(discovered.workId!);
    expect(work?.originalTitle).toBe('War and Peace');
  });

  it('leaves the work’s own title, author and language untouched', async () => {
    const openLibrary = new FakeBookMetadataProvider([PROVIDER_WORK], {
      '/works/OL1W': [RUSSIAN_EDITION],
    });
    const bnf = new FakeBookMetadataProvider([FRENCH_TRANSLATION], {
      'query:Tolstoi La Guerre et la Paix': [FRENCH_EDITION],
    });
    const { deps, workRepository } = makeMultiSourceDeps({ 'open-library': openLibrary, bnf });

    const discovered = await new SyncWorkFromSource(deps).execute({
      source: 'open-library',
      query: 'Obitel Prilepin',
    });
    const before = await workRepository.findById(discovered.workId!);
    await new SyncWorkFromSource(deps).execute({
      source: 'bnf',
      query: 'Tolstoi La Guerre et la Paix',
      attachToWorkId: discovered.workId!,
    });
    const after = await workRepository.findById(discovered.workId!);

    expect(after?.originalTitle).toBe(before?.originalTitle);
    expect(after?.author).toBe(before?.author);
    expect(after?.originalLanguage.value).toBe(before?.originalLanguage.value);
  });
});

describe('SyncWorkFromSource original language', () => {
  it('takes the source’s declared language when it has no editions to infer one from', async () => {
    // Wikidata records "language of the work" as a fact and often lists no editions at all.
    // Defaulting to English there would print a plain falsehood on the card of a Russian novel.
    const wikidata = new FakeBookMetadataProvider(
      [
        {
          externalId: 'Q18117395',
          title: 'The Monastery (Prilepin novel)',
          authorNames: ['Zakhar Prilepin'],
          languages: ['ru'],
          firstPublishedYear: 2014,
          editionCount: 0,
          coverUrl: null,
        },
      ],
      {},
    );
    const { deps, workRepository } = makeMultiSourceDeps({ wikidata });

    const result = await new SyncWorkFromSource(deps).execute({
      source: 'wikidata',
      query: 'Обитель Прилепин',
    });

    const work = await workRepository.findById(result.workId!);
    expect(work?.originalLanguage.value).toBe('ru');
  });

  it('believes an edition that says what it was translated from', async () => {
    // «Метро 2034» as Open Library really holds it: two editions, French and German, both 2009,
    // both with `language: "und"`, and a work record declaring no language at all. Every heuristic
    // came up empty and the card announced "This book was written in English" about a Russian
    // novel — while the German record said `translated_from: rus` outright.
    const provider = new FakeBookMetadataProvider(
      [
        {
          externalId: '/works/OL16796783W',
          title: 'Метро 2034',
          authorNames: ['Дмитрий Глуховский'],
          languages: [],
          firstPublishedYear: 2009,
          editionCount: 2,
          coverUrl: null,
        },
      ],
      {
        '/works/OL16796783W': [
          {
            externalId: '/books/OL49817253M',
            title: 'Metro 2034',
            language: 'und',
            coverUrl: null,
            translator: null,
            translatedFrom: null,
            publisher: "l'atalante",
            year: 2009,
            isbn13: '9782253083016',
            isbn10: null,
            rightsSignal: 'unknown',
          },
          {
            externalId: '/books/OL25417901M',
            title: 'Metro 2034',
            language: 'und',
            coverUrl: null,
            translator: null,
            translatedFrom: 'rus',
            publisher: 'Heyne',
            year: 2009,
            isbn13: '9783453533011',
            isbn10: null,
            rightsSignal: 'unknown',
          },
        ],
      },
    );
    const { deps, workRepository } = makeDeps(provider);

    const result = await new SyncWorkFromSource(deps).execute({
      source: 'open-library',
      query: 'Метро 2034 Глуховский',
    });

    const work = await workRepository.findById(result.workId!);
    expect(work?.originalLanguage.value).toBe('ru');
  });

  it('does not let one mis-catalogued record outvote the rest', async () => {
    const editionsFrom = (codes: readonly (string | null)[]): ProviderEdition[] =>
      codes.map((translatedFrom, index) => ({
        externalId: `/books/OL${index}M`,
        title: 'Metro 2034',
        language: 'und',
        coverUrl: null,
        translator: null,
        translatedFrom,
        publisher: 'A publisher',
        year: 2009,
        isbn13: null,
        isbn10: null,
        rightsSignal: 'unknown' as const,
      }));

    const provider = new FakeBookMetadataProvider(
      [
        {
          externalId: '/works/OL1W',
          title: 'Метро 2034',
          authorNames: ['Дмитрий Глуховский'],
          languages: [],
          firstPublishedYear: 2009,
          editionCount: 4,
          coverUrl: null,
        },
      ],
      { '/works/OL1W': editionsFrom(['rus', 'rus', 'fre', 'rus']) },
    );
    const { deps, workRepository } = makeDeps(provider);

    const result = await new SyncWorkFromSource(deps).execute({
      source: 'open-library',
      query: 'Метро 2034 Глуховский',
    });

    const work = await workRepository.findById(result.workId!);
    expect(work?.originalLanguage.value).toBe('ru');
  });
});

describe('SyncWorkFromSource cross-script search', () => {
  const ROMANIZED: ProviderWork = {
    externalId: '/works/OL1',
    title: 'Prestuplenie i nakazanie',
    authorNames: ['Fyodor Dostoevsky'],
    languages: ['rus'],
    firstPublishedYear: 1866,
    editionCount: 136,
    coverUrl: null,
  };

  it('asks the source again in Latin when a Cyrillic query finds nothing', async () => {
    // Open Library's own search is not script-neutral: measured live, «Преступление и наказание»
    // returns 6 results topped by a German edition, "Prestuplenie i nakazanie" returns 136 topped
    // by the Russian one. Without the second pass the book is reported as not_found and never
    // synced — which is how a book the source clearly has became unfindable here.
    const provider = new ScriptSensitiveProvider({ 'Prestuplenie i nakazanie': [ROMANIZED] });
    const { deps } = makeDeps(provider);

    const result = await new SyncWorkFromSource(deps).execute({
      source: 'open-library',
      query: 'Преступление и наказание',
    });

    expect(result.status).toBe('synced');
    expect(provider.asked).toEqual(['Преступление и наказание', 'Prestuplenie i nakazanie']);
  });

  it('does not ask twice when the first question was answered', async () => {
    const provider = new ScriptSensitiveProvider({ 'Мастер и Маргарита': [ROMANIZED] });
    const { deps } = makeDeps(provider);

    await new SyncWorkFromSource(deps).execute({
      source: 'open-library',
      query: 'Мастер и Маргарита',
    });

    expect(provider.asked).toEqual(['Мастер и Маргарита']);
  });

  it('does not invent a second pass for a query with no Cyrillic in it', async () => {
    const provider = new ScriptSensitiveProvider({});
    const { deps } = makeDeps(provider);

    const result = await new SyncWorkFromSource(deps).execute({
      source: 'open-library',
      query: 'A Book That Does Not Exist',
    });

    expect(result.status).toBe('not_found');
    expect(provider.asked).toEqual(['A Book That Does Not Exist']);
  });

  it('carries the synced work out, so the search can answer without re-finding it by text', async () => {
    const provider = new ScriptSensitiveProvider({ 'Prestuplenie i nakazanie': [ROMANIZED] });
    const { deps } = makeDeps(provider);

    const result = await new SyncWorkFromSource(deps).execute({
      source: 'open-library',
      query: 'Преступление и наказание',
    });

    expect(result.work).toMatchObject({
      originalTitle: 'Prestuplenie i nakazanie',
      author: 'Fyodor Dostoevsky',
      firstPublishedYear: 1866,
    });
    expect(result.work?.id).toBe(result.workId);
  });
});

describe('joinAuthorNames', () => {
  it('drops a repeated author instead of building "X, X"', () => {
    // Open Library really returns this for Blindsight (/works/OL17091839W). "Peter Watts, Peter
    // Watts" is a different natural key from "Peter Watts", which split the book into two works:
    // one with the editions, one with the download links.
    expect(joinAuthorNames(['Peter Watts', 'Peter Watts'])).toBe('Peter Watts');
  });

  it('ignores case and surrounding whitespace when deciding what is a repeat', () => {
    expect(joinAuthorNames([' Cory Doctorow ', 'cory doctorow'])).toBe('Cory Doctorow');
  });

  it('keeps genuine co-authors, in order', () => {
    expect(joinAuthorNames(['Scott Chacon', 'Ben Straub'])).toBe('Scott Chacon, Ben Straub');
  });

  it('falls back to Unknown rather than an empty author', () => {
    expect(joinAuthorNames([])).toBe('Unknown');
    expect(joinAuthorNames(['   '])).toBe('Unknown');
  });
});
