import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/**
 * Proves the integration-test harness itself works end to end (docs/plan.md §1.0 DoD):
 * Testcontainers can bring up real Postgres and Redis, hand back a reachable connection, and
 * tear down cleanly. No repository/adapter code exists yet (that's Phase 1.2-1.3) — this is
 * infrastructure-of-the-infrastructure, not a business-logic test.
 */
describe('integration test harness', () => {
  let postgres: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;

  beforeAll(async () => {
    [postgres, redis] = await Promise.all([
      new PostgreSqlContainer('postgres:16-alpine').start(),
      new RedisContainer('redis:7-alpine').start(),
    ]);
  });

  afterAll(async () => {
    await Promise.all([postgres?.stop(), redis?.stop()]);
  });

  it('starts a reachable Postgres container', () => {
    expect(postgres.getHost()).toBeTruthy();
    expect(postgres.getMappedPort(5432)).toBeGreaterThan(0);
    expect(postgres.getConnectionUri()).toMatch(/^postgres(ql)?:\/\//);
  });

  it('starts a reachable Redis container', () => {
    expect(redis.getHost()).toBeTruthy();
    expect(redis.getMappedPort(6379)).toBeGreaterThan(0);
  });
});
