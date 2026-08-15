import type {
  AuthorizedFreeBook,
  BookMetadataProvider,
  ProviderEdition,
  ProviderWork,
  ProviderWorkDetails,
  SearchQuery,
} from '@golden/domain';
import { AUTHORIZED_FREE_BOOKS, findAuthorizedFreeBooks, ProviderId } from '@golden/domain';

function mapToWork(book: AuthorizedFreeBook): ProviderWork {
  return {
    externalId: book.id,
    title: book.title,
    authorNames: [book.author],
    languages: [book.language],
    firstPublishedYear: null, // The catalog records permission, not bibliography.
    editionCount: 1,
    coverUrl: null,
  };
}

/**
 * docs/architecture.md §2.2 `BookMetadataProvider` over the hand-curated catalog of books their
 * rights holder publishes for free (`authorized-free-catalog.ts`, ADR-0004).
 *
 * The odd one out among providers: it makes no network request at all. It is still a provider
 * rather than a special case in a use case, because that keeps one rule true — every link in the
 * database arrived through a source adapter and `LinkPolicy`, with no privileged path around it.
 *
 * Links are `open_license`, never `public_domain`: these books are in copyright and free only
 * because the author or publisher said so. If that permission is ever withdrawn, the entry is
 * removed and the link disappears on the next sync — which is exactly why the catalog stores the
 * authorization page and the date a human last read it.
 */
export class AuthorizedFreeProvider implements BookMetadataProvider {
  readonly id = ProviderId.create('authorized-free');

  async searchWorks(query: SearchQuery): Promise<ProviderWork[]> {
    return findAuthorizedFreeBooks(query.text)
      .slice(0, query.limit ?? 5)
      .map(mapToWork);
  }

  async fetchEditions(externalWorkId: string): Promise<ProviderEdition[]> {
    const book = AUTHORIZED_FREE_BOOKS.find((entry) => entry.id === externalWorkId);
    if (!book) return [];

    return [
      {
        externalId: book.id,
        title: book.title,
        language: book.language,
        coverUrl: null,
        translator: null,
        translatedFrom: null,
        // The rights holder's own page is the "publisher" of this particular free copy; naming a
        // print publisher here would claim something the catalog does not know.
        publisher: null,
        year: null,
        isbn13: null,
        isbn10: null,
        rightsSignal: 'open_license',
        links: book.downloads.map((download) => ({
          type: 'download' as const,
          url: download.url,
          format: download.format,
        })),
      },
    ];
  }

  async fetchWorkDetails(_externalWorkId: string): Promise<ProviderWorkDetails> {
    // No blurb and no cover in the catalog — returning nulls leaves both to a source that has
    // real bibliographic data (docs/architecture.md §5 field-conflict resolution).
    return { description: null, coverUrl: null };
  }
}
