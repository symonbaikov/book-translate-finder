import { fileURLToPath } from 'node:url';
import { LANGUAGE_NAMES } from '@golden/domain';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { createDb, type DbHandle } from '../../src/db/client.js';
import { language } from '../../src/db/schema.js';

const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url));

export interface TestDb extends DbHandle {
  container: StartedPostgreSqlContainer;
  /** Clears every table except `language` (reference data, seeded once) between tests. */
  truncateAll: () => Promise<void>;
}

/**
 * One real, migrated, language-seeded Postgres per integration test FILE (not per test — that
 * would make container startup dominate the run). Each contract-suite `it()` gets isolation via
 * `truncateAll()` in a `beforeEach`, not a fresh container.
 */
export async function setupTestDb(): Promise<TestDb> {
  const container = await new PostgreSqlContainer('postgres:16-alpine').start();
  const handle = createDb(container.getConnectionUri());

  await migrate(handle.db, { migrationsFolder });

  const languageRows = [...LANGUAGE_NAMES.entries()].map(([code, names]) => ({
    code,
    nameRu: names.nameRu,
    nameEn: names.nameEn,
  }));
  await handle.db.insert(language).values(languageRows);

  const truncateAll = async (): Promise<void> => {
    await handle.client`
      TRUNCATE TABLE work, edition, source_link, external_ref, sync_log, idempotency_key
      RESTART IDENTITY CASCADE
    `;
  };

  return { ...handle, container, truncateAll };
}

export async function teardownTestDb(testDb: TestDb): Promise<void> {
  await testDb.close();
  await testDb.container.stop();
}
