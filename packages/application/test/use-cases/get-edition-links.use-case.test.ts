import {
  computeUrlHash,
  Edition,
  Isbn,
  LanguageCode,
  NotFoundError,
  ProviderId,
  SourceLink,
  type Clock,
} from '@btf/domain';
import { describe, expect, it } from 'vitest';
import { CACHE_KEY_VERSION } from '../../src/cache-key-version.js';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import { InMemoryEditionRepository } from '../../../domain/test/fakes/in-memory-edition-repository.js';
import { InMemoryWorkRepository } from '../../../domain/test/fakes/in-memory-work-repository.js';
import { InMemorySourceLinkRepository } from '../../../domain/test/fakes/in-memory-source-link-repository.js';
import {
  editionLinksCacheKey,
  GetEditionLinks,
  type GetEditionLinksDeps,
} from '../../src/use-cases/get-edition-links.use-case.js';

const FIXED_CLOCK: Clock = { now: () => new Date('2026-01-01T00:00:00Z') };

function makeDeps() {
  const editionRepository = new InMemoryEditionRepository();
  const workRepository = new InMemoryWorkRepository();
  const sourceLinkRepository = new InMemorySourceLinkRepository();
  const cache = new InMemoryCache();
  const deps: GetEditionLinksDeps = {
    editionRepository,
    workRepository,
    sourceLinkRepository,
    cache,
    clock: FIXED_CLOCK,
  };
  return { deps, editionRepository, workRepository, sourceLinkRepository, cache };
}

/** An edition with a real ISBN — bookstore lookups are keyed by it. */
async function seedEditionWithIsbn(editionRepository: InMemoryEditionRepository): Promise<void> {
  await editionRepository.save(
    Edition.create({
      id: 'e-isbn',
      workId: 'work-1',
      title: 'War and Peace',
      language: LanguageCode.create('en'),
      isbn: Isbn.create('9780140447934'),
    }),
  );
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
        format: null,
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

describe('GetEditionLinks bookstores (country-aware buy links)', () => {
  it("offers the reader's own country's stores plus worldwide ones", async () => {
    const { deps, editionRepository } = makeDeps();
    await seedEditionWithIsbn(editionRepository);
    const useCase = new GetEditionLinks(deps);

    const result = await useCase.execute({ editionId: 'e-isbn', country: 'GB' });

    const providers = result.bookstores.map((b) => b.provider);
    expect(providers).toContain('waterstones');
    expect(providers).toContain('abebooks'); // worldwide
    expect(providers).not.toContain('labirint'); // RU-only
  });

  it('every bookstore link is a buy link marked copyrighted, never public domain', async () => {
    const { deps, editionRepository } = makeDeps();
    await seedEditionWithIsbn(editionRepository);
    const useCase = new GetEditionLinks(deps);

    const result = await useCase.execute({ editionId: 'e-isbn', country: 'US' });

    expect(result.bookstores.length).toBeGreaterThan(0);
    for (const store of result.bookstores) {
      expect(store.type).toBe('buy');
      // A shop selling a book is never evidence it is public domain (docs/legal-policy.md).
      expect(store.rightsStatus).toBe('copyrighted');
      expect(store.url).toContain('9780140447934');
      expect(store.providerName).toBeTruthy();
    }
  });

  it('falls back to a title search for an edition with no ISBN', async () => {
    // 16% of real editions carry no ISBN (measured live). Showing no shops for them read as
    // "nobody sells this book"; the same shop one search away is the honest answer.
    const { deps, editionRepository } = makeDeps();
    await seedEdition(editionRepository); // seeded without an ISBN
    const useCase = new GetEditionLinks(deps);

    const result = await useCase.execute({ editionId: 'e1', country: 'GB' });

    expect(result.bookstores.length).toBeGreaterThan(0);
    expect(result.bookstores.every((b) => b.url.includes('War%20and%20Peace'))).toBe(true);
  });

  it("offers the shops of the countries where this edition's language is the market language", async () => {
    // A German translation is sold by German shops whether or not the reader lives in Germany.
    const { deps, editionRepository } = makeDeps();
    await editionRepository.save(
      Edition.create({
        id: 'e-de',
        workId: 'work-1',
        title: 'Krieg und Frieden',
        language: LanguageCode.create('de'),
        isbn: Isbn.create('9780140447934'),
      }),
    );
    const useCase = new GetEditionLinks(deps);

    const result = await useCase.execute({ editionId: 'e-de', country: 'US' });
    const providers = result.bookstores.map((b) => b.provider);

    expect(providers).toContain('amazon-us'); // the reader's own country still comes first
    expect(providers).toContain('thalia'); // …and the German market is offered too
    expect(providers.indexOf('amazon-us')).toBeLessThan(providers.indexOf('thalia'));
  });

  it("lists every shop once, even when the reader's country is the language market", async () => {
    const { deps, editionRepository } = makeDeps();
    await seedEditionWithIsbn(editionRepository); // English edition
    const useCase = new GetEditionLinks(deps);

    const providers = (
      await useCase.execute({ editionId: 'e-isbn', country: 'GB' })
    ).bookstores.map((b) => b.provider);

    expect(new Set(providers).size).toBe(providers.length);
  });

  it('falls back to worldwide stores when no country is given', async () => {
    const { deps, editionRepository } = makeDeps();
    await seedEditionWithIsbn(editionRepository);
    const useCase = new GetEditionLinks(deps);

    const result = await useCase.execute({ editionId: 'e-isbn' });
    const providers = result.bookstores.map((b) => b.provider);

    expect(providers).toContain('abebooks'); // worldwide, always offered
    // An English edition still reaches the English-language markets — that is the point of the
    // language pass. What must NOT appear is a market in an unrelated language.
    expect(providers).not.toContain('thalia');
  });

  it("caches per country — switching country must not serve the previous country's stores", async () => {
    const { deps, editionRepository } = makeDeps();
    await seedEditionWithIsbn(editionRepository);
    const useCase = new GetEditionLinks(deps);

    const gb = await useCase.execute({ editionId: 'e-isbn', country: 'GB' });
    const de = await useCase.execute({ editionId: 'e-isbn', country: 'DE' });

    // The German reader gets German shops first; the English edition still reaches English
    // markets in both, so the per-country difference is the ordering and the local shops.
    expect(gb.bookstores[0]!.provider).toBe('bookshop-org-uk');
    expect(de.bookstores[0]!.provider).toBe('thalia');
    expect(de.bookstores.map((b) => b.provider)).toContain('amazon-de');
    expect(gb.bookstores.map((b) => b.provider)).not.toContain('amazon-de');
  });
});
