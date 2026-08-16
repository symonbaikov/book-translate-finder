import type { Metadata } from 'next';
import { BookReader } from '../../components/reader/BookReader';
import { getT } from '../../i18n/server';
import { Page } from '../../ui';

export const metadata: Metadata = {
  title: 'Read · Golden Library',
};

/**
 * The reading route.
 *
 * Its Content-Security-Policy comes from `src/middleware.ts` and is the wall that stops a book's
 * own JavaScript — on WebKit it is the only one (docs/adr/0013-client-side-reader.md §3). The route
 * exists as its own path rather than as a panel on the work page precisely so that policy can be
 * scoped to it.
 *
 * Nothing here is fetched on the server, and nothing about the book is in the URL: a book arrives
 * from the reader's device, or through a fragment the server never sees. `?src=` would hand the
 * file's address to this instance in the request line, which is the one thing this whole feature
 * is built not to do (§1).
 */
export default async function ReadPage() {
  const t = await getT();
  return (
    <Page>
      <h1>{t('reader.title')}</h1>
      <BookReader />
    </Page>
  );
}
