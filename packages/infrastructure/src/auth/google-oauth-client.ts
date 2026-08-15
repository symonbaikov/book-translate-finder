import type { VerifiedGoogleProfile } from '@golden/domain';

const AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
/**
 * The profile is read from Google's own userinfo endpoint rather than by decoding the `id_token`
 * JWT. Both are legitimate; this one needs no JWT library and no key-rotation handling, because
 * the answer arrives over a server-to-server TLS call to Google — there is no untrusted party in
 * between whose signature we would need to check.
 */
const USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  /** Must match a redirect URI registered in the Google Cloud console, exactly. */
  redirectUri: string;
}

interface TokenResponse {
  access_token?: string;
}

interface UserInfoResponse {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

export class GoogleOAuthError extends Error {}

/**
 * Google sign-in, plain authorization-code flow, no dependency.
 *
 * Only constructed when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are both set. A self-hosted
 * instance without them does not merely fail at the callback — the button is never rendered
 * (docs/plan.md Phase 4.5), because offering a sign-in route that cannot work is worse than not
 * offering it.
 */
export class GoogleOAuthClient {
  constructor(private readonly config: GoogleOAuthConfig) {}

  /** `state` is caller-generated and echoed back — the CSRF check for the callback. */
  authorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      // No refresh token is requested: this app acts on a person's behalf exactly once, at
      // sign-in, and holding long-lived Google credentials it never uses would be a liability.
      prompt: 'select_account',
    });
    return `${AUTHORIZE_URL}?${params.toString()}`;
  }

  async exchangeCode(code: string): Promise<VerifiedGoogleProfile> {
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) {
      throw new GoogleOAuthError(`Google token exchange failed with status ${tokenRes.status}`);
    }
    const { access_token: accessToken } = (await tokenRes.json()) as TokenResponse;
    if (!accessToken) throw new GoogleOAuthError('Google token exchange returned no access token');

    const userRes = await fetch(USERINFO_URL, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) {
      throw new GoogleOAuthError(`Google userinfo failed with status ${userRes.status}`);
    }
    const profile = (await userRes.json()) as UserInfoResponse;

    if (!profile.sub || !profile.email) {
      throw new GoogleOAuthError('Google profile is missing sub or email');
    }
    // An unverified address must not be trusted to match an existing account: otherwise anyone
    // who can add an unverified address to a Google account could take over the account here.
    if (profile.email_verified === false) {
      throw new GoogleOAuthError('Google reports this email address as unverified');
    }

    return {
      subject: profile.sub,
      email: profile.email,
      displayName: profile.name ?? profile.email,
    };
  }
}
