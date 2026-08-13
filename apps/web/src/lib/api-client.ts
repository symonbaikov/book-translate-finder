import {
  ApiErrorResponseSchema,
  EditionLinksResponseSchema,
  EditionsResponseSchema,
  SearchResponseSchema,
  WorkCardResponseSchema,
  type EditionLinksResponse,
  type EditionsResponse,
  type SearchResponse,
  type WorkCardResponse,
} from '@btf/contracts';
import { webEnv } from '../config/web-env';

/**
 * apps/web only ever talks to its own API (docs/architecture.md §2.5) — every response is
 * validated against the matching `@btf/contracts` Zod schema before the page ever sees it, so a
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

export async function searchWorks(query: string, limit = 20): Promise<SearchResponse> {
  const url = new URL('/api/search', apiBaseUrl());
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok && res.status !== 202) {
    throw new ApiRequestError(await parseErrorBody(res), res.status);
  }
  return SearchResponseSchema.parse(await res.json());
}

/** `null` means the work genuinely does not exist (404) — every other failure throws. */
export async function getWorkCard(workId: string): Promise<WorkCardResponse | null> {
  const url = new URL(`/api/works/${encodeURIComponent(workId)}`, apiBaseUrl());
  const res = await fetch(url, { cache: 'no-store' });
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

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new ApiRequestError(await parseErrorBody(res), res.status);
  return EditionsResponseSchema.parse(await res.json());
}

export async function getEditionLinks(
  editionId: string,
  country?: string | null,
): Promise<EditionLinksResponse> {
  const url = new URL(`/api/editions/${encodeURIComponent(editionId)}/links`, apiBaseUrl());
  if (country) url.searchParams.set('country', country);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new ApiRequestError(await parseErrorBody(res), res.status);
  return EditionLinksResponseSchema.parse(await res.json());
}
