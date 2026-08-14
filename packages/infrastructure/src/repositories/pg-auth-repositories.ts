import { and, asc, desc, eq, inArray, lte } from 'drizzle-orm';
import {
  Bookmark,
  EmailAddress,
  Session,
  User,
  type BookmarkRepository,
  type SessionRepository,
  type UserRepository,
} from '@btf/domain';
import type { Db } from '../db/client.js';
import { appUser, bookmark, session } from '../db/schema.js';
import { resolveDb } from '../db/transaction-context.js';

type UserRow = typeof appUser.$inferSelect;
type SessionRow = typeof session.$inferSelect;
type BookmarkRow = typeof bookmark.$inferSelect;

function toUser(row: UserRow): User {
  return User.create({
    id: row.id,
    email: EmailAddress.create(row.email),
    displayName: row.displayName,
    passwordHash: row.passwordHash,
    googleSubject: row.googleSubject,
    createdAt: row.createdAt,
  });
}

function toSession(row: SessionRow): Session {
  return Session.create({
    id: row.id,
    userId: row.userId,
    tokenHash: row.tokenHash,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
  });
}

function toBookmark(row: BookmarkRow): Bookmark {
  return Bookmark.create({ userId: row.userId, workId: row.workId, createdAt: row.createdAt });
}

export class PgUserRepository implements UserRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<User | null> {
    const [row] = await resolveDb(this.db)
      .select()
      .from(appUser)
      .where(eq(appUser.id, id))
      .limit(1);
    return row ? toUser(row) : null;
  }

  async findByEmail(email: EmailAddress): Promise<User | null> {
    const [row] = await resolveDb(this.db)
      .select()
      .from(appUser)
      .where(eq(appUser.email, email.value))
      .limit(1);
    return row ? toUser(row) : null;
  }

  async findByGoogleSubject(googleSubject: string): Promise<User | null> {
    const [row] = await resolveDb(this.db)
      .select()
      .from(appUser)
      .where(eq(appUser.googleSubject, googleSubject))
      .limit(1);
    return row ? toUser(row) : null;
  }

  async save(user: User): Promise<void> {
    await resolveDb(this.db)
      .insert(appUser)
      .values({
        id: user.id,
        email: user.email.value,
        displayName: user.displayName,
        passwordHash: user.passwordHash,
        googleSubject: user.googleSubject,
        createdAt: user.createdAt,
      })
      .onConflictDoUpdate({
        target: appUser.id,
        set: {
          displayName: user.displayName,
          passwordHash: user.passwordHash,
          googleSubject: user.googleSubject,
        },
      });
  }
}

export class PgSessionRepository implements SessionRepository {
  constructor(private readonly db: Db) {}

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const [row] = await resolveDb(this.db)
      .select()
      .from(session)
      .where(eq(session.tokenHash, tokenHash))
      .limit(1);
    return row ? toSession(row) : null;
  }

  async save(entity: Session): Promise<void> {
    await resolveDb(this.db)
      .insert(session)
      .values({
        id: entity.id,
        userId: entity.userId,
        tokenHash: entity.tokenHash,
        createdAt: entity.createdAt,
        expiresAt: entity.expiresAt,
      })
      .onConflictDoNothing({ target: session.tokenHash });
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await resolveDb(this.db).delete(session).where(eq(session.tokenHash, tokenHash));
  }

  async deleteExpired(now: Date): Promise<number> {
    const rows = await resolveDb(this.db)
      .delete(session)
      .where(lte(session.expiresAt, now))
      .returning({ id: session.id });
    return rows.length;
  }
}

export class PgBookmarkRepository implements BookmarkRepository {
  constructor(private readonly db: Db) {}

  async save(entity: Bookmark): Promise<void> {
    await resolveDb(this.db)
      .insert(bookmark)
      .values({ userId: entity.userId, workId: entity.workId, createdAt: entity.createdAt })
      // The composite primary key makes saving idempotent; keeping the original `createdAt` means
      // re-saving does not quietly reorder someone's reading list.
      .onConflictDoNothing();
  }

  async delete(userId: string, workId: string): Promise<void> {
    await resolveDb(this.db)
      .delete(bookmark)
      .where(and(eq(bookmark.userId, userId), eq(bookmark.workId, workId)));
  }

  async exists(userId: string, workId: string): Promise<boolean> {
    const [row] = await resolveDb(this.db)
      .select({ workId: bookmark.workId })
      .from(bookmark)
      .where(and(eq(bookmark.userId, userId), eq(bookmark.workId, workId)))
      .limit(1);
    return row !== undefined;
  }

  async listByUser(userId: string, limit: number): Promise<Bookmark[]> {
    const rows = await resolveDb(this.db)
      .select()
      .from(bookmark)
      .where(eq(bookmark.userId, userId))
      .orderBy(desc(bookmark.createdAt), asc(bookmark.workId))
      .limit(limit);
    return rows.map(toBookmark);
  }

  async filterSaved(userId: string, workIds: readonly string[]): Promise<string[]> {
    if (workIds.length === 0) return [];
    const rows = await resolveDb(this.db)
      .select({ workId: bookmark.workId })
      .from(bookmark)
      .where(and(eq(bookmark.userId, userId), inArray(bookmark.workId, [...workIds])));
    return rows.map((row) => row.workId);
  }
}
