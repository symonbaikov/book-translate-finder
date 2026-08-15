#!/usr/bin/env node
/**
 * A worked example of a Custom External Source Provider — the plugin-template contract from
 * docs/adr/0012-custom-source-providers.md, run end to end with no server involved.
 *
 * Unlike `examples/addon-template`, there is nothing to serve: a source provider never fetches
 * anything, so this file just builds URLs and prints them. Replace `MY_SOURCES` with your own shop
 * or catalog, then either run this script to see what it resolves to, or paste the same `name` and
 * `urlTemplate` straight into the app's "Custom sources" page (`/custom-sources`) — the form there
 * accepts exactly this shape.
 *
 *   pnpm --filter @golden/plugins run build
 *   node examples/custom-source-template/custom-source.template.mjs
 */

// `examples/` is not a workspace package (same as `examples/addon-template`), so this imports the
// built package directly by path rather than by name. Run `pnpm --filter @golden/plugins run build`
// first — see the README.
import { activeSourceProviders } from '../../packages/plugins/dist/index.js';

/**
 * This is exactly what `/custom-sources` collects from a reader's form, and exactly what
 * `apps/web/src/lib/custom-source-providers.ts` writes to `localStorage`:
 * `{ name, urlTemplate, enabled }`, plus a stable `id` and, optionally, `params` for placeholders
 * that are not one of the book's own fields — `{domain}` here.
 *
 * `{isbn}`, `{title}`, `{author}`, `{language}` are filled from the book being looked up; `{query}`
 * is the same ISBN-or-"title author" fallback the shipped bookstore catalog already uses. Any other
 * `{token}` — `{domain}` in both examples below — comes from `params`, so the same template shape
 * works for any shop without the plugin contract needing to know what "domain" means.
 */
const MY_SOURCES = [
  {
    id: 'my-shop',
    name: 'My Shop',
    urlTemplate: 'https://{domain}/isbn/{isbn}',
    enabled: true,
    params: { domain: 'my-shop.example' },
  },
  {
    id: 'my-catalog',
    name: 'My Catalog (searches by title when there is no ISBN)',
    urlTemplate: 'https://{domain}/search?q={query}&lang={language}',
    enabled: true,
    params: { domain: 'catalog.example' },
  },
];

/** Stand-ins for what `EditionLinks` passes as `bookMeta` — one with an ISBN, one without. */
const BOOKS = [
  { isbn: '9780140447934', title: 'The Republic', author: 'Plato', language: 'en' },
  { isbn: null, title: 'Le Petit Prince', author: 'Antoine de Saint-Exupéry', language: 'fr' },
];

for (const provider of activeSourceProviders(MY_SOURCES)) {
  console.log(`\n${provider.manifest.name} (${provider.manifest.id}):`);
  for (const book of BOOKS) {
    // This is the whole `SourceProvider` interface: one method, `string | null`. `null` means the
    // template needed a field this edition does not have — the caller simply skips the row.
    const url = provider.resolveSearchUrl(book);
    console.log(
      `  ${book.title} -> ${url ?? '(skipped: the template needs a field this edition lacks)'}`,
    );
  }
}
