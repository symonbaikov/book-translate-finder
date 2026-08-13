'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SourceLinkDto } from '@btf/contracts';
import { ApiRequestError, getEditionLinks } from '../lib/api-client';
import { COUNTRY_CHANGE_EVENT, readCountry } from '../lib/country';
import { linkTypeLabel, rightsStatusLabel, rightsStatusTone } from '../lib/link-labels';

type LinksState =
  | { kind: 'collapsed' }
  | { kind: 'loading' }
  | { kind: 'loaded'; links: SourceLinkDto[]; bookstores: SourceLinkDto[] }
  | { kind: 'error'; message: string };

export function EditionLinks({ editionId }: { editionId: string }) {
  const [state, setState] = useState<LinksState>({ kind: 'collapsed' });
  // Tracks the latest request so a country switch mid-flight can't be overwritten by the
  // slower, now-stale response of the previous country.
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setState({ kind: 'loading' });
    try {
      const result = await getEditionLinks(editionId, readCountry());
      if (requestId !== requestIdRef.current) return;
      setState({ kind: 'loaded', links: result.links, bookstores: result.bookstores });
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const message = error instanceof ApiRequestError ? error.message : 'Failed to load links.';
      setState({ kind: 'error', message });
    }
  }, [editionId]);

  // While a panel is open, changing the country refetches it — the reader sees their own
  // country's shops immediately instead of having to collapse and reopen every edition.
  useEffect(() => {
    function onCountryChange(): void {
      setState((current) => {
        if (current.kind === 'collapsed') return current;
        void load();
        return { kind: 'loading' };
      });
    }
    window.addEventListener(COUNTRY_CHANGE_EVENT, onCountryChange);
    return () => window.removeEventListener(COUNTRY_CHANGE_EVENT, onCountryChange);
  }, [load]);

  async function handleToggle(): Promise<void> {
    if (state.kind === 'loaded' || state.kind === 'loading') {
      requestIdRef.current += 1; // cancel any in-flight response
      setState({ kind: 'collapsed' });
      return;
    }
    await load();
  }

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <button
        type="button"
        className="button--secondary"
        onClick={() => void handleToggle()}
        aria-expanded={state.kind === 'loaded'}
      >
        {state.kind === 'loaded' ? 'Hide links' : 'Show links'}
      </button>
      <div aria-live="polite">
        {state.kind === 'loading' && (
          <div style={{ marginTop: '0.6rem' }} aria-label="Loading links">
            <div className="skeleton skeleton--text" style={{ width: '55%' }} />
            <div className="skeleton skeleton--text" style={{ width: '40%' }} />
          </div>
        )}
        {state.kind === 'error' && <p className="error-box">{state.message}</p>}
        {state.kind === 'loaded' && (
          <div className="animate-in">
            <LinkList links={state.links} />
            <BookstoreList bookstores={state.bookstores} />
          </div>
        )}
      </div>
    </div>
  );
}

function LinkList({ links }: { links: SourceLinkDto[] }) {
  if (links.length === 0) {
    return <p className="muted">No legal links for this edition yet.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
      {links.map((link) => (
        <li key={link.url} style={{ marginTop: '0.4rem' }}>
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            {/* The format matters as much as the fact a download exists — a reader with an
                e-reader wants EPUB, not "a download". */}
            {link.format
              ? `${linkTypeLabel(link.type)} ${link.format.toUpperCase()}`
              : linkTypeLabel(link.type)}
          </a>{' '}
          <span className={`badge badge--${rightsStatusTone(link.rightsStatus)}`}>
            {rightsStatusLabel(link.rightsStatus)}
          </span>{' '}
          <span className="muted">{link.provider}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Bookstores are shown as their own group, wording chosen carefully: these are ISBN *lookups* in
 * each shop's catalog, not verified stock — we never fetch the shop (that would be scraping), so
 * claiming availability would be a lie the UI cannot back up.
 */
function BookstoreList({ bookstores }: { bookstores: SourceLinkDto[] }) {
  if (bookstores.length === 0) return null;

  return (
    <div style={{ marginTop: '0.9rem' }}>
      <div className="muted" style={{ fontSize: '0.85em', fontWeight: 550 }}>
        Find in a bookstore
      </div>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '0.4rem 0 0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
        }}
      >
        {bookstores.map((store) => (
          <li key={store.url}>
            <a className="store-chip" href={store.url} target="_blank" rel="noopener noreferrer">
              {store.providerName ?? store.provider}
            </a>
          </li>
        ))}
      </ul>
      <p className="muted" style={{ fontSize: '0.78em', margin: '0.5rem 0 0' }}>
        Searches each store by ISBN — availability and price are shown by the store itself.
      </p>
    </div>
  );
}
