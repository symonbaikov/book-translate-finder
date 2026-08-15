'use client';

import type {
  AddonContentType,
  AddonExtra,
  AddonManifest,
  AddonSource,
  AddonTransport,
  BookMetaPreview,
  CatalogResponse,
  MetaResponse,
  SourcesResponse,
} from '@golden/addons';
import {
  OpdsClient,
  applySearchTemplate,
  parseOpenSearchTemplate,
  type OpdsAcquisition,
  type OpdsEntry,
  type OpdsFeed,
} from '@golden/plugins';

/**
 * A reader's own OPDS catalog, wearing the addon contract.
 *
 * **Why this lives in `apps/web` and not in `packages/addons`.** The OPDS parsers are in
 * `@golden/plugins`, and both packages are leaves that may import no other workspace package — so
 * neither can import the other. `apps/web` is allowed to import both, and is the one place where
 * they can meet. Duplicating 85 tests' worth of parser into `addons` to avoid one file in the app
 * would have been the worse trade.
 *
 * **What this deliberately does not do: navigation.** An OPDS catalog is a tree — Project
 * Gutenberg's root is nothing but links to other feeds, and reaching a book means walking down it
 * (docs/plan.md, Phase 5). The addon protocol has no notion of that: a `catalog` is a flat list with
 * an offset. So browsing stays in `OpdsShelf`, which is built for a tree, and this transport answers
 * the two questions the protocol *can* ask — "what is in this feed" and "do you have this ISBN".
 * Bending one shape into the other would have cost the reader their Gutenberg shelf.
 */

/** OPDS ids are opaque; a book we could not identify by ISBN is addressed by the feed's own id. */
const ISBN_PREFIX = 'isbn:';
const OPDS_PREFIX = 'opds:';

export interface OpdsAddonConfig {
  /** The stable id of the stored addon, used to derive the manifest id. */
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly username?: string;
  readonly password?: string;
}

export class OpdsAddonTransport implements AddonTransport {
  readonly manifest: AddonManifest;
  private readonly client: OpdsClient;
  /** The feed as last fetched, so a catalog view and a source lookup share one request. */
  private root: OpdsFeed | null = null;
  private searchTemplate: string | null | undefined;

  constructor(
    private readonly config: OpdsAddonConfig,
    client: OpdsClient = new OpdsClient(),
    /**
     * Used for the OpenSearch *description* document only, which is XML but not a feed —
     * `OpdsClient` would try to parse it as a catalog and fail. Injectable for the same reason the
     * client is: a transport whose second request reaches straight for the ambient `fetch` cannot
     * be tested, and the bug that hides there is the search path silently falling back to the root
     * feed while the tests all pass.
     */
    private readonly fetchImpl: typeof fetch = (input, init) => fetch(input, init),
  ) {
    this.client = client;
    this.manifest = {
      id: `opds.${config.id}`,
      version: '1',
      name: config.name,
      apiVersion: 1,
      // No `meta`: an OPDS entry carries everything this transport knows, and it is already in the
      // catalog row. A `meta` that repeated it would be a second request for nothing.
      resources: ['catalog', 'source'],
      types: ['book'],
      catalogs: [{ type: 'book', id: 'feed', name: config.name, extra: [{ name: 'search' }] }],
      idPrefixes: [ISBN_PREFIX, OPDS_PREFIX],
      permissions: { hosts: [hostOf(config.url)] },
    };
  }

  async getCatalog(
    _type: AddonContentType,
    _catalogId: string,
    extra?: AddonExtra,
  ): Promise<CatalogResponse> {
    const feed = await this.load(extra?.search);
    const metas = feed.entries.filter(isPublication).map(toPreview);
    const skip = extra?.skip ?? 0;
    return { metas: skip > 0 ? metas.slice(skip) : metas, dropped: 0 };
  }

  /** Not offered; `resources` says so, and the engine never asks. Present to satisfy the contract. */
  async getMeta(): Promise<MetaResponse> {
    throw new Error(`${this.config.name} does not answer meta requests.`);
  }

