import { describe, expect, it } from 'vitest';
import { isRightsStatus, RIGHTS_STATUSES } from './rights-status.js';

describe('isRightsStatus', () => {
  it.each(RIGHTS_STATUSES)('accepts every known rights status: %s', (status) => {
    expect(isRightsStatus(status)).toBe(true);
  });

  it('rejects an unknown value', () => {
    expect(isRightsStatus('probably_fine')).toBe(false);
  });
});
