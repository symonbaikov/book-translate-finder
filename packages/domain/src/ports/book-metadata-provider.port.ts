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
  /** Cover image URL when the source's search result carries one — cheap preview-quality signal;
   * `fetchWorkDetails` is the authoritative source at sync time. */
  coverUrl: string | null;
}

/** Work-level facts that need their own source request beyond the search hit (docs/architecture.md §2.2). */
export interface ProviderWorkDetails {
  /** Subject headings used as genre tags. Free contributor text, not a taxonomy. */
  subjects?: readonly string[];
  description: string | null;
  coverUrl: string | null;
}

export interface ProviderEdition {
  externalId: string;
  title: string;
  language: string;
  /** Cover image URL for this specific edition, when the source has one. */
  coverUrl: string | null;
  /** Printed page count, when the source states one. */
  pages?: number | null;
  /** Physical format as the source words it ("Paperback", "Hardcover"). */
  binding?: string | null;
  /**
   * How this printing differs from the others, in the cataloguer's own words: "First edition",
   * "Limited ed., signed", "Izd. 2-e, ispr. i dop.", "Erstveröffentlichung".
   *
   * Only a MARC-speaking catalogue supplies it — Dublin Core has no element for it, so through DC
   * a numbered collector's printing and the twelfth reprint are the same record. Kept verbatim for
   * the same reason `binding` is: every catalogue words it differently, in its own language, and
   * bucketing it into an enum would mean guessing what an unfamiliar phrase means.
   */
  editionStatement?: string | null;
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
   * Candidate source links the provider found for this edition. Several are normal, not
   * exceptional: Project Gutenberg offers the same public domain book as EPUB, MOBI, plain text
   * and HTML, and a reader picking a download wants the format choice.
   *
   * The use case still runs every one through `LinkPolicy` (docs/architecture.md §2.2) — a
   * provider offering a link is never the same as that link being allowed.
   *
   * `provider` defaults to the sync's own source name when omitted (Google Books' buy links
   * really do come from `google-books`) — but a provider adapter may name a *different* one when
   * the link's actual legal origin differs from the adapter discovering it. Open Library's
   * availability lookup surfaces Internet Archive-hosted content, so those are attributed to
   * `internet-archive` (the allowlisted, legally-relevant host, docs/legal-policy.md I-1), not
   * to `open-library` itself.
   */
  links?: { type: LinkType; url: string; provider?: string; format?: string }[];
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
  /**
   * Work-level description and cover — a separate call because sources keep them on the work
   * record, not in search results or edition lists. Best-effort: a provider that cannot answer
   * returns nulls rather than failing the sync.
   */
  fetchWorkDetails(externalWorkId: string): Promise<ProviderWorkDetails>;
}
