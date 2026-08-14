'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '../lib/auth-client';
import { useSession } from './SessionProvider';

/** The one place the reader's account state is visible: saved books, and a way in or out. */
export function SiteHeader() {
  const { user, loading, setUser } = useSession();
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
        {/* Nothing is rendered until the session is known — flashing "Sign in" at someone who is
            already signed in reads as being logged out. */}
        {!loading && (
          <nav className="site-header__nav">
            {user ? (
              <>
                <Link href="/bookmarks">Saved books</Link>
                <span className="muted">{user.displayName}</span>
                <button
                  type="button"
                  className="button--secondary"
                  onClick={() => void handleLogout()}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/login">Sign in</Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
