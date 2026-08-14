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
      <YearSection
        heading={t('featured.yearHeading')}
        blurb={t('featured.yearBlurb')}
        books={ofTheYear}
        freeLabel={t('featured.freeCopy')}
        yearLabel={(year) => t('featured.year', { year })}
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

/**
 * "Books of the year", one row per year.
 *
 * Grouped rather than shown as one flat grid because the year is the organising idea of this
 * list — a reader scanning it is looking for "what came out in 2023", and a wall of covers with
 * the year in small print underneath does not answer that.
 */
function YearSection({
  heading,
  blurb,
  books,
  freeLabel,
  yearLabel,
}: {
  heading: string;
  blurb: string;
  books: FeaturedBook[];
  freeLabel: string;
  yearLabel: (year: number) => string;
}) {
  if (books.length === 0) return null;

  const years = [...new Set(books.map((b) => b.year))].sort((a, b) => b - a);

  return (
    <section aria-labelledby="books-of-the-year" style={{ marginTop: '2.5rem' }}>
      <h2 id="books-of-the-year" style={{ marginBottom: '0.2rem' }}>
        {heading}
      </h2>
      <p className="muted" style={{ marginTop: 0, fontSize: '0.88em' }}>
        {blurb}
      </p>
      {years.map((year) => (
        <div key={year} className="featured-year">
          <h3 className="featured-year__label">{yearLabel(year)}</h3>
          <ul className="featured-grid">
            {books
              .filter((book) => book.year === year)
              .map((book) => (
                <FeaturedCard key={book.workId} book={book} freeLabel={freeLabel} />
              ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function FeaturedCard({ book, freeLabel }: { book: FeaturedBook; freeLabel: string }) {
  return (
    <li>
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
          <FeaturedCard key={book.workId} book={book} freeLabel={freeLabel} />
        ))}
      </ul>
    </section>
  );
}
