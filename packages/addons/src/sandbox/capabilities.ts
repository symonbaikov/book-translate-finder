import { AddonError } from '../errors.js';
import type { FetchLike } from '../transport.js';
import { mediatedFetch, type AddonRequestInit } from './host-fetch.js';
import type { Capability } from './protocol.js';

/**
 * What happens when an addon asks for something.
 *
 * Every capability is dispatched here, in the host page, from a name and an array of plain values.
 * Two consequences worth being explicit about: an addon cannot reach a capability that is not in
 * this switch, and it cannot reach one with arguments this function did not accept. There is no
 * object handed across the boundary that it could reach through.
 */

export interface AddonStorage {
  /** Whatever this addon stored under `key`, or `null`. Never another addon's, never the reader's. */
  get(key: string): Promise<unknown>;
  /** `false` when the browser refused to keep it — private mode, quota, storage switched off. */
  set(key: string, value: unknown): Promise<boolean>;
}

export interface CapabilityContext {
  readonly addonId: string;
  readonly allowedHosts: readonly string[];
  readonly fetchImpl: FetchLike;
  readonly timeoutMs: number;
  readonly maxChars: number;
  readonly storage: AddonStorage;
  /**
   * XML → a plain object. Injected rather than bundled: in the browser this is `DOMParser`, which
   * is already there, and shipping a second parser to every reader to save an addon author from
   * shipping one is the wrong trade.
   */
  readonly parseXml: (text: string) => unknown;
  /** Goes to this addon's own panel. Not the host console, where it would look like ours. */
  readonly onLog: (level: string, message: string) => void;
}

export async function runCapability(
  name: Capability,
  args: readonly unknown[],
  context: CapabilityContext,
): Promise<unknown> {
  switch (name) {
    case 'fetchText':
      return mediatedFetch(str(args[0], 'url'), init(args[1]), context);

    case 'fetchJson': {
      const text = await mediatedFetch(str(args[0], 'url'), init(args[1]), context);
      try {
        return JSON.parse(text) as unknown;
      } catch {
        throw new AddonError('That address did not answer with JSON.');
      }
    }

    case 'parseXml':
      return context.parseXml(str(args[0], 'text'));

    case 'storageGet':
      return context.storage.get(str(args[0], 'key'));

    case 'storageSet':
      return context.storage.set(str(args[0], 'key'), args[1]);

    case 'log':
      context.onLog(str(args[0], 'level'), str(args[1], 'message'));
      return null;
  }
}

function str(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new AddonError(`This addon passed a ${typeof value} where ${field} had to be a string.`);
  }
  return value;
}

function init(value: unknown): AddonRequestInit | null {
  return value === null || value === undefined ? null : (value as AddonRequestInit);
}

/**
 * Storage backed by an object, for tests and for a reader whose browser refuses to keep anything.
 * Nothing here holds a preference in memory as a substitute for storing it — `set` reports honestly
 * whether the value landed, and the caller decides what to say about that.
 */
export function memoryStorage(): AddonStorage {
  const entries = new Map<string, unknown>();
  return {
    get: async (key) => entries.get(key) ?? null,
    set: async (key, value) => {
      entries.set(key, value);
      return true;
    },
  };
}
