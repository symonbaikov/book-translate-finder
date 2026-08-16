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

/**
 * How each format must be spelled for the renderer's own dispatch.
 *
 * `makeBook` re-detects the format from the `name` and `type` of what it is handed — a ZIP is an
 * EPUB, a comic or a compressed FB2 depending on those two fields alone. So we hand it the answer
 * *we* reached by reading the bytes (`sniffFormat`), rather than passing the reader's filename
 * through and letting two detectors disagree. A MOBI named `.epub` then opens as a MOBI, which is
 * the whole reason our sniffing believes bytes over names.
 */
const FOLIATE_NAMING: Record<string, { extension: string; type: string }> = {
  epub: { extension: '.epub', type: 'application/epub+zip' },
  fb2: { extension: '.fb2', type: 'application/x-fictionbook+xml' },
  fbz: { extension: '.fb2.zip', type: 'application/x-zip-compressed-fb2' },
  mobi: { extension: '.mobi', type: 'application/x-mobipocket-ebook' },
  cbz: { extension: '.cbz', type: 'application/vnd.comicbook+zip' },
};

/**
 * The book as the renderer wants it: a `File`, named for the format the bytes actually are.
 *
 * A bare `Blob` is not enough — `makeBook` reads `name` and would throw on its absence, which is a
 * confusing way to learn that a `Blob` is not a `File`.
 */
export function asFoliateFile(book: { bytes: ArrayBuffer; format: string }): File {
  const naming = FOLIATE_NAMING[book.format] ?? { extension: '', type: 'application/octet-stream' };
  return new File([book.bytes], `book${naming.extension}`, { type: naming.type });
}

/**
 * Paint the opening page.
 *
 * `open()` prepares the book and renders nothing — upstream's own reader calls `renderer.next()`
 * afterwards, and without an equivalent the view sits there, correctly loaded and entirely blank.
 * That is a confusing failure to read backwards from, so it is a named function rather than a line
 * in a component.
 *
 * When stored positions arrive (11.5) this is where resuming happens: the saved locator if there is
 * one, the first page if there is not.
 */
export async function renderFirstPage(view: FoliateView): Promise<void> {
  await view.goTo(0);
}
