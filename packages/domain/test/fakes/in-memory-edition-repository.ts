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
      });
      this.byId.set(existingId, merged);
      return;
    }

    this.byId.set(edition.id, edition);
    this.idByNaturalKey.set(edition.naturalKey, edition.id);
  }
}
