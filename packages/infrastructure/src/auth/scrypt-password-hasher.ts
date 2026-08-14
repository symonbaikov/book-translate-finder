import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';
import { promisify } from 'node:util';
import type { PasswordHasher } from '@btf/domain';

/**
 * `promisify` picks the 3-argument overload of `scrypt`, which drops the options object we need
 * for N and maxmem — so the promisified signature is declared explicitly.
 */
const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

/**
 * Scrypt from `node:crypto`.
 *
 * Chosen over bcrypt/argon2 because those are native addons: they break `pnpm install` on
 * platforms without a prebuilt binary, which for a project whose whole promise is "three commands
 * to self-host" is a real cost. Scrypt is memory-hard, in the standard library, and recommended
 * by OWASP for password storage — the trade-off is deliberate, not a shortcut.
 *
 * Parameters follow OWASP's scrypt guidance (N=2^17, r=8, p=1). N is stored in the hash string so
 * raising it later re-verifies old hashes correctly instead of locking everyone out.
 */
const SCRYPT_COST = 2 ** 17;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
/** scrypt needs roughly 128 * N * r bytes; the default 32 MB cap is below what N=2^17 requires. */
const SCRYPT_MAX_MEMORY = 256 * 1024 * 1024;

export class ScryptPasswordHasher implements PasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH);
    const derived = await this.derive(plainPassword, salt, SCRYPT_COST);
    return [
      'scrypt',
      SCRYPT_COST,
      SCRYPT_BLOCK_SIZE,
      SCRYPT_PARALLELIZATION,
      salt.toString('base64'),
      derived.toString('base64'),
    ].join('$');
  }

  async verify(plainPassword: string, hash: string): Promise<boolean> {
    const [scheme, cost, , , saltB64, expectedB64] = hash.split('$');
    if (scheme !== 'scrypt' || !cost || !saltB64 || !expectedB64) return false;

    const expected = Buffer.from(expectedB64, 'base64');
    const actual = await this.derive(plainPassword, Buffer.from(saltB64, 'base64'), Number(cost));
    // Length-checked first because timingSafeEqual throws on a mismatch rather than returning false.
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  private async derive(password: string, salt: Buffer, cost: number): Promise<Buffer> {
    return scryptAsync(password.normalize('NFKC'), salt, KEY_LENGTH, {
      N: cost,
      r: SCRYPT_BLOCK_SIZE,
      p: SCRYPT_PARALLELIZATION,
      maxmem: SCRYPT_MAX_MEMORY,
    });
  }
}
