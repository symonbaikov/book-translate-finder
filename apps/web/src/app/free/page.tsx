import type { Metadata } from 'next';
import Link from 'next/link';
import { FreeBooksResponseSchema } from '@golden/contracts';
import { FreeBooksCatalog } from '../../components/FreeBooksCatalog';
import { webEnv } from '../../config/web-env';
import { getLocale, getT } from '../../i18n/server';
import { readBookLanguageFromCookie } from '../../lib/book-language.server';
import { languageName } from '../../lib/language-names';
import { Page } from '../../ui';
import styles from './free.module.css';

export const metadata: Metadata = {
  title: 'Free books · Golden Library',
};

/** One page of the shelf. The API caps a request at 60; this is what "show more" adds each time. */
const PAGE_SIZE = 24;

interface FreeBooksPageProps {
  searchParams: { language?: string };
}

/**
 * The catalogue behind the home page's free row.
 *
 * Unfiltered by default, unlike the genre pages, and that difference is deliberate: a genre with
 * no books in your language is an empty genre, but a free shelf narrowed to your language on an
 * instance whose free copies are mostly English is an empty *site*. So the filter is offered
 * rather than applied — the reader's book language becomes a link they can take, and the page
 * says which of the two states it is in either way.
 */
export default async function FreeBooksPage({ searchParams }: FreeBooksPageProps) {
  const t = await getT();
  const locale = await getLocale();
  const filter = searchParams.language?.trim().toLowerCase() || undefined;
  // Only offered when it would actually change the page — suggesting the filter that is already
  // on is the kind of dead control that makes a page feel unmaintained.
  const offered = filter ? undefined : await readBookLanguageFromCookie();

  const url = new URL('/api/free-books', webEnv.INTERNAL_API_URL ?? webEnv.NEXT_PUBLIC_API_URL);
  url.searchParams.set('limit', String(PAGE_SIZE));
  if (filter) url.searchParams.set('language', filter);

  const res = await fetch(url, { cache: 'no-store' });
  const data = FreeBooksResponseSchema.parse(await res.json());

  return (
    <Page>
      <Link href="/" className={styles.back}>
        ← {t('auth.backToSearch')}
      </Link>
      <h1 className={styles.title}>{t('free.pageTitle')}</h1>
      <p className={styles.blurb}>{t('free.pageBlurb')}</p>

      <p className={styles.filter}>
        {data.language ? (
          <>
            {t('free.filteredByLanguage', { language: languageName(data.language, locale) })}{' '}
            <Link href="/free">{t('free.dropLanguageFilter')}</Link>
          </>
        ) : (
          <>
            {t('free.allLanguages')}{' '}
            {offered && (
              <Link href={`/free?language=${encodeURIComponent(offered)}`}>
                {t('free.filterByLanguage', { language: languageName(offered, locale) })}
              </Link>
            )}
          </>
        )}
      </p>

      {data.total === 0 ? (
        // Two different facts, and saying the wrong one sends the reader away: an instance with
        // no free books at all is not the same thing as one whose free books are in other
        // languages, and only the second has a fix the reader can apply.
        <p className={styles.empty}>
          {data.language
            ? t('free.emptyForLanguage', { language: languageName(data.language, locale) })
            : t('free.empty')}
        </p>
      ) : (
        // Remounted when the filter changes, so a page of English books never lingers under a
        // heading that now says Russian.
        <FreeBooksCatalog key={data.language ?? 'all'} initial={data} />
      )}
    </Page>
  );
}
