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

/**
 * The global the patched renderer reads, and the only supported way to write it.
 *
 * A global is not how anything else in this codebase is configured, and it is here for one reason:
 * the value has to reach code inside a vendored library at the moment it creates a frame, and that
 * library takes no options. The alternatives were worse — monkey-patching `setAttribute` for the
 * whole document, or forking the renderer's frame handling outright.
 *
 * The fallback in the vendored `??` is the *strict* value, so forgetting to call this yields the
 * safe frame. That is deliberate: the failure mode of a missing call should be a Safari reader who
 * cannot tap, not every reader running a stranger's JavaScript.
 */
const GLOBAL_KEY = '__goldenReaderContentFrameSandbox';

/**
 * Probe this engine, once, and install the policy it implies.
 *
 * Must be called before the first `view.open()` — the frame is created during it, and an attribute
 * decided afterwards would apply to the next book rather than this one.
 */
export async function installContentFramePolicy(
  documentRef: Document = globalThis.document,
): Promise<ContentFramePolicy> {
  const policy = contentFramePolicy(await deliversEventsWithoutScripts(documentRef));
  (globalThis as Record<string, unknown>)[GLOBAL_KEY] = policy.sandbox;
  return policy;
}

/** What is installed right now, for a test or a diagnostic. `null` before the probe has run. */
export function installedContentFrameSandbox(): string | null {
  const value = (globalThis as Record<string, unknown>)[GLOBAL_KEY];
  return typeof value === 'string' ? value : null;
}

/**
 * Does this engine deliver events to a frame that cannot run scripts?
 *
 * A synthetic click rather than a real one, because nothing in a page can produce a trusted event —
 * and it is enough: in all three engines the synthetic answer matched what a real mouse and
 * keyboard did (spike 11.1b). WebKit hears neither; Chromium and Firefox hear both.
 *
 * Answers `false` on anything unexpected — a frame that never loads, a `contentDocument` that is
 * null, a throw. `false` is the branch that keeps the reader usable, and a probe that cannot
 * measure should not be the thing that makes a page untappable.
 */
async function deliversEventsWithoutScripts(documentRef: Document): Promise<boolean> {
  if (!documentRef?.body) return false;
  const frame = documentRef.createElement('iframe');
  frame.setAttribute('sandbox', SANDBOX_WITHOUT_SCRIPTS);
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:absolute;width:1px;height:1px;left:-9999px;border:0';

  try {
    documentRef.body.append(frame);
    frame.src = URL.createObjectURL(
      new Blob(['<!doctype html><meta charset="utf-8"><p id="probe">.</p>'], { type: 'text/html' }),
    );

    // Polled for the marker rather than settled on the first `load`, and this is not a detail: a
    // frame fires `load` for its initial about:blank too, so trusting that event finds a document
    // with nothing in it, concludes "no events", and quietly drops every engine to one wall. It did
    // exactly that the first time this ran in a browser.
    const inner = await waitForProbeDocument(frame);
    const target = inner?.getElementById('probe');
    if (!inner || !target) return false;

    let heard = false;
    inner.addEventListener('click', () => {
      heard = true;
    });
    const view = inner.defaultView ?? globalThis;
    target.dispatchEvent(new view.MouseEvent('click', { bubbles: true }));
    return heard;
  } catch {
    return false;
  } finally {
    frame.remove();
  }
}

/** The frame's document once the marker is in it, or `null` if it never arrives. */
function waitForProbeDocument(
  frame: HTMLIFrameElement,
  timeoutMs = 1000,
): Promise<Document | null> {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;
    const poll = (): void => {
      let inner: Document | null = null;
      try {
        inner = frame.contentDocument;
      } catch {
        resolve(null);
        return;
      }
      if (inner?.getElementById('probe')) resolve(inner);
      else if (Date.now() >= deadline) resolve(inner);
      else setTimeout(poll, 25);
    };
    poll();
  });
}
