import { describe, expect, it } from 'vitest';
import {
  SANDBOX_WITHOUT_SCRIPTS,
  SANDBOX_WITH_SCRIPTS,
  contentFramePolicy,
} from './content-frame.js';

describe('contentFramePolicy', () => {
  it('refuses the book scripts outright where the engine still delivers input', () => {
    const policy = contentFramePolicy(true);
    expect(policy.sandbox).toBe(SANDBOX_WITHOUT_SCRIPTS);
    expect(policy.walls).toBe(2);
  });

  it('keeps allow-scripts where the engine would otherwise deliver no input at all', () => {
    // WebKit bug 218086, measured with real clicks and keys in spike 11.1b: a frame without
    // `allow-scripts` hears nothing, so a reader could not turn a page by tapping it.
    const policy = contentFramePolicy(false);
    expect(policy.sandbox).toBe(SANDBOX_WITH_SCRIPTS);
    expect(policy.walls).toBe(1);
    expect(policy.reason).toContain('CSP');
  });

  it('never grants anything beyond same-origin and scripts', () => {
    // `allow-popups`, `allow-top-navigation`, `allow-forms` and friends are how a book would reach
    // out of the page; neither branch may acquire one by accident.
    for (const deliversEvents of [true, false]) {
      const granted = contentFramePolicy(deliversEvents).sandbox.split(' ');
      expect(granted.every((token) => ['allow-same-origin', 'allow-scripts'].includes(token))).toBe(
        true,
      );
    }
  });
});
