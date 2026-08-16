'use client';

import { useState } from 'react';
import type { Bookmark } from '@golden/reader';
import { useT } from '../../i18n/I18nProvider';
import { Button } from '../../ui';
import styles from './BookReader.module.css';

/**
 * The reader's own marks in this book, and the notes they wrote on them.
 *
 * A note is edited on blur rather than on every keystroke: each save is an IndexedDB write and a
 * popup, and announcing "saved" once per character would be both a write amplifier and wallpaper
 * (CLAUDE.md — a popup that appears constantly stops being read).
 */
export function ReaderBookmarks({
  bookmarks,
  canAdd,
  onAdd,
  onGo,
  onRemove,
  onNote,
}: {
  bookmarks: readonly Bookmark[];
  canAdd: boolean;
  onAdd: () => void;
  onGo: (bookmark: Bookmark) => void;
  onRemove: (bookmark: Bookmark) => void;
  onNote: (bookmark: Bookmark, note: string) => void;
}) {
  const t = useT();

  return (
    <section className={styles.bookmarks}>
      <div className={styles.bookmarksHead}>
        <h2 className={styles.libraryHeading}>{t('reader.bookmarks')}</h2>
        <Button type="button" variant="secondary" size="sm" disabled={!canAdd} onClick={onAdd}>
          {t('reader.bookmarkAdd')}
        </Button>
      </div>

      {bookmarks.length === 0 ? (
        <p className={styles.formats}>{t('reader.bookmarkNone')}</p>
      ) : (
        <ul className={styles.libraryList}>
          {bookmarks.map((bookmark) => (
            <BookmarkRow
              key={bookmark.cfi}
              bookmark={bookmark}
              onGo={() => onGo(bookmark)}
              onRemove={() => onRemove(bookmark)}
              onNote={(note) => onNote(bookmark, note)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function BookmarkRow({
  bookmark,
  onGo,
  onRemove,
  onNote,
}: {
  bookmark: Bookmark;
  onGo: () => void;
  onRemove: () => void;
  onNote: (note: string) => void;
}) {
  const t = useT();
  const [note, setNote] = useState(bookmark.note);

  return (
    <li className={styles.libraryRow}>
      <span className={styles.libraryMeta}>{bookmark.label}</span>
      <label className={styles.note}>
        <span className="visually-hidden">{t('reader.bookmarkNote')}</span>
        <input
          type="text"
          value={note}
          placeholder={t('reader.bookmarkNotePlaceholder')}
          onChange={(event) => setNote(event.target.value)}
          // On blur, not on change: every save is a write and a popup, and one per keystroke would
          // be both a write amplifier and a popup nobody reads any more.
          onBlur={() => {
            if (note !== bookmark.note) onNote(note);
          }}
        />
      </label>
      <Button type="button" variant="secondary" size="sm" onClick={onGo}>
        {t('reader.bookmarkGo')}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
        {t('reader.bookmarkRemove')}
      </Button>
    </li>
  );
}
