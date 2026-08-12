import { describe, expect, it } from 'vitest';
import { HealthResponseSchema } from './health.contract.js';

describe('HealthResponseSchema', () => {
  it('accepts a minimal valid payload', () => {
    const result = HealthResponseSchema.safeParse({
      status: 'ok',
      service: '@btf/api',
      version: '0.0.0',
    });

    expect(result.success).toBe(true);
  });

  it('rejects an unknown status value', () => {
    const result = HealthResponseSchema.safeParse({
      status: 'sleeping',
      service: '@btf/api',
      version: '0.0.0',
    });

    expect(result.success).toBe(false);
  });
});
