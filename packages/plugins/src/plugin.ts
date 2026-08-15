/**
 * The plugin contract shared by every external integration in the project.
 *
 * **Why this lives in its own package.** The core of the application — UI, local database, book
 * matching, result normalization — must not break when an external service changes. Isolating
 * integrations behind a manifest plus a narrow capability interface makes that structural rather
 * than aspirational: a plugin that starts throwing takes down its own result row and nothing else
 * (see `settleAll` below and `AggregateEditionPrices` in packages/application).
 *
 * **Why it is environment-agnostic.** Some plugins can only run on the reader's device — an OPDS
 * feed served by their own Calibre box on `192.168.x.x` is unreachable from our servers by
 * definition, and geolocation must never leave the browser (docs/adr/0007). Others only make sense
 * server-side, where API keys live. Keeping the contract in a leaf package with no project
 * dependencies lets the same module be imported by `apps/web` (browser) and by
 * `packages/infrastructure` (Node) without either learning about the other.
 */

/** What a plugin integrates with. One plugin does one of these; a plugin doing two gets split. */
export type PluginKind =
  /** A source of catalog entries and acquisition links (OPDS feeds). */
  | 'opds-feed'
  /** Answers "which physical shops near this point" (Module B). */
  | 'geo-store'
  /** Answers "what does this edition cost and where" (Module C). */
  | 'price'
  /** Builds a deterministic search link for one edition from a reader-authored URL template. */
  | 'url-source';

/**
 * How a plugin gets its data. This is a legal boundary, not a technical detail — the project's
 * hard invariant (CLAUDE.md, docs/legal-policy.md I-3) forbids scraping a site's HTML instead of
 * using its published interface, so there is deliberately **no** `html-scrape` member here and a
 * plugin cannot declare one.
 */
export type PluginAccessMode =
  /** The provider's own documented API (Google Books, Overpass, an OPDS endpoint). */
  | 'official-api'
  /** A deterministic URL built from an identifier; the target is never fetched by us. */
  | 'url-template'
  /** A server the reader themselves runs and points us at (Calibre, Kavita, Audiobookshelf). */
  | 'user-hosted';

/** Where a plugin is allowed to execute. */
export type PluginRuntime =
  /** Only on the reader's device — reaches private networks and/or handles location data. */
  | 'client'
  /** Only in the API/worker process — needs a secret key or a server-side cache. */
  | 'server'
  /** Either; the implementation takes its `fetch` by injection and assumes nothing else. */
  | 'both';

export interface PluginManifest {
  /** Stable slug. Doubles as the `provider` on any link the plugin produces. */
  readonly id: string;
  /** Shown to the reader wherever this plugin's results appear. */
  readonly name: string;
  readonly kind: PluginKind;
  readonly accessMode: PluginAccessMode;
  readonly runtime: PluginRuntime;
  /** Homepage or API documentation — so a reader can check who they are talking to. */
  readonly homepage?: string;
  /**
   * ISO 3166-1 alpha-2 codes this plugin is useful in, or `undefined` for "everywhere". Lets the
   * core skip plugins that cannot answer for a reader's region instead of paying their latency.
   */
  readonly countries?: readonly string[];
}

/** Every plugin exposes its manifest; the capability interfaces extend this. */
export interface Plugin {
  readonly manifest: PluginManifest;
}

/**
 * A typed, immutable registry of plugins of one kind.
 *
 * The core resolves plugins through this rather than through `switch (source)` — adding an
 * integration is a registration in the composition root, never an edit to a use case
 * (docs/rules.md §1, Open/Closed).
 */
export class PluginRegistry<T extends Plugin> {
  private readonly byId: ReadonlyMap<string, T>;

  constructor(plugins: readonly T[]) {
    const map = new Map<string, T>();
    for (const plugin of plugins) {
      const { id } = plugin.manifest;
      if (map.has(id)) {
        // Two plugins under one id would make results non-deterministic depending on
        // registration order — a class of bug that is miserable to find later.
        throw new Error(`Duplicate plugin id in registry: ${id}`);
      }
      map.set(id, plugin);
    }
    this.byId = map;
  }

  get(id: string): T | null {
    return this.byId.get(id) ?? null;
  }

  all(): readonly T[] {
    return [...this.byId.values()];
  }

  /**
   * Plugins that can run in `runtime` and are relevant to `country` (a plugin with no declared
   * countries is relevant everywhere). `runtime: 'both'` plugins match either side.
   */
  select(options: { runtime?: PluginRuntime; country?: string | null } = {}): readonly T[] {
    const country = options.country?.trim().toUpperCase() || null;
    return this.all().filter((plugin) => {
      const { runtime, countries } = plugin.manifest;
      if (options.runtime && runtime !== 'both' && runtime !== options.runtime) return false;
      if (countries && country && !countries.includes(country)) return false;
      return true;
    });
  }

  manifests(): readonly PluginManifest[] {
    return this.all().map((plugin) => plugin.manifest);
  }
}

/** One plugin's answer, tagged with which plugin produced it and whether it worked. */
export type PluginOutcome<T> =
  | { readonly pluginId: string; readonly status: 'ok'; readonly value: T }
  | { readonly pluginId: string; readonly status: 'failed'; readonly reason: string };

/**
 * Runs every plugin concurrently and never rejects: one integration being down degrades its own
 * row to `failed` and leaves the rest of the answer intact (docs/rules.md §3, "one failing source
 * does not break the response").
 *
 * `timeoutMs` is enforced here rather than left to each plugin because the whole point of the
 * aggregate is bounded latency — a plugin that hangs must not hold the reader's page.
 */
export async function settleAll<P extends Plugin, T>(
  plugins: readonly P[],
  run: (plugin: P) => Promise<T>,
  options: { timeoutMs?: number } = {},
): Promise<PluginOutcome<T>[]> {
  const { timeoutMs } = options;
  return Promise.all(
    plugins.map(async (plugin): Promise<PluginOutcome<T>> => {
      const pluginId = plugin.manifest.id;
      try {
        const value =
          timeoutMs === undefined ? await run(plugin) : await withTimeout(run(plugin), timeoutMs);
        return { pluginId, status: 'ok', value };
      } catch (error) {
        return { pluginId, status: 'failed', reason: describeError(error) };
      }
    }),
  );
}

export function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/**
 * Races a promise against a timer. The underlying work is not cancelled — `AbortSignal` belongs
 * to whoever owns the transport — but the caller stops waiting, which is what bounds page latency.
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
