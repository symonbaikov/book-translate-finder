/**
 * What `sandbox` value the book's own frames carry — and which of the two walls is holding.
 *
 * The reader's default is the strict one: no `allow-scripts`, so the frame cannot execute the
 * book's JavaScript at all (ADR-0013 §3). Upstream warns in a comment that it wanted that token
 * "for events because of WebKit bug 218086", and spike 11.1b measured what that costs — with real
 * mouse and keyboard input, not a synthetic dispatch:
 *
 * | engine   | with `allow-scripts` | without                |
 * | -------- | -------------------- | ---------------------- |
 * | Chromium | click, key delivered | click, key delivered   |
 * | Firefox  | click, key delivered | click, key delivered   |
 * | WebKit   | click, key delivered | **nothing delivered**  |
 *
 * On WebKit the strict frame is a page nobody can tap, which is most of the mobile reading this
 * feature exists for. So on an engine that swallows input, the reader keeps `allow-scripts` and
 * leans on the *other* wall — the route's `script-src 'self'`, which spike 11.1 measured blocking
 * the book's inline script, its `blob:` script and its inline event handler in all three engines,
 * WebKit included. One wall there instead of two, stated rather than hidden, and the exception
 * disappears by itself the day WebKit fixes the bug.
 *
 * The choice is made from an observation, never from a user-agent string: what matters is whether
 * *this* engine delivers events, and the probe that answers it lives in the reading surface where
 * there is a DOM to run it in.
 */

/** No script execution in the frame at all. The default, and the stronger of the two. */
export const SANDBOX_WITHOUT_SCRIPTS = 'allow-same-origin';

/** Upstream's value. Only for engines that deliver no input without it — WebKit today. */
export const SANDBOX_WITH_SCRIPTS = 'allow-same-origin allow-scripts';

export interface ContentFramePolicy {
  /** The `sandbox` attribute to force onto every frame the renderer creates. */
  readonly sandbox: string;
  /**
   * How many independent walls stand between the book's code and this origin.
   *
   * `2` — the frame refuses script *and* the CSP has no source that could serve it.
   * `1` — the CSP only. Not a failure, and not something to leave unsaid either: a CSP edit that
   * adds `'unsafe-inline'` for some unrelated widget is a one-line change that would, here, also
   * re-enable a stranger's JavaScript.
   */
  readonly walls: 1 | 2;
  readonly reason: string;
}

/**
 * Decide from a measurement, not from a browser name.
 *
 * `deliversEventsWithoutScripts` comes from probing this engine once: create a frame with
 * `SANDBOX_WITHOUT_SCRIPTS`, dispatch a click into it, see whether a listener hears it. The
 * synthetic probe and real mouse input agreed in all three engines (spike 11.1b), which is what
 * makes the cheap version usable at startup.
 */
export function contentFramePolicy(deliversEventsWithoutScripts: boolean): ContentFramePolicy {
  return deliversEventsWithoutScripts
    ? {
        sandbox: SANDBOX_WITHOUT_SCRIPTS,
        walls: 2,
        reason:
          'This engine delivers input to a frame that cannot run scripts, so the book gets neither.',
      }
    : {
        sandbox: SANDBOX_WITH_SCRIPTS,
        walls: 1,
        reason:
          'This engine delivers no input to a frame without allow-scripts (WebKit bug 218086), so ' +
          'the frame keeps it and the route CSP is what stops the book from running.',
      };
}
