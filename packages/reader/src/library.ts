/**
 * The books this browser is keeping, and nothing about them anywhere else.
 *
 * IndexedDB rather than `localStorage` for one reason: a book is megabytes, and `localStorage` is a
 * synchronous string store with a quota measured in single-digit megabytes. Everything else about
 * this module follows the same rules as the app's other client storage (CLAUDE.md): the reader's
 * device is the only copy, and **every write returns whether it actually landed** — private mode, a
 * full disk and a browser told to keep nothing all accept the call and store nothing, and a popup
 * that reports success for those is a lie the reader finds out about on their next visit.
 *
 * ## Two stores, and the split is load-bearing
 *
 * `books` holds one small record per book; `files` holds the bytes. Listing the library must not
 * deserialize a 40 MB EPUB per row — with one store it would, because reading a record reads all of
 * it. So the list is cheap, and the bytes are fetched only when a book is opened.
 *
 * ## Keeping the file is the reader's decision
 *
 * A record in `books` is a few hundred bytes and is written whenever a book is opened, so the reader
 * can find their way back to it. The **file** is kept only when they ask (ADR-0013 §4): helping
 * yourself to somebody's disk is not a default anyone chose.
 */
import type { BookOrigin } from './acquisition.js';

const DB_NAME = 'golden-reader';
const DB_VERSION = 1;
const BOOKS = 'books';
const FILES = 'files';

export interface LibraryEntry {
  /** `contentHashOf(file)` — the key here, in `files`, and in the progress record (identity.ts). */
  readonly hash: string;
  readonly format: string;
  readonly title: string | null;
  readonly byteLength: number;
  /** Whether the bytes are in `files`. Kept here so a list does not have to look. */
  readonly keepFile: boolean;
  /**
   * Where it came from, for the reader's own recognition — "from your device", the host it was
   * fetched from. Never sent anywhere; see ADR-0013 §1 for why that includes the URL.
   */
  readonly origin: BookOrigin;
  readonly openedAt: number;
}

/** What a freshly opened book looks like in the list. Pure, so the shape has a test. */
export function libraryEntryOf(
  book: { hash: string; format: string; bytes: ArrayBuffer; origin: BookOrigin },
  title: string | null,
  now: number,
): LibraryEntry {
  return {
    hash: book.hash,
    format: book.format,
    title,
    byteLength: book.bytes.byteLength,
    keepFile: false,
    origin: book.origin,
    openedAt: now,
  };
}

/** Most recently opened first — the order a reader looks for a book they just had. */
export function sortLibrary(entries: readonly LibraryEntry[]): LibraryEntry[] {
  return [...entries].sort((a, b) => b.openedAt - a.openedAt);
}

function request<T>(source: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    source.onsuccess = () => resolve(source.result);
    source.onerror = () => reject(source.error ?? new Error('IndexedDB request failed'));
  });
}

async function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return null;
  try {
    const open = indexedDB.open(DB_NAME, DB_VERSION);
    open.onupgradeneeded = () => {
      const db = open.result;
      if (!db.objectStoreNames.contains(BOOKS)) db.createObjectStore(BOOKS, { keyPath: 'hash' });
      // No `keyPath`: the value here is a raw ArrayBuffer, keyed by the same hash as its record.
      if (!db.objectStoreNames.contains(FILES)) db.createObjectStore(FILES);
    };
    return await request(open);
  } catch {
    // Private mode and "block all storage" both throw here rather than returning null.
    return null;
  }
}

async function write(store: string, run: (store: IDBObjectStore) => void): Promise<boolean> {
  const db = await openDatabase();
  if (!db) return false;
  try {
    return await new Promise<boolean>((resolve) => {
      const transaction = db.transaction(store, 'readwrite');
      // Resolved from the transaction rather than the request: a quota failure surfaces on the
      // commit, and a request that "succeeded" inside an aborted transaction stored nothing.
      transaction.oncomplete = () => resolve(true);
      transaction.onabort = () => resolve(false);
      transaction.onerror = () => resolve(false);
      run(transaction.objectStore(store));
    });
  } catch {
    return false;
  } finally {
    db.close();
  }
}

async function read<T>(
  store: string,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  const db = await openDatabase();
  if (!db) return null;
  try {
    return await request(run(db.transaction(store, 'readonly').objectStore(store)));
  } catch {
    return null;
  } finally {
    db.close();
  }
}

/** Every book this browser knows about, newest first. An unreadable database is an empty one. */
export async function listLibrary(): Promise<LibraryEntry[]> {
  const entries = await read<LibraryEntry[]>(BOOKS, (store) => store.getAll());
  return sortLibrary(entries ?? []);
}

/** Record that this book was opened. Called on every open, so it is an upsert by hash. */
export async function rememberBook(entry: LibraryEntry): Promise<boolean> {
  return write(BOOKS, (store) => void store.put(entry));
}

/**
 * Keep the bytes in this browser.
 *
 * The likeliest failure by far, and the reason every caller must check the answer: this is the one
 * write large enough to hit a quota, and a browser over quota aborts the transaction rather than
 * telling anyone.
 */
export async function keepBookFile(hash: string, bytes: ArrayBuffer): Promise<boolean> {
  const stored = await write(FILES, (store) => void store.put(bytes, hash));
  if (!stored) return false;
  return updateEntry(hash, (entry) => ({ ...entry, keepFile: true }));
}

/** Drop the bytes, keep the record. The reader can still see they read it. */
export async function forgetBookFile(hash: string): Promise<boolean> {
  const dropped = await write(FILES, (store) => void store.delete(hash));
  if (!dropped) return false;
  return updateEntry(hash, (entry) => ({ ...entry, keepFile: false }));
}

/** The kept bytes, or `null` — which is also what a browser that evicted them under pressure says. */
export async function readBookFile(hash: string): Promise<ArrayBuffer | null> {
  const bytes = await read<ArrayBuffer | undefined>(FILES, (store) => store.get(hash));
  return bytes ?? null;
}

/** Forget the book entirely: the record and the bytes. */
export async function removeBook(hash: string): Promise<boolean> {
  const droppedFile = await write(FILES, (store) => void store.delete(hash));
  const droppedEntry = await write(BOOKS, (store) => void store.delete(hash));
  return droppedFile && droppedEntry;
}

async function updateEntry(
  hash: string,
  change: (entry: LibraryEntry) => LibraryEntry,
): Promise<boolean> {
  const entry = await read<LibraryEntry | undefined>(BOOKS, (store) => store.get(hash));
  if (!entry) return false;
  return rememberBook(change(entry));
}
