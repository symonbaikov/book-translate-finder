import {
  Bookmark,
  type BookmarkRepository,
  type Clock,
  ConflictError,
  EmailAddress,
  type EmailSender,
  type IdGenerator,
  InvalidInputError,
  NotFoundError,
  type PasswordHasher,
  Session,
  type SessionRepository,
  type TokenGenerator,
  User,
  type UserRepository,
  type VerifiedGoogleProfile,
} from '@btf/domain';

/**
 * How long a session cookie stays valid. Thirty days is the "a reading list is not a bank
 * account" trade-off: long enough that saving books does not mean signing in every visit, short
 * enough that an abandoned session on a shared machine expires on its own.
 */
export const SESSION_TTL_DAYS = 30;

/**
 * The shortest password accepted. Deliberately a length floor and nothing else — no character-class
 * rules, which are known to push people towards `Passw0rd!` while doing nothing for entropy.
 */
export const MIN_PASSWORD_LENGTH = 10;

export interface AuthDeps {
  userRepository: UserRepository;
  sessionRepository: SessionRepository;
  passwordHasher: PasswordHasher;
  tokenGenerator: TokenGenerator;
  emailSender: EmailSender;
  idGenerator: IdGenerator;
  clock: Clock;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
}

export interface SignInResult {
  user: AuthenticatedUser;
  /** The raw token for the cookie. Only ever returned here — the database keeps its hash. */
  sessionToken: string;
  expiresAt: Date;
}

function toAuthenticatedUser(user: User): AuthenticatedUser {
  return { id: user.id, email: user.email.value, displayName: user.displayName };
}

/**
 * Accounts exist for one reason: bookmarks that survive a browser. Everything here is the minimum
 * that makes that trustworthy — hashed passwords, hashed session tokens, server-side sessions so
 * signing out really ends them.
 */
export class AuthService {
  constructor(private readonly deps: AuthDeps) {}

  async register(input: {
    email: string;
    password: string;
    displayName?: string;
  }): Promise<SignInResult> {
    const email = EmailAddress.create(input.email);
    if (input.password.length < MIN_PASSWORD_LENGTH) {
      throw new InvalidInputError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }

    const existing = await this.deps.userRepository.findByEmail(email);
    if (existing) {
      // Deliberately explicit rather than a vague "could not register": this endpoint is
      // rate-limited, and pretending an address is free when it is not sends people in circles.
      throw new ConflictError('An account with this email already exists');
    }

    const now = this.deps.clock.now();
    const user = User.create({
      id: this.deps.idGenerator.newId(),
      email,
      displayName: input.displayName?.trim() || email.value.split('@')[0]!,
      passwordHash: await this.deps.passwordHasher.hash(input.password),
      createdAt: now,
    });
    await this.deps.userRepository.save(user);

    // Best-effort by design: an instance with no SMTP configured (the documented Docker default)
    // must still register people. A failed greeting is not a failed sign-up.
    try {
      await this.deps.emailSender.sendWelcome({ to: email, displayName: user.displayName });
    } catch {
      // Intentionally swallowed — see above.
    }

    return this.startSession(user);
  }

  async loginWithPassword(input: { email: string; password: string }): Promise<SignInResult> {
    const email = EmailAddress.create(input.email);
    const user = await this.deps.userRepository.findByEmail(email);

    // Same error whether the address is unknown or the password is wrong: distinguishing them
    // turns this endpoint into an account-existence oracle.
    const invalid = new InvalidInputError('Invalid email or password');
    if (!user?.passwordHash) throw invalid;
    if (!(await this.deps.passwordHasher.verify(input.password, user.passwordHash))) throw invalid;

    return this.startSession(user);
  }

