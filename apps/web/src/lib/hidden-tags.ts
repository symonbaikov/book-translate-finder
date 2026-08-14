'use client';

/**
 * Genres the reader has chosen not to see, kept in their own browser.
 *
 * Two deliberate properties, both load-bearing:
 *
 * - **It ships empty.** There is no built-in list of what to hide. A default would be this
 *   project deciding for every reader and every self-hosted instance which subjects are
 *   undesirable, which is not a decision a book index gets to make on someone's behalf.
 * - **It is per reader, not per instance.** The list lives in `localStorage` alongside the
 *   reading history, so one person's choice shapes one person's home page and nobody else's.
 *
 * Same privacy shape as `reading-history.ts`: the server is never told what anyone hides. It is
 * simply asked about fewer genres (docs/adr/0006-local-recommendations.md).
 */
const STORAGE_KEY = 'btf.hidden-tags';

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]).map((t) => String(t).toLowerCase()) : [];
  } catch {
    return [];
  }
}

function write(tags: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(tags)].sort()));
  } catch {
    /* private mode or blocked storage — hiding simply does not persist */
  }
}

export function readHiddenTags(): string[] {
  return read();
}

export function hideTag(tag: string): void {
  const normalized = tag.trim().toLowerCase();
  if (!normalized) return;
  write([...read(), normalized]);
}

export function unhideTag(tag: string): void {
  const normalized = tag.trim().toLowerCase();
  write(read().filter((t) => t !== normalized));
}

export function isHidden(tag: string, hidden: readonly string[] = read()): boolean {
  return hidden.includes(tag.trim().toLowerCase());
}
