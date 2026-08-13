import { eq } from 'drizzle-orm';
import { LanguageCode, Work, type WorkRepository } from '@btf/domain';
import type { Db } from '../db/client.js';
import { work } from '../db/schema.js';

function toDomain(row: typeof work.$inferSelect): Work {
  return Work.create({
    id: row.id,
    originalTitle: row.originalTitle,
    originalLanguage: LanguageCode.create(row.originalLanguage),
    author: row.author,
    firstPublishedYear: row.firstPublishedYear,
    syncedAt: row.syncedAt,
  });
}

export class PgWorkRepository implements WorkRepository {
  constructor(private readonly db: Db) {}

  async findByNaturalKey(naturalKey: string): Promise<Work | null> {
    const [row] = await this.db.select().from(work).where(eq(work.naturalKey, naturalKey)).limit(1);
    return row ? toDomain(row) : null;
  }

  async findById(id: string): Promise<Work | null> {
    const [row] = await this.db.select().from(work).where(eq(work.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }

  async save(entity: Work): Promise<void> {
    await this.db
      .insert(work)
      .values({
        id: entity.id,
        originalTitle: entity.originalTitle,
        originalLanguage: entity.originalLanguage.value,
        author: entity.author,
        firstPublishedYear: entity.firstPublishedYear,
        naturalKey: entity.naturalKey,
        syncedAt: entity.syncedAt,
      })
      .onConflictDoUpdate({
        target: work.naturalKey,
        set: {
          // `id` is deliberately excluded (docs/rules.md §2.2): on a conflict, the pre-existing
          // row's id must survive untouched, mirroring what a hand-written
          // `ON CONFLICT (natural_key) DO UPDATE SET ...` (without `id` in the SET list) does.
          originalTitle: entity.originalTitle,
          originalLanguage: entity.originalLanguage.value,
          author: entity.author,
          firstPublishedYear: entity.firstPublishedYear,
          syncedAt: entity.syncedAt,
        },
      });
  }
}
