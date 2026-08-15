'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { BookmarksResponse } from '@golden/contracts';
import { listBookmarks, setBookmark } from '../../lib/auth-client';
import { BookCard, BookCardSkeleton } from '../../components/BookCard';
import { useSession } from '../../components/SessionProvider';
import { useT } from '../../i18n/I18nProvider';
import { useSettingChangeToast } from '../../lib/settings-toast';
import { Button, Page, PosterGrid } from '../../ui';
import styles from './bookmarks.module.css';

type Item = BookmarksResponse['bookmarks'][number];

export default function BookmarksPage() {
  const { user, loading: sessionLoading } = useSession();
  const t = useT();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const announce = useSettingChangeToast();

  const load = useCallback(async () => {
    try {
      setItems((await listBookmarks()).bookmarks);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t('bookmarks.loadFailed'));
    }
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  async function remove(workId: string, title: string): Promise<void> {
    // Removed from the list immediately: the row the reader just dismissed staying put reads as
    // a failure, and the request is a single delete.
    setItems((current) => current?.filter((item) => item.workId !== workId) ?? null);
    try {
      await setBookmark(workId, false);
      announce({
        setting: 'bookmarks',
        outcome: 'cleared',
        title: t('settings.bookmarks.title'),
        detail: t('settings.bookmarks.removed', { title }),
      });
    } catch {
      // The row comes back on reload, which needs saying — otherwise a book that reappears looks
      // like the list forgot the removal on its own.
      await load();
      announce({
        setting: 'bookmarks',
        outcome: 'failed',
        title: t('settings.bookmarks.title'),
        detail: t('settings.bookmarks.failed'),
      });
    }
  }

  if (sessionLoading) return null;

  if (!user) {
    return (
      <Page>
        <h1>{t('bookmarks.title')}</h1>
        <p className={styles.empty}>
          <Link href="/login">{t('nav.signIn')}</Link> {t('bookmarks.signedOut')}
        </p>
      </Page>
    );
  }

  return (
    <Page>
      <h1>{t('bookmarks.title')}</h1>
      {error && <p className="error-box">{error}</p>}
      {items === null && !error && (
        <PosterGrid className={styles.grid}>
          {Array.from({ length: 6 }, (_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </PosterGrid>
      )}
      {items?.length === 0 && (
        <p className={styles.empty}>
          {t('bookmarks.empty')} <Link href="/">{t('bookmarks.searchLink')}</Link>
        </p>
      )}
      {items && items.length > 0 && (
        <PosterGrid className={styles.grid}>
          {items.map((item, index) => (
            <BookCard
              key={item.workId}
              href={`/works/${item.workId}`}
              title={item.originalTitle}
              author={item.author}
              coverUrl={item.coverUrl}
              priority={index < 6}
              meta={
                item.firstPublishedYear ? `${item.author}, ${item.firstPublishedYear}` : item.author
              }
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void remove(item.workId, item.originalTitle)}
                >
                  {t('bookmarks.remove')}
                </Button>
              }
            />
          ))}
        </PosterGrid>
      )}
    </Page>
  );
}
