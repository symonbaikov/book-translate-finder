import type { FastifyReply, FastifyRequest } from 'fastify';

export const SESSION_COOKIE = 'btf_session';

/**
 * Cookie handling written out rather than pulled in as a plugin.
 *
 * This app sets exactly one cookie and reads exactly one, both here. `@fastify/cookie` would add
 * a dependency and a plugin-registration ordering concern to save about fifteen lines, and the
 * security-relevant parts — HttpOnly, SameSite, Secure — are explicit this way instead of being
 * defaults someone has to go and look up.
 */
export function readSessionToken(request: FastifyRequest): string | null {
  const header = request.headers.cookie;
  if (!header) return null;

  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() !== SESSION_COOKIE) continue;
    const value = part.slice(separator + 1).trim();
    return value ? decodeURIComponent(value) : null;
  }
  return null;
}

export interface SessionCookieOptions {
  /** Set only over HTTPS: a Secure cookie on plain http is simply never sent, which breaks
   * local development and self-hosting behind a proxy that terminates TLS elsewhere. */
  secure: boolean;
}

export function setSessionCookie(
  reply: FastifyReply,
  token: string,
  expiresAt: Date,
  options: SessionCookieOptions,
): void {
  void reply.header('set-cookie', serialize(token, expiresAt, options));
}

export function clearSessionCookie(reply: FastifyReply, options: SessionCookieOptions): void {
  void reply.header('set-cookie', serialize('', new Date(0), options));
}

function serialize(token: string, expiresAt: Date, options: SessionCookieOptions): string {
  const attributes = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    `Expires=${expiresAt.toUTCString()}`,
    // HttpOnly: no script ever needs this value, and keeping it out of `document.cookie` means an
    // XSS bug cannot walk off with a live session.
    'HttpOnly',
    // Lax rather than Strict: Strict would drop the cookie on the redirect back from Google's
    // consent screen, so a successful sign-in would land the reader signed out.
    'SameSite=Lax',
  ];
  if (options.secure) attributes.push('Secure');
  return attributes.join('; ');
}
