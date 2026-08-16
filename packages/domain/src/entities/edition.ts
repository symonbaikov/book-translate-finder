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
  /** Cover image URL from the source, when it has one — display-only, never part of the natural key. */
  coverUrl?: string | null;
  /** Printed page count, when the source states one. Not part of the natural key: two records of
   * the same edition often disagree by a page or two, and that must not split them in two. */
  pages?: number | null;
  /** Physical format as the source words it ("Paperback", "Hardcover", "Mass Market Paperback").
   * Kept verbatim rather than mapped to an enum — sources use dozens of spellings, and inventing
   * a taxonomy would mean guessing which bucket an unfamiliar one belongs in. */
  binding?: string | null;
  /**
   * How this printing differs from the others, as the catalogue states it: "First edition",
   * "Limited ed., signed", "Izd. 2-e, ispr. i dop.".
   *
   * Deliberately *not* part of the natural key. Two catalogues describing the same printing will
   * word this differently or leave it out entirely — the DNB records "Erstveröffentlichung" where
   * the Library of Congress records nothing — and keying on it would split one edition into
   * several. Publisher, year, language and title already identify the printing; this only says
   * what kind of printing it is.
   */
  editionStatement?: string | null;
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
    readonly coverUrl: string | null,
    readonly pages: number | null,
    readonly binding: string | null,
    readonly editionStatement: string | null,
    readonly naturalKey: string,
  ) {}

  static create(params: CreateEditionParams): Edition {
    const title = params.title.trim();
    if (!title) throw new InvalidInputError('Edition.title must not be empty');
    if (!params.workId.trim()) throw new InvalidInputError('Edition.workId must not be empty');
    if (params.year != null && !Number.isInteger(params.year)) {
      throw new InvalidInputError('Edition.year must be an integer or null');
    }
    if (params.pages != null && (!Number.isInteger(params.pages) || params.pages <= 0)) {
      throw new InvalidInputError('Edition.pages must be a positive integer or null');
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
      params.coverUrl?.trim() || null,
      params.pages ?? null,
      params.binding?.trim() || null,
      params.editionStatement?.trim() || null,
      naturalKey,
    );
  }

  /** True when either signal (a named translator or a stated source language) marks this a translation. */
  get isTranslation(): boolean {
    return this.translator !== null || this.translatedFrom !== null;
  }
}
