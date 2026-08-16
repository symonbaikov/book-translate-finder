import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * The onboarding tour has to wear whichever theme the page is wearing, and that is not something a
 * screenshot can keep true.
 *
 * The tour is the only part of this interface drawn by a third-party library. Shepherd renders its
 * own DOM into `document.body` and ships a stylesheet full of literal colours — `#fff`, `#3288e6`,
 * `rgba(0,0,0,.75)` — every one of which is a light-theme value that would survive into the dark
 * theme as a white card with blue buttons. `OnboardingTour.css` exists to replace all of them with
 * semantic tokens, which is what makes the popup follow `prefers-color-scheme` with no second set
 * of values and no JavaScript.
 *
 * Two things can quietly break that, and neither shows up in a type check:
 *
 * 1. Someone adds a colour to our own stylesheet by hand. One `#1c1e23` looks right in the theme it
 *    was written in and is invisible in the other.
 * 2. Shepherd's stylesheet grows a colour on a class we never override — the ordinary outcome of a
 *    version bump, and one that lands on the reader rather than in the diff.
 *
 * Hence a test rather than a note. It is a coverage check, not a rendering one: it proves that
 * every class Shepherd paints is also spoken about in our file, not that what we say about it is
 * beautiful. That part is what the design tokens are for.
 */

const read = (relative: string): string =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');

/** Comments talk about colours in prose — "50% black", "near-black, not white" — and are not code. */
const withoutComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');

const ours = withoutComments(read('./OnboardingTour.css'));
// Resolved through the package rather than by walking up to a `node_modules` directory: pnpm is
// free to put it in the app's own tree or hoist it, and this asks the same question the bundler
// asks when `OnboardingTour.tsx` imports the very same file.
const shepherd = withoutComments(
  readFileSync(createRequire(import.meta.url).resolve('shepherd.js/dist/css/shepherd.css'), 'utf8'),
);

const COLOUR_LITERAL = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(/gi;

describe('the onboarding tour stylesheet', () => {
  it('names no colour of its own — every one comes from a token', () => {
    expect(ours.match(COLOUR_LITERAL) ?? []).toEqual([]);
  });

  it('overrides every class the library paints a colour on', () => {
    // Shepherd's stylesheet is minified and has no nested at-rules, so one pass over
    // `selector { body }` is enough to find which classes carry a hardcoded colour.
    const painted = new Set<string>();
    for (const [, selector, body] of shepherd.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!COLOUR_LITERAL.test(body ?? '')) continue;
      COLOUR_LITERAL.lastIndex = 0; // the regex is global; `test` would otherwise resume mid-string
      for (const [, className] of (selector ?? '').matchAll(/\.([a-z0-9-]+)/gi)) {
        if (className) painted.add(className);
      }
    }

    // A guard on the guard: if this ever comes back empty — a stylesheet that moved, a parse that
    // silently failed — the assertion below would pass while checking nothing at all.
    expect(painted.size).toBeGreaterThan(5);

    const unaddressed = [...painted].filter((className) => !ours.includes(`.${className}`)).sort();
    expect(unaddressed).toEqual([]);
  });
});
