import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'BookTranslate Finder — prototype',
  description: 'Phase 0 throwaway prototype — see docs/plan.md §Фаза 0.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
