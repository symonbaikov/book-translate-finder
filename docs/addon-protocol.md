# The Golden Library addon protocol, version 1

This is the whole contract. Everything an addon may say, everything it may ask for, and everything
the engine does with the answer. If something is not here, do not rely on it — reading it out of
`packages/addons` is how you end up depending on an implementation detail that changes.

If you have written a Stremio addon, most of this will already be familiar: the shape is theirs,
translated to books. `stream` became `source`, and `movie`/`series` became `book`/`audiobook`.

Two things are worth knowing before you start.

**Your addon is not reviewed, listed or endorsed.** Golden Library ships no addons and publishes no
directory of them. A reader installs yours because they found it themselves and pasted its address.
The engine does not inspect what you return ([ADR-0009](adr/0009-blind-core-link-policy-scope.md)),
which means it also cannot vouch for it — every result you produce is rendered under your addon's
name, and that attribution is not removable.

**Choose your transport by whose machine should do the work.** An HTTP addon is easier to write and
easier to update, and its operator sees the reader's IP address and every query. A local addon runs
inside a sandbox on the reader's device, sees nothing about them, and can reach a server on their own
network — but the browser's CORS rules apply to everything it fetches, which rules out most public
APIs. The reader is told which kind yours is before they install it.

---

## 1. The manifest

Both transports publish the same manifest. An HTTP addon serves it at `/manifest.json`; a local addon
passes it to `registerAddon` (§4).

```json
{
  "id": "example-books",
  "version": "1.0.0",
  "name": "Example Books",
  "description": "One line about what this addon is for.",
  "apiVersion": 1,
  "resources": ["catalog", "meta", "source"],
  "types": ["book"],
  "catalogs": [{ "type": "book", "id": "all", "name": "All", "extra": [{ "name": "search" }] }],
  "idPrefixes": ["isbn"],
  "homepage": "https://addon.example",
  "permissions": { "hosts": ["api.example.org"] }
}
```

| Field           | Required | Meaning                                                                                                      |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `id`            | yes      | Lowercase slug, `[a-z0-9][a-z0-9._-]*`. Stable forever: it is the storage key and the reader's handle on you |
| `version`       | yes      | Free-form, ≤40 characters. Shown to the reader                                                               |
| `name`          | yes      | Shown above every result you produce                                                                         |
| `description`   | no       | ≤2000 characters                                                                                             |
| `apiVersion`    | yes      | Exactly `1`. Anything else is not installed                                                                  |
| `resources`     | yes      | Any of `catalog`, `meta`, `source`. You are only ever asked for what you list                                |
| `types`         | yes      | `book`, `audiobook`, or both                                                                                 |
| `catalogs`      | no       | Defaults to `[]` — fine for an addon that only answers `meta` and `source`                                   |
| `idPrefixes`    | no       | Which book ids you recognise. Omit to be asked about everything                                              |
| `logo`          | no       | `http(s)` URL                                                                                                |
| `homepage`      | no       | `http(s)` URL                                                                                                |
| `contactUrl`    | no       | `http(s)` URL                                                                                                |
| `permissions`   | no       | Local addons only, see §4.2                                                                                  |
| `behaviorHints` | no       | `configurable`, `configurationRequired`                                                                      |

A catalog's `extra` may contain `search`, `genre` and `skip`, each optionally `isRequired`, and
`genre` may carry `options`. There is deliberately nothing richer: a parameter the engine does not
understand is a parameter it cannot render a control for. Anything more belongs on your own
configuration page.

**`idPrefixes` describes book ids, not catalog ids.** A catalog is always asked for regardless.

---

## 2. The three resources

### `catalog` — lists of books

Everything the search page and any browse view is built on.

```
GET {base}/catalog/{type}/{catalogId}.json
GET {base}/catalog/{type}/{catalogId}/search=dune&skip=100.json
```

```json
{ "metas": [{ "id": "isbn:9780441013593", "type": "book", "name": "Dune" }] }
```

### `meta` — one book

```
GET {base}/meta/{type}/{id}.json
```

```json
{ "meta": { "id": "isbn:9780441013593", "type": "book", "name": "Dune", "pageCount": 412 } }
```

### `source` — how to get it

Stremio's `stream`, renamed because a book is not a stream.

```
GET {base}/source/{type}/{id}.json
```

```json
{
  "sources": [
    {
      "name": "Example",
      "title": "EPUB · 1.2 MB",
      "url": "https://addon.example/files/dune.epub",
      "format": "epub"
    }
  ]
}
```

### URL rules

- Every path ends in `.json`.
- `type` and `id` are percent-encoded. Encode them: Open Library ids contain slashes, and an
  unencoded one becomes extra path segments.
- Extras are **one** path segment, `key=value` joined by `&`, values percent-encoded, always in the
  order `search`, `genre`, `skip`. Fixed order so the same question always produces the same URL,
  which is what makes it cacheable.
- `{base}` is your manifest URL with `/manifest.json` removed. A path prefix is kept, so several
  addons can share a host.

---

## 3. What you may return

Unknown fields are dropped. Fields below are optional unless marked.

**`BookMetaPreview`** — `id`\*, `type`\*, `name`\*, `poster`, `posterShape`
(`poster`/`square`/`landscape`), `authors`, `releaseInfo`, `description`, `language`.

