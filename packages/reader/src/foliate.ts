/**
 * The one door to the vendored renderer.
 *
 * `vendor/foliate` is somebody else's untyped JavaScript and is not part of this package's TypeScript
 * program (see tsconfig.json). Nothing outside this file may reach into it — `pnpm boundaries`
 * refuses the import, and the reason is not tidiness: the vendored tree carries a patch this project
 * depends on for its safety (ADR-0013 §3), and a second import path is a second place where somebody
 * can pick up an unpatched copy or a differently-configured view.
 *
 * What crosses this door is the narrow surface below — the parts of `foliate-view` this application
 * actually uses, typed by hand. When the reader needs more of foliate, it is added here, deliberately,
 * rather than by widening an `any`.
 */

/** Where the reader is, as `foliate-view` reports it on every `relocate`. */
export interface FoliateRelocateDetail {
  readonly fraction?: number;
  readonly cfi?: string;
  readonly location?: { readonly current?: number; readonly total?: number };
}

export interface FoliateBookMetadata {
  readonly title?: string | Record<string, string>;
  readonly language?: string | readonly string[];
}

/**
 * The custom element, once `loadFoliate()` has defined it.
 *
 * `open` accepts anything with `arrayBuffer()`, which is how a `File` and a `Blob` both work; this
 * package hands it a `Blob` built from bytes that never left the tab.
 */
export interface FoliateView extends HTMLElement {
  open(book: Blob | File): Promise<void>;
  next(): Promise<void>;
  prev(): Promise<void>;
  goTo(target: string | number): Promise<void>;
  readonly book?: { metadata?: FoliateBookMetadata; sections?: readonly unknown[] };
}

let loading: Promise<void> | undefined;

/**
 * Define `<foliate-view>`, once per document.
 *
 * Deliberately lazy: the renderer and its zip implementation are the largest thing this application
 * loads, and a reader who never opens a book should never pay for it. The promise is cached because
 * two panels mounting at once must not import it twice.
 */
export function loadFoliate(): Promise<void> {
  loading ??= (async () => {
    // @ts-expect-error — the vendored renderer ships no type declarations; this module is the typed
    // surface over it, which is exactly why the import is confined to this file.
    await import('../vendor/foliate/view.js');
  })();
  return loading;
}

/** Reset for tests. Not exported from the package: production code has one document. */
export function resetFoliateForTests(): void {
  loading = undefined;
}

/** foliate's metadata titles are either a string or a language map; readers want one line. */
export function titleOf(metadata: FoliateBookMetadata | undefined): string | null {
  const title = metadata?.title;
  if (typeof title === 'string') return title.trim() || null;
  if (title && typeof title === 'object') {
    const first = Object.values(title).find((value) => typeof value === 'string' && value.trim());
    return first?.trim() ?? null;
  }
  return null;
}
