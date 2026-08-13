import type { CachePort } from '@btf/domain';
import type { UseCase } from '../use-case.js';
import { markSearchNotFound } from './search-works.use-case.js';
import type { SyncWorkFromSourceOutput } from './sync-work-from-source.use-case.js';

export interface ProcessBackfillJobInput {
  query: string;
}

export type ProcessBackfillJobOutput =
  { status: 'synced'; source: string } | { status: 'not_found' };

export interface SourceSyncRunner {
  execute(input: { source: string; query: string }): Promise<SyncWorkFromSourceOutput>;
}

export interface ProcessBackfillJobDeps {
  syncWorkFromSource: SourceSyncRunner;
  cache: CachePort;
  /** Tried in order; the first source that finds and syncs the work wins. */
  sources: readonly string[];
}

/**
 * Thrown when no source synced and at least one failed transiently (provider down, rate limited,
 * timed out). Deliberately an exception, not a `not_found` result: the queue consumer must let it
 * propagate so the queue's own retry-with-backoff re-runs the job — live testing in Phase 3 found
 * that swallowing it into `not_found` "completed" the job, and the completed job's deterministic
 * id then blocked every retry of the same query for the rest of the day.
 */
export class BackfillSourcesUnavailableError extends Error {
  constructor(query: string) {
    super(`Backfill for ${JSON.stringify(query)}: no source synced and at least one errored`);
    this.name = 'BackfillSourcesUnavailableError';
  }
}

/**
 * Backfill queue consumer (ADR-0003) — the async half of `GET /api/search`'s `pending` response.
 * Tries every registered source until one succeeds. Only marks the 24h negative cache
 * (`markSearchNotFound`) when every source came back a clean `not_found`; if any source errored
 * (provider down, rate limited), throws `BackfillSourcesUnavailableError` so the queue retries
 * the job instead of a transient failure being recorded as a final answer.
 */
export class ProcessBackfillJob implements UseCase<
  ProcessBackfillJobInput,
  ProcessBackfillJobOutput
> {
  constructor(private readonly deps: ProcessBackfillJobDeps) {}

  async execute(input: ProcessBackfillJobInput): Promise<ProcessBackfillJobOutput> {
    let allNotFound = true;

    for (const source of this.deps.sources) {
      const result = await this.deps.syncWorkFromSource.execute({ source, query: input.query });
      if (result.status === 'synced') {
        return { status: 'synced', source };
      }
      if (result.status === 'error') {
        allNotFound = false;
      }
    }

    if (!allNotFound) {
      throw new BackfillSourcesUnavailableError(input.query);
    }

    await markSearchNotFound(this.deps.cache, input.query);
    return { status: 'not_found' };
  }
}
