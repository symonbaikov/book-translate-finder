'use client';

/**
 * The two preferences the server has to know before it renders — interface language and book
 * language — live in cookies rather than `localStorage`, so they need their own tiny reader and
 * writer.
 *
 * `document.cookie = …` is an assignment that returns nothing and throws nothing: a browser with
 * cookies switched off accepts the line and drops the value. The only way to find out is to read
 * it back, which is what `writeCookie` does — otherwise the popup would promise a language
 * setting that is gone on the next request.
 */

export function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find((pair) => pair.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

/** Writes the cookie and returns whether the browser actually kept it. */
export function writeCookie(name: string, value: string, maxAgeSeconds: number): boolean {
  if (typeof document === 'undefined') return false;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
  return readCookie(name) === value;
}

/** Deletes the cookie and returns whether it is really gone. */
export function deleteCookie(name: string): boolean {
  if (typeof document === 'undefined') return false;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
  return readCookie(name) === null;
}
