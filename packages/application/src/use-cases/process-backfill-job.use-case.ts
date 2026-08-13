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
 * Backfill queue consumer (ADR-0003) — the async half of `GET /api/search`'s `pending` response.
 * Tries every registered source until one succeeds. Only marks the 24h negative cache
 * (`markSearchNotFound`) when every source came back a clean `not_found`; if any source errored
 * (provider down, rate limited), the query is left uncached so a later identical miss gets a
 * fresh attempt instead of being permanently written off by a transient failure.
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

    if (allNotFound) {
      await markSearchNotFound(this.deps.cache, input.query);
    }
    return { status: 'not_found' };
  }
}
