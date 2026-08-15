'use client';

import { useEffect, useState } from 'react';
import { RecommendationsResponseSchema, type RecommendationsResponse } from '@golden/contracts';
import { webEnv } from '../config/web-env';
import { BookCard } from './BookCard';
import { PosterGrid, Section } from '../ui';
import { useT } from '../i18n/I18nProvider';
import styles from './Recommendations.module.css';
import { buildTasteProfile, clearHistory, type TasteProfile } from '../lib/reading-history';
import { hideTag, readHiddenTags, unhideTag } from '../lib/hidden-tags';
import { outcomeOfWrite } from '../lib/setting-change';
import { useSettingChangeToast } from '../lib/settings-toast';

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
  const [hidden, setHidden] = useState<string[]>([]);
  // Bumped to re-run the effect after the reader hides or restores a genre.
  const [revision, setRevision] = useState(0);
  const announce = useSettingChangeToast();

  useEffect(() => {
    const hiddenNow = readHiddenTags();
    setHidden(hiddenNow);
    const taste = buildTasteProfile(undefined, hiddenNow);
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
  }, [revision]);

  function forget(): void {
    const cleared = clearHistory();
    setProfile(null);
    setBooks(null);
    // The section disappears as soon as this runs, so without the popup the only feedback for
    // deleting the history is the page losing a block — indistinguishable from a bug.
    announce({
      setting: 'reading-history',
      outcome: cleared ? 'cleared' : 'failed',
      title: t('settings.history.title'),
      detail: t('settings.history.cleared'),
    });
  }

  function hide(tag: string): void {
    const persisted = hideTag(tag);
    setRevision((n) => n + 1);
    announce({
      setting: 'hidden-genres',
      outcome: outcomeOfWrite(persisted, 'set'),
      title: t('settings.hiddenGenres.title'),
      detail: t('settings.hiddenGenres.hidden', {
        genre: tag,
        count: readHiddenTags().length,
      }),
    });
  }

  function restore(tag: string): void {
    const persisted = unhideTag(tag);
    setRevision((n) => n + 1);
    announce({
      setting: 'hidden-genres',
      outcome: outcomeOfWrite(persisted, 'clear'),
      title: t('settings.hiddenGenres.title'),
      detail: t('settings.hiddenGenres.restored', {
        genre: tag,
        count: readHiddenTags().length,
      }),
    });
  }

  if (!profile || profile.subjects.length === 0 || !books || books.length === 0) return null;

  return (
    <Section
      title={t('recommend.heading')}
      note={
        <>
          {profile.lastTitle
            ? t('recommend.becauseOf', { title: profile.lastTitle })
            : t('recommend.blurb')}{' '}
          {t('recommend.privacy')}{' '}
          <button type="button" className={styles.inline} onClick={forget}>
            {t('recommend.forget')}
          </button>
        </>
      }
    >
      <PosterGrid>
        {books.map((book) => (
          <BookCard
            key={book.id}
            href={`/works/${book.id}`}
            title={book.originalTitle}
            author={book.author}
            coverUrl={book.coverUrl}
            meta={
              book.firstPublishedYear ? `${book.author} · ${book.firstPublishedYear}` : book.author
            }
            // The reason this book is here, in the reader's own terms — a recommendation that
            // cannot explain itself is indistinguishable from an advert.
            badge={
              book.matchedSubjects[0] ? (
                <span className={styles.reason}>{book.matchedSubjects[0]}</span>
              ) : undefined
            }
            action={
              book.matchedSubjects[0] ? (
                <button
                  type="button"
                  className={`${styles.inline} ${styles.hide}`}
                  onClick={() => hide(book.matchedSubjects[0]!)}
                >
                  {t('recommend.hideGenre', { genre: book.matchedSubjects[0] })}
                </button>
              ) : undefined
            }
          />
        ))}
      </PosterGrid>

      {hidden.length > 0 && (
        <p className={styles.hidden}>
          {t('recommend.hiddenList')}{' '}
          {hidden.map((tag, i) => (
            <span key={tag}>
              {i > 0 && ', '}
              <button type="button" className={styles.inline} onClick={() => restore(tag)}>
                {tag}
              </button>
            </span>
          ))}
        </p>
      )}
    </Section>
  );
}
