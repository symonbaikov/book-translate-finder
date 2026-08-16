'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  acquireFromFile,
  acquireFromStored,
  acquireFromUrl,
  asFoliateFile,
  forgetBookFile,
  installContentFramePolicy,
  keepBookFile,
  libraryEntryOf,
  listLibrary,
  loadFoliate,
  readBookFile,
  rememberBook,
  renderFirstPage,
  titleOf,
  AcquisitionError,
  type AcquiredBook,
  type ContentFramePolicy,
  type FoliateView,
  type LibraryEntry,
} from '@golden/reader';
import { useT } from '../../i18n/I18nProvider';
import { outcomeOfWrite } from '../../lib/setting-change';
import { useSettingChangeToast } from '../../lib/settings-toast';
import { takeHandoff } from '../../lib/reader-handoff';
import { Button, cx } from '../../ui';
import { ReaderLibrary } from './ReaderLibrary';
import styles from './BookReader.module.css';

type State =
  | { kind: 'idle' }
  | { kind: 'opening'; host?: string }
  | { kind: 'open'; book: AcquiredBook; title: string | null; keepFile: boolean }
  /** The source would not hand the file over. Not an error message — a fork in the road. */
  | { kind: 'blocked'; host: string; url: string }
  | { kind: 'failed'; reason: string };

/**
 * The reading surface, and the four ways a book reaches it.
 *
 * A URL the reader followed from a work page, a file they picked, a file they dropped, or bytes this
 * browser kept for them. All four end in the same place, and none of them involves this instance:
 * there is no API client in this component and `pnpm boundaries` refuses the import, because "just
 * the resume position" is how the endpoint that would end ADR-0013 §1 gets written.
 *
 * The fifth way — asking this site to fetch the file — does not exist and will not be added. When a
 * source declines to share with the browser, the `blocked` state says so and offers the two paths
 * that work; see ADR-0013 §7 for why an honest dead end beats a proxy.
 */
