'use client';

import { DEFAULT_DISPLAY, isDisplaySettings, type DisplaySettings } from '@golden/reader';

/**
 * How the reader has asked books to look, kept in their own browser.
 *
 * `localStorage` rather than IndexedDB, unlike the books themselves: this is a handful of numbers
 * that every open needs synchronously, and it belongs with the app's other preferences rather than
 * with the library.
 *
 * The write returns whether it landed, like every other preference helper here — a browser in
 * private mode accepts `setItem` and keeps nothing, and a settings panel that reports success for
 * that is promising a preference that dies on reload (CLAUDE.md).
 */

const STORAGE_KEY = 'btf.reader.display';

export function readDisplay(): DisplaySettings {
  if (typeof window === 'undefined') return DEFAULT_DISPLAY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DISPLAY;
    const parsed: unknown = JSON.parse(raw);
    // Merged onto the defaults rather than used as-is: a settings object written before a
    // preference existed is still the reader's, and the alternative is resetting all seven because
    // one was added.
    const merged = { ...DEFAULT_DISPLAY, ...(typeof parsed === 'object' ? parsed : {}) };
    return isDisplaySettings(merged) ? merged : DEFAULT_DISPLAY;
  } catch {
    // Private mode, storage switched off, or a hand-edited value. Defaults are a valid state.
    return DEFAULT_DISPLAY;
  }
}

/** `true` when the browser really kept it. Callers turn that into the popup's outcome. */
export function writeDisplay(display: DisplaySettings): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(display));
    return true;
  } catch {
    return false;
  }
}

/** Back to the defaults, and out of storage entirely — not "the defaults, written down". */
export function clearDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
