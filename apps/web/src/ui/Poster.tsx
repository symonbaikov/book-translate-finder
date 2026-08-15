'use client';

import { useEffect, useState } from 'react';
import { coverImageUrl } from '../lib/cover-url';
import { cx } from './cx';
import styles from './Poster.module.css';

/**
 * Spread the gradient angles of the text-only covers so a grid of them does not read as a repeated
 * tile. Deterministic, because the same book must look the same on every visit and on the server's
 * render as well as the browser's — `Math.random()` here would produce a hydration mismatch.
 */
function angleFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return `${115 + (Math.abs(hash) % 80)}deg`;
}

/**
 * A book cover in the grid's aspect ratio, with a typographic fallback when there is no image.
 *
 * A plain `<img>`, not `next/image`: covers come from external hosts (covers.openlibrary.org,
 * books.google.com) that would each need remote-pattern configuration and would funnel every
 * self-hosted instance's cover traffic through the Next image optimizer for no gain at these
 * sizes.
 *
 * `onError` is load-bearing rather than defensive: a source's cover URL can 404 long after it was
 * stored, and the relay answers 404 for anything it cannot fetch. Without it the reader gets a
 * broken-image icon where a cover should be, instead of the typographic fallback.
 */
export function Poster({
  src,
  title,
  author,
  className,
  priority = false,
  sizes,
}: {
  src: string | null;
  title: string;
  author?: string | null;
  className?: string | undefined;
  /** Eager-load — for the hero cover on a work page, which is the page's LCP element. */
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  // Every cover on the site passes through here, which is why the relay is applied here and
  // nowhere else — see `coverImageUrl` for what it buys and why the stored URL is left alone.
  const imageUrl = coverImageUrl(src);

  // A new `src` deserves a fresh attempt: React reusing this element for a different book would
  // otherwise leave it stuck on the previous book's failure.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!imageUrl || failed) {
    return (
      <div
        className={cx(styles.frame, className)}
        style={{ ['--placeholder-angle' as string]: angleFor(title) }}
      >
        {/* The title is already the accessible name of whatever link wraps this poster, so
            repeating it to a screen reader here would announce every book twice. */}
        <div className={styles.placeholder} aria-hidden="true">
          <p className={styles.placeholderTitle}>{title}</p>
          {author ? <p className={styles.placeholderAuthor}>{author}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cx(styles.frame, className)}>
      <img
        className={styles.image}
        src={imageUrl}
        alt=""
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        // `alt=""` because the cover sits inside a link that already carries the book's title;
        // announcing it again would read the same name twice per card.
        aria-hidden="true"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
