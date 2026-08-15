import { MIN_PASSWORD_LENGTH as APPLICATION_FLOOR } from '@golden/application';
import { MIN_PASSWORD_LENGTH as CONTRACT_FLOOR } from '@golden/contracts';
import { describe, expect, it } from 'vitest';

describe('the shared password floor', () => {
  /**
   * `packages/contracts` declares its own copy because it is imported by the browser and must not
   * depend on the application layer (docs/architecture.md §2). This test is what keeps the
   * duplicate honest — raise one and it fails until the other follows. It lives in apps/api
   * because that is the only place allowed to import both.
   */
  it('is the same number in contracts and in the application layer that enforces it', () => {
    expect(CONTRACT_FLOOR).toBe(APPLICATION_FLOOR);
  });
});
