'use client';

import { useEffect, useState } from 'react';

/**
 * Book cover with a graceful placeholder. A plain `<img>` rather than `next/image`: covers come
 * from external hosts (covers.openlibrary.org, books.google.com) that would each need remote-
 * pattern config and would funnel every self-hosted instance's cover traffic through the Next
 * image optimizer for no real gain at these sizes. `loading="lazy"` keeps long edition lists
 * cheap; the fixed width/height prevents layout shift while a cover loads.
 *
 * A cover URL is a *guess* when derived from an ISBN (see the domain's `cover-url.ts`) — the
 * image may simply not exist. `onError` is therefore load-bearing, not defensive polish: without
 * it the reader gets a broken-image icon instead of the 📖 placeholder.
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
  const [failed, setFailed] = useState(false);

  // A new `src` deserves a fresh attempt — otherwise a card reused for a different book (React
  // keeping the same element) would stay stuck on the previous book's failure.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
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
      onError={() => setFailed(true)}
    />
  );
}

/** Matching skeleton block for a cover slot — same footprint, shimmer while real data loads. */
export function CoverSkeleton({ large = false }: { large?: boolean }) {
  return <div className={large ? 'skeleton skeleton--cover-lg' : 'skeleton skeleton--cover'} />;
}
