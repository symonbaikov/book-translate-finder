import { splitRel, toAcquisition } from './acquisition.js';
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

/**
 * OPDS 2.0 — a Readium Web Publication Manifest profile in JSON (https://drafts.opds.io/opds-2.0).
 *
 * The document layout has nothing in common with 1.2: publications live in `publications[]`, their
 * descriptive fields in a `metadata` object borrowed from schema.org, and the price moves from an
 * element to `links[].properties.price`. Only the link relations are shared, which is why
 * `acquisition.ts` is version-agnostic and this file is not.
 */

type JsonValue = unknown;

function asRecord(value: JsonValue): Record<string, JsonValue> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, JsonValue>)
    : null;
}

function asArray(value: JsonValue): JsonValue[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function asString(value: JsonValue): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'number') return String(value);
  return null;
}

/**
 * Contributor fields accept a bare string, a `{ name }` object, or a list of either — all three
 * appear in the spec's own examples, so all three are read rather than the one we would prefer.
 */
function readNames(value: JsonValue): string[] {
  return asArray(value)
    .map((item) => asString(item) ?? asString(asRecord(item)?.['name']))
    .filter((name): name is string => Boolean(name));
}

function readPrice(properties: Record<string, JsonValue> | null): OpdsPrice | null {
  const price = asRecord(properties?.['price']);
  if (!price) return null;
  const amount = Number(price['value']);
  const currency = asString(price['currency']);
  if (!Number.isFinite(amount) || !currency) return null;
  return { amount, currency: currency.toUpperCase() };
}

function readIndirectMediaTypes(properties: Record<string, JsonValue> | null): string[] {
  const walk = (value: JsonValue): string[] =>
    asArray(value).flatMap((item) => {
      const record = asRecord(item);
      const mediaType = asString(record?.['type']);
      return [...(mediaType ? [mediaType] : []), ...walk(record?.['child'])];
    });
  return walk(properties?.['indirectAcquisition']);
}

interface JsonLink {
  readonly rels: string[];
  readonly href: string;
  readonly mediaType: string | null;
  readonly title: string | null;
  readonly price: OpdsPrice | null;
  readonly sizeBytes: number | null;
  readonly indirectMediaTypes: string[];
}

function readLink(value: JsonValue): JsonLink | null {
  const record = asRecord(value);
  const href = asString(record?.['href']);
  if (!record || !href) return null;
  const properties = asRecord(record['properties']);
  const size = Number(record['length']);
  return {
    // `rel` is a string or a list of strings in OPDS 2.0; `splitRel` also covers the
    // space-separated spelling a 1.x-shaped generator might carry over.
    rels: asArray(record['rel']).flatMap((rel) => splitRel(asString(rel))),
    href,
    mediaType: asString(record['type']),
    title: asString(record['title']),
    price: readPrice(properties),
    sizeBytes: Number.isFinite(size) && size >= 0 ? size : null,
    indirectMediaTypes: readIndirectMediaTypes(properties),
  };
}

function readLinks(value: JsonValue): JsonLink[] {
  return asArray(value)
    .map(readLink)
    .filter((link): link is JsonLink => link !== null);
}

function findByRel(links: readonly JsonLink[], rel: string): JsonLink | null {
  return links.find((link) => link.rels.some((r) => r.toLowerCase() === rel)) ?? null;
}

/** Widest image first — `images[]` is ordered by preference, but only by convention. */
function pickImage(images: readonly JsonLink[], wantThumbnail: boolean): JsonLink | null {
  if (images.length === 0) return null;
  return wantThumbnail ? (images[images.length - 1] ?? null) : (images[0] ?? null);
}

function readPublication(value: JsonValue, feedUrl: string): OpdsEntry | null {
  const publication = asRecord(value);
  if (!publication) return null;
  const metadata = asRecord(publication['metadata']) ?? {};
  const links = readLinks(publication['links']);
  const images = readLinks(publication['images']);

  const acquisitions = links
    .map((link) => toAcquisition(link, feedUrl))
    .filter((acquisition): acquisition is OpdsAcquisition => acquisition !== null);

  const identifiers = [...asArray(metadata['identifier']), ...asArray(metadata['isbn'])]
    .map(asString)
    .filter((identifier): identifier is string => Boolean(identifier));

  const cover = pickImage(images, false);
  const thumbnail = pickImage(images, true);

  return {
    id: asString(metadata['identifier']) ?? findByRel(links, 'self')?.href ?? '',
    title: asString(metadata['title']) ?? '(untitled)',
    authors: readNames(metadata['author']),
    summary: asString(metadata['description']),
    language: readNames(metadata['language'])[0] ?? asString(metadata['language']),
    publisher: readNames(metadata['publisher'])[0] ?? null,
    published: asString(metadata['published']),
    updated: asString(metadata['modified']),
    identifiers,
    isbn13: extractIsbn13(identifiers),
    categories: readNames(metadata['subject']),
    coverUrl: cover ? resolveHref(cover.href, feedUrl) : null,
    thumbnailUrl: thumbnail ? resolveHref(thumbnail.href, feedUrl) : null,
    acquisitions,
    navigationHref: null,
  };
}

function readNavigation(value: JsonValue, feedUrl: string): OpdsNavigationLink[] {
  return readLinks(value).map((link) => ({
    rel: link.rels[0] ?? 'subsection',
    href: resolveHref(link.href, feedUrl),
    title: link.title,
    mediaType: link.mediaType,
  }));
}

export function parseOpds2(json: unknown, feedUrl: string): OpdsFeed {
  const document = asRecord(json);
  if (!document) throw new OpdsParseError('OPDS 2.0 document is not a JSON object');
  if (!document['metadata'] && !document['publications'] && !document['navigation']) {
    throw new OpdsParseError('JSON document has none of metadata/publications/navigation');
  }

  const metadata = asRecord(document['metadata']) ?? {};
  const links = readLinks(document['links']);

  // `groups` is how OPDS 2.0 expresses "New releases / Staff picks / …" on one page. Their
  // contents are real publications and real navigation, so they are folded into the flat lists
  // rather than dropped — a reader browsing a Kavita home feed would otherwise see nothing at all.
  const groups = asArray(document['groups']).map(asRecord);

  const publications = [
    ...asArray(document['publications']),
    ...groups.flatMap((group) => asArray(group?.['publications'])),
  ];
  const navigation = [
    ...readNavigation(document['navigation'], feedUrl),
    ...groups.flatMap((group) => readNavigation(group?.['navigation'], feedUrl)),
  ];

  const paginationHref = (rel: string): string | null => {
    const link = findByRel(links, rel);
    return link ? resolveHref(link.href, feedUrl) : null;
  };
  const search = findByRel(links, 'search');

  return {
    version: '2.0',
    id: asString(metadata['identifier']),
    title: asString(metadata['title']) ?? '(untitled catalog)',
    updated: asString(metadata['modified']),
    feedUrl,
    entries: publications
      .map((publication) => readPublication(publication, feedUrl))
      .filter((entry): entry is OpdsEntry => entry !== null),
    navigation,
    pagination: {
      next: paginationHref('next'),
      previous: paginationHref('previous') ?? paginationHref('prev'),
      first: paginationHref('first'),
      last: paginationHref('last'),
    },
    searchDescriptionUrl: search ? resolveHref(search.href, feedUrl) : null,
  };
}
