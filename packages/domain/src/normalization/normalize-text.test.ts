import { describe, expect, it } from 'vitest';
import { normalizeText } from './normalize-text.js';

describe('normalizeText', () => {
  it.each([
    ['War and Peace', 'war and peace'],
    ['  War   and   Peace  ', 'war and peace'],
    ['WAR AND PEACE', 'war and peace'],
    ['The Shadow of the Wind', 'the shadow of the wind'],
    // diacritics
    ['La sombra del viento — Carlos Ruiz Zafón', 'la sombra del viento carlos ruiz zafon'],
    ['café', 'cafe'],
    ['Café', 'cafe'],
    // apostrophes must not introduce a word break, so both spellings collide
    ["Alice's Adventures in Wonderland", 'alices adventures in wonderland'],
    ['Alices Adventures in Wonderland', 'alices adventures in wonderland'],
    ['Alice’s Adventures in Wonderland', 'alices adventures in wonderland'], // curly apostrophe
    // other punctuation becomes a space, not nothing (avoids merging distinct words)
    ['Debt: The First 5000 Years', 'debt the first 5000 years'],
    ['Twenty-Thousand Leagues', 'twenty thousand leagues'],
    ['Guns, Germs, and Steel', 'guns germs and steel'],
    // non-Latin scripts are preserved (lowercased where the script has case), not transliterated
    ['Война и мир', 'война и мир'],
    ['ВОЙНА И МИР', 'война и мир'],
    // idempotent: normalizing an already-normalized string is a no-op
    ['war and peace', 'war and peace'],
  ])('normalizeText(%j) === %j', (input, expected) => {
    expect(normalizeText(input)).toBe(expected);
  });

  it('is deterministic across repeated calls', () => {
    const input = 'Carlos Ruiz Zafón — La sombra del viento';
    expect(normalizeText(input)).toBe(normalizeText(input));
  });
});
