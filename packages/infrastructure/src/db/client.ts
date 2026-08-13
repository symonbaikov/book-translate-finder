import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';
import * as schema from './schema.js';

export type Db = PostgresJsDatabase<typeof schema>;

/**
 * The handle Drizzle passes into `db.transaction(async (tx) => {...})` — structurally
 * compatible with `Db` for every query-builder method repositories use (select/insert/update/
 * delete), so repositories can accept either without casting. `PgUnitOfWork` (pg-unit-of-work.ts)
 * and the transaction-context module are what make repository calls inside `work()` route
 * through the same `tx`, giving real cross-repository atomicity (docs/rules.md §2.3).
 */
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
export type Queryable = Db | Tx;

export interface DbHandle {
  db: Db;
  client: Sql;
  close: () => Promise<void>;
}

/** One connection pool per process — callers (apps/api, apps/worker) create this once at boot. */
export function createDb(databaseUrl: string): DbHandle {
  const client = postgres(databaseUrl);
  const db = drizzle(client, { schema });
  return { db, client, close: () => client.end() };
}
