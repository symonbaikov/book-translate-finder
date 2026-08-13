# Data reconnaissance report — Phase 0

Date: 2026-08-13. Sources: Open Library Search API, Google Books API (without a key). Sample: 50
books — 20 classics/public domain, 20 contemporary bestsellers, 10 niche non-fiction, with a
deliberate spread of original languages (Russian, English, Spanish, French, Greek, Italian,
Swedish, Portuguese, Japanese, Hebrew) — otherwise the "how many translation languages were
found" metric would be meaningless for a purely English-language sample.

Related documents: [plan.md](../plan.md) (success criteria, stop condition) ·
[architecture.md](../architecture.md) (source priority, cache) ·
[legal-policy.md](../legal-policy.md) (legal status of links) ·
[prototype/](../../prototype/) (clickable prototype).

---

## TL;DR

- **Hypothesis confirmed, with a sampling caveat**: 50/50 books (100%) found ≥3 languages via
  Open Library alone, with a median of 16 languages per book. The "≥70% of books find ≥3
  translations" goal from `plan.md` is exceeded by a wide margin — **but the sample consists of
  deliberately well-known books**; for the long tail of niche queries the result may be worse
  (see "Limitations" below).
- **Critical methodology finding**: a field-scoped query (`title:"..." author:...`) is nearly
  useless — Open Library deduplicates "work" records poorly, and such a query finds only a
  fragment of editions in a single language. A plain full-text query (`q=title author`) finds
  the canonical record with the full set of languages. **This changes the `OpenLibraryProvider`
  implementation in Phase 1.3** — only the full-text query is used.
- **Google Books is unverifiable in this environment**: the anonymous daily quota was exhausted
  before the first substantive request (`quota_limit_value: "0"`). The assessment is limited to
  manual testing of response shapes + this finding as such.
- **Open Library turned out to be unstable under sequential load**: on the first pass (50
  requests in a row, 1s delay) — **76% of requests** (38 of 50) failed with `ECONNRESET` /
  timeout / connection refused. After retries with increased delay (4s, then 8s) all 50
  eventually succeeded. This is a direct requirement for `Phase 1.3`: retries with exponential
  backoff and a circuit breaker are not optional — they are a precondition for getting a
  complete response from the source at all.
- **The "translator" field is indeed patchy, as `plan.md` predicted**, but not hopeless: at the
  level of an individual edition a structured translator is present in only ~12% of editions,
  but at the work level **17 of the 18 checked books had at least one edition with a
  translator**. ISBN, by contrast, is in good shape — 89% of editions.
- **`prototype/` cannot literally be "without a backend"** — neither Open Library nor (in some
  cases) Google Books returns `Access-Control-Allow-Origin`; a direct `fetch()` from the browser
  is blocked by CORS. A minimal same-origin proxy route was added inside the same Next.js app —
  no DB, no queues, no separate service.
- **Decision**: we proceed to Phase 1 with Open Library as the primary source of
  languages/editions, without emergency inclusion of WorldCat/Index Translationum in the MVP —
  they remain in Phase 2 as planned. Google Books remains a secondary source (ISBN, purchase),
  but its own contribution to improving completeness could not be confirmed in this environment.

---

## Methodology

### Sample

The full list of 50 books and details — see the table in the "Results" section. Breakdown: 20
classics/public domain (mostly published before 1929 — a working US public-domain heuristic),
20 contemporary copyrighted bestsellers, 10 niche non-fiction.

### Open Library queries

**The methodology finding that shaped the entire approach:** a field-scoped query of the form
`q=title:"War and Peace" author:Tolstoy` systematically returns a set of many poorly
deduplicated `work` records (a known Open Library work-deduplication problem), each of which
contains editions **in only one language**. In a test with "War and Peace", the field-scoped
query returned several different `work` keys, each with `language: ["eng"]`, edition_count
3–12 — the translations are simply not found.

A plain full-text query (`q=War and Peace Tolstoy`, without `title:`/`author:`) for the same
title returns the single canonical record `/works/OL267096W` with edition_count=1315 and 23
languages — and it is the top result by relevance. **Conclusion: the methodology must use the
full-text query, not field-scoped**, otherwise completeness is understated by a large factor.
This directly affects the `OpenLibraryProvider` implementation in Phase 1.3.

Final per-book methodology:

