/**
 * Book cover with a graceful placeholder. A plain `<img>` rather than `next/image`: covers come
 * from external hosts (covers.openlibrary.org, books.google.com) that would each need remote-
 * pattern config and would funnel every self-hosted instance's cover traffic through the Next
 * image optimizer for no real gain at these sizes. `loading="lazy"` keeps long edition lists
 * cheap; the fixed width/height prevents layout shift while a cover loads.
 */
export function CoverImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
}: {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  /** Eager-load — for the above-the-fold hero cover (it is the page's LCP candidate). */
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div
        className={`cover cover--placeholder ${className}`}
        style={{ width, height }}
        aria-hidden="true"
      >
        📖
      </div>
    );
  }
  return (
    <img
      className={`cover ${className}`}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}

/** Matching skeleton block for a cover slot — same footprint, shimmer while real data loads. */
export function CoverSkeleton({ large = false }: { large?: boolean }) {
  return <div className={large ? 'skeleton skeleton--cover-lg' : 'skeleton skeleton--cover'} />;
}
