# Vendored typefaces

Two variable fonts live here as files rather than as a dependency or a CDN link. Both reasons are
the project's, not a preference:

- **A self-hosted instance must render with no third-party requests.** A `fonts.googleapis.com`
  link would make every reader of every private instance visible to Google, and would break
  entirely on an air-gapped deployment.
- **A font package in `node_modules` would not survive `docker compose up` on a prebuilt image**
  without being copied into the build anyway. Copying it once, here, is the same bytes with none
  of the indirection.

| File               | Family                      | Subset    | Source                                      |
| ------------------ | --------------------------- | --------- | ------------------------------------------- |
| `inter-*.woff2`    | Inter Variable (100–900)    | see below | `fonts.gstatic.com/s/inter/v20`, OFL 1.1    |
| `literata-*.woff2` | Literata Variable (400–700) | see below | `fonts.gstatic.com/s/literata/v40`, OFL 1.1 |

Subsets kept: `latin`, `latin-ext`, `cyrillic`, `cyrillic-ext`. That covers 11 of the 15 interface
locales. `greek` and `vietnamese` were dropped — no locale needs them — and `ar`, `ja`, `ko`, `zh`
fall through to the reader's system fonts, because vendoring CJK would add tens of megabytes to a
repository for four locales whose systems already ship a good face.

The `unicode-range` split is what makes this cheap: a Russian reader downloads the Cyrillic files
and the Latin ones (the interface still contains Latin book titles), never the rest.

Licences: [INTER-LICENSE.txt](INTER-LICENSE.txt), [LITERATA-LICENSE.txt](LITERATA-LICENSE.txt).
The SIL Open Font License permits redistribution as long as these travel with the files — do not
delete them, and do not rename the font files in a way that separates them from their licence.

## Updating

Fetch the CSS Google serves for a modern browser, take the `latin`/`latin-ext`/`cyrillic`/
`cyrillic-ext` URLs from it, download them under the names above, and copy the `unicode-range`
lines into [`fonts.css`](../../src/styles/fonts.css) unchanged — they are the contract between the
file and the glyphs it is allowed to answer for.

```bash
curl -H 'User-Agent: Mozilla/5.0 Chrome/126' 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900'
```

If you change the typeface itself, the fallback metrics in `fonts.css` (`size-adjust`,
`ascent-override`, `descent-override`) must be recomputed — they are derived from that specific
family's `xWidthAvg`, `ascent` and `descent`, and stale numbers reintroduce exactly the layout
shift they exist to remove.
