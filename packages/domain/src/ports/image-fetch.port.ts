export interface FetchedImage {
  /** The raw bytes, exactly as the source served them — never re-encoded or resized here. */
  bytes: Uint8Array;
  /** The source's own `Content-Type`, narrowed to an image type by the adapter. */
  contentType: string;
}

/**
 * Fetches one image over HTTP (docs/architecture.md §2.2 — an outbound call is always a port).
 *
 * Separate from `BookMetadataProvider` because it answers a different question: not "what does
 * this source know about the book" but "give me these bytes". The adapter is what follows
 * redirects and refuses anything that is not an image; the caller decides what may be asked for
 * (see `coverSourceUrl`).
 */
export interface ImageFetchPort {
  /** `null` when the source answered with something that is not a usable image. */
  fetchImage(url: string): Promise<FetchedImage | null>;
}
