import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'BookTranslate Finder',
  description: 'An open book translation aggregator: languages, editions, legal sources.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
        <footer className="container" style={{ marginTop: '3rem', paddingBottom: '2rem' }}>
          <p className="muted" style={{ fontSize: '0.85em' }}>
            Legal sources only: direct downloads exclusively for public domain and openly licensed
            works; copyrighted books — purchase or library lending. Every link carries an explicit
            rights status.
          </p>
        </footer>
      </body>
    </html>
  );
}
