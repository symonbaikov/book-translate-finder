import { Work } from '../../src/entities/work.js';
import type { WorkRepository } from '../../src/ports/work-repository.port.js';

export class InMemoryWorkRepository implements WorkRepository {
  private readonly byId = new Map<string, Work>();
  private readonly idByNaturalKey = new Map<string, string>();

  async findByNaturalKey(naturalKey: string): Promise<Work | null> {
    const id = this.idByNaturalKey.get(naturalKey);
    return id ? (this.byId.get(id) ?? null) : null;
  }

  async findById(id: string): Promise<Work | null> {
    return this.byId.get(id) ?? null;
  }

  async save(work: Work): Promise<void> {
    const existingId = this.idByNaturalKey.get(work.naturalKey);

    if (existingId && existingId !== work.id) {
      // Upsert-on-natural_key (docs/rules.md §2.2): the pre-existing id wins, only the other
      // fields refresh — mirrors `ON CONFLICT (natural_key) DO UPDATE` never touching the PK.
      const merged = Work.create({
        id: existingId,
        originalTitle: work.originalTitle,
        originalLanguage: work.originalLanguage,
        author: work.author,
        firstPublishedYear: work.firstPublishedYear,
        syncedAt: work.syncedAt,
      });
      this.byId.set(existingId, merged);
      return;
    }

    this.byId.set(work.id, work);
    this.idByNaturalKey.set(work.naturalKey, work.id);
  }
}
