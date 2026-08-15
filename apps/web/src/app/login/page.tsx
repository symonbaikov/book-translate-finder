'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MIN_PASSWORD_LENGTH } from '@golden/contracts';
import { googleSignInUrl, login, register } from '../../lib/auth-client';
import { useSession } from '../../components/SessionProvider';
import { useT } from '../../i18n/I18nProvider';
import { Button, ButtonLink, Card, Field, TextInput } from '../../ui';
import styles from './login.module.css';

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
    <main id="main-content" className={styles.page}>
      <Card className={styles.card}>
        <h1 className={styles.title}>
          {mode === 'login' ? t('auth.signInTitle') : t('auth.registerTitle')}
        </h1>
        <p className={styles.blurb}>{t('auth.blurb')}</p>

        <form onSubmit={(event) => void submit(event)} className={styles.form}>
          {mode === 'register' && (
            <Field label={t('auth.name')} htmlFor="displayName">
              <TextInput
                id="displayName"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                autoComplete="nickname"
              />
            </Field>
          )}
          <Field label={t('auth.email')} htmlFor="email">
            <TextInput
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field
            label={t('auth.password')}
            htmlFor="password"
            hint={
              mode === 'register' ? t('auth.passwordHint', { min: MIN_PASSWORD_LENGTH }) : undefined
            }
          >
            <TextInput
              id="password"
              type="password"
              required
              minLength={mode === 'register' ? MIN_PASSWORD_LENGTH : 1}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </Field>

          {error && <p className="error-box">{error}</p>}

          <Button type="submit" variant="primary" size="lg" block loading={busy}>
            {busy
              ? t('auth.working')
              : mode === 'login'
                ? t('auth.submitSignIn')
                : t('auth.submitRegister')}
          </Button>
        </form>

        {/* Rendered only where the instance actually has Google credentials — a button that always
            fails is worse than no button (docs/plan.md Phase 4.5). */}
        {googleEnabled && (
          <>
            <div className={styles.divider}>·</div>
            <ButtonLink variant="secondary" size="lg" block href={googleSignInUrl()}>
              {t('auth.google')}
            </ButtonLink>
          </>
        )}

        <div className={styles.footer}>
          {mode === 'login' ? (
            <button type="button" className={styles.switch} onClick={() => setMode('register')}>
              {t('auth.toRegister')}
            </button>
          ) : (
            <button type="button" className={styles.switch} onClick={() => setMode('login')}>
              {t('auth.toSignIn')}
            </button>
          )}
          <Link href="/" className={styles.back}>
            {t('auth.backToSearch')}
          </Link>
        </div>
      </Card>
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
