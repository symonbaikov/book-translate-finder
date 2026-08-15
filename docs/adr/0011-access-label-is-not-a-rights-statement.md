# ADR-0011: An access label is not a rights statement

- **Status:** accepted
- **Date:** 2026-08-15
- **Amends:** [legal-policy.md](../legal-policy.md) §3 rule 2

## Context

A reader opening _Harry Potter and the Philosopher's Stone_ was offered a free download, labelled
**public domain**, of its 2007 Tibetan translation. The book is in copyright in every jurisdiction
that has one.

Nothing had been bypassed. `LinkPolicy` was applied, `internet-archive` is on the download
allowlist, the status said `public_domain`, and the check passed exactly as written. The chain that
produced it:

1. Open Library's availability API reported `status: "full access"` for the scan.
2. `open-library-provider.ts` mapped `full access` → `public_domain`, which is
   [legal-policy.md](../legal-policy.md) §3 rule 2 implemented faithfully.
3. `LinkPolicy` saw an allowlisted provider and a public-domain status, and allowed a `download`.

So the defect is in the rule, not in its implementation. Rule 2 read a statement about **access**
as a statement about **rights**, and the two are not the same thing on a general-purpose host.
Internet Archive stores public domain scans and in-copyright books side by side; "full access"
means the item is readable there, and the reasons an item is readable include arrangements that
have nothing to do with the work being public domain.

The scale in the seeded database was 6 links out of 1552 free ones — small, and every one of them
the exact failure the project's legal architecture exists to prevent. I-4 promises that a reader is
never misled about the nature of a link, and a "public domain" badge on a book that is not public
domain is the most direct way to break that promise.

The obvious fix — work out whether the work is still in copyright — is forbidden by §3's own
closing note, and rightly: term of protection depends on the author's death, the jurisdiction and
a pile of exceptions, and a homegrown calculation would be wrong in ways nobody here can audit.

## Decision

**A provider's public-domain claim is believed only when it is a statement about the work, not a
label about access.**

Two provider classes, and the distinction is about what the provider is:

| Class                                                          | Providers                                                | Claim believed    |
| -------------------------------------------------------------- | -------------------------------------------------------- | ----------------- |
| Chartered — the whole corpus is public domain by its own remit | `gutenberg`, `wikisource`, `standard-ebooks`, `librivox` | yes               |
| Reviewed one book at a time (ADR-0004)                         | `authorized-free`                                        | yes               |
| General-purpose host, status inferred from an access label     | `internet-archive`                                       | only if plausible |

For the last class, a `public_domain` status on a `download` or `listen` link is **refused** when
the work was first published fewer than 95 years before the link was verified.
`ImplausiblePublicDomainClaimError` is a domain error, so `SyncWorkFromSource` skips that one link
and keeps the edition's others, exactly as it already does for every other policy rejection.

### Why this is not the term calculation §3 forbids

The rule is one-directional: it can only ever **withhold** `public_domain`, never grant it. A work
inside the window may well be public domain — the project does not claim to know, and "does not
know" is the state §3 already requires to be treated as copyrighted. Nothing that was refused
before becomes allowed; a strict subset of what was allowed before is now refused.

95 years is the longest term in common use anywhere (US works made for hire, measured from
publication). It is a floor on credibility, not an assertion about any particular book.

The window is measured from the link's own `verifiedAt` rather than a hardcoded year, so it moves
with time instead of quietly rotting into a wrong constant.

### What is deliberately not done

- **Not fixed in the adapter alone.** An adapter that stops making the claim fixes today's bug; a
  domain rule makes the next adapter unable to reintroduce it. The policy is where the project
  says these decisions live, so that is where this one lives.
- **Not downgraded to a `borrow` link.** Refused means refused: turning a copyright claim we
  disbelieve into a different kind of link would be this instance deciding, on its own authority,
  how the reader may reach a file. If Internet Archive offers lending for the item, its `lendable`
  status already produces a `borrow` link through the normal path.
- **`open_license` is untouched.** An open licence is granted by the rights holder, and a book
  published last year under CC BY is entirely ordinary.
- **A missing year is not treated as suspicion.** Sources omit it constantly — 242 of Project
  Gutenberg's links in the seeded database have no year — and refusing those would delete a large
  part of the catalogue to catch nothing.

## Consequences

- Six links in the seeded database are now invalid and are not recreated on re-sync. Existing rows
  are not retroactively deleted by this change; an instance that already stored them needs a
  cleanup pass (see the note in [legal-policy.md](../legal-policy.md) §3).
- Genuinely public domain scans on Internet Archive of works published within the window lose
  their download link. This is the intended trade: the project would rather withhold a legal
  download than offer an illegal one, which is the same trade I-1 already makes everywhere else.
- The rule is invisible for Project Gutenberg, Standard Ebooks, Wikisource and LibriVox, which is
  where the great majority of the project's free downloads come from.
