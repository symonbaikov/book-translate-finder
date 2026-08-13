import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';
import * as schema from './schema.js';

export type Db = PostgresJsDatabase<typeof schema>;

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
