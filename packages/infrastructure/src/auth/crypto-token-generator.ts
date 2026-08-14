import { createHash, randomBytes } from 'node:crypto';
import type { TokenGenerator } from '@btf/domain';

/** 256 bits of randomness — a session token must be unguessable, not merely unique. */
const TOKEN_BYTES = 32;

/**
 * Session tokens.
 *
 * The token itself is only ever in the cookie; the database keeps its SHA-256. A plain hash (not
 * a slow KDF) is right here and would be wrong for a password: the input is already 256 random
 * bits, so there is nothing to brute-force, and adding a work factor would only slow every
 * authenticated request down.
 */
export class CryptoTokenGenerator implements TokenGenerator {
  newToken(): string {
    return randomBytes(TOKEN_BYTES).toString('base64url');
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
