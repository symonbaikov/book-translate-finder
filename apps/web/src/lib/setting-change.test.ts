import { describe, expect, it } from 'vitest';
import {
  OUTCOME_PRESENTATION,
  outcomeOfWrite,
  presentOutcome,
  type SettingOutcome,
} from './setting-change';

const OUTCOMES: SettingOutcome[] = ['saved', 'cleared', 'unstored', 'failed'];

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
  it('gives every outcome its own tone, so two of them are never confusable by colour', () => {
    const tones = OUTCOMES.map((outcome) => presentOutcome(outcome).tone);
    expect(new Set(tones).size).toBe(OUTCOMES.length);
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

  it('names a status key per outcome, so the popup always has a word for what happened', () => {
    for (const outcome of OUTCOMES) {
      expect(OUTCOME_PRESENTATION[outcome].statusKey).toBe(`settings.status.${outcome}`);
    }
  });
});
