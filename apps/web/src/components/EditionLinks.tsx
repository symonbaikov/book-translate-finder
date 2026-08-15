'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { SourceLinkDto } from '@golden/contracts';
import { ApiRequestError, getEditionLinks } from '../lib/api-client';
import { COUNTRY_CHANGE_EVENT, readCountry } from '../lib/country';
import { rightsStatusTone } from '../lib/link-labels';
import { useT } from '../i18n/I18nProvider';
import { Badge, Button, ChipLink, Sheet, Skeleton } from '../ui';
import type { Translate } from '../i18n/dictionary';
import styles from './EditionLinks.module.css';

type LinksData =
  | { kind: 'none' }
  | { kind: 'loading' }
  | { kind: 'loaded'; links: SourceLinkDto[]; bookstores: SourceLinkDto[] }
  | { kind: 'error'; message: string };

export function EditionLinks({ editionId, language }: { editionId: string; language?: string }) {
  const t = useT();
  // Openness and data are separate pieces of state, so that closing a panel does not discard links
  // already fetched — reopening it is then instant and costs the API nothing.
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<LinksData>({ kind: 'none' });
  const panelId = useId();
  // Tracks the latest request so a country switch mid-flight can't be overwritten by the
  // slower, now-stale response of the previous country.
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setData({ kind: 'loading' });
    try {
      const result = await getEditionLinks(editionId, readCountry());
      if (requestId !== requestIdRef.current) return;
      setData({ kind: 'loaded', links: result.links, bookstores: result.bookstores });
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      const message = error instanceof ApiRequestError ? error.message : t('links.failed');
      setData({ kind: 'error', message });
    }
  }, [editionId]);

  // While a panel is open, changing the country refetches it — the reader sees their own
  // country's shops immediately instead of having to collapse and reopen every edition. A closed
  // panel drops what it holds instead: its links are for the old country and would be wrong.
  useEffect(() => {
    function onCountryChange(): void {
      if (open) void load();
      else setData({ kind: 'none' });
    }
    window.addEventListener(COUNTRY_CHANGE_EVENT, onCountryChange);
    return () => window.removeEventListener(COUNTRY_CHANGE_EVENT, onCountryChange);
  }, [load, open]);

  function handleToggle(): void {
    if (open) {
      requestIdRef.current += 1; // cancel any in-flight response
      setOpen(false);
      return;
    }
    setOpen(true);
    if (data.kind !== 'loaded') void load();
  }

  return (
    <div className={styles.wrap}>
      <Button
        type="button"
        variant="secondary"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={panelId}
      >
        {open ? t('links.hide') : t('links.show')}
      </Button>
      <div aria-live="polite">
        <Sheet open={open} id={panelId}>
          {data.kind === 'loading' && (
            <div className={styles.loading} aria-label={t('links.loading')}>
              <Skeleton shape="text" width="55%" />
              <Skeleton shape="text" width="40%" />
            </div>
          )}
          {data.kind === 'error' && <p className="error-box">{data.message}</p>}
          {data.kind === 'loaded' && (
            <>
              <LinkList links={data.links} t={t} />
              <BookstoreList bookstores={data.bookstores} language={language ?? null} t={t} />
            </>
          )}
        </Sheet>
      </div>
    </div>
  );
}

function LinkList({ links, t }: { links: SourceLinkDto[]; t: Translate }) {
  if (links.length === 0) {
    return <p className={styles.none}>{t('links.none')}</p>;
  }

  // Group links by provider name + type for deduplication, preserving the first URL and rights status
  const groupedByProviderAndType = new Map<
    string,
    {
      url: string;
      formats: string[];
      rightsStatus: string;
      provider: string;
      type: SourceLinkDto['type'];
      viaEdition?: { id: string; label: string };
    }
  >();

  links.forEach((link) => {
    const key = `${link.provider}:${link.type}:${link.viaEdition?.id ?? ''}`;
    const existing = groupedByProviderAndType.get(key);

    if (existing) {
      if (link.format && !existing.formats.includes(link.format)) {
        existing.formats.push(link.format);
      }
    } else {
      groupedByProviderAndType.set(key, {
        url: link.url,
        formats: link.format ? [link.format] : [],
        rightsStatus: link.rightsStatus,
        provider: link.provider,
        type: link.type,
        ...(link.viaEdition && { viaEdition: link.viaEdition }),
      });
    }
  });

  return (
    <ul className={styles.list}>
      {Array.from(groupedByProviderAndType.values()).map((group) => (
        <li key={`${group.provider}:${group.url}`} className={styles.link}>
          <a className={styles.action} href={group.url} target="_blank" rel="noopener noreferrer">
            {group.formats.length > 0
              ? `${t(`linkType.${group.type}` as never)} (${group.formats
                  .map((f) => f.toUpperCase())
                  .join(', ')})`
              : t(`linkType.${group.type}` as never)}
          </a>
          <Badge tone={rightsStatusTone(group.rightsStatus)}>
            {t(`rights.${group.rightsStatus}` as never)}
          </Badge>
          <span className={styles.provider}>{group.provider}</span>
          {group.viaEdition && (
            <span className={styles.viaEdition}>
              {t('links.viaOtherEdition', { label: group.viaEdition.label })}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

function countryName(code: string | null, fallback: string): string {
  if (!code) return fallback;
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * Bookstores are shown as their own group, wording chosen carefully: these are *lookups* in
 * each shop's catalog, not verified stock — we never fetch the shop (that would be scraping), so
 * claiming availability would be a lie the UI cannot back up.
 */
function BookstoreList({
  bookstores,
  language,
  t,
}: {
  bookstores: SourceLinkDto[];
  language: string | null;
  t: Translate;
}) {
  if (bookstores.length === 0) return null;

  const country = readCountry();
  // The reader picked a country in settings; that choice gets its own heading rather than being
  // blended into one anonymous list, so it is visible that the setting is doing something.
  const groups: { key: string; label: string; stores: SourceLinkDto[] }[] = [
    {
      key: 'country',
      label: t('links.storesInCountry', {
        country: countryName(country, t('links.storesYourCountry')),
      }),
      stores: bookstores.filter((s) => s.group === 'country'),
    },
    {
      key: 'language',
      label: language
        ? t('links.storesLanguageMarket', { language })
        : t('links.storesLanguageMarketGeneric'),
      stores: bookstores.filter((s) => s.group === 'language'),
    },
    {
      key: 'worldwide',
      label: t('links.storesWorldwide'),
      // Links stored before `group` existed carry none; treating them as worldwide keeps an old
      // cached response rendering rather than silently dropping its shops.
      stores: bookstores.filter((s) => s.group === 'worldwide' || s.group === undefined),
    },
  ];

  return (
    <div className={styles.stores}>
      <div className={styles.storesHeading}>{t('links.storesHeading')}</div>
      {groups
        .filter((group) => group.stores.length > 0)
        .map((group) => (
          <div key={group.key} className={styles.group}>
            <div className={styles.groupLabel}>{group.label}</div>
            <ul className={styles.storeList}>
              {group.stores.map((store) => (
                <li key={store.url}>
                  <ChipLink href={store.url} target="_blank" rel="noopener noreferrer">
                    {store.providerName ?? store.provider}
                  </ChipLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      <p className={styles.caption}>{t('links.storesCaption')}</p>
    </div>
  );
}
