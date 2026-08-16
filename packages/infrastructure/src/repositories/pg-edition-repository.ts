import { eq } from 'drizzle-orm';
import { Edition, type EditionRepository, Isbn, LanguageCode } from '@golden/domain';
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
    editionStatement: row.editionStatement,
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

  /**
   * Insert or update, keyed on the natural key — **except** when this row already exists under
   * this id, in which case it is updated in place.
   *
   * That exception is the whole point. The natural key is derived from the title, publisher, year,
   * language and ISBN, so a source *correcting* any of them gives the same edition a different
   * natural key. `SyncWorkFromSource` still resolves the row by `external_ref` and hands back the
   * original id, and a plain insert-on-conflict-natural-key then finds no conflict, inserts, and
   * dies on the primary key — permanently, for that book, with the message `duplicate key value
   * violates unique constraint "edition_pkey"`. Found exactly that way, when a parser fix turned
   * `Alices &#xE4;ventyr i underlandet` into `Alices äventyr i underlandet`; an upstream cataloguer
   * fixing a typo would have done the same.
   *
   * The insert path keeps the old behaviour untouched, so a *new* id carrying a natural key that
   * already exists still merges onto the existing row rather than duplicating it.
   */
  async save(entity: Edition): Promise<void> {
    const [updated] = await this.q
      .update(edition)
      .set({
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
        editionStatement: entity.editionStatement,
        naturalKey: entity.naturalKey,
      })
      .where(eq(edition.id, entity.id))
      .returning({ id: edition.id });
    if (updated) return;

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
        editionStatement: entity.editionStatement,
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
          editionStatement: entity.editionStatement,
        },
      });
  }
}
