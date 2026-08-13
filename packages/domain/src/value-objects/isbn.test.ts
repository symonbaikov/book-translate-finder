import { describe, expect, it } from 'vitest';
import { Isbn } from './isbn.js';

describe('Isbn', () => {
  it('accepts a valid ISBN-13', () => {
    expect(Isbn.create('9780141439518').value).toBe('9780141439518');
  });

  it('normalizes a valid ISBN-10 to its canonical ISBN-13 form', () => {
    expect(Isbn.create('0141439513').value).toBe('9780141439518');
  });

  it('strips hyphens and spaces before validating', () => {
    expect(Isbn.create('978-0-14-143951-8').value).toBe('9780141439518');
    expect(Isbn.create('0-14-143951-3').value).toBe('9780141439518');
  });

  it('accepts an ISBN-10 with an X check digit', () => {
    // 0-596-52068-9 is a real ISBN-10; use a known X-check example instead.
    expect(() => Isbn.create('097522980X')).not.toThrow();
  });

  it('rejects an ISBN-13 with a bad checksum', () => {
    expect(() => Isbn.create('9780141439519')).toThrow(/Invalid ISBN/);
  });

  it('rejects an ISBN-10 with a bad checksum', () => {
    expect(() => Isbn.create('0141439510')).toThrow(/Invalid ISBN/);
  });

  it('rejects garbage input', () => {
    expect(() => Isbn.create('not-an-isbn')).toThrow(/Invalid ISBN/);
  });

  it('an ISBN-10 and its ISBN-13 equivalent produce equal value objects', () => {
    const fromIsbn10 = Isbn.create('0141439513');
    const fromIsbn13 = Isbn.create('9780141439518');
    expect(fromIsbn10.equals(fromIsbn13)).toBe(true);
  });

  it('toString returns the canonical ISBN-13', () => {
    expect(`${Isbn.create('9780141439518')}`).toBe('9780141439518');
  });
});
