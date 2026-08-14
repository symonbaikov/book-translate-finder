import { randomBytes } from 'node:crypto';
import { Body, Controller, Get, Inject, Post, Query, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  CurrentUserResponseSchema,
  LoginRequestSchema,
  RegisterRequestSchema,
  type CurrentUserResponse,
} from '@btf/contracts';
import type { AuthService } from '@btf/application';
import { InvalidInputError } from '@btf/domain';
import type { GoogleOAuthClient } from '@btf/infrastructure';
import { parseOrThrow } from '../common/validation/parse-or-throw.js';
import { TOKENS } from '../common/tokens.js';
import { clearSessionCookie, readSessionToken, setSessionCookie } from './cookies.js';

/** Guards the OAuth callback against CSRF; short-lived because it is used within one redirect. */
const OAUTH_STATE_COOKIE = 'btf_oauth_state';
const OAUTH_STATE_TTL_SECONDS = 600;

export interface AuthControllerConfig {
  /** Where the browser is sent after a Google round-trip — the web app, not this API. */
  webBaseUrl: string;
  /** Whether to mark cookies `Secure`; false on plain-http local runs or the cookie is dropped. */
  secureCookies: boolean;
}

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(TOKENS.AUTH_SERVICE) private readonly auth: AuthService,
    @Inject(TOKENS.AUTH_CONFIG) private readonly config: AuthControllerConfig,
    // Absent on an instance with no Google credentials — every route that needs it checks first
    // and the client is told `googleEnabled: false` so the button is never rendered.
    @Inject(TOKENS.GOOGLE_OAUTH) private readonly google: GoogleOAuthClient | null,
  ) {}

  @Get('me')
  async me(@Req() request: FastifyRequest): Promise<CurrentUserResponse> {
    const user = await this.auth.authenticate(readSessionToken(request));
    return CurrentUserResponseSchema.parse({ user, googleEnabled: this.google !== null });
  }

  @Post('register')
  async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<CurrentUserResponse> {
    const input = parseOrThrow(RegisterRequestSchema, body);
    const result = await this.auth.register({
      email: input.email,
      password: input.password,
      // `exactOptionalPropertyTypes`: the key must be absent, not present-with-undefined.
      ...(input.displayName ? { displayName: input.displayName } : {}),
    });
    this.signIn(reply, result.sessionToken, result.expiresAt);
    return CurrentUserResponseSchema.parse({
      user: result.user,
      googleEnabled: this.google !== null,
    });
  }

  @Post('login')
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<CurrentUserResponse> {
    const input = parseOrThrow(LoginRequestSchema, body);
    const result = await this.auth.loginWithPassword(input);
    this.signIn(reply, result.sessionToken, result.expiresAt);
    return CurrentUserResponseSchema.parse({
      user: result.user,
      googleEnabled: this.google !== null,
    });
  }

  @Post('logout')
  async logout(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<{ ok: true }> {
    await this.auth.logout(readSessionToken(request));
    clearSessionCookie(reply, { secure: this.config.secureCookies });
    return { ok: true };
  }

  @Get('google/start')
  googleStart(@Res() reply: FastifyReply): void {
    if (!this.google)
      throw new InvalidInputError('Google sign-in is not configured on this instance');

    const state = randomBytes(16).toString('base64url');
    void reply.header(
      'set-cookie',
      `${OAUTH_STATE_COOKIE}=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${OAUTH_STATE_TTL_SECONDS}` +
        (this.config.secureCookies ? '; Secure' : ''),
    );
    void reply.redirect(this.google.authorizationUrl(state), 302);
  }

  @Get('google/callback')
  async googleCallback(
    @Query() query: unknown,
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    if (!this.google)
      throw new InvalidInputError('Google sign-in is not configured on this instance');

    const { code, state } = (query ?? {}) as { code?: string; state?: string };
    const expectedState = readCookie(request, OAUTH_STATE_COOKIE);
    // Both halves must be present and equal: without this an attacker can complete a sign-in in
    // someone else's browser by feeding them a callback URL.
    if (!code || !state || !expectedState || state !== expectedState) {
      void reply.redirect(`${this.config.webBaseUrl}/login?error=google_state`, 302);
      return;
    }

    try {
      const profile = await this.google.exchangeCode(code);
      const result = await this.auth.loginWithGoogle(profile);
      this.signIn(reply, result.sessionToken, result.expiresAt);
      void reply.redirect(`${this.config.webBaseUrl}/bookmarks`, 302);
    } catch {
      // The reason is deliberately not echoed into the URL: it comes from an external service and
      // would end up rendered on a page and in server logs of whoever the reader shares it with.
      void reply.redirect(`${this.config.webBaseUrl}/login?error=google_failed`, 302);
    }
  }

  private signIn(reply: FastifyReply, token: string, expiresAt: Date): void {
    setSessionCookie(reply, token, expiresAt, { secure: this.config.secureCookies });
  }
}

function readCookie(request: FastifyRequest, name: string): string | null {
  const header = request.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) return part.slice(separator + 1).trim() || null;
  }
  return null;
}
