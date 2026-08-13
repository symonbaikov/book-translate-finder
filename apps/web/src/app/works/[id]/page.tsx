import { notFound } from 'next/navigation';
import type { EditionSummary } from '@btf/contracts';
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
    const aHasLinks = a.linkCount > 0 ? 0 : 1;
    const bHasLinks = b.linkCount > 0 ? 0 : 1;
    if (aHasLinks !== bHasLinks) return aHasLinks - bHasLinks;
    const byLanguage = languageName(a.language).localeCompare(languageName(b.language), 'ru');
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
    (a, b) => languageName(a).localeCompare(languageName(b), 'ru'),
  );

  return (
    <main id="main-content" className="container">
      <p>
        <a href="/">← Новый поиск</a>
      </p>
      <h1>{work.originalTitle}</h1>
      <p className="muted">
        {work.author}
        {work.firstPublishedYear ? `, ${work.firstPublishedYear}` : ''} · оригинал:{' '}
        {languageName(work.originalLanguage)}
      </p>
      {work.sources.length > 0 && (
        <p className="muted" style={{ fontSize: '0.85em' }}>
          Источник данных: {work.sources.join(', ')}
        </p>
      )}

      <section aria-labelledby="translations-heading" style={{ marginTop: '1.5rem' }}>
        <h2 id="translations-heading">Переведено на</h2>
        {work.translatedLanguages.length > 0 ? (
          <p>{work.translatedLanguages.map(languageName).join(', ')}</p>
        ) : (
          <p className="muted">Переводов пока не найдено.</p>
        )}
      </section>

      <section aria-labelledby="editions-heading" style={{ marginTop: '2rem' }}>
        <h2 id="editions-heading">
          Издания ({editions.length} из {work.editionCount})
        </h2>

        <form method="get" className="filters" style={{ marginBottom: '1rem' }}>
          <div className="field">
            <label htmlFor="language-filter">Язык</label>
            <select id="language-filter" name="language" defaultValue={searchParams.language ?? ''}>
              <option value="">Все языки</option>
              {languageOptions.map((code) => (
                <option key={code} value={code}>
                  {languageName(code)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="year-filter">Год</label>
            <input
              id="year-filter"
              name="year"
              defaultValue={searchParams.year ?? ''}
              inputMode="numeric"
            />
          </div>
          <button type="submit">Фильтровать</button>
          {(searchParams.language || searchParams.year) && (
            <a href={`/works/${params.id}`}>Сбросить</a>
          )}
        </form>

        {editions.length === 0 ? (
          <p className="muted">Изданий с такими фильтрами не найдено.</p>
        ) : (
          editions.map((edition) => <EditionCard key={edition.id} edition={edition} />)
        )}
      </section>
    </main>
  );
}

function EditionCard({ edition }: { edition: EditionSummary }) {
  return (
    <div className="card">
      <strong>{edition.title}</strong>
      {edition.linkCount > 0 && (
        <span
          style={{
            marginLeft: '0.5rem',
            fontSize: '0.8em',
            padding: '0.1rem 0.5rem',
            borderRadius: '1rem',
            background: 'var(--badge-bg, #e6f4ea)',
            color: 'var(--badge-fg, #1e7e34)',
            whiteSpace: 'nowrap',
          }}
        >
          есть источники
        </span>
      )}
      <div className="muted">
        {languageName(edition.language)}
        {edition.publisher ? ` · ${edition.publisher}` : ''}
        {edition.year ? ` · ${edition.year}` : ''}
        {edition.translator ? ` · перевод: ${edition.translator}` : ''}
        {edition.isbn ? ` · ISBN ${edition.isbn}` : ''}
      </div>
      <EditionLinks editionId={edition.id} />
    </div>
  );
}
