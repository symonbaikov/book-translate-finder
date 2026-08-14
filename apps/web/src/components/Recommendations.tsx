'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RecommendationsResponseSchema, type RecommendationsResponse } from '@btf/contracts';
import { webEnv } from '../config/web-env';
import { CoverImage } from './CoverImage';
import { useT } from '../i18n/I18nProvider';
import { buildTasteProfile, clearHistory, type TasteProfile } from '../lib/reading-history';

type Book = RecommendationsResponse['books'][number];

/**
 * "Because you were reading…" on the home page.
 *
 * The reader's history stays in their browser; only the genres derived from it are sent, in a
 * POST body rather than a query string so they do not end up in access logs
 * (docs/adr/0006-local-recommendations.md). Nothing renders until there is real history, so a
 * first-time visitor sees no empty shelf and no invitation to be profiled.
 */
export function Recommendations() {
  const t = useT();
  const [profile, setProfile] = useState<TasteProfile | null>(null);
  const [books, setBooks] = useState<Book[] | null>(null);

  useEffect(() => {
    const taste = buildTasteProfile();
    setProfile(taste);
    if (taste.subjects.length === 0) return;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`${webEnv.NEXT_PUBLIC_API_URL}/api/recommendations`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ subjects: taste.subjects, excludeWorkIds: taste.workIds }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const parsed = RecommendationsResponseSchema.parse(await res.json());
        if (!cancelled) setBooks(parsed.books);
      } catch {
        // A failed suggestion is not worth an error box: the search below still works.
        if (!cancelled) setBooks([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function forget(): void {
    clearHistory();
    setProfile(null);
    setBooks(null);
  }

  if (!profile || profile.subjects.length === 0 || !books || books.length === 0) return null;

  return (
    <section aria-labelledby="recommendations" style={{ marginTop: '2.5rem' }}>
      <h2 id="recommendations" style={{ marginBottom: '0.2rem' }}>
        {t('recommend.heading')}
      </h2>
      <p className="muted" style={{ marginTop: 0, fontSize: '0.88em' }}>
        {profile.lastTitle
          ? t('recommend.becauseOf', { title: profile.lastTitle })
          : t('recommend.blurb')}{' '}
        {t('recommend.privacy')}{' '}
        <button type="button" className="link-button" onClick={forget}>
          {t('recommend.forget')}
        </button>
      </p>
      <ul className="featured-grid">
        {books.map((book) => (
          <li key={book.id}>
            <Link href={`/works/${book.id}`} className="featured-card">
              <CoverImage src={book.coverUrl} alt="" width={110} height={165} />
              <span className="featured-card__title">{book.originalTitle}</span>
              <span className="muted featured-card__meta">
                {book.author}
                {book.firstPublishedYear ? ` · ${book.firstPublishedYear}` : ''}
              </span>
              {/* The reason this book is here, in the reader's own terms — a recommendation that
                  cannot explain itself is indistinguishable from an advert. */}
              {book.matchedSubjects[0] && (
                <span className="muted featured-card__meta">{book.matchedSubjects[0]}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
