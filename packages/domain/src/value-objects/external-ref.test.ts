import { describe, expect, it } from 'vitest';
import { ExternalRef } from './external-ref.js';

describe('ExternalRef', () => {
  it('creates a ref from source name and external id', () => {
    const ref = ExternalRef.create('open-library', '/works/OL267096W');
    expect(ref.sourceName).toBe('open-library');
    expect(ref.externalId).toBe('/works/OL267096W');
  });

  it('rejects an empty sourceName or externalId', () => {
    expect(() => ExternalRef.create('', 'x')).toThrow();
    expect(() => ExternalRef.create('open-library', '  ')).toThrow();
  });

  it('two refs with the same pair are equal', () => {
    const a = ExternalRef.create('open-library', 'OL1');
    const b = ExternalRef.create('open-library', 'OL1');
    const c = ExternalRef.create('google-books', 'OL1');
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it('toString returns "source:externalId"', () => {
    expect(`${ExternalRef.create('open-library', 'OL1')}`).toBe('open-library:OL1');
  });
});
