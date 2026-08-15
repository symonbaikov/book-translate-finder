import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import styles from './Card.module.css';

/**
 * A panel. One radius, one border, one shadow, decided here so that the twenty places a card
 * appears cannot each answer the question slightly differently.
 */
export function Card({
  interactive = false,
  quiet = false,
  flush = false,
  className,
  children,
  ...rest
}: {
  /** Lifts on hover — only for a card that is itself a link or a button. */
  interactive?: boolean;
  /** No surface of its own: grouping without a box, for a section inside another card. */
  quiet?: boolean;
  /** No padding, clipped corners — for a card whose first child is an image. */
  flush?: boolean;
  className?: string | undefined;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>) {
  return (
    <div
      {...rest}
      className={cx(
        styles.card,
        interactive && styles.interactive,
        quiet && styles.quiet,
        flush && styles.flush,
        className,
      )}
    >
      {children}
    </div>
  );
}
