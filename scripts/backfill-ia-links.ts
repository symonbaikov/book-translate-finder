#!/usr/bin/env node

/**
 * Backfill script that fills in the `format` column for existing Internet Archive
 * source_link rows that don't have one yet.
 *
 * The IA identifier and URL are already stored on each row (from a normal sync) — no
 * search or matching is needed. This just re-fetches metadata for the IA identifier
 * already on the row and parses the file formats out of it.
 *
 * Usage:
 *   pnpm tsx scripts/backfill-ia-links.ts
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { and, eq, isNull } from 'drizzle-orm';
import * as schema from '../packages/infrastructure/src/db/schema.js';

const API_DELAY_MS = 100; // Rate limit against archive.org

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractIAIdentifier(url: string): string | null {
  const match = url.match(/archive\.org\/(?:details|download|stream)\/([^/?]+)/);
  return match?.[1] ?? null;
}

function parseIAFormats(files: Array<{ name: string; format?: string }> | undefined): string[] {
  if (!files) return [];

  const formats = new Set<string>();
  const formatRegex = /\.([a-z0-9]+)$/i;

  for (const file of files) {
    if (file.format) {
      formats.add(file.format.toLowerCase());
    } else {
      const match = file.name.match(formatRegex);
      if (match?.[1]) {
        const ext = match[1].toLowerCase();
        if (!['xml', 'json', 'pdf_bak', 'orig', 'old'].includes(ext)) {
          formats.add(ext);
        }
      }
    }
  }

  const priorityOrder = ['pdf', 'epub', 'mobi', 'txt', 'html', 'djvu'];
  return [
    ...priorityOrder.filter((f) => formats.has(f)),
    ...Array.from(formats)
      .filter((f) => !priorityOrder.includes(f))
      .sort(),
  ];
}

async function fetchIAFormats(iaIdentifier: string): Promise<string[]> {
  await delay(API_DELAY_MS);

  try {
    const url = `https://archive.org/metadata/${iaIdentifier}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Golden Library/1.0)' },
    });

    if (!res.ok) return [];

    const data = (await res.json()) as { files?: Array<{ name: string; format?: string }> };
    return parseIAFormats(data.files);
  } catch (error) {
    console.error(`IA metadata error for ${iaIdentifier}:`, error);
    return [];
  }
}

async function main() {
  const client = postgres(process.env.DATABASE_URL || 'postgres://localhost:5432/golden');
  const db = drizzle(client);

  console.log('Backfilling format for existing Internet Archive links...');

  try {
    const rows = await db
      .select({
        id: schema.sourceLink.id,
        url: schema.sourceLink.url,
      })
      .from(schema.sourceLink)
      .where(
        and(eq(schema.sourceLink.provider, 'internet-archive'), isNull(schema.sourceLink.format)),
      );

    console.log(`Found ${rows.length} internet-archive links without a format`);

    let updatedCount = 0;

    for (const [index, row] of rows.entries()) {
      process.stdout.write(`\rProcessing ${index + 1}/${rows.length}...`);

      const iaId = extractIAIdentifier(row.url);
      if (!iaId) continue;

      const formats = await fetchIAFormats(iaId);
      if (formats.length === 0) continue;

      await db
        .update(schema.sourceLink)
        .set({ format: formats[0] })
        .where(eq(schema.sourceLink.id, row.id));

      updatedCount++;
    }

    console.log(`\n\nCompleted! Updated format on ${updatedCount}/${rows.length} links`);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
