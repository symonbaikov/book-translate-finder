import { describe, expect, it } from 'vitest';
import { Uuid7Generator } from './uuid7-generator.js';

describe('Uuid7Generator', () => {
  it('generates a valid UUID', () => {
    const id = new Uuid7Generator().newId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('generates unique, time-sortable ids across calls', () => {
    const gen = new Uuid7Generator();
    const a = gen.newId();
    const b = gen.newId();
    expect(a).not.toBe(b);
    // UUIDv7's first 48 bits are a millisecond timestamp, so lexicographic order tracks
    // generation order for ids minted apart by more than a millisecond or two.
    expect(a < b || a === b).toBe(true);
  });
});
