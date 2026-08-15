'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SearchHit } from '@golden/contracts';
import Link from 'next/link';
import { useSession } from './SessionProvider';
import { useT } from '../i18n/I18nProvider';
import { ApiRequestError, searchWorks } from '../lib/api-client';
import { AddonSearchResults } from './AddonSearchResults';
import { BookCard, BookCardSkeleton } from './BookCard';
import { Button, ChipToggle, Cluster, Field, PosterGrid, TextInput } from '../ui';
import type { Translate } from '../i18n/dictionary';
import styles from './SearchBox.module.css';

type SearchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'found'; results: SearchHit[] }
  | { kind: 'pending'; attempt: number }
  | { kind: 'not_found' }
  | { kind: 'timed_out' }
  | { kind: 'error'; message: string };

/**
 * Caps the lazy-backfill poll loop (ADR-0003) — a "reasonable timeout" per docs/plan.md §1.5,
 * not an infinite wait. 30 attempts at 3s ≈ 90s: live testing in Phase 3 found a first-time sync
 * of a heavily-reprinted book makes several sequential source requests at ~9–22s each (observed
 * real Open Library latency, docs/research/coverage-phase0.md), so the previous ~24s cap gave up
 * on syncs that were about to succeed. Giving up here is not a dead end either — `timed_out`
 * renders a retry button, and the backfill keeps running server-side regardless.
 */
const MAX_POLL_ATTEMPTS = 30;

export function SearchBox() {
  const t = useT();
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>({ kind: 'idle' });
  const [submitted, setSubmitted] = useState('');
  // Not reset between searches — a sticky preference, same as the language/year filter on the
  // work detail page, rather than a one-shot per query.
  const [freeOnly, setFreeOnly] = useState(false);
  const requestIdRef = useRef(0);

  const runSearch = useCallback(async (q: string, attempt: number) => {
    const requestId = ++requestIdRef.current;
    try {
      const result = await searchWorks(q);
      if (requestId !== requestIdRef.current) return; // a newer search superseded this one

      if (result.status === 'found') {
        setState({ kind: 'found', results: result.results });
      } else if (result.status === 'not_found') {
        setState({ kind: 'not_found' });
      } else if (attempt >= MAX_POLL_ATTEMPTS) {
        setState({ kind: 'timed_out' });
      } else {
        setState({ kind: 'pending', attempt });
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const message = error instanceof ApiRequestError ? error.message : t('search.failed');
      setState({ kind: 'error', message });
    }
  }, []);

  useEffect(() => {
    if (state.kind !== 'pending') return;
    const timer = setTimeout(() => {
      void runSearch(query, state.attempt + 1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [state, query, runSearch]);

  const startSearch = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    // Kept apart from `query`, which changes on every keystroke: the addons are asked about what
    // was actually submitted, not about what is currently in the box.
    setSubmitted(trimmed);
    setState({ kind: 'loading' });
    void runSearch(trimmed, 0);
  }, [query, runSearch]);

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    startSearch();
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <Field
            label={t('home.searchLabel')}
            htmlFor="search-query"
            visuallyHidden
            className={styles.input}
          >
            <TextInput
              id="search-query"
              type="search"
              size="hero"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('home.searchPlaceholder')}
              autoComplete="off"
            />
          </Field>
          <Button
            type="submit"
            variant="primary"
            size="xl"
            disabled={state.kind === 'loading' || !query.trim()}
          >
            {t('home.searchButton')}
          </Button>
        </div>
      </form>

      <div aria-live="polite" className={styles.results}>
        <SearchResults
          state={state}
          onRetry={startSearch}
          t={t}
          freeOnly={freeOnly}
          onToggleFreeOnly={() => setFreeOnly((v) => !v)}
        />
      </div>

      {/* Below the instance's own results and never merged with them: two lists, each saying where
          it came from (docs/adr/0010-addon-engine.md §7). It renders nothing at all when the reader
          has no addons, which is the default. */}
      <AddonSearchResults query={submitted} />
    </div>
  );
}

/** Shimmering stand-ins shaped like real result cards — the grid "arrives" instead of flashing
 * from a bare status line into content. */
function ResultSkeletons({ count }: { count: number }) {
  return (
    <PosterGrid minWidth="150px">
      {Array.from({ length: count }, (_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </PosterGrid>
  );
}

function SearchingIndicator({ text }: { text: string }) {
  return (
    <div>
      <p className={styles.status}>
        {text}
        <span className={styles.dots} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </p>
      <ResultSkeletons count={6} />
    </div>
  );
}

function SearchResults({
  state,
  onRetry,
  t,
  freeOnly,
  onToggleFreeOnly,
}: {
  state: SearchState;
  onRetry: () => void;
  t: Translate;
  freeOnly: boolean;
  onToggleFreeOnly: () => void;
}) {
  switch (state.kind) {
    case 'idle':
      return null;
    case 'loading':
      return <SearchingIndicator text={t('search.searching')} />;
    case 'pending':
      // A first-time sync of a popular book legitimately takes a while (several sequential
      // source requests) — after ~30s of silence, say so instead of looking frozen.
      return (
        <SearchingIndicator
          text={state.attempt < 10 ? t('search.pending') : t('search.pendingLong')}
        />
      );
    case 'not_found':
      return <p className={styles.notice}>{t('search.notFoundHint')}</p>;
    case 'timed_out':
      return (
        <div className="error-box">
          <p style={{ margin: 0 }}>{t('search.timedOut')}</p>
          <p className={styles.retry}>
            <Button type="button" variant="secondary" onClick={onRetry}>
              {t('search.retry')}
            </Button>
          </p>
        </div>
      );
    case 'error':
      return <p className="error-box">{state.message}</p>;
    case 'found': {
      const freeCount = state.results.filter((hit) => hit.hasFreeCopy).length;
      const visible = freeOnly ? state.results.filter((hit) => hit.hasFreeCopy) : state.results;
      return (
        <>
          <SignInPrompt />
          <Cluster className={styles.filters}>
            <ChipToggle selected={freeOnly} count={freeCount} onClick={onToggleFreeOnly}>
              {t('search.freeOnlyToggle')}
            </ChipToggle>
          </Cluster>
          {visible.length === 0 ? (
            <p className={styles.notice}>{t('search.noFreeResults')}</p>
          ) : (
            <PosterGrid minWidth="150px">
              {visible.map((hit, index) => (
                <BookCard
                  key={hit.id}
                  href={`/works/${hit.id}`}
                  title={hit.originalTitle}
                  author={hit.author}
                  coverUrl={hit.coverUrl}
                  // The first row is above the fold on every screen size we support.
                  priority={index < 6}
                  meta={
                    hit.firstPublishedYear ? `${hit.author}, ${hit.firstPublishedYear}` : hit.author
                  }
                />
              ))}
            </PosterGrid>
          )}
        </>
      );
    }
    default:
      return null;
  }
}

/**
 * The invitation to sign in, shown once results exist — at the moment the reader has something
 * worth keeping, not on an empty page where it is just noise. It is an offer, not a gate: nothing
 * on this site requires an account, and the wording says what they gain rather than what they are
 * missing. Signed-in readers never see it.
 */
function SignInPrompt() {
  const { user, loading } = useSession();
  const t = useT();
  if (loading || user) return null;

  return (
    <p className={styles.signIn}>
      <Link href="/login">{t('nav.signIn')}</Link> {t('search.signInPrompt')}
    </p>
  );
}
