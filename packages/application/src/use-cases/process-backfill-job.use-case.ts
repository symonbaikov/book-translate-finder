import { normalizeText, type CachePort } from '@golden/domain';
import type { UseCase } from '../use-case.js';
import { markSearchNotFound, markSearchResolved } from './search-works.use-case.js';
import type { SyncWorkFromSourceOutput } from './sync-work-from-source.use-case.js';

export interface ProcessBackfillJobInput {
  query: string;
  /**
   * Whether the queue has any retries left for this job. The consumer knows; this use case cannot.
   * See `execute` for what changes on the last one.
   */
  lastAttempt?: boolean;
}

export type ProcessBackfillJobOutput =
  | { status: 'synced'; source: string }
  /** `degraded` means: nothing was found, but a source failed rather than answered, so this is
   * "no" with an asterisk — cached for minutes instead of a day. */
  | { status: 'not_found'; degraded?: true };

/**
 * How long a not-found *reached through a failing source* is trusted. Short on purpose: the answer
 * is only as good as the sources that actually replied, and fifteen minutes is long enough to stop
 * a polling page from re-queueing the same work while being short enough that a source coming back
 * up is noticed the same afternoon.
 */
const DEGRADED_NEGATIVE_TTL_SECONDS = 15 * 60;

export interface SourceSyncRunner {
  execute(input: {
    source: string;
    query: string;
    /** Set for enrichment, where the work is already known — see `SyncWorkFromSourceInput`. */
    attachToWorkId?: string;
  }): Promise<SyncWorkFromSourceOutput>;
}

export interface ProcessBackfillJobDeps {
  syncWorkFromSource: SourceSyncRunner;
  cache: CachePort;
  /** Tried in order; the first source that finds and syncs the work wins. */
  sources: readonly string[];
  /**
   * Sources run *in addition to* the winner, not instead of it. Discovery stops at the first
   * source that has the book, but some sources contribute something no other one can — Project
   * Gutenberg is the only one that hands over actual downloadable files — and skipping them
   * because Open Library answered first would mean a public domain book shows borrow links and
   * no way to simply download it. Failure here is never fatal: most books are in copyright and
   * legitimately absent from these sources.
   */
  enrichmentSources?: readonly string[];
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
 *
 * **Until the retries run out.** "Retry rather than record a failure as an answer" is right for a
 * source that is *momentarily* down and wrong for one that is permanently unhappy — and the second
 * is the ordinary case on a fresh self-hosted instance, where Google Books has no API key and
 * answers 429 to everything (measured live: every backfill of a book Open Library does not have).
 * One such source made *every* genuinely-missing book unanswerable: the job threw, the negative
 * cache was never written, the query stayed `pending`, and the reader watched a spinner until it
 * gave up — then got the same on the next try, forever. So on the queue's last attempt a
 * not-found-with-errors is recorded as a `degraded` not_found: a real answer for the reader, kept
 * only for `DEGRADED_NEGATIVE_TTL_SECONDS` so a source that recovers is re-asked in minutes rather
 * than tomorrow.
 */
export class ProcessBackfillJob implements UseCase<
  ProcessBackfillJobInput,
  ProcessBackfillJobOutput
> {
  constructor(private readonly deps: ProcessBackfillJobDeps) {}

  async execute(input: ProcessBackfillJobInput): Promise<ProcessBackfillJobOutput> {
    let allNotFound = true;
    /** Discovery sources that answered "I don't have it" — candidates for a second question. */
    const drewABlank: string[] = [];

    for (const source of this.deps.sources) {
      const result = await this.deps.syncWorkFromSource.execute({ source, query: input.query });
      if (result.status === 'synced') {
        // Written before enrichment, not after: the reader is polling right now, and the next poll
        // should be able to answer with the book even while Gutenberg is still being asked whether
        // it has a downloadable copy.
        if (result.work) {
          await markSearchResolved(this.deps.cache, input.query, [result.work]);
        }
        await this.enrich(input.query, source, result, drewABlank);
        return { status: 'synced', source };
      }
      if (result.status === 'error') {
        allNotFound = false;
      } else {
        drewABlank.push(source);
      }
    }

    if (!allNotFound) {
      if (!input.lastAttempt) {
        throw new BackfillSourcesUnavailableError(input.query);
      }
      await markSearchNotFound(this.deps.cache, input.query, DEGRADED_NEGATIVE_TTL_SECONDS);
      return { status: 'not_found', degraded: true };
    }

    await markSearchNotFound(this.deps.cache, input.query);
    return { status: 'not_found' };
  }

  /**
   * Runs the enrichment sources after a successful discovery. Every failure is swallowed: the
   * work is already synced and useful, and losing it over a missing download would be a strictly
   * worse outcome than simply not having that download.
   *
   * Everything found is attached to the work discovery just settled on (`attachToWorkId`). Before
   * that, an enrichment source could only contribute to it by spelling the title and author
   * exactly as the winner had — true for Project Gutenberg, false for any catalogue whose records
   * are translations, which would instead have quietly created a second book under its French or
   * German title.
   *
   * They are also asked in the *book's* words rather than the reader's. Discovery has just
   * established what this book is called and who wrote it; carrying the raw query forward instead
   * would send «Лавр Водолазкин» to a German catalogue that files the novel as "Laurus" by
   * "Vodolazkin, Evgenij Germanovič" and knows nothing by either of those words. The reader's
   * phrasing was the right question to ask when nobody knew the book yet; now somebody does.
   *
   * Which is why the sources that already said no are asked **again** whenever that canonical
   * name differs from what the reader typed. They were not answering about this book; they were
   * answering about a string. «Моим легионерам» drew a blank at Open Library in both scripts, so
   * discovery fell through to Wikidata, which named the book *For My Legionaries* by Corneliu
   * Zelea Codreanu — and Open Library has it under exactly that name, with editions. Without the
   * second question the reader is shown a book with nothing on it: no editions, no translations,
   * nowhere to buy it, which is a worse answer than "not found" because it looks like the truth.
   */
  private async enrich(
    query: string,
    winner: string,
    discovered: SyncWorkFromSourceOutput,
    drewABlank: readonly string[],
  ): Promise<void> {
    const enrichmentQuery = discovered.work
      ? `${discovered.work.originalTitle} ${discovered.work.author}`
      : query;

    // Only when the name actually changed: re-running every source on a query that already worked
    // doubles the cost of an ordinary search and can buy nothing, because the sources were asked
    // the right question the first time.
    const worthAskingAgain =
      normalizeText(enrichmentQuery) === normalizeText(query) ? [] : drewABlank;
    // De-duplicated: most enrichment sources are discovery sources too, so they appear in both
    // lists and would otherwise be asked the same question twice in a row.
    const sources = [...new Set([...(this.deps.enrichmentSources ?? []), ...worthAskingAgain])];

    for (const source of sources) {
      if (source === winner) continue;
      try {
        await this.deps.syncWorkFromSource.execute({
          source,
          query: enrichmentQuery,
          ...(discovered.workId ? { attachToWorkId: discovered.workId } : {}),
        });
      } catch {
        // Intentionally ignored — see the doc comment.
      }
    }
  }
}
