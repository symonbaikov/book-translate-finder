# Project Legal Policy

This is the only part of the system where an architectural mistake creates real risk — hosting
takedowns and legal claims. That is why the rules below are fixed as **executable code
invariants**, not as wishes in a README.

Priority: if these rules conflict with any product or technical task, these rules win.

## 0. What these rules cover

Everything below governs **what this instance does**: what its adapters fetch, what its workers
write to Postgres, and what `/api` serves. That is the whole of it, and the boundary is deliberate.

It does not govern what a reader-installed addon returns in the reader's own browser. An addon is
chosen by the reader, installed by pasting a URL they found themselves, and either executes on their
device or is an HTTP service their browser talks to directly; its results never pass through this
instance and are never written down by it. The reasoning, including why a token gate over that path
would have been worse than none, is in
[ADR-0009](adr/0009-blind-core-link-policy-scope.md); the engine itself is
[ADR-0010](adr/0010-addon-engine.md).

The project ships no addon that provides copyrighted material, hosts no index of addons, and links
to none. That, plus everything in §1 continuing to hold for the instance's own pipeline, is what
keeps the repository legal to publish.

---

## 1. Invariants

**I-1. Direct download — only public domain or an explicit open license.**
A `download` link is allowed only if the provider is in the allowlist (Project Gutenberg,
Internet Archive, Wikisource, Standard Ebooks, and the curated `authorized-free` catalog) **and**
the edition's rights status is `public_domain` or `open_license`.

The `authorized-free` entry is different in kind from the others: it is not a repository trusted
wholesale, but a hand-curated list of individual books whose rights holder publishes them for free
(see [ADR-0004](adr/0004-authorized-free-catalog.md)). Each entry names the page where the author
or publisher grants the permission and the date a human last read it, and each is reviewed one
book at a time. Such links are always `open_license` — the book is in copyright, and free only
because permission was given.

Generating download links by searching the open web (`"<title>" filetype:pdf` and the like) is
**not** an acceptable route to this and never will be: for a copyrighted book such a query returns
unauthorized copies, so shipping it would be I-3 laundered through a search engine.

**I-2. For copyrighted works — deeplinks only.**
Purchase from a retailer/publisher (`buy`) or legal library lending
(`borrow`: Libby/OverDrive, Open Library Lending). Never a direct link to a file.

**I-3. No scraping and no shadow libraries.**
Library Genesis, Anna's Archive, Z-Library and the like are not used by this instance as a data
source, as a link source, or as a mirror. Parsing website HTML instead of using their official APIs
is forbidden. Per §0 this binds the instance's own pipeline; a reader's addon is outside it, and the
engine does not inspect what an addon returns.

**I-4. The legal status of every link is explicitly visible to the user.**
In the UI and in the API response, every link is labeled as "public domain" / "purchase" /
"library". The user must not be misled about the nature of a link.

**I-5. The policy is declared publicly.**
The README and the project license (MIT) announce this policy up front — this reduces
reputational risk and prevents misguided PRs from contributors.

---

## 2. How the invariants are enforced in code

### 2.1 The `LinkPolicy` domain policy

The single place in the system where the admissibility of a link is decided. Lives in
`packages/domain`. No adapter, controller, or React component is allowed to create a
`SourceLink` bypassing it.

```ts
// packages/domain/src/policy/link-policy.ts
const DOWNLOAD_ALLOWLIST = new Set(['gutenberg', 'internet-archive', 'wikisource', 'standard-ebooks', 'authorized-free']);
// Full registrable domains, not bare fragments — a fragment like "libgen" would false-positive
// on an unrelated domain that merely starts with it (e.g. a hypothetical "libgenuine-authors.com").
const DENYLIST_DOMAINS = ['libgen.rs', 'libgen.is', 'annas-archive.org', 'z-lib.io', 'sci-hub.se', /* … */];

export function assertLinkAllowed(candidate: LinkCandidate): SourceLink {
  const hostname = new URL(candidate.url).hostname.toLowerCase(); // auto-normalizes punycode/case
  if (DENYLIST_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
    throw new ForbiddenSourceError(hostname);             // I-3, robust to subdomain evasion
  }
  if (candidate.type === 'download') {
    if (!DOWNLOAD_ALLOWLIST.has(candidate.provider.value)) throw new IllegalDownloadLinkError(...);
    if (candidate.rightsStatus !== 'public_domain' && candidate.rightsStatus !== 'open_license') {
      throw new IllegalDownloadLinkError(...);           // I-1
    }
  }
  return SourceLink.unsafeCreateForPolicyUse(candidate);  // rightsStatus is mandatory → I-4
}
```

Key properties of the implementation (implemented and covered by tests in Phase 1.1,
`packages/domain/src/policy/link-policy.ts`):

