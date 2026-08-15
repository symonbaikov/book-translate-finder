import { describe, expect, it } from 'vitest';
import { hasConflictingNumbers } from './conflicting-numbers.js';

describe('hasConflictingNumbers', () => {
  it('flags a shared title whose sequel/year number does not match', () => {
    // The live case this exists for: «Metro 2035» matched the already-synced «Metro 2033»
    // edition title at 0.69 trigram similarity — a single digit apart.
    expect(hasConflictingNumbers('Metro 2035', 'Metro 2033 Dmitry Glukhovsky')).toBe(true);
  });

  it('does not flag a matching number', () => {
    expect(hasConflictingNumbers('Metro 2033', 'Metro 2033 Dmitry Glukhovsky')).toBe(false);
  });

  it('does not flag when the query has no number', () => {
    expect(hasConflictingNumbers('War and Peace', 'Metro 2033 Dmitry Glukhovsky')).toBe(false);
  });

  it('does not flag when the candidate has no number', () => {
    expect(hasConflictingNumbers('Metro 2035', 'War and Peace Leo Tolstoy')).toBe(false);
  });

  it('does not flag when any one of the query numbers appears in the candidate', () => {
    expect(hasConflictingNumbers('Book 1984 2035', 'Book 1984 Author')).toBe(false);
  });
});
