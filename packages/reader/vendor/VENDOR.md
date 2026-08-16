# Vendored third-party code

## foliate-js

- **Upstream:** https://github.com/johnfactotum/foliate-js
- **Commit:** `78914aef4466eb960965702401634c2cb348e9b1` (2026-05-01, `main`)
- **License:** MIT — see [`foliate/LICENSE`](foliate/LICENSE). Its own bundled dependencies keep
  their licences: `vendor/zip.js` (BSD-3-Clause), `vendor/fflate.js` (MIT).
- **Re-create with:** `pnpm --filter @golden/reader vendor` (needs network)
- **Verify with:** `pnpm --filter @golden/reader vendor:check` (no network; also asserted by
  `test/vendor.test.ts`)

Committed rather than fetched at build time: foliate-js is not published to npm and recommends being
used as a git submodule, and a build that clones GitHub is a build that fails in an air-gapped image.
Self-hosting this project is meant to be three commands.

### The patch we carry

One edit, in the two places upstream creates an iframe for book content:

```diff
-setAttribute('sandbox', 'allow-same-origin allow-scripts')
+setAttribute('sandbox', 'allow-same-origin')
```

`paginator.js:244` (reflowable) and `fixed-layout.js:86` (pre-paginated). Upstream runs the book's
JavaScript on purpose — scripted EPUBs are a real part of EPUB 3 — and this project cannot: spike
11.1 measured a hostile EPUB escaping four ways in three engines through that attribute
([reader-sandbox-spike.md](../../../docs/research/reader-sandbox-spike.md)), and
[ADR-0013](../../../docs/adr/0013-client-side-reader.md) §3 makes removing it one of the two walls
the reader stands on. `allow-same-origin` stays: the paginator measures the document it lays out,
and without it there is nothing to measure.

The patch is an exact-match replacement in `scripts/vendor.mjs` that **fails loudly if it does not
apply**, rather than a `.patch` file that can land with fuzz. A version bump that moves the line
stops the script instead of silently producing an unpatched tree.

### What the patch costs, and why upstream's comment is kept

The comment above the patched line — `allow-scripts` "is needed for events because of WebKit bug
218086" — is deliberately left in the tree, because it is true and it cost this project a
measurement to confirm. Spike 11.1b clicked and typed into two otherwise identical frames with a
real mouse and keyboard: Chromium and Firefox deliver input to a frame without `allow-scripts`,
**WebKit delivers none at all**.

So the vendored tree is patched — that is the safe default and what `vendor:check` asserts — and the
reading surface puts `allow-scripts` back **only** on an engine it has observed swallowing input,
where the route CSP is the wall instead. That choice lives in `src/content-frame.ts` and is made from
a probe rather than a user-agent string. Removing the comment would delete the only pointer to why
that branch exists.

### What was dropped

`pdf.js` and `vendor/pdfjs` (PDF is out of scope — ADR-0013 §8, and PDF.js is a second rendering
engine's worth of bytes), plus upstream's own demo reader, tests, build config and manifests. A file
that reaches `makeBook`'s PDF branch now throws; format sniffing refuses PDF before that point, and
the message the reader sees comes from us.

### Bumping it

1. Change `PINNED_COMMIT` in `scripts/vendor.mjs` and run `pnpm --filter @golden/reader vendor`.
2. If the script stops, the patch no longer applies — read the upstream diff before re-deriving it.
3. Run the hostile-fixture suite. `vendor:check` proves the attribute is gone; only the fixture
   proves nothing else replaced it.
