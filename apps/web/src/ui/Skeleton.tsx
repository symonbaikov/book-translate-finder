import { cx } from './cx';

/**
 * A placeholder while real content loads.
 *
 * The shimmer itself lives on the global `.skeleton` class in `globals.css` and stays there: the
 * end-to-end suite asserts `expect(page.locator('.skeleton')).toHaveCount(0)` to prove a panel
 * actually resolved rather than sitting on its loading state. A CSS Module would hash that name
 * away and the assertion would pass for the wrong reason — forever, and silently.
 */
export function Skeleton({
  shape = 'text',
  width,
  className,
}: {
  shape?: 'text' | 'title' | 'poster' | 'block';
  /** For text lines of uneven length, so a paragraph placeholder does not look like a barcode. */
  width?: string;
  className?: string | undefined;
}) {
  return (
    <span
      className={cx('skeleton', `skeleton--${shape}`, className)}
      style={width ? { inlineSize: width } : undefined}
      aria-hidden="true"
    />
  );
}
