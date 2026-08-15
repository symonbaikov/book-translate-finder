import type { PluginManifest } from '../plugin.js';
import {
  assertFetchableFeedUrl,
  type OpdsCredentials,
  type OpdsFeedPlugin,
} from './opds-client.js';

/**
 * Which OPDS catalogs the app ships, and how a reader's own catalog is described.
 *
 * **There is no denylist here any more, and its absence is deliberate.** This module used to carry
 * a copy of `packages/domain/src/policy/link-policy.ts`'s shadow-library list so a reader adding a
 * catalog could be refused in the browser. ADR-0009 moved that boundary: the link policy governs
 * what *this instance* fetches, stores and serves, and a catalog the reader points their own browser
 * at is not that. The only check left on a reader-supplied URL is whether it is a URL we can fetch
 * at all (`assertFetchableFeedUrl`), which is a transport question, not a legal one.
 *
 * `packages/domain`'s list is untouched and still governs everything the server does.
 */

function feedManifest(
  manifest: Omit<PluginManifest, 'kind'> & { kind?: 'opds-feed' },
): PluginManifest & { kind: 'opds-feed' } {
  return { ...manifest, kind: 'opds-feed' };
}

/**
 * Catalogs shipped with the app. Every entry is an unambiguously public domain source that also
 * appears on the project's download allowlist (docs/legal-policy.md I-1) — a built-in catalog whose
 * books are merely *probably* free would put the reader in exactly the position the policy exists
 * to prevent. Everything else is something the reader adds knowingly.
 *
 * **Standard Ebooks is deliberately absent**, despite being on the allowlist. Every one of its OPDS
 * endpoints answers `401` to an anonymous client — verified live against
 * `/feeds/opds`, `/feeds/opds/all`, `/feeds/opds/new-releases` and `/feeds/opds/subjects` — because
 * the feeds are a Patrons Circle benefit. Its `/feeds/atom/new-releases` is reachable but is a plain
 * news feed carrying no acquisition links at all, so shipping it would put a shelf on the page with
 * nothing on it. A reader who *is* a patron can add it themselves with their credentials, which is
 * exactly what the custom-catalog form is for.
 */
export const BUILT_IN_OPDS_FEEDS: readonly OpdsFeedPlugin[] = [
  {
    manifest: feedManifest({
      id: 'gutenberg',
      name: 'Project Gutenberg',
      accessMode: 'official-api',
      // Gutenberg does not send CORS headers, so a browser cannot read its feed directly; this one
      // is fetched by the API instead (docs/adr/0007 — the relay exists for public catalogs only).
      runtime: 'server',
      homepage: 'https://www.gutenberg.org',
    }),
    url: 'https://m.gutenberg.org/ebooks.opds/',
    // The OPDS root lives on `m.`, every link inside it points at `www.` — see `allowedOrigins`.
    allowedOrigins: ['https://m.gutenberg.org', 'https://www.gutenberg.org'],
  },
];

export interface CustomFeedInput {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly credentials?: OpdsCredentials;
}

/**
 * A catalog the reader added — typically their own Calibre-Web, Kavita, COPS or Audiobookshelf
 * instance. Declared `runtime: 'client'` because that is a hard constraint, not a preference: the
 * URL is frequently a private address our servers cannot route to, and sending it to us would
 * disclose the reader's home network for no benefit.
 */
export function createCustomFeedPlugin(input: CustomFeedInput): OpdsFeedPlugin {
  // Transport check only: an absolute http/https URL. Whether the catalog behind it is one this
  // project would have shipped is not a question asked here — see the note at the top of the file
  // and docs/adr/0009-blind-core-link-policy-scope.md.
  assertFetchableFeedUrl(input.url);
  return {
    manifest: feedManifest({
      id: input.id,
      name: input.name,
      accessMode: 'user-hosted',
      runtime: 'client',
    }),
    url: input.url,
    ...(input.credentials ? { credentials: input.credentials } : {}),
  };
}
