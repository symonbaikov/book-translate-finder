<img src="docs/images/logo.svg" alt="" width="72" height="72" align="left" style="image-rendering: pixelated; margin-right: 16px">

# BookTranslate Finder

_Find your next magnum opus._

An open book translation aggregator. Enter a title and author — the service shows which languages
the book has been translated into, which editions exist, and where to get the text **legally**:
direct download for public domain works, a deep link to purchase, or library borrowing for books
under copyright.

The project is designed for self-hosting: deploy your own copy on your own server or home NAS.

![Book card: cover, description, translation languages, editions, legal links](docs/images/work-card.png)

## Legal policy

This is not a footnote but an architectural invariant, enforced in the domain code and covered by
tests (details — [docs/legal-policy.md](docs/legal-policy.md)):

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
