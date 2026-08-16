import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handBookTo, takeHandoff } from './reader-handoff';

/**
 * A window with the two carriers a book's address may travel in, and a record of what happened to
 * the URL bar. The forbidden carrier — the query string — is asserted against directly, because it
 * is the one that would reach this instance's access log (ADR-0013 §1).
 */
function installWindow(options: { readonly hash?: string; readonly refuseStorage?: boolean } = {}) {
  const entries = new Map<string, string>();
  const replaced: string[] = [];
  const storage = {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (options.refuseStorage) throw new DOMException('QuotaExceededError');
      entries.set(key, value);
    },
    removeItem: (key: string) => void entries.delete(key),
  };
  vi.stubGlobal('window', {
    sessionStorage: storage,
    location: { hash: options.hash ?? '', pathname: '/read', search: '' },
    history: { replaceState: (_state: unknown, _title: string, url: string) => replaced.push(url) },
  });
  return { entries, replaced };
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe('handBookTo', () => {
  it('stashes the address and links to a bare /read — nothing on the wire, nothing in the URL', () => {
    const { entries } = installWindow();
    expect(handBookTo('https://example.org/gatsby.epub')).toBe('/read');
    expect(entries.get('btf.reader.handoff')).toBe('https://example.org/gatsby.epub');
  });

  it('falls back to the fragment when storage is refused, and never to a query string', () => {
    installWindow({ refuseStorage: true });
    const href = handBookTo('https://example.org/gatsby.epub');

    expect(href).toBe('/read#src=https%3A%2F%2Fexample.org%2Fgatsby.epub');
    // The property that matters: a fragment is never sent to a server, a query string always is.
    expect(href).not.toContain('?');
  });
});

describe('takeHandoff', () => {
  it('reads what was stashed, once', () => {
    const { entries } = installWindow();
    entries.set('btf.reader.handoff', 'https://example.org/a.epub');

    expect(takeHandoff()).toBe('https://example.org/a.epub');
    expect(takeHandoff()).toBeNull();
  });

  it('reads a pasted fragment and erases it without adding a history entry', () => {
    const { replaced } = installWindow({ hash: '#src=https%3A%2F%2Fexample.org%2Fb.epub' });

    expect(takeHandoff()).toBe('https://example.org/b.epub');
    // `location.hash = ''` would push an entry and leave the reader one Back press from reopening.
    expect(replaced).toEqual(['/read']);
  });

  it('prefers the fragment when both are present — a pasted link is the more explicit intent', () => {
    const { entries } = installWindow({ hash: '#src=https%3A%2F%2Fexample.org%2Fpasted.epub' });
    entries.set('btf.reader.handoff', 'https://example.org/stale.epub');

    expect(takeHandoff()).toBe('https://example.org/pasted.epub');
    // …and the stale one is cleared too, rather than surfacing on the next visit.
    expect(entries.has('btf.reader.handoff')).toBe(false);
  });

  it('is null when there is nothing, including when storage throws', () => {
    installWindow();
    expect(takeHandoff()).toBeNull();
    installWindow({ refuseStorage: true, hash: '' });
    expect(takeHandoff()).toBeNull();
  });
});
