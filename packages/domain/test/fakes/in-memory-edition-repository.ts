import { Edition } from '../../src/entities/edition.js';
import type { EditionRepository } from '../../src/ports/edition-repository.port.js';

export class InMemoryEditionRepository implements EditionRepository {
  private readonly byId = new Map<string, Edition>();
  private readonly idByNaturalKey = new Map<string, string>();

  async findByNaturalKey(naturalKey: string): Promise<Edition | null> {
    const id = this.idByNaturalKey.get(naturalKey);
    return id ? (this.byId.get(id) ?? null) : null;
  }

  async findById(id: string): Promise<Edition | null> {
    return this.byId.get(id) ?? null;
  }

  async findByWorkId(workId: string): Promise<Edition[]> {
    return [...this.byId.values()].filter((e) => e.workId === workId);
  }

  async save(edition: Edition): Promise<void> {
    const existingId = this.idByNaturalKey.get(edition.naturalKey);

    if (existingId && existingId !== edition.id) {
      const merged = Edition.create({
        id: existingId,
        workId: edition.workId,
        title: edition.title,
        language: edition.language,
        translator: edition.translator,
        translatedFrom: edition.translatedFrom,
        publisher: edition.publisher,
        year: edition.year,
        isbn: edition.isbn,
        // Kept in step with the Pg adapter deliberately: dropping them here would let the shared
        // contract suite pass while the real repository lost a field on every merge.
        coverUrl: edition.coverUrl,
        pages: edition.pages,
        binding: edition.binding,
        editionStatement: edition.editionStatement,
      });
      this.byId.set(existingId, merged);
      return;
    }

    // A source correcting a title gives the same edition a new natural key, so the old mapping
    // has to go — otherwise this fake keeps answering `findByNaturalKey` with the stale key and
    // stops modelling what Postgres, with its unique constraint, actually does.
    const previous = this.byId.get(edition.id);
    if (previous && previous.naturalKey !== edition.naturalKey) {
      this.idByNaturalKey.delete(previous.naturalKey);
    }
    this.byId.set(edition.id, edition);
    this.idByNaturalKey.set(edition.naturalKey, edition.id);
  }
}
