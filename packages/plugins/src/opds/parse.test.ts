import { describe, expect, it } from 'vitest';
import { OpdsParseError } from './model.js';
import { applySearchTemplate, parseOpdsDocument, parseOpenSearchTemplate } from './parse.js';

const ATOM = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom"><title>Atom shelf</title></feed>`;
const JSON_FEED = JSON.stringify({ metadata: { title: 'JSON shelf' }, publications: [] });

describe('parseOpdsDocument', () => {
  it.each([
    ['application/opds+json', JSON_FEED, '2.0'],
    ['application/json', JSON_FEED, '2.0'],
    ['application/atom+xml;profile=opds-catalog', ATOM, '1.2'],
    ['text/xml', ATOM, '1.2'],
  ])('uses the %s content type', (contentType, body, version) => {
    expect(parseOpdsDocument(body, { feedUrl: 'https://e.org/o', contentType }).version).toBe(
      version,
    );
  });

  it.each([
    // Servers that mislabel a perfectly good feed are common enough that refusing them would
    // break exactly the self-hosted setups this feature exists for.
    ['text/html', ATOM, '1.2'],
    ['application/octet-stream', JSON_FEED, '2.0'],
    [null, ATOM, '1.2'],
  ])('falls back to sniffing when the content type says %s', (contentType, body, version) => {
    expect(parseOpdsDocument(body, { feedUrl: 'https://e.org/o', contentType }).version).toBe(
      version,
    );
  });

  it('rejects a body that is neither XML nor JSON', () => {
    expect(() =>
      parseOpdsDocument('not a feed', { feedUrl: 'https://e.org/o', contentType: 'text/plain' }),
    ).toThrow(OpdsParseError);
  });
});

describe('parseOpenSearchTemplate', () => {
  it('prefers the OPDS template over the HTML one', () => {
    const description = `<?xml version="1.0"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <Url type="text/html" template="https://e.org/search?q={searchTerms}"/>
  <Url type="application/atom+xml;profile=opds-catalog" template="https://e.org/opds/search?q={searchTerms}"/>
</OpenSearchDescription>`;
    expect(parseOpenSearchTemplate(description)).toBe('https://e.org/opds/search?q={searchTerms}');
  });

  it('returns null when the document declares no template', () => {
    expect(parseOpenSearchTemplate('<?xml version="1.0"?><OpenSearchDescription/>')).toBeNull();
  });
});

describe('applySearchTemplate', () => {
  it('encodes the search terms', () => {
    expect(applySearchTemplate('/s?q={searchTerms}', 'война и мир')).toBe(
      '/s?q=%D0%B2%D0%BE%D0%B9%D0%BD%D0%B0%20%D0%B8%20%D0%BC%D0%B8%D1%80',
    );
  });

  it('fills the standard parameters and clears the remaining optional ones', () => {
    expect(applySearchTemplate('/s?q={searchTerms}&i={startIndex}&z={custom:thing?}', 'x')).toBe(
      '/s?q=x&i=1&z=',
    );
  });
});
