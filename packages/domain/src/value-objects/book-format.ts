/**
 * The shape a reader actually buys, normalized across sources.
 *
 * Sources describe bindings in free text — Open Library's `physical_format` alone contains
 * "Paperback", "paperback", "Mass Market Paperback", "Broschiert", "Taschenbuch" and "pbk." for
 * the same thing — so an aggregator that groups by the raw string shows a reader six categories
 * where there are two. Anything unrecognized stays `unknown` rather than being forced into the
 * nearest bucket: a wrong binding is a worse answer than an absent one.
 */

export const BOOK_FORMATS = ['hardcover', 'paperback', 'ebook', 'audiobook', 'unknown'] as const;

export type BookFormat = (typeof BOOK_FORMATS)[number];

export function isBookFormat(value: string): value is BookFormat {
  return (BOOK_FORMATS as readonly string[]).includes(value);
}

/**
 * Matched as substrings of the lowercased source string, in this order — the first hit wins, so
 * more specific patterns come first ("mass market paperback" must not be read as "market").
 * Includes the German, French, Spanish and Russian words because the catalog is multilingual and
 * `physical_format` is written in the edition's own language often enough to matter.
 */
const FORMAT_PATTERNS: readonly (readonly [BookFormat, readonly string[]])[] = [
  [
    'audiobook',
    [
      'audiobook',
      'audio book',
      'audio cd',
      'audiocassette',
      'mp3',
      'spoken word',
      'hörbuch',
      'аудиокнига',
    ],
  ],
  [
    'ebook',
    [
      'ebook',
      'e-book',
      'epub',
      'kindle',
      'mobi',
      'pdf',
      'electronic resource',
      'digital',
      'электронная',
    ],
  ],
  [
    'hardcover',
    [
      'hardcover',
      'hardback',
      'hard cover',
      'hard-cover',
      'cloth',
      'gebunden',
      'relié',
      'tapa dura',
      'твёрдый переплет',
      'твердый переплет',
    ],
  ],
  [
    'paperback',
    [
      'paperback',
      'pbk',
      'softcover',
      'soft cover',
      'trade paper',
      'mass market',
      'broschiert',
      'taschenbuch',
      'broché',
      'poche',
      'rústica',
      'tapa blanda',
      'мягкая обложка',
    ],
  ],
];

export function normalizeBookFormat(raw: string | null | undefined): BookFormat {
  if (!raw) return 'unknown';
  const value = raw.trim().toLowerCase();
  if (!value) return 'unknown';
  for (const [format, patterns] of FORMAT_PATTERNS) {
    if (patterns.some((pattern) => value.includes(pattern))) return format;
  }
  return 'unknown';
}

/** Display order: physical first, then digital, with the honest "unknown" bucket last. */
const FORMAT_ORDER: Readonly<Record<BookFormat, number>> = {
  hardcover: 0,
  paperback: 1,
  ebook: 2,
  audiobook: 3,
  unknown: 4,
};

export function compareBookFormats(a: BookFormat, b: BookFormat): number {
  return FORMAT_ORDER[a] - FORMAT_ORDER[b];
}
