'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SearchHit } from '@btf/contracts';
import Link from 'next/link';
import { ApiRequestError, searchWorks } from '../lib/api-client';

type SearchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'found'; results: SearchHit[] }
  | { kind: 'pending'; attempt: number }
  | { kind: 'not_found' }
  | { kind: 'error'; message: string };

/** Caps the lazy-backfill poll loop (ADR-0003) — a "reasonable timeout" per docs/plan.md §1.5,
 * not an infinite wait. ~8 attempts at the server's own pollAfterMs (3s) is ~24s. */
const MAX_POLL_ATTEMPTS = 8;

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
        setState({
          kind: 'error',
          message:
            'Поиск в источниках занимает необычно много времени. Попробуйте обновить страницу позже.',
        });
      } else {
        setState({ kind: 'pending', attempt });
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const message =
        error instanceof ApiRequestError ? error.message : 'Не удалось выполнить поиск.';
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

  function handleSubmit(event: React.FormEvent): void {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setState({ kind: 'loading' });
    void runSearch(trimmed, 0);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="search-query">Название и автор книги</label>
          <input
            id="search-query"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Например: Война и мир Толстой"
            autoComplete="off"
          />
        </div>
        <p style={{ marginTop: '0.75rem' }}>
          <button type="submit" disabled={state.kind === 'loading' || !query.trim()}>
            Искать
          </button>
        </p>
      </form>

      <div aria-live="polite" style={{ marginTop: '1.5rem' }}>
        <SearchResults state={state} />
      </div>
    </div>
  );
}

function SearchResults({ state }: { state: SearchState }) {
  switch (state.kind) {
    case 'idle':
      return null;
    case 'loading':
      return <p className="muted">Ищем…</p>;
    case 'pending':
      return <p className="muted">Не нашли в своей базе — ищем в источниках…</p>;
    case 'not_found':
      return <p>Ничего не найдено. Попробуйте уточнить название или автора.</p>;
    case 'error':
      return <p className="error-box">{state.message}</p>;
    case 'found':
      return (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {state.results.map((hit) => (
            <li key={hit.id} className="card">
              <Link href={`/works/${hit.id}`}>
                <strong>{hit.originalTitle}</strong>
              </Link>
              <div className="muted">
                {hit.author}
                {hit.firstPublishedYear ? `, ${hit.firstPublishedYear}` : ''}
              </div>
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}
