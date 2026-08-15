# ADR-0009: What the link policy governs, and what it deliberately stops governing

- **Status:** accepted
- **Date:** 2026-08-14
- **Supersedes in part:** [ADR-0007](0007-plugin-architecture.md) §5

## Context

Until now the project had one answer to "may this link exist": `LinkPolicy` in `packages/domain`,
plus a copy of its denylist in `packages/plugins` so the same refusal could happen in the browser
when a reader added an OPDS catalog. The two copies were kept honest by a parity test. That design
assumed something that is about to stop being true — that every link the interface shows was
produced by this instance.

[ADR-0010](0010-addon-engine.md) introduces reader-installed addons. An addon is chosen by the
reader, installed by pasting a URL, and either runs on the reader's own device or is an HTTP
service the reader's browser talks to directly. Its results never pass through this instance.

Applying the existing policy to addon results would mean one of two things, and neither survives
contact with the goal:

- **Gate them.** The interface would then decide, on the reader's own machine, which of the
  reader's own sources they are permitted to see. That is not an extensibility system; it is a
  filtered one, and every filtered system eventually argues about the filter.
- **Gate them badly.** Keep a denylist of fourteen domains and call it a policy. Any addon author
  who wanted around it would move a hostname. The check would cost real work and buy a gesture.

The choice is not "safe or unsafe". It is "where does the boundary sit, and is it a boundary the
code can actually hold".

## Decision

**The link policy governs what this instance produces. It does not govern what a reader's addon
returns on the reader's device.**

Concretely:

| Path                                                          | Governed by `LinkPolicy` |
| ------------------------------------------------------------- | ------------------------ |
| Anything a source adapter writes to Postgres                  | yes, unchanged           |
| Anything served from `/api/*`                                 | yes, unchanged           |
| Anything in the seeded or curated catalogs                    | yes, unchanged           |
| Anything a reader-installed addon returns to the reader's tab | **no**                   |

`packages/domain/src/policy/link-policy.ts` is untouched by this ADR: the allowlist, the denylist,
the mandatory `rightsStatus`, the `CHECK` constraint and the snapshot tests all stay exactly as
they are, and extending them still requires an ADR (legal-policy.md §5).

What is removed is the _second_ copy — `SHADOW_LIBRARY_DOMAINS`, `isShadowLibraryHost` and
`ForbiddenFeedError` in `packages/plugins`, together with the parity test that guarded the
duplication. `assertFeedUrlAllowed` goes with them rather than being hollowed out: once the policy
question is gone the only thing it asked was whether the string is an absolute `http`/`https` URL,
which `assertFetchableFeedUrl` already answers and names honestly. A function still called
"allowed" that allows everything is a worse artefact than no function.

### The type system carries the boundary, not a convention

An addon result is an `AddonSource` (`packages/addons`). A `SourceLink` is a domain entity whose
constructor is private and reachable only through the policy. There is no conversion between them
in either direction, and none will be added: the two kinds of link meet for the first time in the
React tree, where they are rendered in separate, separately-labelled sections.

This is what makes the boundary structural. Not "we agreed the addon path skips the check" but
"the addon path has no way to reach the check, and no way to reach what the check protects".

### The instance stays clean, and that is the whole argument

The repository ships no addon, hosts no addon index, and links to no addon. `packages/domain`
still refuses shadow-library hosts for everything the instance itself does. What the project
distributes is a runtime and a protocol, and what it distributes is legal to distribute — the same
position Stremio, Tachiyomi and qBittorrent occupy, and for the same reason.

A note on the legal shape of this, written by an engineer and not a lawyer, because the original
brief invoked DMCA safe harbor and that is the wrong instrument: §512 protects hosts of
user-uploaded material, and this project hosts none. The exposure that actually matters for a
plugin runtime is contributory liability and inducement. The three things that answer it are
structural rather than textual — no index of sources, no shipped addon that provides infringing
material, and substantial uses that are plainly legitimate (a reader's own Calibre server, Project
Gutenberg, OPDS catalogues, bookshop lookups). All three are properties of the code, which is why
they belong in an ADR and not only in a README.

## Considered alternatives

| Option                                                    | Pros                                     | Cons                                                                                                                                             | Why not chosen                                                                                          |
| --------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Keep the gate over addon results                          | No change to the stated policy           | The interface would censor the reader's own sources on the reader's own machine; the check is a hostname edit away from useless                  | It buys the appearance of a boundary at the price of the feature, and the appearance does not hold      |
| Gate only `download`, allow `buy`/`borrow`                | Preserves I-1 verbatim                   | An addon's whole purpose is to reach a source this instance does not know; downgrading its result to "external link" is the gate by another name | Same objection, one indirection deeper                                                                  |
| Drop the domain policy too, for symmetry                  | One rule everywhere                      | The instance's own catalog is exactly the thing that must stay clean for the repository to be hostable at all                                    | Symmetry is not a goal here; the two paths differ in who chose the source, which is the entire question |
| Keep the denylist as an install-time warning, not a block | Reader is informed, nothing is forbidden | A list of fourteen domains presented as "the dangerous ones" implies everything else was vetted, which is false                                  | A misleading reassurance is worse than none — same reasoning as the popup rules in CLAUDE.md            |

## Consequences

**Good.** The boundary is now something the code can hold rather than something reviewers must
remember. The duplication that ADR-0007 accepted as a cost — one list in two files, kept in step by
a test — is gone, and with it the class of PR that edits one copy. The instance's own guarantees are
unchanged and still enforced at four layers (adapter, `CHECK` constraint, contract schema, CI).

**Costs, honestly.** This project now renders links it has not vetted. A reader who installs a
careless or hostile addon gets careless or hostile results, and the interface's job shrinks to
saying clearly which addon produced what. That labelling stops being cosmetic and becomes the
main safety property of the addon surface — an unlabelled addon result would be this instance
implicitly vouching for something it knows nothing about, which is the one thing this design must
never do.

The `unknown`-means-`copyrighted` rule in legal-policy.md §3 keeps its meaning for the instance's
own pipeline and simply has no counterpart on the addon path, because nothing there claims a
rights status at all. `AddonSource` has no `rightsStatus` field, and adding one would be a lie
dressed as metadata: the addon knows, and we do not.

**What changes if this turns out to be wrong.** The reversal is a gate at one place —
`AddonRegistry`, where every addon result already passes on its way to the UI. It would be perhaps
forty lines. What could not be reversed is a shipped index of addons, which is why this ADR
forbids one and [ADR-0010](0010-addon-engine.md) implements the forbidding.