  /**
   * "Is this book on my own server, and how do I get it from there?"
   *
   * Searched by ISBN where the feed offers search, because that is the only identifier the two
   * sides reliably share. Where it does not, the root feed is scanned instead — honest for a
   * personal library of a few hundred books, useless for a large public catalog, and the difference
   * shows up as an empty answer rather than a wrong one.
   */
  async getSources(_type: AddonContentType, id: string): Promise<SourcesResponse> {
    const isbn = id.startsWith(ISBN_PREFIX) ? id.slice(ISBN_PREFIX.length) : null;
    const opdsId = id.startsWith(OPDS_PREFIX) ? id.slice(OPDS_PREFIX.length) : null;

    const feed = await this.load(isbn ?? undefined);
    const matched = feed.entries.filter((entry) => {
      if (opdsId) return entry.id === opdsId;
      if (isbn) return entry.isbn13 === isbn;
      return false;
    });

    const sources = matched.flatMap((entry) =>
      entry.acquisitions.filter(isOffered).map((acquisition) => this.toSource(entry, acquisition)),
    );
    return { sources, dropped: 0 };
  }

  private toSource(entry: OpdsEntry, acquisition: OpdsAcquisition): AddonSource {
    return {
      name: this.config.name,
      title: [entry.title, acquisition.title ?? acquisition.formatLabel]
        .filter(Boolean)
        .join(' · '),
      url: acquisition.href,
      format: acquisition.formatLabel,
      ...(acquisition.sizeBytes !== null ? { fileSize: acquisition.sizeBytes } : {}),
      ...(entry.language ? { language: entry.language } : {}),
      behaviorHints: {
        // `buy`, `borrow` and `subscribe` are pages to visit rather than files to fetch; the rest
        // hand over the book itself. `unspecified` is treated as a file because that is what a
        // personal library server means by a bare acquisition link.
        externalPage:
          acquisition.kind === 'buy' ||
          acquisition.kind === 'borrow' ||
          acquisition.kind === 'subscribe',
        // A password-protected server will want those credentials again in the browser that opens
        // the link, and this app cannot supply them there.
        requiresAccount: Boolean(this.config.username),
      },
    };
  }

  /** Fetches the feed, using the catalog's own search when it offers one and a term is given. */
  private async load(search?: string): Promise<OpdsFeed> {
    if (!search) {
      this.root ??= await this.fetch(this.config.url);
      return this.root;
    }
    const template = await this.template();
    if (!template) {
      // No search endpoint: answer from the root rather than pretending the term was applied.
      this.root ??= await this.fetch(this.config.url);
      return this.root;
    }
    return this.fetch(applySearchTemplate(template, search));
  }

  private async template(): Promise<string | null> {
    if (this.searchTemplate !== undefined) return this.searchTemplate;
    this.root ??= await this.fetch(this.config.url);
    const descriptionUrl = this.root.searchDescriptionUrl;
    if (!descriptionUrl) {
      this.searchTemplate = null;
      return null;
    }
    try {
      const response = await this.fetchImpl(descriptionUrl, {
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        ...(this.config.username
          ? { headers: { Authorization: basic(this.config.username, this.config.password ?? '') } }
          : {}),
      });
      this.searchTemplate = response.ok ? parseOpenSearchTemplate(await response.text()) : null;
    } catch {
      this.searchTemplate = null;
    }
    return this.searchTemplate;
  }

  private fetch(url: string): Promise<OpdsFeed> {
    return this.client.fetchFeed({
      url,
      ...(this.config.username
        ? { credentials: { username: this.config.username, password: this.config.password ?? '' } }
        : {}),
    });
  }
}

/** Navigation entries are sub-catalogs, not books; a shelf browses them, a catalog list cannot. */
function isPublication(entry: OpdsEntry): boolean {
  return entry.navigationHref === null;
}

/** A licence file is not the book, and offering it as one is the promise this app must not make. */
function isOffered(acquisition: OpdsAcquisition): boolean {
  return !acquisition.requiresDrmApp;
}

function toPreview(entry: OpdsEntry): BookMetaPreview {
  const poster = entry.thumbnailUrl ?? entry.coverUrl;
  return {
    id: entry.isbn13 ? `${ISBN_PREFIX}${entry.isbn13}` : `${OPDS_PREFIX}${entry.id}`,
    type: 'book',
    name: entry.title,
    ...(entry.authors.length > 0 ? { authors: [...entry.authors] } : {}),
    ...(entry.summary ? { description: entry.summary } : {}),
    ...(entry.published ? { releaseInfo: entry.published } : {}),
    ...(entry.language ? { language: entry.language } : {}),
    ...(poster ? { poster } : {}),
  };
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/** UTF-8 safe HTTP Basic; `btoa` alone mangles any non-ASCII character in a password. */
function basic(username: string, password: string): string {
  const raw = `${username}:${password}`;
  const utf8 = encodeURIComponent(raw).replace(/%([0-9A-F]{2})/g, (_match, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  );
  return `Basic ${btoa(utf8)}`;
}
