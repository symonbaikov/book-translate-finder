import { addonSupports, type AddonContentType, type AddonResource } from './manifest.js';
import type { InstalledAddon } from './transport.js';

/**
 * The reader's addons, in the reader's order.
 *
 * Order is priority and belongs to the reader, exactly as in Stremio — the interface lets them drag
 * it, and this class does nothing but preserve it. Results are grouped by addon rather than merged
 * into one list, and that is not laziness: merging would mean deciding which addon is right about a
 * book when two disagree, and a core that does not look inside its addons has no basis for that
 * opinion (docs/adr/0010-addon-engine.md §7).
 */
export class AddonRegistry {
  private readonly addons: readonly InstalledAddon[];

  constructor(addons: readonly InstalledAddon[]) {
    const seen = new Set<string>();
    for (const addon of addons) {
      const { id } = addon.transport.manifest;
      if (seen.has(id)) {
        // Two addons under one id makes results depend on iteration order, and makes "remove this
        // one" ambiguous. Installing is where this gets caught; the constructor is the backstop.
        throw new Error(`Duplicate addon id: ${id}`);
      }
      seen.add(id);
    }
    this.addons = [...addons];
  }

  all(): readonly InstalledAddon[] {
    return this.addons;
  }

  get(id: string): InstalledAddon | null {
    return this.addons.find((addon) => addon.transport.manifest.id === id) ?? null;
  }

  /**
   * Enabled addons that claim to answer this, in priority order. An addon whose declared
   * `idPrefixes` cannot match is skipped here rather than asked and disbelieved — it saves a
   * request that could only have failed.
   */
  supporting(
    resource: AddonResource,
    type: AddonContentType,
    id?: string,
  ): readonly InstalledAddon[] {
    return this.addons.filter(
      (addon) => addon.enabled && addonSupports(addon.transport.manifest, resource, type, id),
    );
  }
}

/** One addon's answer, tagged with who gave it and whether it worked. */
export type AddonOutcome<T> =
  | {
      readonly addonId: string;
      readonly addonName: string;
      readonly status: 'ok';
      readonly value: T;
    }
  | {
      readonly addonId: string;
      readonly addonName: string;
      readonly status: 'failed';
      readonly reason: string;
    };

/**
 * Asks every addon at once and never rejects.
 *
 * The failure model is the point: an addon that is down, slow, or answering nonsense loses its own
 * section of the page and nothing else. This is the same shape as `settleAll` in
 * `packages/plugins`, deliberately duplicated rather than shared — both packages are leaves that
 * may depend on no workspace package, and twenty lines of `Promise.all` is a smaller cost than
 * making one of them stop being a leaf.
 *
 * The timeout lives here rather than inside each transport because bounded latency is a property of
 * the aggregate: one addon must not be able to hold the reader's page open.
 */
export async function settleAddons<T>(
  addons: readonly InstalledAddon[],
  run: (addon: InstalledAddon) => Promise<T>,
  options: { timeoutMs?: number } = {},
): Promise<AddonOutcome<T>[]> {
  const { timeoutMs } = options;
  return Promise.all(
    addons.map(async (addon): Promise<AddonOutcome<T>> => {
      const { id: addonId, name: addonName } = addon.transport.manifest;
      try {
        const value =
          timeoutMs === undefined ? await run(addon) : await withTimeout(run(addon), timeoutMs);
        return { addonId, addonName, status: 'ok', value };
      } catch (error) {
        return { addonId, addonName, status: 'failed', reason: describeError(error) };
      }
    }),
  );
}

export function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Races a promise against a timer. The work is not cancelled — the `AbortSignal` belongs to
 * whoever owns the transport — but the caller stops waiting, which is what bounds the page.
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
