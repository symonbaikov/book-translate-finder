import {
  ApiErrorResponseSchema,
  EditionLinksResponseSchema,
  EditionPricesResponseSchema,
  EditionsResponseSchema,
  OpdsFeedListResponseSchema,
  OpdsFeedSchema,
  SearchResponseSchema,
  WorkCardResponseSchema,
  WorkRatingsResponseSchema,
  type EditionLinksResponse,
  type EditionPricesResponse,
  type EditionsResponse,
  type OpdsFeedDto,
  type OpdsFeedListResponse,
  type SearchResponse,
  type WorkCardResponse,
  type WorkRatingsResponse,
} from '@golden/contracts';
import { webEnv } from '../config/web-env';

/**
 * apps/web only ever talks to its own API (docs/architecture.md §2.5) — every response is
 * validated against the matching `@golden/contracts` Zod schema before the page ever sees it, so a
 * shape mismatch fails loudly here instead of producing a confusing render bug downstream.
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

/**
 * Server-side calls (SSR) prefer `INTERNAL_API_URL` when set — see the comment on it in
 * web-env.ts for why the browser-facing and container-internal URLs can genuinely differ.
 * `typeof window === 'undefined'` is the standard Next.js way to detect "running on the server"
 * without a bundler-specific API.
 */
function apiBaseUrl(): string {
  if (typeof window === 'undefined' && webEnv.INTERNAL_API_URL) {
    return webEnv.INTERNAL_API_URL;
  }
  return webEnv.NEXT_PUBLIC_API_URL;
}

async function parseErrorBody(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    const parsed = ApiErrorResponseSchema.safeParse(body);
    return parsed.success ? parsed.data.title : res.statusText;
  } catch {
    return res.statusText;
  }
}

/**
 * Обертка для fetch, которая обрабатывает сетевые ошибки.
 * Если API недоступен, выбрасывает ApiRequestError с понятным сообщением.
 */
async function fetchApi(url: URL | string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    const message =
      error instanceof TypeError && error.message.includes('fetch')
        ? 'API server is not available. Please try again later.'
        : error instanceof Error
          ? error.message
          : 'Failed to connect to API server';
    throw new ApiRequestError(message, 0);
  }
}

export async function searchWorks(query: string, limit = 20): Promise<SearchResponse> {
  const url = new URL('/api/search', apiBaseUrl());
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));

  const res = await fetchApi(url, { cache: 'no-store' });
  if (!res.ok && res.status !== 202) {
    throw new ApiRequestError(await parseErrorBody(res), res.status);
  }
  return SearchResponseSchema.parse(await res.json());
}

/**
 * `null` means the work genuinely does not exist (404) — every other failure throws.
 *
 * `language` is the reader's interface language: the card looks for a description written in it
 * and reports which language the one it returns is actually in. It filters nothing.
 */
export async function getWorkCard(
  workId: string,
  language?: string,
): Promise<WorkCardResponse | null> {
  const url = new URL(`/api/works/${encodeURIComponent(workId)}`, apiBaseUrl());
  if (language) url.searchParams.set('language', language);
  const res = await fetchApi(url, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiRequestError(await parseErrorBody(res), res.status);
  return WorkCardResponseSchema.parse(await res.json());
}

export interface EditionsFilter {
  language?: string;
  year?: number;
}

export async function listEditions(
  workId: string,
  filter: EditionsFilter = {},
): Promise<EditionsResponse> {
  const url = new URL(`/api/works/${encodeURIComponent(workId)}/editions`, apiBaseUrl());
  if (filter.language) url.searchParams.set('language', filter.language);
  if (filter.year !== undefined) url.searchParams.set('year', String(filter.year));

  const res = await fetchApi(url, { cache: 'no-store' });
  if (!res.ok) throw new ApiRequestError(await parseErrorBody(res), res.status);
  return EditionsResponseSchema.parse(await res.json());
}

export async function getEditionLinks(
  editionId: string,
  country?: string | null,
): Promise<EditionLinksResponse> {
  const url = new URL(`/api/editions/${encodeURIComponent(editionId)}/links`, apiBaseUrl());
  if (country) url.searchParams.set('country', country);
  const res = await fetchApi(url, { cache: 'no-store' });
  if (!res.ok) throw new ApiRequestError(await parseErrorBody(res), res.status);
  return EditionLinksResponseSchema.parse(await res.json());
}

/** Module C. Cached briefly server-side (15 minutes) — see `AggregateEditionPrices`. */
export async function getEditionPrices(
  editionId: string,
  country?: string | null,
): Promise<EditionPricesResponse> {
  const url = new URL(`/api/editions/${encodeURIComponent(editionId)}/prices`, apiBaseUrl());
  if (country) url.searchParams.set('country', country);
  const res = await fetchApi(url, { cache: 'no-store' });
  if (!res.ok) throw new ApiRequestError(await parseErrorBody(res), res.status);
  return EditionPricesResponseSchema.parse(await res.json());
}

/**
 * Reader ratings for every edition of one work, in one request.
 *
 * Deliberately not per edition, unlike links and prices: the numbers sit under each row without
 * anything to click, and a request per row is what pushed both of those behind a button after a
 * single reader tripped the API's rate limit. Cached a day server-side (`AggregateTranslationRatings`).
 */
export async function getWorkRatings(
  workId: string,
  language?: string | null,
  /** The editions on screen, in the order shown — the server cannot work them out (see the
   *  `editions` field on `WorkRatingsQuerySchema`). */
  editionIds?: readonly string[],
): Promise<WorkRatingsResponse> {
  const url = new URL(`/api/works/${encodeURIComponent(workId)}/ratings`, apiBaseUrl());
  if (language) url.searchParams.set('language', language);
  if (editionIds?.length) url.searchParams.set('editions', editionIds.join(','));
  const res = await fetchApi(url, { cache: 'no-store' });
  if (!res.ok) throw new ApiRequestError(await parseErrorBody(res), res.status);
  return WorkRatingsResponseSchema.parse(await res.json());
}

/** The catalogs shipped with the app. A reader's own feeds never pass through the API at all. */
export async function listOpdsFeeds(): Promise<OpdsFeedListResponse> {
  const url = new URL('/api/opds/feeds', apiBaseUrl());
  const res = await fetchApi(url, { cache: 'no-store' });
  if (!res.ok) throw new ApiRequestError(await parseErrorBody(res), res.status);
  return OpdsFeedListResponseSchema.parse(await res.json());
}

/**
 * @param href a link taken from a feed this endpoint returned earlier (pagination or a
 *             sub-catalog). The server rejects anything off that feed's own origin.
 */
export async function getOpdsFeed(feedId: string, href?: string | null): Promise<OpdsFeedDto> {
  const url = new URL(`/api/opds/feeds/${encodeURIComponent(feedId)}`, apiBaseUrl());
  if (href) url.searchParams.set('href', href);
  const res = await fetchApi(url, { cache: 'no-store' });
  if (!res.ok) throw new ApiRequestError(await parseErrorBody(res), res.status);
  return OpdsFeedSchema.parse(await res.json());
}
