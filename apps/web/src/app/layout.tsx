import type { Metadata } from 'next';
import type { ReactNode } from 'react';
// Order is the cascade: faces, then the tokens that name them, then the base layer that spends
// both. Imported here rather than through `@import` inside globals.css so the order is stated in
// one readable place and cannot be reshuffled by a bundler's idea of dependency order.
import '../styles/fonts.css';
import '../styles/tokens.css';
import './globals.css';
import { I18nProvider } from '../i18n/I18nProvider';
import { getDictionary } from '../i18n/server';
import { isRtl } from '../i18n/locales';
import { makeTranslate } from '../i18n/dictionary';
import { OnboardingTour } from '../components/OnboardingTour';
import { SessionProvider } from '../components/SessionProvider';
import { SettingsToaster } from '../components/SettingsToaster';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';

export const metadata: Metadata = {
  title: 'Golden Library',
  icons: { icon: '/logo.svg' },
  description: 'An open book translation aggregator: languages, editions, legal sources.',
};

/**
 * Which font files to fetch before the browser has read a single glyph.
 *
 * Only one script per locale is preloaded, not all four subsets: a Russian reader who is handed
 * the Latin-Extended file up front has paid 84 KB for glyphs that may never appear on the page.
 * The other subsets still load — lazily, the moment a character in their `unicode-range` is
 * rendered, which is exactly what `unicode-range` is for. Locales whose script we do not ship
 * (ar, ja, ko, zh) get the Latin files anyway: their pages are still full of Latin book titles.
 */
function preloadedSubset(locale: string): 'cyrillic' | 'latin' {
  return locale === 'ru' || locale === 'uk' ? 'cyrillic' : 'latin';
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale, dictionary } = await getDictionary();
  const t = makeTranslate(dictionary);
  const subset = preloadedSubset(locale);

  return (
    <html lang={locale} dir={isRtl(locale) ? 'rtl' : 'ltr'}>
      <head>
        {/* `crossOrigin` is required even for a same-origin font: without it the preload is made
            as a plain fetch and the font request is issued a second time, anonymously. */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href={`/fonts/inter-${subset}.woff2`}
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href={`/fonts/literata-${subset}.woff2`}
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          {t('nav.skipToContent')}
        </a>
        <I18nProvider locale={locale} dictionary={dictionary}>
          <SessionProvider>
            <SiteHeader />
            {children}
            {/* The footer is inside the provider rather than after it because it now holds a
                client control — the link back into the walkthrough — and a client component
                outside falls back to the English dictionary, which would leave one English
                sentence at the bottom of a Japanese page. */}
            <SiteFooter />
            {/* Inside the provider: every popup is written by the same dictionary as the page
                that triggered it. */}
            <SettingsToaster dir={isRtl(locale) ? 'rtl' : 'ltr'} />
            {/* Last, and mounted once for the whole application: the walkthrough crosses four
                routes, and this is the only place that survives all of them. */}
            <OnboardingTour />
          </SessionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
