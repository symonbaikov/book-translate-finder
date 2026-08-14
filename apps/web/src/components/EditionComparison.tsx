'use client';

import { useState } from 'react';
import type { EditionSummary } from '@btf/contracts';
import { languageName } from '../lib/language-names';

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
      <h2 id="compare-heading">Compare editions</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Pick two or three editions to see what actually differs between them.
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
        <ComparisonTable editions={chosen} />
      ) : (
        <p className="muted">Selected {chosen.length} of at least 2.</p>
      )}
    </section>
  );
}

interface ComparisonRow {
  label: string;
  values: string[];
}

function buildRows(editions: EditionSummary[]): ComparisonRow[] {
  const rows: ComparisonRow[] = [
    { label: 'Language', values: editions.map((e) => languageName(e.language)) },
    { label: 'Published', values: editions.map((e) => (e.year ? String(e.year) : '—')) },
    { label: 'Publisher', values: editions.map((e) => e.publisher ?? '—') },
    { label: 'Translator', values: editions.map((e) => e.translator ?? '—') },
    {
      label: 'Translated from',
      values: editions.map((e) => (e.translatedFrom ? languageName(e.translatedFrom) : '—')),
    },
    { label: 'Binding', values: editions.map((e) => e.binding ?? '—') },
    { label: 'Pages', values: editions.map((e) => (e.pages ? String(e.pages) : '—')) },
    { label: 'ISBN', values: editions.map((e) => e.isbn ?? '—') },
    {
      label: 'Free or borrowable copy',
      values: editions.map((e) => (e.linkCount > 0 ? `yes (${e.linkCount})` : 'not found')),
    },
  ];

  // A row where every column says the same thing tells the reader nothing about which to pick.
  // The exception is a row where every column is "—": that is worth hiding too, and is.
  return rows.filter((row) => new Set(row.values).size > 1);
}

function ComparisonTable({ editions }: { editions: EditionSummary[] }) {
  const rows = buildRows(editions);

  return (
    <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
      <table className="compare-table">
        <thead>
          <tr>
            <th scope="col">Difference</th>
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
                These editions are identical in everything the sources record.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
