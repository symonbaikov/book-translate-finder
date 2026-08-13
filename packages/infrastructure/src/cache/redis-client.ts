import { Redis } from 'ioredis';

/** One connection per process — callers (apps/api, apps/worker) create this once at boot. */
export function createRedisClient(redisUrl: string): Redis {
  return new Redis(redisUrl, {
    // ioredis retries individual commands by default; this bounds reconnect attempts so a
    // genuinely down Redis fails fast (surfaces in health checks) instead of queuing forever.
    maxRetriesPerRequest: 3,
  });
}
