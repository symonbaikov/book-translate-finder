import { describe, expect, it } from 'vitest';
import { isLinkType, LINK_TYPES } from './link-type.js';

describe('isLinkType', () => {
  it.each(LINK_TYPES)('accepts every known link type: %s', (type) => {
    expect(isLinkType(type)).toBe(true);
  });

  it('rejects an unknown value', () => {
    expect(isLinkType('stream')).toBe(false);
  });
});
