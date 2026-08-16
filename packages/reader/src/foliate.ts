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

import { filenameForFormat, isSupportedFormat } from './format.js';

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
const FOLIATE_MEDIA_TYPES: Record<string, string> = {
  epub: 'application/epub+zip',
  fb2: 'application/x-fictionbook+xml',
  fbz: 'application/x-zip-compressed-fb2',
  mobi: 'application/x-mobipocket-ebook',
  cbz: 'application/vnd.comicbook+zip',
};

/**
 * The book as the renderer wants it: a `File`, named for the format the bytes actually are.
 *
 * A bare `Blob` is not enough — `makeBook` reads `name` and would throw on its absence, which is a
 * confusing way to learn that a `Blob` is not a `File`.
 */
export function asFoliateFile(book: { bytes: ArrayBuffer; format: string }): File {
  const name = isSupportedFormat(book.format) ? filenameForFormat(book.format) : 'book';
  return new File([book.bytes], name, {
    type: FOLIATE_MEDIA_TYPES[book.format] ?? 'application/octet-stream',
  });
}

/**
 * Paint the first page the reader should see — where they left off, or the beginning.
 *
 * `open()` prepares the book and renders nothing: upstream's own reader calls `renderer.next()`
 * afterwards, and without an equivalent the view sits there, correctly loaded and entirely blank.
 * That is a confusing failure to read backwards from, so it is a named function rather than a line
 * in a component.
 *
 * A stored locator is tried and **not trusted**. A CFI is a path into a document, and the file
 * behind a hash cannot change — but a locator written by an older version of the renderer, or by a
 * format whose loader has since changed, can still fail to resolve. Landing on page one is a small
 * disappointment; an exception here would mean the book does not open at all.
 */
export async function renderFirstPage(view: FoliateView, resumeAt?: string | null): Promise<void> {
  if (resumeAt) {
    try {
      await view.goTo(resumeAt);
      return;
    } catch {
      // Fall through to the beginning, which is always resolvable.
    }
  }
  await view.goTo(0);
}