- The `SourceLink` constructor is private — the entity is created only through the policy
  (`unsafeCreateForPolicyUse` is not exported from the package's public API).
- `rightsStatus` is a mandatory entity field, not an optional label. A link without a status
  is physically unrepresentable in the types.
- The denylist consists of full registrable domains, not short fragments (substring matching on
  a fragment yields false positives on coincidentally similar domains). The check is an exact
  host match or the host ending with `.{domain}` (protection against subdomain evasion); the
  host itself comes from `URL.hostname`, which already normalizes case and punycode.
- `buy`/`borrow` are not tied to `rightsStatus` (purchase or library lending is legal
  regardless of status); only `download` is the one type the policy gates by status.

### 2.2 Checks in the pipeline

| Place                  | Check                                                                      |
| ---------------------- | -------------------------------------------------------------------------- |
| Source adapter         | Link candidates pass `assertLinkAllowed` before being written to the DB    |
| DB                     | `CHECK` constraint: `type='download' AND is_legal_free=false` is forbidden |
| API response           | The `contracts` schema requires `rightsStatus` on every link               |
| CI                     | Policy tests + ban on adding hosts to the allowlist without an ADR         |
| Reader-installed addon | **none, deliberately** — see §0 and §2.4                                   |

### 2.3 Mandatory tests

- A link to any denylisted host → `ForbiddenSourceError`, including variants with a subdomain,
  a redirect in a query parameter, and punycode spelling.
- `type='download'` with `rightsStatus='copyrighted'` → error.
- `type='download'` from a provider outside the allowlist → error even with `public_domain`.
- Every link in an API response has a non-empty `rightsStatus`.
- Snapshot test on the contents of `DOWNLOAD_ALLOWLIST` and `DENYLIST_HOSTS`: changing the list
  breaks the test and requires a deliberate update together with an ADR.

On the addon side the tests assert the opposite, and just as deliberately: a source pointing at any
host at all is accepted, one using a `javascript:` / `data:` / `blob:` / `file:` scheme is not, and a
`rightsStatus` an addon tries to send is dropped rather than believed
(`packages/addons/src/resources.test.ts`).

### 2.4 The addon path, and why it has no check

An `AddonSource` (`packages/addons`) is not a `SourceLink` and cannot become one: `SourceLink`'s
constructor is private and reachable only through the policy, and no conversion exists in either
direction. The two types meet for the first time in the React tree, in separately labelled sections.

That separation is the enforcement. It is held by the `dependency-cruiser` rules `addons-is-a-leaf`
and `addons-never-on-the-server` rather than by review, so an addon result cannot reach the database,
the API contract, or the policy that guards them.

`AddonSource` carries no `rightsStatus` field. Adding one would be an invention: the addon knows
what it is offering and this project does not, and §3's "absence of data is not permission" is a rule
about what _we_ may publish, not a licence to publish a guess on someone else's behalf. What the
interface owes the reader instead is attribution — every addon result names the addon that produced
it, and an unlabelled one is a bug.

The one check that stayed is about the browser, not the host: an addon's URLs must be `http` or
`https`, because `javascript:`, `data:` and `blob:` execute in this origin and `file:` reads the
reader's disk. That is an injection defence and it is not a content rule — `https://any-host-at-all`
passes (`packages/addons/src/url.ts`).

---

## 3. Determining rights status

`rightsStatus ∈ { public_domain, open_license, copyrighted, unknown }`.

Assignment rules:

1. The edition is found in Project Gutenberg / Standard Ebooks / Wikisource → `public_domain`.
2. Internet Archive reports an open-access label (not lending) → `public_domain`.
3. The source reports an open license (CC BY, CC0, etc.) → `open_license`.
4. No explicit signals → `unknown`.

**`unknown` is treated as `copyrighted`.** A download link is never created for `unknown`.
Absence of data is not permission.

A note on terms: the term of protection differs across jurisdictions (life of the author + 70
years in the EU/Russia, a different rule in the US). The project does **not** compute public
domain status on its own from the author's year of death — it relies on the status declared by
an allowlisted source. Rolling our own term-of-protection calculation without legal counsel is
forbidden.

---

## 4. Rules for using sources

- Work only with official APIs and official dumps, within their ToS.
- Respect declared rate limits; on `429` — exponential backoff, not limit evasion.
- Identify ourselves: `User-Agent: GoldenLibrary/<version> (<contact-url>)`.
- Store and display source attribution wherever the source's license requires it.
- Do not republish full book texts — the project stores **metadata and links**, not content.
- Covers: display via the source's URL according to its rules; do not proxy or store copies
  without permission.

---

## 5. Policy change process

- Extending `DOWNLOAD_ALLOWLIST`, changing `DENYLIST_HOSTS` or the rules of §3 — only via an ADR
  with justification, and only in a separate PR, not mixed with feature work.
- A PR adding an integration with a shadow library **to this instance's own pipeline** is closed
  without discussion; the rule is duplicated in `CONTRIBUTING.md` (Phase 3).
- Two changes to the addon engine also require an ADR, in opposite directions and for the same
  reason — the boundary in §0 only means something if it stays where it is. Adding a content gate
  over addon results reintroduces the editorial role this project declined; shipping an addon
  index, directory or "recommended addons" list creates one. Neither is a feature decision.
- Any API route that accepts a URL to fetch is refused outright. The OPDS relay takes a feed **id**
  and will not be generalised ([ADR-0007](adr/0007-plugin-architecture.md) §3): a route that fetches
  what it is told is an open proxy, and it would also hand this instance the traffic §0 exists to
  keep away from it.
- A link found in production that violates I-1/I-2/I-3 is an incident: the link is disabled
  immediately, then a test is added that makes recurrence impossible.
