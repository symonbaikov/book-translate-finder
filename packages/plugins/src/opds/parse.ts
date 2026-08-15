import { bareMediaType } from './media-types.js';
import { OpdsParseError, type OpdsFeed } from './model.js';
import { parseOpds1 } from './parse-atom.js';
import { parseOpds2 } from './parse-json.js';
import { attribute, children, parseXml } from './xml.js';

/**
 * Chooses a parser for a fetched document.
 *
 * The `Content-Type` header decides when it is usable, and the first non-whitespace character
 * decides when it is not — a surprising number of OPDS servers answer with `text/html` or a bare
 * `application/octet-stream` for a perfectly valid Atom feed, and refusing those would break
 * exactly the self-hosted servers this feature exists to support.
 */
export function parseOpdsDocument(
  body: string,
  options: { feedUrl: string; contentType?: string | null },
): OpdsFeed {
  const bare = bareMediaType(options.contentType);
  const isJsonHeader = bare !== null && (bare.endsWith('+json') || bare === 'application/json');
  const isXmlHeader =
    bare !== null && (bare.endsWith('+xml') || bare === 'application/xml' || bare === 'text/xml');

  const firstCharacter = body.trimStart()[0];
  const looksJson = firstCharacter === '{';
  const looksXml = firstCharacter === '<';

  if (isJsonHeader || (!isXmlHeader && looksJson)) {
    return parseOpds2(parseJson(body), options.feedUrl);
  }
  if (isXmlHeader || looksXml) {
    return parseOpds1(body, options.feedUrl);
  }
  throw new OpdsParseError(
    `Response is neither XML nor JSON (Content-Type: ${options.contentType ?? 'none'})`,
  );
}

function parseJson(body: string): unknown {
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new OpdsParseError(
      `Could not parse the feed as JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Pulls the OPDS URL template out of an OpenSearch description document, which is what a feed's
 * `rel="search"` link points at. Returns the template with `{searchTerms}` still in place —
 * substitution is the caller's job because the term has to be URL-encoded at use time.
 *
 * Prefers a template whose type is an OPDS catalog: description documents commonly list an HTML
 * search endpoint alongside the machine-readable one, and following that would hand the reader a
 * web page where the client expects a feed.
 */
export function parseOpenSearchTemplate(xml: string): string | null {
  const document = parseXml(xml);
  const root = document['OpenSearchDescription'];
  const urls = children(
    typeof root === 'object' && root !== null ? (root as Record<string, unknown>) : undefined,
    'Url',
  );
  const templates = urls
    .map((url) => ({ template: attribute(url, 'template'), type: attribute(url, 'type') }))
    .filter((url): url is { template: string; type: string | null } => Boolean(url.template));

  const catalog = templates.find(
    (url) => url.type?.includes('opds') === true || url.type?.includes('atom') === true,
  );
  return (catalog ?? templates[0])?.template ?? null;
}

/** Substitutes an OpenSearch template's terms; unknown placeholders are cleared, per the spec. */
export function applySearchTemplate(template: string, terms: string): string {
  return template
    .replace(/\{searchTerms\??\}/g, encodeURIComponent(terms))
    .replace(/\{startIndex\??\}/g, '1')
    .replace(/\{startPage\??\}/g, '1')
    .replace(/\{count\??\}/g, '50')
    .replace(/\{[^}]*\?\}/g, '');
}
