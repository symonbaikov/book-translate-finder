/**
 * Whether this browser has been walked through the app, and how far it got.
 *
 * Same shape and the same honesty as every other preference here (`custom-source-providers.ts`,
 * `installed-addons.ts`): it lives in the reader's own `localStorage`, this instance never learns
 * it, and every write reports whether it actually landed. That last part is not ceremony — a
 * browser that refuses the write is a browser where the tour reopens on the next visit, and a
 * reader who has just declined it deserves to be told that rather than surprised by it.
 *
 * The step id is stored alongside the status so a reload in the middle of the tour resumes where
 * it was instead of starting over. It is a plain string on purpose: a step this version does not
 * have (renamed, or written by a newer build) resolves to "no step" and the tour starts from the
 * top, which is the only behaviour that cannot strand someone.
 */

const STORAGE_KEY = 'btf.tour';

export type TourStatus = 'unseen' | 'running' | 'finished';

export interface TourProgress {
  readonly status: TourStatus;
  /** The step showing when the page was last left, if the tour was running. */
  readonly step: string | null;
}

const UNSEEN: TourProgress = { status: 'unseen', step: null };

function isStatus(value: unknown): value is TourStatus {
  return value === 'unseen' || value === 'running' || value === 'finished';
}

export function readTourProgress(): TourProgress {
  if (typeof window === 'undefined') return UNSEEN;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return UNSEEN;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return UNSEEN;
    const { status, step } = parsed as { status?: unknown; step?: unknown };
    if (!isStatus(status)) return UNSEEN;
    return { status, step: typeof step === 'string' ? step : null };
  } catch {
    // Private mode, disabled storage, or a hand-edited value. "Never seen the tour" is a valid
    // state and a harmless one to fall back to.
    return UNSEEN;
  }
}

function write(progress: TourProgress): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false; // see readTourProgress()
  }
}

/**
 * Note where the tour is, so a reload resumes there.
 *
 * Deliberately returns nothing: this fires on every step and is not a change the reader made, so
 * it has no popup and nothing to report. The write that *is* announced is the one that ends the
 * tour — see `finishTour`.
 */
export function rememberTourStep(step: string): void {
  write({ status: 'running', step });
}

/** The reader finished or dismissed the tour: it must not open by itself again. */
export function finishTour(): boolean {
  return write({ status: 'finished', step: null });
}

/** The reader asked for the tour again — back to the state a fresh browser is in. */
export function forgetTour(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
