import { InvalidInputError } from '../errors/domain-error.js';
import { computeEditionNaturalKey } from '../normalization/natural-key.js';
import type { Isbn } from '../value-objects/isbn.js';
import type { LanguageCode } from '../value-objects/language-code.js';

export interface CreateEditionParams {
  id: string;
  workId: string;
  title: string;
  language: LanguageCode;
  translator?: string | null;
  /**
   * The language this specific edition was translated from, when the source states it
   * (Open Library's `translated_from`). Phase 0 research found this is a stronger, more common
   * signal than a named translator — populated on 16.4% of editions vs. 12.2% with a named
   * translator (docs/research/coverage-phase0.md) — so it's tracked independently, not merely
   * derived from `translator`.
   */
  translatedFrom?: LanguageCode | null;
  publisher?: string | null;
  year?: number | null;
  isbn?: Isbn | null;
}

/** Immutable, same rationale as `Work` (docs/rules.md §3). */
export class Edition {
  private constructor(
    readonly id: string,
    readonly workId: string,
    readonly title: string,
    readonly language: LanguageCode,
    readonly translator: string | null,
    readonly translatedFrom: LanguageCode | null,
    readonly publisher: string | null,
    readonly year: number | null,
    readonly isbn: Isbn | null,
    readonly naturalKey: string,
  ) {}

  static create(params: CreateEditionParams): Edition {
    const title = params.title.trim();
    if (!title) throw new InvalidInputError('Edition.title must not be empty');
    if (!params.workId.trim()) throw new InvalidInputError('Edition.workId must not be empty');
    if (params.year != null && !Number.isInteger(params.year)) {
      throw new InvalidInputError('Edition.year must be an integer or null');
    }

    const translator = params.translator?.trim() || null;
    const translatedFrom = params.translatedFrom ?? null;
    const publisher = params.publisher?.trim() || null;
    const year = params.year ?? null;
    const isbn = params.isbn ?? null;

    const naturalKey = computeEditionNaturalKey(
      { workId: params.workId, language: params.language.value, publisher, year, title },
      isbn?.value,
    );

    return new Edition(
      params.id,
      params.workId,
      title,
      params.language,
      translator,
      translatedFrom,
      publisher,
      year,
      isbn,
      naturalKey,
    );
  }

  /** True when either signal (a named translator or a stated source language) marks this a translation. */
  get isTranslation(): boolean {
    return this.translator !== null || this.translatedFrom !== null;
  }
}
