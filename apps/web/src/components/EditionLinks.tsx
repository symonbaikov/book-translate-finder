'use client';

import { useState } from 'react';
import type { SourceLinkDto } from '@btf/contracts';
import { ApiRequestError, getEditionLinks } from '../lib/api-client';
import { linkTypeLabel, rightsStatusLabel, rightsStatusTone } from '../lib/link-labels';

type LinksState =
  | { kind: 'collapsed' }
  | { kind: 'loading' }
  | { kind: 'loaded'; links: SourceLinkDto[] }
  | { kind: 'error'; message: string };

export function EditionLinks({ editionId }: { editionId: string }) {
  const [state, setState] = useState<LinksState>({ kind: 'collapsed' });

  async function handleToggle(): Promise<void> {
    if (state.kind === 'loaded' || state.kind === 'loading') {
      setState({ kind: 'collapsed' });
      return;
    }
    setState({ kind: 'loading' });
    try {
      const result = await getEditionLinks(editionId);
      setState({ kind: 'loaded', links: result.links });
    } catch (error) {
      const message =
        error instanceof ApiRequestError ? error.message : 'Не удалось загрузить ссылки.';
      setState({ kind: 'error', message });
    }
  }

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <button
        type="button"
        onClick={() => void handleToggle()}
        aria-expanded={state.kind === 'loaded'}
      >
        {state.kind === 'loaded' ? 'Скрыть ссылки' : 'Показать ссылки'}
      </button>
      <div aria-live="polite">
        {state.kind === 'loading' && <p className="muted">Загружаем ссылки…</p>}
        {state.kind === 'error' && <p className="error-box">{state.message}</p>}
        {state.kind === 'loaded' && <LinkList links={state.links} />}
      </div>
    </div>
  );
}

function LinkList({ links }: { links: SourceLinkDto[] }) {
  if (links.length === 0) {
    return <p className="muted">Легальных ссылок для этого издания пока нет.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
      {links.map((link) => (
        <li key={link.url} style={{ marginTop: '0.4rem' }}>
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            {linkTypeLabel(link.type)}
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
