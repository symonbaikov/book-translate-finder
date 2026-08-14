import { notFound } from 'next/navigation';
import type { EditionSummary } from '@btf/contracts';
import { CountrySelector } from '../../../components/CountrySelector';
import { EditionComparison } from '../../../components/EditionComparison';
import { CoverImage } from '../../../components/CoverImage';
import { EditionLinks } from '../../../components/EditionLinks';
import { getWorkCard, listEditions } from '../../../lib/api-client';
import { languageName } from '../../../lib/language-names';

interface WorkPageProps {
  params: { id: string };
  searchParams: { language?: string; year?: string };
}

/**
 * Editions with legal links first (the product's core promise — "where to get the text" must not
 * hide behind expanding editions one by one), then grouped by language name, newest first inside
 * a group. Phase 3 live-UX finding.
 */
function sortEditions(editions: EditionSummary[]): EditionSummary[] {
  return [...editions].sort((a, b) => {
    const aHasLinks = a.linkCount > 0 || a.hasBookstores ? 0 : 1;
    const bHasLinks = b.linkCount > 0 || b.hasBookstores ? 0 : 1;
    if (aHasLinks !== bHasLinks) return aHasLinks - bHasLinks;
    const byLanguage = languageName(a.language).localeCompare(languageName(b.language), 'en');
    if (byLanguage !== 0) return byLanguage;
    return (b.year ?? 0) - (a.year ?? 0);
  });
}

export default async function WorkPage({ params, searchParams }: WorkPageProps) {
  const work = await getWorkCard(params.id);
  if (!work) notFound();

  const yearFilter = searchParams.year ? Number(searchParams.year) : undefined;
  const editionsResult = await listEditions(params.id, {
    ...(searchParams.language ? { language: searchParams.language } : {}),
    ...(yearFilter !== undefined && !Number.isNaN(yearFilter) ? { year: yearFilter } : {}),
  });
  const editions = sortEditions(editionsResult.editions);
  const languageOptions = [...new Set([work.originalLanguage, ...work.translatedLanguages])].sort(
    (a, b) => languageName(a).localeCompare(languageName(b), 'en'),
  );

  return (
    <main id="main-content" className="container">
      <p>
        <a href="/">← New search</a>
      </p>
      <div className="media-row animate-in" style={{ marginTop: '1rem' }}>
        <CoverImage
          src={work.coverUrl}
          alt={`Cover of ${work.originalTitle}`}
          width={128}
          height={192}
          priority
        />
        <div className="media-row__body">
          <h1 style={{ marginTop: 0 }}>{work.originalTitle}</h1>
          <p className="muted">
            {work.author}
            {work.firstPublishedYear ? `, ${work.firstPublishedYear}` : ''} · original:{' '}
            {languageName(work.originalLanguage)}
          </p>
          {work.subjects.length > 0 && (
            <ul className="tag-list" aria-label="Genres and subjects">
              {work.subjects.map((subject) => (
                <li key={subject} className="tag">
                  {subject}
                </li>
              ))}
            </ul>
          )}
          {work.sources.length > 0 && (
            <p className="muted" style={{ fontSize: '0.85em' }}>
              Data sources: {work.sources.join(', ')}
            </p>
          )}
        </div>
      </div>
      {work.description && (
        <section aria-labelledby="about-heading" style={{ marginTop: '1.5rem' }}>
          <h2 id="about-heading">About this book</h2>
          <p style={{ whiteSpace: 'pre-line' }}>{work.description}</p>
        </section>
      )}

      <section aria-labelledby="translations-heading" style={{ marginTop: '1.5rem' }}>
        <h2 id="translations-heading">Translated into</h2>
        {work.translatedLanguages.length > 0 ? (
          <p>{work.translatedLanguages.map(languageName).join(', ')}</p>
        ) : (
          <p className="muted">No translations found yet.</p>
        )}
      </section>

      <section aria-labelledby="editions-heading" style={{ marginTop: '2rem' }}>
        <h2 id="editions-heading">
          Editions ({editions.length} of {work.editionCount})
        </h2>

        <div style={{ marginBottom: '1rem' }}>
          <CountrySelector />
        </div>

        <form method="get" className="filters" style={{ marginBottom: '1rem' }}>
          <div className="field">
            <label htmlFor="language-filter">Language</label>
            <select id="language-filter" name="language" defaultValue={searchParams.language ?? ''}>
              <option value="">All languages</option>
              {languageOptions.map((code) => (
                <option key={code} value={code}>
                  {languageName(code)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="year-filter">Year</label>
            <input
              id="year-filter"
              name="year"
              defaultValue={searchParams.year ?? ''}
              inputMode="numeric"
            />
          </div>
          <button type="submit">Filter</button>
          {(searchParams.language || searchParams.year) && (
            <a href={`/works/${params.id}`}>Reset</a>
          )}
        </form>

        {editions.length === 0 ? (
          <p className="muted">No editions match these filters.</p>
        ) : (
          editions.map((edition) => <EditionCard key={edition.id} edition={edition} />)
        )}
      </section>

      <EditionComparison editions={editions} />
    </main>
  );
}

function EditionCard({ edition }: { edition: EditionSummary }) {
  return (
    <div className="card animate-in">
      <div className="media-row">
        <CoverImage src={edition.coverUrl} alt="" width={56} height={84} />
        <div className="media-row__body">
          <strong>{edition.title}</strong>
          {edition.linkCount > 0 ? (
            <span className="badge badge--positive" style={{ marginLeft: '0.5rem' }}>
              read or borrow
            </span>
          ) : edition.hasBookstores ? (
            <span className="badge badge--neutral" style={{ marginLeft: '0.5rem' }}>
              in bookstores
            </span>
          ) : null}
          <div className="muted">
            {languageName(edition.language)}
            {edition.publisher ? ` · ${edition.publisher}` : ''}
            {edition.year ? ` · ${edition.year}` : ''}
            {edition.translator ? ` · translated by ${edition.translator}` : ''}
            {edition.binding ? ` · ${edition.binding}` : ''}
            {edition.pages ? ` · ${edition.pages} pages` : ''}
            {edition.isbn ? ` · ISBN ${edition.isbn}` : ''}
          </div>
          <EditionLinks editionId={edition.id} language={languageName(edition.language)} />
        </div>
      </div>
    </div>
  );
}
