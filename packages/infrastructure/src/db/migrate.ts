import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { z } from 'zod';
import { loadEnv } from '../config/base-env.schema.js';
import { createDb } from './client.js';

// Deliberately its own tiny env schema, not the full baseEnvSchema — this script only needs
// DATABASE_URL, and requiring REDIS_URL/CONTACT_URL here would make `pnpm db:migrate` fail for
// a reason that has nothing to do with migrations (docs/rules.md §3 fail-fast, but scoped to
// what THIS process actually touches).
const migrateEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
});

async function main(): Promise<void> {
  const env = loadEnv(migrateEnvSchema);
  const { db, close } = createDb(env.DATABASE_URL);

  try {
    await migrate(db, { migrationsFolder: new URL('../../drizzle', import.meta.url).pathname });
    console.log('Migrations applied.');
  } finally {
    await close();
  }
}

main().catch((error: unknown) => {
  console.error('Migration failed:', error);
  process.exitCode = 1;
});
