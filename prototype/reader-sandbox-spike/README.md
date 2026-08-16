# Reader sandbox spike (Phase 11.1)

A throwaway that answers one question before the phase built anything on the answer:

> Can foliate-js paginate a book inside a document on an **opaque origin** — the four-layer sandbox
> ADR-0010 §3 uses for addons?

**No, in Chromium, Firefox and WebKit alike.** The findings, the numbers and what they change are in
[docs/research/reader-sandbox-spike.md](../../docs/research/reader-sandbox-spike.md). Read that; this
file only says how to re-run it.

```bash
bash prototype/reader-sandbox-spike/vendor.sh
```

```bash
python3 prototype/reader-sandbox-spike/fixture/make-epub.py
```

```bash
node prototype/reader-sandbox-spike/run.mjs
```

Needs Playwright's three browser binaries (`pnpm exec playwright install chromium firefox webkit`
from `apps/web`) and network for the first command only. Neither the vendored copy of foliate-js nor
the generated `.epub` fixtures are committed — both are reproducible from the two scripts, and the
real vendoring happens in 11.2 under `packages/reader/vendor`.

## What is in here

| File                   | Why                                                                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `vendor.sh`            | Fetches foliate-js at a pinned SHA. Unpinned, the spike measures whatever upstream looked like that day                                       |
| `fixture/make-epub.py` | Builds two EPUBs: a plain one long enough to paginate, and a hostile one that tries four ways to reach out of the frame it is rendered in     |
| `server.mjs`           | Static server, `Access-Control-Allow-Origin: *` (an opaque origin is cross-origin to everything, including its own server), plus a beacon log |
| `host.html`            | Plays `apps/web`: fetches the book and hands it to the frame as bytes over `postMessage`, never as a URL the frame fetches itself             |
| `sandbox.html`         | The document under test                                                                                                                       |
| `probe.js`             | Two probes — one about the browser (is a nested frame reachable?), one about foliate (does a page turn?) — each individually timed out        |
| `run.mjs`              | Drives five cases × three engines and prints one table                                                                                        |

Delete this directory once ADR-0013 is merged and 11.9's suite covers the same ground against the
real reader. It exists to make a decision, not to be maintained.
