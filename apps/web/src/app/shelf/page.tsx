import type { Metadata } from 'next';
import { OpdsShelf } from '../../components/OpdsShelf';
import { getT } from '../../i18n/server';
import { Page } from '../../ui';

/**
 * The shelf is a client component end to end. That is not a rendering preference: half the
 * catalogs it shows live on the reader's own network and are fetched from their browser, and their
 * addresses are kept in `localStorage` and never sent here (docs/adr/0007). Server-rendering it
 * would mean this process knowing things it has deliberately been kept from knowing.
 */
export const metadata: Metadata = {
  title: 'Shelf · Golden Library',
};

export default async function ShelfPage() {
  const t = await getT();
  return (
    <Page>
      <h1>{t('shelf.title')}</h1>
      <OpdsShelf />
    </Page>
  );
}
