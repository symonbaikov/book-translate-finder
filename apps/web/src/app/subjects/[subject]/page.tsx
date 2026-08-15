import Link from 'next/link';
import { SubjectBrowseResponseSchema } from '@golden/contracts';
import { webEnv } from '../../../config/web-env';
import { getT } from '../../../i18n/server';
import { languageName } from '../../../lib/language-names';
import { readBookLanguageFromCookie } from '../../../lib/book-language.server';
import { BookCard } from '../../../components/BookCard';
import { Page, PosterGrid } from '../../../ui';
import styles from './subject.module.css';

interface SubjectPageProps {
  params: { subject: string };
  searchParams: { language?: string };
}

/**
 * The catalogue behind a genre tag.
 *
 * The book-language filter is not asked for again here — if the reader already chose one (on a
 * work card, or in the header), that choice carries over automatically, and the page says which
 * filter is in effect with a way to drop it. Asking twice for something already answered is the
 * kind of small rudeness that makes a site feel like a form.
 */
export default async function SubjectPage({ params, searchParams }: SubjectPageProps) {
  const t = await getT();
  const subject = decodeURIComponent(params.subject);
  const language = searchParams.language ?? (await readBookLanguageFromCookie());

  const url = new URL(
    `/api/subjects/${encodeURIComponent(subject)}`,
    webEnv.INTERNAL_API_URL ?? webEnv.NEXT_PUBLIC_API_URL,
  );
  if (language) url.searchParams.set('language', language);

  const res = await fetch(url, { cache: 'no-store' });
  const data = SubjectBrowseResponseSchema.parse(await res.json());

  return (
    <Page>
      <Link href="/" className={styles.back}>
        ← {t('auth.backToSearch')}
      </Link>
      <h1 className={styles.title}>{data.subject}</h1>

      <p className={styles.filter}>
        {data.language
          ? t('subject.filteredByLanguage', { language: languageName(data.language) })
          : t('subject.allLanguages')}
        {data.language && (
          <>
            {' · '}
            <Link href={`/subjects/${encodeURIComponent(subject)}?language=`}>
              {t('subject.dropLanguageFilter')}
            </Link>
          </>
        )}
      </p>

      {data.works.length === 0 ? (
        <p className={styles.empty}>{t('subject.empty')}</p>
      ) : (
        <PosterGrid className={styles.grid}>
          {data.works.map((work, index) => (
            <BookCard
              key={work.id}
              href={`/works/${work.id}`}
              title={work.originalTitle}
              author={work.author}
              coverUrl={work.coverUrl}
              priority={index < 6}
              meta={
                work.firstPublishedYear
                  ? `${work.author} · ${work.firstPublishedYear}`
                  : work.author
              }
            />
          ))}
        </PosterGrid>
      )}
    </Page>
  );
}