  /**
   * Signs in with a Google profile the adapter has already verified with Google.
   *
   * Matching is by `sub` first, then by email — so a reader who registered with a password and
   * later clicks "Continue with Google" lands in the same account with the same bookmarks, rather
   * than a silent duplicate. Email is only trusted here because it comes from Google's own
   * userinfo endpoint over a server-to-server call, never from the browser.
   */
  async loginWithGoogle(profile: VerifiedGoogleProfile): Promise<SignInResult> {
    const email = EmailAddress.create(profile.email);
    const bySubject = await this.deps.userRepository.findByGoogleSubject(profile.subject);
    if (bySubject) return this.startSession(bySubject);

    const byEmail = await this.deps.userRepository.findByEmail(email);
    if (byEmail) {
      const linked = byEmail.withGoogleSubject(profile.subject);
      await this.deps.userRepository.save(linked);
      return this.startSession(linked);
    }

    const user = User.create({
      id: this.deps.idGenerator.newId(),
      email,
      displayName: profile.displayName.trim() || email.value.split('@')[0]!,
      googleSubject: profile.subject,
      createdAt: this.deps.clock.now(),
    });
    await this.deps.userRepository.save(user);
    try {
      await this.deps.emailSender.sendWelcome({ to: email, displayName: user.displayName });
    } catch {
      // Best-effort, as in `register`.
    }
    return this.startSession(user);
  }

  /** Resolves a cookie token to a user, or null. Expired sessions are deleted as they are found. */
  async authenticate(sessionToken: string | null): Promise<AuthenticatedUser | null> {
    if (!sessionToken) return null;
    const tokenHash = this.deps.tokenGenerator.hashToken(sessionToken);
    const session = await this.deps.sessionRepository.findByTokenHash(tokenHash);
    if (!session) return null;

    if (session.isExpiredAt(this.deps.clock.now())) {
      await this.deps.sessionRepository.deleteByTokenHash(tokenHash);
      return null;
    }

    const user = await this.deps.userRepository.findById(session.userId);
    return user ? toAuthenticatedUser(user) : null;
  }

  async logout(sessionToken: string | null): Promise<void> {
    if (!sessionToken) return;
    await this.deps.sessionRepository.deleteByTokenHash(
      this.deps.tokenGenerator.hashToken(sessionToken),
    );
  }

  private async startSession(user: User): Promise<SignInResult> {
    const token = this.deps.tokenGenerator.newToken();
    const now = this.deps.clock.now();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

    await this.deps.sessionRepository.save(
      Session.create({
        id: this.deps.idGenerator.newId(),
        userId: user.id,
        tokenHash: this.deps.tokenGenerator.hashToken(token),
        createdAt: now,
        expiresAt,
      }),
    );

    return { user: toAuthenticatedUser(user), sessionToken: token, expiresAt };
  }
}

export interface BookmarkDeps {
  bookmarkRepository: BookmarkRepository;
  workRepository: { findById(id: string): Promise<{ id: string } | null> };
  clock: Clock;
}

export interface BookmarkListItem {
  workId: string;
  createdAt: Date;
}

/** The reading list. Saving is idempotent because `Bookmark`'s identity is `(userId, workId)`. */
export class BookmarkService {
  /** A reading list, not an archive — enough to be useful, bounded so one page stays one query. */
  static readonly MAX_LISTED = 200;

  constructor(private readonly deps: BookmarkDeps) {}

  async add(userId: string, workId: string): Promise<void> {
    // Checked so a typo'd or deleted id cannot leave a bookmark pointing at nothing, which would
    // surface later as a blank row in the reading list with no way to remove it.
    const work = await this.deps.workRepository.findById(workId);
    if (!work) throw new NotFoundError(`Work not found: ${workId}`);

    await this.deps.bookmarkRepository.save(
      Bookmark.create({ userId, workId, createdAt: this.deps.clock.now() }),
    );
  }

  async remove(userId: string, workId: string): Promise<void> {
    // No existence check: removing something already gone is the outcome the caller wanted.
    await this.deps.bookmarkRepository.delete(userId, workId);
  }

  async list(userId: string): Promise<BookmarkListItem[]> {
    const bookmarks = await this.deps.bookmarkRepository.listByUser(
      userId,
      BookmarkService.MAX_LISTED,
    );
    return bookmarks.map((b) => ({ workId: b.workId, createdAt: b.createdAt }));
  }

  async savedAmong(userId: string, workIds: readonly string[]): Promise<string[]> {
    if (workIds.length === 0) return [];
    return this.deps.bookmarkRepository.filterSaved(userId, workIds);
  }
}