**`BookMeta`** — everything above plus `background`, `publisher`, `published`, `isbn`, `pageCount`,
`subjects`, `website`.

**`AddonSource`** — `name`\*, `url`\*, `title`, `format`, `fileSize` (bytes), `language`,
`description`, `behaviorHints.requiresAccount`, `behaviorHints.externalPage`.

### Two absences that are decisions, not oversights

**There is no `rightsStatus`, and there will not be one.** The instance's own links carry one because
it knows where they came from and is accountable for them. Yours are not its to describe. If you send
the field it is dropped rather than believed — a status this project would have to guess at, rendered
as metadata, reads to a reader as a fact.

**Every string is rendered as text.** No HTML, no Markdown.

### URLs must be `http` or `https`

Every URL you return — `url`, `poster`, `background`, `website` — is checked for its scheme and
nothing else. `javascript:`, `data:`, `blob:` and `file:` are refused because each one executes or
reads inside the reader's page. **The host is never checked**: `https://any-host-at-all` passes. This
is an injection defence, not a content rule.

### A malformed entry costs you that entry

Lists are validated per item. One unreadable book in a page of forty does not lose the other
thirty-nine; the count of what was dropped is shown to the reader next to your name. An envelope that
is not an object with the right key does fail whole — at that point you are not speaking this
protocol.

Limits: 1000 entries per catalog response, 500 sources, 4 MB per response, 10 s to answer.

---

## 4. Local addons

A local addon is a single JavaScript file. The reader gives Golden Library its URL and a SHA-256
hash; the file is fetched, hashed, and only then run — inside a `Worker`, inside a document with
`connect-src 'none'`, inside an `<iframe sandbox="allow-scripts">` on an opaque origin.

### 4.1 The shape of the file

```js
registerAddon({
  manifest: {
    id: 'local-example',
    version: '1.0.0',
    name: 'Local Example',
    apiVersion: 1,
    resources: ['catalog', 'source'],
    types: ['book'],
    catalogs: [{ type: 'book', id: 'all', name: 'All', extra: [{ name: 'search' }] }],
    permissions: { hosts: ['api.example.org'] },
  },

  async getCatalog(type, catalogId, extra) {
    const data = await golden.fetchJson(
      'https://api.example.org/search?q=' + encodeURIComponent(extra.search ?? ''),
    );
    return { metas: data.items.map((item) => ({ id: item.id, type: 'book', name: item.title })) };
  },

  async getSources(type, id) {
    return { sources: [{ name: 'Example', url: 'https://api.example.org/file/' + id }] };
  },
});
```

`registerAddon` is called once, at top level. Implement only the methods your `resources` declares.

### 4.2 What you can do inside the sandbox

There is no ambient `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `importScripts`,
`indexedDB`, `caches`, `document`, `window` or `parent`. They are removed before your first
statement, and blocked by CSP behind that. Everything you can do is on `golden`:

| Call                          | Does                                                      |
| ----------------------------- | --------------------------------------------------------- |
| `golden.fetchText(url, init)` | GET/POST to a **declared host**. Returns the body as text |
| `golden.fetchJson(url, init)` | The same, parsed                                          |
| `golden.parseXml(text)`       | XML → a plain object, so you need not ship a parser       |
| `golden.storage.get(key)`     | Your own key/value, namespaced to your addon              |
| `golden.storage.set(key, v)`  | Returns `false` if the browser refused to keep it         |
| `golden.log(message)`         | To your addon's own panel                                 |

`init` may set `method` (`GET` or `POST`), `headers` and `body`. `credentials` and `referrerPolicy`
are not yours to set — every request is sent without credentials and without a referrer, so the host
you contact learns nothing about the reader from us. `Cookie` and `Authorization` headers are
dropped; if your source needs authentication, ask the reader for it and put it where you control it.

**`permissions.hosts`** is an exact list of bare hostnames — no scheme, no path, no wildcard. A
request to a host you did not declare is refused before it is made, so nothing reaches that host at
all. Wildcards are refused because a permission the reader cannot evaluate is not consent. Any host
is allowed to be declared; the reader decides whether that list is acceptable, and they see it before
installing.

### 4.3 The integrity hash

```bash
openssl dgst -sha256 -binary addon.js | openssl base64 -A
```

Publish it as `sha256-<that>`. It is required, there is no opt-out, and a mismatch is a refusal to
run rather than a warning. The reason is not distrust of you — it is that a reader approves a
_version_, and code that can change afterwards was never really approved. Publish a new build under a
new hash and tell your readers.

---

## 5. Checking your work

```bash
pnpm addon:validate https://addon.example/manifest.json
```

Fetches your manifest, validates it against the same schema the engine uses, then exercises every
resource you declared and reports what came back — including entries that were dropped and why. It
makes real requests to your addon and to nothing else.

A runnable template is in [examples/addon-template](../examples/addon-template): a complete HTTP
addon in one dependency-free file. It is documentation, not a source — it serves two hard-coded
public-domain books and is there to be replaced, line by line, with whatever you are integrating.

---

## 6. Versioning

`apiVersion` is `1`. A version 2 would be a different number in that field and both would be served
in parallel for a period; an addon declaring anything but a version this engine knows is not
installed, rather than installed and half-working.

Fields may be **added** to any structure above without a version bump — unknown fields are dropped,
so an addon written today keeps working. Fields will not be removed or repurposed without one.
