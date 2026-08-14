import {
  Bookmark,
  ConflictError,
  EmailAddress,
  InvalidInputError,
  NotFoundError,
  Session,
  User,
  type BookmarkRepository,
  type Clock,
  type EmailSender,
  type IdGenerator,
  type PasswordHasher,
  type SessionRepository,
  type TokenGenerator,
  type UserRepository,
  type WelcomeEmail,
} from '@btf/domain';
import { describe, expect, it } from 'vitest';
import { AuthService, BookmarkService } from '../../src/use-cases/auth.use-cases.js';

const FIXED_CLOCK: Clock = { now: () => new Date('2026-01-01T00:00:00Z') };

function makeIdGenerator(): IdGenerator {
  let n = 0;
  return { newId: () => `id-${++n}` };
}

/** Reversible "hashing" — the use cases care that verify matches hash, not how. */
const fakeHasher: PasswordHasher = {
  async hash(password) {
    return `hashed:${password}`;
  },
  async verify(password, hash) {
    return hash === `hashed:${password}`;
  },
};

const fakeTokens: TokenGenerator = {
  newToken: () => 'raw-token',
  hashToken: (token) => `sha:${token}`,
};

class InMemoryUsers implements UserRepository {
  readonly rows = new Map<string, User>();
  async findById(id: string) {
    return this.rows.get(id) ?? null;
  }
  async findByEmail(email: EmailAddress) {
    return [...this.rows.values()].find((u) => u.email.value === email.value) ?? null;
  }
  async findByGoogleSubject(subject: string) {
    return [...this.rows.values()].find((u) => u.googleSubject === subject) ?? null;
  }
  async save(user: User) {
    this.rows.set(user.id, user);
  }
}

class InMemorySessions implements SessionRepository {
  readonly rows = new Map<string, Session>();
  async findByTokenHash(hash: string) {
    return this.rows.get(hash) ?? null;
  }
  async save(session: Session) {
    this.rows.set(session.tokenHash, session);
  }
  async deleteByTokenHash(hash: string) {
    this.rows.delete(hash);
  }
  async deleteExpired(now: Date) {
    let removed = 0;
    for (const [hash, session] of this.rows) {
      if (session.isExpiredAt(now)) {
        this.rows.delete(hash);
        removed += 1;
      }
    }
    return removed;
  }
}

class RecordingEmailSender implements EmailSender {
  readonly sent: WelcomeEmail[] = [];
  async sendWelcome(email: WelcomeEmail) {
    this.sent.push(email);
  }
}

function makeAuth(overrides: { emailSender?: EmailSender } = {}) {
  const userRepository = new InMemoryUsers();
  const sessionRepository = new InMemorySessions();
  const emailSender = overrides.emailSender ?? new RecordingEmailSender();
  const service = new AuthService({
    userRepository,
    sessionRepository,
    passwordHasher: fakeHasher,
    tokenGenerator: fakeTokens,
    emailSender,
    idGenerator: makeIdGenerator(),
    clock: FIXED_CLOCK,
  });
  return { service, userRepository, sessionRepository, emailSender };
}

const PASSWORD = 'correct-horse-battery';

describe('AuthService.register', () => {
  it('creates an account, starts a session and greets the reader', async () => {
    const { service, emailSender } = makeAuth();

    const result = await service.register({ email: 'Reader@Example.com', password: PASSWORD });

    expect(result.user.email).toBe('reader@example.com'); // normalized by EmailAddress
    expect(result.sessionToken).toBe('raw-token');
    expect((emailSender as RecordingEmailSender).sent).toHaveLength(1);
  });

  it('derives a display name from the address when none is given', async () => {
    const { service } = makeAuth();
    const result = await service.register({ email: 'ada@example.com', password: PASSWORD });
    expect(result.user.displayName).toBe('ada');
  });

  it('rejects a password below the minimum', async () => {
    const { service } = makeAuth();
    await expect(service.register({ email: 'a@example.com', password: 'short' })).rejects.toThrow(
      InvalidInputError,
    );
  });

  it('rejects a second account on the same address', async () => {
    const { service } = makeAuth();
    await service.register({ email: 'a@example.com', password: PASSWORD });
    await expect(service.register({ email: 'A@Example.com', password: PASSWORD })).rejects.toThrow(
      ConflictError,
    );
  });

  it('still registers when the welcome email fails', async () => {
    // The documented self-hosting default has no SMTP at all. A greeting nobody can send must
    // never be the reason someone cannot create an account.
    const failing: EmailSender = {
      async sendWelcome() {
        throw new Error('smtp is down');
      },
    };
    const { service, userRepository } = makeAuth({ emailSender: failing });

    await expect(
      service.register({ email: 'a@example.com', password: PASSWORD }),
    ).resolves.toMatchObject({ user: { email: 'a@example.com' } });
    expect(userRepository.rows.size).toBe(1);
  });
});

describe('AuthService.loginWithPassword', () => {
  it('signs in with the right password, ignoring address case', async () => {
    const { service } = makeAuth();
    await service.register({ email: 'reader@example.com', password: PASSWORD });

    await expect(
      service.loginWithPassword({ email: 'READER@example.com', password: PASSWORD }),
    ).resolves.toMatchObject({ user: { email: 'reader@example.com' } });
  });

  it('gives the same error for an unknown address as for a wrong password', async () => {
    // Different messages would turn this endpoint into an account-existence oracle.
    const { service } = makeAuth();
    await service.register({ email: 'reader@example.com', password: PASSWORD });

    const wrongPassword = await service
      .loginWithPassword({ email: 'reader@example.com', password: 'nope-nope-nope' })
      .catch((error: Error) => error.message);
    const unknownUser = await service
      .loginWithPassword({ email: 'nobody@example.com', password: PASSWORD })
      .catch((error: Error) => error.message);

    expect(wrongPassword).toBe(unknownUser);
  });

  it('refuses a password login for a Google-only account', async () => {
    const { service } = makeAuth();
    await service.loginWithGoogle({
      subject: 'google-1',
      email: 'reader@example.com',
      displayName: 'Reader',
    });

    await expect(
      service.loginWithPassword({ email: 'reader@example.com', password: PASSWORD }),
    ).rejects.toThrow(InvalidInputError);
  });
});

