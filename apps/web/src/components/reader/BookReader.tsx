'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  acquireFromFile,
  asFoliateFile,
  installContentFramePolicy,
  loadFoliate,
  renderFirstPage,
  titleOf,
  type AcquiredBook,
  type ContentFramePolicy,
  type FoliateView,
} from '@golden/reader';
import { useT } from '../../i18n/I18nProvider';
import { Button, cx } from '../../ui';
import styles from './BookReader.module.css';

type State =
  | { kind: 'idle' }
  | { kind: 'opening' }
  | { kind: 'open'; book: AcquiredBook; title: string | null }
  | { kind: 'failed'; reason: string };

/**
 * The reading surface.
 *
 * Everything here happens in this tab. There is no API client in this component and there is not
 * allowed to be one — `pnpm boundaries` refuses the import, because "just the resume position"
 * is how the endpoint that would end ADR-0013 §1 gets written.
 *
 * What this file is *not* yet: the acquisition flow (11.4), stored progress (11.5), themes and
 * type (11.6), or the entry points that lead here (11.7). It opens a book from the device, so that
 * the route's policy and the engine probe can be exercised end to end rather than argued about.
 */
export function BookReader() {
  const t = useT();
  const viewRef = useRef<FoliateView | null>(null);
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [policy, setPolicy] = useState<ContentFramePolicy | null>(null);

  // The probe runs once, before any book is opened: the frame is created during `open()`, and an
  // attribute decided after that would apply to the next book instead of this one.
  useEffect(() => {
    let live = true;
    void installContentFramePolicy().then((installed) => {
      if (live) setPolicy(installed);
    });
    return () => {
      live = false;
    };
  }, []);

  const open = useCallback(async (file: File) => {
    setState({ kind: 'opening' });
    try {
      const book = await acquireFromFile(file);
      await loadFoliate();
      const view = viewRef.current;
      if (!view) throw new Error('the reading surface is not mounted');
      await view.open(asFoliateFile(book));
      await renderFirstPage(view);
      setState({ kind: 'open', book, title: titleOf(view.book?.metadata) });
    } catch (error) {
      setState({
        kind: 'failed',
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  // Arrow keys live on the host document rather than inside the book's frame — on WebKit that frame
  // may be the one that hears nothing (spike 11.1b), and page turns must work there too.
  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if (state.kind !== 'open') return;
      if (event.key === 'ArrowRight') void viewRef.current?.next();
      if (event.key === 'ArrowLeft') void viewRef.current?.prev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.kind]);

  return (
    <div className={styles.wrap}>
      {state.kind !== 'open' && (
        <div className={styles.intro}>
          <p className={styles.privacy}>{t('reader.privacy')}</p>
          <label className={styles.picker}>
            <span className={styles.pickerLabel}>{t('reader.chooseFile')}</span>
            <input
              type="file"
              accept=".epub,.fb2,.fbz,.mobi,.azw3,.cbz"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void open(file);
              }}
            />
          </label>
          <p className={styles.formats}>{t('reader.formats')}</p>
          {state.kind === 'opening' && <p aria-live="polite">{t('reader.loading')}</p>}
          {state.kind === 'failed' && (
            <p className="error-box">{t('reader.failed', { reason: state.reason })}</p>
          )}
        </div>
      )}

      {state.kind === 'open' && (
        <div className={styles.controls}>
          <Button type="button" variant="secondary" onClick={() => void viewRef.current?.prev()}>
            {t('reader.previous')}
          </Button>
          <span className={styles.title}>{state.title ?? ''}</span>
          <Button type="button" variant="secondary" onClick={() => void viewRef.current?.next()}>
            {t('reader.next')}
          </Button>
        </div>
      )}

      {/* Hidden by class rather than by the `hidden` attribute, and that is not a style
          preference: React stringifies props on a custom element, so `hidden={false}` renders as
          `hidden="false"` — and HTML's `hidden` hides on the attribute's *presence*, whatever its
          value. The element is kept mounted either way, because unmounting it would throw away the
          book on every state change. */}
      <foliate-view
        ref={(element: FoliateView | null) => {
          viewRef.current = element;
        }}
        class={cx(styles.view, state.kind !== 'open' && styles.viewEmpty)}
      />

      {/* Which of the two walls is holding, in the one place a developer will look for it. Not a
          reader-facing string: it says nothing they can act on, and it is not translated. */}
      {policy ? (
        <p className={styles.diagnostic} data-content-frame-walls={policy.walls}>
          {policy.sandbox} · {policy.reason}
        </p>
      ) : null}
    </div>
  );
}
