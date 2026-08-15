import {
  Edition,
  Isbn,
  LanguageCode,
  Money,
  NotFoundError,
  ProviderId,
  Work,
  type Clock,
  type PriceOffer,
  type PriceProvider,
  type PriceQuery,
} from '@golden/domain';
import { describe, expect, it, vi } from 'vitest';
import { InMemoryCache } from '../../../domain/test/fakes/in-memory-cache.js';
import { InMemoryEditionRepository } from '../../../domain/test/fakes/in-memory-edition-repository.js';
import { InMemoryWorkRepository } from '../../../domain/test/fakes/in-memory-work-repository.js';
import {
  AggregateEditionPrices,
  DEGRADED_TTL_SECONDS,
  PRICES_TTL_SECONDS,
  editionPricesCacheKey,
  type AggregateEditionPricesDeps,
} from '../../src/use-cases/aggregate-edition-prices.use-case.js';

const FIXED_CLOCK: Clock = { now: () => new Date('2026-08-14T10:00:00Z') };

function offer(overrides: Partial<PriceOffer> & { providerId: string }): PriceOffer {
  return {
    providerName: overrides.providerId,
    format: 'paperback',
    price: null,
    url: `https://${overrides.providerId}.example/book`,
    availability: 'unknown',
    note: null,
    ...overrides,
  };
}

function stubProvider(id: string, quote: PriceProvider['quote']): PriceProvider {
  return { id: ProviderId.create(id), name: id, quote };
}

async function makeDeps(providers: readonly PriceProvider[]) {
  const editionRepository = new InMemoryEditionRepository();
  const workRepository = new InMemoryWorkRepository();
  const cache = new InMemoryCache();

  await workRepository.save(
    Work.create({
      id: 'work-1',
      originalTitle: 'War and Peace',
      originalLanguage: LanguageCode.create('ru'),
      author: 'Leo Tolstoy',
      firstPublishedYear: 1869,
      syncedAt: FIXED_CLOCK.now(),
    }),
  );
  await editionRepository.save(
    Edition.create({
      id: 'e1',
      workId: 'work-1',
      title: 'War and Peace',
      language: LanguageCode.create('en'),
      isbn: Isbn.create('9780140447934'),
      binding: 'Paperback',
    }),
  );

  const deps: AggregateEditionPricesDeps = {
    editionRepository,
    workRepository,
    priceProviders: providers,
    cache,
    clock: FIXED_CLOCK,
  };
  return { deps, cache };
}

