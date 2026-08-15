import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';
import styles from './Field.module.css';

export type ControlSize = 'compact' | 'default' | 'hero';

function sizeClass(size: ControlSize): string | undefined {
  if (size === 'hero') return styles.hero;
  if (size === 'compact') return styles.compact;
  return undefined;
}

/**
 * Label, control and whatever the reader needs to be told about it, in the order a screen reader
 * meets them.
 *
 * The label is always rendered — `visuallyHidden` moves it out of sight rather than deleting it.
 * A placeholder is not a label: it disappears exactly when the reader starts typing and needs it.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  visuallyHidden = false,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: ReactNode;
  visuallyHidden?: boolean;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className={cx(styles.field, className)}>
      <label className={cx(styles.label, visuallyHidden && 'visually-hidden')} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <p className={styles.hint}>{hint}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}

export function TextInput({
  size = 'default',
  className,
  ...rest
}: { size?: ControlSize; className?: string | undefined } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'size'
>) {
  return <input {...rest} className={cx(styles.control, sizeClass(size), className)} />;
}

/* There is no `SelectInput` here on purpose: a native `<select>` cannot be styled or animated
   below its own trigger, so every dropdown in this application is `ui/Select`. */
