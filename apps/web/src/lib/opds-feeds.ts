'use client';

import { assertFetchableFeedUrl } from '@golden/plugins';
import {
  addAddon,
  listAddons,
  removeAddon,
  toOpdsAddon,
  type StoredAddon,
} from './installed-addons';

/**
 * The reader's own OPDS catalogs — now a view over the one addon list rather than a list of its own.
 *
 * **Why not on the server.** Unchanged from Phase 5 and still the reason any of this exists: a
 * Calibre-Web on `192.168.1.10:8083` is not reachable from this instance, and its URL — often with a
 * username and password — describes the reader's home network. Storing that server-side would mean
 * this site holding a credential it can never use (docs/adr/0007).
 *
 * **Why it is no longer its own list.** A catalog the reader added *is* an addon by every definition
 * in [ADR-0010](../../../docs/adr/0010-addon-engine.md): chosen by them, fetched by their browser,
 * never seen by this instance. Two lists meant two places to remove one from, and a `/addons` page
 * that could not show half of what the reader had added. So a feed is stored as an addon with a
 * `builtin: 'opds'` descriptor, `installed-addons.ts` migrates the old key on first read, and this
 * module is the shelf's window onto the subset it cares about.
 *
 * **Passwords in localStorage.** Also unchanged, and still stated plainly in the UI rather than
 * hidden. The realistic threat here is not "someone reads localStorage on the reader's own machine",
 * it is "the credential is sent to a third party", which this design rules out entirely.
 */

export interface StoredFeed {
  /** The addon id — `opds.<something>`. Also the React key and the removal handle. */
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly username?: string;
  readonly password?: string;
}

function isOpdsAddon(addon: StoredAddon): boolean {
  return addon.descriptor.kind === 'builtin' && addon.descriptor.builtin === 'opds';
}

function toFeed(addon: StoredAddon): StoredFeed | null {
  if (addon.descriptor.kind !== 'builtin') return null;
  const { config } = addon.descriptor;
  const url = config['url'];
  if (!url) return null;
  return {
    id: addon.id,
    name: addon.name,
    url,
    ...(config['username'] ? { username: config['username'] } : {}),
    ...(config['password'] ? { password: config['password'] } : {}),
  };
}

export function listFeeds(): StoredFeed[] {
  return listAddons()
    .filter(isOpdsAddon)
    .map(toFeed)
    .filter((feed): feed is StoredFeed => feed !== null);
}

export class DuplicateFeedError extends Error {
  constructor(readonly url: string) {
    super(`This catalog is already on your shelf: ${url}`);
    this.name = 'DuplicateFeedError';
  }
}

/**
 * Adds a catalog after the one check that is left: `assertFetchableFeedUrl` — an absolute
 * `http`/`https` address the browser can actually request. What lives at that address is not
 * inspected. The shadow-library refusal that used to sit here was removed with ADR-0009: this URL
 * never reaches the server, the reader typed it themselves, and a fourteen-domain list in the
 * browser was a gesture rather than a boundary. `packages/domain`'s policy is unchanged and still
 * governs every link the instance itself produces.
 */
export function addFeed(input: {
  name: string;
  url: string;
  username?: string;
  password?: string;
}): { feed: StoredFeed; persisted: boolean } {
  const url = assertFetchableFeedUrl(input.url).toString();
  if (listFeeds().some((feed) => feed.url === url)) throw new DuplicateFeedError(url);

  const addon = toOpdsAddon({
    // `crypto.randomUUID` needs a secure context; a counter-and-timestamp id is fine for a
    // browser-local list and works on plain http, which is exactly where a home server lives.
    id: `feed-${Date.now().toString(36)}-${listFeeds().length}`,
    name: input.name.trim() || url,
    url,
    ...(input.username ? { username: input.username } : {}),
    ...(input.password ? { password: input.password } : {}),
  });

  // `persisted` travels with the feed because the shelf works either way — the catalog is
  // browsable right now — but only a stored one is still there tomorrow, and the reader is told
  // which of the two they got.
  const { persisted } = addAddon(addon);
  const feed = toFeed(addon);
  if (!feed) throw new Error('This catalog could not be stored.');
  return { feed, persisted };
}

export function removeFeed(id: string): boolean {
  return removeAddon(id);
}
