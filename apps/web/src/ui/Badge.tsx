import type { ReactNode } from 'react';
import { cx } from './cx';
import styles from './Badge.module.css';

export type BadgeTone = 'positive' | 'info' | 'neutral' | 'caution' | 'danger';

/** Default marks per tone. Overridable — `copyrighted` is better served by © than by a dot. */
const DEFAULT_GLYPH: Record<BadgeTone, string> = {
  positive: '✓',
  info: '◇',
  neutral: '·',
  caution: '?',
  danger: '!',
};

export function Badge({
  tone = 'neutral',
  glyph,
  solid = false,
  className,
  children,
}: {
  tone?: BadgeTone;
  /** Replaces the tone's default mark. Pass `null` for a badge with no glyph at all. */
  glyph?: string | null;
  /** Adds a tinted fill — only for a badge over an image, where an outline alone can vanish. */
  solid?: boolean;
  className?: string | undefined;
  children: ReactNode;
}) {
  const mark = glyph === undefined ? DEFAULT_GLYPH[tone] : glyph;

  return (
    <span className={cx(styles.badge, styles[tone], solid && styles.solid, className)}>
      {mark ? (
        <span className={styles.glyph} aria-hidden="true">
          {mark}
        </span>
      ) : null}
      {children}
    </span>
  );
}
