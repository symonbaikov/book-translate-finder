import { normalizeText } from '../normalization/normalize-text.js';

/**
 * Books the rights holder publishes for free, curated by hand.
 *
 * **Why this exists.** Project Gutenberg answers "public domain", and Open Library answers
 * "borrowable". Neither answers the third real case: a book still under copyright that its author
 * or publisher deliberately gives away — Cory Doctorow's novels, Peter Watts', *Pro Git*. Those
 * are legal free copies, and without this file the app has no way to offer them.
 *
 * **Why it is hand-curated and not generated.** There is no API, index or feed for "the author
 * put this online for free". The only machine-shaped alternative — searching the open web for
 * `"<title>" filetype:pdf` — cannot tell an author's own copy from an unauthorized one, and for a
 * copyrighted book it overwhelmingly returns the latter. That is precisely the shadow-library
 * funnel docs/legal-policy.md I-3 forbids, so it is not an option here. A short list of verified
 * links is worth more than a long list of plausible ones.
 *
 * **What every entry must carry.** `authorization` is the page where the rights holder states the
 * book is free — the thing a reviewer reads to check the claim, not a link we hope is fine. It is
 * required, and the tests reject an entry without it. `verifiedOn` records when a human last
 * opened that page; a link that rots becomes a bug report, not a silent 404.
 *
 * **How to add a book.** Open a PR adding one entry: the author's or publisher's own page granting
 * the permission, direct URLs per format, and today's date in `verifiedOn`. See CONTRIBUTING.md.
 * Links are `open_license` — the rights holder gave permission, the work is not public domain.
 */

export interface AuthorizedFreeDownload {
  /** Short format label the reader recognizes: `epub`, `pdf`, `txt`, `html`, `mobi`. */
  format: string;
  /** Direct URL to the file (or the reading page, for `html`). Must be https. */
  url: string;
}

export interface AuthorizedFreeBook {
  /** Stable slug — becomes part of the link identity, so it must not be renamed casually. */
  id: string;
  title: string;
  author: string;
  /** ISO 639-1 code of *this* copy — a free English original says nothing about its translations. */
  language: string;
  /** The rights holder's own page granting the free copy. Required: it is the evidence. */
  authorization: string;
  /** Licence or permission as the rights holder states it, for the record. */
  license: string;
  /** ISO date (YYYY-MM-DD) a human last confirmed the authorization page still says this. */
  verifiedOn: string;
  downloads: readonly AuthorizedFreeDownload[];
}

