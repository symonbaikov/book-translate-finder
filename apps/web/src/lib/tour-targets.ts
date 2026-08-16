/**
 * The handful of elements the onboarding tour points at, named in one place.
 *
 * A tour is the one feature that reaches across the whole interface and holds on to other
 * components' DOM. Left to itself that becomes a scatter of CSS selectors — `.nav a:nth-child(3)`,
 * `form.form` — that no one editing those components can see, and that break silently the first
 * time a class is renamed. So the contract is explicit and one-directional: a component that wants
 * to be tourable spreads `tourTarget('…')` onto an element it owns, and the tour finds it by that
 * name and by nothing else. Deleting the attribute is then a visible act, and TypeScript keeps the
 * two ends spelling the same word.
 *
 * Steps whose target may legitimately be absent — the Telegram link is only rendered when this
 * instance was given a URL, and the account link waits for the session — are skipped by the tour
 * rather than pointing at nothing.
 */

export const TOUR_TARGETS = {
  navCustomSources: 'nav-custom-sources',
  navAddons: 'nav-addons',
  navShelf: 'nav-shelf',
  navAccount: 'nav-account',
  navLanguage: 'nav-language',
  communityPresets: 'community-presets',
  customSourceForm: 'custom-source-form',
  customSourceList: 'custom-source-list',
  addonInstall: 'addon-install',
  shelfCatalogs: 'shelf-catalogs',
} as const;

export type TourTarget = keyof typeof TOUR_TARGETS;

/** Spread onto the element a step should highlight: `<form {...tourTarget('customSourceForm')}>`. */
export function tourTarget(target: TourTarget): { 'data-tour': string } {
  return { 'data-tour': TOUR_TARGETS[target] };
}

/** The same element, as a selector — the tour's half of the contract. */
export function tourSelector(target: TourTarget): string {
  return `[data-tour="${TOUR_TARGETS[target]}"]`;
}
