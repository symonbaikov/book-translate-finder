'use client';

/**
 * What the reader has been opening, kept in their own browser.
 *
 * This is the whole recommendation engine's memory, and it deliberately never leaves the device
 * as a profile: the server is only ever told a list of genres, so it cannot know whose genres
 * they are (docs/adr/0006-local-recommendations.md). The sign-in page promises "no profile, no
 * tracking" and this feature is built so that stays true.
 *
 * Only *opened* books are recorded. A search query looks like a signal but usually is not — it is
 * as often a miss, a typo, or someone checking a title for a friend — and it carries no genre
 * until a book is actually opened. Opening a card is the reader saying "this one".
 */
const STORAGE_KEY = 'btf.history';
/** Enough to describe a taste, short enough that last month stops outvoting this week. */
const MAX_ENTRIES = 30;

export interface HistoryEntry {
  workId: string;
  title: string;
  subjects: string[];
  /** Epoch ms, used only for ordering within this browser. */
  at: number;
}

function read(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    // Private mode, disabled storage, or a value someone hand-edited: no history is a perfectly
    // good state — the section simply does not appear.
    return [];
  }
}

export function recordVisit(entry: Omit<HistoryEntry, 'at'>): void {
  if (typeof window === 'undefined' || entry.subjects.length === 0) return;
  try {
    const existing = read().filter((e) => e.workId !== entry.workId);
    const next = [{ ...entry, at: Date.now() }, ...existing].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore — see read() */
  }
}

export function readHistory(): HistoryEntry[] {
  return read();
}

/** True when the history is really gone from this browser — the only answer worth reporting. */
export function clearHistory(): boolean {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export interface TasteProfile {
  /** Most-read genres first. */
  subjects: string[];
  /** Already-opened works, so they are not recommended back. */
  workIds: string[];
  /** The most recently opened book, to explain *why* these suggestions appeared. */
  lastTitle: string | null;
}

/**
 * Turns the history into the genres worth asking about.
 *
 * Recent books count for more — a taste that changed last week should show up next week — but
 * older ones still count, so one curious detour into cookbooks does not redecorate the home page.
 * A genre seen once is dropped when there is enough history to be choosy: single sightings are
 * where Open Library's contributor tags are at their most arbitrary ("thrushes", "Arkenstone").
 */
export function buildTasteProfile(
  history: HistoryEntry[] = readHistory(),
  hiddenTags: readonly string[] = [],
): TasteProfile {
  // Hidden genres are dropped before anything is weighted, so a hidden tag never reaches the
  // server at all — not merely filtered out of what comes back.
  const hidden = new Set(hiddenTags.map((tag) => tag.trim().toLowerCase()));
  const weights = new Map<string, number>();
  const sightings = new Map<string, number>();

  history.forEach((entry, index) => {
    // 1.0 for the newest, decaying gently; the tenth-most-recent still carries about a third.
    const recency = 1 / (1 + index * 0.2);
    for (const subject of new Set(entry.subjects.map((s) => s.trim().toLowerCase()))) {
      if (!subject || hidden.has(subject)) continue;
      weights.set(subject, (weights.get(subject) ?? 0) + recency);
      sightings.set(subject, (sightings.get(subject) ?? 0) + 1);
    }
  });

  // Ranking is by weight (recency-aware); the cut is by raw sighting count, because a tag seen
  // once *in the newest book* still scores high — and "seen once" is exactly the case the filter
  // is for.
  const byWeight = [...weights.entries()].sort((a, b) => b[1] - a[1]).map(([subject]) => subject);
  const repeated = byWeight.filter((subject) => (sightings.get(subject) ?? 0) > 1);

  // Falling back to every tag when nothing repeats is not a compromise of the rule, it is the
  // rule's whole point: the filter exists to drop noise once a pattern exists, and until one does
  // the alternative is an empty recommendation section for someone who has read three books.
  const ranked = repeated.length > 0 ? repeated : byWeight;

  return {
    subjects: ranked.slice(0, 8),
    workIds: history.map((entry) => entry.workId),
    lastTitle: history[0]?.title ?? null,
  };
}
