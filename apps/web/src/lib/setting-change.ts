/**
 * What happened to a preference the reader just changed.
 *
 * Every preference in this app is stored in the reader's own browser — a cookie or
 * `localStorage`, never a server-side profile — and every one of those writes can quietly fail
 * (private mode, blocked storage, cookies switched off). So "the reader clicked" and "the value
 * is stored" are two different facts, and the popup has to distinguish them: telling someone
 * their language is saved when the browser refused to keep it is the kind of small lie that
 * makes them stop trusting the rest of the interface.
 *
 * Hence four outcomes rather than a success/failure pair:
 *
 * - `saved`    — a new value is in effect and was written down.
 * - `cleared`  — the preference is back to the default, or an entry was removed. Deliberately not
 *                `saved`: "your country is now nothing" is not the same news as "your country is
 *                now France", and the reader should be able to tell them apart at a glance.
 * - `unstored` — the browser refused to keep the value. Nothing here reads a preference from
 *                memory — every panel re-reads the cookie or `localStorage` when it refetches —
 *                so a write that did not land is a change that did not happen, however the
 *                control looks afterwards. Its own outcome and not just `failed`, because the
 *                reason is the reader's browser rather than this site, and it is the one message
 *                that has to replace the caller's sentence instead of following it: "set to
 *                France" and "nothing changed" cannot both be printed.
 * - `session`  — the change is in effect **now**, and the browser would not remember it. Its own
 *                outcome rather than an `unstored`, because for a preference the page holds in
 *                memory the two statements are different: the reader can see the change happened,
 *                and what they need to be told is that it will not be there next time. This file
 *                predicted it — "if you ever add a preference that *is* held in memory, that is a
 *                new outcome, not a reuse of this one" — and the reader's display settings are it.
 * - `failed`   — the change was refused — by the server, or by the legal policy. Nothing changed;
 *                whatever was in effect before still is.
 *
 * This module stays free of React and of `sonner` on purpose: the mapping from an outcome to how
 * loudly it is shown is a decision worth testing on its own, and a test for it should not have to
 * mount a toast renderer.
 */

export type SettingOutcome = 'saved' | 'cleared' | 'unstored' | 'session' | 'failed';

/** Dictionary keys for the short status word shown beside the setting's name in the popup. */
export type SettingStatusKey = `settings.status.${SettingOutcome}`;

export interface OutcomePresentation {
  /** The `sonner` variant that carries it — where the colour and the icon come from. */
  readonly tone: 'success' | 'info' | 'warning' | 'error';
  readonly statusKey: SettingStatusKey;
  /**
   * How long the popup stays. Anything the reader may have to act on outlives the news that
   * simply worked: a confirmation missed costs nothing, an unstored preference missed costs the
   * preference.
   */
  readonly durationMs: number;
  /**
   * Whether the popup says the browser refused to store the value **instead of** the sentence the
   * caller wrote. Replacing rather than appending: the caller's sentence describes the state the
   * reader was aiming for, and printing it next to "nothing changed" would contradict itself.
   */
  readonly storageRefused: boolean;
  /**
   * Whether the popup adds "this browser will not remember it" **after** the caller's sentence.
   *
   * Appended rather than replacing, which is the whole difference from `storageRefused`: here the
   * caller's sentence is true — the change is on screen — and only its lifetime is not.
   */
  readonly storageForgot: boolean;
}

export const OUTCOME_PRESENTATION: Readonly<Record<SettingOutcome, OutcomePresentation>> = {
  saved: {
    tone: 'success',
    statusKey: 'settings.status.saved',
    durationMs: 5_000,
    storageRefused: false,
    storageForgot: false,
  },
  cleared: {
    tone: 'info',
    statusKey: 'settings.status.cleared',
    durationMs: 5_000,
    storageRefused: false,
    storageForgot: false,
  },
  unstored: {
    tone: 'warning',
    statusKey: 'settings.status.unstored',
    durationMs: 9_000,
    storageRefused: true,
    storageForgot: false,
  },
  session: {
    tone: 'warning',
    statusKey: 'settings.status.session',
    durationMs: 9_000,
    storageRefused: false,
    storageForgot: true,
  },
  failed: {
    tone: 'error',
    statusKey: 'settings.status.failed',
    durationMs: 9_000,
    storageRefused: false,
    storageForgot: false,
  },
};

export function presentOutcome(outcome: SettingOutcome): OutcomePresentation {
  return OUTCOME_PRESENTATION[outcome];
}

/** What the reader was trying to do — the same failed write reads differently for each. */
export type SettingIntent = 'set' | 'clear';

/**
 * The outcome of a write that already happened, given whether storage accepted it.
 *
 * Callers pass the boolean their storage helper returned; they never pick `unstored` by hand.
 * That is the whole point — a component that forgets to check the write result would otherwise
 * report `saved` for a value that was never stored.
 */
export function outcomeOfWrite(persisted: boolean, intent: SettingIntent): SettingOutcome {
  if (!persisted) return 'unstored';
  return intent === 'clear' ? 'cleared' : 'saved';
}

/**
 * The same, for a preference the page keeps applying whether or not storage accepted it.
 *
 * Only for settings that are genuinely in effect after a refused write — the reading display is the
 * one, because refusing to *show* readers the type size they just chose, on the grounds that it
 * will not survive the tab, would be a second and worse failure. Using this for anything the page
 * re-reads from storage would report a change that is not there.
 */
export function outcomeOfSessionWrite(persisted: boolean, intent: SettingIntent): SettingOutcome {
  if (!persisted) return 'session';
  return intent === 'clear' ? 'cleared' : 'saved';
}
