/**
 * The deterministic job id a lazily-queued backfill runs under (ADR-0003).
 *
 * Deterministic so BullMQ collapses repeats: a home page viewed forty times in a minute must
 * enqueue each book once, not forty times.
 *
 * **Unicode, not ASCII.** The first version of this slug was `[^a-z0-9]+ → '-'`, which is fine for
 * *The Dutch House* and catastrophic for «Анна Каренина»: every Cyrillic, Greek, Arabic, Japanese
 * or Korean title collapses to the empty string, so an entire language's worth of books shares one
 * job id and only the first one is ever fetched. Since the language sections queue exactly those
 * titles, keeping letters of any script is what makes them fill at all. Colons are the one
 * character BullMQ hard-rejects in a custom id (docs/rules.md §2.3) and cannot survive this.
 */
export function backfillJobId(prefix: string, query: string): string {
  const slug = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return `${prefix}-${slug}`;
}
