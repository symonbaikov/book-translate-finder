'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { PopperPlacement, StepOptions, StepOptionsButton, Tour } from 'shepherd.js';
// Shepherd's own stylesheet first, this app's theme second — in that order and in this file, so
// the override cannot be reshuffled by where a bundler happens to place two global imports.
// Shepherd renders its popup outside React's tree, into `document.body`, which is why the theme is
// a plain stylesheet rather than a CSS module: there is no element here to hand a hashed class to.
import 'shepherd.js/dist/css/shepherd.css';
import './OnboardingTour.css';
import { webEnv } from '../config/web-env';
import type { Dictionary } from '../i18n/dictionary';
import { useT } from '../i18n/I18nProvider';
import { finishTour, readTourProgress, rememberTourStep } from '../lib/onboarding-tour';
import { outcomeOfWrite } from '../lib/setting-change';
import { useSettingChangeToast } from '../lib/settings-toast';
import { tourSelector, type TourTarget } from '../lib/tour-targets';

/**
 * The first-run walkthrough.
 *
 * This app asks more of a new reader than a search box suggests: nothing outside the built-in
 * catalogs works until they have pointed it at sources of their own, and those sources live in
 * their browser rather than in an account, so there is no server-side "setup complete" flag that
 * could nag them later. The tour is the substitute — shown once per browser, in the order the
 * screens actually depend on each other: custom sources first, because a reader who never opens
 * that page never sees what the rest of the interface is for.
 *
 * Two things about how it is wired are deliberate.
 *
 * **It drives the real interface, not a mock.** The steps that change page have no Next button:
 * they advance when the reader clicks the actual navigation link, so the muscle memory they leave
 * behind is for this app rather than for a tour. `TOUR_STEPS` is therefore a script, not a
 * carousel — every entry names an element that some component has opted into by spreading
 * `tourTarget()`, and a step whose element is missing is skipped rather than pointed at nothing.
 *
 * **It survives the navigation.** Next's client routing keeps this component mounted across the
 * whole walk, so the Shepherd instance is built once and outlives four route changes; each step
 * waits for its target to be rendered before showing. If the reader wanders off the route a step
 * belongs to, the popup is hidden rather than left floating over an element that no longer exists,
 * and comes back when they return.
 */

/** One step of the walk. Everything a reader reads comes from the dictionaries, as everywhere. */
interface TourStepSpec {
  readonly id: string;
  readonly title: keyof Dictionary;
  readonly text: keyof Dictionary;
  /** The element to highlight. Omitted for the opening and closing steps, which sit centred. */
  readonly target?: TourTarget;
  readonly on?: PopperPlacement;
  /** The route this step describes. Off it, the popup waits instead of pointing at nothing. */
  readonly path?: string;
  /**
   * The step is finished by clicking the highlighted element itself — the navigation links. Such
   * a step has no Next button on purpose: offering one would let the reader skip ahead to a step
   * whose page is not open, and then wait for an element that is never going to appear.
   */
  readonly advanceOnClick?: boolean;
  /**
   * Whether this instance has the thing the step talks about at all. Left out of the tour when it
   * does not — and decided from configuration rather than by looking for the element, deliberately:
   * Shepherd evaluates a step's own `showOn` *before* awaiting `beforeShowPromise`, so a
   * DOM-sniffing test runs while the route being navigated to is still empty and skips every step
   * on it. Found the honest way, by watching the presets step vanish on the way to that page.
   */
  readonly present?: () => boolean;
}

const TOUR_STEPS: readonly TourStepSpec[] = [
  {
    id: 'welcome',
    title: 'tour.welcome.title',
    text: 'tour.welcome.text',
  },
  {
    id: 'custom-sources-nav',
    title: 'tour.customSourcesNav.title',
    text: 'tour.customSourcesNav.text',
    target: 'navCustomSources',
    on: 'bottom',
    advanceOnClick: true,
  },
  {
    id: 'community-presets',
    title: 'tour.presets.title',
    text: 'tour.presets.text',
    target: 'communityPresets',
    on: 'bottom',
    path: '/custom-sources',
    present: () => Boolean(webEnv.NEXT_PUBLIC_COMMUNITY_PRESETS_URL),
  },
  {
    id: 'custom-source-form',
    title: 'tour.sourceForm.title',
    text: 'tour.sourceForm.text',
    target: 'customSourceForm',
    on: 'bottom',
    path: '/custom-sources',
  },
  {
    id: 'custom-source-list',
    title: 'tour.sourceList.title',
    text: 'tour.sourceList.text',
    target: 'customSourceList',
    on: 'top',
    path: '/custom-sources',
  },
  {
    id: 'addons-nav',
    title: 'tour.addonsNav.title',
    text: 'tour.addonsNav.text',
    target: 'navAddons',
    on: 'bottom',
    advanceOnClick: true,
  },
  {
    id: 'addons',
    title: 'tour.addons.title',
    text: 'tour.addons.text',
    target: 'addonInstall',
    on: 'bottom',
    path: '/addons',
  },
  {
    id: 'shelf-nav',
    title: 'tour.shelfNav.title',
    text: 'tour.shelfNav.text',
    target: 'navShelf',
    on: 'bottom',
    advanceOnClick: true,
  },
  {
    id: 'shelf',
    title: 'tour.shelf.title',
    text: 'tour.shelf.text',
    target: 'shelfCatalogs',
    on: 'bottom',
    path: '/shelf',
  },
  {
    id: 'language',
    title: 'tour.language.title',
    text: 'tour.language.text',
    target: 'navLanguage',
    on: 'bottom',
  },
  {
    id: 'done',
    title: 'tour.done.title',
    text: 'tour.done.text',
  },
];

