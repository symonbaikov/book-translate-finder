import { IMAGE_RELS, THUMBNAIL_RELS, splitRel, toAcquisition } from './acquisition.js';
import { isCatalogMediaType } from './media-types.js';
import {
  OpdsParseError,
  extractIsbn13,
  resolveHref,
  type OpdsAcquisition,
  type OpdsEntry,
  type OpdsFeed,
  type OpdsNavigationLink,
  type OpdsPrice,
} from './model.js';
import {
  attribute,
  child,
  children,
  integerAttribute,
  parseXml,
  text,
  textOf,
  type XmlNode,
} from './xml.js';

/**
 * OPDS 1.2 — an Atom feed with the OPDS and Dublin Core extensions
 * (https://specs.opds.io/opds-1.2). This is still the version almost every real server speaks:
 * Project Gutenberg, Calibre-Web, COPS, Kavita and Audiobookshelf all serve 1.x.
 */

interface AtomLink {
  readonly rels: string[];
  readonly href: string;
  readonly mediaType: string | null;
  readonly title: string | null;
  readonly price: OpdsPrice | null;
  readonly sizeBytes: number | null;
  readonly indirectMediaTypes: string[];
}

/**
 * `<opds:price currencycode="USD">3.99</opds:price>`. The currency attribute is required by the
 * spec, but a feed that omits it still states an amount — we drop the price rather than guess a
 * currency, because a bare "3.99" next to a book is worse than no number at all.
 */
function readPrice(link: XmlNode): OpdsPrice | null {
  const priceNode = child(link, 'price');
  if (!priceNode) return null;
  const amount = Number.parseFloat(textOf(priceNode) ?? '');
  const currency = attribute(priceNode, 'currencycode');
  if (!Number.isFinite(amount) || !currency) return null;
  return { amount, currency: currency.toUpperCase() };
}

/** `opds:indirectAcquisition` nests, so the whole chain is flattened in document order. */
function readIndirectMediaTypes(node: XmlNode): string[] {
  return children(node, 'indirectAcquisition').flatMap((indirect) => {
    const mediaType = attribute(indirect, 'type');
    return [...(mediaType ? [mediaType] : []), ...readIndirectMediaTypes(indirect)];
  });
}

function readLink(node: XmlNode): AtomLink | null {
  const href = attribute(node, 'href');
  if (!href) return null;
  return {
    rels: splitRel(attribute(node, 'rel')),
    href,
    mediaType: attribute(node, 'type'),
    title: attribute(node, 'title'),
    price: readPrice(node),
    sizeBytes: integerAttribute(node, 'length'),
    indirectMediaTypes: readIndirectMediaTypes(node),
  };
}

function readLinks(node: XmlNode | undefined): AtomLink[] {
  return children(node, 'link')
    .map(readLink)
    .filter((link): link is AtomLink => link !== null);
}

function findByRel(links: readonly AtomLink[], rels: readonly string[]): AtomLink | null {
  for (const rel of rels) {
    const match = links.find((link) => link.rels.some((r) => r.toLowerCase() === rel));
    if (match) return match;
  }
  return null;
}

