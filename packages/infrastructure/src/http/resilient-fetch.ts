import {
  circuitBreaker,
  ConsecutiveBreaker,
  ExponentialBackoff,
  handleAll,
  retry,
  timeout,
  TimeoutStrategy,
  wrap,
} from 'cockatiel';

export interface ResilientFetchOptions {
  /**
   * docs/research/coverage-phase0.md found Open Library latency up to 22s under load, and live
   * testing during Phase 3 saw *successful* responses at ~9s — the original 5s default killed
   * every attempt of a request that would have succeeded, burning all retries on a working API.
   * 25s covers the observed worst case; callers with a genuinely fast source can tune it down.
   */
  timeoutMs?: number;
  retryAttempts?: number;
  /** How long the circuit stays open before allowing a trial request through. */
  circuitBreakerHalfOpenAfterMs?: number;
  /** Consecutive failures before the circuit opens. */
  consecutiveFailuresBeforeOpen?: number;
}

const DEFAULTS: Required<ResilientFetchOptions> = {
  timeoutMs: 25_000,
  retryAttempts: 3,
  circuitBreakerHalfOpenAfterMs: 30_000,
  consecutiveFailuresBeforeOpen: 5,
};

/** A 5xx or network-level failure is worth retrying; a 4xx means our request was wrong — retrying won't help. */
class RetryableHttpError extends Error {
  constructor(readonly status: number) {
    super(`Retryable HTTP status: ${status}`);
  }
}

/**
 * Timeout + retry-with-jittered-backoff + circuit-breaker, composed once per provider instance
 * and reused across every call it makes (docs/architecture.md §2.4 "retries with exponential
 * backoff and jitter, circuit breaker"). This isn't optional hardening — Phase 0 research
 * found 76% of naive sequential requests to Open Library failed under load without it
 * (docs/research/coverage-phase0.md).
 *
 * `ExponentialBackoff`'s default generator already applies jitter (decorrelated jitter,
 * cockatiel's default) — no separate jitter step needed.
 *
 * **Important**: construct one `ResilientFetcher` per provider and reuse it for every request —
 * the circuit breaker only works if failures are counted against a shared instance, not a fresh
 * one per call.
 */
export interface ResilientFetcher {
  fetch(url: string, init?: RequestInit): Promise<Response>;
}

export function createResilientFetcher(options: ResilientFetchOptions = {}): ResilientFetcher {
  const opts = { ...DEFAULTS, ...options };

  const retryPolicy = retry(handleAll, {
    maxAttempts: opts.retryAttempts,
    backoff: new ExponentialBackoff({ initialDelay: 500, maxDelay: 10_000 }),
  });

  const timeoutPolicy = timeout(opts.timeoutMs, TimeoutStrategy.Aggressive);

  const circuitBreakerPolicy = circuitBreaker(handleAll, {
    halfOpenAfter: opts.circuitBreakerHalfOpenAfterMs,
    breaker: new ConsecutiveBreaker(opts.consecutiveFailuresBeforeOpen),
  });

  // Order matters: retry is outermost (retries the whole timeout+breaker attempt), circuit
  // breaker next (counts failed attempts including timeouts), timeout innermost (bounds each
  // individual attempt).
  const policy = wrap(retryPolicy, circuitBreakerPolicy, timeoutPolicy);

  return {
    async fetch(url: string, init?: RequestInit): Promise<Response> {
      return policy.execute(async () => {
        const res = await fetch(url, init);
        if (!res.ok && res.status >= 500) {
          throw new RetryableHttpError(res.status);
        }
        return res;
      });
    },
  };
}
