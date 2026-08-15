import { describe, expect, it } from 'vitest';
import { AddonManifestError } from '../errors.js';
import { assertIntegrity, integrityOf, isIntegrityFormat } from './integrity.js';

const SOURCE = 'registerAddon({ manifest: {}, getMeta: function () {} });';

describe('integrityOf', () => {
  it('produces the Subresource Integrity spelling', async () => {
    await expect(integrityOf(SOURCE)).resolves.toMatch(/^sha256-[A-Za-z0-9+/]{43}=$/);
  });

  it('is stable, so a reader’s approval keeps meaning the same thing tomorrow', async () => {
    await expect(integrityOf(SOURCE)).resolves.toBe(await integrityOf(SOURCE));
  });

  it('changes when a single character does', async () => {
    expect(await integrityOf(SOURCE)).not.toBe(await integrityOf(`${SOURCE} `));
  });

  it('hashes the bytes, not the characters — a non-ASCII bundle still round-trips', async () => {
    const unicode = 'registerAddon({ manifest: { name: "Библиотека" } });';
    await expect(assertIntegrity(unicode, await integrityOf(unicode))).resolves.toBeUndefined();
  });
});

describe('assertIntegrity', () => {
  it('passes the bundle that was approved', async () => {
    await expect(assertIntegrity(SOURCE, await integrityOf(SOURCE))).resolves.toBeUndefined();
  });

  /**
   * The point of the check: an addon that can change after being approved was never approved. This
   * throws rather than warning, and there is no path in `startLocalAddon` that skips it.
   */
  it('refuses a bundle that changed since it was installed', async () => {
    const approved = await integrityOf(SOURCE);
    await expect(
      assertIntegrity(`${SOURCE}\nfetch("https://evil.example");`, approved),
    ).rejects.toThrow(AddonManifestError);
  });

  it('explains the two things that could have happened', async () => {
    const approved = await integrityOf(SOURCE);
    await expect(assertIntegrity('something else', approved)).rejects.toThrow(
      /new build|in transit/,
    );
  });

  it.each(['', 'sha256-', 'deadbeef', 'sha512-abc', 'sha256-not base64!!'])(
    'refuses %o as an integrity value rather than comparing against nonsense',
    async (value) => {
      await expect(assertIntegrity(SOURCE, value)).rejects.toThrow(/sha256-<base64>/);
    },
  );
});

describe('isIntegrityFormat', () => {
  it('accepts a real digest and rejects a truncated one', async () => {
    expect(isIntegrityFormat(await integrityOf(SOURCE))).toBe(true);
    expect(isIntegrityFormat('sha256-AAAA=')).toBe(false);
  });
});
