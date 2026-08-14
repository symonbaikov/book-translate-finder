import {
  BookmarkStateResponseSchema,
  BookmarksResponseSchema,
  CurrentUserResponseSchema,
  type BookmarksResponse,
  type CurrentUserResponse,
} from '@btf/contracts';
import { webEnv } from '../config/web-env';

/**
 * Every call here sends the session cookie, which a cross-origin `fetch` drops unless asked. In
 * development apps/web and apps/api are separate origins, so `credentials: 'include'` is not
 * optional — without it the reader appears signed out on every request.
 */
async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${webEnv.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      // Only when there is a body to describe. Declaring `application/json` on a bodyless POST
      // makes Fastify reject the request with FST_ERR_CTP_EMPTY_JSON_BODY — found live: every
      // "save this book" click came back 400 while the same call from curl succeeded.
      ...(init.body === undefined ? {} : { 'content-type': 'application/json' }),
      ...(init.headers ?? {}),
    },
  });
}

async function messageFor(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { title?: string };
    return body.title ?? `Request failed with status ${res.status}`;
  } catch {
    return `Request failed with status ${res.status}`;
  }
}

export class AuthError extends Error {}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const res = await authFetch('/api/auth/me');
  if (!res.ok) throw new AuthError(await messageFor(res));
  return CurrentUserResponseSchema.parse(await res.json());
}

export async function register(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<CurrentUserResponse> {
  const res = await authFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new AuthError(await messageFor(res));
  return CurrentUserResponseSchema.parse(await res.json());
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<CurrentUserResponse> {
  const res = await authFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(input) });
  if (!res.ok) throw new AuthError(await messageFor(res));
  return CurrentUserResponseSchema.parse(await res.json());
}

export async function logout(): Promise<void> {
  await authFetch('/api/auth/logout', { method: 'POST' });
}

export function googleSignInUrl(): string {
  return `${webEnv.NEXT_PUBLIC_API_URL}/api/auth/google/start`;
}

export async function listBookmarks(): Promise<BookmarksResponse> {
  const res = await authFetch('/api/bookmarks');
  if (!res.ok) throw new AuthError(await messageFor(res));
  return BookmarksResponseSchema.parse(await res.json());
}

export async function setBookmark(workId: string, saved: boolean): Promise<boolean> {
  const res = await authFetch(`/api/bookmarks/${encodeURIComponent(workId)}`, {
    method: saved ? 'POST' : 'DELETE',
  });
  if (!res.ok) throw new AuthError(await messageFor(res));
  return BookmarkStateResponseSchema.parse(await res.json()).saved;
}
