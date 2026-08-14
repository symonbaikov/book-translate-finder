'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MIN_PASSWORD_LENGTH } from '@btf/contracts';
import { googleSignInUrl, login, register } from '../../lib/auth-client';
import { useSession } from '../../components/SessionProvider';
import { useT } from '../../i18n/I18nProvider';

type Mode = 'login' | 'register';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { googleEnabled, setUser, refresh } = useSession();
  const t = useT();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const googleError = params.get('error');
  const [error, setError] = useState<string | null>(
    googleError === 'google_state'
      ? t('auth.errorGoogleState')
      : googleError === 'google_failed'
        ? t('auth.errorGoogleFailed')
        : null,
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
      setError(caught instanceof Error ? caught.message : t('auth.errorGeneric'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container" id="main-content">
      <h1>{mode === 'login' ? t('auth.signInTitle') : t('auth.registerTitle')}</h1>
      <p className="muted" style={{ maxWidth: '34rem' }}>
        {t('auth.blurb')}
      </p>

      <form onSubmit={(event) => void submit(event)} className="auth-form">
        {mode === 'register' && (
          <div className="field">
            <label htmlFor="displayName">{t('auth.name')}</label>
            <input
              id="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="nickname"
            />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">{t('auth.email')}</label>
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
          <label htmlFor="password">{t('auth.password')}</label>
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
              {t('auth.passwordHint', { min: MIN_PASSWORD_LENGTH })}
            </span>
          )}
        </div>

        {error && <p className="error-box">{error}</p>}

        <button type="submit" disabled={busy}>
          {busy
            ? t('auth.working')
            : mode === 'login'
              ? t('auth.submitSignIn')
              : t('auth.submitRegister')}
        </button>
      </form>

      {/* Rendered only where the instance actually has Google credentials — a button that always
          fails is worse than no button (docs/plan.md Phase 4.5). */}
      {googleEnabled && (
        <p style={{ marginTop: '1rem' }}>
          <a className="button--secondary" href={googleSignInUrl()}>
            {t('auth.google')}
          </a>
        </p>
      )}

      <p style={{ marginTop: '1.5rem' }}>
        {mode === 'login' ? (
          <button type="button" className="link-button" onClick={() => setMode('register')}>
            {t('auth.toRegister')}
          </button>
        ) : (
          <button type="button" className="link-button" onClick={() => setMode('login')}>
            {t('auth.toSignIn')}
          </button>
        )}
      </p>
      <p className="muted" style={{ fontSize: '0.85em' }}>
        <Link href="/">{t('auth.backToSearch')}</Link>
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