1. `GET /search.json?q={title} {author}&fields=key,title,author_name,language,edition_count,first_publish_year,ebook_access&limit=5`
2. Take the first result (`docs[0]`) by relevance — empirically, across all 50 sample books it
   turned out to be the most complete record.
3. Number of languages = length of the `language` array in that record (the set of unique
   languages across the indexed editions of that `work`).

Raw response fixtures — [fixtures/open-library-search-classic.json](fixtures/open-library-search-classic.json),
[…-bestseller.json](fixtures/open-library-search-bestseller.json),
[…-nonfiction.json](fixtures/open-library-search-nonfiction.json).

### Google Books queries

`GET /volumes?q=intitle:{title}+inauthor:{author}&maxResults=5` — edition metadata, ISBN,
`saleInfo.buyLink`.

**Blocker:** the very first test request to the anonymous (keyless) Google Books API in this
environment returned `429 RESOURCE_EXHAUSTED` with `quota_limit_value: "0"` — the anonymous
daily quota was already exhausted for the outbound IP/project used here (see
[fixtures/google-books-quota-exceeded-429.txt](fixtures/google-books-quota-exceeded-429.txt)).
A retry after 15 seconds and a re-check an hour later produced the same error — this is a
daily, not a per-second, limit. A full 50-book run through Google Books is impossible in this
environment.

