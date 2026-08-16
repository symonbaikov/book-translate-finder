/**
 * Every way opening a book can fail, named by what the reader can do about it.
 *
 * The distinction decides the sentence on screen, which is the whole point here: a file this
 * package cannot identify wants "try a different file", a host that refused the browser wants
 * "download it and open it from your device", and a file too large for the tab wants the honest
 * number. A single `ReaderError('could not open')` would collapse three different next steps into
 * one dead end.
 */
export class ReaderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** The bytes are not a format this reader renders (ADR-0013 §8 — EPUB, FB2, MOBI/AZW3, CBZ). */
export class UnsupportedFormatError extends ReaderError {}

/**
 * The file never arrived.
 *
 * `unreachable` deliberately covers both "the network failed" and "the source refused the
 * browser": a cross-origin `fetch` that is rejected by CORS surfaces in every engine as the same
 * opaque `TypeError` as a DNS failure, and the browser tells us no more than that. Claiming CORS
 * specifically would be a guess presented as a diagnosis, and the reader's next step is the same
 * either way.
 */
export class AcquisitionError extends ReaderError {
  constructor(
    message: string,
    readonly reason: AcquisitionFailure,
    readonly status: number | null = null,
  ) {
    super(message);
  }
}

export type AcquisitionFailure =
  /** The URL is not `http`/`https`, so nothing is fetched — see `src/url.ts`. */
  | 'unsupported-scheme'
  /** Network failure or the source declining to share with this origin; indistinguishable. */
  | 'unreachable'
  /** The source answered, with a status that is not a book. */
  | 'http-error'
  /** Larger than this tab is willing to hold. The whole file lives in memory by design. */
  | 'too-large';
