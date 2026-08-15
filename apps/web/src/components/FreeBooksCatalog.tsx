'use client';

import { useState } from 'react';
import type { FreeBook, FreeBooksResponse } from '@golden/contracts';
import { FreeBooksResponseSchema } from '@golden/contracts';
import { webEnv } from '../config/web-env';
import { useT } from '../i18n/I18nProvider';
import { Button, PosterGrid } from '../ui';
import { FreeBookCard } from './FreeBooks';
import styles from './FreeBooksCatalog.module.css';

/**
 * The free shelf, paged.
 *
 * The first page arrives already rendered from the server — a catalogue that is blank until
 * JavaScript runs is a catalogue search engines and slow connections never see. Everything after
 * it is fetched here, because "show more" is not a navigation and should not lose the reader's
 * place on the page.
 */
export function FreeBooksCatalog({ initial }: { initial: FreeBooksResponse }) {
  const t = useT();
  const [books, setBooks] = useState<FreeBook[]>(initial.books);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  async function showMore(): Promise<void> {
    setLoading(true);
    setFailed(false);
    try {
      const url = new URL('/api/free-books', webEnv.NEXT_PUBLIC_API_URL);
      url.searchParams.set('limit', String(initial.limit));
      url.searchParams.set('offset', String(books.length));
      if (initial.language) url.searchParams.set('language', initial.language);

      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const next = FreeBooksResponseSchema.parse(await res.json());
      // Deduplicated by id rather than concatenated: a sync landing between two pages shifts the
      // ordering, and the same book arriving twice would render two identical cards.
      setBooks((current) => {
        const seen = new Set(current.map((book) => book.id));
        return [...current, ...next.books.filter((book) => !seen.has(book.id))];
      });
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PosterGrid>
        {books.map((book, index) => (
          <FreeBookCard key={book.id} book={book} priority={index < 6} />
        ))}
      </PosterGrid>

      <p className={styles.count}>
        {t('free.shown', { shown: books.length, total: initial.total })}
      </p>

      {books.length < initial.total && (
        <Button onClick={() => void showMore()} loading={loading}>
          {t('free.showMore')}
        </Button>
      )}

      {failed && (
        <p className={styles.failed} role="status">
          {t('free.loadFailed')}
        </p>
      )}
    </>
  );
}
