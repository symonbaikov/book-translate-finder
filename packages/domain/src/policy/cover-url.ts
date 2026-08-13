/**
 * A cover image URL derived from an ISBN, used when a source gave us no cover of its own.
 *
 * Open Library's cover service resolves any ISBN — `covers.openlibrary.org/b/isbn/{isbn}-L.jpg`
 * — independently of whether the *edition record* happens to carry a `covers` array. Verified
 * live: of three ISBNs from editions whose records had no cover, two returned real images.
 *
 * `default=false` makes a miss a 404 instead of Open Library's grey "no cover" placeholder,
 * so the UI can fall back to its own placeholder rather than showing an empty box.
 *
 * Same shape of decision as `bookstore-catalog.ts`: a deterministic URL template, no network
 * call from us, and derived at read time rather than stored — which is what lets it fix rows
 * that were synced before covers existed at all, with no re-sync.
 */
export function coverUrlFromIsbn(isbn: string | null | undefined): string | null {
  const trimmed = isbn?.trim();
  if (!trimmed) return null;
  return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(trimmed)}-L.jpg?default=false`;
}
