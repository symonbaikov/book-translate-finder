import { en } from './dictionaries/en';
import { DEFAULT_LOCALE, type Locale } from './locales';

/**
 * The shape every dictionary must satisfy, derived from English rather than hand-declared: adding
 * a key to `en` makes every other dictionary fail to compile until it has one too, which is what
 * keeps them from silently drifting into half-translated pages.
 *
 * Values are widened to `string`. `en` is declared `as const` so its keys are exact, but keeping
 * the literal *values* would require every translation to equal the English text, which is the
 * opposite of the point.
 */
export type Dictionary = Record<keyof typeof en, string>;

/** A translation with `{placeholders}` filled in. */
export function format(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  );
}

export type Translate = (key: keyof Dictionary, values?: Record<string, string | number>) => string;

export function makeTranslate(dictionary: Dictionary): Translate {
  return (key, values) => format(dictionary[key] ?? en[key] ?? String(key), values);
}

export { DEFAULT_LOCALE, type Locale };
