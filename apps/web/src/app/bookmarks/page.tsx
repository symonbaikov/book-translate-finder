'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { BookmarksResponse } from '@btf/contracts';
import { listBookmarks, setBookmark } from '../../lib/auth-client';
import { CoverImage } from '../../components/CoverImage';
import { useSession } from '../../components/SessionProvider';

type Item = BookmarksResponse['bookmarks'][number];

export default function BookmarksPage() {
  const { user, loading: sessionLoading } = useSession();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems((await listBookmarks()).bookmarks);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load your saved books.');
    }
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  async function remove(workId: string): Promise<void> {
    // Removed from the list immediately: the row the reader just dismissed staying put reads as
    // a failure, and the request is a single delete.
    setItems((current) => current?.filter((item) => item.workId !== workId) ?? null);
    try {
      await setBookmark(workId, false);
    } catch {
      await load();
    }
  }

  if (sessionLoading) return null;

  if (!user) {
    return (
      <main className="container" id="main-content">
        <h1>Saved books</h1>
        <p>
          <Link href="/login">Sign in</Link> to keep the books you find — and to compare editions of
          the same book side by side later.
        </p>
      </main>
    );
  }

  return (
    <main className="container" id="main-content">
      <h1>Saved books</h1>
      {error && <p className="error-box">{error}</p>}
      {items === null && !error && <p className="muted">Loading…</p>}
      {items?.length === 0 && (
        <p className="muted">
          Nothing saved yet. Find a book and use “Save this book” on its card.{' '}
          <Link href="/">Search</Link>
        </p>
      )}
      {items?.map((item) => (
        <article key={item.workId} className="card media-row">
          <CoverImage src={item.coverUrl} alt="" width={64} height={96} />
          <div className="media-row__body">
            <h2 style={{ margin: 0, fontSize: '1.05rem' }}>
              <Link href={`/works/${item.workId}`}>{item.originalTitle}</Link>
            </h2>
            <p className="muted" style={{ margin: '0.2rem 0 0.6rem' }}>
              {item.author}
              {item.firstPublishedYear ? `, ${item.firstPublishedYear}` : ''}
            </p>
            <button
              type="button"
              className="button--secondary"
              onClick={() => void remove(item.workId)}
            >
              Remove
            </button>
          </div>
        </article>
      ))}
    </main>
  );
}
