import type { Metadata } from 'next';
import { AddonManager } from '../../components/AddonManager';
import { getT } from '../../i18n/server';
import { Page } from '../../ui';

/**
 * Client-side end to end, and for a stronger reason than the shelf's.
 *
 * The shelf is a client component because some of its catalogs live on the reader's own network.
 * This page is one because the list it manages must never reach this server at all: there is no
 * route that would take it, `pnpm boundaries` forbids `apps/api` from even importing
 * `@golden/addons`, and server-rendering the list would hand the instance the one fact the whole
 * design exists to keep from it (docs/adr/0010-addon-engine.md §6).
 */
export const metadata: Metadata = {
  title: 'Addons · Golden Library',
};

export default async function AddonsPage() {
  const t = await getT();
  return (
    <Page>
      <h1>{t('addons.title')}</h1>
      <AddonManager />
    </Page>
  );
}
