import { describe, expect, it } from 'vitest';
import {
  OUTCOME_PRESENTATION,
  outcomeOfSessionWrite,
  outcomeOfWrite,
  presentOutcome,
  type SettingOutcome,
} from './setting-change';

/**
 * Derived from the map, not written out again.
 *
 * It was written out again, once, and a fifth outcome then slipped past every test in this file
 * without failing one of them.
 */
const OUTCOMES = Object.keys(OUTCOME_PRESENTATION) as SettingOutcome[];

describe('outcomeOfWrite', () => {
  it('reports a stored new value as saved', () => {
    expect(outcomeOfWrite(true, 'set')).toBe('saved');
  });

  it('separates going back to the default from setting a value', () => {
    expect(outcomeOfWrite(true, 'clear')).toBe('cleared');
  });

  // The case the whole module exists for: the reader clicked, the control moved, and the browser
  // refused to keep the value. Since every panel re-reads storage, that is a change that did not
  // happen — reporting it as `saved` would promise a preference nothing is actually using.
  it('never reports saved or cleared when storage refused the write', () => {
    expect(outcomeOfWrite(false, 'set')).toBe('unstored');
    expect(outcomeOfWrite(false, 'clear')).toBe('unstored');
  });
});

describe('presentOutcome', () => {
  it('gives every outcome its own tone, except the one pair that means the same thing twice', () => {
    // `unstored` and `session` share amber on purpose: both say "next time this will not be here",
    // and they differ in whether it is in effect *now* — which is the sentence's job, not the
    // colour's. Every other outcome is a colour of its own.
    const tones = OUTCOMES.map((outcome) => presentOutcome(outcome).tone);
    expect(new Set(tones).size).toBe(OUTCOMES.length - 1);
    expect(presentOutcome('session').tone).toBe(presentOutcome('unstored').tone);
  });

  it('keeps outcomes the reader may have to act on on screen longer', () => {
    expect(presentOutcome('unstored').durationMs).toBeGreaterThan(
      presentOutcome('saved').durationMs,
    );
    expect(presentOutcome('failed').durationMs).toBeGreaterThan(
      presentOutcome('cleared').durationMs,
    );
  });

  // Only this outcome may overwrite the caller's sentence; doing it for `failed` too would drop
  // the server's own reason, which is the only thing that explains a refused bookmark.
  it('replaces the caller sentence for exactly one outcome', () => {
    const replacing = OUTCOMES.filter((outcome) => presentOutcome(outcome).storageRefused);
    expect(replacing).toEqual(['unstored']);
  });

  it('appends for exactly one outcome, and never both appends and replaces', () => {
    const appending = OUTCOMES.filter((outcome) => presentOutcome(outcome).storageForgot);
    expect(appending).toEqual(['session']);
    for (const outcome of OUTCOMES) {
      const { storageRefused, storageForgot } = presentOutcome(outcome);
      expect(storageRefused && storageForgot, outcome).toBe(false);
    }
  });

  it('names a status key per outcome, so the popup always has a word for what happened', () => {
    for (const outcome of OUTCOMES) {
      expect(OUTCOME_PRESENTATION[outcome].statusKey).toBe(`settings.status.${outcome}`);
    }
  });
});

describe('outcomeOfSessionWrite', () => {
  it('reports a refused write as `session` — the change is on screen, just not remembered', () => {
    // The reading display is the only caller: refusing to *show* readers the type size they chose,
    // because the browser will not keep it, would be a second and worse failure.
    expect(outcomeOfSessionWrite(false, 'set')).toBe('session');
    expect(outcomeOfSessionWrite(false, 'clear')).toBe('session');
  });

  it('is indistinguishable from an ordinary write when storage accepted it', () => {
    expect(outcomeOfSessionWrite(true, 'set')).toBe(outcomeOfWrite(true, 'set'));
    expect(outcomeOfSessionWrite(true, 'clear')).toBe(outcomeOfWrite(true, 'clear'));
  });
});
