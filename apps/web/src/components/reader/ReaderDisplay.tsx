'use client';

import {
  LINE_HEIGHTS,
  MARGINS,
  READER_THEMES,
  canStepFontScale,
  stepFontScale,
  type DisplaySettings,
  type ReaderFlow,
  type ReaderTheme,
} from '@golden/reader';
import { useT } from '../../i18n/I18nProvider';
import type { Translate } from '../../i18n/dictionary';
import { Button, Select } from '../../ui';
import styles from './BookReader.module.css';

/**
 * The seven things a reader can change about how a book looks.
 *
 * Every control is discrete — steps and choices, no sliders. Partly because the useful values are
 * not evenly spaced, and partly because each change announces itself (CLAUDE.md): a slider would
 * mean a popup per pixel, or a rule about when a drag has "finished" that nobody would get right.
 *
 * Values are shown as numbers where a number is honest — 130%, 1.5, 6% — so that the interface does
 * not have to invent a word for every step and then translate it fifteen times.
 */
export function ReaderDisplay({
  display,
  onChange,
  onReset,
}: {
  display: DisplaySettings;
  /** `label` is what the popup will say changed, already translated. */
  onChange: (next: DisplaySettings, label: string, value: string) => void;
  onReset: () => void;
}) {
  const t = useT();

  return (
    <section className={styles.display}>
      <div className={styles.bookmarksHead}>
        <h2 className={styles.libraryHeading}>{t('reader.display')}</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          {t('reader.displayReset')}
        </Button>
      </div>

      <div className={styles.displayGrid}>
        <label className={styles.displayField}>
          <span>{t('reader.theme')}</span>
          <Select
            value={display.theme}
            onChange={(value) => {
              const theme = value as ReaderTheme;
              onChange({ ...display, theme }, t('reader.theme'), themeName(theme, t));
            }}
            options={READER_THEMES.map((theme) => ({
              value: theme,
              label: themeName(theme, t),
            }))}
          />
        </label>

        <div className={styles.displayField}>
          <span>{t('reader.fontSize')}</span>
          <div className={styles.stepper}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!canStepFontScale(display.fontScale, -1)}
              onClick={() => step(-1)}
            >
              {t('reader.smaller')}
            </Button>
            <output className={styles.stepValue}>{percent(display.fontScale)}</output>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!canStepFontScale(display.fontScale, 1)}
              onClick={() => step(1)}
            >
              {t('reader.larger')}
            </Button>
          </div>
        </div>

        <label className={styles.displayField}>
          <span>{t('reader.lineHeight')}</span>
          <Select
            value={String(display.lineHeight)}
            onChange={(value) => {
              const lineHeight = Number(value);
              onChange({ ...display, lineHeight }, t('reader.lineHeight'), String(lineHeight));
            }}
            options={LINE_HEIGHTS.map((height) => ({
              value: String(height),
              label: String(height),
            }))}
          />
        </label>

        <label className={styles.displayField}>
          <span>{t('reader.margin')}</span>
          <Select
            value={String(display.margin)}
            onChange={(value) => {
              const margin = Number(value);
              onChange({ ...display, margin }, t('reader.margin'), `${margin}%`);
            }}
            options={MARGINS.map((margin) => ({ value: String(margin), label: `${margin}%` }))}
          />
        </label>

        <label className={styles.displayField}>
          <span>{t('reader.flow')}</span>
          <Select
            value={display.flow}
            onChange={(value) => {
              const flow = value as ReaderFlow;
              onChange(
                { ...display, flow },
                t('reader.flow'),
                flow === 'paged' ? t('reader.flowPaged') : t('reader.flowScrolled'),
              );
            }}
            options={[
              { value: 'paged', label: t('reader.flowPaged') },
              { value: 'scrolled', label: t('reader.flowScrolled') },
            ]}
          />
        </label>

        <div className={styles.displayField}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={display.justify}
              onChange={(event) =>
                onChange(
                  { ...display, justify: event.target.checked },
                  t('reader.justify'),
                  onOff(event.target.checked, t),
                )
              }
            />
            <span>{t('reader.justify')}</span>
          </label>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={display.hyphenate}
              onChange={(event) =>
                onChange(
                  { ...display, hyphenate: event.target.checked },
                  t('reader.hyphenate'),
                  onOff(event.target.checked, t),
                )
              }
            />
            <span>{t('reader.hyphenate')}</span>
          </label>
        </div>
      </div>

      {display.theme === 'eink' && <p className={styles.formats}>{t('reader.themeEinkHint')}</p>}
    </section>
  );

  function step(direction: 1 | -1): void {
    const fontScale = stepFontScale(display.fontScale, direction);
    onChange({ ...display, fontScale }, t('reader.fontSize'), percent(fontScale));
  }
}

const percent = (scale: number): string => `${Math.round(scale * 100)}%`;

function themeName(theme: ReaderTheme, t: Translate): string {
  switch (theme) {
    case 'app':
      return t('reader.themeApp');
    case 'light':
      return t('reader.themeLight');
    case 'dark':
      return t('reader.themeDark');
    case 'sepia':
      return t('reader.themeSepia');
    case 'eink':
      return t('reader.themeEink');
  }
}

/** What a popup calls a switch's two states. Its own words: "Off" elsewhere means a disabled
 * source, and a reader should not have to notice that the same word is doing two jobs. */
function onOff(on: boolean, t: Translate): string {
  return on ? t('reader.on') : t('reader.off');
}
