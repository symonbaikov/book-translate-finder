import { beforeEach, describe, expect, it } from 'vitest';
import { Edition } from '../../src/entities/edition.js';
import type { EditionRepository } from '../../src/ports/edition-repository.port.js';
import { LanguageCode } from '../../src/value-objects/language-code.js';

export interface EditionRepositoryContractOptions {
  /**
   * Every edition in this suite references `workId: 'work-1'`. The in-memory fake doesn't
   * enforce referential integrity, but a real database's `edition.work_id` foreign key
   * (docs/architecture.md §3.1) does — so a Postgres-backed run needs a real `work` row to exist
   * first. No-op by default (the in-memory fake needs nothing).
   */
  ensureWorkExists?: (workId: string) => Promise<void>;
}

export function runEditionRepositoryContractTests(
  createRepository: () => EditionRepository,
  options: EditionRepositoryContractOptions = {},
): void {
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
    beforeEach(async () => {
      await options.ensureWorkExists?.('work-1');
    });

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

    it('keeps the descriptive fields a library catalogue contributes', async () => {
      // The edition statement is the whole reason a rare printing is distinguishable from an
      // ordinary one, and it is stored in a column of its own — a mapping that silently drops it
      // would leave the sync working and the card wrong.
      const repo = createRepository();
      await repo.save(
        makeEdition({ editionStatement: 'Limited ed., signed', binding: 'Hardcover', pages: 414 }),
      );

      expect(await repo.findById('edition-1')).toMatchObject({
        editionStatement: 'Limited ed., signed',
        binding: 'Hardcover',
        pages: 414,
      });
    });

    it('a source correcting a title updates the row rather than failing', async () => {
      // The natural key is derived from the title, so a corrected title is a *new* natural key for
      // the same row. The sync still resolves that row by `external_ref` and hands back its id —
      // and an insert keyed only on the natural key then finds no conflict, inserts, and dies on
      // the primary key. Permanently, for that book. An upstream cataloguer fixing a typo is all
      // it takes; here it was a parser fix turning `Alices &#xE4;ventyr` into `Alices äventyr`.
      const repo = createRepository();
      await repo.save(makeEdition({ title: 'Alices &#xE4;ventyr i underlandet' }));
      await repo.save(makeEdition({ title: 'Alices äventyr i underlandet' }));

      const rows = await repo.findByWorkId('work-1');
      expect(rows).toHaveLength(1);
      expect(rows[0]?.id).toBe('edition-1');
      expect(rows[0]?.title).toBe('Alices äventyr i underlandet');
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
