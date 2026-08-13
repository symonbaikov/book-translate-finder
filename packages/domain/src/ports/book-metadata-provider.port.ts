import type { LinkType } from '../value-objects/link-type.js';
import type { ProviderId } from '../value-objects/provider-id.js';
import type { RightsStatus } from '../value-objects/rights-status.js';

export interface SearchQuery {
  /**
   * A single plain-text query string, e.g. "War and Peace Tolstoy" — never field-scoped
   * (`title:... author:...`). Phase 0 research found field-scoped queries fragment badly across
   * duplicate records on at least Open Library and return a fraction of the real language
   * coverage (docs/research/coverage-phase0.md) — every provider adapter must use plain text.
   */
  text: string;
  limit?: number;
}

export interface ProviderWork {
  externalId: string;
  title: string;
  authorNames: string[];
  /** Raw language codes as the source reports them — validated into `LanguageCode` by the caller. */
  languages: string[];
  firstPublishedYear: number | null;
  editionCount: number;
}

export interface ProviderEdition {
  externalId: string;
  title: string;
  language: string;
  translator: string | null;
  /** The language this edition was translated from, when the source states it — see Edition.translatedFrom. */
  translatedFrom: string | null;
  publisher: string | null;
  year: number | null;
  isbn13: string | null;
  isbn10: string | null;
  /**
   * The provider's own signal about this specific edition's rights, if any — never a final
   * verdict. `LinkPolicy` (docs/legal-policy.md §3) is what actually decides `RightsStatus`, and
   * an absent/`unknown` signal here is always treated as not-yet-known, never as permission.
   * The full `RightsStatus` union (not just the two permissive values) so a provider that
   * genuinely confirms `copyrighted` — e.g. Open Library's availability API reporting a book as
   * lendable-but-not-free — can say so, distinct from simply not knowing (`unknown`).
   */
  rightsSignal: RightsStatus;
  /**
   * A candidate source link the provider found for this edition, if any (e.g. Google Books'
   * `saleInfo.buyLink`). Not every provider has one — Open Library's own edition metadata alone
   * doesn't confidently establish a legal link (docs/legal-policy.md §3), so `OpenLibraryProvider`
   * only sets this from its separate availability lookup, never guesses from editions.json alone.
   * The use case still runs whatever is supplied through `LinkPolicy` (docs/architecture.md
   * §2.2) — a provider offering a link is not the same as that link being allowed.
   *
   * `provider` defaults to the sync's own source name when omitted (e.g. Google Books' buy links
   * really do come from `google-books`) — but a provider adapter may name a *different* one when
   * the link's actual legal origin differs from the adapter discovering it. Open Library's
   * availability lookup surfaces Internet Archive-hosted lending/full-text links, so those are
   * attributed to `internet-archive` (the allowlisted, legally-relevant host, docs/legal-policy.md
   * I-1), not to `open-library` itself.
   */
  link?: { type: LinkType; url: string; provider?: string };
}

/**
 * One external metadata source (docs/architecture.md §2.2). Adding a new source is a new
 * implementation of this port plus a registration in the composition root — existing use cases
 * never change (docs/rules.md §1 Open/Closed).
 */
export interface BookMetadataProvider {
  readonly id: ProviderId;
  searchWorks(query: SearchQuery): Promise<ProviderWork[]>;
  fetchEditions(externalWorkId: string): Promise<ProviderEdition[]>;
}
