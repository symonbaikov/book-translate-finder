'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { setBookmark } from '../lib/auth-client';
import { useSession } from './SessionProvider';

/**
 * Saves a book to the reader's list.
 *
 * Signed out, it is not hidden — it becomes the invitation to sign in, phrased as what they gain
 * rather than a wall. Hiding it would leave no clue the feature exists.
 */
export function BookmarkButton({
  workId,
  initiallySaved,
}: {
  workId: string;
  initiallySaved?: boolean;
}) {
  const { user, loading } = useSession();
  const [saved, setSaved] = useState(initiallySaved ?? false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A different reader may sign in without a reload; their list is not this one's.
  useEffect(() => {
    if (!user) setSaved(false);
  }, [user]);

  if (loading) return null;

  if (!user) {
    return (
      <Link className="button--secondary" href="/login">
        Sign in to save
      </Link>
    );
  }

  async function toggle(): Promise<void> {
    setBusy(true);
    setError(null);
    // Optimistic: the request is a single row write and the button is the only thing that
    // changes, so waiting on the round-trip only makes it feel slow.
    const next = !saved;
    setSaved(next);
    try {
      setSaved(await setBookmark(workId, next));
    } catch {
      setSaved(!next);
      setError('Could not save. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={saved ? 'button--secondary' : ''}
        onClick={() => void toggle()}
        disabled={busy}
        aria-pressed={saved}
      >
        {saved ? '★ Saved' : '☆ Save this book'}
      </button>
      {error && <span className="error-box">{error}</span>}
    </>
  );
}
