'use client';

import { useEffect, useState } from 'react';
import type { FeaturedBook, FeaturedResponse } from '@golden/contracts';
import { FeaturedResponseSchema } from '@golden/contracts';
import { webEnv } from '../config/web-env';
import { BookCard, BookCardSkeleton } from './BookCard';
import { useT } from '../i18n/I18nProvider';
import { Badge, PosterGrid, Section } from '../ui';
import styles from './FeaturedBooks.module.css';

/**
 * The home page's book lists.
 *
 * Client-side rather than server-rendered on purpose: a fresh instance resolves these lazily in
 * the background, so the page must be able to arrive with a short list and get longer, without
 * making the whole home page uncacheable.
 *
 * `language` is the reader's book language (see the home page for how it is chosen). It is sent to
 * the API, not applied here: which books count as written in a language is a question for the
 * sources, not something a React component should decide.
 */
export function FeaturedBooks({ language }: { language: string }) {
  const t = useT();
  const [data, setData] = useState<FeaturedResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const url = new URL('/api/featured', webEnv.NEXT_PUBLIC_API_URL);
        url.searchParams.set('language', language);
        const res = await fetch(url);
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
  }, [language]);

  if (failed) return null;

  if (!data) {
    return (
      <section className={styles.loading} aria-label="Loading featured books">
        <PosterGrid>
          {Array.from({ length: 12 }, (_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </PosterGrid>
      </section>
    );
  }

  const ofTheYear = data.books.filter((b) => b.list === 'books-of-the-year');
  const popular = data.books.filter((b) => b.list === 'popular');
  const inLanguage = data.books.filter((b) => b.list === 'in-language');
  if (ofTheYear.length === 0 && popular.length === 0 && inLanguage.length === 0) return null;

  return (
    <>
      {/* First on the page, deliberately: a reader who set the site to their language is telling
          us which books they want, and the curated lists below are Anglophone by construction. */}
      <FeaturedSection
        // The heading names no language on purpose. "Books in {language}" needs the language name
        // in a different grammatical case in half the interface languages ("Книги на русском", not
        // "на русский"), and `Intl.DisplayNames` only ever returns the nominative — so the honest
        // choice is a heading that needs no inflection at all.
        heading={t('featured.inLanguageHeading')}
        blurb={t('featured.inLanguageBlurb')}
        books={inLanguage}
        freeLabel={t('featured.freeCopy')}
        priority
      />
      <YearSection
        heading={t('featured.yearHeading')}
        blurb={t('featured.yearBlurb')}
        books={ofTheYear}
        freeLabel={t('featured.freeCopy')}
        yearLabel={(year) => t('featured.year', { year })}
      />
      <FeaturedSection
        heading={t('featured.popularHeading')}
        blurb={t('featured.popularBlurb')}
        books={popular}
        freeLabel={t('featured.freeCopy')}
      />
      {data.filling && <p className={styles.filling}>{t('featured.filling')}</p>}
    </>
  );
}

function FeaturedCard({
  book,
  freeLabel,
  priority = false,
}: {
  book: FeaturedBook;
  freeLabel: string;
  priority?: boolean;
}) {
  return (
    <BookCard
      href={`/works/${book.workId}`}
      title={book.title}
      author={book.author}
      coverUrl={book.coverUrl}
      priority={priority}
      // The language list has no year to show — it is ordered by how often a book was published,
      // and a made-up date under a cover would be worse than none.
      meta={book.year === null ? book.author : `${book.author} · ${book.year}`}
      // Only claimed when a legal free copy actually exists — the badge is the reason to click, so
      // it must never be decoration.
      badge={book.hasFreeCopy ? <Badge tone="positive">{freeLabel}</Badge> : undefined}
    />
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

  // Curated entries always carry a year; the filter is what makes that a checked fact rather than
  // an assumption, since the response type allows a yearless book (the language list has none).
  const years = [...new Set(books.map((b) => b.year).filter((y) => y !== null))].sort(
    (a, b) => b - a,
  );

  return (
    <Section title={heading} note={blurb}>
      {years.map((year) => (
        <div key={year} className={styles.year}>
          <h3 className={styles.yearLabel}>{yearLabel(year)}</h3>
          <PosterGrid>
            {books
              .filter((book) => book.year === year)
              .map((book) => (
                <FeaturedCard key={book.workId} book={book} freeLabel={freeLabel} />
              ))}
          </PosterGrid>
        </div>
      ))}
    </Section>
  );
}

function FeaturedSection({
  heading,
  blurb,
  books,
  freeLabel,
  priority = false,
}: {
  heading: string;
  blurb: string;
  books: FeaturedBook[];
  freeLabel: string;
  priority?: boolean;
}) {
  if (books.length === 0) return null;

  return (
    <Section title={heading} note={blurb}>
      <PosterGrid className={styles.grid}>
        {books.map((book, index) => (
          <FeaturedCard
            key={book.workId}
            book={book}
            freeLabel={freeLabel}
            priority={priority && index < 6}
          />
        ))}
      </PosterGrid>
    </Section>
  );
}
