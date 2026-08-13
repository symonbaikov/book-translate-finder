import { InvalidInputError } from '../errors/domain-error.js';
import { computeWorkNaturalKey } from '../normalization/natural-key.js';
import type { LanguageCode } from '../value-objects/language-code.js';

export interface CreateWorkParams {
  id: string;
  originalTitle: string;
  originalLanguage: LanguageCode;
  author: string;
  firstPublishedYear: number | null;
  /** Work-level blurb from the source, when it has one — display-only, never part of identity. */
  description?: string | null;
  /** Cover image URL from the source, when it has one — display-only, never part of identity. */
  coverUrl?: string | null;
  syncedAt: Date;
}

/**
 * Immutable — every "change" method returns a new instance, there are no setters
 * (docs/rules.md §3). `id` and `syncedAt` are supplied by the caller (via the `IdGenerator` and
 * `Clock` ports), never generated here — domain code must stay deterministic and testable
 * without touching real time or randomness.
 */
export class Work {
  private constructor(
    readonly id: string,
    readonly originalTitle: string,
    readonly originalLanguage: LanguageCode,
    readonly author: string,
    readonly firstPublishedYear: number | null,
    readonly description: string | null,
    readonly coverUrl: string | null,
    readonly naturalKey: string,
    readonly syncedAt: Date,
  ) {}

  static create(params: CreateWorkParams): Work {
    const title = params.originalTitle.trim();
    const author = params.author.trim();
    if (!title) throw new InvalidInputError('Work.originalTitle must not be empty');
    if (!author) throw new InvalidInputError('Work.author must not be empty');
    if (params.firstPublishedYear !== null && !Number.isInteger(params.firstPublishedYear)) {
      throw new InvalidInputError('Work.firstPublishedYear must be an integer or null');
    }

    return new Work(
      params.id,
      title,
      params.originalLanguage,
      author,
      params.firstPublishedYear,
      params.description?.trim() || null,
      params.coverUrl?.trim() || null,
      computeWorkNaturalKey(title, author),
      params.syncedAt,
    );
  }

  /** Returns a new `Work` with `syncedAt` bumped — everything else stays the same. */
  withSyncedAt(syncedAt: Date): Work {
    return new Work(
      this.id,
      this.originalTitle,
      this.originalLanguage,
      this.author,
      this.firstPublishedYear,
      this.description,
      this.coverUrl,
      this.naturalKey,
      syncedAt,
    );
  }
}
