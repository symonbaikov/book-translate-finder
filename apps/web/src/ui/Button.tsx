import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

type SharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Fills the available width — for a form's submit, or a stacked action bar on a phone. */
  block?: boolean;
  children: ReactNode;
};

function classes(
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'md',
  block?: boolean,
  extra?: string,
) {
  return cx(styles.base, styles[variant], styles[size], block && styles.block, extra);
}

/**
 * The application's button. Every pressable thing that is not a link is one of these, so that
 * "large, comfortable controls" is a property of the system rather than a thing each screen
 * remembers to do.
 *
 * `loading` keeps the label and adds three dots beside it: replacing the label with a spinner
 * resizes the button under the reader's finger, which shifts whatever sits next to it.
 */
export function Button({
  variant,
  size,
  block,
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: SharedProps & { loading?: boolean } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'className' | 'children'
  > & { className?: string | undefined }) {
  return (
    <button
      {...rest}
      className={classes(variant, size, block, className)}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
    >
      {children}
      {loading && (
        <span className={styles.dots} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      )}
    </button>
  );
}

/**
 * A link that looks like a button. Separate from `Button` on purpose: the difference between
 * navigating and acting is carried by the element, not by the styling, and a `<button>` that
 * navigates breaks middle-click, "open in new tab", and every assistive technology that announces
 * the two differently.
 */
export function ButtonLink({
  variant,
  size,
  block,
  className,
  children,
  ...rest
}: SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & {
    className?: string | undefined;
  }) {
  return (
    <a {...rest} className={classes(variant, size, block, className)}>
      {children}
    </a>
  );
}
