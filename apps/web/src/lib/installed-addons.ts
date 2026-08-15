'use client';

import type { AddonDescriptor } from '@golden/addons';

/**
 * The reader's addons, kept in their browser and nowhere else.
 *
 * This list never reaches the server, and no route exists that would take it — that is the whole
 * of "zero knowledge" (docs/adr/0010-addon-engine.md §6), and `pnpm boundaries` keeps it true by
 * refusing to let `apps/api` or `packages/infrastructure` so much as import `@golden/addons`.
 *
 * The shape mirrors `lib/opds-feeds.ts`, including the part that looks like a wart: every write
 * returns whether it actually landed. A browser in private mode, with storage switched off, or over
 * quota accepts the call and keeps nothing, and nothing in this app holds a preference in memory as
 * a fallback. So "the reader clicked" and "the addon is installed" are two different facts, and the
 * popup has to be able to tell them apart (CLAUDE.md, settings popups).
 *
 * Order is priority, as in Stremio. It is the array's order and nothing else — no score, no
 * timestamp — because the reader arranged it and re-deriving it would mean overruling them.
 */

const STORAGE_KEY = 'btf.addons';

export interface StoredAddon {
  /** The manifest id. Also the React key, the removal handle, and the storage namespace. */
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly descriptor: AddonDescriptor;
  /**
   * The hosts the reader saw and accepted at install time — not necessarily what the manifest says
   * today. If a new version of a local addon wants more, that is a new consent, not an upgrade.
   */
  readonly hosts: readonly string[];
  /** Off keeps the addon and its configuration while excluding it from every result. */
  readonly enabled: boolean;
}

function read(): StoredAddon[] {
  if (typeof window === 'undefined') return [];
  let current: StoredAddon[];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    current = Array.isArray(parsed) ? (parsed as StoredAddon[]) : [];
  } catch {
    // Private mode, disabled storage, or a hand-edited value. No addons is a valid state, and a
    // reader whose storage is broken should see an empty list rather than a stack trace.
    return [];
  }
  return migrateLegacyFeeds(current) ?? current;
}

/**
 * The OPDS catalogs a reader added before Phase 7.8, when they lived in a list of their own.
 *
 * They are the same thing an addon is — something the reader added, fetched from their browser, kept
 * out of the server's sight — and having two lists meant two places to remove one from and two
 * things the `/addons` page could not show. So the old list becomes addon entries the first time
 * anything reads the new one, and is then deleted.
 *
 * If the write is refused the old key is left exactly where it is and the migration is retried on
 * the next read. Losing a reader's shelf to a full quota would be a poor trade for a tidier schema.
 */
const LEGACY_FEEDS_KEY = 'btf.opds-feeds';

interface LegacyFeed {
  readonly id?: string;
  readonly name?: string;
  readonly url?: string;
  readonly username?: string;
  readonly password?: string;
}

function migrateLegacyFeeds(current: StoredAddon[]): StoredAddon[] | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(LEGACY_FEEDS_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let legacy: LegacyFeed[] = [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) legacy = parsed as LegacyFeed[];
  } catch {
    legacy = [];
  }

  const known = new Set(current.map((addon) => addon.id));
  const converted = legacy
    .filter((feed): feed is LegacyFeed & { url: string } => typeof feed.url === 'string')
    .map((feed) => toOpdsAddon(feed))
    .filter((addon) => !known.has(addon.id));

  const next = [...current, ...converted];
  if (!write(next)) return null;
  try {
    window.localStorage.removeItem(LEGACY_FEEDS_KEY);
  } catch {
    // The new list is already written, and a second run would find nothing new to add.
  }
  return next;
}

export function toOpdsAddon(feed: LegacyFeed & { url: string }): StoredAddon {
  return {
    id: `opds.${feed.id ?? `feed-${feed.url.length.toString(36)}`}`,
    name: feed.name?.trim() || feed.url,
    version: '1',
    descriptor: {
      kind: 'builtin',
      builtin: 'opds',
      config: {
        url: feed.url,
        ...(feed.username ? { username: feed.username } : {}),
        ...(feed.password ? { password: feed.password } : {}),
      },
    },
    hosts: [hostnameOf(feed.url)],
    enabled: true,
  };
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function write(addons: readonly StoredAddon[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(addons));
    return true;
  } catch {
    return false; // see read()
  }
}

export function listAddons(): StoredAddon[] {
  return read();
}

export class DuplicateAddonError extends Error {
  constructor(readonly name: string) {
    super(`${name} is already installed.`);
    this.name = 'DuplicateAddonError';
  }
}

/** Appends an addon at the end — last in priority, which is the safe place for a new stranger. */
export function addAddon(addon: StoredAddon): { persisted: boolean } {
  const existing = read();
  if (existing.some((candidate) => candidate.id === addon.id)) {
    throw new DuplicateAddonError(addon.name);
  }
  return { persisted: write([...existing, addon]) };
}

export function removeAddon(id: string): boolean {
  const persisted = write(read().filter((addon) => addon.id !== id));
  // The addon's own key/value state goes with it. Leaving it behind would mean a reader who
  // removed an addon and installed it again silently inherits what the old one knew about them.
  forgetAddonState(id);
  return persisted;
}

export function setAddonEnabled(id: string, enabled: boolean): boolean {
  return write(read().map((addon) => (addon.id === id ? { ...addon, enabled } : addon)));
}

/**
 * Moves an addon one place up or down the priority order. Returns `null` when it is already at the
 * end it was asked to move towards — the caller shows nothing rather than a popup saying nothing
 * happened.
 */
export function moveAddon(id: string, direction: -1 | 1): { persisted: boolean } | null {
  const addons = read();
  const from = addons.findIndex((addon) => addon.id === id);
  if (from < 0) return null;
  const to = from + direction;
  if (to < 0 || to >= addons.length) return null;
  const reordered = [...addons];
  const [moved] = reordered.splice(from, 1);
  if (!moved) return null;
  reordered.splice(to, 0, moved);
  return { persisted: write(reordered) };
}

// -----------------------------------------------------------------------------------------------
// Per-addon state
// -----------------------------------------------------------------------------------------------

/**
 * The `golden.storage` capability, namespaced per addon.
 *
 * One key per addon, so one addon cannot read another's, and neither can read anything of the
 * reader's. It is `localStorage` rather than memory because an addon that forgets its cursor on
 * every reload is an addon that re-downloads everything, but it is small and quota-bounded: the
 * value must survive `JSON.stringify` and stay under the ceiling below.
 */
const STATE_PREFIX = 'btf.addon-state.';
const MAX_STATE_CHARS = 64 * 1024;

export function addonStateStore(id: string) {
  const key = `${STATE_PREFIX}${id}`;
  return {
    async get(field: string): Promise<unknown> {
      if (typeof window === 'undefined') return null;
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        return parsed[field] ?? null;
      } catch {
        return null;
      }
    },
    async set(field: string, value: unknown): Promise<boolean> {
      if (typeof window === 'undefined') return false;
      try {
        const raw = window.localStorage.getItem(key);
        const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
        parsed[field] = value;
        const serialized = JSON.stringify(parsed);
        if (serialized.length > MAX_STATE_CHARS) return false;
        window.localStorage.setItem(key, serialized);
        return true;
      } catch {
        return false;
      }
    },
  };
}

function forgetAddonState(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(`${STATE_PREFIX}${id}`);
  } catch {
    // Nothing to do: the addon is gone from the list either way.
  }
}
