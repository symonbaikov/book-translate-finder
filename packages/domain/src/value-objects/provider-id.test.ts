import { describe, expect, it } from 'vitest';
import { ProviderId } from './provider-id.js';

describe('ProviderId', () => {
  it('accepts a kebab-case id', () => {
    expect(ProviderId.create('open-library').value).toBe('open-library');
  });

  it('normalizes case', () => {
    expect(ProviderId.create('Open-Library').value).toBe('open-library');
  });

  it.each(['open library', 'Open_Library', '-open-library', 'open-library-', ''])(
    'rejects invalid format: %s',
    (input) => {
      expect(() => ProviderId.create(input)).toThrow();
    },
  );

  it('equals compares by value', () => {
    expect(ProviderId.create('open-library').equals(ProviderId.create('open-library'))).toBe(true);
    expect(ProviderId.create('open-library').equals(ProviderId.create('google-books'))).toBe(false);
  });

  it('toString returns the id', () => {
    expect(`${ProviderId.create('open-library')}`).toBe('open-library');
  });
});
