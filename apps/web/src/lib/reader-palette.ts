'use client';

import type { ReaderPalette, ReaderTheme } from '@golden/reader';

/**
 * The colours a book is read on, taken from this application's own design tokens.
 *
 * `packages/reader` decides no colour (ADR-0008 — the tokens are the single place one is decided),
 * and it cannot read a stylesheet anyway: the book renders inside a document that `tokens.css` does
 * not reach. So the values are resolved here, in a document that *does* have the tokens, and handed
 * over as plain strings.
 *
 * `app` resolves to whatever the site is currently wearing, which is what makes it follow the
 * light/dark switch with no second set of values to keep in step.
 */
const TOKENS: Record<Exclude<ReaderTheme, 'app'>, ReaderPalette> = {
  light: {
    background: '--reader-light-bg',
    text: '--reader-light-text',
    link: '--reader-light-link',
  },
  dark: { background: '--reader-dark-bg', text: '--reader-dark-text', link: '--reader-dark-link' },
  sepia: {
    background: '--reader-sepia-bg',
    text: '--reader-sepia-text',
    link: '--reader-sepia-link',
  },
  eink: { background: '--reader-eink-bg', text: '--reader-eink-text', link: '--reader-eink-link' },
};

const APP: ReaderPalette = { background: '--surface-1', text: '--text', link: '--accent' };

/** A last resort, not a design: used only if the stylesheet has not loaded when this first runs. */
const FALLBACK: ReaderPalette = { background: '#ffffff', text: '#111111', link: '#6f520f' };

export function paletteFor(theme: ReaderTheme, element?: Element | null): ReaderPalette {
  const target = element ?? (typeof document === 'undefined' ? null : document.documentElement);
  if (!target) return FALLBACK;

  const styles = getComputedStyle(target);
  const names = theme === 'app' ? APP : TOKENS[theme];
  const read = (name: string, fallback: string): string =>
    styles.getPropertyValue(name).trim() || fallback;

  return {
    background: read(names.background, FALLBACK.background),
    text: read(names.text, FALLBACK.text),
    link: read(names.link, FALLBACK.link),
  };
}
