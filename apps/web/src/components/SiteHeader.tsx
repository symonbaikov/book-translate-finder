'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '../lib/auth-client';
import { useSession } from './SessionProvider';
import { useT } from '../i18n/I18nProvider';
import { LanguageSelector } from './LanguageSelector';
import { Logo } from './Logo';
import { Button, Container } from '../ui';
import styles from './SiteHeader.module.css';

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
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <Logo />
          <span className={styles.wordmark}>Golden Library</span>
        </Link>
        <nav className={styles.nav}>
          {/* The language selector is not gated on the session check — it must be usable while
              the account state is still unknown, which is most of the first paint. */}
          <Link href="/shelf" className={styles.link}>
            {t('nav.shelf')}
          </Link>
          <Link href="/addons" className={styles.link}>
            {t('nav.addons')}
          </Link>
          <LanguageSelector />
          {/* The account links wait for the session — flashing "Sign in" at someone already
              signed in reads as being logged out. */}
          {!loading &&
            (user ? (
              <>
                <Link href="/bookmarks" className={styles.link}>
                  {t('nav.savedBooks')}
                </Link>
                <span className={styles.who}>{user.displayName}</span>
                <Button variant="ghost" onClick={() => void handleLogout()}>
                  {t('nav.signOut')}
                </Button>
              </>
            ) : (
              <Link href="/login" className={styles.link}>
                {t('nav.signIn')}
              </Link>
            ))}
        </nav>
      </Container>
    </header>
  );
}
