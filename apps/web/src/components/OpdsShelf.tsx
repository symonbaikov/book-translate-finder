'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  OpdsClient,
  isDirectDownload,
  type OpdsAcquisition,
  type OpdsEntry,
  type OpdsFeed,
} from '@golden/plugins';
import type { OpdsFeedListResponse } from '@golden/contracts';
import { getOpdsFeed, listOpdsFeeds } from '../lib/api-client';
import { addFeed, listFeeds, removeFeed, type StoredFeed } from '../lib/opds-feeds';
import { useT } from '../i18n/I18nProvider';
import type { Translate } from '../i18n/dictionary';
import { outcomeOfWrite } from '../lib/setting-change';
import { useSettingChangeToast, type AnnounceSettingChange } from '../lib/settings-toast';
import { tourTarget } from '../lib/tour-targets';

/**
 * Module A in the page.
 *
 * Two kinds of catalog sit side by side and are fetched down completely different paths, which is
 * the whole design (docs/adr/0007):
 *
 * - the catalogs shipped with the app go through `/api/opds/feeds/:id`, because Project Gutenberg
 *   and Standard Ebooks send no CORS headers and a browser cannot read them at all;
 * - the reader's own servers are fetched **here**, by this component, because they usually live on
 *   a private address our backend cannot route to — and because their URL and password are not
 *   ours to hold.
 *
 * Acquisition links are labelled by what the reader will actually get. A link that costs money, or
 * hands over a DRM licence instead of a book, does not get a plain "Download" button; that would
 * misinform, which the legal policy treats as a defect (docs/legal-policy.md I-4).
 */

type Source = { kind: 'built-in'; id: string; name: string } | { kind: 'own'; feed: StoredFeed };

type FeedState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'loaded'; feed: OpdsFeed }
  | { kind: 'error'; message: string };

