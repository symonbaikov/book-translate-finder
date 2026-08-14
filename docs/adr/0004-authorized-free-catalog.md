# ADR-0004: A hand-curated catalog of books their rights holder publishes for free

- Status: accepted
- Date: 2026-08-14
- Supersedes: —

## Context

The app could answer "where do I get this book" in three ways: a public domain download
(Project Gutenberg), a library loan (Open Library / Internet Archive), or a purchase link. It had
no answer for a fourth case that readers actually meet: **a book still under copyright that its
author or publisher deliberately gives away.** Cory Doctorow's novels, Peter Watts', _Pro Git_ —
these are legal free copies, and the app had no way to offer them.

The obvious automated approach — search the open web for `"<title>" filetype:pdf` and offer the
hits — was proposed and rejected. Such a query cannot distinguish the author's own copy from an
unauthorized one, and for a copyrighted book it overwhelmingly returns the latter. Shipping it
would make the project a funnel to shadow libraries with one extra click, which
[docs/legal-policy.md](../legal-policy.md) I-3 forbids outright and which README, CONTRIBUTING and
the UI footer all promise against.

No API, feed or index exists for "the rights holder put this online for free". The information is
real but unstructured: it lives on an author's website, in a publisher's announcement, in a
licence line at the front of a book.

## Decision

Add a **hand-curated catalog** (`packages/domain/src/policy/authorized-free-catalog.ts`) and a
provider that reads it (`AuthorizedFreeProvider`), with `authorized-free` added to `LinkPolicy`'s
download allowlist.

Every entry must carry:

- `authorization` — the rights holder's own page granting the free copy. This is the evidence a
  reviewer reads; entries without it fail the test suite.
- `license` — the permission as the rights holder states it.
- `verifiedOn` — the ISO date a human last opened that page.
- `downloads` — direct https URLs, one per format.

Links are `open_license`, never `public_domain`: these books are in copyright, and free only
because permission was given. If the permission is withdrawn, the entry is deleted and the link
disappears at the next sync.

The catalog is a provider rather than a special case inside a use case, so one rule stays true:
every link in the database arrived through a source adapter and passed `LinkPolicy`, with no
privileged path around it. It runs as an _enrichment_ source, so a book another source discovered
first still gets its free download.

## Consequences

**Good.** The app can offer a legal free copy for books that have one, without guessing.
Contributors extend coverage with a one-entry PR and no code. The evidence trail — the
`authorization` page plus the `verifiedOn` date — makes each claim checkable rather than trusted.

**Bad.** Coverage is small and grows only as fast as people curate it — six books at the time of
writing. It is maintenance the project takes on: sites move, permissions get revoked, and nothing
detects that automatically. A rotted link becomes a bug report.

**Accepted anyway** because the alternative is not "broader coverage" but "coverage we cannot
stand behind". A short list of verified links is worth more than a long list of plausible ones.

**Rejected alternatives.** Web search by `filetype:` (see Context). Scraping author sites for
"download" links (scraping is forbidden by the same invariant, and an automated crawler cannot
read a licence statement). Trusting third-party "free ebooks" aggregators (they mix authorized and
unauthorized copies, which is exactly the judgement we would be outsourcing).
