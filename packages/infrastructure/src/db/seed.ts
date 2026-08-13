import { LANGUAGE_NAMES } from '@btf/domain';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { loadEnv } from '../config/base-env.schema.js';
import { createDb } from './client.js';
import { language } from './schema.js';

const seedEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
});

async function main(): Promise<void> {
  const env = loadEnv(seedEnvSchema);
  const { db, close } = createDb(env.DATABASE_URL);

  try {
    const rows = [...LANGUAGE_NAMES.entries()].map(([code, names]) => ({
      code,
      nameRu: names.nameRu,
      nameEn: names.nameEn,
    }));

    await db
      .insert(language)
      .values(rows)
      .onConflictDoUpdate({
        target: language.code,
        set: { nameRu: sql`excluded.name_ru`, nameEn: sql`excluded.name_en` },
      });

    console.log(`Seeded ${rows.length} languages.`);
  } finally {
    await close();
  }
}

main().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
});