export function OpdsShelf() {
  const t = useT();
  const [builtIn, setBuiltIn] = useState<OpdsFeedListResponse['feeds']>([]);
  const [own, setOwn] = useState<StoredFeed[]>([]);
  const [selected, setSelected] = useState<Source | null>(null);
  const [state, setState] = useState<FeedState>({ kind: 'idle' });
  const clientRef = useRef(new OpdsClient());
  const requestIdRef = useRef(0);
  const announce = useSettingChangeToast();

  useEffect(() => {
    setOwn(listFeeds());
    // A failure here is not worth an error box: the reader's own catalogs still work, and the
    // built-in section simply stays empty.
    void listOpdsFeeds()
      .then((response) => setBuiltIn(response.feeds))
      .catch(() => setBuiltIn([]));
  }, []);

  const open = useCallback(
    async (source: Source, href?: string | null) => {
      const requestId = ++requestIdRef.current;
      setSelected(source);
      setState({ kind: 'loading' });
      try {
        const feed =
          source.kind === 'built-in'
            ? ((await getOpdsFeed(source.id, href)) as OpdsFeed)
            : await clientRef.current.fetchFeed({
                url: href ?? source.feed.url,
                ...(source.feed.username
                  ? {
                      credentials: {
                        username: source.feed.username,
                        password: source.feed.password ?? '',
                      },
                    }
                  : {}),
              });
        if (requestId !== requestIdRef.current) return;
        setState({ kind: 'loaded', feed });
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        // A browser fetch that fails cross-origin reports nothing useful — by design, for
        // security. Saying so beats echoing "Failed to fetch", which explains nothing.
        setState({
          kind: 'error',
          message:
            source.kind === 'own'
              ? t('shelf.unreachable')
              : error instanceof Error
                ? error.message
                : t('links.failed'),
        });
      }
    },
    [t],
  );

  return (
    <div>
      <p className="muted">{t('shelf.intro')}</p>

      <section style={{ marginTop: '1rem' }} {...tourTarget('shelfCatalogs')}>
        <h2>{t('shelf.openCatalogs')}</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {builtIn.map((feed) => (
            <li key={feed.id} style={{ marginTop: '0.3rem' }}>
              <button
                type="button"
                className="button--secondary"
                onClick={() => void open({ kind: 'built-in', id: feed.id, name: feed.name })}
              >
                {feed.name}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h2>{t('shelf.yourCatalogs')}</h2>
        {own.length === 0 && <p className="muted">{t('shelf.noCatalogs')}</p>}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {own.map((feed) => (
            <li key={feed.id} style={{ marginTop: '0.3rem' }}>
              <button
                type="button"
                className="button--secondary"
                onClick={() => void open({ kind: 'own', feed })}
              >
                {feed.name}
              </button>{' '}
              <button
                type="button"
                className="button--secondary"
                onClick={() => {
                  const persisted = removeFeed(feed.id);
                  setOwn(listFeeds());
                  if (selected?.kind === 'own' && selected.feed.id === feed.id) {
                    setSelected(null);
                    setState({ kind: 'idle' });
                  }
                  // Removal takes a stored password with it, which is the part worth stating:
                  // it is the reason someone removes a catalog on a shared machine.
                  announce({
                    setting: 'opds-catalogs',
                    outcome: outcomeOfWrite(persisted, 'clear'),
                    title: t('settings.catalogs.title'),
                    detail: t('settings.catalogs.removed', { name: feed.name }),
                  });
                }}
              >
                {t('shelf.remove')}
              </button>
            </li>
          ))}
        </ul>
        <AddFeedForm onAdded={() => setOwn(listFeeds())} t={t} announce={announce} />
      </section>

      <div aria-live="polite">
        {state.kind === 'loading' && <p className="muted">{t('shelf.loading')}</p>}
        {state.kind === 'error' && <p className="error-box">{state.message}</p>}
        {state.kind === 'loaded' && selected && (
          <FeedView feed={state.feed} t={t} onNavigate={(href) => void open(selected, href)} />
        )}
      </div>
    </div>
  );
}

function AddFeedForm({
  onAdded,
  t,
  announce,
}: {
  onAdded: () => void;
  t: Translate;
  announce: AnnounceSettingChange;
}) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      style={{ marginTop: '0.8rem', display: 'grid', gap: '0.4rem', maxWidth: '28rem' }}
      onSubmit={(event) => {
        event.preventDefault();
        try {
          const { feed, persisted } = addFeed({
            name,
            url,
            ...(username ? { username } : {}),
            ...(password ? { password } : {}),
          });
          setName('');
          setUrl('');
          setUsername('');
          setPassword('');
          setError(null);
          onAdded();
          // The form empties itself on success, so the popup is what tells the reader *where*
          // the address and any password went — the one thing this feature has to be clear about.
          announce({
            setting: 'opds-catalogs',
            outcome: outcomeOfWrite(persisted, 'set'),
            title: t('settings.catalogs.title'),
            detail: feed.username
              ? t('settings.catalogs.addedWithCredentials', { name: feed.name, url: feed.url })
              : t('settings.catalogs.added', { name: feed.name, url: feed.url }),
          });
        } catch (caught) {
          // What reaches here now is an address the browser cannot request — a bad scheme, or not
          // a URL at all — or a duplicate. The catalog behind a valid address is not judged
          // (docs/adr/0009-blind-core-link-policy-scope.md).
          const reason = caught instanceof Error ? caught.message : String(caught);
          setError(reason);
          // Both the inline error and the popup: the error explains the field, the popup states
          // the outcome — nothing was added, and the shelf is as it was.
          announce({
            setting: 'opds-catalogs',
            outcome: 'failed',
            title: t('settings.catalogs.title'),
            detail: t('settings.catalogs.rejected', { reason }),
          });
        }
      }}
    >
      <h3 style={{ margin: 0 }}>{t('shelf.addCatalog')}</h3>
      <div>
        <label htmlFor="feed-name">{t('shelf.name')}</label>
        <input id="feed-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="feed-url">{t('shelf.address')}</label>
        <input
          id="feed-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://calibre.local:8083/opds"
          required
        />
      </div>
      <div>
        <label htmlFor="feed-user">{t('shelf.username')}</label>
        <input
          id="feed-user"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
        />
      </div>
      <div>
        <label htmlFor="feed-password">{t('shelf.password')}</label>
        <input
          id="feed-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
        />
      </div>
      <p className="muted" style={{ margin: 0 }}>
        {t('shelf.credentialsNote')}
      </p>
      {error && <p className="error-box">{error}</p>}
      <button type="submit">{t('shelf.add')}</button>
    </form>
  );
}

function FeedView({
  feed,
  t,
  onNavigate,
}: {
  feed: OpdsFeed;
  t: Translate;
  onNavigate: (href: string) => void;
}) {
  const books = feed.entries.filter((entry) => entry.acquisitions.length > 0);
  const folders = feed.entries.filter((entry) => entry.navigationHref !== null);

  return (
    <section className="animate-in" style={{ marginTop: '1.2rem' }}>
      <h2>{feed.title}</h2>

      {folders.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
          {folders.map((entry) => (
            <li key={entry.id || entry.navigationHref} style={{ marginTop: '0.3rem' }}>
              <button
                type="button"
                className="button--secondary"
                onClick={() => onNavigate(entry.navigationHref!)}
              >
                {entry.title}
              </button>
            </li>
          ))}
        </ul>
      )}

      {books.length === 0 && folders.length === 0 && <p className="muted">{t('shelf.empty')}</p>}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {books.map((entry) => (
          <EntryRow key={entry.id || entry.title} entry={entry} t={t} />
        ))}
      </ul>

      <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem' }}>
        {feed.pagination.previous && (
          <button
            type="button"
            className="button--secondary"
            onClick={() => onNavigate(feed.pagination.previous!)}
          >
            {t('shelf.previousPage')}
          </button>
        )}
        {feed.pagination.next && (
          <button
            type="button"
            className="button--secondary"
            onClick={() => onNavigate(feed.pagination.next!)}
          >
            {t('shelf.nextPage')}
          </button>
        )}
      </div>
    </section>
  );
}

