# Project Legal Policy

This is the only part of the system where an architectural mistake creates real risk — hosting
takedowns and legal claims. That is why the rules below are fixed as **executable code
invariants**, not as wishes in a README.

Priority: if these rules conflict with any product or technical task, these rules win.

---

## 1. Invariants

**I-1. Direct download — only public domain or an explicit open license.**
A `download` link is allowed only if the provider is in the allowlist (Project Gutenberg,
Internet Archive, Wikisource, Standard Ebooks) **and** the edition's rights status is
`public_domain` or `open_license`.

**I-2. For copyrighted works — deeplinks only.**
Purchase from a retailer/publisher (`buy`) or legal library lending
(`borrow`: Libby/OverDrive, Open Library Lending). Never a direct link to a file.

**I-3. No scraping and no shadow libraries.**
Library Genesis, Anna's Archive, Z-Library and the like are not used as a data source, as a
link source, or as a mirror. Parsing website HTML instead of using their official APIs is forbidden.

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
const DOWNLOAD_ALLOWLIST = new Set(['gutenberg', 'internet-archive', 'wikisource', 'standard-ebooks']);
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

| Place          | Check                                                                      |
| -------------- | -------------------------------------------------------------------------- |
| Source adapter | Link candidates pass `assertLinkAllowed` before being written to the DB    |
| DB             | `CHECK` constraint: `type='download' AND is_legal_free=false` is forbidden |
| API response   | The `contracts` schema requires `rightsStatus` on every link               |
| CI             | Policy tests + ban on adding hosts to the allowlist without an ADR         |

### 2.3 Mandatory tests

- A link to any denylisted host → `ForbiddenSourceError`, including variants with a subdomain,
  a redirect in a query parameter, and punycode spelling.
- `type='download'` with `rightsStatus='copyrighted'` → error.
- `type='download'` from a provider outside the allowlist → error even with `public_domain`.
- Every link in an API response has a non-empty `rightsStatus`.
- Snapshot test on the contents of `DOWNLOAD_ALLOWLIST` and `DENYLIST_HOSTS`: changing the list
  breaks the test and requires a deliberate update together with an ADR.

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
- Identify ourselves: `User-Agent: BookTranslateFinder/<version> (<contact-url>)`.
- Store and display source attribution wherever the source's license requires it.
- Do not republish full book texts — the project stores **metadata and links**, not content.
- Covers: display via the source's URL according to its rules; do not proxy or store copies
  without permission.

---

## 5. Policy change process

- Extending `DOWNLOAD_ALLOWLIST`, changing `DENYLIST_HOSTS` or the rules of §3 — only via an ADR
  with justification, and only in a separate PR, not mixed with feature work.
- A PR adding an integration with a shadow library is closed without discussion; the rule is
  duplicated in `CONTRIBUTING.md` (Phase 3).
- A link found in production that violates I-1/I-2/I-3 is an incident: the link is disabled
  immediately, then a test is added that makes recurrence impossible.
