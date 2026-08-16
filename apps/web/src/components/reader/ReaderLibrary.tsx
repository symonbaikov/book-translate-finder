'use client';

import { removeBook, type LibraryEntry } from '@golden/reader';
import { useT } from '../../i18n/I18nProvider';
import { useSettingChangeToast } from '../../lib/settings-toast';
import { outcomeOfWrite } from '../../lib/setting-change';
import { Button } from '../../ui';
import styles from './BookReader.module.css';

/**
 * The books this browser is holding on to.
 *
 * Every row is something the reader put here on purpose, so removing one is a preference change and
 * announces itself like every other (CLAUDE.md): the outcome comes from what storage actually did,
 * never from the fact that the button was clicked. A browser that refuses the delete leaves the book
 * exactly where it was, and the popup has to say so rather than showing an empty list that refills
 * on reload.
 */
export function ReaderLibrary({
  entries,
  onOpen,
  onChanged,
}: {
  entries: readonly LibraryEntry[];
  onOpen: (entry: LibraryEntry) => void;
  onChanged: () => void;
}) {
  const t = useT();
  const announce = useSettingChangeToast();

  async function remove(entry: LibraryEntry): Promise<void> {
    const title = entry.title ?? t('reader.untitled');
    const removed = await removeBook(entry.hash);
    announce({
      setting: 'reader.library',
      outcome: outcomeOfWrite(removed, 'clear'),
      title: t('settings.reader.libraryTitle'),
      detail: t('settings.reader.removed', { title }),
    });
    onChanged();
  }

  return (
    <section className={styles.library}>
      <h2 className={styles.libraryHeading}>{t('reader.library')}</h2>
      {entries.length === 0 ? (
        <p className={styles.formats}>{t('reader.libraryEmpty')}</p>
      ) : (
        <ul className={styles.libraryList}>
          {entries.map((entry) => (
            <li key={entry.hash} className={styles.libraryRow}>
              <span className={styles.libraryTitle}>{entry.title ?? t('reader.untitled')}</span>
              <span className={styles.libraryMeta}>
                {entry.format.toUpperCase()} ·{' '}
                {entry.keepFile ? t('reader.libraryFileKept') : t('reader.libraryFileGone')}
              </span>
              {/* Only a kept file can be reopened from here. Without the bytes there is nothing to
                  open — the entry is a record that this book was read, not a copy of it. */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!entry.keepFile}
                onClick={() => onOpen(entry)}
              >
                {t('reader.libraryOpen')}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => void remove(entry)}>
                {t('reader.libraryRemove')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
