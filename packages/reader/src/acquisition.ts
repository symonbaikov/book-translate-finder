/**
 * Getting the bytes of a book into the tab, and nowhere else.
 *
 * Three ways in, one result. The reader's browser fetches the URL itself, or the reader hands over a
 * file from their device, or the bytes come back out of this browser's own storage. There is no
 * fourth way, and in particular there is no server-side one: this instance never fetches a book on
 * anybody's behalf (ADR-0013 §1), which is why this module takes a `fetch` and not an API client.
 *
 * The failure that matters most is the boring one. A cross-origin `fetch` refused by the source's
 * CORS policy is reported by every engine as the same opaque `TypeError` as an unplugged cable, so
 * this module refuses to name a cause it cannot observe (`errors.ts`, `unreachable`) and leaves the
 * interface to offer the paths that do work — download the file, then open it from the device.
 */
import { AcquisitionError, UnsupportedFormatError } from './errors.js';
import { contentHashOf } from './identity.js';
import { isSupportedFormat, sniffFormat, type ReaderFormat } from './format.js';

/** Where a book came from. Kept for the interface's wording, never for a request. */
export type BookOrigin =
  | { readonly kind: 'url'; readonly url: string }
  | { readonly kind: 'file'; readonly name: string }
  | { readonly kind: 'stored' };

export interface AcquiredBook {
  readonly bytes: ArrayBuffer;
  readonly format: ReaderFormat;
  /** `sha256-…` over `bytes`. The storage key, and never anything else — see identity.ts. */
  readonly hash: string;
  readonly origin: BookOrigin;
}

export interface AcquireOptions {
  /** Injected so tests need no network and so nothing here reaches for an ambient global. */
  readonly fetch?: typeof globalThis.fetch;
  readonly subtle?: SubtleCrypto;
  readonly signal?: AbortSignal;
  /**
   * The whole file is held in memory by design — that is what "it never touches the server" costs —
   * so there has to be a number, and the reader has to be told it rather than watching the tab die.
   * 256 MB is above every EPUB and most comics; the phase measures the real limit on real phones.
   */
  readonly maxBytes?: number;
}

const DEFAULT_MAX_BYTES = 256 * 1024 * 1024;

/** Only the two schemes a book can actually be served over. See ADR-0010's identical reasoning:
 * `javascript:`, `data:`, `blob:` and `file:` execute or read in *this* origin. */
export function isFetchableBookUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function filenameOf(url: string): string {
  try {
    return decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '');
  } catch {
    return '';
  }
}

async function finish(
  bytes: ArrayBuffer,
  filename: string,
  origin: BookOrigin,
  options: AcquireOptions,
): Promise<AcquiredBook> {
  const format = sniffFormat(new Uint8Array(bytes), filename);
  if (!isSupportedFormat(format)) {
    throw new UnsupportedFormatError(
      filename
        ? `${filename} is not a book this reader can open.`
        : 'This file is not a book this reader can open.',
    );
  }
  return { bytes, format, hash: await contentHashOf(bytes, options.subtle), origin };
}

/**
 * Fetch a book the reader chose, from the reader's own browser.
 *
 * `credentials: 'omit'` and `referrerPolicy: 'no-referrer'` for the same reason ADR-0010 §3 gives:
 * no cookie of this instance and no hint of which page they came from travels to a third party
 * because the reader clicked "read".
 */
export async function acquireFromUrl(
  url: string,
  options: AcquireOptions = {},
): Promise<AcquiredBook> {
  if (!isFetchableBookUrl(url)) {
    throw new AcquisitionError(`${url} is not an http(s) address.`, 'unsupported-scheme');
  }
  const doFetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;

  let response: Response;
  try {
    response = await doFetch(url, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      redirect: 'follow',
      ...(options.signal ? { signal: options.signal } : {}),
    });
  } catch {
    // Everything the browser will tell us is "it did not work". Naming CORS here would be a guess
    // rendered as a diagnosis; the message says both, because the next step is the same for both.
    throw new AcquisitionError(
      `${new URL(url).host} did not send the file. Either it is unreachable, or it does not allow ` +
        'other sites to read its files. Downloading it and opening it from your device works either way.',
      'unreachable',
    );
  }

  if (!response.ok) {
    throw new AcquisitionError(
      `${new URL(url).host} answered ${response.status}.`,
      'http-error',
      response.status,
    );
  }

  const declared = Number(response.headers.get('content-length') ?? Number.NaN);
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new AcquisitionError(
      `This file is ${Math.round(declared / 1024 / 1024)} MB, more than this reader holds in one tab.`,
      'too-large',
    );
  }

  const bytes = await response.arrayBuffer();
  // Checked again: `content-length` is absent on chunked responses and is not a promise in any case.
  if (bytes.byteLength > maxBytes) {
    throw new AcquisitionError(
      `This file is ${Math.round(bytes.byteLength / 1024 / 1024)} MB, more than this reader holds in one tab.`,
      'too-large',
    );
  }

  return finish(bytes, filenameOf(url), { kind: 'url', url }, options);
}

/** A file the reader handed over — the picker, a drop, or the share target. Nothing is fetched. */
export async function acquireFromFile(
  file: { name: string; size: number; arrayBuffer(): Promise<ArrayBuffer> },
  options: AcquireOptions = {},
): Promise<AcquiredBook> {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  if (file.size > maxBytes) {
    throw new AcquisitionError(
      `${file.name} is ${Math.round(file.size / 1024 / 1024)} MB, more than this reader holds in one tab.`,
      'too-large',
    );
  }
  return finish(await file.arrayBuffer(), file.name, { kind: 'file', name: file.name }, options);
}

/**
 * Bytes this browser kept earlier, for a reader who asked it to.
 *
 * Re-sniffed and re-hashed rather than trusted: what comes back out of storage is whatever is in
 * storage, and a record whose hash no longer matches its bytes is a corrupted entry, not a book.
 */
export async function acquireFromStored(
  bytes: ArrayBuffer,
  expectedHash: string,
  options: AcquireOptions = {},
): Promise<AcquiredBook> {
  const book = await finish(bytes, '', { kind: 'stored' }, options);
  if (book.hash !== expectedHash) {
    throw new AcquisitionError(
      'The stored copy of this book does not match what was stored. It has been discarded.',
      'unreachable',
    );
  }
  return book;
}
