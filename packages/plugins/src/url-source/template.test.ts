import { describe, expect, it } from 'vitest';
import {
  InvalidUrlTemplateError,
  assertHttpUrlTemplate,
  formatUrlTemplate,
  urlTemplateTokenNames,
} from './template.js';

describe('urlTemplateTokenNames', () => {
  it('lists every {token} in order, once per appearance', () => {
    expect(urlTemplateTokenNames('https://{domain}/isbn/{isbn}?ref={domain}')).toEqual([
      'domain',
      'isbn',
      'domain',
    ]);
  });

  it('returns nothing for a template with no placeholders', () => {
    expect(urlTemplateTokenNames('https://example.com/search')).toEqual([]);
  });
});

describe('formatUrlTemplate', () => {
  it('fills every token from the supplied values', () => {
    expect(
      formatUrlTemplate('https://{domain}/isbn/{isbn}', {
        domain: 'example.com',
        isbn: '9780140447934',
      }),
    ).toBe('https://example.com/isbn/9780140447934');
  });

  it('percent-encodes substituted values', () => {
    expect(
      formatUrlTemplate('https://example.com/search?q={query}', {
        query: 'Le Petit Prince, Saint-Exupéry',
      }),
    ).toBe('https://example.com/search?q=Le%20Petit%20Prince%2C%20Saint-Exup%C3%A9ry');
  });

  it('returns null when a token the template uses has no value', () => {
    expect(formatUrlTemplate('https://{domain}/isbn/{isbn}', { domain: 'example.com' })).toBeNull();
  });

  it('treats an empty string the same as a missing value', () => {
    expect(
      formatUrlTemplate('https://{domain}/isbn/{isbn}', { domain: 'example.com', isbn: '' }),
    ).toBeNull();
  });

  it('ignores supplied values the template does not reference', () => {
    expect(formatUrlTemplate('https://example.com/search', { unused: 'x' })).toBe(
      'https://example.com/search',
    );
  });
});

describe('assertHttpUrlTemplate', () => {
  it('accepts an http(s) template with placeholders', () => {
    expect(() => assertHttpUrlTemplate('https://{domain}/search?q={query}')).not.toThrow();
    expect(() => assertHttpUrlTemplate('http://example.com/isbn/{isbn}')).not.toThrow();
  });

  it('rejects a non-absolute string', () => {
    expect(() => assertHttpUrlTemplate('/search?q={query}')).toThrow(InvalidUrlTemplateError);
  });

  it('rejects a non-http(s) scheme', () => {
    expect(() => assertHttpUrlTemplate('javascript:alert(1)')).toThrow(InvalidUrlTemplateError);
    expect(() => assertHttpUrlTemplate('ftp://example.com/{isbn}')).toThrow(
      InvalidUrlTemplateError,
    );
  });
});
