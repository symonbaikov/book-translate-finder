import { describe, expect, it } from 'vitest';
import type { ExternalRefRepository } from '../../src/ports/external-ref-repository.port.js';
import { ExternalRef } from '../../src/value-objects/external-ref.js';

export function runExternalRefRepositoryContractTests(
  createRepository: () => ExternalRefRepository,
): void {
  describe('ExternalRefRepository contract', () => {
    it('returns null for a ref that was never saved', async () => {
      const repo = createRepository();
      const ref = ExternalRef.create('open-library', '/works/OL267096W');
      expect(await repo.findBySourceAndExternalId(ref)).toBeNull();
    });

    it('save() then findBySourceAndExternalId() returns what it points to', async () => {
      const repo = createRepository();
      const ref = ExternalRef.create('open-library', '/works/OL267096W');
      await repo.save(ref, 'work', 'work-1');

      expect(await repo.findBySourceAndExternalId(ref)).toEqual({
        entityType: 'work',
        entityId: 'work-1',
      });
    });

    it('re-saving the same (source, external_id) upserts what it points to, not a duplicate', async () => {
      const repo = createRepository();
      const ref = ExternalRef.create('open-library', '/works/OL267096W');
      await repo.save(ref, 'work', 'work-1');
      await repo.save(ref, 'work', 'work-1');

      expect(await repo.findBySourceAndExternalId(ref)).toEqual({
        entityType: 'work',
        entityId: 'work-1',
      });
    });

    it('the same external_id under a different source is a distinct ref', async () => {
      const repo = createRepository();
      const olRef = ExternalRef.create('open-library', 'ID-1');
      const gbRef = ExternalRef.create('google-books', 'ID-1');
      await repo.save(olRef, 'work', 'work-1');
      await repo.save(gbRef, 'work', 'work-2');

      expect(await repo.findBySourceAndExternalId(olRef)).toEqual({
        entityType: 'work',
        entityId: 'work-1',
      });
      expect(await repo.findBySourceAndExternalId(gbRef)).toEqual({
        entityType: 'work',
        entityId: 'work-2',
      });
    });

    it('findSourcesForEntity() returns an empty array for an entity with no refs', async () => {
      const repo = createRepository();
      expect(await repo.findSourcesForEntity('work-unknown')).toEqual([]);
    });

    it('findSourcesForEntity() returns every distinct source that has ever pointed at the entity', async () => {
      const repo = createRepository();
      await repo.save(ExternalRef.create('open-library', 'ID-1'), 'work', 'work-1');
      await repo.save(ExternalRef.create('google-books', 'ID-2'), 'work', 'work-1');
      // A different entity's ref must not leak in.
      await repo.save(ExternalRef.create('open-library', 'ID-3'), 'work', 'work-2');

      const sources = await repo.findSourcesForEntity('work-1');
      expect(sources.sort()).toEqual(['google-books', 'open-library']);
    });

    it('findSourcesForEntity() does not duplicate a source that touched the entity more than once', async () => {
      const repo = createRepository();
      await repo.save(ExternalRef.create('open-library', 'ID-1'), 'edition', 'edition-1');
      await repo.save(ExternalRef.create('open-library', 'ID-2'), 'edition', 'edition-1');

      expect(await repo.findSourcesForEntity('edition-1')).toEqual(['open-library']);
    });
  });
}
