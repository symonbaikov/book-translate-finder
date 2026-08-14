# ADR-0005: LibriVox on the download allowlist, and a `listen` link type

- Status: accepted
- Date: 2026-08-14

## Context

The app could say where to read a book and where to buy it, but not where to hear it. Audiobooks
are how a growing share of people read, and leaving them out is a real gap rather than a nicety.

Adding a provider to `LinkPolicy`'s download allowlist is a legal decision that requires an ADR
(docs/legal-policy.md §5), so this is that record.

## Decision

**LibriVox is allowlisted.** Every LibriVox recording is read by volunteers from a public domain
text and released into the public domain by LibriVox's own charter. That is the same premise as
Project Gutenberg, which is already allowlisted, and it bounds what the provider can ever offer:
public domain audiobooks and nothing else. No open source lists which commercial audiobooks a
reader could buy, so the app does not pretend to answer that.

**`listen` is a new link type,** alongside `download`, `buy` and `borrow`. A LibriVox book yields
two things — an archive of MP3s to keep, and a page to press play on — and they answer different
questions. Folding the second into `download` would mean a reader looking for an audiobook has to
open every download link to find out which ones are audio.

`listen` is gated exactly as strictly as `download`: an allowlisted provider, and `public_domain`
or `open_license`. Streaming rather than saving changes nothing about whether we are pointing
someone at a full copy of a work. The database CHECK constraint that already forbade a `download`
link marked not-legally-free now covers `listen` too, so the invariant holds at the storage
boundary independent of application code.

## Consequences

Public domain classics gain an audio option, labelled with its running time, which is the fact
that actually distinguishes one recording from another.

The gap this does _not_ close: commercial audiobooks. Audible, Storytel and their peers have no
open catalogue API, so a reader looking for a paid audiobook of a current novel still gets
nothing here. That is an honest absence rather than a guess, and it is recorded in
docs/plan.md Phase 4.4.
