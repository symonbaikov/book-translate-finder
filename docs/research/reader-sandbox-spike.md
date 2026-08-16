# Spike 11.1 — can foliate-js paginate inside an opaque origin?

- **Date:** 2026-08-16
- **Asks:** [plan.md Phase 11.1](../plan.md), the gate the rest of the phase was made to wait on
- **Code:** [`prototype/reader-sandbox-spike/`](../../prototype/reader-sandbox-spike) — `bash vendor.sh && python3 fixture/make-epub.py && node run.mjs`
- **Measured against:** foliate-js @ `78914aef4466eb960965702401634c2cb348e9b1`, Chromium 1234,
  Firefox 1538, WebKit 2336 (Playwright's builds), headless, Linux

## Answer

**No. In all three engines, and for the same reason in all three.** The reader cannot live on an
opaque origin, so the four-layer isolation copied from ADR-0010 §3 is not available to this feature.
The fallback branch the plan named in advance is the one that ships — and it turned out to have two
independent walls rather than the one it was credited with, both of which were measured.

| Case                                                           | Chromium               | Firefox                | WebKit                 |
| -------------------------------------------------------------- | ---------------------- | ---------------------- | ---------------------- |
| control · ordinary same-origin frame                           | pages turn             | pages turn             | pages turn             |
| **A · opaque origin** (`sandbox="allow-scripts"`, the design)  | **does not paginate**  | **does not paginate**  | **does not paginate**  |
| B1 · same-origin route, hostile book, foliate as it ships      | pages turn · escaped   | pages turn · escaped   | pages turn · escaped   |
| B2 · same-origin route, hostile book, `allow-scripts` stripped | pages turn · contained | pages turn · contained | pages turn · contained |
| B3 · same-origin route, hostile book, route CSP only           | pages turn · contained | pages turn · contained | pages turn · contained |

## Why A fails, and why it is the platform rather than the library

`paginator.js` renders each spine document into a nested `<iframe>` and then **measures it** — it
reads `contentDocument`, applies CSS columns, and asks for scroll widths. A probe that uses no
foliate code at all shows the platform's answer directly. From a document that has been put on an
opaque origin, a nested frame is unreachable in every form a renderer could reach for:

| Nested frame created as                                | Chromium | Firefox | WebKit |
| ------------------------------------------------------ | -------- | ------- | ------ |
| `blob:` + `sandbox="allow-same-origin allow-scripts"`  | `null`   | `null`  | `null` |
| `blob:` + no `sandbox` attribute                       | `null`   | `null`  | `null` |
| `srcdoc` + `sandbox="allow-same-origin allow-scripts"` | `null`   | `null`  | `null` |

The nested document inherits the parent's sandbox flags and cannot re-grant `allow-same-origin`, so
it lands on its **own** opaque origin — a different one from its parent's. WebKit says so in as many
words: _"Both frames are sandboxed and lack the allow-same-origin flag."_ Chromium and Firefox report
it as the resulting null dereference inside the paginator (`Cannot read properties of null (reading
'head')`). This is not a bug anyone will fix; it is what the sandbox is for.

So the choice was never "four layers or three". It was "a reader, or no reader".

**One measurement error worth recording**, because it would have produced a false green: the first
run of this probe reported `location.origin` and concluded the document was _not_ opaque. It is
derived from the URL, and happily says `http://localhost:3200` for a document whose actual origin is
opaque. `self.origin` is the one that answers the question (`"null"`), and `localStorage` throwing
`SecurityError` is the corroborating fact. The addon suite already used `window.origin`; this probe
now does too.

## What B1 proves, and why it changes 11.3 from a nicety to a requirement

foliate-js sets `sandbox="allow-same-origin allow-scripts"` on its content frames — it runs the
book's JavaScript **on purpose**, because scripted EPUBs exist and it is a general-purpose renderer.
On an ordinary route, with no further measures, the hostile fixture escaped four ways in every
engine:

- its inline `<script>` reached the network (`fetch` to a beacon the spike's server counts),
- its external `<script src>` did the same,
- an `onerror=` handler on a broken image did the same,
- and `top.postMessage` reached the host page, which is the reader's own document.

That is the default. It is not a foliate defect and it is not exotic; it is what "render this EPUB"
means unless something is done about it. **A reader built on defaults would have shipped a remote
code execution surface fed by files the reader downloads from strangers.**

## What contains it — two walls, independently sufficient

- **B2 — strip `allow-scripts` from the content frames.** Nothing ran, nothing escaped, and
  pagination was byte-identical to the unhardened run (same relocation fractions in all three
  engines). In `packages/reader` this is a one-line vendor patch; the spike does it by intercepting
  `setAttribute` so that upstream stays measurable.
- **B3 — a route-level CSP with `script-src 'self'`, and nothing else changed.** foliate hands each
  section to the frame as a `blob:` document, and a `blob:` document **inherits the policy of the
  context that created it** — verified in all three engines, which reported blocking the inline
  script, the `blob:` external script and the inline event handler by name. Pagination unaffected.

Both are shipped, not one: B2 is the rule the renderer follows, B3 is what holds if a future foliate
version changes that rule back. Note the shape of B3's policy — `script-src 'self'` with **no**
`'unsafe-inline'` and **no** `blob:`. Adding either to placate some unrelated widget re-opens the
book's inline scripts, which is a footgun worth a comment at the line where the header is written.

## 11.1b — what the patch costs, found by reading upstream's comment

The line the patch edits has a comment above it:

> `allow-scripts` is needed for events because of WebKit bug
> https://bugs.webkit.org/show_bug.cgi?id=218086

That is a claim about the reader's hands, not about rendering, and B2 above did not test it: it turned
pages by calling `view.next()`, which is not what a reader does. So a second harness
(`events.html` + `run-events.mjs`) puts two otherwise identical frames on a page, one with the token
and one without, and clicks them with a **real** mouse and keyboard — `isTrusted` is recorded for
exactly that reason.

| engine   | `allow-same-origin allow-scripts` | `allow-same-origin`         |
| -------- | --------------------------------- | --------------------------- |
| Chromium | pointerdown, click, keydown       | pointerdown, click, keydown |
| Firefox  | pointerdown, click, keydown       | pointerdown, click, keydown |
| WebKit   | pointerdown, click, keydown       | **nothing at all**          |

The bug is live. On WebKit a frame without `allow-scripts` receives no input events of any kind, so
a book rendered inside one is a page nobody can tap, swipe, or key through — and WebKit is Safari,
which is most of the mobile reading this feature exists for.

**The resolution, and it is not "give up a wall everywhere".** The two walls were measured to be
_independently_ sufficient (B2 and B3 above). So the frame keeps `allow-scripts` only on an engine
that would otherwise deliver no input, and there the route CSP is what stops the book — measured
blocking it in WebKit too. Everywhere else the frame refuses scripts and the CSP stands behind it.
Two walls where two are possible, one where one is, and the difference stated rather than averaged
away. `packages/reader/src/content-frame.ts` is where that choice is made, from a probe of the
running engine rather than from a user-agent string; the same synthetic probe agreed with real input
in all three engines, which is what makes the cheap version usable at startup.

The exception ends by itself if WebKit fixes 218086 — the probe would simply stop selecting it.

**Verified in the engine it is about (Phase 11.9).** `pnpm test:reader` runs the reader's suites in
Chromium, Firefox and WebKit. In WebKit the probe selects one wall and the page says so
(`data-content-frame-walls="1"`, frame `allow-same-origin allow-scripts`), and the hostile book's
two `<script>` elements still do not run: no beacon, no `postMessage`, `document.title` untouched.
In the other two the probe selects two walls and the frame refuses scripts outright. The first
version of that test hard-coded `2`, which is how an assertion about Chromium came to be made about
every engine.

## Consequences for the phase

1. **11.3 changes meaning.** There is no `/reader-sandbox.html` on an opaque origin. The reader is a
   same-origin route carrying its own CSP, and the isolation applies to the _book's_ frames instead.
   ADR-0013 must state this as a measured limitation with this document as its evidence, not present
   the weaker design as if it were the intended one.
2. **The zero-knowledge invariant is untouched.** It was never enforced by the opaque origin — it is
   enforced by there being no route to send a book to, and by 11.9 watching the wire. What the
   opaque origin bought was containment of the book's own code, and B2+B3 buy that instead.
3. **The RPC and the blob-module bundling can go.** They existed to get code and bytes _into_ an
   opaque origin. On a same-origin route the reader imports its modules normally, which also removes
   the "dynamic imports cannot resolve inside a `blob:` module" constraint — foliate uses several
   (`epub.js`, `mobi.js`, `fb2.js`, `comic-book.js` are all lazily imported).
4. **The hostile fixture is promoted from a test idea to a build artifact.** It caught a real,
   default-on escape in three engines; it belongs in `packages/reader`'s fixtures and in the 11.9
   suite, run against every format, not only EPUB.

## What this spike did not measure

Fixed-layout EPUB (`fixed-layout.js` sets the same sandbox attributes and would need the same
patch), MOBI/AZW3/FB2/CBZ rendering (only EPUB was exercised — the containment result is about
frames, not formats, but "it renders" is a separate claim per format), media overlays and TTS (both
may want scripting), file sizes beyond 3 KB, and any mobile engine. Headless Linux builds of three
engines are evidence about three engines.
