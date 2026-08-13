import { loadEnv } from '@btf/infrastructure';
import { describe, expect, it } from 'vitest';
import { workerEnvSchema } from './worker-env.schema.js';

const BASE = {
  DATABASE_URL: 'postgres://user:pass@localhost:5432/btf',
  REDIS_URL: 'redis://localhost:6379',
  CONTACT_URL: 'https://github.com/example/book-translate-finder',
};

describe('workerEnvSchema', () => {
  it('defaults WORKER_CONCURRENCY and inherits base env validation', () => {
    const env = loadEnv(workerEnvSchema, BASE);

    expect(env.WORKER_CONCURRENCY).toBe(5);
  });

  it('defaults REFRESH_STALE_AFTER_DAYS and REFRESH_BATCH_SIZE', () => {
    const env = loadEnv(workerEnvSchema, BASE);

    expect(env.REFRESH_STALE_AFTER_DAYS).toBe(7);
    expect(env.REFRESH_BATCH_SIZE).toBe(50);
  });

  it('runs without GOOGLE_BOOKS_API_KEY (docs/architecture.md §9.2)', () => {
    const env = loadEnv(workerEnvSchema, BASE);

    expect(env.GOOGLE_BOOKS_API_KEY).toBeUndefined();
  });

  it('accepts an explicit GOOGLE_BOOKS_API_KEY', () => {
    const env = loadEnv(workerEnvSchema, { ...BASE, GOOGLE_BOOKS_API_KEY: 'test-key' });

    expect(env.GOOGLE_BOOKS_API_KEY).toBe('test-key');
  });
});
