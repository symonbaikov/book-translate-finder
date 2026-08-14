import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { SessionProvider } from '../components/SessionProvider';
import { SiteHeader } from '../components/SiteHeader';

export const metadata: Metadata = {
  title: 'BookTranslate Finder',
  description: 'An open book translation aggregator: languages, editions, legal sources.',
};

const REPOSITORY_URL = 'https://github.com/symonbaikov/book-translate-finder';

/**
 * GitHub's mark, inlined as SVG rather than fetched from a CDN or an icon package: the page must
 * stay renderable with no third-party requests, and one 24px glyph is not worth a dependency.
 */
function GitHubMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SessionProvider>
          <SiteHeader />
          {children}
        </SessionProvider>
        <footer className="site-footer">
          <div className="container">
            <p className="muted" style={{ fontSize: '0.85em', marginTop: 0 }}>
              Legal sources only: direct downloads exclusively for public domain and openly licensed
              works; copyrighted books — purchase or library lending. Every link carries an explicit
              rights status.
            </p>
            <div className="site-footer__row">
              <a className="site-footer__repo" href={REPOSITORY_URL} rel="noopener noreferrer">
                <GitHubMark />
                <span>
                  <strong>Open source</strong> — MIT licensed, self-hostable. View the code on
                  GitHub.
                </span>
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