describe('AuthService.loginWithGoogle', () => {
  it('links Google to an existing password account instead of creating a duplicate', async () => {
    const { service, userRepository } = makeAuth();
    const registered = await service.register({ email: 'reader@example.com', password: PASSWORD });

    const viaGoogle = await service.loginWithGoogle({
      subject: 'google-1',
      email: 'Reader@example.com',
      displayName: 'Reader',
    });

    expect(viaGoogle.user.id).toBe(registered.user.id);
    expect(userRepository.rows.size).toBe(1);
  });

  it('recognises a returning Google user by subject, not by email', async () => {
    // People change their Google address; `sub` is the stable identity.
    const { service, userRepository } = makeAuth();
    const first = await service.loginWithGoogle({
      subject: 'google-1',
      email: 'old@example.com',
      displayName: 'Reader',
    });

    const second = await service.loginWithGoogle({
      subject: 'google-1',
      email: 'new@example.com',
      displayName: 'Reader',
    });

    expect(second.user.id).toBe(first.user.id);
    expect(userRepository.rows.size).toBe(1);
  });
});

describe('AuthService.authenticate', () => {
  it('resolves a live session to its user', async () => {
    const { service } = makeAuth();
    const { sessionToken } = await service.register({
      email: 'reader@example.com',
      password: PASSWORD,
    });

    await expect(service.authenticate(sessionToken)).resolves.toMatchObject({
      email: 'reader@example.com',
    });
  });

  it('returns null for no cookie, and for a token that was never issued', async () => {
    const { service } = makeAuth();
    await expect(service.authenticate(null)).resolves.toBeNull();
    await expect(service.authenticate('made-up')).resolves.toBeNull();
  });

  it('rejects an expired session and deletes it on the way out', async () => {
    const { service, sessionRepository } = makeAuth();
    const { sessionToken } = await service.register({
      email: 'reader@example.com',
      password: PASSWORD,
    });
    const hash = fakeTokens.hashToken(sessionToken);
    const live = sessionRepository.rows.get(hash)!;
    sessionRepository.rows.set(
      hash,
      Session.create({
        id: live.id,
        userId: live.userId,
        tokenHash: hash,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        expiresAt: new Date('2025-02-01T00:00:00Z'),
      }),
    );

    await expect(service.authenticate(sessionToken)).resolves.toBeNull();
    expect(sessionRepository.rows.has(hash)).toBe(false);
  });

  it('ends the session on logout, so the same cookie stops working', async () => {
    const { service } = makeAuth();
    const { sessionToken } = await service.register({
      email: 'reader@example.com',
      password: PASSWORD,
    });

    await service.logout(sessionToken);

    await expect(service.authenticate(sessionToken)).resolves.toBeNull();
  });
});

class InMemoryBookmarks implements BookmarkRepository {
  readonly rows = new Map<string, Bookmark>();
  private key(userId: string, workId: string) {
    return `${userId}:${workId}`;
  }
  async save(bookmark: Bookmark) {
    const key = this.key(bookmark.userId, bookmark.workId);
    // Mirrors the real ON CONFLICT DO NOTHING: re-saving keeps the original timestamp.
    if (!this.rows.has(key)) this.rows.set(key, bookmark);
  }
  async delete(userId: string, workId: string) {
    this.rows.delete(this.key(userId, workId));
  }
  async exists(userId: string, workId: string) {
    return this.rows.has(this.key(userId, workId));
  }
  async listByUser(userId: string, limit: number) {
    return [...this.rows.values()].filter((b) => b.userId === userId).slice(0, limit);
  }
  async filterSaved(userId: string, workIds: readonly string[]) {
    return workIds.filter((id) => this.rows.has(this.key(userId, id)));
  }
}

function makeBookmarks(knownWorkIds: string[] = ['w1']) {
  const bookmarkRepository = new InMemoryBookmarks();
  const service = new BookmarkService({
    bookmarkRepository,
    workRepository: {
      async findById(id: string) {
        return knownWorkIds.includes(id) ? { id } : null;
      },
    },
    clock: FIXED_CLOCK,
  });
  return { service, bookmarkRepository };
}

describe('BookmarkService', () => {
  it('saving the same book twice leaves one bookmark', async () => {
    const { service, bookmarkRepository } = makeBookmarks();

    await service.add('u1', 'w1');
    await service.add('u1', 'w1');

    expect(bookmarkRepository.rows.size).toBe(1);
  });

  it('refuses to save a work that does not exist', async () => {
    // Otherwise the reading list grows blank rows nobody can act on.
    const { service } = makeBookmarks();
    await expect(service.add('u1', 'ghost')).rejects.toThrow(NotFoundError);
  });

  it('removing something already gone is not an error — it is the outcome asked for', async () => {
    const { service } = makeBookmarks();
    await expect(service.remove('u1', 'w1')).resolves.toBeUndefined();
  });

  it('keeps readers apart', async () => {
    const { service } = makeBookmarks();
    await service.add('u1', 'w1');

    expect(await service.list('u2')).toEqual([]);
    expect(await service.savedAmong('u2', ['w1'])).toEqual([]);
    expect(await service.savedAmong('u1', ['w1'])).toEqual(['w1']);
  });
});
