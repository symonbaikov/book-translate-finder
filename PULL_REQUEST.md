# Phase 11 — the reader that never uploads a book

Reading a public domain book stops being a download and an app. `/read` opens EPUB, FB2 and CBZ in
the reader's own tab, remembers where they got to, and lets them choose how the page looks — and this
instance learns nothing about any of it.

**Decisions:** [ADR-0013](docs/adr/0013-client-side-reader.md) ·
**Evidence:** [reader-sandbox-spike.md](docs/research/reader-sandbox-spike.md) ·
**Plan:** [plan.md Phase 11](docs/plan.md)

## The invariant, and how it is held

> The bytes of a book, the URL they came from, any hash derived from them, and the reader's position
> in them never reach this instance's origin — not in a path, a query string, a header, a body, or a
> request that merely fails.

```
git diff --stat main -- apps/api apps/worker packages/domain packages/application packages/infrastructure
```

prints nothing. 116 files and ~15 600 lines in this phase; not one of them server-side. No route, no
contract, no migration. `pnpm boundaries` keeps it that way with four rules, each verified by writing
the violation and watching it fail.

The book's address travels in `sessionStorage` or the URL fragment — never a query string, which the
server would see in its access log before any reading code ran.

## The design was decided by measurement, not by review

The plan's preferred design was the addon engine's sandbox reused: the reader on an opaque origin,
four layers of isolation. A spike measured it first, in three browsers, and it **cannot work** —
a nested frame inherits its parent's sandbox flags, cannot re-grant `allow-same-origin`, and lands on
its own opaque origin, so the paginator has nothing to measure.

The same spike found what no amount of design review had: **foliate-js runs the book's JavaScript on
purpose**, and a hostile EPUB escaped four ways in every engine. So the reader is a same-origin route
— recorded as the weaker design it is — and the book's code is contained by two independently
sufficient walls: `allow-scripts` stripped from the content frames, and a route CSP of
`script-src 'self'` that the book's `blob:`-served scripts cannot match.

**Except on WebKit**, which delivers no input at all to a frame without `allow-scripts` (bug 218086,
measured with a real mouse and keyboard). There the frame keeps the token and the CSP is the only
wall — chosen by probing the engine, never by a user-agent string, and stated plainly rather than
averaged into a claim of "two walls".

## What a reader gets

- Four ways in: a link from a work page, a file picker, drag-and-drop, or a book this browser kept.
- An honest dead end when a source refuses the browser — the download link and "open it here from
  your device", and no button offering to fetch it through this site, because that route does not
  exist. Measured: `standardebooks.org` allows the fetch; `gutenberg.org` and `archive.org` do not.
- Position, bookmarks and notes in IndexedDB, keyed by the file's content hash — so the same book
  from another mirror resumes where it was left.
- Four palettes from `tokens.css`, type size, line spacing, margins, paged or scrolling, justify,
  hyphenate. **E-Ink** is monochrome, motionless and single-column, not dark mode inverted.
- Every preference announces itself, including when the browser refuses to keep it.

## Verification

| Command | Result |
| --- | --- |
| `pnpm lint`, `pnpm typecheck`, `pnpm build` | green |
| `pnpm test` | 1071 unit and contract tests |
| `pnpm boundaries` | no violations (four new rules) |
| `pnpm test:sandbox` | 14 — the addon suite, unchanged |
| `pnpm test:reader` | **66, in Chromium, Firefox and WebKit** |

The reader suite opens a real hostile EPUB and a hostile FB2 on the real route and reads back every
request the browser made.

## Known gaps, stated rather than left to be found

- **MOBI/AZW3 is supported and untested.** No fixture: a valid one needs a PalmDB container and
  PalmDOC records, which is a format generator rather than a fixture. One real file closes it.
- **No measured file-size limit on a real phone.** The whole book lives in an `ArrayBuffer` by
  design — that is what "never touches the server" costs — and the ceiling is a number nobody has
  taken yet.
- **Highlights over selected text are deliberately absent**: they need selection events inside the
  book's frame, which is the frame WebKit delivers none to. A bookmark with a note works everywhere.
- **PDF is out of scope** (ADR-0013 §8), and the vendored renderer's PDF branch is patched out.

## Reviewing this

The vendored `packages/reader/vendor/foliate` is third-party code carrying one patch, pinned by
commit SHA and tree hash; `pnpm --filter @golden/reader vendor:check` verifies it and a test fails if
a bump reintroduces `allow-scripts`. `prototype/reader-sandbox-spike/` is the throwaway that decided
the architecture — delete it once this is merged and the reader suite covers the same ground.