describe('AggregateEditionPrices', () => {
  it('rejects an unknown edition rather than returning an empty price list', async () => {
    const { deps } = await makeDeps([]);
    await expect(new AggregateEditionPrices(deps).execute({ editionId: 'nope' })).rejects.toThrow(
      NotFoundError,
    );
  });

  it('passes the edition’s ISBN, language and the reader’s country to every provider', async () => {
    const seen: PriceQuery[] = [];
    const { deps } = await makeDeps([
      stubProvider('shop-a', async (query) => {
        seen.push(query);
        return [];
      }),
    ]);

    await new AggregateEditionPrices(deps).execute({ editionId: 'e1', country: 'de' });

    expect(seen[0]).toEqual({
      isbn13: '9780140447934',
      isbn10: null,
      title: 'War and Peace',
      author: 'Leo Tolstoy',
      language: 'en',
      format: 'paperback',
      country: 'DE',
    });
  });

  it('polls the providers concurrently, not one after another', async () => {
    const entered: string[] = [];
    const slow = async (id: string) => {
      entered.push(id);
      await new Promise((resolve) => setTimeout(resolve, 15));
      return [];
    };
    const { deps } = await makeDeps([
      stubProvider('a', () => slow('a')),
      stubProvider('b', () => slow('b')),
    ]);

    await new AggregateEditionPrices(deps).execute({ editionId: 'e1' });
    // A sequential implementation would enter 'b' only after 'a' resolved 15 ms later.
    expect(entered).toEqual(['a', 'b']);
  });

  it('groups offers by format, physical first, and sorts by price within a currency', async () => {
    const { deps } = await makeDeps([
      stubProvider('a', async () => [
        offer({ providerId: 'a', format: 'ebook', price: Money.fromDecimal(9.99, 'EUR') }),
        offer({ providerId: 'a2', format: 'paperback', price: Money.fromDecimal(18.5, 'EUR') }),
      ]),
      stubProvider('b', async () => [
        offer({ providerId: 'b', format: 'paperback', price: Money.fromDecimal(12, 'EUR') }),
        offer({ providerId: 'b2', format: 'paperback' }),
      ]),
    ]);

    const result = await new AggregateEditionPrices(deps).execute({ editionId: 'e1' });

    expect(result.groups.map((group) => group.format)).toEqual(['paperback', 'ebook']);
    expect(result.groups[0]?.offers.map((o) => o.providerId)).toEqual(['b', 'a2', 'b2']);
  });

  it('keeps an unpriced shop in the list instead of dropping it or showing zero', async () => {
    const { deps } = await makeDeps([
      stubProvider('lookup-only', async () => [offer({ providerId: 'lookup-only' })]),
    ]);

    const result = await new AggregateEditionPrices(deps).execute({ editionId: 'e1' });
    expect(result.groups[0]?.offers[0]).toMatchObject({
      amountMinor: null,
      amount: null,
      currency: null,
      availability: 'unknown',
    });
  });

  it('reports money in minor units and as the decimal a shop prints', async () => {
    const { deps } = await makeDeps([
      stubProvider('a', async () => [
        offer({ providerId: 'a', price: Money.fromDecimal(19.99, 'usd') }),
      ]),
    ]);

    const result = await new AggregateEditionPrices(deps).execute({ editionId: 'e1' });
    expect(result.groups[0]?.offers[0]).toMatchObject({
      amountMinor: 1999,
      amount: 19.99,
      currency: 'USD',
    });
  });

  it('serves the other shops when one provider throws, and names the one that failed', async () => {
    const { deps } = await makeDeps([
      stubProvider('working', async () => [offer({ providerId: 'working' })]),
      stubProvider('broken', async () => {
        throw new Error('upstream 503');
      }),
    ]);

    const result = await new AggregateEditionPrices(deps).execute({ editionId: 'e1' });
    expect(result.groups[0]?.offers.map((o) => o.providerId)).toEqual(['working']);
    expect(result.degraded).toEqual([{ providerId: 'broken', reason: 'upstream 503' }]);
  });

  it('drops an offer whose URL the link policy refuses, and keeps the rest', async () => {
    const { deps } = await makeDeps([
      stubProvider('shady', async () => [
        offer({ providerId: 'shady', url: 'https://libgen.rs/book/1' }),
        offer({ providerId: 'clean', url: 'https://waterstones.com/book/1' }),
      ]),
    ]);

    const result = await new AggregateEditionPrices(deps).execute({ editionId: 'e1' });
    expect(result.groups[0]?.offers.map((o) => o.providerId)).toEqual(['clean']);
    // Refused by policy, not by the provider — so it is not reported as a provider outage either.
    expect(result.degraded).toEqual([]);
  });

  it('caches a complete answer for the short price TTL', async () => {
    const quote = vi.fn(async () => [offer({ providerId: 'a' })]);
    const { deps, cache } = await makeDeps([stubProvider('a', quote)]);
    const useCase = new AggregateEditionPrices(deps);

    const first = await useCase.execute({ editionId: 'e1', country: 'DE' });
    const second = await useCase.execute({ editionId: 'e1', country: 'DE' });

    expect(second).toEqual(first);
    expect(quote).toHaveBeenCalledTimes(1);
    expect(cache.ttlOf(editionPricesCacheKey('work-1', 'e1', 'DE'))).toBe(PRICES_TTL_SECONDS);
  });

  it('caches a degraded answer only briefly, so an outage does not freeze the list', async () => {
    const { deps, cache } = await makeDeps([
      stubProvider('a', async () => [offer({ providerId: 'a' })]),
      stubProvider('down', async () => {
        throw new Error('timeout');
      }),
    ]);

    await new AggregateEditionPrices(deps).execute({ editionId: 'e1' });
    expect(cache.ttlOf(editionPricesCacheKey('work-1', 'e1', null))).toBe(DEGRADED_TTL_SECONDS);
  });

  it('keys the cache per country, so two readers do not see each other’s shops', async () => {
    const quote = vi.fn(async (query: PriceQuery) => [
      offer({ providerId: `shop-${query.country ?? 'none'}` }),
    ]);
    const { deps } = await makeDeps([stubProvider('a', quote)]);
    const useCase = new AggregateEditionPrices(deps);

    const de = await useCase.execute({ editionId: 'e1', country: 'DE' });
    const pl = await useCase.execute({ editionId: 'e1', country: 'PL' });

    expect(de.groups[0]?.offers[0]?.providerId).toBe('shop-DE');
    expect(pl.groups[0]?.offers[0]?.providerId).toBe('shop-PL');
    expect(quote).toHaveBeenCalledTimes(2);
  });
});
