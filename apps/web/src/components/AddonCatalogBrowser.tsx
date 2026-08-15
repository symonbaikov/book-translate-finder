'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { findCatalog, type AddonSource, type BookMetaPreview } from '@golden/addons';
import { useT } from '../i18n/I18nProvider';
import { useAddons } from '../lib/use-addons';
import { Badge, Button, Poster } from '../ui';
import styles from './AddonCatalogBrowser.module.css';

/** One entry's sources, keyed by its own id — this page is scoped to a single addon, so unlike
 * `AddonSearchResults` there's no need to fold an addon id into the key. */
type SourcesState =
  | { readonly status: 'loading' }
  | { readonly status: 'ok'; readonly sources: readonly AddonSource[] }
  | { readonly status: 'failed'; readonly reason: string };

/** `"Anna's Archive (annas-archive.li) (pdf, 3.1 MB)"` — whatever the addon actually gave us. */
function sourceLabel(source: AddonSource): string {
  const details = [source.format, source.fileSize ? formatBytes(source.fileSize) : null]
    .filter(Boolean)
    .join(', ');
  return details ? `${source.name} (${details})` : source.name;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * A reader-installed addon's own catalog, paged from the top — the same "what did you find"
 * question `AddonSearchResults` asks per query, asked here with no query at all. Client-side end
 * to end: the addon's transport only exists in the browser (docs/adr/0010-addon-engine.md §6).
 */
export function AddonCatalogBrowser({ addonId }: { addonId: string }) {
  const t = useT();
  const { registry, loading } = useAddons();
  const addon = loading ? null : registry.get(addonId);
  const catalog = addon?.transport.manifest.catalogs.find(
    (candidate) =>
      candidate.type === 'book' &&
      findCatalog(addon.transport.manifest, 'book', candidate.id) !== null,
  );

  const [metas, setMetas] = useState<BookMetaPreview[]>([]);
  const [nextSkip, setNextSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorReason, setErrorReason] = useState('');
  const [sources, setSources] = useState<Record<string, SourcesState>>({});

  const fetchPage = useCallback(
    (skip: number, mode: 'replace' | 'append') => {
      if (!addon || !catalog) return;
      setStatus('loading');
      addon.transport.getCatalog('book', catalog.id, { skip }).then(
        (result) => {
          setMetas((current) =>
            mode === 'replace' ? [...result.metas] : [...current, ...result.metas],
          );
          setNextSkip(skip + result.metas.length);
          setHasMore(result.metas.length > 0);
          setStatus('idle');
        },
        (error: unknown) => {
          setStatus('error');
          setErrorReason(error instanceof Error ? error.message : String(error));
        },
      );
    },
    [addon, catalog],
  );

  // The first page, once (and again if the reader somehow lands on a different addon/catalog
  // without a full page reload — id-keyed, not object-identity-keyed, since a fresh transport is
  // started on every mount anyway per useAddons).
  useEffect(() => {
    if (!addon || !catalog) return;
    setMetas([]);
    setNextSkip(0);
    setHasMore(true);
    fetchPage(0, 'replace');
  }, [addonId, catalog?.id]);

  function reveal(metaId: string): void {
    if (!addon || sources[metaId]) return;
    setSources((current) => ({ ...current, [metaId]: { status: 'loading' } }));
    addon.transport.getSources('book', metaId).then(
      (result) => {
        setSources((current) => ({
          ...current,
          [metaId]: { status: 'ok', sources: result.sources },
        }));
      },
      (error: unknown) => {
        setSources((current) => ({
          ...current,
          [metaId]: {
            status: 'failed',
            reason: error instanceof Error ? error.message : String(error),
          },
        }));
      },
    );
  }

  if (loading) return null;

  if (!addon) {
    return (
      <>
        <p className={styles.notice}>{t('addons.notInstalled')}</p>
        <p>
          <Link href="/addons">{t('addons.title')}</Link>
        </p>
      </>
    );
  }

  if (!catalog) {
    return <p className={styles.notice}>{t('addons.browseNoCatalog')}</p>;
  }

  return (
    <>
      <h1>{t('addons.browseTitle', { name: addon.transport.manifest.name })}</h1>

      {metas.length === 0 && status !== 'loading' ? (
        <p className={styles.notice}>{t('addons.browseEmpty')}</p>
      ) : (
        <ul className={styles.list}>
          {metas.map((meta) => {
            const state = sources[meta.id];
            return (
              <li key={meta.id} className={styles.row}>
                {/* Only when the addon actually has a real cover — no placeholder art for a
                    catalog that never sends `poster` at all, which just repeats the title in a
                    grey box fifty times over and reads as broken rather than designed. */}
                {meta.poster ? (
                  <Poster
                    className={styles.thumb}
                    src={meta.poster}
                    title={meta.name}
                    author={meta.authors?.[0] ?? null}
                  />
                ) : null}
                <div className={styles.info}>
                  <span className={styles.title}>{meta.name}</span>
                  {/* What this actually is — format, and author/size when the addon has them.
                      Without this, an unfamiliar title (a niche magazine's own name, say) gives
                      no hint that clicking through leads to an actual file. */}
                  {meta.description ? <Badge tone="neutral">{meta.description}</Badge> : null}
                  {meta.authors && meta.authors.length > 0 ? (
                    <span className={styles.meta}>
                      {meta.authors.join(', ')}
                      {meta.releaseInfo ? ` · ${meta.releaseInfo}` : ''}
                    </span>
                  ) : meta.releaseInfo ? (
                    <span className={styles.meta}>{meta.releaseInfo}</span>
                  ) : null}
                </div>
                <div className={styles.action}>
                  {!state ? (
                    <Button variant="ghost" size="sm" onClick={() => reveal(meta.id)}>
                      {t('addons.showLinks')}
                    </Button>
                  ) : state.status === 'loading' ? null : state.status === 'failed' ? (
                    <span className={styles.failure}>{state.reason}</span>
                  ) : state.sources.length === 0 ? null : (
                    state.sources.map((source) => (
                      // `noreferrer` as well as `noopener`: which page the reader came from is
                      // not the addon's business (same rule as AddonSearchResults).
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Badge tone="info">{sourceLabel(source)}</Badge>
                      </a>
                    ))
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {status === 'error' ? (
        <p className={styles.failure}>
          {t('addons.browseFailed', { name: addon.transport.manifest.name, reason: errorReason })}
        </p>
      ) : null}

      {hasMore && metas.length > 0 ? (
        <p className={styles.loadMore}>
          <Button
            variant="secondary"
            onClick={() => fetchPage(nextSkip, 'append')}
            loading={status === 'loading'}
          >
            {t('addons.loadMore')}
          </Button>
        </p>
      ) : null}
    </>
  );
}
