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
  readBook,
  readBookFile,
  rememberBook,
  renderFirstPage,
  titleOf,
  withBookmark,
  withBookmarkNote,
  withPosition,
  withoutBookmark,
  AcquisitionError,
  type AcquiredBook,
  type Bookmark,
  type ContentFramePolicy,
  type FoliateRelocateDetail,
  type FoliateView,
  type LibraryEntry,
} from '@golden/reader';
import { useT } from '../../i18n/I18nProvider';
import { outcomeOfWrite } from '../../lib/setting-change';
import { useSettingChangeToast } from '../../lib/settings-toast';
import { takeHandoff } from '../../lib/reader-handoff';
import { Button, cx } from '../../ui';
import { ReaderBookmarks } from './ReaderBookmarks';
import { ReaderLibrary } from './ReaderLibrary';
import styles from './BookReader.module.css';

type State =
  | { kind: 'idle' }
  | { kind: 'opening'; host?: string }
  | { kind: 'open'; book: AcquiredBook; title: string | null; record: LibraryEntry }
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
  /** Percent through the book when a stored position was restored, for one line of feedback. */
  const [resumed, setResumed] = useState<number | null>(null);
  /**
   * The record as it stands, outside React's state.
   *
   * `relocate` fires far more often than a render should, and each one needs the *latest* record to
   * merge into. Reading it from state inside that listener would merge into whatever the closure
   * captured — the classic way a position saves itself over an older one.
   */
  const recordRef = useRef<LibraryEntry | null>(null);
  /**
   * The locator of the page on screen, for bookmarking it.
   *
   * Held twice on purpose. The ref is what the `relocate` listener reads, because that listener must
   * never see a stale closure; the state is what the "bookmark this page" button is enabled from,
   * because a ref changing does not re-render anything — and a button that stays disabled until the
   * next page turn is how this was first shipped.
   */
  const hereRef = useRef<{ cfi: string; fraction: number } | null>(null);
  const [here, setHere] = useState<{ cfi: string; fraction: number } | null>(null);

  const rememberHere = useCallback((position: { cfi: string; fraction: number } | null) => {
    hereRef.current = position;
    setHere(position);
  }, []);

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
    async (book: AcquiredBook): Promise<void> => {
      await loadFoliate();
      const view = viewRef.current;
      if (!view) throw new Error('the reading surface is not mounted');

      // What this browser already knows about *this file* — by content hash, so a book fetched from
      // one mirror today and opened from disk tomorrow is the same book with the same position
      // (identity.ts). A book it has never seen starts a fresh record.
      const known = await readBook(book.hash);
      await view.open(asFoliateFile(book));
      const title = titleOf(view.book?.metadata) ?? known?.title ?? null;
      await renderFirstPage(view, known?.position.cfi ?? null);

      const record: LibraryEntry = known
        ? { ...known, title, openedAt: Date.now(), byteLength: book.bytes.byteLength }
        : libraryEntryOf(book, title, Date.now());
      await rememberBook(record);
      recordRef.current = record;
      // Seeded from the record rather than waited for: `goTo` at open time does not emit a
      // `relocate`, so without this the reader cannot bookmark the page they are looking at until
      // they turn one.
      rememberHere(
        record.position.cfi
          ? { cfi: record.position.cfi, fraction: record.position.fraction }
          : null,
      );
      refreshLibrary();
      setState({ kind: 'open', book, title, record });
      if (known?.position.cfi) setResumed(Math.round(known.position.fraction * 100));
    },
    [refreshLibrary, rememberHere],
  );

  const openFile = useCallback(
    async (file: File): Promise<void> => {
      setState({ kind: 'opening' });
      try {
        await render(await acquireFromFile(file));
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
        await render(await acquireFromUrl(url));
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
        await render(await acquireFromStored(bytes, entry.hash));
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

  /**
   * Save the record, and say something only when the browser refused.
   *
   * A position that stored correctly is not news — the reader did not ask for it and there is
   * nothing to confirm. A position that did *not* store is a book that opens at page one tomorrow,
   * which they would otherwise discover then rather than now (CLAUDE.md, `unstored`).
   */
  const persist = useCallback(
    async (next: LibraryEntry, announceFailureFor?: string): Promise<boolean> => {
      recordRef.current = next;
      const stored = await rememberBook(next);
      if (!stored && announceFailureFor) {
        announce({
          setting: 'reader.position',
          outcome: 'unstored',
          title: t('settings.reader.positionTitle'),
          detail: t('settings.reader.positionUnstored', { title: announceFailureFor }),
        });
      }
      return stored;
    },
    [announce, t],
  );

  // Where the reader is, as the renderer reports it.
  //
  // `withPosition` returns the *same object* when nothing moved, which is what keeps this from
  // writing to IndexedDB several times per layout pass: the renderer emits `relocate` for every
  // pass, most of them repeating the position it already had.
  const openTitle = state.kind === 'open' ? (state.title ?? t('reader.untitled')) : null;
  useEffect(() => {
    const view = viewRef.current;
    if (!view || !openTitle) return;

    let announced = false;
    function onRelocate(event: Event): void {
      const detail = (event as CustomEvent<FoliateRelocateDetail>).detail;
      const cfi = detail?.cfi ?? null;
      const fraction = typeof detail?.fraction === 'number' ? detail.fraction : 0;
      rememberHere(cfi ? { cfi, fraction } : null);

      const current = recordRef.current;
      if (!current) return;
      const next = withPosition(current, { cfi, fraction }, Date.now());
      if (next === current) return;
      void persist(next, announced ? undefined : (openTitle ?? undefined)).then((stored) => {
        // Said once per book, not once per page turn: the reason does not change, and a popup on
        // every turn is wallpaper.
        if (!stored) announced = true;
      });
    }

    view.addEventListener('relocate', onRelocate);
    return () => view.removeEventListener('relocate', onRelocate);
  }, [openTitle, persist, rememberHere]);

  async function addBookmark(): Promise<void> {
    const here = hereRef.current;
    const current = recordRef.current;
    if (state.kind !== 'open' || !here || !current) return;

    const percent = Math.round(here.fraction * 100);
    const title = state.title ?? t('reader.untitled');
    const next = withBookmark(
      current,
      { cfi: here.cfi, label: t('reader.bookmarkAt', { percent }) },
      Date.now(),
    );
    const stored = await persist(next);
    announce({
      setting: 'reader.bookmark',
      outcome: outcomeOfWrite(stored, 'set'),
      title: t('settings.reader.bookmarkTitle'),
      detail: t('settings.reader.bookmarkAdded', { percent, title }),
    });
    if (stored) setState({ ...state, record: next });
  }

  async function removeBookmark(bookmark: Bookmark): Promise<void> {
    const current = recordRef.current;
    if (state.kind !== 'open' || !current) return;

    const next = withoutBookmark(current, bookmark.cfi);
    const stored = await persist(next);
    announce({
      setting: 'reader.bookmark',
      outcome: outcomeOfWrite(stored, 'clear'),
      title: t('settings.reader.bookmarkTitle'),
      detail: t('settings.reader.bookmarkRemoved', { title: state.title ?? t('reader.untitled') }),
    });
    if (stored) setState({ ...state, record: next });
  }

  async function noteBookmark(bookmark: Bookmark, note: string): Promise<void> {
    const current = recordRef.current;
    if (state.kind !== 'open' || !current) return;

    const next = withBookmarkNote(current, bookmark.cfi, note);
    if (next === current) return;
    const stored = await persist(next);
    announce({
      setting: 'reader.bookmark',
      outcome: outcomeOfWrite(stored, note ? 'set' : 'clear'),
      title: t('settings.reader.bookmarkTitle'),
      detail: t('settings.reader.noteSaved', { title: state.title ?? t('reader.untitled') }),
    });
    if (stored) setState({ ...state, record: next });
  }

  async function toggleKeepFile(keep: boolean): Promise<void> {
    if (state.kind !== 'open') return;
    const title = state.title ?? t('reader.untitled');
    const stored = keep
      ? await keepBookFile(state.book.hash, state.book.bytes)
      : await forgetBookFile(state.book.hash);
    const next = { ...state.record, keepFile: stored ? keep : state.record.keepFile };
    recordRef.current = next;

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
    setState({ ...state, record: next });
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

      {state.kind === 'open' && resumed !== null && (
        <p className={styles.resumed} aria-live="polite">
          {t('reader.resumed', { percent: resumed })}
        </p>
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
        <ReaderBookmarks
          bookmarks={state.record.bookmarks}
          canAdd={here !== null}
          onAdd={() => void addBookmark()}
          onGo={(bookmark) => void viewRef.current?.goTo(bookmark.cfi)}
          onRemove={(bookmark) => void removeBookmark(bookmark)}
          onNote={(bookmark, note) => void noteBookmark(bookmark, note)}
        />
      )}

      {state.kind === 'open' && (
        <label className={styles.keep}>
          <input
            type="checkbox"
            checked={state.record.keepFile}
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
