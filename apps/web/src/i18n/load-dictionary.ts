import type { Dictionary } from './dictionary';
import { en } from './dictionaries/en';
import type { Locale } from './locales';

/**
 * Dictionaries are imported dynamically so a reader only downloads the language they chose —
 * fifteen dictionaries in one bundle would be shipped to everyone to be used by nobody.
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
};

export async function loadDictionary(locale: Locale): Promise<Dictionary> {
  const load = LOADERS[locale];
  if (!load) return en;
  return (await load()).default;
}
