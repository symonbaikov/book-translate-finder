import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';
import { Queue, Worker } from 'bullmq';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { BullMqQueue } from '../../src/queue/bullmq-queue.js';

describe('BullMqQueue', () => {
  let container: StartedRedisContainer;
  let connection: { host: string; port: number };
  let worker: Worker | undefined;

  beforeAll(async () => {
    container = await new RedisContainer('redis:7-alpine').start();
    connection = { host: container.getHost(), port: container.getMappedPort(6379) };
  });

  afterAll(async () => {
    await container.stop();
  });

  afterEach(async () => {
    await worker?.close();
    worker = undefined;
  });

  it('enqueues a job that a real BullMQ worker picks up and processes', async () => {
    const queueName = `test-queue-${Date.now()}`;
    const bullMqQueue = new BullMqQueue(queueName, connection);

    const processed = new Promise<unknown>((resolve) => {
      worker = new Worker(
        queueName,
        async (job) => {
          resolve(job.data);
          return 'ok';
        },
        { connection },
      );
    });

    await bullMqQueue.enqueue('job-1', { workId: 'work-1', source: 'open-library' });

    await expect(processed).resolves.toEqual({ workId: 'work-1', source: 'open-library' });
    await bullMqQueue.close();
  });

  it('dedupes by jobId — a repeated enqueue of a still-pending job does not add a second one', async () => {
    const queueName = `test-queue-${Date.now()}`;
    const bullMqQueue = new BullMqQueue(queueName, connection);
    const rawQueue = new Queue(queueName, { connection });

    await bullMqQueue.enqueue('sync-open-library-work-1-2026-01-01', { attempt: 1 });
    await bullMqQueue.enqueue('sync-open-library-work-1-2026-01-01', { attempt: 2 });

    const waiting = await rawQueue.getWaiting();
    expect(waiting).toHaveLength(1);
    expect(waiting[0]?.data).toEqual({ attempt: 1 }); // the first enqueue won, second was a no-op

    await rawQueue.close();
    await bullMqQueue.close();
  });

  it("rejects a colon-containing jobId with a clear error instead of BullMQ's internal one", async () => {
    const bullMqQueue = new BullMqQueue(`test-queue-${Date.now()}`, connection);
    await expect(bullMqQueue.enqueue('sync:open-library:work-1', {})).rejects.toThrow(
      /cannot contain ":"/,
    );
    await bullMqQueue.close();
  });

  it('keeps a permanently failed job inspectable instead of discarding it (docs/plan.md §1.3 DLQ)', async () => {
    const queueName = `test-queue-${Date.now()}`;
    const bullMqQueue = new BullMqQueue(queueName, connection, { attempts: 1, backoffDelayMs: 10 });
    const rawQueue = new Queue(queueName, { connection });

    const failed = new Promise<void>((resolve) => {
      worker = new Worker(
        queueName,
        async () => {
          throw new Error('simulated permanent failure');
        },
        { connection },
      );
      worker.on('failed', () => resolve());
    });

    await bullMqQueue.enqueue('doomed-job', { workId: 'work-1' });
    await failed;

    const failedJobs = await rawQueue.getFailed();
    expect(failedJobs.map((j) => j.id)).toContain('doomed-job');

    await rawQueue.close();
    await bullMqQueue.close();
  });
});
