import { describe, expect, it } from 'vitest';
import { Work } from '../../src/entities/work.js';
import type { WorkRepository } from '../../src/ports/work-repository.port.js';
import { LanguageCode } from '../../src/value-objects/language-code.js';

/**
 * Runs the same assertions against any `WorkRepository` implementation — the in-memory fake now
 * (Phase 1.1), the real Postgres-backed one later (Phase 1.2, docs/rules.md §5 "Contract" tests).
 * A repository that doesn't pass this suite doesn't get wired into the composition root.
 */
export function runWorkRepositoryContractTests(createRepository: () => WorkRepository): void {
  const makeWork = (overrides: Partial<Parameters<typeof Work.create>[0]> = {}) =>
    Work.create({
      id: 'work-1',
      originalTitle: 'War and Peace',
      originalLanguage: LanguageCode.create('ru'),
      author: 'Leo Tolstoy',
      firstPublishedYear: 1869,
      syncedAt: new Date('2026-01-01T00:00:00Z'),
      ...overrides,
    });

  describe('WorkRepository contract', () => {
    it('returns null for a work that was never saved', async () => {
      const repo = createRepository();
      expect(await repo.findById('missing')).toBeNull();
      expect(await repo.findByNaturalKey('missing')).toBeNull();
    });

    it('save() then findById()/findByNaturalKey() return the saved work', async () => {
      const repo = createRepository();
      const work = makeWork();
      await repo.save(work);

      const byId = await repo.findById('work-1');
      const byKey = await repo.findByNaturalKey(work.naturalKey);
      expect(byId?.id).toBe('work-1');
      expect(byKey?.id).toBe('work-1');
    });

    it('saving the exact same work twice is idempotent (docs/rules.md §2.6)', async () => {
      const repo = createRepository();
      const work = makeWork();

      await repo.save(work);
      await repo.save(work);

      const found = await repo.findByNaturalKey(work.naturalKey);
      expect(found?.id).toBe('work-1');
    });

    it('re-syncing the same book under a fresh id upserts onto the original id, not a duplicate', async () => {
      const repo = createRepository();
      const first = makeWork({ id: 'work-1' });
      await repo.save(first);

      // Simulates a second sync run that doesn't yet know this work exists, so it generated a
      // new id — the repository must still recognize it as the same work via natural_key.
      const second = makeWork({ id: 'work-2', firstPublishedYear: 1869 });
      await repo.save(second);

      const byOriginalId = await repo.findById('work-1');
      const byNewId = await repo.findById('work-2');
      expect(byOriginalId).not.toBeNull();
      expect(byNewId).toBeNull();
    });

    it('a re-save with updated fields refreshes them while keeping the original id', async () => {
      const repo = createRepository();
      await repo.save(makeWork({ id: 'work-1', syncedAt: new Date('2026-01-01T00:00:00Z') }));

      const laterSync = new Date('2026-06-01T00:00:00Z');
      await repo.save(makeWork({ id: 'work-2', syncedAt: laterSync }));

      const found = await repo.findById('work-1');
      expect(found?.syncedAt).toEqual(laterSync);
    });

    it('two different books never collide onto the same natural key', async () => {
      const repo = createRepository();
      const warAndPeace = makeWork({ id: 'work-1' });
      const annaKarenina = makeWork({
        id: 'work-2',
        originalTitle: 'Anna Karenina',
        firstPublishedYear: 1877,
      });

      await repo.save(warAndPeace);
      await repo.save(annaKarenina);

      expect(await repo.findById('work-1')).not.toBeNull();
      expect(await repo.findById('work-2')).not.toBeNull();
    });
  });
}
