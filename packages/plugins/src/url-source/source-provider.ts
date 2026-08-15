import type { Plugin, PluginManifest } from '../plugin.js';
import { assertHttpUrlTemplate, formatUrlTemplate, type UrlTemplateTokens } from './template.js';

/**
 * Custom external source providers (`accessMode: 'url-template'`, declared but never implemented
 * until now — see `PluginKind` in `plugin.ts`).
 *
 * **Why this is a registry of configuration and not a registry of code.** Every other plugin kind
 * in this package is a class written against an external API and shipped with the app. A reader
 * adding "search this shop I like" has no way to ship code, and does not need one: the entire
 * behaviour of a source provider is "take a book, produce a URL from a template" — data, not logic.
 * `createCustomSourceProvider` is the one place that data becomes a `SourceProvider`; nothing else
 * in the app needs to know it started life as a config object a reader typed into a form.
 *
 * **Why the contract does not depend on `packages/domain`'s `Bookstore`.** That type is for the
 * project's own vetted, ISBN-only catalog and is intentionally closed (see
 * `bookstore-catalog.ts`). `BookQueryMeta`/`SourceProvider` are declared here, in the dependency-free
 * leaf both `apps/web` and the server may import, so a reader-declared source can be resolved
 * entirely in the browser — the URL is built locally and never fetched, so there is nothing this
 * instance needs to see.
 */

/** The fields of one book a template's `{tokens}` may draw on. */
export interface BookQueryMeta {
  readonly isbn?: string | null;
  readonly title: string;
  readonly author?: string | null;
  readonly language?: string | null;
}

/**
 * The contract every source-provider plugin implements — built-in or reader-declared alike.
 * `resolveSearchUrl` returns `null` rather than a broken link when `bookMeta` lacks whatever the
 * template needed (see `formatUrlTemplate`), so a caller can simply skip a provider that answered
 * `null` instead of special-casing it.
 */
export interface SourceProvider {
  resolveSearchUrl(bookMeta: BookQueryMeta): string | null;
}

export interface SourceProviderPlugin extends Plugin, SourceProvider {
  readonly manifest: PluginManifest & { kind: 'url-source' };
}

/**
 * One source a reader configured: `{ name, urlTemplate, enabled }`, exactly what a settings form
 * collects, plus the bookkeeping every entry in a list needs. This is also the shape persisted to
 * storage — `apps/web/src/lib/custom-source-providers.ts` reads and writes it verbatim, the same way
 * `StoredAddon` doubles as both wire format and installed-addon record.
 */
export interface SourceProviderConfig {
  /** Stable slug, generated once from `name` at creation time. Becomes the link's `provider`. */
  readonly id: string;
  readonly name: string;
  /**
   * e.g. `https://{domain}/search?q={query}` or `https://{domain}/isbn/{isbn}`. `{domain}` (and any
   * other placeholder that is not one of `BookQueryMeta`'s fields or the derived `{query}`) is
   * filled from `params`, not from the book — the reader supplies both halves independently, so the
   * same template shape works for any shop without this package knowing what "domain" means.
   */
  readonly urlTemplate: string;
  /** Off keeps the entry and its settings while excluding it from every resolved list. */
  readonly enabled: boolean;
  readonly params?: Readonly<Record<string, string>>;
  readonly homepage?: string;
  readonly countries?: readonly string[];
}

/**
 * `{isbn}`, `{title}`, `{author}`, `{language}` come straight from `bookMeta`; `{query}` is the
 * same fallback `get-edition-links.use-case.ts` already uses for the shipped bookstore catalog — an
 * ISBN when there is one, otherwise "title author" — so a template author can pick whichever shape
 * their shop's search actually takes. `params` is layered underneath so a book-derived value always
 * wins if a reader accidentally reuses one of these names in their own config.
 */
function tokensFor(
  bookMeta: BookQueryMeta,
  params: Readonly<Record<string, string>> | undefined,
): UrlTemplateTokens {
  const isbn = bookMeta.isbn?.trim() || undefined;
  const query =
    isbn || [bookMeta.title, bookMeta.author].filter(Boolean).join(' ').trim() || undefined;
  return {
    ...params,
    isbn,
    title: bookMeta.title,
    author: bookMeta.author ?? undefined,
    language: bookMeta.language ?? undefined,
    query,
  };
}

/**
 * Turns one reader's config into a working plugin. `runtime: 'both'` because resolving a URL is
 * pure string substitution — no network call, no secret, nothing that has to happen on one side and
 * not the other (contrast `PluginAccessMode`'s `official-api`/`user-hosted` kinds, which do).
 *
 * Throws `InvalidUrlTemplateError` for a template that is not an absolute `http`/`https` URL once
 * its placeholders are filled — the same validation a settings form should run before persisting an
 * entry, done again here so nothing downstream has to trust that it already happened.
 */
export function createCustomSourceProvider(config: SourceProviderConfig): SourceProviderPlugin {
  assertHttpUrlTemplate(config.urlTemplate);
  return {
    manifest: {
      id: config.id,
      name: config.name,
      kind: 'url-source',
      accessMode: 'url-template',
      runtime: 'both',
      ...(config.homepage ? { homepage: config.homepage } : {}),
      ...(config.countries ? { countries: config.countries } : {}),
    },
    resolveSearchUrl(bookMeta) {
      return formatUrlTemplate(config.urlTemplate, tokensFor(bookMeta, config.params));
    },
  };
}

/**
 * The declarative resolver requirement in one call: every enabled config, turned into a plugin.
 * Disabled entries are dropped here rather than filtered by every caller — the one place "off"
 * means "not in the list" instead of a flag every consumer has to remember to check.
 */
export function activeSourceProviders(
  configs: readonly SourceProviderConfig[],
): SourceProviderPlugin[] {
  return configs.filter((config) => config.enabled).map(createCustomSourceProvider);
}
