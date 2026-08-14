'use client';

import { useEffect } from 'react';
import { recordVisit } from '../lib/reading-history';

/**
 * Records that this book was opened, in the reader's own browser.
 *
 * Renders nothing and sends nothing anywhere. A book with no genre tags is not recorded at all —
 * it could not contribute to a recommendation, and storing it would only be surveillance without
 * a purpose.
 */
export function RecordVisit({
  workId,
  title,
  subjects,
}: {
  workId: string;
  title: string;
  subjects: string[];
}) {
  useEffect(() => {
    recordVisit({ workId, title, subjects });
  }, [workId, title, subjects]);

  return null;
}
