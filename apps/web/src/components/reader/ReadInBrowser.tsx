'use client';

import { useRouter } from 'next/navigation';
import { readableFormatOf } from '@golden/reader';
import { useT } from '../../i18n/I18nProvider';
import { handBookTo } from '../../lib/reader-handoff';
import { Button } from '../../ui';
import styles from './ReadInBrowser.module.css';

/**
 * "Read in your browser", wherever there is a file to open.
 *
 * Two surfaces use it and they are different in a way that matters: a link this instance produced
 * carries a rights status it can back up, and an addon's does not (ADR-0009). This control adds no
 * status of its own to either — it is a way of opening what is already on screen, under whatever
 * label that row already carries.
 *
 * The address travels in `sessionStorage`, never in a query string
 * ([ADR-0013](../../../../docs/adr/0013-client-side-reader.md) §1): a query string would put the
 * book's URL in this instance's access log before any of the reading code ran. `router.push` rather
 * than a plain link for the same reason the stash exists — the URL that appears in the address bar
 * is a bare `/read`.
 */
export function ReadInBrowser({
  url,
  formatHint,
  size = 'sm',
}: {
  url: string;
  /** Whatever the source called the format. Free text — see `readableFormatOf`. */
  formatHint: string | null | undefined;
  size?: 'sm' | 'md';
}) {
  const t = useT();
  const router = useRouter();

  // A guess about whether to offer the button, never about how to read the file. A format nobody
  // recognised gets no button rather than a button that fails after the download.
  if (!readableFormatOf(formatHint)) return null;

  return (
    <Button
      type="button"
      variant="secondary"
      size={size}
      className={styles.button}
      onClick={() => router.push(handBookTo(url))}
    >
      {t('reader.openHere')}
    </Button>
  );
}
