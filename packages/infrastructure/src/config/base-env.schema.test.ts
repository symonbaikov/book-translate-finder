import { describe, expect, it } from 'vitest';
import { baseEnvSchema, loadEnv } from './base-env.schema.js';

const validEnv = {
  NODE_ENV: 'test',
  LOG_LEVEL: 'info',
  DATABASE_URL: 'postgres://user:pass@localhost:5432/btf',
  REDIS_URL: 'redis://localhost:6379',
  CONTACT_URL: 'https://github.com/example/book-translate-finder',
};

describe('loadEnv', () => {
  it('returns a typed config for a valid environment', () => {
    const env = loadEnv(baseEnvSchema, validEnv);

    expect(env.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    expect(env.NODE_ENV).toBe('test');
  });

  it('defaults NODE_ENV and LOG_LEVEL when omitted', () => {
    const { NODE_ENV: _NODE_ENV, LOG_LEVEL: _LOG_LEVEL, ...rest } = validEnv;

    const env = loadEnv(baseEnvSchema, rest);

    expect(env.NODE_ENV).toBe('development');
    expect(env.LOG_LEVEL).toBe('info');
  });

  it('fails fast with a readable message listing every missing variable', () => {
    expect(() => loadEnv(baseEnvSchema, {})).toThrowError(/DATABASE_URL/);
  });

  it('rejects a non-URL DATABASE_URL instead of failing later at connection time', () => {
    expect(() => loadEnv(baseEnvSchema, { ...validEnv, DATABASE_URL: 'not-a-url' })).toThrow();
  });
});
