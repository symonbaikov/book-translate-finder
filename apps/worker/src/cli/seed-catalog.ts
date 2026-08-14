// `pnpm db:seed:catalog` (docs/plan.md Phase 3) — fills a fresh install's empty database with a
// curated popular core by running the ordinary sync pipeline over CATALOG_SEED_QUERIES. Safe to
// re-run (every sync write is idempotent, docs/rules.md §2.2) and safe to interrupt: each book is
// an independent sync, so a killed run just resumes from wherever the list is re-walked.
//
// `--limit=N` syncs only the first N queries — handy for a quick smoke test.
import { loadEnv } from '@btf/infrastructure';
import { buildWorkerContext } from '../composition-root.js';
import { workerEnvSchema } from '../config/worker-env.schema.js';
import { FEATURED_BOOKS } from '@btf/domain';
import { CATALOG_SEED_QUERIES } from './catalog-seed-list.js';

/** No `--limit` means the whole list; the caller decides how much of it they have time for. */
function parseLimit(argv: string[]): number {
  for (const arg of argv) {
    const match = /^--limit=(\d+)$/.exec(arg);
    if (match) return Number(match[1]);
  }
  return Number.MAX_SAFE_INTEGER;
}

async function main(): Promise<void> {
  const limit = parseLimit(process.argv.slice(2));
  const env = loadEnv(workerEnvSchema);
  const ctx = buildWorkerContext(env);

  // The home page's curated lists are seeded too: otherwise a fresh install shows an almost empty
  // "Books of the year" until enough people happen to visit for the lazy backfill to catch up.
  const featuredQueries = FEATURED_BOOKS.map((book) => `${book.title} ${book.author}`);
  const allQueries = [...new Set([...CATALOG_SEED_QUERIES, ...featuredQueries])];
  const queries = allQueries.slice(0, limit);
  let synced = 0;
  let failed = 0;

  for (const [index, query] of queries.entries()) {
    process.stdout.write(`[${index + 1}/${queries.length}] ${query} … `);
    // Sources are external and slow — a failed book is reported and skipped, never fatal to the
    // rest of the seed. Re-running the command retries only what's needed (idempotent writes).
    const result = await ctx.syncWorkFromSource.execute({ source: 'open-library', query });
    if (result.status === 'synced') {
      synced += 1;
      // Gutenberg is synced too, not instead: Open Library brings the translations, editions and
      // borrow links, Gutenberg brings actual downloadable files for whatever is public domain.
      // Failing to find it there is normal (most books are in copyright) and never fatal.
      const gutenberg = await ctx.syncWorkFromSource.execute({ source: 'gutenberg', query });
      const downloads = gutenberg.status === 'synced' ? (gutenberg.linksSynced ?? 0) : 0;
      console.log(
        `ok (${result.editionsSynced} editions, ${result.linksSynced} links` +
          (downloads > 0 ? `, ${downloads} downloadable formats` : '') +
          ')',
      );
    } else {
      failed += 1;
      console.log(result.status === 'error' ? `error: ${result.error}` : 'not found');
    }
  }

  console.log(`\nSeed catalog done: ${synced} synced, ${failed} failed/not found.`);
  if (failed > 0) {
    console.log('Re-run `pnpm db:seed:catalog` to retry the failed ones — writes are idempotent.');
  }
  await ctx.close();
  process.exitCode = synced > 0 ? 0 : 1;
}

main().catch((error: unknown) => {
  console.error('db:seed:catalog failed:', error);
  process.exitCode = 1;
});
