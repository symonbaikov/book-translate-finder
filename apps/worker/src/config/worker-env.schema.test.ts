import { loadEnv } from '@btf/infrastructure';
import { describe, expect, it } from 'vitest';
import { workerEnvSchema } from './worker-env.schema.js';

describe('workerEnvSchema', () => {
  it('defaults WORKER_CONCURRENCY and inherits base env validation', () => {
    const env = loadEnv(workerEnvSchema, {
      DATABASE_URL: 'postgres://user:pass@localhost:5432/btf',
      REDIS_URL: 'redis://localhost:6379',
      CONTACT_URL: 'https://github.com/example/book-translate-finder',
    });

    expect(env.WORKER_CONCURRENCY).toBe(5);
  });
});
