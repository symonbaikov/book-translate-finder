#!/usr/bin/env node

/**
 * Батч-скрипт для добавления ссылок на скачивание из Internet Archive
 * для всех изданий в БД, которые их еще не имеют.
 *
 * Использование:
 *   pnpm tsx scripts/backfill-ia-links.ts
 *
 * Логика:
 * 1. Получаем все издания из БД
 * 2. Для каждого издания ищем соответствующий документ на IA
 * 3. Если найдем, добавляем ссылку на скачивание с форматом
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { and, eq, isNull } from 'drizzle-orm';
import * as schema from '../packages/infrastructure/src/db/schema.js';
import { crypto } from 'node:crypto';

interface IASearchResult {
  key: string;
  title: string;
  author_name?: string[];
  isbn?: string[];
  ia?: string[];
}

interface IAMetadata {
  files?: Array<{ name: string; format?: string }>;
}

const BATCH_SIZE = 10;
const API_DELAY_MS = 100; // Задержка между запросами к IA API
let requestCount = 0;

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
        if (!['xml', 'json', 'txt', 'pdf_bak', 'orig', 'old'].includes(ext)) {
          formats.add(ext);
        }
      }
    }
  }

  const priorityOrder = ['pdf', 'epub', 'mobi', 'txt', 'html', 'djvu'];
  const sorted = [
    ...priorityOrder.filter((f) => formats.has(f)),
    ...Array.from(formats)
      .filter((f) => !priorityOrder.includes(f))
      .sort(),
  ];

  return sorted;
}

async function searchOpenLibrary(
  isbn?: string,
  title?: string,
  author?: string,
): Promise<string | null> {
  if (!isbn && !title) return null;

  await delay(API_DELAY_MS);
  requestCount++;

  try {
    const searchTerm = isbn ? `isbn:"${isbn}"` : `"${title}" ${author || ''}`.trim();
    const url = new URL('https://openlibrary.org/search.json');
    url.searchParams.set('q', searchTerm);
    url.searchParams.set('fields', 'key,ia');
    url.searchParams.set('limit', '1');

    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Golden Library/1.0)' },
    });

    if (!res.ok) return null;

    interface OLResponse {
      docs?: Array<{ ia?: string[] }>;
    }
    const data = (await res.json()) as OLResponse;
    const iaIds = data.docs?.[0]?.ia;
    return iaIds?.[0] ?? null;
  } catch (error) {
    console.error('OL search error:', error);
    return null;
  }
}

async function fetchIAFormats(iaIdentifier: string): Promise<string[]> {
  await delay(API_DELAY_MS);
  requestCount++;

  try {
    const url = `https://archive.org/metadata/${iaIdentifier}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Golden Library/1.0)' },
    });

    if (!res.ok) return [];

    const data = (await res.json()) as IAMetadata;
    return parseIAFormats(data.files);
  } catch (error) {
    console.error('IA metadata error:', error);
    return [];
  }
}

function hashUrl(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex').slice(0, 64);
}

async function main() {
  const client = postgres(process.env.DATABASE_URL || 'postgres://localhost:5432/golden');
  const db = drizzle(client);

  console.log('Starting Internet Archive link backfill...');

  try {
    // Получаем все издания без ссылок на скачивание
    const editions = await db
      .select({
        id: schema.edition.id,
        workId: schema.edition.workId,
        title: schema.edition.title,
        isbn13: schema.edition.isbn13,
      })
      .from(schema.edition)
      .leftJoin(
        schema.sourceLink,
        and(
          eq(schema.sourceLink.editionId, schema.edition.id),
          eq(schema.sourceLink.type, 'download'),
        ),
      )
      .where(isNull(schema.sourceLink.id));

    console.log(`Found ${editions.length} editions without download links`);

    // Получаем информацию о работах для поиска
    const works = await db.select().from(schema.work);
    const workMap = new Map(works.map((w) => [w.id, w]));

    let addedCount = 0;
    let processedCount = 0;

    for (const editionRow of editions) {
      const edition = editionRow.edition;
      if (!edition) continue;

      processedCount++;
      const work = workMap.get(edition.workId);
      if (!work) continue;

      process.stdout.write(`\rProcessing ${processedCount}/${editions.length}...`);

      // Ищем на Open Library
      const iaId = await searchOpenLibrary(edition.isbn13 ?? undefined, edition.title, work.author);

      if (!iaId) continue;

      // Получаем форматы
      const formats = await fetchIAFormats(iaId);
      if (formats.length === 0) continue;

      // Добавляем ссылку
      const url = `https://archive.org/details/${iaId}`;
      const urlHash = hashUrl(url);

      try {
        await db
          .insert(schema.sourceLink)
          .values({
            id: `backfill-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            editionId: edition.id,
            type: 'download',
            url,
            urlHash,
            provider: 'internet-archive',
            rightsStatus: 'public_domain',
            isLegalFree: true,
            format: formats[0],
            verifiedAt: new Date(),
          })
          .onConflictDoNothing();

        addedCount++;
      } catch (error) {
        if (!(error instanceof Error && error.message.includes('duplicate'))) {
          console.error(`Error adding link for edition ${edition.id}:`, error);
        }
      }
    }

    console.log(
      `\n\nCompleted! Added ${addedCount} download links from ${editions.length} editions`,
    );
    console.log(`Total API requests: ${requestCount}`);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
