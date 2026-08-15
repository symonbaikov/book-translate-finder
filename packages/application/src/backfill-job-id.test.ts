import { describe, expect, it } from 'vitest';
import { backfillJobId } from './backfill-job-id.js';

describe('backfillJobId', () => {
  it('is deterministic — the same query twice gives the same id, so BullMQ collapses the repeat', () => {
    expect(backfillJobId('backfill-subject', 'Tom Lake Ann Patchett')).toBe(
      backfillJobId('backfill-subject', 'Tom Lake Ann Patchett'),
    );
  });

  it('keeps non-Latin titles apart instead of collapsing them onto one id', () => {
    // The whole point: an ASCII-only slug turned every Cyrillic title into the same empty string,
    // so a Russian reader's home page queued one book and dropped the other nineteen.
    const anna = backfillJobId('backfill-subject', 'Анна Каренина Лев Толстой');
    const crime = backfillJobId('backfill-subject', 'Преступление и наказание Фёдор Достоевский');

    expect(anna).not.toBe(crime);
    expect(anna).toBe('backfill-subject-анна-каренина-лев-толстой');
  });

  it('never emits a colon — BullMQ rejects custom ids containing one (docs/rules.md §2.3)', () => {
    expect(backfillJobId('backfill-featured', 'Foo: A Novel, by Bar')).not.toContain(':');
  });

  it('distinguishes queries that differ past the length cap only by their prefix', () => {
    const long = 'a'.repeat(200);
    expect(backfillJobId('backfill-featured', long)).not.toBe(
      backfillJobId('backfill-subject', long),
    );
  });
});
