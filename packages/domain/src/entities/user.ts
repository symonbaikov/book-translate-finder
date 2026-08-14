import { InvalidInputError } from '../errors/domain-error.js';
import type { EmailAddress } from '../value-objects/email-address.js';

export interface CreateUserParams {
  id: string;
  email: EmailAddress;
  displayName: string;
  /**
   * Scrypt-derived, never a raw password — the domain has no hashing of its own (that needs
   * `node:crypto`, which `packages/domain` may not import) and simply refuses to hold anything
   * that looks like a plaintext secret.
   */
  passwordHash?: string | null;
  /** Google's stable `sub` claim. Not the email: people change their Google email. */
  googleSubject?: string | null;
  createdAt: Date;
}

/**
 * A person with an account. The only reason accounts exist in this project is bookmarks — there
 * are no roles, no profiles and no per-user settings beyond that, and adding them later should be
 * a deliberate decision rather than something this entity quietly grew.
 *
 * A user may authenticate by password, by Google, or by both once they link them. What is not
 * allowed is neither: an account nobody can sign in to is a support ticket waiting to happen.
 */
export class User {
  private constructor(
    readonly id: string,
    readonly email: EmailAddress,
    readonly displayName: string,
    readonly passwordHash: string | null,
    readonly googleSubject: string | null,
    readonly createdAt: Date,
  ) {}

  static create(params: CreateUserParams): User {
    const displayName = params.displayName.trim();
    if (!displayName) throw new InvalidInputError('User.displayName must not be empty');

    const passwordHash = params.passwordHash?.trim() || null;
    const googleSubject = params.googleSubject?.trim() || null;
    if (!passwordHash && !googleSubject) {
      throw new InvalidInputError('User must have at least one way to sign in');
    }

    return new User(
      params.id,
      params.email,
      displayName,
      passwordHash,
      googleSubject,
      params.createdAt,
    );
  }

  /**
   * Links a Google identity to an existing password account, so signing in with Google using the
   * same address reaches the same bookmarks instead of silently creating a second account.
   */
  withGoogleSubject(googleSubject: string): User {
    return new User(
      this.id,
      this.email,
      this.displayName,
      this.passwordHash,
      googleSubject,
      this.createdAt,
    );
  }
}
