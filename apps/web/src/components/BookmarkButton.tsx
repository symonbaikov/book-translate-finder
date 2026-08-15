'use client';

import { useEffect, useState } from 'react';
import { setBookmark } from '../lib/auth-client';
import { useSession } from './SessionProvider';
import { useT } from '../i18n/I18nProvider';
import { useSettingChangeToast } from '../lib/settings-toast';
import { Button, ButtonLink } from '../ui';

/**
 * Saves a book to the reader's list.
 *
 * Signed out, it is not hidden — it becomes the invitation to sign in, phrased as what they gain
 * rather than a wall. Hiding it would leave no clue the feature exists.
 */
export function BookmarkButton({
  workId,
  title,
  initiallySaved,
}: {
  workId: string;
  /** The book's own title — the popup names the book, not the id it happens to have. */
  title: string;
  initiallySaved?: boolean;
}) {
  const { user, loading } = useSession();
  const t = useT();
  const [saved, setSaved] = useState(initiallySaved ?? false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const announce = useSettingChangeToast();

  // A different reader may sign in without a reload; their list is not this one's.
  useEffect(() => {
    if (!user) setSaved(false);
  }, [user]);

  if (loading) return null;

  if (!user) {
    // `ButtonLink`, not a `<Link>` wearing a button class: this navigates, and only the anchor
    // gives middle-click, "open in new tab" and the right announcement to a screen reader.
    return (
      <ButtonLink variant="secondary" size="lg" href="/login">
        {t('bookmark.signInToSave')}
      </ButtonLink>
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
      const confirmed = await setBookmark(workId, next);
      setSaved(confirmed);
      // Announced from the server's answer, not from `next`: the optimistic flip already happened
      // on screen, and this is the part that says the list really changed.
      announce({
        setting: 'bookmarks',
        outcome: confirmed ? 'saved' : 'cleared',
        title: t('settings.bookmarks.title'),
        detail: confirmed
          ? t('settings.bookmarks.added', { title })
          : t('settings.bookmarks.removed', { title }),
      });
    } catch {
      setSaved(!next);
      setError(t('bookmark.failed'));
      announce({
        setting: 'bookmarks',
        outcome: 'failed',
        title: t('settings.bookmarks.title'),
        detail: t('settings.bookmarks.failed'),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Saved is the quieter of the two states: once a book is on the shelf, the button has done
          its job and should stop asking to be pressed. */}
      <Button
        type="button"
        variant={saved ? 'secondary' : 'primary'}
        size="lg"
        onClick={() => void toggle()}
        disabled={busy}
        aria-pressed={saved}
      >
        {saved ? `★ ${t('bookmark.saved')}` : `☆ ${t('bookmark.save')}`}
      </Button>
      {error && <span className="error-box">{error}</span>}
    </>
  );
}
