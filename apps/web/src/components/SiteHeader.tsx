'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '../lib/auth-client';
import { useSession } from './SessionProvider';
import { useT } from '../i18n/I18nProvider';
import { LanguageSelector } from './LanguageSelector';

/** The one place the reader's account state is visible: saved books, and a way in or out. */
export function SiteHeader() {
  const { user, loading, setUser } = useSession();
  const t = useT();
  const router = useRouter();

  async function handleLogout(): Promise<void> {
    await logout();
    setUser(null);
    router.push('/');
    router.refresh();
  }

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link href="/" className="site-header__brand">
          BookTranslate Finder
        </Link>
        <nav className="site-header__nav">
          {/* The language selector is not gated on the session check — it must be usable while
              the account state is still unknown, which is most of the first paint. */}
          <LanguageSelector />
          {/* The account links wait for the session — flashing "Sign in" at someone already
              signed in reads as being logged out. */}
          {!loading &&
            (user ? (
              <>
                <Link href="/bookmarks">{t('nav.savedBooks')}</Link>
                <span className="muted">{user.displayName}</span>
                <button
                  type="button"
                  className="button--secondary"
                  onClick={() => void handleLogout()}
                >
                  {t('nav.signOut')}
                </button>
              </>
            ) : (
              <Link href="/login">{t('nav.signIn')}</Link>
            ))}
        </nav>
      </div>
    </header>
  );
}
