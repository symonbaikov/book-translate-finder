# ADR-0010: The addon engine — one contract, two transports, a core that does not look inside

- **Status:** accepted
- **Date:** 2026-08-14
- **Depends on:** [ADR-0009](0009-blind-core-link-policy-scope.md)
- **Extends:** [ADR-0007](0007-plugin-architecture.md)

## Context

ADR-0007 gave the project isolated integrations, but they are compiled in: adding one means editing
this repository, and the reader gets whatever the operator built. The brief asks for the other
model — the reader installs what they want, the core knows nothing about it, and nothing the reader
does with an addon is visible to the instance they happen to be using.

Two lineages were named as the target, and they are not the same system.

- **Stremio**: an addon is an HTTP service. It publishes `manifest.json` and answers a handful of
  resource URLs with JSON. Installing one means pasting its manifest URL. There is no sandbox
  because there is no foreign code — the addon runs on its author's machine.
- **Tachiyomi/Mihon**: an extension is _code_, installed onto the device and executed there. There
  is no third party in the request path at all.

Choosing one loses something real. Pure HTTP addons cannot reach `192.168.1.10:8083`, which is
exactly where a reader's Calibre-Web lives, and reaching it is a feature this project already
shipped (ADR-0007 §3). Pure local code runs into CORS on most public APIs — the browser will make
the request and refuse to let the addon read the answer — which is the very reason Stremio put
addons on servers in the first place.

## Decision

### 1. One contract, three resources

Shaped after Stremio's and translated to books: `stream` becomes `source`, `movie`/`series` become
`book`/`audiobook`.

```ts
interface AddonManifest {
  id: string;
  version: string;
  name: string;
  description: string;
  apiVersion: 1;
  resources: ('catalog' | 'meta' | 'source')[];
  types: ('book' | 'audiobook')[];
  catalogs: {
    type;
    id;
    name;
    extra?: { name: 'search' | 'genre' | 'skip'; isRequired?: boolean }[];
  }[];
  idPrefixes?: string[];
  behaviorHints?: { configurable?: boolean; configurationRequired?: boolean };
}

interface AddonTransport {
  getCatalog(type, catalogId, extra): Promise<{ metas: BookMetaPreview[] }>;
  getMeta(type, id): Promise<{ meta: BookMeta }>;
  getSources(type, id): Promise<{ sources: AddonSource[] }>;
}
```

`AddonSource` is the direct analogue of a Stremio `Stream`: a URL, a name, a title, and optional
hints about format and size. The core does not interpret it. It renders it, attributes it to the
addon that produced it, and opens it when the reader clicks.

### 2. Two transports behind that one interface

|                          | HTTP addon                               | Local JS addon                    |
| ------------------------ | ---------------------------------------- | --------------------------------- |
| Installed by             | manifest URL                             | bundle URL + SHA-256              |
| Runs on                  | the author's server                      | the reader's device, in a sandbox |
| Reaches private networks | no                                       | yes — this is its reason to exist |
| CORS                     | the addon author's problem, and solvable | a hard limit                      |
| Third party sees         | the reader's IP and query                | nothing                           |

Both implement `AddonTransport`, so the registry, the aggregation and the entire interface are
written once. Which transport an addon uses is a property of its descriptor, not a branch in the
calling code.

### 3. Local addons execute in four nested layers of isolation

| Layer | What                                                                                                       | What it removes                                                                           |
| ----- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| L1    | `<iframe sandbox="allow-scripts">`                                                                         | opaque origin — `localStorage`, cookies, IndexedDB all throw; the host DOM is unreachable |
| L2    | a static document with `default-src 'none'; script-src 'self' blob:; worker-src blob:; connect-src 'none'` | the addon cannot open a network connection of its own                                     |
| L3    | a `Worker` created from the bundle as a `blob:`                                                            | no DOM, no `document`, no `parent`                                                        |
| L4    | a structured-clone RPC surface                                                                             | no functions cross the boundary, in either direction                                      |

The addon's only contact with the world is the capability object the host injects:
`fetchText`, `fetchJson`, `parseXml`, `storage.get/set` (namespaced, quota-limited) and `log`.

**Why `connect-src 'none'` plus a mediated fetch, rather than a per-addon `connect-src`.** A CSP
listing each addon's hosts would have to be generated per installation, and the only place that can
emit a header is the server — which would tell the instance which addons the reader has installed,
losing the property this whole design exists to keep. Meta-CSP inside `srcdoc` avoids the server but
is inconsistent across engines. So the enforcement point is a host function that any unit test can
call, and the CSP is the second wall behind it rather than the first.

The mediated fetch always sends `credentials: 'omit'` and `referrerPolicy: 'no-referrer'`, and caps
response size and duration. No cookie of this instance, and no `Authorization` header, can leave
through an addon.

### 4. Declared hosts are a security boundary, not a content one

A local addon declares the hosts it will contact, and the reader sees that list before installing.
This is not a revival of the denylist ADR-0009 removed: **any** host may be declared, including
ones the domain policy refuses for the instance's own pipeline, and the engine will allow it. The
list answers "who does this addon talk to", so that a reader can decline, and so that an addon
cannot quietly ship their reading history somewhere they never agreed to. It does not answer
"should this source exist".