export function BookReader() {
  const t = useT();
  const announce = useSettingChangeToast();
  const viewRef = useRef<FoliateView | null>(null);
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [policy, setPolicy] = useState<ContentFramePolicy | null>(null);
  const [library, setLibrary] = useState<readonly LibraryEntry[]>([]);
  const [dragging, setDragging] = useState(false);

  const refreshLibrary = useCallback(() => {
    void listLibrary().then(setLibrary);
  }, []);

  // The probe runs once, before any book is opened: the frame is created during `open()`, and an
  // attribute decided after that would apply to the next book instead of this one.
  useEffect(() => {
    let live = true;
    void installContentFramePolicy().then((installed) => {
      if (live) setPolicy(installed);
    });
    refreshLibrary();
    return () => {
      live = false;
    };
  }, [refreshLibrary]);

  const render = useCallback(
    async (book: AcquiredBook, keepFile: boolean): Promise<void> => {
      await loadFoliate();
      const view = viewRef.current;
      if (!view) throw new Error('the reading surface is not mounted');
      await view.open(asFoliateFile(book));
      await renderFirstPage(view);
      const title = titleOf(view.book?.metadata);
      // Recorded on every open so the reader can find their way back. The *file* is not kept — that
      // is a separate, explicit choice (ADR-0013 §4), so an existing entry keeps its own answer.
      await rememberBook({ ...libraryEntryOf(book, title, Date.now()), keepFile });
      refreshLibrary();
      setState({ kind: 'open', book, title, keepFile });
    },
    [refreshLibrary],
  );

  const openFile = useCallback(
    async (file: File): Promise<void> => {
      setState({ kind: 'opening' });
      try {
        await render(await acquireFromFile(file), false);
      } catch (error) {
        setState({ kind: 'failed', reason: describe(error) });
      }
    },
    [render],
  );

  const openUrl = useCallback(
    async (url: string): Promise<void> => {
      const host = hostOf(url);
      setState({ kind: 'opening', host });
      try {
        await render(await acquireFromUrl(url), false);
      } catch (error) {
        // `unreachable` is the CORS case *and* the offline case — the browser reports both as the
        // same opaque failure, and this application refuses to guess between them (errors.ts).
        if (error instanceof AcquisitionError && error.reason === 'unreachable') {
          setState({ kind: 'blocked', host, url });
          return;
        }
        setState({ kind: 'failed', reason: describe(error) });
      }
    },
    [render],
  );

  const openKept = useCallback(
    async (entry: LibraryEntry): Promise<void> => {
      setState({ kind: 'opening' });
      try {
        const bytes = await readBookFile(entry.hash);
        // A browser under storage pressure evicts silently, so "the entry says kept" and "the bytes
        // are still there" are two different facts.
        if (!bytes) throw new Error('this browser no longer has the file');
        await render(await acquireFromStored(bytes, entry.hash), true);
      } catch (error) {
        setState({ kind: 'failed', reason: describe(error) });
      }
    },
    [render],
  );

  // A link from a work page hands the address over in `sessionStorage`, a shared link in the URL
  // fragment. Never a query string: that would put the book's address in this instance's access log
  // before any of this code ran (ADR-0013 §1, lib/reader-handoff.ts).
  useEffect(() => {
    const handed = takeHandoff();
    if (handed) void openUrl(handed);
  }, [openUrl]);

  async function toggleKeepFile(keep: boolean): Promise<void> {
    if (state.kind !== 'open') return;
    const title = state.title ?? t('reader.untitled');
    const stored = keep
      ? await keepBookFile(state.book.hash, state.book.bytes)
      : await forgetBookFile(state.book.hash);

    announce({
      setting: 'reader.keepFile',
      outcome: outcomeOfWrite(stored, keep ? 'set' : 'clear'),
      title: t('settings.reader.title'),
      detail: keep
        ? t('settings.reader.kept', { title })
        : t('settings.reader.forgotten', { title }),
    });
    // Snapped back to what storage actually did rather than to what was clicked: a quota failure
    // must not leave a checkbox claiming the file is kept.
    setState({ ...state, keepFile: stored ? keep : state.keepFile });
    refreshLibrary();
  }

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
    <div
      className={styles.wrap}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) void openFile(file);
      }}
    >
      {state.kind !== 'open' && (
        <div className={cx(styles.intro, dragging && styles.dragging)}>
          <p className={styles.privacy}>{t('reader.privacy')}</p>
          <label className={styles.picker}>
            <span className={styles.pickerLabel}>{t('reader.chooseFile')}</span>
            <input
              type="file"
              accept=".epub,.fb2,.fbz,.mobi,.azw3,.cbz"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void openFile(file);
              }}
            />
          </label>
          <p className={styles.formats}>
            {t('reader.dropHere')} — {t('reader.formats')}
          </p>

          {state.kind === 'opening' && (
            <p aria-live="polite">
              {state.host ? t('reader.fetching', { host: state.host }) : t('reader.loading')}
            </p>
          )}
          {state.kind === 'failed' && (
            <p className="error-box">{t('reader.failed', { reason: state.reason })}</p>
          )}
          {state.kind === 'blocked' && <Blocked host={state.host} url={state.url} />}

          <ReaderLibrary
            entries={library}
            onOpen={(entry) => void openKept(entry)}
            onChanged={refreshLibrary}
          />
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

      {/* Hidden by class rather than by the `hidden` attribute, and that is not a style preference:
          React stringifies props on a custom element, so `hidden={false}` renders as
          `hidden="false"` — and HTML's `hidden` hides on the attribute's *presence*, whatever its
          value. The element stays mounted either way, because unmounting it would throw away the
          book on every state change. */}
      <foliate-view
        ref={(element: FoliateView | null) => {
          viewRef.current = element;
        }}
        class={cx(styles.view, state.kind !== 'open' && styles.viewEmpty)}
      />

      {state.kind === 'open' && (
        <label className={styles.keep}>
          <input
            type="checkbox"
            checked={state.keepFile}
            onChange={(event) => void toggleKeepFile(event.target.checked)}
          />
          <span>
            {t('reader.keepFile')}
            <span className={styles.formats}> {t('reader.keepFileHint')}</span>
          </span>
        </label>
      )}

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

/**
 * The dead end, written as a fork in the road rather than as an apology.
 *
 * There is deliberately no "try again through the site" button here. The only thing behind one would
 * be a server-side fetch — the single route ADR-0013 forbids — and offering it would make every
 * sentence above it untrue.
 */
function Blocked({ host, url }: { host: string; url: string }) {
  const t = useT();
  return (
    <div className={styles.blocked}>
      <h2 className={styles.blockedTitle}>{t('reader.blockedTitle', { host })}</h2>
      <p>{t('reader.blockedBody')}</p>
      <p>
        <a href={url} download rel="noopener noreferrer">
          {t('reader.blockedDownload', { host })}
        </a>{' '}
        — {t('reader.blockedOpenHere')}
      </p>
      <p className={styles.formats}>{t('reader.blockedAddon')}</p>
    </div>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
