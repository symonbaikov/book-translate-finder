import {
  FEATURED_BOOKS,
  literatureSubjectFor,
  normalizeText,
  type CachePort,
  type FeaturedList,
  type JobQueuePort,
  type SourceLinkRepository,
  type EditionRepository,
  type SubjectBrowsePort,
  type SubjectSourcePort,
  type WorkRepository,
  type WorkSearchHit,
  type WorkSearchPort,
} from '@golden/domain';
import type { UseCase } from '../use-case.js';
import { CACHE_KEY_VERSION } from '../cache-key-version.js';
import { backfillJobId } from '../backfill-job-id.js';

const FEATURED_TTL_SECONDS = 30 * 60;
/**
 * How many unknown featured books one request may queue. The home page is the most-hit route on
 * the instance, and without a ceiling a cold database would enqueue the whole list on every
 * request until the first one lands.
 */
const MAX_BACKFILL_PER_REQUEST = 10;
/**
 * While entries are still resolving, the answer is worth re-computing often — a reader who comes
 * back in a minute should see a longer list, not a half-empty one cached for half an hour.
 */
const FILLING_TTL_SECONDS = 60;
/** One row of covers on the home page — this is a doorway into the language, not a catalogue. */
const IN_LANGUAGE_LIMIT = 12;
/** Below this the row looks broken rather than curated, so it is worth going out to fetch. */
const IN_LANGUAGE_THIN_THRESHOLD = 6;
/** Open Library orders a subject by edition count, so the first twenty are the best-known ones. */
const IN_LANGUAGE_FETCH_LIMIT = 20;

/**
 * The reader's own language gets its own list, and it is not a slice of the curated one: that
 * catalogue is Anglophone by construction, so filtering it by language would answer "books in
 * Russian" with an empty grid. See `LITERATURE_SUBJECT_BY_LANGUAGE`.
 */
export type FeaturedListId = FeaturedList | 'in-language';

export interface FeaturedBookDto {
  workId: string;
  title: string;
  author: string;
  /** Null in the language list: it is ordered by how often a book was published, not by year. */
  year: number | null;
  coverUrl: string | null;
  list: FeaturedListId;
  /** True when at least one legal free copy exists — the badge that makes a card worth clicking. */
  hasFreeCopy: boolean;
}

export interface GetFeaturedBooksInput {
  /** The reader's language, when they have chosen one. */
  language?: string | undefined;
}

export interface GetFeaturedBooksOutput {
  books: FeaturedBookDto[];
  /** True while some entries are still being fetched, so the page can say so instead of lying. */
  filling: boolean;
  /** The language the `in-language` list is in, or null when there is no such list. */
  language: string | null;
}

export interface GetFeaturedBooksDeps {
  workRepository: WorkRepository;
  /** Fuzzy matching, because sources spell names their own way — see `matchFeatured`. */
  workSearch: WorkSearchPort;
  editionRepository: EditionRepository;
  sourceLinkRepository: SourceLinkRepository;
  cache: CachePort;
  backfillQueue: JobQueuePort;
  /** The reader's-language list is the same query the genre pages run, with a literature subject. */
  subjectBrowse: SubjectBrowsePort;
  /** Absent on an instance with no subject-capable source; the list then shows what it knows. */
  subjectSource?: SubjectSourcePort | undefined;
}

export function featuredCacheKey(language?: string | undefined): string {
  const base = `${CACHE_KEY_VERSION}:featured`;
  return language ? `${base}:${language}` : base;
}

/**
 * The home page's book lists (docs/plan.md Phase 4.6).
 *
 * The catalogue is curated (`featured-books-catalog.ts`); this resolves it against whatever the
 * instance actually knows. A fresh install knows nothing, so unresolved entries are queued on the
 * same lazy-backfill queue that search uses (ADR-0003) and appear on a later visit — which is why
 * the home page of a brand-new instance fills itself in over the first few minutes instead of
 * being permanently empty or demanding a seed step.
 *
 * Only books that resolved are returned. Showing a title the instance cannot open would be a card
 * that goes nowhere.
 */
export class GetFeaturedBooks implements UseCase<GetFeaturedBooksInput, GetFeaturedBooksOutput> {
  constructor(private readonly deps: GetFeaturedBooksDeps) {}

