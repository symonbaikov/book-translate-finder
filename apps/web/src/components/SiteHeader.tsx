'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '../lib/auth-client';
import { useSession } from './SessionProvider';
import { useT } from '../i18n/I18nProvider';
import { tourTarget } from '../lib/tour-targets';
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
          {/* The `data-tour` attributes are the onboarding walkthrough's only hold on this file:
              it finds these three links by name rather than by position or class, so reordering
              the navigation cannot silently point the tour at the wrong one (lib/tour-targets.ts). */}
          <Link href="/shelf" className={styles.link} {...tourTarget('navShelf')}>
            {t('nav.shelf')}
          </Link>
          <Link href="/addons" className={styles.link} {...tourTarget('navAddons')}>
            {t('nav.addons')}
          </Link>
          <Link href="/custom-sources" className={styles.link} {...tourTarget('navCustomSources')}>
            {t('nav.customSources')}
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
