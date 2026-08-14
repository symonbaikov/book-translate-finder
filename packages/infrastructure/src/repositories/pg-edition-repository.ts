import { eq } from 'drizzle-orm';
import { Edition, type EditionRepository, Isbn, LanguageCode } from '@btf/domain';
import type { Db } from '../db/client.js';
import { resolveDb } from '../db/transaction-context.js';
import { edition } from '../db/schema.js';

function toDomain(row: typeof edition.$inferSelect): Edition {
  return Edition.create({
    id: row.id,
    workId: row.workId,
    title: row.title,
    language: LanguageCode.create(row.language),
    translator: row.translator,
    translatedFrom: row.translatedFrom ? LanguageCode.create(row.translatedFrom) : null,
    publisher: row.publisher,
    year: row.year,
    isbn: row.isbn13 ? Isbn.create(row.isbn13) : null,
    coverUrl: row.coverUrl,
    pages: row.pages,
    binding: row.binding,
  });
}

export class PgEditionRepository implements EditionRepository {
  constructor(private readonly db: Db) {}

  /** Resolves to the ambient transaction if PgUnitOfWork.runInTransaction is active, else the pool. */
  private get q() {
    return resolveDb(this.db);
  }

  async findByNaturalKey(naturalKey: string): Promise<Edition | null> {
    const [row] = await this.q
      .select()
      .from(edition)
      .where(eq(edition.naturalKey, naturalKey))
      .limit(1);
    return row ? toDomain(row) : null;
  }

  async findById(id: string): Promise<Edition | null> {
    const [row] = await this.q.select().from(edition).where(eq(edition.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }

  async findByWorkId(workId: string): Promise<Edition[]> {
    const rows = await this.q.select().from(edition).where(eq(edition.workId, workId));
    return rows.map(toDomain);
  }

  async save(entity: Edition): Promise<void> {
    await this.q
      .insert(edition)
      .values({
        id: entity.id,
        workId: entity.workId,
        title: entity.title,
        language: entity.language.value,
        translator: entity.translator,
        translatedFrom: entity.translatedFrom?.value ?? null,
        publisher: entity.publisher,
        year: entity.year,
        isbn13: entity.isbn?.value ?? null,
        coverUrl: entity.coverUrl,
        pages: entity.pages,
        binding: entity.binding,
        naturalKey: entity.naturalKey,
      })
      .onConflictDoUpdate({
        target: edition.naturalKey,
        set: {
          // `id` deliberately excluded — same upsert contract as PgWorkRepository.
          workId: entity.workId,
          title: entity.title,
          language: entity.language.value,
          translator: entity.translator,
          translatedFrom: entity.translatedFrom?.value ?? null,
          publisher: entity.publisher,
          year: entity.year,
          isbn13: entity.isbn?.value ?? null,
          coverUrl: entity.coverUrl,
          pages: entity.pages,
          binding: entity.binding,
        },
      });
  }
}