An HTTP addon declares nothing, because its origin _is_ the answer — one host, visible in the URL
the reader pasted.

### 5. No index, no registry, no directory

The project does not host a list of addons, does not link to one, and does not ship one. Installing
means pasting a URL the reader found for themselves. This is the load-bearing half of ADR-0009's
argument: a runtime is a runtime, and a curated list of sources is an editorial act.

The one exception is the built-in OPDS addon that replaces today's custom-catalog form, which ships
with no catalogs configured and does nothing until a reader points it at a server.

`examples/addon-template` is not a second exception, and the line is worth stating because it is thin.
It is a worked example for authors: it serves two hard-coded public domain books, it is not installed
by default, it is not offered anywhere in the interface, and every handler in it exists to be
deleted. If it ever pointed at a real catalogue — if it became worth installing as it stands — it
would have become a shipped addon, and this rule would apply to it.

### 6. The instance learns nothing

The installed list lives in `localStorage` under `btf.addons` and never leaves the browser. No API
route accepts an addon id, a manifest URL, or an arbitrary URL of any kind — the existing OPDS
relay takes a feed **id** and keeps doing so (ADR-0007 §3), and it will not be generalised.
`packages/addons` is forbidden by `dependency-cruiser` from being imported by `apps/api` or
`packages/infrastructure`, so "the server does not do addons" is a build failure rather than a
promise. A Playwright test asserts that a search with addons installed sends no addon identifier to
this origin.

### 7. Failure is per addon, and ordering is the reader's

Addons are polled concurrently with a timeout. One that hangs, throws or answers nonsense loses its
own section and nothing else. The mechanism is `settleAddons`, which is `settleAll` from
`packages/plugins` written out a second time rather than imported: both packages are leaves that may
depend on no workspace package, and twenty lines of `Promise.all` is a smaller price than making
either one stop being one.
Registry order is the reader's priority order and is theirs to rearrange, as in Stremio; results
are grouped by addon rather than merged, because merging would require deciding which addon is
right about a book, and the core has no basis for that opinion.

Installing, removing, enabling, disabling and reordering are all reader preferences stored in the
browser, so each announces itself through `useSettingChangeToast()` with an outcome derived from
`outcomeOfWrite` (CLAUDE.md). The install popup names the addon _and_ who it will contact — for an
HTTP addon that includes the fact that the addon's operator will see the reader's IP and queries.

## Considered alternatives

| Option                                             | Pros                                                            | Cons                                                                                                                      | Why not chosen                                                                              |
| -------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| HTTP addons only (literal Stremio)                 | Simplest; CORS is the author's problem; no sandbox to get right | Cannot reach the reader's own Calibre/Kavita; every query passes through a third party                                    | It would delete a feature this project already ships, and the privacy-first framing with it |
| Local JS addons only (literal Tachiyomi)           | Nothing leaves the device; private networks reachable           | CORS blocks most public APIs; authoring is harder than standing up a small server                                         | Half the plausible addons could not be written at all                                       |
| Extend `packages/plugins` instead of a new package | No new package to wire up                                       | `plugins` is imported by `packages/infrastructure`, i.e. it runs on the server; addons must never be reachable from there | A separate package makes the "never on the server" rule mechanical                          |
| Run local addons in a bare `Worker`, no iframe     | Much less machinery                                             | A same-origin worker can read `fetch` with the instance's cookies and reach same-origin API routes                        | The opaque origin is the property that makes the rest of the sandbox meaningful             |
| Ship a curated addon directory                     | Discoverability; readers would actually find addons             | Curation is an editorial act, and the curated list becomes the thing the project is judged by                             | ADR-0009 rests on the project not doing this                                                |

## Consequences

**Good.** Adding a source stops being a pull request against this repository. The reader's own
library server keeps working, and now through the same mechanism as everything else. The engine is
one contract with two implementations, so the interface, the registry and the failure handling
exist once.

**Costs, honestly.** A local addon still cannot read a response the target refuses to share with
the browser; CORS is not something a sandbox can talk its way around, and the honest answer in the
interface is to say so rather than show an empty shelf. An HTTP addon hands the reader's IP and
queries to whoever runs it — the model's real price, stated at install time rather than buried.
Four layers of sandbox are four layers to get wrong, and the only credible proof they hold is
escape tests running in Chromium, Firefox and WebKit; a unit test asserting our own function
returned `false` proves nothing about an engine's CSP implementation.

And the core now renders what it has not checked. That is the decision of ADR-0009, taken
deliberately, and it makes per-addon attribution in the interface a correctness requirement rather
than a nicety.

**What this does not do.** It does not turn this instance into a proxy: there is no route that
fetches a URL on a reader's behalf, and adding one would undo both ADRs at once. It does not make
addons discoverable — that is left to the reader, on purpose. And it does not extend to a desktop
or extension build, which is the only thing that would remove the CORS limit entirely; that remains
unbuilt and unpromised.
