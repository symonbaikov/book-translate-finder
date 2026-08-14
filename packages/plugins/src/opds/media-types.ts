/**
 * MIME type → what the reader actually gets, so the UI can offer "EPUB" and "PDF" buttons instead
 * of a wall of identical "Download" links. OPDS carries the media type on every acquisition link
 * (OPDS 1.2 §2.4, OPDS 2.0 `links[].type`) and it is the only reliable format signal in the
 * standard — file extensions in `href` are optional and frequently absent on generated URLs.
 */

export type BookFileFormat =
  | 'epub'
  | 'pdf'
  | 'fb2'
  | 'mobi'
  | 'azw3'
  | 'djvu'
  | 'cbz'
  | 'cbr'
  | 'txt'
  | 'html'
  | 'rtf'
  | 'audio'
  | 'audiobook-manifest'
  | 'drm-license';

export interface MediaTypeInfo {
  readonly format: BookFileFormat;
  /** Button label. Short on purpose — it sits next to a file size, not in prose. */
  readonly label: string;
  /**
   * True when the link does not yield the book itself but a licence/ticket that a separate DRM
   * application must redeem (Adobe ADEPT `.acsm`, LCP). The UI must say so: a reader who taps
   * "EPUB" and receives a 2 KB `.acsm` file has been misled, which I-4 forbids.
   */
  readonly requiresDrmApp?: boolean;
  /** Audio rather than text — decides whether it belongs under "Listen" or "Read". */
  readonly isAudio?: boolean;
}

/**
 * Keyed by the bare media type, with parameters stripped: real feeds send
 * `application/epub+zip;charset=utf-8` and `application/atom+xml;type=entry;profile=opds-catalog`.
 */
const MEDIA_TYPES: Readonly<Record<string, MediaTypeInfo>> = {
  'application/epub+zip': { format: 'epub', label: 'EPUB' },
  'application/epub': { format: 'epub', label: 'EPUB' },
  'application/pdf': { format: 'pdf', label: 'PDF' },
  'application/x-fictionbook+xml': { format: 'fb2', label: 'FB2' },
  'application/fb2+zip': { format: 'fb2', label: 'FB2 (zip)' },
  'application/x-fictionbook': { format: 'fb2', label: 'FB2' },
  'application/x-mobipocket-ebook': { format: 'mobi', label: 'MOBI' },
  'application/vnd.amazon.ebook': { format: 'azw3', label: 'AZW3' },
  'image/vnd.djvu': { format: 'djvu', label: 'DjVu' },
  'application/vnd.comicbook+zip': { format: 'cbz', label: 'CBZ' },
  'application/vnd.comicbook-rar': { format: 'cbr', label: 'CBR' },
  'application/x-cbz': { format: 'cbz', label: 'CBZ' },
  'application/x-cbr': { format: 'cbr', label: 'CBR' },
  'text/plain': { format: 'txt', label: 'Plain text' },
  'text/html': { format: 'html', label: 'Read online' },
  'application/rtf': { format: 'rtf', label: 'RTF' },
  'text/rtf': { format: 'rtf', label: 'RTF' },
  'audio/mpeg': { format: 'audio', label: 'MP3', isAudio: true },
  'audio/mp4': { format: 'audio', label: 'M4A', isAudio: true },
  'audio/ogg': { format: 'audio', label: 'OGG', isAudio: true },
  'audio/flac': { format: 'audio', label: 'FLAC', isAudio: true },
  'application/audiobook+json': {
    format: 'audiobook-manifest',
    label: 'Audiobook',
    isAudio: true,
  },
  'application/audiobook+zip': { format: 'audiobook-manifest', label: 'Audiobook', isAudio: true },
  'application/vnd.adobe.adept+xml': {
    format: 'drm-license',
    label: 'Adobe DRM licence',
    requiresDrmApp: true,
  },
  'application/vnd.readium.lcp.license.v1.0+json': {
    format: 'drm-license',
    label: 'Readium LCP licence',
    requiresDrmApp: true,
  },
};

/** `application/epub+zip;charset=utf-8` → `application/epub+zip`. */
export function bareMediaType(mediaType: string | null | undefined): string | null {
  if (!mediaType) return null;
  const bare = mediaType.split(';')[0]?.trim().toLowerCase();
  return bare || null;
}

/** Parameters of a media type, lowercased keys: `type=entry;profile=opds-catalog`. */
export function mediaTypeParameters(mediaType: string | null | undefined): Record<string, string> {
  if (!mediaType) return {};
  const parameters: Record<string, string> = {};
  for (const part of mediaType.split(';').slice(1)) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim().toLowerCase();
    const value = part
      .slice(separator + 1)
      .trim()
      .replace(/^"|"$/g, '');
    if (key) parameters[key] = value;
  }
  return parameters;
}

export function describeMediaType(mediaType: string | null | undefined): MediaTypeInfo | null {
  const bare = bareMediaType(mediaType);
  return bare ? (MEDIA_TYPES[bare] ?? null) : null;
}

/** An OPDS catalog document rather than a book file — i.e. a link to navigate, not to download. */
export function isCatalogMediaType(mediaType: string | null | undefined): boolean {
  const bare = bareMediaType(mediaType);
  if (bare === 'application/opds+json') return true;
  if (bare !== 'application/atom+xml') return false;
  const profile = mediaTypeParameters(mediaType)['profile'];
  return profile === undefined || profile === 'opds-catalog';
}
