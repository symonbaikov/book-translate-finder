<div align="center">

  <img src="docs/images/logo.svg" alt="Golden Library Logo" width="80" height="80">

# Golden Library

_Find your next magnum opus._

</div>

An open book translation aggregator. Enter a title and author — the service shows which languages
the book has been translated into, which editions exist, and where to get the text **legally**:
direct download for public domain works, a deep link to purchase, or library borrowing for books
under copyright.

The project is designed for self-hosting: deploy your own copy on your own server or home NAS.

https://github.com/user-attachments/assets/c40bea3a-45d8-4d47-a307-cf80b05f7d39

<img width="1920" height="948" alt="Screenshot_20260816_074838" src="https://github.com/user-attachments/assets/00c7330b-7419-4db0-99ee-f64f5b4c5911" />

> ⚠️ The demo video and screenshots are based on **v1** and will be updated soon.

<p align="center">
  <a href="https://bank.gov.ua/en/news/all/natsionalniy-bank-vidkriv-rahunok-dlya-gumanitarnoyi-dopomogi-ukrayintsyam-postrajdalim-vid-rosiyskoyi-agresiyi" target="_blank">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Ukraine.svg"
      alt="Ukraine Flag"
      width="520"
      height="120"
    /><br/>
    <strong>Humanitarian Aid for Ukraine</strong><br/>
    Support humanitarian relief via the official National Bank of Ukraine account.
  </a>
</p>

### 🌐 Access Any Digital Archive

Golden Library acts as an open, universal front-end for global digital archives, public domains, and community-curated book repositories.

- **No Paywalls or Walled Gardens:** Bring your own custom search templates or domain mirrors using simple URL placeholders ({title}, {isbn}) to query your preferred digital catalogs.
- **Uncensored Search Engine:** You control where the search queries go. Bypasses restricted regional catalog views by letting you use your preferred domain mirrors.
- **Community Presets Available:** Don't want to configure sources manually? Grab ready-to-use search templates directly from our [Telegram Channel](https://t.me/YOUR_CHANNEL). An instance links to a channel only if its operator sets `NEXT_PUBLIC_COMMUNITY_PRESETS_URL` (see [apps/web/.env.example](apps/web/.env.example)); with the variable unset, the custom sources page shows no such link and the first-run tour skips that step — this repository ships no catalogue of sources and links to none ([legal policy](docs/legal-policy.md) §I-3).

## Legal policy

This is not a footnote but an architectural invariant, enforced in the domain code and covered by
tests (details — [docs/legal-policy.md](docs/legal-policy.md)). It governs **what this instance
does** — what it fetches, stores and serves:

- **No scraping and no links to shadow libraries** (Library Genesis, Anna's
  Archive, Z-Library, and the like) — neither as a data source nor as a link source.
- A direct download link is allowed **only** for public domain / open-license works from the
  provider allowlist (Project Gutenberg, Internet Archive, Wikisource, LibriVox, Standard Ebooks,
  and a hand-curated list of books their rights holder publishes for free).
- The same rule applies to the project's own assets: the logo is original artwork, not a texture
  borrowed from somewhere ([docs/images/README.md](docs/images/README.md)).
- Every link in the API and UI carries an explicit rights status; the absence of a clear rights
  signal is treated as "under copyright", never as permission.
- Data is taken only from the sources' official APIs (Open Library, Google Books), respecting
  their rate limits and terms of use.

Purchase links point to bookstores' own ISBN lookups and carry **no affiliate tags**; if that
ever changes, I-5 requires disclosing it in the UI.

PRs violating this policy are closed without discussion — see [CONTRIBUTING.md](CONTRIBUTING.md).

### Addons

Golden Library also runs addons, which the rules above deliberately do not cover. An addon is
installed by pasting a URL you found yourself; it either runs inside a sandbox in your browser or is
an HTTP service your browser talks to directly. Either way its results never pass through the server
you are using, are never stored by it, and are never inspected by it — the same arrangement Stremio
and Tachiyomi use, and for the same reason.

What follows from that, stated plainly rather than in a settings screen nobody reads:

- **This project ships no addons and publishes no list of them.** There is no directory, no
  "recommended" set, and no search. What you install is your choice and your responsibility.
- **An addon's results are labelled with the addon that produced them.** The instance is not
  vouching for them; it does not know what they are.
- **An HTTP addon sees your IP address and your queries**, because your browser talks to it
  directly. A sandboxed local addon does not, but the browser's own CORS rules limit what it can
  read.
- **No part of this is a proxy.** There is no route that fetches a URL on your behalf.

The design, including why a token content filter over this path would have been worse than none, is
in [ADR-0009](docs/adr/0009-blind-core-link-policy-scope.md) and
[ADR-0010](docs/adr/0010-addon-engine.md).

## Self-hosting

You need Docker and Docker Compose. Three commands:

```bash
git clone https://github.com/symonbaikov/book-translate-finder.git
cd book-translate-finder
cp .env.example .env
```

Open `.env` and set at least `POSTGRES_PASSWORD`, `ADMIN_TOKEN`, and `NEXT_PUBLIC_API_URL`
(the remaining variables and their purpose are described right in the file).

```bash
docker compose up -d
```

After a minute or two (the first build of `web` from source — the only image this command builds
itself, the rest are pulled prebuilt), open this machine's address on port 3000 in a browser
(by default [http://localhost:3000](http://localhost:3000)).

The first search against a fresh database will return "searching the sources…" — this is
expected: an installation starts with an empty DB and fills lazily on demand (see
[ADR-0003](docs/adr/0003-lazy-backfill.md)). Repeating the query a few seconds later will
already return results.

To check that everything is up:

```bash
docker compose logs -f api
```

### TLS and your own domain

Optional profile with Caddy and automatic Let's Encrypt:

```bash
docker compose --profile tls up -d
```

Requires `DOMAIN` in `.env` (a real domain pointing at this machine) — see
[docker/Caddyfile](docker/Caddyfile).

### Updating and backup

```bash
docker compose pull && docker compose up -d
```

```bash
docker compose exec -T postgres pg_dump -U btf btf | gzip > backup-$(date +%F).sql.gz
```

Redis is not backed up — it is cache and queues, losing it is non-critical.

## API

The instance has a public REST API (search, book card, editions, links) —
see [docs/api.md](docs/api.md) with request examples.

## Development

See [CLAUDE.md](CLAUDE.md) — stack, commands, repository structure, code workflow rules.
Architecture and legal policy documentation is in [docs/](docs/). How to contribute —
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE). All production dependencies are under permissive licenses
(MIT/Apache-2.0/BSD/ISC, verified with `pnpm licenses`).