function EntryRow({ entry, t }: { entry: OpdsEntry; t: Translate }) {
  return (
    <li style={{ marginTop: '0.8rem' }}>
      <strong>{entry.title}</strong>
      {entry.authors.length > 0 && <span className="muted"> — {entry.authors.join(', ')}</span>}
      <div style={{ marginTop: '0.3rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {entry.acquisitions.map((acquisition) => (
          <AcquisitionLink key={acquisition.href} acquisition={acquisition} t={t} />
        ))}
      </div>
    </li>
  );
}

/**
 * The button's wording comes from the acquisition's own `kind` and media type, not from the fact
 * that a link exists. Free and direct gets "Download EPUB"; anything else gets a label that says
 * what it really is, plus the price when the feed states one.
 */
function AcquisitionLink({ acquisition, t }: { acquisition: OpdsAcquisition; t: Translate }) {
  const free = isDirectDownload(acquisition);
  const label = free
    ? `${t('shelf.download')} ${acquisition.formatLabel}`
    : acquisition.formatLabel;

  return (
    <span>
      <a href={acquisition.href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
      {acquisition.price && (
        <span className="muted">
          {' '}
          {acquisition.price.amount} {acquisition.price.currency}
        </span>
      )}
      {acquisition.requiresDrmApp && <span className="muted"> · {t('shelf.drm')}</span>}
      {!free && !acquisition.requiresDrmApp && !acquisition.price && (
        <span className="muted"> · {t('shelf.notFree')}</span>
      )}
      {acquisition.sizeBytes !== null && (
        <span className="muted"> · {formatSize(acquisition.sizeBytes)}</span>
      )}
    </span>
  );
}

function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