/** The event the footer's "take the tour" link fires; the two live in different subtrees. */
export const START_TOUR_EVENT = 'golden:start-tour';

/** The reading view is someone in the middle of a book — never interrupted by a first-run tour. */
function autoStartAllowed(pathname: string): boolean {
  return !pathname.startsWith('/read');
}

/**
 * Resolve when the element exists, or after `timeoutMs` whatever happens.
 *
 * The timeout is not a fallback so much as a promise about the worst case: Shepherd will not show
 * a step until this settles, so a target that never renders — a page that failed to load, a
 * component behind an error boundary — must still let the tour continue rather than hang with a
 * dimmed screen and nothing on it.
 */
function waitForElement(selector: string, timeoutMs = 10_000): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  if (document.querySelector(selector)) return Promise.resolve();

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        settle();
      }
    });
    const timer = window.setTimeout(settle, timeoutMs);

    function settle(): void {
      observer.disconnect();
      window.clearTimeout(timer);
      resolve();
    }

    observer.observe(document.body, { childList: true, subtree: true });
  });
}

export function OnboardingTour() {
  const t = useT();
  const announce = useSettingChangeToast();
  const pathname = usePathname();

  const tourRef = useRef<Tour | null>(null);
  /** Hidden because the reader is on another route — as opposed to not yet shown at all. */
  const waitingForRouteRef = useRef(false);
  /**
   * A step this browser stopped on last time, whose page the reader has not opened yet.
   *
   * Kept as an id to be shown later rather than shown-then-hidden, and that is not a style choice:
   * `Step.show()` awaits `beforeShowPromise` and then displays the step regardless of anything that
   * happened while it waited, so hiding it in the meantime buys ten seconds of quiet and then the
   * popup appears anyway — over a page with none of the things it is talking about. Watched it do
   * exactly that, on the home page, describing the shelf.
   */
  const pendingResumeRef = useRef<string | null>(null);

  // The dictionary and the toast are read through refs rather than closed over: the tour is built
  // once and lives across many renders, and rebuilding it whenever a parent re-renders would
  // restart the walk from the beginning under the reader.
  const latest = useRef({ t, announce });
  latest.current = { t, announce };

  useEffect(() => {
    let cancelled = false;
    let tour: Tour | null = null;

    async function build(): Promise<void> {
      const progress = readTourProgress();
      const startNow = progress.status !== 'finished' && autoStartAllowed(window.location.pathname);
      // Built even for a browser that has already been through it: the footer link can ask for it
      // again at any moment, and the alternative is a second code path that builds it lazily and
      // therefore gets tested half as often. Shepherd is imported dynamically so a returning
      // reader downloads it only once the browser is otherwise idle, not on the critical path.
      const { default: Shepherd } = await import('shepherd.js');
      if (cancelled) return;

      const translate = latest.current.t;

      tour = new Shepherd.Tour({
        tourName: 'onboarding',
        useModalOverlay: true,
        defaultStepOptions: {
          classes: 'golden-tour',
          scrollTo: { behavior: 'smooth', block: 'center' },
          cancelIcon: { enabled: true, label: translate('tour.close') },
          modalOverlayOpeningPadding: 6,
          modalOverlayOpeningRadius: 14,
        },
      });

      const steps = TOUR_STEPS.filter((spec) => spec.present?.() ?? true);

      steps.forEach((spec, index) => {
        const selector = spec.target ? tourSelector(spec.target) : null;
        const isLast = index === steps.length - 1;

        const buttons: StepOptionsButton[] = [];
        if (index > 0) {
          buttons.push({
            text: translate('tour.back'),
            secondary: true,
            action() {
              this.back();
            },
          });
        }
        if (index === 0) {
          buttons.push({
            text: translate('tour.skip'),
            secondary: true,
            action() {
              void this.cancel();
            },
          });
        }
        // A step the reader finishes by clicking the highlighted link gets no forward button —
        // see `advanceOnClick`.
        if (!spec.advanceOnClick) {
          buttons.push({
            text: translate(isLast ? 'tour.finish' : 'tour.next'),
            action() {
              this.next();
            },
          });
        }

        const step: StepOptions = {
          id: spec.id,
          title: translate(spec.title),
          text: translate(spec.text),
          buttons,
          ...(selector
            ? { attachTo: { element: selector, ...(spec.on ? { on: spec.on } : {}) } }
            : {}),
          ...(selector && spec.advanceOnClick ? { advanceOn: { selector, event: 'click' } } : {}),
          ...(selector ? { beforeShowPromise: () => waitForElement(selector) } : {}),
        };

        tour?.addStep(step);
      });

      tour.on('show', ({ step }: { step?: { id: string } | null }) => {
        waitingForRouteRef.current = false;
        // While a step is being held for its page, the tour is parked on step one and that is not
        // where the reader is — writing it down would forget the place they had actually reached.
        if (step && !pendingResumeRef.current) rememberTourStep(step.id);
      });
      tour.on('complete', () => end(true));
      tour.on('cancel', () => end(false));

      tourRef.current = tour;

      if (startNow) {
        // Where this browser stopped, and whether that step's page is the one now open. Both are
        // decided *before* the tour starts, because starting it shows step one — and step one being
        // shown is a fact about the tour, not about the reader, so it must not be written down as
        // their progress. Hence the flag is set first and the `show` handler consults it.
        const resumed = progress.step ? tour.getById(progress.step) : undefined;
        const spec = resumed ? TOUR_STEPS.find((candidate) => candidate.id === resumed.id) : null;
        const elsewhere = Boolean(spec?.path && spec.path !== window.location.pathname);
        if (resumed && elsewhere) pendingResumeRef.current = resumed.id;

        // Not awaited, and neither is the resume: both run in one synchronous turn so the browser
        // never paints the first step before the one being resumed replaces it. An unknown id — a
        // step renamed between builds — falls through to step one, already on screen.
        void tour.start();
        if (resumed && elsewhere) {
          // A reader who left in the middle of the shelf step and came back to the home page keeps
          // the step, and is shown it when they are on its page again — a popup describing an
          // element that is nowhere on screen is worse than no popup at all.
          tour.hide();
        } else if (resumed) {
          tour.show(resumed.id);
        }
      }
    }

    /**
     * The end of the walk, however it was reached.
     *
     * This is the one write here the reader made deliberately, so it is the one that gets a popup
     * — and it has to, because the whole promise of "you will not see this again" depends on a
     * `localStorage` write that a private window is free to refuse. `outcomeOfWrite` turns that
     * refusal into the amber "nothing was kept" message instead of a green lie.
     */
    function end(completed: boolean): void {
      const persisted = finishTour();
      const { t: translate, announce: notify } = latest.current;
      notify({
        setting: 'onboarding-tour',
        outcome: outcomeOfWrite(persisted, 'set'),
        title: translate('settings.tour.title'),
        detail: translate(completed ? 'settings.tour.finished' : 'settings.tour.skipped'),
      });
    }

    function onStartRequest(): void {
      const active = tourRef.current;
      if (!active) return;
      if (active.isActive()) active.cancel().catch(() => undefined);
      // Asked for from the beginning, so nothing is owed to the step this browser stopped on.
      pendingResumeRef.current = null;
      waitingForRouteRef.current = false;
      void active.start();
    }

    void build();
    window.addEventListener(START_TOUR_EVENT, onStartRequest);

    return () => {
      cancelled = true;
      window.removeEventListener(START_TOUR_EVENT, onStartRequest);
      // `complete`/`cancel` are not fired by this: an unmount is the page going away, not the
      // reader deciding anything, and recording it as "seen" would eat the tour on a reload. The
      // overlay is torn down by hand for the same reason it exists — it is an SVG in `body`, and
      // nothing in React's tree would take it away.
      tour?.hide();
      tour?.modal?.destroy();
      tour?.steps.forEach((step) => step.destroy());
      tourRef.current = null;
    };
  }, []);

  // Leaving the route a step describes hides the popup rather than letting it hang over an element
  // that has just been unmounted; coming back brings it out again.
  useEffect(() => {
    const tour = tourRef.current;
    if (!tour?.isActive()) return;

    // The step held back from a previous visit, now that its page is open.
    const pending = pendingResumeRef.current;
    if (pending) {
      const spec = TOUR_STEPS.find((candidate) => candidate.id === pending);
      if (!spec?.path || spec.path === pathname) {
        pendingResumeRef.current = null;
        tour.show(pending);
      }
      return;
    }

    const current = tour.getCurrentStep();
    if (!current) return;

    const spec = TOUR_STEPS.find((candidate) => candidate.id === current.id);
    const belongsHere = !spec?.path || spec.path === pathname;

    if (!belongsHere) {
      waitingForRouteRef.current = true;
      tour.hide();
    } else if (waitingForRouteRef.current) {
      waitingForRouteRef.current = false;
      void current.show();
    }
  }, [pathname]);

  return null;
}
