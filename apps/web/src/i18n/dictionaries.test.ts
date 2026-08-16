import { describe, expect, it } from 'vitest';
import { ar } from './dictionaries/ar';
import { de } from './dictionaries/de';
import { en } from './dictionaries/en';
import { es } from './dictionaries/es';
import { fr } from './dictionaries/fr';
import { it as itDictionary } from './dictionaries/it';
import { ja } from './dictionaries/ja';
import { ko } from './dictionaries/ko';
import { nl } from './dictionaries/nl';
import { pl } from './dictionaries/pl';
import { pt } from './dictionaries/pt';
import { ru } from './dictionaries/ru';
import { tr } from './dictionaries/tr';
import { uk } from './dictionaries/uk';
import { zh } from './dictionaries/zh';
import type { Dictionary } from './dictionary';

/**
 * What TypeScript cannot check about a translation.
 *
 * The `Dictionary` type already makes a missing key a compile error, which is why nothing here
 * tests for one. What it cannot see is the *inside* of a string: a translation that drops
 * `{title}`, or invents `{name}`, compiles perfectly and renders a sentence with a hole in it — or
 * with a literal `{name}` in the middle of it, which is worse because it looks like a bug in the
 * book rather than in us.
 *
 * Duplicate keys are not checked here either: an object literal collapses them before this file
 * could see one, and ESLint's `no-dupe-keys` already fails the build on it. This has been worth
 * saying out loud since the reader's strings arrived in six appended blocks.
 */

const TRANSLATIONS: ReadonlyArray<readonly [string, Dictionary]> = [
  ['ar', ar],
  ['de', de],
  ['es', es],
  ['fr', fr],
  ['it', itDictionary],
  ['ja', ja],
  ['ko', ko],
  ['nl', nl],
  ['pl', pl],
  ['pt', pt],
  ['ru', ru],
  ['tr', tr],
  ['uk', uk],
  ['zh', zh],
];

const placeholders = (value: string): string[] =>
  [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1] ?? '').sort();

describe('every translation', () => {
  it.each(TRANSLATIONS)('%s fills the same placeholders English does', (_locale, dictionary) => {
    const mismatched = Object.keys(en)
      .map((key) => {
        const typedKey = key as keyof Dictionary;
        const want = placeholders(en[typedKey]);
        const got = placeholders(dictionary[typedKey] ?? '');
        return want.join() === got.join() ? null : `${key}: want ${want} got ${got}`;
      })
      .filter(Boolean);

    expect(mismatched).toEqual([]);
  });

  it.each(TRANSLATIONS)('%s leaves nothing blank', (_locale, dictionary) => {
    const blank = Object.keys(en).filter((key) => !dictionary[key as keyof Dictionary]?.trim());
    expect(blank).toEqual([]);
  });

  it.each(TRANSLATIONS)('%s has no key that is only the key again', (_locale, dictionary) => {
    // A placeholder someone left behind — `'reader.theme': 'reader.theme'` — renders as gibberish
    // and is invisible to the type checker.
    const echoed = Object.keys(en).filter((key) => dictionary[key as keyof Dictionary] === key);
    expect(echoed).toEqual([]);
  });
});

describe('the reader’s own strings', () => {
  const readerKeys = Object.keys(en).filter(
    (key) => key.startsWith('reader.') || key.startsWith('settings.reader.'),
  );

  it('exist in every language, and there are as many as this phase added', () => {
    // Not a magic number for its own sake: it fails when a string is added to `en` and the other
    // fourteen are forgotten in a later phase, which the type system catches only for `Dictionary`
    // members — and every dictionary here satisfies that by construction.
    expect(readerKeys.length).toBeGreaterThanOrEqual(60);
    for (const [locale, dictionary] of TRANSLATIONS) {
      const missing = readerKeys.filter((key) => !dictionary[key as keyof Dictionary]?.trim());
      expect(missing, locale).toEqual([]);
    }
  });

  it('says what a preference now affects, rather than only that it was saved', () => {
    // The settings-popup rule in CLAUDE.md: "Saved" alone is not a message. Every popup body the
    // reader surfaces send is a sentence, so a one-word body is the shape of the mistake.
    const bodies = Object.keys(en)
      .filter((key) => key.startsWith('settings.reader.'))
      .filter((key) => !key.endsWith('Title'));

    for (const key of bodies) {
      expect(en[key as keyof Dictionary].split(' ').length, key).toBeGreaterThan(6);
    }
  });
});
