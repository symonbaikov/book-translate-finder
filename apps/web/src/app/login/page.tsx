'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MIN_PASSWORD_LENGTH } from '@btf/contracts';
import { googleSignInUrl, login, register } from '../../lib/auth-client';
import { useSession } from '../../components/SessionProvider';

type Mode = 'login' | 'register';

const GOOGLE_ERRORS: Record<string, string> = {
  google_state: 'That sign-in link expired or was opened in a different browser. Please try again.',
  google_failed: 'Google sign-in did not complete. You can use an email and password instead.',
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { googleEnabled, setUser, refresh } = useSession();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    GOOGLE_ERRORS[params.get('error') ?? ''] ?? null,
  );

  async function submit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result =
        mode === 'register'
          ? await register({ email, password, ...(displayName ? { displayName } : {}) })
          : await login({ email, password });
      setUser(result.user);
      await refresh();
      router.push('/bookmarks');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container" id="main-content">
      <h1>{mode === 'login' ? 'Sign in' : 'Create an account'}</h1>
      <p className="muted" style={{ maxWidth: '34rem' }}>
        An account exists for one reason: to save books you find and come back to them — with the
        languages they were translated into, the editions that exist, and where to get each one
        legally. No newsletter, no profile, no tracking.
      </p>

      <form onSubmit={(event) => void submit(event)} className="auth-form">
        {mode === 'register' && (
          <div className="field">
            <label htmlFor="displayName">Name (optional)</label>
            <input
              id="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="nickname"
            />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={mode === 'register' ? MIN_PASSWORD_LENGTH : 1}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          />
          {mode === 'register' && (
            <span className="muted" style={{ fontSize: '0.8em' }}>
              At least {MIN_PASSWORD_LENGTH} characters. Length is all that is checked — a long
              phrase you can remember beats a short one with punctuation in it.
            </span>
          )}
        </div>

        {error && <p className="error-box">{error}</p>}

        <button type="submit" disabled={busy}>
          {busy ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      {/* Rendered only where the instance actually has Google credentials — a button that always
          fails is worse than no button (docs/plan.md Phase 4.5). */}
      {googleEnabled && (
        <p style={{ marginTop: '1rem' }}>
          <a className="button--secondary" href={googleSignInUrl()}>
            Continue with Google
          </a>
        </p>
      )}

      <p style={{ marginTop: '1.5rem' }}>
        {mode === 'login' ? (
          <button type="button" className="link-button" onClick={() => setMode('register')}>
            No account yet? Create one
          </button>
        ) : (
          <button type="button" className="link-button" onClick={() => setMode('login')}>
            Already have an account? Sign in
          </button>
        )}
      </p>
      <p className="muted" style={{ fontSize: '0.85em' }}>
        <Link href="/">Back to search</Link>
      </p>
    </main>
  );
}

export default function LoginPage() {
  // `useSearchParams` needs a Suspense boundary in the App Router, or the whole route opts out of
  // static rendering with a build-time error.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
