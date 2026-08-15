'use client';

import {
  AddonRegistry,
  installHttpAddon,
  startLocalAddon,
  type AddonManifest,
  type InstalledAddon,
} from '@golden/addons';
import { addonStateStore, listAddons, type StoredAddon } from './installed-addons';
import { OpdsAddonTransport } from './opds-addon';

/**
 * Turning the stored list into something that can be asked questions.
 *
 * Two transports, one interface (docs/adr/0010-addon-engine.md §2). An HTTP addon is "installed" by
 * re-reading its manifest — there is nothing else to load, and reading it again is how a version
 * change is noticed at all. A local addon means fetching its bundle, checking it against the hash
 * the reader approved, and starting a sandbox for it.
 *
 * Everything here happens in the reader's browser. Nothing in this module may be imported from a
 * server component, and the boundary rules make sure of it rather than trusting the `'use client'`
 * at the top.
 */

/** Where the sandbox document is served from. Must stay in step with `apps/web/public`. */
const SANDBOX_URL = '/addon-sandbox.html';

/** A bundle bigger than this is not an addon, it is a mistake. */
const MAX_BUNDLE_CHARS = 2 * 1024 * 1024;

export interface AddonLoadFailure {
  readonly id: string;
  readonly name: string;
  readonly reason: string;
}

export interface LoadedAddons {
  readonly registry: AddonRegistry;
  /** Addons that would not start. Shown on the page, not swallowed — a silent absence is worse. */
  readonly failures: readonly AddonLoadFailure[];
}

/**
 * Starts every stored addon, in the reader's order, and reports the ones that would not start.
 *
 * Failures are collected rather than thrown for the same reason `settleAddons` exists: one addon
 * whose author let their certificate lapse must not take the other four off the page with it.
 */
export async function loadAddons(
  stored: readonly StoredAddon[] = listAddons(),
): Promise<LoadedAddons> {
  const started: InstalledAddon[] = [];
  const failures: AddonLoadFailure[] = [];

  const outcomes = await Promise.all(
    stored.map(async (addon) => {
      try {
        return { addon, transport: await startTransport(addon) };
      } catch (error) {
        return {
          addon,
          reason: error instanceof Error ? error.message : String(error),
        };
      }
    }),
  );

  for (const outcome of outcomes) {
    if ('transport' in outcome) {
      started.push({
        descriptor: outcome.addon.descriptor,
        transport: outcome.transport,
        enabled: outcome.addon.enabled,
      });
    } else {
      failures.push({ id: outcome.addon.id, name: outcome.addon.name, reason: outcome.reason });
    }
  }

  return { registry: new AddonRegistry(started), failures };
}

async function startTransport(addon: StoredAddon): Promise<InstalledAddon['transport']> {
  if (addon.descriptor.kind === 'http') {
    return installHttpAddon(addon.descriptor.manifestUrl);
  }

  if (addon.descriptor.kind === 'builtin') {
    const { builtin, config } = addon.descriptor;
    if (builtin !== 'opds') {
      throw new Error(
        `This version of Golden Library has no built-in transport called ${builtin}.`,
      );
    }
    const url = config['url'];
    if (!url) throw new Error('This catalog has no address stored for it.');
    return new OpdsAddonTransport({
      id: addon.id.replace(/^opds\./, ''),
      name: addon.name,
      url,
      ...(config['username'] ? { username: config['username'] } : {}),
      ...(config['password'] ? { password: config['password'] } : {}),
    });
  }

  const source = await fetchBundle(addon.descriptor.bundleUrl);
  return startLocalAddon(source, addon.descriptor.integrity, {
    sandboxUrl: SANDBOX_URL,
    storage: addonStateStore(addon.id),
  });
}

/**
 * Reads a local addon's bundle. Deliberately does **not** send credentials: the bundle is public
 * code, and an addon host that wants a cookie to hand it over is asking for something a reader
 * cannot audit.
 */
export async function fetchBundle(url: string): Promise<string> {
  const response = await fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer' });
  if (!response.ok) {
    throw new Error(`The addon’s code could not be downloaded (${response.status}).`);
  }
  const source = await response.text();
  if (source.length > MAX_BUNDLE_CHARS) {
    throw new Error('That file is too large to be an addon.');
  }
  return source;
}

/**
 * What the reader is agreeing to when they install something.
 *
 * Assembled here rather than in the component so the consent screen and the stored record cannot
 * disagree about it: whatever this returns is both what is shown and what is written down.
 */
export interface AddonConsent {
  readonly manifest: AddonManifest;
  /** Hosts this addon will contact. For an HTTP addon that is its own origin, and only that. */
  readonly hosts: readonly string[];
  /** True when the addon will see the reader's IP and queries — the price of the HTTP transport. */
  readonly seesTheReader: boolean;
  readonly configureUrl: string | null;
}

/**
 * Reads a local addon's manifest by actually starting it, then shuts it down again.
 *
 * There is no other way to ask: a local addon's manifest is whatever its code passes to
 * `registerAddon`, so the only way to learn what it claims is to run it. Which is exactly why it is
 * run in the sandbox first and asked afterwards — the reader has not agreed to anything yet, and at
 * this point the code has no network of its own and no host it is permitted to reach.
 *
 * The bundle is hashed against `integrity` before a line of it executes (`startLocalAddon`), so a
 * file that does not match what the author published never runs at all, not even to be inspected.
 */
export async function previewLocalAddon(
  bundleUrl: string,
  integrity: string,
): Promise<AddonConsent> {
  const source = await fetchBundle(bundleUrl);
  const addon = await startLocalAddon(source, integrity, { sandboxUrl: SANDBOX_URL });
  try {
    return consentFor(addon.manifest, bundleUrl, 'local');
  } finally {
    // Whatever happens next — installed, cancelled, or a manifest we could not read — this
    // particular instance has done its job. The surfaces start their own when they need one.
    addon.destroy('Finished reading this addon’s manifest.');
  }
}

export function consentFor(
  manifest: AddonManifest,
  url: string,
  kind: 'http' | 'local',
): AddonConsent {
  if (kind === 'http') {
    const origin = new URL(url).origin;
    return {
      manifest,
      hosts: [new URL(url).hostname],
      // Its own server answers every request the reader makes through it, so it necessarily sees
      // them. Sandboxing cannot change that, and the install screen must not imply otherwise.
      seesTheReader: true,
      configureUrl: manifest.behaviorHints?.configurable ? `${origin}/configure` : null,
    };
  }
  return {
    manifest,
    hosts: manifest.permissions?.hosts ?? [],
    seesTheReader: false,
    configureUrl: null,
  };
}
