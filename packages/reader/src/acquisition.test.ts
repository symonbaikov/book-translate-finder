import { describe, expect, it } from 'vitest';
import {
  acquireFromFile,
  acquireFromStored,
  acquireFromUrl,
  isFetchableBookUrl,
} from './acquisition.js';
import { AcquisitionError, UnsupportedFormatError } from './errors.js';

// The platform's own Web Crypto — Node 20 exposes the same global the browser does,
// so these tests exercise the production path rather than a Node-only import.
const subtle = globalThis.crypto.subtle;

function epubBytes(): Uint8Array {
  const media = 'application/epub+zip';
  const bytes = new Uint8Array(38 + media.length);
  bytes.set([0x50, 0x4b, 0x03, 0x04]);
  bytes.set(new TextEncoder().encode('mimetype'), 30);
  bytes.set(new TextEncoder().encode(media), 38);
  return bytes;
}

const okResponse = (bytes: Uint8Array, headers: Record<string, string> = {}) =>
  new Response(bytes.buffer.slice(0) as ArrayBuffer, { status: 200, headers });

/** Asserts the call fails and hands back the error, typed — `.catch(e => e)` widens the union. */
async function failureOf(promise: Promise<unknown>): Promise<AcquisitionError> {
  try {
    await promise;
  } catch (error) {
    return error as AcquisitionError;
  }
  throw new Error('expected this acquisition to fail, and it did not');
}

describe('isFetchableBookUrl', () => {
  it('accepts http and https and nothing else', () => {
    expect(isFetchableBookUrl('https://example.org/book.epub')).toBe(true);
    expect(isFetchableBookUrl('http://192.168.1.10:8083/book.epub')).toBe(true);
    // Each of these executes or reads in *this* origin — the same list ADR-0010 refuses for addons.
    expect(isFetchableBookUrl('javascript:alert(1)')).toBe(false);
    expect(isFetchableBookUrl('data:application/epub+zip;base64,AAA')).toBe(false);
    expect(isFetchableBookUrl('blob:https://example.org/uuid')).toBe(false);
    expect(isFetchableBookUrl('file:///home/reader/book.epub')).toBe(false);
    expect(isFetchableBookUrl('not a url')).toBe(false);
  });
});

describe('acquireFromUrl', () => {
  it('fetches the book without this instance in the middle, and without its cookies', async () => {
    let seen: RequestInit | undefined;
    const book = await acquireFromUrl('https://example.org/gatsby.epub', {
      subtle,
      fetch: async (_url, init) => {
        seen = init;
        return okResponse(epubBytes());
      },
    });

    expect(book.format).toBe('epub');
    expect(book.origin).toEqual({ kind: 'url', url: 'https://example.org/gatsby.epub' });
    expect(book.hash).toMatch(/^sha256-[0-9a-f]{64}$/);
    expect(seen?.credentials).toBe('omit');
    expect(seen?.referrerPolicy).toBe('no-referrer');
  });

  it('refuses a scheme before making any request at all', async () => {
    let called = false;
    await expect(
      acquireFromUrl('file:///etc/passwd', {
        subtle,
        fetch: async () => {
          called = true;
          return okResponse(epubBytes());
        },
      }),
    ).rejects.toMatchObject({ reason: 'unsupported-scheme' });
    expect(called).toBe(false);
  });

  it('does not claim CORS it cannot observe', async () => {
    // A refused cross-origin fetch and an unplugged cable arrive as the same opaque TypeError.
    const error = await failureOf(
      acquireFromUrl('https://example.org/book.epub', {
        subtle,
        fetch: async () => {
          throw new TypeError('Failed to fetch');
        },
      }),
    );

    expect(error.reason).toBe('unreachable');
    expect(error.message).toContain('unreachable');
    expect(error.message).toContain('device');
    expect(error.message).not.toContain('CORS');
  });

  it('reports the status when the source answered but not with a book', async () => {
    const error = await failureOf(
      acquireFromUrl('https://example.org/gone.epub', {
        subtle,
        fetch: async () => new Response('', { status: 404 }),
      }),
    );

    expect(error.reason).toBe('http-error');
    expect(error.status).toBe(404);
  });

  it('refuses a file too large for one tab, on the declared length before downloading it', async () => {
    let downloaded = false;
    const error = await failureOf(
      acquireFromUrl('https://example.org/huge.epub', {
        subtle,
        maxBytes: 1024,
        fetch: async () => {
          downloaded = true;
          return okResponse(epubBytes(), { 'content-length': String(10 * 1024) });
        },
      }),
    );

    expect(error.reason).toBe('too-large');
    // The response was still requested — only its body was not kept.
    expect(downloaded).toBe(true);
  });

  it('refuses a file too large that declared no length', async () => {
    const error = await failureOf(
      acquireFromUrl('https://example.org/chunked.epub', {
        subtle,
        maxBytes: 8,
        fetch: async () => okResponse(epubBytes()),
      }),
    );

    expect(error.reason).toBe('too-large');
  });

  it('refuses something that is not a book, naming the file rather than the format', async () => {
    await expect(
      acquireFromUrl('https://example.org/notes.pdf', {
        subtle,
        fetch: async () => okResponse(new TextEncoder().encode('%PDF-1.7')),
      }),
    ).rejects.toBeInstanceOf(UnsupportedFormatError);
  });
});

describe('acquireFromFile', () => {
  it('takes a file from the device and touches no network', async () => {
    const bytes = epubBytes();
    const book = await acquireFromFile(
      {
        name: 'from-my-disk.epub',
        size: bytes.byteLength,
        arrayBuffer: async () => bytes.buffer.slice(0) as ArrayBuffer,
      },
      {
        subtle,
        fetch: () => {
          throw new Error('a file from the device must not cause a request');
        },
      },
    );

    expect(book.format).toBe('epub');
    expect(book.origin).toEqual({ kind: 'file', name: 'from-my-disk.epub' });
  });

  it('gives the same hash for the same bytes, whichever way they arrived', async () => {
    const bytes = epubBytes();
    const fetched = await acquireFromUrl('https://example.org/a.epub', {
      subtle,
      fetch: async () => okResponse(bytes),
    });
    const picked = await acquireFromFile(
      {
        name: 'a.epub',
        size: bytes.byteLength,
        arrayBuffer: async () => bytes.buffer.slice(0) as ArrayBuffer,
      },
      { subtle },
    );

    // The point of hashing the file rather than the URL: the same book resumes where it was left.
    expect(picked.hash).toBe(fetched.hash);
  });
});

describe('acquireFromStored', () => {
  it('re-hashes what came out of storage instead of trusting it', async () => {
    const bytes = epubBytes();
    const { hash } = await acquireFromFile(
      {
        name: 'a.epub',
        size: bytes.byteLength,
        arrayBuffer: async () => bytes.buffer.slice(0) as ArrayBuffer,
      },
      { subtle },
    );

    const good = await acquireFromStored(bytes.buffer.slice(0) as ArrayBuffer, hash, { subtle });
    expect(good.origin).toEqual({ kind: 'stored' });

    await expect(
      acquireFromStored(bytes.buffer.slice(0) as ArrayBuffer, `sha256-${'0'.repeat(64)}`, {
        subtle,
      }),
    ).rejects.toBeInstanceOf(AcquisitionError);
  });
});
