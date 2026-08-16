/**
 * How the book looks: the theme, the type, the shape of the page.
 *
 * Two rules shape this module.
 *
 * **It decides nothing about colour.** Every value comes in as a `ReaderPalette` the host reads out
 * of the application's own design tokens, because those tokens are "the single place a colour is
 * decided" ([ADR-0008](../../../docs/adr/0008-design-tokens-and-css-modules.md)) and this package
 * cannot import a stylesheet into a document it does not own. What it produces is CSS text for the
 * renderer to inject into each section of the book.
 *
 * **The book's own styling is overridden, not replaced.** An EPUB carries a stylesheet its designer
 * meant; a reader who has asked for larger type or an E-Ink screen means that more. So this sheet
 * sets what the reader asked for with `!important` on the elements that carry text, and leaves the
 * rest of the book's design alone.
 */

export const READER_THEMES = ['app', 'light', 'dark', 'sepia', 'eink'] as const;
export type ReaderTheme = (typeof READER_THEMES)[number];

export const FLOWS = ['paged', 'scrolled'] as const;
export type ReaderFlow = (typeof FLOWS)[number];

export interface ReaderPalette {
  readonly background: string;
  readonly text: string;
  readonly link: string;
}

export interface DisplaySettings {
  readonly theme: ReaderTheme;
  /** 0.8–2.0 of the reader's own default body size. Steps, not a slider — see `stepFontScale`. */
  readonly fontScale: number;
  readonly lineHeight: number;
  /** Per cent of the viewport kept clear at the sides. The renderer calls this `gap`. */
  readonly margin: number;
  readonly flow: ReaderFlow;
  readonly justify: boolean;
  readonly hyphenate: boolean;
}

export const DEFAULT_DISPLAY: DisplaySettings = {
  theme: 'app',
  fontScale: 1,
  lineHeight: 1.5,
  margin: 6,
  flow: 'paged',
  justify: true,
  hyphenate: true,
};

const FONT_SCALES = [0.8, 0.9, 1, 1.15, 1.3, 1.5, 1.75, 2] as const;
export const LINE_HEIGHTS = [1.3, 1.5, 1.8] as const;
export const MARGINS = [3, 6, 12] as const;

/**
 * The next size up or down, from a fixed ladder rather than by adding a delta.
 *
 * A ladder because the useful steps are not evenly spaced — the difference between 0.8 and 0.9
 * matters more than between 1.75 and 2.0 — and because a stored float that arrived by repeated
 * addition eventually reads `1.0000000000000002`.
 */
export function stepFontScale(current: number, direction: 1 | -1): number {
  const index = FONT_SCALES.findIndex((scale) => scale >= current - 0.001);
  const next = (index === -1 ? FONT_SCALES.length - 1 : index) + direction;
  return FONT_SCALES[Math.min(FONT_SCALES.length - 1, Math.max(0, next))] ?? current;
}

export function canStepFontScale(current: number, direction: 1 | -1): boolean {
  return stepFontScale(current, direction) !== current;
}

/** E-Ink is not a dark theme's opposite: it is the absence of everything a screen adds. */
export function isEink(theme: ReaderTheme): boolean {
  return theme === 'eink';
}

/**
 * The stylesheet the renderer injects into every section of the book.
 *
 * `prefers-reduced-motion` is honoured here as well as in E-Ink mode, because a reader who has asked
 * their system for less movement has already answered this question once.
 */
export function readerCss(display: DisplaySettings, palette: ReaderPalette): string {
  const eink = isEink(display.theme);
  return `
    @namespace epub "http://www.idpf.org/2007/ops";

    html, body {
      color: ${palette.text} !important;
      background: ${palette.background} !important;
      ${eink ? 'text-rendering: geometricPrecision;' : ''}
    }

    a:any-link { color: ${palette.link} !important; }

    p, li, blockquote, dd, div, td {
      line-height: ${display.lineHeight} !important;
      text-align: ${display.justify ? 'justify' : 'start'} !important;
      -webkit-hyphens: ${display.hyphenate ? 'auto' : 'manual'};
      hyphens: ${display.hyphenate ? 'auto' : 'manual'} !important;
      ${eink ? 'text-shadow: none !important;' : ''}
    }

    /* The book's own alignment attributes are a deliberate typographic choice by its designer —
       a centred title is not a paragraph that failed to justify. */
    [align="left"] { text-align: left !important; }
    [align="right"] { text-align: right !important; }
    [align="center"] { text-align: center !important; }

    pre { white-space: pre-wrap !important; }

    ${
      eink
        ? `/* E-Ink: an e-paper panel redraws slowly and has no greys worth trusting. Everything that
             fades, floats or shifts is removed rather than shortened. */
           *, *::before, *::after {
             transition: none !important;
             animation: none !important;
             box-shadow: none !important;
             text-shadow: none !important;
             filter: none !important;
             opacity: 1 !important;
           }
           img, svg { filter: grayscale(1) contrast(1.2) !important; }`
        : `@media (prefers-reduced-motion: reduce) {
             *, *::before, *::after {
               transition: none !important;
               animation: none !important;
             }
           }`
    }

    aside[epub|type~="endnote"],
    aside[epub|type~="footnote"],
    aside[epub|type~="note"],
    aside[epub|type~="rearnote"] { display: none; }
  `;
}

/**
 * The attributes the paginator lays out from.
 *
 * `flow` and `gap` are its own names, and `max-column-count: 1` is what makes E-Ink single-column:
 * two columns on a small e-reader means a line length nobody chose and a page turn that redraws
 * twice as much as it needs to.
 */
export function paginatorAttributes(display: DisplaySettings): Record<string, string> {
  return {
    flow: display.flow,
    gap: `${display.margin}%`,
    'max-column-count': isEink(display.theme) ? '1' : '2',
  };
}

/** The font size the host sets on the view, which the book's own `em` sizes are relative to. */
export function rootFontSize(display: DisplaySettings, base = 16): string {
  return `${Math.round(base * display.fontScale * 100) / 100}px`;
}

/** Guards what comes back out of storage: a preference file outlives the code that wrote it. */
export function isDisplaySettings(value: unknown): value is DisplaySettings {
  if (typeof value !== 'object' || value === null) return false;
  const display = value as Partial<DisplaySettings>;
  return (
    typeof display.theme === 'string' &&
    (READER_THEMES as readonly string[]).includes(display.theme) &&
    typeof display.fontScale === 'number' &&
    typeof display.lineHeight === 'number' &&
    typeof display.margin === 'number' &&
    typeof display.flow === 'string' &&
    (FLOWS as readonly string[]).includes(display.flow) &&
    typeof display.justify === 'boolean' &&
    typeof display.hyphenate === 'boolean'
  );
}
