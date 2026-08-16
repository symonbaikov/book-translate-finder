# ADR-0013: Gallica on the download allowlist

- Status: accepted
- Date: 2026-08-16

## Context

This instance can now describe a great many editions of a book, and for a handful of them it can
say "here, take it for nothing" — Project Gutenberg, LibriVox, Wikisource, and the books whose
rights holders publish them for free. Every one of those is either English-dominated or thin
outside a few big languages. A reader looking for a free copy of a nineteenth-century French book
gets nothing, even though France digitised it decades ago and put it online.

Gallica is the Bibliothèque nationale de France's own digital library. Its SRU API is open, needs
no key, and answers with Dublin Core records that carry a stable `ark:` URL to the digitised copy.

Adding a provider to `LinkPolicy`'s download allowlist is a legal decision that requires an ADR
(docs/legal-policy.md §5), so this is that record.

## Decision

**Gallica is allowlisted, and a link is emitted only for a record that states its own rights.**

The distinction is the whole of this ADR, because it is the one
[ADR-0011](0011-access-label-is-not-a-rights-statement.md) drew when it refused to read Internet
Archive's "full access" as a statement about copyright. An access label says what the host will
let you do today. A rights statement says what the law says about the work. They are not the same
fact, and the project treats only the second as permission.

Gallica publishes the second. Every record carries `dc:rights`, and for a digitised public domain
book it reads `domaine public` / `public domain` — the BnF's own assessment of that item, made by
the national library of the country whose law governs it, recorded per item rather than inferred
from a viewing button. That is the same kind of claim Project Gutenberg makes about its corpus and
a stronger one than either, because it is stated per record instead of by charter.

So the adapter never infers. A record whose `dc:rights` does not say public domain yields an
edition and **no link at all** — the bibliographic fact that the printing exists is still true and
still useful, and the absence of a link is the honest consequence of not being told.

**Gallica is not added to `CHARTERED_PUBLIC_DOMAIN_PROVIDERS`.** Unlike Gutenberg or LibriVox, its
corpus is not public domain by charter: Gallica also hosts in-copyright material under agreement,
which is exactly why `dc:rights` varies from record to record and has to be read. Leaving it out
of the chartered set means the plausibility guard (`assertPublicDomainClaimIsPlausible`, 95 years)
still applies to it — so a public domain claim on a work young enough to still be in copyright
somewhere is refused even though Gallica made it. Two independent checks, and the cheaper one is
not switched off because the source is reputable.

## Consequences

Public domain books in French gain a free, legal, permanent copy — from the national library that
holds the paper original. The nineteenth-century printings Gallica digitised are also, in this
project's terms, rare editions: the live check that prompted this found _Aventures d'Alice au pays
des merveilles_ in printings of 1869 and 1908.

What this does **not** do, stated so it is not read as more than it is:

- It is French. Gallica is a French national collection, and this closes the free-copy gap for one
  language, not for the long tail generally.
- It does not make Gallica a general rights oracle. The project believes `dc:rights` about
  Gallica's own items and nothing else; a record that says nothing is treated as saying nothing.
- The endpoint answers `403` to a request without a `User-Agent`, which is a fragile dependency on
  our own etiquette header. If that ever changes shape, the provider fails closed — no links —
  rather than degrading into guesses.
