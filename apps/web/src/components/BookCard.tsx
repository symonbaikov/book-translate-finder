import Link from 'next/link';
import type { ReactNode } from 'react';
import { Poster, Skeleton, cx } from '../ui';
import styles from './BookCard.module.css';

/**
 * A book in a grid or a row: cover, title, one line of context.
 *
 * Every list on the site — search results, the curated lists, a genre page, saved books — renders
 * this. That is the point: the cards were four slightly different shapes before, and the difference
 * was never a decision anyone made.
 */
export function BookCard({
  href,
  title,
  meta,
  coverUrl,
  author,
  badge,
  action,
  priority = false,
  className,
}: {
  href: string;
  title: string;
  /** The line under the title — author, year, publisher. Truncated to one line. */
  meta?: ReactNode;
  coverUrl: string | null;
  /** Shown on the typographic fallback when there is no cover image. */
  author?: string | null;
  /** A rights or availability mark, inside the link. */
  badge?: ReactNode;
  /** A control belonging to this card — rendered outside the link, where it is valid HTML. */
  action?: ReactNode;
  /** Eager-load the cover: for the first row, which is above the fold. */
  priority?: boolean;
  className?: string | undefined;
}) {
  return (
    <li className={cx(styles.item, className)}>
      <Link href={href} className={styles.card}>
        <Poster
          className={styles.poster}
          src={coverUrl}
          title={title}
          author={author ?? null}
          priority={priority}
        />
        <span className={styles.title}>{title}</span>
        {meta ? <span className={styles.meta}>{meta}</span> : null}
        {badge ? <span className={styles.badge}>{badge}</span> : null}
      </Link>
      {action ? <div className={styles.action}>{action}</div> : null}
    </li>
  );
}

/** The same footprint, shimmering — so a grid does not resize when the real books arrive. */
export function BookCardSkeleton() {
  return (
    <li className={styles.item}>
      <div className={styles.card}>
        <Skeleton shape="poster" />
        <Skeleton shape="text" width="80%" />
        <Skeleton shape="text" width="50%" />
      </div>
    </li>
  );
}
