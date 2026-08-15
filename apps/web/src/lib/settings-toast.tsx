'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useT } from '../i18n/I18nProvider';
import { presentOutcome, type SettingOutcome } from './setting-change';

/**
 * The one way this app announces that a preference changed.
 *
 * Every setting here is written straight into the reader's browser and takes effect with no
 * "Save" button to press, which leaves nothing on screen to confirm it happened — a select box
 * that has moved looks exactly the same whether the value was stored or silently dropped. This
 * popup is that confirmation, and it is deliberately the only one: a component that rolls its own
 * `toast()` call would drift in wording, in duration, and in what counts as success.
 *
 * What goes in it is fixed by `SettingChangeNotice`: the preference's name, one sentence saying
 * what it changed *from* and *to* and what that now affects, and a status word from the outcome.
 * "Saved" on its own is not a message — the reader already knows they clicked.
 */
export interface SettingChangeNotice {
  /**
   * Which preference this is about. Doubles as the popup's id, so a reader flicking through a
   * dropdown replaces one popup instead of stacking five.
   */
  readonly setting: string;
  readonly outcome: SettingOutcome;
  /** The preference's own name, already translated — "Interface language", "Shopping country". */
  readonly title: string;
  /** What actually changed, already translated, in a full sentence. */
  readonly detail: string;
}

export type AnnounceSettingChange = (notice: SettingChangeNotice) => void;

export function useSettingChangeToast(): AnnounceSettingChange {
  const t = useT();

  return useCallback(
    ({ setting, outcome, title, detail }: SettingChangeNotice) => {
      const { tone, statusKey, durationMs, storageRefused } = presentOutcome(outcome);

      toast[tone](
        <span className="setting-toast__heading">
          <span>{title}</span>
          <span className="setting-toast__status">{t(statusKey)}</span>
        </span>,
        {
          id: setting,
          duration: durationMs,
          // A refused write replaces the caller's sentence rather than following it: `detail`
          // describes the state the reader was aiming for, and nothing in this app holds a
          // preference in memory, so that state is not the one they got.
          description: storageRefused ? t('settings.notStored') : detail,
        },
      );
    },
    [t],
  );
}
