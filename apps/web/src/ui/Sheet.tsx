import type { ReactNode } from 'react';
import { cx } from './cx';
import styles from './Sheet.module.css';

/**
 * A disclosure panel whose height animates to whatever its content turns out to be.
 *
 * Kept mounted and hidden with `inert` rather than unmounted, so that a panel which has already
 * loaded its links does not throw them away and fetch again when reopened. `inert` — not
 * `aria-hidden` alone — because a collapsed panel's links must also be unreachable by Tab; a
 * focusable element inside a zero-height box is a trap the reader cannot see.
 */
export function Sheet({
  open,
  id,
  bare = false,
  children,
}: {
  open: boolean;
  /** Matched by the trigger's `aria-controls`. */
  id?: string;
  /** No surface of its own — for a panel inside a card that already has one. */
  bare?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={cx(styles.sheet, open && styles.open)} id={id}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- `inert` lands in React 19;
          on 18 it must be spread as an attribute or React drops it silently. */}
      <div className={styles.inner} {...({ inert: open ? undefined : '' } as any)}>
        <div className={bare ? undefined : styles.body}>{children}</div>
      </div>
    </div>
  );
}
