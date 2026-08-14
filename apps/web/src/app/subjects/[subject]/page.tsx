import Link from 'next/link';
import { SubjectBrowseResponseSchema } from '@btf/contracts';
import { CoverImage } from '../../../components/CoverImage';
import { webEnv } from '../../../config/web-env';
import { getT } from '../../../i18n/server';
import { languageName } from '../../../lib/language-names';
import { readBookLanguageFromCookie } from '../../../lib/book-language.server';

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
    <main id="main-content" className="container">
      <p className="muted" style={{ marginBottom: '0.3rem' }}>
        <Link href="/">{t('auth.backToSearch')}</Link>
      </p>
      <h1 style={{ marginTop: 0 }}>{data.subject}</h1>

      <p className="muted">
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
        <p className="muted">{t('subject.empty')}</p>
      ) : (
        <ul className="featured-grid">
          {data.works.map((work) => (
            <li key={work.id}>
              <Link href={`/works/${work.id}`} className="featured-card">
                <CoverImage src={work.coverUrl} alt="" width={110} height={165} />
                <span className="featured-card__title">{work.originalTitle}</span>
                <span className="muted featured-card__meta">
                  {work.author}
                  {work.firstPublishedYear ? ` · ${work.firstPublishedYear}` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
