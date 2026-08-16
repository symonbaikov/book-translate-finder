# ADR-0013: The reader runs in the reader's tab, and the book's own code does not run at all

- **Status:** accepted
- **Date:** 2026-08-16
- **Depends on:** [ADR-0009](0009-blind-core-link-policy-scope.md), [ADR-0010](0010-addon-engine.md)
- **Evidence:** [reader-sandbox-spike.md](../research/reader-sandbox-spike.md) — spike 11.1, five
  cases across Chromium, Firefox and WebKit. Every measured claim below comes from there.

## Context

A reader who has just been shown a legal free copy has to leave the site to read it. Phase 11 gives
them a reader in the tab they are already in, built on [foliate-js](https://github.com/johnfactotum/foliate-js)
(MIT), and it has to do that without breaking the property the previous two ADRs exist to hold.

There are two different things to protect, and conflating them is how this design would go wrong:

1. **The reader's privacy.** Which file they opened, where it came from, and how far they got must
   not reach this instance. This is ADR-0010 §6 applied to a new object — there the instance was not
   to learn which addons were installed, here it is not to learn what is being read.
2. **The reader's browser, from the book.** An EPUB is HTML, CSS and JavaScript authored by whoever
   published the file. It is untrusted input in the same sense a downloaded webpage is.

The obvious design was to reuse ADR-0010 §3 wholesale: put the reader on an opaque origin, feed it
bytes over a structured-clone RPC, and get both properties from one mechanism. The plan made that
design conditional on a spike rather than assuming it, because foliate paginates by _measuring_ the
document it renders — it reads `contentDocument` of a nested frame, applies CSS columns and asks for
scroll widths — and whether a nested frame is reachable from a sandboxed document is exactly the
class of behaviour Phase 7 found engines disagreeing on.

**The spike says it is not reachable, in all three engines, and the mechanism is the platform's**:
a nested browsing context inherits its parent's sandbox flags, cannot re-grant `allow-same-origin`,
and therefore lands on its _own_ opaque origin — a different one from its parent's. `blob:`, `srcdoc`
and no-attribute-at-all all read back `null` in Chromium, Firefox and WebKit alike. This is not a bug
awaiting a fix; it is what the sandbox is for.

The same spike found the thing nobody had thought to look for. foliate sets
`sandbox="allow-same-origin allow-scripts"` on its content frames: it runs the book's JavaScript on
purpose, being a general-purpose renderer and scripted EPUBs being a real format feature. Against a
hostile fixture, on a route with no further measures, **the book escaped four ways in every engine** —
its inline script and its external script both reached the network, an `onerror` handler did too, and
`top.postMessage` reached the host document. A reader shipped on defaults would have been a
code-execution surface fed by files strangers publish.

## Decision

### 1. The book never reaches this instance, and the statement is testable

> The bytes of a book, the URL they came from, any hash or identifier derived from them, and the
> reader's position in them never reach this instance's origin — not in a path, not in a query
> string, not in a header, not in a body, and not in a request that merely fails.

Three consequences that are load-bearing rather than decorative:

- **No proxy, in any disguise.** There is no route that fetches a URL on the reader's behalf, and
  adding one would undo this ADR and ADR-0010 together. `/api/covers` is not a precedent: it fetches
  an image this instance already put in its own database, under a host allowlist it owns.
- **No query parameter, either.** `/read?src=https://…` hands the book's URL to this instance in the
  request line of an ordinary navigation, before any of our code runs. The handoff is the URL
  **fragment**, which is never sent to a server, or `sessionStorage`.
- **No reading telemetry.** Not page counts, not durations, not "books opened". The absence is the
  feature.

### 2. The reader is a same-origin route, and this is a measured limitation

`/read` is an ordinary page in `apps/web`. It is **not** a sandboxed document on an opaque origin,
because spike 11.1 established that no reader can be — see the evidence link above. The isolation
the opaque origin would have provided moves down one level, onto the book's own frames, where it is
measurable rather than aspirational.

This is weaker than ADR-0010's four layers and is recorded as weaker. What it does **not** weaken is
§1: the privacy invariant was never enforced by the opaque origin. It is enforced by there being no
route to send a book to, by `dependency-cruiser` refusing the imports that would build one, and by a
Playwright suite that reads back every request the browser made.

### 3. The book's code is contained by two independent walls, and both ship

| Wall                                                              | What it stops                                                                                                                                         | Measured                                                                                          |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `allow-scripts` stripped from every content frame foliate creates | The frame may not execute script at all, whatever the document inside it contains                                                                     | Nothing ran; pagination byte-identical to the unhardened run                                      |
| Route CSP: `script-src 'self'`, no `'unsafe-inline'`, no `blob:`  | foliate serves each section as a `blob:` document, which inherits the creator's policy — so the book's scripts have no source they can be served from | Inline script, `blob:` script and inline event handler all blocked, by name, in all three engines |

Two rather than one, because they fail differently: the first is a patch to a vendored dependency and
dies quietly at the next version bump; the second is a header that survives it. Neither is redundant
in the way that invites deleting one.

The patch covers **both** places foliate creates frames — `paginator.js` and `fixed-layout.js` — and a
test fails if a vendor bump reintroduces `allow-scripts`. The CSP's shape is load-bearing: adding
`'unsafe-inline'` or `blob:` to `script-src` to placate some unrelated widget re-opens the book's own
scripts, so the line that emits it carries that warning next to it.

**Scripted EPUBs therefore do not work here, on purpose.** Interactive textbooks and quiz widgets are
a real, standardised part of EPUB 3, and this reader refuses all of them. A reader that cannot run a
quiz is a smaller loss than a reader that runs a stranger's fetch loop.

#### Amendment, 2026-08-16: WebKit gets one wall, and is told so

Upstream's comment above the patched line says `allow-scripts` "is needed for events because of
WebKit bug 218086". Spike 11.1b tested that claim with real mouse and keyboard input rather than a
programmatic page turn, and it holds: **on WebKit, a frame without `allow-scripts` receives no input
events at all** — no click, no pointerdown, no keydown — while Chromium and Firefox deliver all of
them. A book rendered in such a frame is a page nobody can tap, and WebKit is Safari, which is most
of the mobile reading this feature is for.

Since the two walls were measured to be **independently** sufficient, the resolution is not to give
one up everywhere:

| engine                                 | frame                             | walls | what stops the book          |
| -------------------------------------- | --------------------------------- | ----- | ---------------------------- |
| delivers input without `allow-scripts` | `allow-same-origin`               | 2     | the frame, and the CSP       |
| does not (WebKit today)                | `allow-same-origin allow-scripts` | 1     | the CSP — measured there too |

The branch is chosen by **probing the running engine**, never by a user-agent string
(`packages/reader/src/content-frame.ts`), and it disappears by itself if WebKit fixes the bug. What
this costs is stated plainly rather than averaged into a claim of "two walls": on Safari a CSP edit
that adds `'unsafe-inline'` or `blob:` to `script-src` would also re-enable a stranger's JavaScript,
and that is the line the warning comment belongs on.

### 4. Everything the reader accumulates stays in their browser

Progress, bookmarks and annotations live in IndexedDB in the reader's own browser, keyed by the
**content hash** of the file (SHA-256 over the `ArrayBuffer`, computed in the tab). Not the URL —
the same book from another mirror should resume where it was left; not the work id — a file picked
off a disk has no work id. The hash is itself an identifier for the file, so it is covered by §1 and
never leaves.

Keeping the **file** is a separate, opt-in, per-book preference: progress is a few hundred bytes, a
40 MB EPUB is somebody's disk. Like every preference in this application it is written straight into
the browser and announces itself through `useSettingChangeToast()` with an outcome derived from
`outcomeOfWrite`, including the `unstored` case where the browser refused the write (CLAUDE.md).

### 5. `packages/reader` is a leaf the server cannot import

A fifth workspace package alongside `plugins` and `addons`, and a leaf for the same reason: it is
browser code, and the rule that it never runs on the server should be a build failure rather than a
promise. Four `dependency-cruiser` rules carry it — the package imports no workspace package, nothing
server-side imports the package, the reading surface may not import the API client, and the vendored
renderer is reachable through one door. The third is the unusual one and it is deliberate: an import
of `api-client` into the reading surface is how a "just the resume position" endpoint gets born.

All four were checked by writing the violation and watching it fail, not by reading them. One
subtlety came out of that: `reader-never-on-the-server` matches an import the resolver can follow,
which means an import plus a declared dependency — an import without one is unresolvable and also
would not run, so the rule catches every violation that could actually exist.

### 6. Nothing the reader opens carries a rights status

Extends ADR-0009's reasoning to a second path. This instance can speak to the provenance of links
_it_ produced; it cannot speak to a file the reader picked off their own disk, and a badge that
guesses is a lie dressed as metadata (ADR-0011). The badge stays on the link that produced the file,
where the pipeline can back it up. The reader shows the book.

### 7. CORS is a dead end, stated rather than worked around

A direct client-side fetch of a book URL is refused by most hosts, and that refusal is honest output:
the panel says so, and offers downloading the file to the device, opening it from there, or using an
addon that serves the file itself. It never offers to try again "through the site", because the only
thing behind that button is the route §1 forbids.

### 8. Scope

EPUB, FB2, MOBI/AZW3 and CBZ. **No PDF** — foliate's support is experimental and arrives through
PDF.js, a second vendored engine, for a format whose links keep working exactly as they do today.
**No DRM**, in any form: there is no code path here that could open a protected file and none will be
added. **No cross-device sync**, which is the first thing anyone will ask for and is a server feature
wearing a reader's clothes — it needs an account, a route and a column, and it would end §1. If it is
ever built it is a different ADR that says so out loud.

## Considered alternatives

| Option                                                            | Pros                                                                    | Cons                                                                                                                         | Why not chosen                                                                       |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Opaque-origin sandbox, as ADR-0010 §3                             | One mechanism for both properties; four layers already built and tested | The renderer cannot measure a nested frame from an opaque origin — `null` in all three engines                               | Measured impossible before anything was built on it (spike 11.1). Not a preference   |
| A server route that fetches the book for the browser              | CORS stops being a limit; every source becomes reachable                | The instance would fetch, hold and serve files it has not vetted, learn what everyone reads, and become a distributor        | It ends this ADR, ADR-0010 §6 and the legal position of the project in one route     |
| Convert the book to HTML on the server and send that              | No renderer in the browser at all; works everywhere                     | The file reaches the server, which is the one thing this feature exists not to do                                            | Same objection, one indirection deeper                                               |
| Take foliate's defaults, rely on the reader's own care            | No patch to carry; scripted EPUBs work                                  | Measured: four escape routes in three engines, from an ordinary hostile file                                                 | The feature would be a vulnerability with a table of contents                        |
| The vendor patch alone, no CSP                                    | Nothing to keep in the headers                                          | A vendor bump silently restores `allow-scripts`, and nothing notices until someone reads a hostile book                      | The failure mode is silent, which is the worst kind                                  |
| The CSP alone, no vendor patch                                    | Survives vendor bumps; one place to read the rule                       | Depends on `blob:` documents inheriting the creating context's policy — true in three engines today, and not a law of nature | Both walls cost about a day together; keeping one to save half of it is a poor trade |
| Wrap the whole reader in `<iframe sandbox="… allow-same-origin">` | Looks like isolation                                                    | `allow-same-origin` on our own origin removes the isolation it appears to add                                                | A sandbox that grants back the origin is decoration                                  |
| Wait for a desktop or extension build, where CORS is not a limit  | Removes the acquisition problem entirely                                | Unbuilt, unpromised, and would leave the browser reader unbuilt for a year                                                   | The file picker covers the same ground today, on the platform readers already have   |

## Consequences

**Good.** Reading a public domain book stops being a download and an app. The instance learns nothing
by construction rather than by policy, which is a claim `pnpm boundaries` and a wire suite can hold.
The two walls came out of measurement, so their limits are known rather than assumed. And a whole
class of feature — sync, statistics, "continue reading on your phone" — is now something the codebase
refuses structurally, which is cheaper than refusing it in review every quarter.

**Costs, honestly.** The isolation is one layer thinner than the addon engine's, for a reason nobody
here can remove. A vendored renderer with a local patch is a maintenance obligation: every upstream
bump has to re-apply it and re-run the hostile fixture, and the day that becomes tedious is the day it
gets skipped. Scripted EPUBs do not work. Most public book URLs will refuse a cross-origin fetch, so
the file picker will carry more of this feature than the "Read in browser" button suggests. And the
whole file sits in an `ArrayBuffer` in a tab, because that is what "never touches the server" means —
a large book on a small phone is a real limit, and the phase measures it instead of hoping.

**What changes if this turns out to be wrong.** If the containment proves insufficient — a fourth
escape route nobody modelled — the reversal is to stop rendering book-supplied markup directly and
sanitise it, which is a change inside `packages/reader` and costs fidelity, not architecture. If the
privacy invariant proves unenforceable, the honest response is to say so in the interface, not to keep
the claim. What could not be reversed is a proxy route: once this instance has fetched books on
readers' behalf, it has been a distributor, and no later ADR unmakes that.
