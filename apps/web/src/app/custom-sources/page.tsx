import type { Metadata } from 'next';
import { CustomSourceManager } from '../../components/CustomSourceManager';
import { getT } from '../../i18n/server';
import { Page } from '../../ui';

/**
 * Client-side end to end, for the same reason as `/addons`: a URL template a reader writes here is
 * theirs, never reaches this server, and `pnpm boundaries` keeps it that way — nothing under
 * `apps/api` may import the config's own shape, let alone a reader's stored values.
 */
export const metadata: Metadata = {
  title: 'Custom sources · Golden Library',
};

export default async function CustomSourcesPage() {
  const t = await getT();
  return (
    <Page>
      <h1>{t('customSources.title')}</h1>
      <CustomSourceManager />
    </Page>
  );
}
