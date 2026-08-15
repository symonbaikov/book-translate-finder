/**
 * Runs a set of port implementations concurrently, and never rejects.
 *
 * This is the shape docs/rules.md §3 calls for — "one failing source does not break the response" —
 * expressed once instead of re-implemented in every aggregating use case. A provider that throws
 * contributes a `failed` row that the use case can report as a degraded answer, while every other
 * provider's result is still returned.
 *
 * **Latency is bounded by the adapters, not here.** docs/rules.md §3 puts the timeout, the retry
 * budget and the circuit breaker on the outbound call — `createResilientFetcher` in
 * `packages/infrastructure` already enforces all three per provider. Adding a second timeout at
 * this layer would need a timer in `packages/application`, which is exactly the kind of ambient
 * I/O the layer is kept free of, and would duplicate a policy that already has one owner.
 *
 * Deliberately not shared with `settleAll` in `@golden/plugins`: that one works on plugin manifests
 * and runs in the browser, this one works on domain ports and keeps `packages/application`
 * depending on `packages/domain` alone (docs/architecture.md §2).
 */

export type ProviderOutcome<T> =
  | { readonly providerId: string; readonly status: 'ok'; readonly value: T }
  | { readonly providerId: string; readonly status: 'failed'; readonly reason: string };

export async function settleProviders<P, T>(
  providers: readonly P[],
  identify: (provider: P) => string,
  run: (provider: P) => Promise<T>,
): Promise<ProviderOutcome<T>[]> {
  return Promise.all(
    providers.map(async (provider): Promise<ProviderOutcome<T>> => {
      const providerId = identify(provider);
      try {
        return { providerId, status: 'ok', value: await run(provider) };
      } catch (error) {
        return {
          providerId,
          status: 'failed',
          reason: error instanceof Error ? error.message : String(error),
        };
      }
    }),
  );
}
