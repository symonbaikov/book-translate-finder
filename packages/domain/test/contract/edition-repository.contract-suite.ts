import { describe, expect, it } from 'vitest';
import { Edition } from '../../src/entities/edition.js';
import type { EditionRepository } from '../../src/ports/edition-repository.port.js';
import { LanguageCode } from '../../src/value-objects/language-code.js';

export function runEditionRepositoryContractTests(createRepository: () => EditionRepository): void {
  const makeEdition = (overrides: Partial<Parameters<typeof Edition.create>[0]> = {}) =>
    Edition.create({
      id: 'edition-1',
      workId: 'work-1',
      title: 'War and Peace',
      language: LanguageCode.create('en'),
      publisher: 'Penguin Classics',
      year: 2005,
      ...overrides,
    });

  describe('EditionRepository contract', () => {
    it('returns null / empty for editions that were never saved', async () => {
      const repo = createRepository();
      expect(await repo.findById('missing')).toBeNull();
      expect(await repo.findByNaturalKey('missing')).toBeNull();
      expect(await repo.findByWorkId('missing-work')).toEqual([]);
    });

    it('save() then findById()/findByNaturalKey()/findByWorkId() return the saved edition', async () => {
      const repo = createRepository();
      const edition = makeEdition();
      await repo.save(edition);

      expect((await repo.findById('edition-1'))?.id).toBe('edition-1');
      expect((await repo.findByNaturalKey(edition.naturalKey))?.id).toBe('edition-1');
      expect(await repo.findByWorkId('work-1')).toHaveLength(1);
    });

    it('re-syncing the same edition under a fresh id upserts onto the original id', async () => {
      const repo = createRepository();
      await repo.save(makeEdition({ id: 'edition-1' }));
      await repo.save(makeEdition({ id: 'edition-2' }));

      expect(await repo.findById('edition-1')).not.toBeNull();
      expect(await repo.findById('edition-2')).toBeNull();
      expect(await repo.findByWorkId('work-1')).toHaveLength(1);
    });

    it('editions with an ISBN dedupe on the ISBN regardless of other field differences', async () => {
      const repo = createRepository();
      const { Isbn } = await import('../../src/value-objects/isbn.js');
      const isbn = Isbn.create('9780140447934');

      const first = makeEdition({ id: 'edition-1', isbn });
      const second = makeEdition({
        id: 'edition-2',
        title: 'War and Peace (different subtitle)',
        publisher: 'A Different Publisher',
        isbn,
      });

      await repo.save(first);
      await repo.save(second);

      expect(await repo.findByWorkId('work-1')).toHaveLength(1);
    });

    it('different languages of the same work are distinct editions, not merged', async () => {
      const repo = createRepository();
      await repo.save(makeEdition({ id: 'edition-1', language: LanguageCode.create('en') }));
      await repo.save(makeEdition({ id: 'edition-2', language: LanguageCode.create('ru') }));

      expect(await repo.findByWorkId('work-1')).toHaveLength(2);
    });
  });
}