export const AUTHORIZED_FREE_BOOKS: readonly AuthorizedFreeBook[] = [
  {
    id: 'little-brother-doctorow',
    title: 'Little Brother',
    author: 'Cory Doctorow',
    language: 'en',
    authorization: 'https://craphound.com/littlebrother/download/',
    license: 'CC BY-NC-SA 3.0, released by the author',
    verifiedOn: '2026-08-14',
    downloads: [
      {
        format: 'epub',
        url: 'https://craphound.com/littlebrother/Cory_Doctorow_-_Little_Brother.epub',
      },
      {
        format: 'pdf',
        url: 'https://craphound.com/littlebrother/Cory_Doctorow_-_Little_Brother.pdf',
      },
      {
        format: 'txt',
        url: 'https://craphound.com/littlebrother/Cory_Doctorow_-_Little_Brother.txt',
      },
    ],
  },
  {
    id: 'homeland-doctorow',
    title: 'Homeland',
    author: 'Cory Doctorow',
    language: 'en',
    authorization: 'https://craphound.com/homeland/download/',
    license: 'CC BY-NC-SA 3.0, released by the author',
    verifiedOn: '2026-08-14',
    downloads: [
      { format: 'epub', url: 'https://craphound.com/homeland/Cory_Doctorow_-_Homeland.epub' },
      { format: 'pdf', url: 'https://craphound.com/homeland/Cory_Doctorow_-_Homeland.pdf' },
    ],
  },
  {
    id: 'down-and-out-doctorow',
    title: 'Down and Out in the Magic Kingdom',
    author: 'Cory Doctorow',
    language: 'en',
    authorization: 'https://craphound.com/down/download/',
    license: 'CC BY-NC-SA 1.0, released by the author',
    verifiedOn: '2026-08-14',
    downloads: [
      {
        format: 'epub',
        url: 'https://craphound.com/down/Cory_Doctorow_-_Down_and_Out_in_the_Magic_Kingdom.epub',
      },
      {
        format: 'pdf',
        url: 'https://craphound.com/down/Cory_Doctorow_-_Down_and_Out_in_the_Magic_Kingdom.pdf',
      },
    ],
  },
  {
    id: 'blindsight-watts',
    title: 'Blindsight',
    author: 'Peter Watts',
    language: 'en',
    authorization: 'https://www.rifters.com/real/Blindsight.htm',
    license: 'CC BY-NC-SA 2.5, released by the author',
    verifiedOn: '2026-08-14',
    downloads: [
      { format: 'pdf', url: 'https://www.rifters.com/real/shorts/PeterWatts_Blindsight.pdf' },
      { format: 'html', url: 'https://www.rifters.com/real/Blindsight.htm' },
    ],
  },
  {
    id: 'starfish-watts',
    title: 'Starfish',
    author: 'Peter Watts',
    language: 'en',
    authorization: 'https://www.rifters.com/real/STARFISH.htm',
    license: 'CC BY-NC-SA 2.5, released by the author',
    verifiedOn: '2026-08-14',
    downloads: [
      { format: 'pdf', url: 'https://www.rifters.com/real/shorts/PeterWatts_Starfish.pdf' },
      { format: 'html', url: 'https://www.rifters.com/real/STARFISH.htm' },
    ],
  },
  {
    id: 'pro-git',
    title: 'Pro Git',
    author: 'Scott Chacon and Ben Straub',
    language: 'en',
    authorization: 'https://git-scm.com/book/en/v2',
    license: 'CC BY-NC-SA 3.0, published free by the publisher (Apress)',
    verifiedOn: '2026-08-14',
    downloads: [
      {
        format: 'pdf',
        url: 'https://github.com/progit/progit2/releases/download/2.1.437/progit.pdf',
      },
      {
        format: 'epub',
        url: 'https://github.com/progit/progit2/releases/download/2.1.437/progit.epub',
      },
    ],
  },
];

function tokens(text: string): string[] {
  return normalizeText(text).split(' ').filter(Boolean);
}

/** True when `needle`'s tokens appear in `haystack` consecutively and in order. */
function containsTokenSequence(haystack: readonly string[], needle: readonly string[]): boolean {
  if (needle.length === 0 || needle.length > haystack.length) return false;
  return haystack.some((_, start) => needle.every((token, i) => haystack[start + i] === token));
}

/**
 * Matches a free-text query ("title author", the same shape every source is asked) against the
 * catalog.
 *
 * Deliberately strict, in two steps. The title must appear as a whole run of words, so *Blindsight*
 * cannot be matched by a query that merely shares a letter sequence. And when the query says more
 * than the title alone, the author must be named too — otherwise "Homeland Elegies, Ayad Akhtar"
 * matches Doctorow's *Homeland* and the reader is offered a free download of a different book
 * entirely. Missing a match here costs one absent link; a wrong match attaches someone else's book
 * to a title and is the failure worth engineering against.
 */
export function findAuthorizedFreeBooks(query: string): AuthorizedFreeBook[] {
  const queryTokens = tokens(query);
  if (queryTokens.length === 0) return [];

  return AUTHORIZED_FREE_BOOKS.filter((book) => {
    const titleTokens = tokens(book.title);
    if (!containsTokenSequence(queryTokens, titleTokens)) return false;
    if (queryTokens.length === titleTokens.length) return true;

    // Short words ("and", "de") are dropped: they carry no identifying power and would let any
    // query containing them pass as "the author was named".
    const authorTokens = tokens(book.author).filter((t) => t.length > 2);
    return authorTokens.some((token) => queryTokens.includes(token));
  });
}
