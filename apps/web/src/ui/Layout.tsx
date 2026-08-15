import type { CSSProperties, ReactNode } from 'react';
import { cx } from './cx';
import styles from './Layout.module.css';

/** The page's width. Everything on a screen sits inside exactly one of these. */
export function Container({
  prose = false,
  className,
  children,
}: {
  /** Narrow measure for long-form text. */
  prose?: boolean;
  className?: string | undefined;
  children: ReactNode;
}) {
  return <div className={cx(styles.container, prose && styles.prose, className)}>{children}</div>;
}

/** `<main>` with the container and the page's vertical rhythm already applied. */
export function Page({
  className,
  children,
}: {
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <main id="main-content" className={cx(styles.container, styles.page, className)}>
      {children}
    </main>
  );
}

/**
 * A titled block. The optional `action` sits on the heading's baseline at the end of the row —
 * "see all", "clear history" — because a control belonging to a section belongs beside its name,
 * not floating above the first item.
 */
export function Section({
  id,
  title,
  note,
  action,
  headingLevel = 2,
  className,
  children,
}: {
  /** A fragment target, for a link that should land on this section rather than the page top. */
  id?: string;
  title: ReactNode;
  note?: ReactNode;
  action?: ReactNode;
  /** Sections nested inside another section take 3, so the outline stays honest. */
  headingLevel?: 2 | 3;
  className?: string | undefined;
  children: ReactNode;
}) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';

  return (
    <section id={id} className={cx(styles.section, className)}>
      <div className={styles.sectionHead}>
        <Heading className={styles.sectionTitle}>{title}</Heading>
        {action}
      </div>
      {note ? <p className={styles.sectionNote}>{note}</p> : null}
      {children}
    </section>
  );
}

/** Cover size for a grid or a row, in the one place it is decided. */
function posterSizing(min: string | undefined): CSSProperties | undefined {
  return min ? ({ ['--poster-min' as string]: min } as CSSProperties) : undefined;
}

/** A reflowing wall of covers. The window decides how many fit; nothing else does. */
export function PosterGrid({
  minWidth,
  className,
  children,
}: {
  minWidth?: string;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <ul className={cx(styles.posterGrid, className)} style={posterSizing(minWidth)}>
      {children}
    </ul>
  );
}

/**
 * A horizontally scrolling row, for lists whose order carries meaning — most recently read first.
 * A grid would wrap that order into rows and quietly destroy it.
 */
export function PosterRow({
  minWidth,
  className,
  children,
  ...rest
}: {
  minWidth?: string;
  className?: string | undefined;
  children: ReactNode;
} & { 'aria-label'?: string }) {
  return (
    <ul {...rest} className={cx(styles.row, className)} style={posterSizing(minWidth)}>
      {children}
    </ul>
  );
}

/** Vertical rhythm without a wrapper div in every page. */
export function Stack({
  className,
  children,
}: {
  className?: string | undefined;
  children: ReactNode;
}) {
  return <div className={cx(styles.stack, className)}>{children}</div>;
}

/** A wrapping horizontal group: chips, badges, a pair of buttons. */
export function Cluster({
  className,
  children,
}: {
  className?: string | undefined;
  children: ReactNode;
}) {
  return <div className={cx(styles.cluster, className)}>{children}</div>;
}
