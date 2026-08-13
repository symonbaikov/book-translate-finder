'use client';

import { useState } from 'react';
import { languageName } from '../lib/language-names';

interface OpenLibraryResult {
  found: boolean;
  workKey?: string;
  title?: string;
  languages?: string[];
  editionCount?: number;
  firstPublishYear?: number | null;
  numFound?: number;
  error?: string;
}

interface GoogleBooksItem {
  title?: string;
  language?: string;
  isbn?: string;
  buyLink?: string;
}

interface SearchResponse {
  query: string;
  openLibrary: OpenLibraryResult;
  googleBooks: GoogleBooksItem[] | { error: string };
}

interface Edition {
  title?: string;
  language: string;
  publishYear: string | null;
  publisher: string | null;
  rightsStatus: 'has_archive_scan' | 'unknown';
  archiveUrl: string | null;
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [editions, setEditions] = useState<Edition[] | null>(null);
  const [editionsLoading, setEditionsLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setEditions(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = (await res.json()) as SearchResponse;
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  async function loadEditions(workKey: string) {
    setEditionsLoading(true);
    setEditions(null);
    try {
      const res = await fetch(`/api/editions?workKey=${encodeURIComponent(workKey)}`);
      const data = (await res.json()) as { editions: Edition[] };
      setEditions(data.editions);
    } finally {
      setEditionsLoading(false);
    }
  }

  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      <h1>BookTranslate Finder — прототип (Фаза 0)</h1>
      <p style={{ color: '#666', fontSize: '0.875rem' }}>
        Разведочный прототип: без своей БД, запросы к Open Library и Google Books через тонкий
        same-origin proxy (нужен из-за отсутствия CORS у Open Library — см.
        docs/research/coverage-phase0.md). Наличие скана на archive.org (поле <code>ocaid</code>)
        размечено вручную и не является подтверждением легального статуса — это не полноценный
        LinkPolicy (см. docs/legal-policy.md).
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', margin: '1.5rem 0' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Название и автор, например: War and Peace Tolstoy"
          style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
          {loading ? 'Ищем…' : 'Искать'}
        </button>
      </form>

      {result && (
        <section>
          <h2>Open Library</h2>
          {result.openLibrary.error && (
            <p style={{ color: 'crimson' }}>Ошибка: {result.openLibrary.error}</p>
          )}
          {!result.openLibrary.error && !result.openLibrary.found && (
            <p>Ничего не найдено ({result.openLibrary.numFound ?? 0} совпадений).</p>
          )}
          {result.openLibrary.found && (
            <div>
              <p>
                <strong>{result.openLibrary.title}</strong> — {result.openLibrary.editionCount}{' '}
                изданий, первое издание {result.openLibrary.firstPublishYear ?? '?'}
              </p>
              <p>
                Языки перевода ({result.openLibrary.languages?.length ?? 0}):{' '}
                {(result.openLibrary.languages ?? []).map(languageName).join(', ') || '—'}
              </p>
              <button
                onClick={() =>
                  result.openLibrary.workKey && loadEditions(result.openLibrary.workKey)
                }
              >
                {editionsLoading ? 'Загружаем издания…' : 'Показать издания и ссылки'}
              </button>
            </div>
          )}

          <h2 style={{ marginTop: '1.5rem' }}>Google Books</h2>
          {'error' in result.googleBooks ? (
            <p style={{ color: '#a60' }}>Недоступно: {result.googleBooks.error}</p>
          ) : result.googleBooks.length === 0 ? (
            <p>Ничего не найдено.</p>
          ) : (
            <ul>
              {result.googleBooks.map((item, i) => (
                <li key={i}>
                  {item.title} — {item.language ? languageName(item.language) : '?'}
                  {item.isbn ? ` · ISBN ${item.isbn}` : ''}
                  {item.buyLink ? (
                    <>
                      {' · '}
                      <a href={item.buyLink} target="_blank" rel="noreferrer">
                        купить
                      </a>
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {editions && (
            <>
              <h2 style={{ marginTop: '1.5rem' }}>Издания ({editions.length})</h2>
              <ul>
                {editions.map((ed, i) => (
                  <li key={i}>
                    [{languageName(ed.language)}] {ed.title}{' '}
                    {ed.publishYear ? `(${ed.publishYear})` : ''}{' '}
                    {ed.publisher ? `— ${ed.publisher}` : ''}{' '}
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.1rem 0.4rem',
                        borderRadius: 4,
                        background: ed.rightsStatus === 'has_archive_scan' ? '#dfd' : '#eee',
                        color: ed.rightsStatus === 'has_archive_scan' ? '#070' : '#666',
                      }}
                    >
                      {ed.rightsStatus === 'has_archive_scan'
                        ? 'есть скан на archive.org'
                        : 'статус неизвестен'}
                    </span>{' '}
                    {ed.archiveUrl && (
                      <a href={ed.archiveUrl} target="_blank" rel="noreferrer">
                        archive.org
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </main>
  );
}