  async execute(input: GetFeaturedBooksInput = {}): Promise<GetFeaturedBooksOutput> {
    const language = input.language?.trim().toLowerCase() || undefined;
    const cached = await this.deps.cache.get<GetFeaturedBooksOutput>(featuredCacheKey(language));
    if (cached) return cached;

    const books: FeaturedBookDto[] = [];
    const missing: string[] = [];
    // Two curated entries can resolve to the same work — an author appearing in both lists, or
    // two spellings of one title — and the same cover twice on one page reads as a bug.
    const claimed = new Set<string>();

    for (const featured of FEATURED_BOOKS) {
      const hits = await this.deps.workSearch.search(`${featured.title} ${featured.author}`, 5);
      const match = matchFeatured(featured, hits);
      if (!match) {
        missing.push(`${featured.title} ${featured.author}`);
        continue;
      }
      if (claimed.has(match.id)) continue;
      claimed.add(match.id);

      books.push({
        workId: match.id,
        title: match.originalTitle,
        author: match.author,
        year: featured.year,
        coverUrl: match.coverUrl,
        list: featured.list,
        hasFreeCopy: await this.hasFreeCopy(match.id),
      });
    }

    // The reader's own language goes first in the list, and the page renders it first: someone who
    // set the interface to Russian is telling us what they read, not only what to label buttons.
    const inLanguage = language ? await this.booksInLanguage(language) : { books: [], thin: false };
    books.unshift(...inLanguage.books);

    for (const query of missing.slice(0, MAX_BACKFILL_PER_REQUEST)) {
      // Same deterministic job id shape as search's backfill, so the queue collapses repeats
      // rather than piling up one job per home-page view. `deferred`: the home page has already
      // rendered without these books, so they must never delay a reader's own search.
      await this.deps.backfillQueue.enqueue(
        backfillJobId('backfill-featured', query),
        { query },
        { priority: 'deferred' },
      );
    }

    const output: GetFeaturedBooksOutput = {
      books,
      filling: missing.length > 0 || inLanguage.thin,
      language: language && literatureSubjectFor(language) ? language : null,
    };
    await this.deps.cache.set(
      featuredCacheKey(language),
      output,
      output.filling ? FILLING_TTL_SECONDS : FEATURED_TTL_SECONDS,
    );
    return output;
  }

  /**
   * Books written in the reader's language, most-published first.
   *
   * The same query the genre pages run (`BrowseBySubject`), pointed at a literature subject — so a
   * Russian reader gets *Анна Каренина* and *Преступление и наказание* rather than the English
   * novels that happen to have a Russian edition. Ordering is Open Library's edition count, the
   * one popularity signal open data actually provides and a fact rather than a ranking this
   * project invented (see `PgSubjectBrowseAdapter.browseBySubject`).
   *
   * A thin result queues the subject's top works through the ordinary backfill, exactly as a cold
   * genre page does (ADR-0003), and the list fills itself in over the next few minutes.
   */
  private async booksInLanguage(
    language: string,
  ): Promise<{ books: FeaturedBookDto[]; thin: boolean }> {
    const subject = literatureSubjectFor(language);
    if (!subject) return { books: [], thin: false };

    const hits = await this.deps.subjectBrowse.browseBySubject({
      subject,
      language,
      limit: IN_LANGUAGE_LIMIT,
    });

    const books: FeaturedBookDto[] = [];
    for (const hit of hits) {
      books.push({
        workId: hit.id,
        title: hit.originalTitle,
        author: hit.author,
        year: hit.firstPublishedYear,
        coverUrl: hit.coverUrl,
        list: 'in-language',
        hasFreeCopy: await this.hasFreeCopy(hit.id),
      });
    }

    const thin = books.length < IN_LANGUAGE_THIN_THRESHOLD;
    if (thin) await this.requestMoreInLanguage(subject);
    return { books, thin };
  }

  /** Every failure is swallowed: a language section that cannot be enriched is thinner, not broken. */
  private async requestMoreInLanguage(subject: string): Promise<void> {
    const { subjectSource, backfillQueue } = this.deps;
    if (!subjectSource) return;

    try {
      const works = await subjectSource.fetchWorksForSubject(subject, IN_LANGUAGE_FETCH_LIMIT);
      for (const work of works) {
        const query = `${work.title} ${work.author}`;
        await backfillQueue.enqueue(
          backfillJobId('backfill-subject', query),
          { query },
          { priority: 'deferred' },
        );
      }
    } catch {
      // Intentionally ignored — see the doc comment.
    }
  }

  private async hasFreeCopy(workId: string): Promise<boolean> {
    const editions = await this.deps.editionRepository.findByWorkId(workId);
    for (const edition of editions) {
      const links = await this.deps.sourceLinkRepository.findByEditionId(edition.id);
      if (links.some((link) => link.isLegalFree)) return true;
    }
    return false;
  }
}

/**
 * Decides whether a search hit really is the curated book.
 *
 * An exact natural-key lookup was tried first and was too brittle: sources spell an author their
 * own way, so *James* came back under "Percival L. Everett" and never matched "Percival Everett".
 * Loosening it to "best search hit" is worse in the other direction — searching for *Hamnet*
 * returns "Summary of Hamnet by Maggie O'Farrell" by a different author, and putting a study
 * guide on the home page under the novel's name is a lie the page tells confidently.
 *
 * So both halves must agree: the title normalizes to exactly the curated title, and the hit's
 * author shares a significant word with the curated author. That admits "Percival L. Everett" and
 * rejects the summary.
 */
function matchFeatured(
  featured: { title: string; author: string },
  hits: readonly WorkSearchHit[],
): WorkSearchHit | null {
  const wantedTitle = normalizeText(featured.title);
  // Short words are dropped: initials and particles ("de", "van") identify nobody.
  const wantedAuthorWords = new Set(
    normalizeText(featured.author)
      .split(' ')
      .filter((word) => word.length > 2),
  );

  return (
    hits.find((hit) => {
      if (normalizeText(hit.originalTitle) !== wantedTitle) return false;
      return normalizeText(hit.author)
        .split(' ')
        .some((word) => word.length > 2 && wantedAuthorWords.has(word));
    }) ?? null
  );
}
