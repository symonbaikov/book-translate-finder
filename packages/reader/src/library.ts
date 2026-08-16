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
import type { AcquiredBook } from './acquisition.js';
import { isReadingRecord, newReadingRecord, type ReadingRecord } from './progress.js';

const DB_NAME = 'golden-reader';
const DB_VERSION = 1;
const BOOKS = 'books';
const FILES = 'files';

/**
 * A book this browser knows about: what it is, where the reader got to, and what they marked.
 *
 * One record rather than two — see `progress.ts` for why the split this file briefly had did not
 * survive contact with a second write.
 */
export type LibraryEntry = ReadingRecord;

/** What a freshly opened book looks like in the list. Pure, so the shape has a test. */
export function libraryEntryOf(
  book: AcquiredBook,
  title: string | null,
  now: number,
): LibraryEntry {
  return newReadingRecord({
    hash: book.hash,
    format: book.format,
    title,
    byteLength: book.bytes.byteLength,
    origin: book.origin,
    now,
  });
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

/**
 * Make sense of a record this browser wrote at some point in the past.
 *
 * Storage here is the reader's own device and outlives every deployment: a record written before
 * `position` and `bookmarks` existed is still somebody's library, and dropping it because a field
 * was added would be the tidier-schema-for-your-shelf trade this project already refused once
 * (plan.md 7.8). So a recognisable older shape is filled in, and only genuine junk is discarded.
 *
 * It was not hypothetical for long: the version that introduced positions read back the version
 * that did not, and threw on `position.cfi` for every book already in the library.
 */
export function reviveEntry(value: unknown): LibraryEntry | null {
  if (isReadingRecord(value)) return value;
  if (typeof value !== 'object' || value === null) return null;

  const older = value as Partial<LibraryEntry>;
  if (typeof older.hash !== 'string' || typeof older.format !== 'string') return null;

  const upgraded: LibraryEntry = {
    ...newReadingRecord({
      hash: older.hash,
      format: older.format,
      title: older.title ?? null,
      byteLength: older.byteLength ?? 0,
      origin: older.origin ?? { kind: 'stored' },
      now: older.openedAt ?? 0,
    }),
    keepFile: older.keepFile === true,
  };
  return isReadingRecord(upgraded) ? upgraded : null;
}

/** Every book this browser knows about, newest first. An unreadable database is an empty one. */
export async function listLibrary(): Promise<LibraryEntry[]> {
  const entries = await read<unknown[]>(BOOKS, (store) => store.getAll());
  const revived = (entries ?? [])
    .map(reviveEntry)
    .filter((entry): entry is LibraryEntry => !!entry);
  return sortLibrary(revived);
}

/**
 * Write the record: opened, moved, bookmarked, kept.
 *
 * One function for all of them, because they are one record and IndexedDB has no partial update.
 * An upsert by hash, so re-opening a book keeps its position rather than resetting it — the caller
 * merges (`progress.ts`) and this stores.
 */
export async function rememberBook(entry: LibraryEntry): Promise<boolean> {
  return write(BOOKS, (store) => void store.put(entry));
}

/** What this browser remembers about one book, or `null` if it has never seen it. */
export async function readBook(hash: string): Promise<LibraryEntry | null> {
  return reviveEntry(await read<unknown>(BOOKS, (store) => store.get(hash)));
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
