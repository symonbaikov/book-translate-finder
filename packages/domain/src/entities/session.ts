import { InvalidInputError } from '../errors/domain-error.js';

export interface CreateSessionParams {
  id: string;
  userId: string;
  /**
   * SHA-256 of the opaque token handed to the browser — never the token itself. A stolen database
   * dump then contains nothing that can be replayed as a login, which is the entire point of
   * hashing something that is already high-entropy random.
   */
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
}

/** A signed-in browser. Sessions are opaque and server-side so signing out is real, not advisory. */
export class Session {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly tokenHash: string,
    readonly createdAt: Date,
    readonly expiresAt: Date,
  ) {}

  static create(params: CreateSessionParams): Session {
    if (!params.tokenHash.trim())
      throw new InvalidInputError('Session.tokenHash must not be empty');
    if (params.expiresAt.getTime() <= params.createdAt.getTime()) {
      throw new InvalidInputError('Session.expiresAt must be after createdAt');
    }
    return new Session(
      params.id,
      params.userId,
      params.tokenHash,
      params.createdAt,
      params.expiresAt,
    );
  }

  isExpiredAt(now: Date): boolean {
    return this.expiresAt.getTime() <= now.getTime();
  }
}
