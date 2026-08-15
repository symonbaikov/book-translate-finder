'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FreeBooksResponseSchema, type FreeBook } from '@golden/contracts';
import { webEnv } from '../config/web-env';
import { BookCard, BookCardSkeleton } from './BookCard';
import { useT } from '../i18n/I18nProvider';
import { Badge, PosterGrid, Section } from '../ui';
import styles from './FreeBooks.module.css';

/** One row of covers. The catalogue behind "see more" is where the rest of the shelf lives. */
const HOME_ROW = 12;

/**
 * "Free to read right now" on the home page.
 *
 * Deliberately unfiltered by language, unlike the curated rows above it: this shelf is small on
 * most instances, and narrowing it by the reader's language is the difference between a row and
 * an empty space. The catalogue behind it offers the filter, where there is enough to filter.
 *
 * Client-side for the same reason `FeaturedBooks` is — the shelf grows every time a sync lands a
 * public domain download, and the home page should not become uncacheable to say so.
 */
export function FreeBooks() {
  const t = useT();
  const [books, setBooks] = useState<FreeBook[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const url = new URL('/api/free-books', webEnv.NEXT_PUBLIC_API_URL);
        url.searchParams.set('limit', String(HOME_ROW));
        const res = await fetch(url);
        if (!res.ok) throw new Error(String(res.status));
        const parsed = FreeBooksResponseSchema.parse(await res.json());
        if (!cancelled) setBooks(parsed.books);
      } catch {
        // A missing home-page row is not worth an error box — the search above still works.
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;

  if (!books) {
    return (
      <section className={styles.loading} aria-label={t('free.homeHeading')}>
        <PosterGrid>
          {Array.from({ length: 6 }, (_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </PosterGrid>
      </section>
    );
  }

  // An empty shelf is normal on a fresh install, and a heading over nothing reads as a bug. The
  // catalogue page says what is going on; the home page simply does not raise the subject.
  if (books.length === 0) return null;

  return (
    <Section
      title={t('free.homeHeading')}
      note={t('free.homeBlurb')}
      action={
        <Link href="/free" className={styles.seeAll}>
          {t('free.seeAll')} →
        </Link>
      }
    >
      <PosterGrid>
        {books.map((book) => (
          <FreeBookCard key={book.id} book={book} />
        ))}
      </PosterGrid>
    </Section>
  );
}

/**
 * One free book.
 *
 * No "free copy" badge, unlike the curated rows: every card under this heading is free, so the
 * badge would mark nothing. Whether there is a *file* to download takes that slot instead — a
 * download versus a reading page is the thing a reader actually needs to know before clicking.
 *
 * The badge deliberately does not list `book.formats` itself: those are raw source strings
 * (Internet Archive mixes in OCR/torrent metadata and audiobook bitrates alongside real ebook
 * formats, e.g. "abbyy gz", "archive bittorrent", "64kbps mp3"), so joining them produces noise a
 * reader doesn't need — the file's own page states the exact format.
 */
export function FreeBookCard({ book, priority = false }: { book: FreeBook; priority?: boolean }) {
  const t = useT();
  return (
    <BookCard
      href={`/works/${book.id}`}
      title={book.originalTitle}
      author={book.author}
      coverUrl={book.coverUrl}
      priority={priority}
      meta={book.firstPublishedYear ? `${book.author} · ${book.firstPublishedYear}` : book.author}
      // No formats is common and not an error — a public domain reading page is not a file — so
      // the slot is left empty rather than filled with a badge that says "unknown".
      badge={
        book.formats.length > 0 ? (
          <Badge tone="positive" glyph={null}>
            {t('free.downloadable')}
          </Badge>
        ) : undefined
      }
    />
  );
}
