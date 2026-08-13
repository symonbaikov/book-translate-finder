import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'BookTranslate Finder',
  description: 'Открытый агрегатор переводов книг: языки, издания, легальные источники.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <a className="skip-link" href="#main-content">
          Перейти к содержимому
        </a>
        {children}
        <footer className="container" style={{ marginTop: '3rem', paddingBottom: '2rem' }}>
          <p className="muted" style={{ fontSize: '0.85em' }}>
            Только легальные источники: прямое скачивание — исключительно для public domain и
            открытых лицензий; книги под авторским правом — покупка или библиотечное заимствование.
            Каждая ссылка несёт явный правовой статус.
          </p>
        </footer>
      </body>
    </html>
  );
}