function readEntry(node: XmlNode, feedUrl: string): OpdsEntry {
  const links = readLinks(node);
  const acquisitions = links
    .map((link) => toAcquisition(link, feedUrl))
    .filter((acquisition): acquisition is OpdsAcquisition => acquisition !== null);

  const identifiers = [
    ...children(node, 'identifier').map((identifier) => textOf(identifier)),
    text(node, 'identifier'),
  ].filter((value): value is string => Boolean(value));

  const image = findByRel(links, IMAGE_RELS);
  const thumbnail = findByRel(links, THUMBNAIL_RELS);

  // A navigation entry points at another catalog rather than at a file — that is what makes a
  // Gutenberg "Browse by author" row a folder and not a book. Detected by media type, since the
  // rel is often just `subsection` or nothing at all.
  const navigation =
    acquisitions.length === 0
      ? (links.find((link) => isCatalogMediaType(link.mediaType)) ?? null)
      : null;

  return {
    id: text(node, 'id') ?? '',
    title: text(node, 'title') ?? '(untitled)',
    authors: children(node, 'author')
      .map((author) => text(author, 'name'))
      .filter((name): name is string => Boolean(name)),
    // `content` is the richer field when both are present; `summary` is the Atom fallback.
    summary: text(node, 'content') ?? text(node, 'summary'),
    language: text(node, 'language'),
    publisher: text(node, 'publisher'),
    published: text(node, 'issued') ?? text(node, 'published'),
    updated: text(node, 'updated'),
    identifiers,
    isbn13: extractIsbn13(identifiers),
    categories: children(node, 'category')
      .map((category) => attribute(category, 'label') ?? attribute(category, 'term'))
      .filter((label): label is string => Boolean(label)),
    coverUrl: image ? resolveHref(image.href, feedUrl) : null,
    thumbnailUrl: thumbnail ? resolveHref(thumbnail.href, feedUrl) : null,
    acquisitions,
    navigationHref: navigation ? resolveHref(navigation.href, feedUrl) : null,
  };
}

const PAGINATION_RELS = ['next', 'previous', 'prev', 'first', 'last'] as const;

function toNavigationLink(link: AtomLink, feedUrl: string): OpdsNavigationLink {
  return {
    rel: link.rels[0] ?? '',
    href: resolveHref(link.href, feedUrl),
    title: link.title,
    mediaType: link.mediaType,
  };
}

/**
 * A "complete entry" document — a bare `<entry>` root describing one publication (OPDS 1.2 §2.3).
 *
 * Handling this is not an edge case: it is how Project Gutenberg's catalog is actually shaped.
 * Its search and browse pages list each book as a *navigation* entry pointing at that book's own
 * entry document, and the acquisition links live only there. Found by walking the real catalog —
 * before this, following any Gutenberg result threw "not a feed" and the shelf could reach no
 * downloads at all.
 *
 * It is presented as a one-entry feed so callers navigate uniformly and do not need a second
 * code path for the last hop.
 */
function singleEntryFeed(entry: XmlNode, feedUrl: string): OpdsFeed {
  const parsed = readEntry(entry, feedUrl);
  return {
    version: '1.2',
    id: parsed.id || null,
    title: parsed.title,
    updated: parsed.updated,
    feedUrl,
    entries: [parsed],
    navigation: [],
    pagination: { next: null, previous: null, first: null, last: null },
    searchDescriptionUrl: null,
  };
}

export function parseOpds1(xml: string, feedUrl: string): OpdsFeed {
  const document = parseXml(xml);
  const feed = child(document, 'feed');
  if (!feed) {
    const entry = child(document, 'entry');
    if (entry) return singleEntryFeed(entry, feedUrl);
    throw new OpdsParseError('Document has no <feed> root — not an OPDS 1.x catalog');
  }

  const links = readLinks(feed);
  const paginationHref = (rel: string): string | null => {
    const link = findByRel(links, [rel]);
    return link ? resolveHref(link.href, feedUrl) : null;
  };
  const search = findByRel(links, ['search']);

  return {
    version: '1.2',
    id: text(feed, 'id'),
    title: text(feed, 'title') ?? '(untitled catalog)',
    updated: text(feed, 'updated'),
    feedUrl,
    entries: children(feed, 'entry').map((entry) => readEntry(entry, feedUrl)),
    navigation: links
      .filter(
        (link) => !link.rels.some((rel) => (PAGINATION_RELS as readonly string[]).includes(rel)),
      )
      .map((link) => toNavigationLink(link, feedUrl)),
    pagination: {
      next: paginationHref('next'),
      // Atom registers `previous`; a good share of feeds send the older `prev`.
      previous: paginationHref('previous') ?? paginationHref('prev'),
      first: paginationHref('first'),
      last: paginationHref('last'),
    },
    searchDescriptionUrl: search ? resolveHref(search.href, feedUrl) : null,
  };
}
