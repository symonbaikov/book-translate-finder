/**
 * Measures what Wikidata alone knows about a book's translation languages, through the real
 * adapter rather than around it — so the number is what the application would actually get.
 *
 * Run: pnpm tsx scripts/measure-wikidata-languages.ts
 */
import { createResilientFetcher } from '../packages/infrastructure/src/http/resilient-fetch.js';
import { WikidataProvider } from '../packages/infrastructure/src/providers/wikidata-provider.js';

class NoCache {
  async get<T>(): Promise<T | null> {
    return null;
  }
  async set(): Promise<void> {}
  async del(): Promise<void> {}
  async deleteByPrefix(): Promise<void> {}
}

const BOOKS = [
  "Harry Potter and the Philosopher's Stone Rowling",
  'The Little Prince Saint-Exupery',
  'Nineteen Eighty-Four Orwell',
  'Метро 2033 Глуховский',
  'Dracula Bram Stoker',
];

const fetcher = createResilientFetcher({ timeoutMs: 30_000 });
const provider = new WikidataProvider(fetcher, new NoCache(), 'golden-library-measurement/0.1');

async function main(): Promise<void> {
  for (const query of BOOKS) {
    try {
      const [work] = await provider.searchWorks({ text: query, limit: 1 });
      if (!work) {
        console.log(`${query}\n  → not found on Wikidata\n`);
        continue;
      }
      const editions = await provider.fetchEditions(work.externalId);
      const languages = [...new Set(editions.map((edition) => edition.language))].sort();
      console.log(
        `${query}\n  → ${work.title} (${work.externalId}) by ${work.authorNames.join(', ')}\n` +
          `    editions=${editions.length} languages=${languages.length} [${languages.join(',')}]\n`,
      );
    } catch (error) {
      console.log(`${query}\n  → error: ${(error as Error).message}\n`);
    }
  }
}

void main();
