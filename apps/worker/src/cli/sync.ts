// `pnpm sync -- --source=<name> --work=<workId>` (documented in CLAUDE.md) — a manual,
// synchronous one-off sync for local debugging, distinct from the BullMQ `sync` queue consumer
// in main.ts. Runs `SyncWorkFromSource` directly against the already-known work's title+author
// (same trick `RefreshStaleWorks` uses), prints the result, and exits — no queue involved.
import { loadEnv } from '@golden/infrastructure';
import { buildWorkerContext } from '../composition-root.js';
import { workerEnvSchema } from '../config/worker-env.schema.js';

function parseArgs(argv: string[]): { source: string; workId: string } {
  const flags = new Map<string, string>();
  for (const arg of argv) {
    const match = /^--([a-z]+)=(.+)$/.exec(arg);
    if (match) flags.set(match[1]!, match[2]!);
  }
  const source = flags.get('source');
  const workId = flags.get('work');
  if (!source || !workId) {
    throw new Error('Usage: pnpm sync -- --source=<name> --work=<workId>');
  }
  return { source, workId };
}

async function main(): Promise<void> {
  const { source, workId } = parseArgs(process.argv.slice(2));
  const env = loadEnv(workerEnvSchema);
  const ctx = buildWorkerContext(env);

  const work = await ctx.workRepository.findById(workId);
  if (!work) {
    console.error(`No work with id ${workId}`);
    await ctx.close();
    process.exitCode = 1;
    return;
  }

  const query = `${work.originalTitle} ${work.author}`;
  const result = await ctx.syncWorkFromSource.execute({ source, query });

  console.log(JSON.stringify(result, null, 2));
  await ctx.close();
  process.exitCode = result.status === 'error' ? 1 : 0;
}

main().catch((error: unknown) => {
  console.error('pnpm sync failed:', error);
  process.exitCode = 1;
});
