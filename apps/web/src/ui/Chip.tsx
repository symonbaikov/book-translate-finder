import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import styles from './Chip.module.css';

type ChipContent = {
  children: ReactNode;
  /** A number shown after the label — editions, results. Aligned with tabular figures. */
  count?: number;
  className?: string | undefined;
};

/** A label that is not pressable: a genre on a card, a format on an edition. */
export function Chip({ children, count, className }: ChipContent) {
  return (
    <span className={cx(styles.chip, className)}>
      {children}
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </span>
  );
}

/** A chip that navigates. Anchor, not button — see the note in Button.tsx. */
export function ChipLink({
  children,
  count,
  className,
  ...rest
}: ChipContent & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'>) {
  return (
    <a {...rest} className={cx(styles.chip, styles.pressable, className)}>
      {children}
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </a>
  );
}

/**
 * A chip that switches something on or off — a language filter, most often.
 *
 * `aria-pressed` rather than a class alone: the selected state is carried by the accent colour and
 * a border, and neither of those exists for someone listening to the page.
 */
export function ChipToggle({
  children,
  count,
  selected,
  className,
  ...rest
}: ChipContent & { selected: boolean } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'className' | 'children'
  >) {
  return (
    <button
      type="button"
      {...rest}
      aria-pressed={selected}
      className={cx(styles.chip, styles.pressable, selected && styles.selected, className)}
    >
      {children}
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </button>
  );
}
