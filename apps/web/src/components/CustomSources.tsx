'use client';

import type { BookQueryMeta } from '@golden/plugins';
import { useT } from '../i18n/I18nProvider';
import { useCustomSourceProviders } from '../lib/use-custom-source-providers';
import { ChipLink } from '../ui';
import styles from './EditionLinks.module.css';

/**
 * The reader's own configured sources, resolved for one edition and rendered next to the shipped
 * bookstore catalog — the same `.stores`/`.storeList` shelf, one more group in it, so a reader does
 * not have to learn that these came from a different mechanism.
 *
 * Unlike `AddonSources`, there is nothing to fetch: a `SourceProvider`'s `resolveSearchUrl` is a
 * pure string substitution (see `packages/plugins/src/url-source`), so this renders synchronously
 * from whatever `useCustomSourceProviders` last resolved. A provider that returns `null` — the
 * edition lacks whatever its template needed — is simply left out, exactly like a shipped bookstore
 * whose `buildUrl` has nothing to build from.
 *
 * `open` is the edition links panel's own open state, passed through so the source list is re-read
 * every time the panel opens rather than once at first mount — see `useCustomSourceProviders`.
 */
export function CustomSources({ bookMeta, open }: { bookMeta: BookQueryMeta; open: boolean }) {
  const t = useT();
  const providers = useCustomSourceProviders(open);

  const resolved = providers
    .map((provider) => ({
      id: provider.manifest.id,
      name: provider.manifest.name,
      url: provider.resolveSearchUrl(bookMeta),
    }))
    .filter((entry): entry is { id: string; name: string; url: string } => entry.url !== null);

  if (resolved.length === 0) return null;

  return (
    <div className={styles.stores}>
      <div className={styles.storesHeading}>{t('customSources.heading')}</div>
      <ul className={styles.storeList}>
        {resolved.map((entry) => (
          <li key={entry.id}>
            <ChipLink href={entry.url} target="_blank" rel="noopener noreferrer">
              {entry.name}
            </ChipLink>
          </li>
        ))}
      </ul>
      <p className={styles.caption}>{t('customSources.caption')}</p>
    </div>
  );
}
