/**
 * What kind of book is this?
 *
 * Answered from the **bytes**, with the filename allowed to break ties and never to overrule.
 * Extensions are wrong often enough to matter: a `.epub` that is really a MOBI is a normal thing to
 * find in a download folder, and trusting its name would hand the wrong loader a file it cannot
 * read and produce an error about the file rather than about our guess.
 *
 * Where the filename does decide is inside ZIP, and only there: EPUB, CBZ and FBZ are all ZIP
 * archives, and telling a comic apart from a compressed FB2 means reading the archive's directory —
 * work this function deliberately does not do, because it runs before anything is loaded and must
 * stay cheap enough to run on every candidate. EPUB is exempt: it stamps its own media type into
 * the first entry, so it is recognised by content like everything else.
 */

export const READER_FORMATS = ['epub', 'fb2', 'fbz', 'mobi', 'cbz'] as const;

/** `mobi` covers AZW3/KF8 too: they share the PalmDB signature, and one loader reads both. */
export type ReaderFormat = (typeof READER_FORMATS)[number];

const ZIP_MAGIC = [0x50, 0x4b, 0x03, 0x04];
/** Local file header (30 bytes) + `mimetype` (8) — where EPUB's own media type must sit. */
const EPUB_MIMETYPE_OFFSET = 38;
const EPUB_MEDIA_TYPE = 'application/epub+zip';
/** PalmDB puts type+creator at byte 60. Both spellings are Mobipocket. */
const PALM_TYPE_OFFSET = 60;
const PALM_SIGNATURES = ['BOOKMOBI', 'TEXtREAd'];
/** Enough to reach past a BOM, an XML declaration, a stylesheet PI and some whitespace. */
const XML_SNIFF_BYTES = 2048;

const decoder = new TextDecoder('utf-8', { fatal: false });

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  if (bytes.length < offset + length) return '';
  return decoder.decode(bytes.subarray(offset, offset + length));
}

function startsWith(bytes: Uint8Array, magic: readonly number[]): boolean {
  return magic.every((byte, index) => bytes[index] === byte);
}

function extensionOf(filename: string | undefined): string {
  if (!filename) return '';
  const name = filename.toLowerCase().split(/[?#]/, 1)[0] ?? '';
  // `.fb2.zip` is a real, common spelling of FBZ, so the last dot is not enough.
  if (name.endsWith('.fb2.zip')) return 'fbz';
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot + 1);
}

/**
 * The format, or `null` when the bytes do not say and the name does not either.
 *
 * `null` is a real answer and not a failure to try: a ZIP of images with no extension could be a
 * comic or a backup of somebody's photos, and guessing "comic" would open a reader on it.
 */
export function sniffFormat(bytes: Uint8Array, filename?: string): ReaderFormat | null {
  const extension = extensionOf(filename);

  if (startsWith(bytes, ZIP_MAGIC)) {
    if (ascii(bytes, EPUB_MIMETYPE_OFFSET, EPUB_MEDIA_TYPE.length) === EPUB_MEDIA_TYPE) {
      return 'epub';
    }
    if (extension === 'cbz') return 'cbz';
    if (extension === 'fbz') return 'fbz';
    // An EPUB whose `mimetype` entry was compressed or reordered is out of spec but readable, and
    // its name is then the only evidence there is.
    if (extension === 'epub') return 'epub';
    return null;
  }

  if (PALM_SIGNATURES.includes(ascii(bytes, PALM_TYPE_OFFSET, 8))) return 'mobi';

  const head = decoder.decode(bytes.subarray(0, XML_SNIFF_BYTES));
  if (head.includes('<FictionBook')) return 'fb2';

  return null;
}

/** Whether this reader can render the format — the negative case for `sniffFormat`'s callers. */
export function isSupportedFormat(format: string | null): format is ReaderFormat {
  return format !== null && (READER_FORMATS as readonly string[]).includes(format);
}

/**
 * What a source *claims* a file is, turned into a format this reader can open — or `null`.
 *
 * The two surfaces that offer "read in your browser" both have a free-text hint and nothing else:
 * `SourceLinkDto.format` is whatever the catalogue recorded, and `AddonSource.format` is whatever
 * the addon calls it. Neither is a media type and neither is validated, so this is deliberately a
 * *guess about whether to show a button* — never a decision about how to parse the file. The bytes
 * decide that, once they are here, in `sniffFormat`.
 *
 * A wrong `null` costs the reader a button they could have used. A wrong match costs them a click
 * and an honest error message. Both are recoverable, which is why this is allowed to be a guess at
 * all — and why it stays conservative: an unknown word is not a book.
 */
export function readableFormatOf(hint: string | null | undefined): ReaderFormat | null {
  if (!hint) return null;
  const normalised = hint.toLowerCase().replace(/[^a-z0-9+]/g, ' ');

  // Checked before the rest: "application/epub+zip" contains "zip", and a comic is a zip too.
  if (/\bepub\b|epub\+zip/.test(normalised)) return 'epub';
  if (/\bcbz\b|comicbook/.test(normalised)) return 'cbz';
  if (/\bfbz\b|fb2\s*zip|zip\s*compressed\s*fb2/.test(normalised)) return 'fbz';
  if (/\bfb2\b|fictionbook/.test(normalised)) return 'fb2';
  if (/\bmobi\b|\bazw3?\b|\bkf8\b|mobipocket/.test(normalised)) return 'mobi';
  return null;
}
