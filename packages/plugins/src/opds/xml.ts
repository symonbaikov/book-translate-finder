import { XMLParser } from 'fast-xml-parser';
import { OpdsParseError } from './model.js';

/**
 * XML plumbing for the OPDS 1.2 parser, kept separate so `parse-atom.ts` reads as OPDS semantics
 * rather than as tree-walking.
 *
 * **Namespace prefixes are stripped** (`removeNSPrefix`). OPDS 1.2 documents mix Atom with Dublin
 * Core and the OPDS namespace, and real feeds disagree about the prefixes: the same publication
 * date arrives as `dcterms:issued` from Calibre-Web and `dc:issued` from older COPS builds.
 * Matching on the local name makes the parser agree with both instead of silently dropping fields
 * from whichever generator we did not think of.
 */

export type XmlNode = Record<string, unknown>;

const ARRAY_TAGS = new Set([
  'entry',
  'link',
  'author',
  'contributor',
  'category',
  'identifier',
  'indirectAcquisition',
]);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  // Keep every value a string: OPDS ids (`urn:uuid:…`), ISBNs with leading zeros and prices are
  // all corrupted by numeric coercion, and we parse the few genuinely numeric fields ourselves.
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  isArray: (tagName) => ARRAY_TAGS.has(tagName),
  // Entity expansion is bounded well below the library's defaults. An OPDS feed has no legitimate
  // use for large custom entities, and the reader's browser is the thing being protected here —
  // a hostile feed URL is a plausible attack on a client that fetches whatever it is pointed at.
  processEntities: {
    enabled: true,
    maxEntitySize: 1000,
    maxExpansionDepth: 5,
    maxTotalExpansions: 1000,
    maxExpandedLength: 100_000,
    maxEntityCount: 100,
  },
});

/**
 * Custom entity declarations are rejected outright rather than expanded within limits. OPDS never
 * needs them, and refusing the whole class is a smaller thing to reason about than an expansion
 * budget — this is the classic "billion laughs" vector, and the parser here runs inside the
 * reader's browser against a URL they may have pasted from anywhere.
 */
function assertNoCustomEntities(xml: string): void {
  if (/<!ENTITY\b/i.test(xml)) {
    throw new OpdsParseError('Feed declares XML entities, which this client refuses to expand');
  }
}

export function parseXml(xml: string): XmlNode {
  assertNoCustomEntities(xml);
  try {
    return parser.parse(xml) as XmlNode;
  } catch (error) {
    throw new OpdsParseError(
      `Could not parse the feed as XML: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function isNode(value: unknown): value is XmlNode {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Children of `node` under `name`, always as a list — absent becomes `[]`. */
export function children(node: XmlNode | undefined, name: string): XmlNode[] {
  const value = node?.[name];
  if (value === undefined || value === null) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.filter(isNode);
}

export function child(node: XmlNode | undefined, name: string): XmlNode | undefined {
  return children(node, name)[0];
}

/**
 * Text of an element. Atom elements carry a `type` attribute and may hold either a plain string
 * (parsed as a bare value) or a node with a `#text` member once attributes are present — both
 * shapes come out of the same tag depending on whether the feed bothered with `type="text"`.
 */
export function text(node: XmlNode | undefined, name: string): string | null {
  const value = node?.[name];
  return textOf(value);
}

export function textOf(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return textOf(value[0]);
  if (isNode(value)) {
    const inner = value['#text'];
    return inner === undefined ? null : textOf(inner);
  }
  return null;
}

export function attribute(node: XmlNode | undefined, name: string): string | null {
  const value = node?.[`@_${name}`];
  return typeof value === 'string' ? value.trim() || null : null;
}

/** Non-negative integer attribute (`length` on a link); `null` when absent or not a number. */
export function integerAttribute(node: XmlNode | undefined, name: string): number | null {
  const raw = attribute(node, name);
  if (raw === null) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
