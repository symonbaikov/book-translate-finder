# Custom source template

A worked example of a Custom External Source Provider — the plugin-template contract from
[docs/adr/0012-custom-source-providers.md](../../docs/adr/0012-custom-source-providers.md).

```bash
pnpm --filter @golden/plugins run build
node examples/custom-source-template/custom-source.template.mjs
```

## What this is not

There is no server here, on purpose. Unlike an addon (`examples/addon-template`), a custom source
never fetches anything — its entire job is building a URL from a template, which this instance
never visits on the reader's behalf. `custom-source.template.mjs` just prints what a config resolves
to, so you can check a template before using it.

## Using this for real

You do not need this file at all to add a source to a running instance — open **Custom sources**
(`/custom-sources`) and fill in a name and a URL template directly; the form is the whole feature.
This example exists for two things the form does not show:

1. What the config the form writes actually looks like — `{ id, name, urlTemplate, enabled, params?
   }`, defined as `SourceProviderConfig` in `packages/plugins/src/url-source/source-provider.ts`.
2. The contract every source provider — built-in or your own — implements:
   `resolveSearchUrl(bookMeta): string | null`. `null` means the template needed a field (usually
   `{isbn}`) this particular edition does not have, and the caller skips that row rather than
   showing a broken link.

## Template placeholders

| Placeholder    | Filled from                                                          |
| -------------- | --------------------------------------------------------------------- |
| `{isbn}`       | the edition's ISBN, if it has one                                     |
| `{title}`      | the edition's title                                                   |
| `{author}`     | the work's author                                                     |
| `{language}`   | the edition's language code                                           |
| `{query}`      | the ISBN, or `"title author"` when there is none — the same fallback `bookstore-catalog.ts` uses |
| anything else  | your own `params`, e.g. `{domain}` — the reader supplies both halves of the template independently |

Every substituted value is percent-encoded. If the template references a placeholder that has no
value for a given book, `resolveSearchUrl` returns `null` instead of a URL with a literal `{isbn}`
still in it — a link to a broken search is worse than no link at all.
