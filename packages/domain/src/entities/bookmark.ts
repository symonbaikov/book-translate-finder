export interface CreateBookmarkParams {
  userId: string;
  workId: string;
  createdAt: Date;
}

/**
 * A saved book.
 *
 * Its identity is `(userId, workId)` rather than a generated id — that is what makes saving
 * idempotent for free (docs/rules.md §2.2). Clicking "save" twice, or a retried request, cannot
 * produce two rows, so there is no de-duplication logic anywhere above this.
 *
 * It points at a *work*, not an edition: a reader saves "I want to read this book", and which
 * printing they eventually pick is the decision the card exists to help them make.
 */
export class Bookmark {
  private constructor(
    readonly userId: string,
    readonly workId: string,
    readonly createdAt: Date,
  ) {}

  static create(params: CreateBookmarkParams): Bookmark {
    return new Bookmark(params.userId, params.workId, params.createdAt);
  }
}