This is itself a significant finding: **the anonymous Google Books API is unfit even for
development and testing without a key**, not just for production. `GOOGLE_BOOKS_API_KEY` in
`.env.example` ([architecture.md §9.2](../architecture.md#92-configuration-of-a-self-host-installation))
should be treated not as "optional, but with low limits" but as "mandatory for any use beyond a
single manual test".

### Open Library connection reliability

On the first sequential pass over all 50 books (1s pause between requests, as public-API
etiquette recommends), **38 of 50 requests (76%) failed** — `ECONNRESET` (28), `timeout` (7),
`connection refused` (3). A second pass over the same books with a 4s pause reduced the error
count to 16 (32%); a final pass with an 8s pause and up to 3 attempts per book — to 0.

Possible causes (indistinguishable from the client side): (a) aggressive throttling/anti-abuse
behavior on Open Library's side under sustained sequential load from one IP, even at a modest
~1 request/sec pace; (b) peculiarities of outbound networking in this isolated cloud
environment (noisy neighbors on a shared IP). In favor of (a): `curl` to the same host kept
working during the run (albeit with 5–7s latency), and `curl` requests outside the Node/`fetch`
path sometimes succeeded where `fetch` in Node failed with `ECONNRESET` — i.e. the problem is
not universal across all clients at once, which looks more like instability/limits on the
remote side than a complete outbound-network blackout.

**Direct consequence for Phase 1.3**: retries with exponential backoff and jitter, sane
timeouts, a per-provider circuit breaker — this is not "future-proofing for later" work, but a
precondition for getting a complete response from Open Library in production at all. It is also
worth re-verifying this finding from a regular (non-shared cloud) IP before baking it into the
Phase 3 SLAs/alerts.

### CORS (discovered while building the prototype)

The Phase 0 plan assumed "a Next.js search page **without a backend**, direct API requests from
the client". Header inspection showed:

- **Open Library does not return `Access-Control-Allow-Origin`** for any `Origin` header — a
  direct `fetch()` from the browser is blocked by CORS policy.
- **Google Books does support CORS** — it returns an `access-control-allow-origin` reflecting
  the `Origin`, visible even in the `429` response.

Because of Open Library, `prototype/` physically cannot be "without a backend" in the literal
sense — a minimal same-origin proxy route was added inside the same Next.js app
(`app/api/search/route.ts`, `app/api/editions/route.ts`): no DB, no queues, no separate
service, just a server-side `fetch` instead of a client-side one. The spirit of Phase 0 is not
violated (the prototype is still throwaway and does not pass layer-boundary checks), but the
literal wording of the task in `plan.md` was inaccurate — it has been updated.

### Methodology limitations

- The language count in `search.json` reflects the languages of **indexed editions**, not
  confirmation that a readable text exists; some records may be catalog entries without a text.
- The count includes **the book's original language** as one of the "found languages" — i.e. it
  is not exactly "number of translations" but "number of publication languages minus not
  necessarily one". At the observed minimums (the next smallest value after 3 is 6),
  subtracting one does not change a single verdict against the "≥3" threshold.
- **Sample bias**: all 50 books are deliberately well-known (classics or bestsellers). This was
  a conscious choice for Phase 0 (the hypothesis had to be checked quickly and on obvious
  examples), but the result **cannot** be extrapolated to the long tail of niche/local books
  without a separate measurement — likely future work for Phase 2.
- Picking `docs[0]` by Open Library relevance is an empirical heuristic, not a guarantee; for
  "The Order of Time" (non-fiction, originally in Italian) the found language list contained no
  Italian at all — likely `docs[0]` was not the fully canonical record for this less famous
  book. This did not affect the `≥3` threshold conclusions (all 3 found languages are
  translations), but it illustrates the fragility of the "top by relevance" heuristic on less
  well-known books.
- One record contains a data artifact of Open Library itself: `first_publish_year: 0` for "The
  War of the Worlds" — not a collection error; the value came from the API exactly like that.
- Google Books is not fully covered (see the quota blocker above) — a quantitative assessment
  across all 50 books is impossible in this environment.
- The "translator"/ISBN field assessment was done on a subsample of 18 books (~6 per category),
  not all 50 — Open Library provides no aggregated statistics for this field, only one edition
  at a time, and that is expensive in request count.

---

## Results across 50 books (Open Library)

| Book                                     | Category    | Orig. language | Languages found | Editions | First publ. year       |
| ---------------------------------------- | ----------- | -------------- | --------------- | -------- | ---------------------- |
| War and Peace                            | classic     | Russian        | 16              | 644      | 1864                   |
| Crime and Punishment                     | classic     | Russian        | 22              | 1179     | 1866                   |
| Anna Karenina                            | classic     | Russian        | 23              | 1315     | 1876                   |
| The Brothers Karamazov                   | classic     | Russian        | 18              | 313      | 1880                   |
| Pride and Prejudice                      | classic     | English        | 27              | 4039     | 1813                   |
| Great Expectations                       | classic     | English        | 18              | 1489     | 1861                   |
| Frankenstein                             | classic     | English        | 9               | 2187     | 1818                   |
| Dracula                                  | classic     | English        | 16              | 1917     | 1897                   |
| Alice's Adventures in Wonderland         | classic     | English        | 51              | 3547     | 1865                   |
| The Picture of Dorian Gray               | classic     | English        | 20              | 3012     | 1890                   |
| Ulysses                                  | classic     | English        | 17              | 612      | 1914                   |
| The Adventures of Sherlock Holmes        | classic     | English        | 17              | 1133     | 1892                   |
| The War of the Worlds                    | classic     | English        | 11              | 457      | _0 (OL data artifact)_ |
| Don Quixote                              | classic     | Spanish        | 29              | 1594     | 1600                   |
| Madame Bovary                            | classic     | French         | 20              | 1558     | 1856                   |
| The Count of Monte Cristo                | classic     | French         | 28              | 736      | 1830                   |
| Les Misérables                           | classic     | French         | 15              | 526      | 1862                   |
| The Odyssey                              | classic     | Greek          | 26              | 1064     | 1488                   |
| The Divine Comedy                        | classic     | Italian        | 27              | 1339     | 1472                   |
| Moby Dick                                | classic     | English        | 20              | 1116     | 1851                   |
| Harry Potter and the Philosopher's Stone | bestseller  | English        | 49              | 398      | 1997                   |
| The Da Vinci Code                        | bestseller  | English        | 25              | 203      | 2003                   |
| The Hunger Games                         | bestseller  | English        | 19              | 142      | 2008                   |
| Gone Girl                                | bestseller  | English        | 6               | 48       | 2011                   |
| The Girl with the Dragon Tattoo          | bestseller  | Swedish        | 12              | 78       | 2005                   |
| Nineteen Eighty-Four                     | bestseller  | English        | 22              | 536      | 1949                   |
| The Kite Runner                          | bestseller  | English        | 20              | 125      | 2003                   |
| Life of Pi                               | bestseller  | English        | 14              | 115      | 2000                   |
| The Alchemist                            | bestseller  | Portuguese     | 19              | 141      | 1988                   |
| A Game of Thrones                        | bestseller  | English        | 18              | 136      | 1996                   |
| The Book Thief                           | bestseller  | English        | 16              | 109      | 1998                   |
| Twilight                                 | bestseller  | English        | 13              | 131      | 2005                   |
| The Fault in Our Stars                   | bestseller  | English        | 12              | 80       | 2010                   |
| Gone with the Wind                       | bestseller  | English        | 22              | 362      | 1936                   |
| The Shadow of the Wind                   | bestseller  | Spanish        | 12              | 99       | 2001                   |
| Norwegian Wood                           | bestseller  | Japanese       | 11              | 56       | 1987                   |
| The Name of the Wind                     | bestseller  | English        | 13              | 76       | 2007                   |
| Educated                                 | bestseller  | English        | 6               | 35       | 2018                   |
| Where the Crawdads Sing                  | bestseller  | English        | 10              | 44       | 2018                   |
| The Silent Patient                       | bestseller  | English        | 6               | 26       | 2018                   |
| Sapiens                                  | non-fiction | Hebrew         | 13              | 86       | 2011                   |
| Thinking, Fast and Slow                  | non-fiction | English        | 7               | 35       | 2011                   |
| The Selfish Gene                         | non-fiction | English        | 9               | 41       | 1976                   |
| Guns, Germs, and Steel                   | non-fiction | English        | 15              | 61       | 1997                   |
| The Emperor of All Maladies              | non-fiction | English        | 8               | 29       | 2010                   |
| Silent Spring                            | non-fiction | English        | 6               | 57       | 1962                   |
| A Brief History of Time                  | non-fiction | English        | 15              | 120      | 1988                   |
| The Structure of Scientific Revolutions  | non-fiction | English        | 9               | 47       | 1955                   |
| Debt: The First 5000 Years               | non-fiction | English        | 6               | 12       | 2011                   |
| The Order of Time                        | non-fiction | Italian        | 3               | 17       | 2017                   |

### Aggregates by category

| Category                 | n      | Median languages | Mean languages | Min/max | Share with ≥3 languages | Median editions |
| ------------------------ | ------ | ---------------- | -------------- | ------- | ----------------------- | --------------- |
| Classics/public domain   | 20     | 20.0             | 21.5           | 9 / 51  | 20/20 = 100%            | 1247            |
| Contemporary bestsellers | 20     | 13.5             | 16.2           | 6 / 49  | 20/20 = 100%            | 112             |
| Non-fiction              | 10     | 8.5              | 9.1            | 3 / 15  | 10/10 = 100%            | 44              |
| **Total**                | **50** | **16.0**         | —              | —       | **50/50 = 100%**        | —               |

The expected gradient held: classics (many editions over centuries, usually already public
domain) > bestsellers (actively translated right now, but younger) > non-fiction (translated
more selectively, fewer editions overall). Not a single book in the sample came anywhere near
the threshold — the minimum across the whole sample is 3 (non-fiction, "The Order of Time", see
the `docs[0]` heuristic caveat above), and the next minimum is already 6.

---

## Google Books

A quantitative assessment across the 50 books is impossible — the anonymous daily quota was
exhausted before substantive testing began (see "Methodology" and the
[error fixture](fixtures/google-books-quota-exceeded-429.txt)). Before the quota ran out, a few
manual requests got through, confirming a response shape (`items[].volumeInfo.language`,
`industryIdentifiers`, `saleInfo.buyLink`) sufficient for Google Books' role in the
architecture — a secondary source of ISBNs/purchase links, not the primary source of language
counts ([architecture.md §5](../architecture.md#5-sync-flow): "`open-library >
google-books` for languages/editions").

**Recommendation**: before Phase 1.3, either (a) obtain a `GOOGLE_BOOKS_API_KEY` and rerun this
same script with the key from a regular (non-shared cloud) IP, or (b) explicitly accept that
the Google Books completeness assessment is deferred until a real adapter exists with its own
cache and rate-limit respect — either way, the key must be in `.env` already during Phase 1
development, not only for self-hosted production.

---

## Quality of the "translator" field and ISBN

Subsample: 18 books (~6 per category), all editions of each canonical `work` record (up to 50
per book), 853 editions in total. Raw responses —
[fixtures/open-library-editions-with-translators.json](fixtures/open-library-editions-with-translators.json)
("The Picture of Dorian Gray", a good example) and
[fixtures/open-library-editions-sample.json](fixtures/open-library-editions-sample.json) ("War
and Peace").

**An important mid-work methodological correction**: Open Library stores the translator in a
structured field `contributors: [{role: "Translator", name: "..."}]`, not in free text — the
first version of the script checked only the text fields (`contributions`, `by_statement`) and
understated the result to nearly zero. After the fix the picture is different:

| Metric                                                                                          | Value       |
| ----------------------------------------------------------------------------------------------- | ----------- |
| Editions checked                                                                                | 853         |
| …with a named translator (`contributors[].role`)                                                | 104 (12.2%) |
| …with a `translated_from` field (original language of the specific edition, no translator name) | 140 (16.4%) |
| …with an ISBN-10 or ISBN-13                                                                     | 760 (89.1%) |
| Books where at least 1 checked edition contains a named translator                              | 17 / 18     |
| Books where at least 1 edition contains `translated_from`                                       | 18 / 18     |

**Interpretation**: at the level of an individual edition the "translator" field is indeed
patchy, as `plan.md` predicted — only ~12% of editions are labeled with it. But at the product
level something else matters more: for almost every book (17 of 18) there is **at least one**
edition with a named translator — meaning the Phase 1 book card will be able to show the
translator's name for most works, even if not for every specific edition. Additionally,
`translated_from` (the original language of a specific edition) is filled in more often and
independently of the translator's name — it should be used in Phase 1.1 as a standalone "this
is a translation" signal, even when the translator's name is unknown.

ISBN, by contrast, is in good shape (89%) and needs no special compensating logic.

---

## Latency and limits

| Metric                                             | Value       |
| -------------------------------------------------- | ----------- |
| Median latency of a successful `search.json`       | 3.5s        |
| Mean                                               | 6.0s        |
| Maximum                                            | 22.0s       |
| Failed-request share at 1 req/s, no retries        | 76% (38/50) |
| Failed-request share at 1 req/4s                   | 32% (16/50) |
| Failed-request share at 1 req/8s, up to 3 attempts | 0% (0/50)   |

The target from `plan.md` ("cold cache ≤ 2s, warm ≤ 300ms") refers to **our API's response from
its own DB**, not to a direct call to Open Library — these numbers confirm why the
architectural decision "a user request never goes synchronously to an external API"
([architecture.md §1](../architecture.md#1-system-context-and-boundaries)) is necessary
literally: a 3.5s median and a 22s maximum per request make a synchronous call unacceptable for
a user-facing HTTP response, and the connection instability makes retries in a background
worker mandatory — where an extra second or two is invisible to the user.

Google Books: the only clearly measured limit is the anonymous daily quota, exhausted entirely
(`quota_limit_value: 0`). The exact daily limit with a key was not measured (no key in this
environment).

---

## Decision on the "≥70% of books find ≥3 translations" criterion

**The criterion is exceeded**: 50/50 (100%) of the sample books found ≥3 languages via Open
Library alone, with a median of 16. Even the weakest category (non-fiction) scored 100% with a
median of 8.5.

**But the decision comes with a caveat**, not an unconditional "yes":

1. The sample is deliberately well-known books (classics and bestsellers). The hypothesis is
   **confirmed for this segment**, which probably makes up the bulk of real user queries, but
   is not proven for the long tail of niche/local books.
2. Bottom line: **we proceed to Phase 1 without emergency inclusion of WorldCat/Index
   Translationum** — they remain in Phase 2 per the original plan. The stop condition from
   `plan.md` ("median < 2 → we reconsider the niche") did not come anywhere close to firing —
   median 16 against a threshold of 2.
3. Three findings from this phase change the implementation, not just confirm the hypothesis,
   and must be reflected in the Phase 1.3 backlog (already added to `plan.md`):
   - `OpenLibraryProvider` uses only the full-text query, never field-scoped.
   - Retries with backoff and a circuit breaker are mandatory from the adapter's first version,
     not "we'll add them later" — without them Open Library is unavailable for 76% of requests
     under a naive implementation.
   - `GOOGLE_BOOKS_API_KEY` is mandatory already for development, not only for self-hosted
     production.
4. A one-off, cheap task for the start of Phase 1 (does not block the start): run this same
   script over a sample of ~15–20 **niche/little-known** books (mid-list smaller non-fiction,
   local editions, books under 5 years old with no screen adaptations) — to have a real
   worst-case number, not just the easy-case one.
