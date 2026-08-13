import { createServer, type Server } from 'node:http';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createResilientFetcher } from './resilient-fetch.js';

/**
 * These run against a real local HTTP server (not mocked fetch) — the behavior under test is
 * genuinely about retry timing, circuit-breaker state, and timeout enforcement, which a mocked
 * `fetch` can't meaningfully exercise.
 */
describe('createResilientFetcher', () => {
  let server: Server;
  let baseUrl: string;
  let requestCount: number;
  let handler: (
    req: import('node:http').IncomingMessage,
    res: import('node:http').ServerResponse,
  ) => void;

  beforeEach(async () => {
    requestCount = 0;
    server = createServer((req, res) => {
      requestCount += 1;
      handler(req, res);
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address();
    if (address === null || typeof address === 'string')
      throw new Error('unexpected server address');
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  });

  it('returns the response immediately when the server succeeds', async () => {
    handler = (_req, res) => res.writeHead(200).end('ok');
    const fetcher = createResilientFetcher({ retryAttempts: 3 });

    const res = await fetcher.fetch(baseUrl);

    expect(res.status).toBe(200);
    expect(requestCount).toBe(1);
  });

  it('retries a 5xx response and succeeds once the server recovers', async () => {
    handler = (_req, res) => {
      if (requestCount < 3) {
        res.writeHead(503).end('unavailable');
      } else {
        res.writeHead(200).end('ok');
      }
    };
    const fetcher = createResilientFetcher({ retryAttempts: 3 });

    const res = await fetcher.fetch(baseUrl);

    expect(res.status).toBe(200);
    expect(requestCount).toBe(3);
  });

  it('does not retry a 4xx response — the request itself was wrong', async () => {
    handler = (_req, res) => res.writeHead(404).end('not found');
    const fetcher = createResilientFetcher({ retryAttempts: 3 });

    const res = await fetcher.fetch(baseUrl);

    expect(res.status).toBe(404);
    expect(requestCount).toBe(1);
  });

  it('gives up after exhausting retries against a server that never recovers', async () => {
    handler = (_req, res) => res.writeHead(503).end('unavailable');
    const fetcher = createResilientFetcher({ retryAttempts: 2 });

    await expect(fetcher.fetch(baseUrl)).rejects.toThrow();
    // cockatiel's `maxAttempts` counts *retries*, not total calls: 1 initial attempt + 2 retries.
    expect(requestCount).toBe(3);
  });

  it('times out a request that takes longer than timeoutMs', async () => {
    handler = (_req, res) => {
      setTimeout(() => res.writeHead(200).end('too slow'), 500);
    };
    const fetcher = createResilientFetcher({ timeoutMs: 50, retryAttempts: 1 });

    await expect(fetcher.fetch(baseUrl)).rejects.toThrow();
  });

  it('opens the circuit after consecutive failures and fails fast without hitting the server', async () => {
    handler = (_req, res) => res.writeHead(503).end('unavailable');
    const fetcher = createResilientFetcher({
      retryAttempts: 1,
      consecutiveFailuresBeforeOpen: 2,
      circuitBreakerHalfOpenAfterMs: 60_000,
    });

    // Two calls, each failing once (retryAttempts: 1) — trips the breaker at 2 consecutive failures.
    await expect(fetcher.fetch(baseUrl)).rejects.toThrow();
    await expect(fetcher.fetch(baseUrl)).rejects.toThrow();
    const countBeforeOpen = requestCount;
    expect(countBeforeOpen).toBe(2);

    // The circuit is now open — this call should fail immediately without reaching the server.
    await expect(fetcher.fetch(baseUrl)).rejects.toThrow();
    expect(requestCount).toBe(countBeforeOpen);
  });
});
