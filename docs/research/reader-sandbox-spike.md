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
