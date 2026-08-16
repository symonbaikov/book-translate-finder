import { describe, expect, it } from 'vitest';
import { contentHashOf, isContentHash } from './identity.js';
import { ReaderError } from './errors.js';

// The platform's own Web Crypto — Node 20 exposes the same global the browser does,
// so these tests exercise the production path rather than a Node-only import.
const subtle = globalThis.crypto.subtle;
const bytes = (text: string) => new TextEncoder().encode(text);

describe('contentHashOf', () => {
  it('is the SHA-256 of the file, in the shape storage keys are matched against', async () => {
    // Known vector: sha256("abc"). If this changes, every reader's stored position is orphaned,
    // which is exactly the kind of change that should have to edit a test to happen.
    expect(await contentHashOf(bytes('abc'), subtle)).toBe(
      'sha256-ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('is stable across calls and distinct across files', async () => {
    expect(await contentHashOf(bytes('same'), subtle)).toBe(
      await contentHashOf(bytes('same'), subtle),
    );
    expect(await contentHashOf(bytes('a'), subtle)).not.toBe(
      await contentHashOf(bytes('b'), subtle),
    );
  });

  it('says why it cannot work rather than throwing a TypeError from inside', async () => {
    // No `crypto.subtle` means an insecure context, which a self-hoster can actually fix.
    await expect(contentHashOf(bytes('x'), null)).rejects.toBeInstanceOf(ReaderError);
  });
});

describe('isContentHash', () => {
  it('accepts this version’s keys and rejects anything else in storage', async () => {
    expect(isContentHash(await contentHashOf(bytes('x'), subtle))).toBe(true);
    expect(isContentHash(`sha256-${'a'.repeat(63)}`)).toBe(false);
    expect(isContentHash(`sha256-${'A'.repeat(64)}`)).toBe(false);
    expect(isContentHash('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')).toBe(
      false,
    );
    expect(isContentHash(undefined)).toBe(false);
  });
});
