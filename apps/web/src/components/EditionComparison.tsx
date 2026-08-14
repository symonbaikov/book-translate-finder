'use client';

import { useState } from 'react';
import type { EditionSummary } from '@btf/contracts';
import { languageName } from '../lib/language-names';
import { useT } from '../i18n/I18nProvider';
import type { Translate } from '../i18n/dictionary';

/**
 * Side-by-side comparison of two or three editions.
 *
 * The point is not to recommend one — the app has no basis for that and saying "this is the best
 * edition" would be an opinion dressed as data. It is to put the handful of facts that actually
 * differ next to each other (year, translator, publisher, length, binding, whether a legal copy
 * exists) so the reader decides. Rows where every edition agrees are hidden: a table of identical
 * values buries the two lines that matter.
 */
export function EditionComparison({ editions }: { editions: EditionSummary[] }) {
  const t = useT();
  const [selected, setSelected] = useState<string[]>([]);

  if (editions.length < 2) return null;

  const chosen = selected
    .map((id) => editions.find((e) => e.id === id))
    .filter((e): e is EditionSummary => e !== undefined);

  function toggle(id: string): void {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : // Three columns is where a comparison stops being readable on a phone.
          [...current, id].slice(-3),
    );
  }

  return (
    <section aria-labelledby="compare-heading" style={{ marginTop: '2rem' }}>
      <h2 id="compare-heading">{t('compare.heading')}</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        {t('compare.blurb')}
      </p>

      <div className="compare-picker">
        {editions.slice(0, 30).map((edition) => (
          <label key={edition.id} className="compare-picker__item">
            <input
              type="checkbox"
              checked={selected.includes(edition.id)}
              onChange={() => toggle(edition.id)}
            />
            <span>
              {languageName(edition.language)}
              {edition.year ? `, ${edition.year}` : ''}
              {edition.publisher ? ` — ${edition.publisher}` : ''}
            </span>
          </label>
        ))}
      </div>

      {chosen.length >= 2 ? (
        <ComparisonTable editions={chosen} t={t} />
      ) : (
        <p className="muted">{t('compare.selected', { count: chosen.length })}</p>
      )}
    </section>
  );
}

interface ComparisonRow {
  label: string;
  values: string[];
}

function buildRows(editions: EditionSummary[], t: Translate): ComparisonRow[] {
  const rows: ComparisonRow[] = [
    { label: t('compare.rowLanguage'), values: editions.map((e) => languageName(e.language)) },
    {
      label: t('compare.rowPublished'),
      values: editions.map((e) => (e.year ? String(e.year) : '—')),
    },
    { label: t('compare.rowPublisher'), values: editions.map((e) => e.publisher ?? '—') },
    { label: t('compare.rowTranslator'), values: editions.map((e) => e.translator ?? '—') },
    {
      label: t('compare.rowTranslatedFrom'),
      values: editions.map((e) => (e.translatedFrom ? languageName(e.translatedFrom) : '—')),
    },
    { label: t('compare.rowBinding'), values: editions.map((e) => e.binding ?? '—') },
    {
      label: t('compare.rowPages'),
      values: editions.map((e) => (e.pages ? String(e.pages) : '—')),
    },
    { label: t('compare.rowIsbn'), values: editions.map((e) => e.isbn ?? '—') },
    {
      label: t('compare.rowFreeCopy'),
      values: editions.map((e) =>
        e.linkCount > 0 ? t('compare.yes', { count: e.linkCount }) : t('compare.no'),
      ),
    },
  ];

  // A row where every column says the same thing tells the reader nothing about which to pick.
  // The exception is a row where every column is "—": that is worth hiding too, and is.
  return rows.filter((row) => new Set(row.values).size > 1);
}

function ComparisonTable({ editions, t }: { editions: EditionSummary[]; t: Translate }) {
  const rows = buildRows(editions, t);

  return (
    <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
      <table className="compare-table">
        <thead>
          <tr>
            <th scope="col">{t('compare.columnDifference')}</th>
            {editions.map((edition) => (
              <th key={edition.id} scope="col">
                {edition.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.values.map((value, i) => (
                  <td key={editions[i]!.id}>{value}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={editions.length + 1} className="muted">
                {t('compare.identical')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
