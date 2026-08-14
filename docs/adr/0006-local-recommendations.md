# ADR-0006: Recommendations computed from a history the server never sees

- Status: accepted
- Date: 2026-08-14

## Context

The home page should suggest books like the ones a reader has been opening. The obvious
implementation is the one every product uses: record each view server-side against a user or a
tracking cookie, build a profile, query against it.

That implementation cannot be built here. The sign-in page says, in every one of the fifteen
interface languages, "No newsletter, no profile, no tracking". Building a behavioural profile
would make that sentence false, and this project's whole argument — that it tells you what is
actually true about a book rather than what is convenient — does not survive lying in its own UI.

The feature is also wanted for readers who are _not_ signed in, which is most of them. A
server-side profile for an anonymous visitor means a tracking identifier, which is worse.

## Decision

The reading history lives in the reader's browser (`localStorage`), and the server is told genres,
never identity.

- Opening a work card records `{workId, title, subjects}` locally. Books with no genre tags are
  not recorded at all: they could not contribute to a recommendation, so storing them would be
  surveillance with no purpose.
- The browser derives a taste profile — genres weighted by recency, one-off tags dropped once a
  pattern exists — and sends only that list.
- `POST /api/recommendations` takes `{subjects, excludeWorkIds}` and returns books. It is a POST
  with a body rather than a GET with query parameters because query strings end up in access logs,
  proxy logs and `Referer` headers; a body does not.
- The request is used to answer and dropped. Nothing is written to the database, attached to a
  session, or logged. The server-side cache key is the _sorted genre list_ only, so two readers
  with the same taste share a cache entry and neither is distinguishable in it.

Only _opened_ books count. A search query looks like a signal and usually is not — it is as often
a typo, a miss, or someone checking a title for a friend — and it carries no genre until a book is
actually opened.

## Consequences

**Good.** The promise on the sign-in page stays true. Recommendations work for signed-out readers
with no identifier of any kind. There is no profile database to leak, subpoena, or migrate, and
"forget my history" is a real deletion because there is only one copy.

**Bad.** Recommendations do not follow a reader between devices or browsers, and clearing site data
clears them. Signed-in readers get nothing extra, which will look like an oversight. Both are the
honest price of not building a profile, and neither is worth paying to avoid.

**Also.** The quality of the suggestions is bounded by the quality of Open Library's contributor
subject tags, which range from "Fantasy" to "Arkenstone". The one-off filter exists because of
that, and it is why a reader whose books share no tags simply sees no section rather than a
section full of noise.
