import { AddonManifestError } from '../errors.js';

/**
 * The hash a local addon's bundle must match before any of it runs.
 *
 * A local addon is code that will execute on the reader's device, approved once at install time on
 * the strength of what it said it would do. An addon that can quietly change afterwards was never
 * really approved — the reader agreed to a version, not to a URL. So the integrity hash is required
 * by the descriptor type (`AddonDescriptor`), there is no opt-out, and a mismatch is a refusal to
 * run rather than a warning to click past.
 *
 * The format is the Subresource Integrity spelling — `sha256-<base64>` — because it is the one
 * readers may already have seen, and because an addon author can produce it with the same one-liner
 * they would use for a `<script integrity>`:
 *
 * ```
 * openssl dgst -sha256 -binary addon.js | openssl base64 -A
 * ```
 */

const PREFIX = 'sha256-';

export function isIntegrityFormat(value: string): boolean {
  if (!value.startsWith(PREFIX)) return false;
  const encoded = value.slice(PREFIX.length);
  // 32 bytes base64 is 44 characters with one '=' of padding.
  return /^[A-Za-z0-9+/]{43}=$/.test(encoded);
}

/** `sha256-<base64>` for a bundle, computed the same way the check below computes it. */
export async function integrityOf(source: string): Promise<string> {
  const bytes = new TextEncoder().encode(source);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return `${PREFIX}${base64(new Uint8Array(digest))}`;
}

/**
 * Throws unless the bundle hashes to `expected`.
 *
 * The comparison is length-then-content on a value that is already public, so it is not written in
 * constant time: there is no secret here to leak through timing. What matters is that it happens
 * before the source reaches `composeWorkerSource`, and there is no path that skips it.
 */
export async function assertIntegrity(source: string, expected: string): Promise<void> {
  if (!isIntegrityFormat(expected)) {
    throw new AddonManifestError(
      `An addon bundle's integrity must be written as sha256-<base64>; got "${expected.slice(0, 40)}".`,
    );
  }
  const actual = await integrityOf(source);
  if (actual !== expected) {
    throw new AddonManifestError(
      'This addon’s code does not match the version that was installed, so it was not run. ' +
        'Either the author published a new build, or something changed it in transit.',
    );
  }
}

function base64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  // `btoa` exists in browsers and in Node 16+; this package targets both and uses nothing else
  // from either environment.
  return btoa(binary);
}
