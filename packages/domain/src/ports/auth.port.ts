import type { Bookmark } from '../entities/bookmark.js';
import type { Session } from '../entities/session.js';
import type { User } from '../entities/user.js';
import type { EmailAddress } from '../value-objects/email-address.js';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: EmailAddress): Promise<User | null>;
  findByGoogleSubject(googleSubject: string): Promise<User | null>;
  /** Idempotent upsert keyed by id — a retried registration must not create a second row. */
  save(user: User): Promise<void>;
}

export interface SessionRepository {
  findByTokenHash(tokenHash: string): Promise<Session | null>;
  save(session: Session): Promise<void>;
  deleteByTokenHash(tokenHash: string): Promise<void>;
  /** Housekeeping: expired rows are dead weight and a needless liability if the database leaks. */
  deleteExpired(now: Date): Promise<number>;
}

export interface BookmarkRepository {
  /** Idempotent by `(userId, workId)` — see `Bookmark`. */
  save(bookmark: Bookmark): Promise<void>;
  delete(userId: string, workId: string): Promise<void>;
  exists(userId: string, workId: string): Promise<boolean>;
  /** Newest first: a reading list is read from the top. */
  listByUser(userId: string, limit: number): Promise<Bookmark[]>;
  /** For the search and card views, so every result can show whether it is already saved. */
  filterSaved(userId: string, workIds: readonly string[]): Promise<string[]>;
}

/**
 * Password hashing, kept behind a port because it needs `node:crypto` and `packages/domain` may
 * not import it (docs/architecture.md §2). `verify` takes the hash rather than returning one to
 * compare, so the timing-safe comparison lives in the adapter and cannot be got wrong by a caller.
 */
export interface PasswordHasher {
  hash(plainPassword: string): Promise<string>;
  verify(plainPassword: string, hash: string): Promise<boolean>;
}

/** Cryptographically random opaque tokens — session cookies, nothing guessable. */
export interface TokenGenerator {
  newToken(): string;
  /** SHA-256, so only the hash is ever stored. */
  hashToken(token: string): string;
}

export interface WelcomeEmail {
  to: EmailAddress;
  displayName: string;
}

/**
 * Sending the welcome mail. An implementation that does nothing is a legitimate implementation:
 * a self-hosted instance with no SMTP configured must still be able to register users, and
 * blocking sign-up on mail delivery would make the three-command install a lie (CLAUDE.md).
 */
export interface EmailSender {
  sendWelcome(email: WelcomeEmail): Promise<void>;
}

/** The profile an OAuth provider vouched for. Produced only after the adapter verified it. */
export interface VerifiedGoogleProfile {
  subject: string;
  email: string;
  displayName: string;
}
