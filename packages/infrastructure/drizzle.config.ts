import { defineConfig } from 'drizzle-kit';

// `db:generate` (schema diffing) doesn't need a live connection, but drizzle-kit still wants
// `dbCredentials` structurally present — a placeholder is fine here; `db:migrate` uses the real
// validated DATABASE_URL from src/db/migrate.ts, not this file.
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ?? 'postgres://placeholder:placeholder@localhost:5432/placeholder',
  },
});
