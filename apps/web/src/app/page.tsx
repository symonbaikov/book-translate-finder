import { webEnv } from '../config/web-env';

// Phase 1.0 skeleton: proves the app boots and the config layer fails fast on missing env.
// Search, the book card, editions and legal links land in Phase 1.5 (docs/plan.md §1.5).
export default function HomePage() {
  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: '2rem',
        maxWidth: 640,
        margin: '0 auto',
      }}
    >
      <h1>BookTranslate Finder</h1>
      <p>
        Открытый агрегатор переводов книг: языки, издания и легальные источники. Поиск и карточка
        книги появятся в Фазе 1.5.
      </p>
      <p style={{ color: '#666', fontSize: '0.875rem' }}>API: {webEnv.NEXT_PUBLIC_API_URL}</p>
    </main>
  );
}
