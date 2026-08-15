import { InvalidInputError } from '@golden/domain';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { parseOrThrow } from './parse-or-throw.js';

describe('parseOrThrow', () => {
  const schema = z.object({ q: z.string().min(1), limit: z.coerce.number().default(20) });

  it('returns the parsed, coerced value on success', () => {
    const result = parseOrThrow(schema, { q: 'x', limit: '5' });
    expect(result).toEqual({ q: 'x', limit: 5 });
  });

  it('applies schema defaults', () => {
    const result = parseOrThrow(schema, { q: 'x' });
    expect(result.limit).toBe(20);
  });

  it('throws InvalidInputError (not a raw ZodError) on invalid input (docs/rules.md §3)', () => {
    expect(() => parseOrThrow(schema, { q: '' })).toThrow(InvalidInputError);
  });

  it('includes the field path in the error message', () => {
    expect(() => parseOrThrow(schema, { q: '' })).toThrow(/q:/);
  });
});
