'use client';

import { useT } from '../i18n/I18nProvider';
import { forgetTour } from '../lib/onboarding-tour';
import { outcomeOfWrite } from '../lib/setting-change';
import { useSettingChangeToast } from '../lib/settings-toast';
import { START_TOUR_EVENT } from './OnboardingTour';
import styles from './TourRestartLink.module.css';

/**
 * The way back into the walkthrough, in the footer where the other "about this site" things are.
 *
 * A tour that can only ever be seen once is a tour people dismiss and then wish they hadn't — and
 * because it is remembered in this browser rather than in an account, there is no settings screen
 * elsewhere that could offer it again. Hence a link, and hence in the footer: findable by someone
 * looking for it, invisible to everyone else.
 *
 * Two writes happen on click and only one of them is announced. Forgetting the "seen it" flag is
 * a preference the reader just changed, so it gets the same popup every other preference here gets,
 * with the same honesty about a browser that refuses to store things — in that case the tour still
 * starts, but it will start again by itself on the next visit, and the amber message is what says
 * so. Starting the tour is not announced: the reader can see it start.
 */
export function TourRestartLink() {
  const t = useT();
  const announce = useSettingChangeToast();

  function restart(): void {
    const persisted = forgetTour();
    announce({
      setting: 'onboarding-tour',
      outcome: outcomeOfWrite(persisted, 'clear'),
      title: t('settings.tour.title'),
      detail: t('settings.tour.restarted'),
    });
    window.dispatchEvent(new CustomEvent(START_TOUR_EVENT));
  }

  return (
    <button type="button" className={styles.link} onClick={restart}>
      {t('footer.takeTheTour')}
    </button>
  );
}
