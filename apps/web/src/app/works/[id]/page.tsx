import { notFound } from 'next/navigation';
import type { EditionSummary } from '@btf/contracts';
import { EditionLinks } from '../../../components/EditionLinks';
import { getWorkCard, listEditions } from '../../../lib/api-client';

interface WorkPageProps {
  params: { id: string };
  searchParams: { language?: string; year?: string };
}

export default async function WorkPage({ params, searchParams }: WorkPageProps) {
  const work = await getWorkCard(params.id);
  if (!work) notFound();

  const yearFilter = searchParams.year ? Number(searchParams.year) : undefined;
  const editionsResult = await listEditions(params.id, {
    ...(searchParams.language ? { language: searchParams.language } : {}),
    ...(yearFilter !== undefined && !Number.isNaN(yearFilter) ? { year: yearFilter } : {}),
  });

  return (
    <main id="main-content" className="container">
      <p>
        <a href="/">← Новый поиск</a>
      </p>
      <h1>{work.originalTitle}</h1>
      <p className="muted">
        {work.author}
        {work.firstPublishedYear ? `, ${work.firstPublishedYear}` : ''} · оригинал:{' '}
        {work.originalLanguage}
      </p>

      <section aria-labelledby="translations-heading" style={{ marginTop: '1.5rem' }}>
        <h2 id="translations-heading">Переведено на</h2>
        {work.translatedLanguages.length > 0 ? (
          <p>{work.translatedLanguages.join(', ')}</p>
        ) : (
          <p className="muted">Переводов пока не найдено.</p>
        )}
      </section>

      <section aria-labelledby="editions-heading" style={{ marginTop: '2rem' }}>
        <h2 id="editions-heading">
          Издания ({editionsResult.editions.length} из {work.editionCount})
        </h2>

        <form method="get" className="filters" style={{ marginBottom: '1rem' }}>
          <div className="field">
            <label htmlFor="language-filter">Язык</label>
            <input
              id="language-filter"
              name="language"
              defaultValue={searchParams.language ?? ''}
              placeholder="напр. en"
              maxLength={2}
            />
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

        {editionsResult.editions.length === 0 ? (
          <p className="muted">Изданий с такими фильтрами не найдено.</p>
        ) : (
          editionsResult.editions.map((edition) => (
            <EditionCard key={edition.id} edition={edition} />
          ))
        )}
      </section>
    </main>
  );
}

function EditionCard({ edition }: { edition: EditionSummary }) {
  return (
    <div className="card">
      <strong>{edition.title}</strong>
      <div className="muted">
        {edition.language}
        {edition.publisher ? ` · ${edition.publisher}` : ''}
        {edition.year ? ` · ${edition.year}` : ''}
        {edition.translator ? ` · перевод: ${edition.translator}` : ''}
        {edition.isbn ? ` · ISBN ${edition.isbn}` : ''}
      </div>
      <EditionLinks editionId={edition.id} />
    </div>
  );
}
