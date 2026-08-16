import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DISPLAY,
  canStepFontScale,
  isDisplaySettings,
  paginatorAttributes,
  readerCss,
  rootFontSize,
  stepFontScale,
  type ReaderPalette,
} from './display.js';

const palette: ReaderPalette = { background: '#ffffff', text: '#111111', link: '#0000ee' };

describe('stepFontScale', () => {
  it('moves along a fixed ladder rather than adding a delta', () => {
    expect(stepFontScale(1, 1)).toBe(1.15);
    expect(stepFontScale(1, -1)).toBe(0.9);
    // A float that arrived by repeated addition eventually reads 1.0000000000000002; a ladder
    // cannot.
    expect(stepFontScale(stepFontScale(stepFontScale(1, 1), 1), -1)).toBe(1.15);
  });

  it('stops at both ends, and says so before the button is pressed', () => {
    expect(stepFontScale(0.8, -1)).toBe(0.8);
    expect(stepFontScale(2, 1)).toBe(2);
    expect(canStepFontScale(0.8, -1)).toBe(false);
    expect(canStepFontScale(2, 1)).toBe(false);
    expect(canStepFontScale(1, 1)).toBe(true);
  });
});

describe('readerCss', () => {
  it('paints with the palette it was given and decides no colour of its own', () => {
    const css = readerCss(DEFAULT_DISPLAY, palette);
    expect(css).toContain('#ffffff');
    expect(css).toContain('#111111');
    // ADR-0008: the tokens are the single place a colour is decided, and this package is not it.
    expect(new Set(css.match(/#[0-9a-f]{3,8}/gi))).toEqual(
      new Set(['#ffffff', '#111111', '#0000ee']),
    );
  });

  it('keeps the book’s own alignment attributes even when the reader justifies', () => {
    // A centred title is a typographic decision, not a paragraph that failed to justify.
    const css = readerCss({ ...DEFAULT_DISPLAY, justify: true }, palette);
    expect(css).toContain('[align="center"] { text-align: center !important; }');
  });

  it('removes everything that moves in E-Ink, and only respects the system otherwise', () => {
    const eink = readerCss({ ...DEFAULT_DISPLAY, theme: 'eink' }, palette);
    expect(eink).toContain('animation: none !important');
    expect(eink).toContain('grayscale(1)');
    // Unconditionally, not inside a media query: the reader chose the mode, not their OS.
    expect(eink).not.toContain('prefers-reduced-motion');

    const normal = readerCss(DEFAULT_DISPLAY, palette);
    expect(normal).toContain('prefers-reduced-motion');
    expect(normal).not.toContain('grayscale(1)');
  });

  it('carries the reader’s line height and hyphenation into the book', () => {
    const css = readerCss({ ...DEFAULT_DISPLAY, lineHeight: 1.8, hyphenate: false }, palette);
    expect(css).toContain('line-height: 1.8 !important');
    expect(css).toContain('hyphens: manual !important');
  });
});

describe('paginatorAttributes', () => {
  it('gives E-Ink a single column', () => {
    // Two columns on an e-reader is a line length nobody chose and twice the panel to redraw.
    expect(paginatorAttributes({ ...DEFAULT_DISPLAY, theme: 'eink' })['max-column-count']).toBe(
      '1',
    );
    expect(paginatorAttributes(DEFAULT_DISPLAY)['max-column-count']).toBe('2');
  });

  it('passes the flow and the margin in the renderer’s own names', () => {
    const attributes = paginatorAttributes({ ...DEFAULT_DISPLAY, flow: 'scrolled', margin: 12 });
    expect(attributes['flow']).toBe('scrolled');
    expect(attributes['gap']).toBe('12%');
  });
});

describe('rootFontSize', () => {
  it('scales the base the book’s own em sizes are relative to', () => {
    expect(rootFontSize(DEFAULT_DISPLAY)).toBe('16px');
    expect(rootFontSize({ ...DEFAULT_DISPLAY, fontScale: 1.5 })).toBe('24px');
  });
});

describe('isDisplaySettings', () => {
  it('accepts what this version writes and rejects what it cannot use', () => {
    expect(isDisplaySettings(DEFAULT_DISPLAY)).toBe(true);
    expect(isDisplaySettings({ ...DEFAULT_DISPLAY, theme: 'neon' })).toBe(false);
    expect(isDisplaySettings({ ...DEFAULT_DISPLAY, flow: 'sideways' })).toBe(false);
    expect(isDisplaySettings({ ...DEFAULT_DISPLAY, fontScale: '1.5' })).toBe(false);
    expect(isDisplaySettings(null)).toBe(false);
  });
});
