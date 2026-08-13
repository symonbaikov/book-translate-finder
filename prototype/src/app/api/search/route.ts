import { NextRequest, NextResponse } from 'next/server';

// Neither Open Library nor Google Books send Access-Control-Allow-Origin, so a browser fetch()
// straight to them is blocked by CORS — confirmed during Phase 0 research (see
// docs/research/coverage-phase0.md). This route is the minimal fix: a same-origin proxy inside
// the SAME throwaway prototype (no separate service, no DB) that runs server-side, where CORS
// doesn't apply, and the browser only ever talks to itself.
const USER_AGENT =
  'BookTranslateFinder-Prototype/0.1 (+https://github.com/symonbaikov/book-translate-finder)';

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  language?: string[];
  edition_count?: number;
  first_publish_year?: number;
  ebook_access?: string;
}

interface GoogleBooksItem {
  volumeInfo?: {
    title?: string;
    authors?: string[];
    language?: string;
    industryIdentifiers?: { type: string; identifier: string }[];
    infoLink?: string;
  };
  saleInfo?: { buyLink?: string; saleability?: string };
}

async function searchOpenLibrary(q: string) {
  const url = `https://openlibrary.org/search.json?${new URLSearchParams({
    q,
    fields: 'key,title,author_name,language,edition_count,first_publish_year,ebook_access',
    limit: '1',
  })}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Open Library responded ${res.status}`);
  const data = (await res.json()) as { docs?: OpenLibraryDoc[]; numFound?: number };
  const top = data.docs?.[0];
  if (!top) return { found: false as const, numFound: data.numFound ?? 0 };
  return {
    found: true as const,
    workKey: top.key,
    title: top.title,
    languages: top.language ?? [],
    editionCount: top.edition_count ?? 0,
    firstPublishYear: top.first_publish_year ?? null,
    ebookAccess: top.ebook_access ?? null,
  };
}

async function searchGoogleBooks(q: string) {
  const url = `https://www.googleapis.com/books/v1/volumes?${new URLSearchParams({
    q,
    maxResults: '5',
  })}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Books responded ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { items?: GoogleBooksItem[] };
  return (data.items ?? []).map((item) => ({
    title: item.volumeInfo?.title,
    language: item.volumeInfo?.language,
    isbn: item.volumeInfo?.industryIdentifiers?.find((i) => i.type.startsWith('ISBN'))?.identifier,
    buyLink: item.saleInfo?.buyLink,
  }));
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q) {
    return NextResponse.json({ error: 'missing "q" query parameter' }, { status: 400 });
  }

  // Sources are independent: one failing must not take the other down with it
  // (docs/rules.md §3 "Отказ одного источника не ломает ответ") — true even at prototype stage.
  const [openLibrary, googleBooks] = await Promise.allSettled([
    searchOpenLibrary(q),
    searchGoogleBooks(q),
  ]);

  return NextResponse.json({
    query: q,
    openLibrary:
      openLibrary.status === 'fulfilled'
        ? openLibrary.value
        : { error: String(openLibrary.reason) },
    googleBooks:
      googleBooks.status === 'fulfilled'
        ? googleBooks.value
        : { error: String(googleBooks.reason) },
  });
}
