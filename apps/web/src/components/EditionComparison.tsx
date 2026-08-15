'use client';

import { type ReactNode, useState } from 'react';
import type { EditionSummary } from '@golden/contracts';
import { languageName } from '../lib/language-names';
import { useLocale, useT } from '../i18n/I18nProvider';
import type { Translate } from '../i18n/dictionary';
import { Badge, Button, ChipToggle, Cluster, Section } from '../ui';
import styles from './EditionComparison.module.css';

/** Three columns is where a comparison stops being readable on a phone. */
const MAX_SELECTED = 3;

/** How many editions the picker opens with before "show all" is needed. */
const PICKER_PAGE_SIZE = 12;

/**
 * Side-by-side comparison of two or three editions.
 *
 * The point is not to recommend one — the app has no basis for that and saying "this is the best
 * edition" would be an opinion dressed as data. It is to put the handful of facts that actually
 * differ next to each other (year, translator, publisher, length, binding, whether a legal copy
 * exists) so the reader decides. Rows where every edition agrees are hidden: a table of identical
 * values buries the two lines that matter.
 *
 * The picker itself collapses the moment a valid comparison exists. A popular work can hand this
 * component two dozen editions, most of them "English, 2022 — Independently Published" print-on-
 * demand reprints indistinguishable at a glance — a wall of that many checkboxes *is* the overload,
 * not just its styling. Showing the table and hiding the picker behind "Change editions" once the
 * reader has picked their two or three is what actually shrinks the screen back down.
 */
export function EditionComparison({ editions }: { editions: EditionSummary[] }) {
  const t = useT();
  const locale = useLocale();
  const [selected, setSelected] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(true);
  const [showAllOptions, setShowAllOptions] = useState(false);

  if (editions.length < 2) return null;

  const chosen = selected
    .map((id) => editions.find((e) => e.id === id))
    .filter((e): e is EditionSummary => e !== undefined);

  function toggle(id: string): void {
    const wasSelected = selected.includes(id);
    if (!wasSelected && selected.length >= MAX_SELECTED) return;
    const next = wasSelected ? selected.filter((x) => x !== id) : [...selected, id];
    setSelected(next);
    // Collapse the picker the moment a comparison first becomes possible — not on every later
    // click, or reopening it to swap one edition for another would fight the reader by hiding
    // itself again mid-adjustment.
    if (!wasSelected && selected.length === 1 && next.length === 2) setPickerOpen(false);
  }

  const visibleOptions = showAllOptions ? editions : editions.slice(0, PICKER_PAGE_SIZE);

  return (
    <Section
      id="compare"
      title={t('compare.heading')}
      note={t('compare.blurb')}
      action={
        !pickerOpen ? (
          <Button variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>
            {t('compare.editSelection')}
          </Button>
        ) : undefined
      }
    >
      {pickerOpen && (
        <div className={styles.picker}>
          <Cluster>
            {visibleOptions.map((edition) => {
              const isSelected = selected.includes(edition.id);
              const atCap = !isSelected && selected.length >= MAX_SELECTED;
              return (
                <ChipToggle
                  key={edition.id}
                  selected={isSelected}
                  disabled={atCap}
                  className={atCap ? styles.pickerOptionDisabled : undefined}
                  onClick={() => toggle(edition.id)}
                >
                  {editionLabel(edition, locale, t)}
                </ChipToggle>
              );
            })}
          </Cluster>
          {!showAllOptions && editions.length > PICKER_PAGE_SIZE ? (
            <Button
              variant="ghost"
              size="sm"
              className={styles.showAll}
              onClick={() => setShowAllOptions(true)}
            >
              {t('compare.showAllEditions', { count: editions.length })}
            </Button>
          ) : null}
        </div>
      )}

      {chosen.length >= 2 ? (
        <ComparisonTable editions={chosen} locale={locale} t={t} />
      ) : (
        <p className={styles.hint}>{t('compare.selected', { count: chosen.length })}</p>
      )}
    </Section>
  );
}

/**
 * The label a reader tells editions apart by — in the picker and again atop each comparison
 * column, so a column never repeats the ambiguous single word ("English") that got it picked
 * out of a dozen near-identical reprints in the first place. Translator over publisher when one
 * exists: on a *translation* finder, who translated it is the fact worth a reader's first glance,
 * and it is also the one detail a wall of "Independently Published, 2022" reprints usually lacks
 * in common.
 */
function editionLabel(edition: EditionSummary, locale: string, t: Translate): string {
  const parts = [languageName(edition.language, locale)];
  if (edition.year) parts.push(String(edition.year));
  const attribution = edition.translator
    ? t('work.translatedBy', { name: edition.translator })
    : edition.publisher;
  if (attribution) parts.push(attribution);
  return parts.join(' · ');
}

interface ComparisonRow {
  label: string;
  /** The plain value each column differs (or doesn't) by — what "identical across columns" is
   *  judged on, kept separate from `render` so a richer cell (a badge) can't defeat that check by
   *  never comparing equal to itself. */
  values: string[];
  render?: (value: string) => ReactNode;
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
      render: (value) =>
        value === t('compare.no') ? (
          <span className={styles.muted}>{value}</span>
        ) : (
          <Badge tone="positive">{value}</Badge>
        ),
    },
  ];

  // A row where every column says the same thing tells the reader nothing about which to pick.
  // The exception is a row where every column is "—": that is worth hiding too, and is.
  return rows.filter((row) => new Set(row.values).size > 1);
}

function ComparisonTable({
  editions,
  locale,
  t,
}: {
  editions: EditionSummary[];
  locale: string;
  t: Translate;
}) {
  const rows = buildRows(editions, t);

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" className={styles.cornerCell} />
            {editions.map((edition) => (
              <th key={edition.id} scope="col">
                <span className={styles.columnTitle}>{edition.title}</span>
                <span className={styles.columnMeta}>{editionLabel(edition, locale, t)}</span>
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
                  <td key={editions[i]!.id}>{row.render ? row.render(value) : value}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={editions.length + 1} className={styles.muted}>
                {t('compare.identical')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
