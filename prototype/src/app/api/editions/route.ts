import { NextRequest, NextResponse } from 'next/server';

const USER_AGENT =
  'BookTranslateFinder-Prototype/0.1 (+https://github.com/symonbaikov/book-translate-finder)';

interface OpenLibraryEdition {
  title?: string;
  languages?: { key: string }[];
  publish_date?: string;
  publishers?: string[];
  ocaid?: string;
  key: string;
}

export async function GET(request: NextRequest) {
  const workKey = request.nextUrl.searchParams.get('workKey');
  if (!workKey) {
    return NextResponse.json({ error: 'missing "workKey" query parameter' }, { status: 400 });
  }

  const url = `https://openlibrary.org${workKey}/editions.json?limit=50`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) {
    return NextResponse.json({ error: `Open Library responded ${res.status}` }, { status: 502 });
  }
  const data = (await res.json()) as { entries?: OpenLibraryEdition[] };

  const editions = (data.entries ?? []).map((e) => {
    // Manual, throwaway rights heuristic — NOT the real LinkPolicy (docs/legal-policy.md).
    // Note: `ebook_access` (used by search.json) does NOT exist on individual edition records —
    // editions.json only exposes `ocaid` (an Internet Archive identifier). Its presence means
    // "Internet Archive has scanned this edition", not "this edition is legally free to read" —
    // IA also hosts in-copyright books under controlled digital lending (borrow, not download).
    // So this is deliberately labelled "has an IA scan, status unverified", never "public
    // domain" — the same principle Phase 1's LinkPolicy enforces for real (docs/legal-policy.md
    // §3: absence of a clear signal is never treated as permission).
    const hasArchiveScan = Boolean(e.ocaid);
    return {
      title: e.title,
      language: e.languages?.[0]?.key.replace('/languages/', '') ?? 'und',
      publishYear: e.publish_date ?? null,
      publisher: e.publishers?.[0] ?? null,
      rightsStatus: hasArchiveScan ? ('has_archive_scan' as const) : ('unknown' as const),
      archiveUrl: hasArchiveScan ? `https://archive.org/details/${e.ocaid}` : null,
    };
  });

  return NextResponse.json({ workKey, editions });
}
