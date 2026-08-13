'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SearchHit } from '@btf/contracts';
import Link from 'next/link';
import { ApiRequestError, searchWorks } from '../lib/api-client';
import { CoverImage, CoverSkeleton } from './CoverImage';

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
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>({ kind: 'idle' });
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
      const message = error instanceof ApiRequestError ? error.message : 'Search failed.';
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
    setState({ kind: 'loading' });
    void runSearch(trimmed, 0);
  }, [query, runSearch]);

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    startSearch();
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="search-query">Book title and author</label>
          <input
            id="search-query"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. War and Peace Tolstoy"
            autoComplete="off"
          />
        </div>
        <p style={{ marginTop: '0.75rem' }}>
          <button type="submit" disabled={state.kind === 'loading' || !query.trim()}>
            Search
          </button>
        </p>
      </form>

      <div aria-live="polite" style={{ marginTop: '1.5rem' }}>
        <SearchResults state={state} onRetry={startSearch} />
      </div>
    </div>
  );
}

/** Shimmering stand-ins shaped like real result cards — the list "arrives" instead of flashing
 * from a bare status line into content. */
function ResultSkeletons({ count }: { count: number }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="card">
          <div className="media-row">
            <CoverSkeleton />
            <div className="media-row__body">
              <div className="skeleton skeleton--text" style={{ width: '60%' }} />
              <div className="skeleton skeleton--text" style={{ width: '35%' }} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function SearchingIndicator({ text }: { text: string }) {
  return (
    <div>
      <p className="muted" style={{ marginBottom: '1rem' }}>
        {text}
        <span className="searching-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </p>
      <ResultSkeletons count={3} />
    </div>
  );
}

function SearchResults({ state, onRetry }: { state: SearchState; onRetry: () => void }) {
  switch (state.kind) {
    case 'idle':
      return null;
    case 'loading':
      return <SearchingIndicator text="Searching" />;
    case 'pending':
      // A first-time sync of a popular book legitimately takes a while (several sequential
      // source requests) — after ~30s of silence, say so instead of looking frozen.
      return (
        <SearchingIndicator
          text={
            state.attempt < 10
              ? 'Not in our database yet — checking the sources'
              : 'Still searching: the first request for a book gathers data from the sources, which can take up to a couple of minutes'
          }
        />
      );
    case 'not_found':
      return <p>Nothing found. Try refining the title or author.</p>;
    case 'timed_out':
      return (
        <div className="error-box">
          <p style={{ margin: 0 }}>
            The sources are responding slowly and we have no data yet. The background sync may have
            already finished — try again.
          </p>
          <p style={{ margin: '0.75rem 0 0' }}>
            <button type="button" onClick={onRetry}>
              Try again
            </button>
          </p>
        </div>
      );
    case 'error':
      return <p className="error-box">{state.message}</p>;
    case 'found':
      return (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {state.results.map((hit) => (
            <li key={hit.id} className="card animate-in">
              <div className="media-row">
                <CoverImage src={hit.coverUrl} alt="" width={56} height={84} />
                <div className="media-row__body">
                  <Link href={`/works/${hit.id}`}>
                    <strong>{hit.originalTitle}</strong>
                  </Link>
                  <div className="muted">
                    {hit.author}
                    {hit.firstPublishedYear ? `, ${hit.firstPublishedYear}` : ''}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}
