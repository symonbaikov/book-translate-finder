import type { Dictionary } from './dictionary';
import { en } from './dictionaries/en';
import type { Locale } from './locales';

/**
 * Dictionaries are imported dynamically so a reader only downloads the language they chose —
 * every dictionary in one bundle would be shipped to everyone to be used by nobody.
 *
 * The map is written out rather than built from a template string because bundlers can only
 * follow static import specifiers; `import(\`./dictionaries/${locale}\`)` would silently pull in
 * every file or none, depending on the bundler.
 */
const LOADERS: Record<Locale, () => Promise<{ default: Dictionary }>> = {
  en: async () => ({ default: en }),
  ru: async () => ({ default: (await import('./dictionaries/ru')).ru }),
  uk: async () => ({ default: (await import('./dictionaries/uk')).uk }),
  de: async () => ({ default: (await import('./dictionaries/de')).de }),
  fr: async () => ({ default: (await import('./dictionaries/fr')).fr }),
  es: async () => ({ default: (await import('./dictionaries/es')).es }),
  pt: async () => ({ default: (await import('./dictionaries/pt')).pt }),
  it: async () => ({ default: (await import('./dictionaries/it')).it }),
  nl: async () => ({ default: (await import('./dictionaries/nl')).nl }),
  pl: async () => ({ default: (await import('./dictionaries/pl')).pl }),
  tr: async () => ({ default: (await import('./dictionaries/tr')).tr }),
  ar: async () => ({ default: (await import('./dictionaries/ar')).ar }),
  ja: async () => ({ default: (await import('./dictionaries/ja')).ja }),
  zh: async () => ({ default: (await import('./dictionaries/zh')).zh }),
  ko: async () => ({ default: (await import('./dictionaries/ko')).ko }),
  bg: async () => ({ default: (await import('./dictionaries/bg')).bg }),
  cs: async () => ({ default: (await import('./dictionaries/cs')).cs }),
  da: async () => ({ default: (await import('./dictionaries/da')).da }),
  el: async () => ({ default: (await import('./dictionaries/el')).el }),
  et: async () => ({ default: (await import('./dictionaries/et')).et }),
  fi: async () => ({ default: (await import('./dictionaries/fi')).fi }),
  ga: async () => ({ default: (await import('./dictionaries/ga')).ga }),
  hr: async () => ({ default: (await import('./dictionaries/hr')).hr }),
  hu: async () => ({ default: (await import('./dictionaries/hu')).hu }),
  lt: async () => ({ default: (await import('./dictionaries/lt')).lt }),
  lv: async () => ({ default: (await import('./dictionaries/lv')).lv }),
  mt: async () => ({ default: (await import('./dictionaries/mt')).mt }),
  ro: async () => ({ default: (await import('./dictionaries/ro')).ro }),
  sk: async () => ({ default: (await import('./dictionaries/sk')).sk }),
  sl: async () => ({ default: (await import('./dictionaries/sl')).sl }),
  sv: async () => ({ default: (await import('./dictionaries/sv')).sv }),
  no: async () => ({ default: (await import('./dictionaries/no')).no }),
  is: async () => ({ default: (await import('./dictionaries/is')).is }),
  sr: async () => ({ default: (await import('./dictionaries/sr')).sr }),
  bs: async () => ({ default: (await import('./dictionaries/bs')).bs }),
  sq: async () => ({ default: (await import('./dictionaries/sq')).sq }),
  mk: async () => ({ default: (await import('./dictionaries/mk')).mk }),
  be: async () => ({ default: (await import('./dictionaries/be')).be }),
  ca: async () => ({ default: (await import('./dictionaries/ca')).ca }),
  gl: async () => ({ default: (await import('./dictionaries/gl')).gl }),
  eu: async () => ({ default: (await import('./dictionaries/eu')).eu }),
  cy: async () => ({ default: (await import('./dictionaries/cy')).cy }),
  lb: async () => ({ default: (await import('./dictionaries/lb')).lb }),
  hy: async () => ({ default: (await import('./dictionaries/hy')).hy }),
  ka: async () => ({ default: (await import('./dictionaries/ka')).ka }),
  kk: async () => ({ default: (await import('./dictionaries/kk')).kk }),
};

export async function loadDictionary(locale: Locale): Promise<Dictionary> {
  const load = LOADERS[locale];
  if (!load) return en;
  return (await load()).default;
}
