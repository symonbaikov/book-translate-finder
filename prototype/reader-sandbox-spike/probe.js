/**
 * Everything measured inside the box.
 *
 * Two independent probes, because one of them alone would be unreadable:
 *
 *  A. *Browser*: can a document on an opaque origin read the DOM of a nested frame it created?
 *     No foliate involved. If this is `null`, nothing built on foliate's paginator can work here,
 *     and the reason is the platform rather than the library.
 *  B. *foliate*: open the fixture and turn pages for real. This is the question the phase actually
 *     asks; probe A only explains the answer.
 *
 * Every probe is individually timed out. A hang has to arrive as a result — "timeout" is a finding,
 * a killed run is not.
 */

const violations = [];
addEventListener('securitypolicyviolation', (event) => {
  violations.push(`${event.violatedDirective} ← ${event.blockedURI}`);
});

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(`timeout after ${ms}ms (${label})`), ms)),
  ]);

/** Probe A. `sandboxAttr === null` means the attribute is not set at all. */
function nestedFrameProbe(kind, sandboxAttr) {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    if (sandboxAttr !== null) iframe.setAttribute('sandbox', sandboxAttr);
    iframe.style.cssText = 'width:100px;height:100px;position:absolute;left:-9999px';

    // Polled rather than settled on the first `load`: a frame fires `load` for its initial
    // about:blank too, and reporting "document-without-marker" for that would be a measurement of
    // our own timing rather than of the browser.
    const deadline = Date.now() + 3000;
    const settle = () => {
      let verdict;
      try {
        const doc = iframe.contentDocument;
        if (!doc) verdict = 'null';
        else if (doc.getElementById('marker')) verdict = 'readable';
        else if (Date.now() < deadline) {
          setTimeout(settle, 100);
          return;
        } else verdict = 'document-without-marker';
      } catch (error) {
        verdict = `throws ${error.name}`;
      }
      iframe.remove();
      resolve(verdict);
    };

    iframe.addEventListener('load', settle);
    document.body.append(iframe);

    const html = '<!doctype html><meta charset="utf-8"><p id="marker">readable</p>';
    if (kind === 'srcdoc') {
      iframe.srcdoc = html;
    } else {
      try {
        iframe.src = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
      } catch (error) {
        iframe.remove();
        resolve(`createObjectURL threw ${error.name}`);
      }
    }
    // A frame that never fires `load` is a result too.
    setTimeout(settle, 5000);
  });
}

/**
 * The fallback branch's hardening, applied the crude way.
 *
 * `paginator.js` sets `sandbox="allow-same-origin allow-scripts"` on every content frame, i.e. it
 * runs the book's JavaScript on purpose. In the real package this would be a one-line vendor patch;
 * here it is an interception, because a spike that edits its own vendor tree cannot then answer
 * "does upstream still work".
 */
function stripAllowScriptsFromContentFrames() {
  const original = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function setAttribute(name, value) {
    if (this instanceof HTMLIFrameElement && name === 'sandbox') {
      return original.call(
        this,
        name,
        String(value)
          .replace(/\ballow-scripts\b/g, '')
          .trim(),
      );
    }
    return original.call(this, name, value);
  };
}

/** Probe B. Opens the fixture and asks the renderer to move. */
async function foliateProbe(buffer) {
  const result = {
    opened: false,
    sections: null,
    relocations: [],
    error: null,
  };
  try {
    await import('./vendor/foliate/view.js');
    const view = document.getElementById('view');
    view.addEventListener('relocate', (event) => {
      const { fraction, location } = event.detail ?? {};
      result.relocations.push({
        fraction: typeof fraction === 'number' ? Number(fraction.toFixed(4)) : null,
        current: location?.current ?? null,
        total: location?.total ?? null,
      });
    });

    const file = new File([buffer], 'spike.epub', { type: 'application/epub+zip' });
    await view.open(file);
    result.opened = true;
    result.sections = view.book?.sections?.length ?? null;

    // Give the paginator a frame to lay out in before asking it to move; then three page turns.
    await new Promise((resolve) => setTimeout(resolve, 500));
    for (let i = 0; i < 3; i += 1) {
      await view.next();
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  } catch (error) {
    result.error = `${error.name}: ${error.message}`;
  }
  return result;
}

addEventListener('message', async (event) => {
  if (event.data?.type !== 'spike-book') return;

  if (event.data.scripts === 'off') stripAllowScriptsFromContentFrames();

  const report = {
    // `self.origin` and not `location.origin`: the latter is derived from the URL and happily
    // reports `http://localhost:3200` for a document whose actual origin is opaque. Measuring the
    // wrong one is how a sandbox gets called verified when it was never checked.
    origin: String(self.origin),
    locationOrigin: String(location.origin),
    opaqueOrigin: self.origin === 'null' || self.origin === '',
    storage: (() => {
      try {
        localStorage.setItem('spike', '1');
        localStorage.removeItem('spike');
        return 'available';
      } catch (error) {
        return `throws ${error.name}`;
      }
    })(),
    bookBytes: event.data.buffer.byteLength,
    nestedFrame: {},
    foliate: null,
    violations,
  };

  // The first variant is exactly what `paginator.js` sets on its content frame; the others are the
  // alternatives a fallback design would have to reach for.
  for (const [label, kind, attr] of [
    ['blob + allow-same-origin allow-scripts', 'blob', 'allow-same-origin allow-scripts'],
    ['blob + no sandbox attribute', 'blob', null],
    ['srcdoc + allow-same-origin allow-scripts', 'srcdoc', 'allow-same-origin allow-scripts'],
  ]) {
    report.nestedFrame[label] = await withTimeout(nestedFrameProbe(kind, attr), 8000, label);
  }

  report.foliate = await withTimeout(foliateProbe(event.data.buffer), 20_000, 'foliate');

  parent.postMessage({ type: 'spike-report', report }, '*');
});
