'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { FeaturedBook, FeaturedResponse } from '@btf/contracts';
import { FeaturedResponseSchema } from '@btf/contracts';
import { webEnv } from '../config/web-env';
import { CoverImage, CoverSkeleton } from './CoverImage';
import { useT } from '../i18n/I18nProvider';

/**
 * The home page's curated lists.
 *
 * Client-side rather than server-rendered on purpose: a fresh instance resolves these lazily in
 * the background, so the page must be able to arrive with a short list and get longer, without
 * making the whole home page uncacheable.
 */
export function FeaturedBooks() {
  const t = useT();
  const [data, setData] = useState<FeaturedResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`${webEnv.NEXT_PUBLIC_API_URL}/api/featured`);
        if (!res.ok) throw new Error(String(res.status));
        const parsed = FeaturedResponseSchema.parse(await res.json());
        if (!cancelled) setData(parsed);
      } catch {
        // A missing home-page list is not worth an error box — the search below still works.
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;

  if (!data) {
    return (
      <section style={{ marginTop: '2.5rem' }} aria-label="Loading featured books">
        <div className="featured-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <CoverSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  const ofTheYear = data.books.filter((b) => b.list === 'books-of-the-year');
  const popular = data.books.filter((b) => b.list === 'popular');
  if (ofTheYear.length === 0 && popular.length === 0) return null;

  return (
    <>
      <FeaturedSection
        id="books-of-the-year"
        heading={t('featured.yearHeading')}
        blurb={t('featured.yearBlurb')}
        books={ofTheYear}
        freeLabel={t('featured.freeCopy')}
      />
      <FeaturedSection
        id="popular"
        heading={t('featured.popularHeading')}
        blurb={t('featured.popularBlurb')}
        books={popular}
        freeLabel={t('featured.freeCopy')}
      />
      {data.filling && (
        <p className="muted" style={{ fontSize: '0.85em' }}>
          {t('featured.filling')}
        </p>
      )}
    </>
  );
}

function FeaturedSection({
  id,
  heading,
  blurb,
  books,
  freeLabel,
}: {
  id: string;
  heading: string;
  blurb: string;
  books: FeaturedBook[];
  freeLabel: string;
}) {
  if (books.length === 0) return null;

  return (
    <section aria-labelledby={id} style={{ marginTop: '2.5rem' }}>
      <h2 id={id} style={{ marginBottom: '0.2rem' }}>
        {heading}
      </h2>
      <p className="muted" style={{ marginTop: 0, fontSize: '0.88em' }}>
        {blurb}
      </p>
      <ul className="featured-grid">
        {books.map((book) => (
          <li key={book.workId}>
            <Link href={`/works/${book.workId}`} className="featured-card">
              <CoverImage src={book.coverUrl} alt="" width={110} height={165} />
              <span className="featured-card__title">{book.title}</span>
              <span className="muted featured-card__meta">
                {book.author} · {book.year}
              </span>
              {/* Only claimed when a legal free copy actually exists — the badge is the reason to
                  click, so it must never be decoration. */}
              {book.hasFreeCopy && <span className="badge badge--positive">{freeLabel}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
