import { SearchBox } from '../components/SearchBox';

export default function HomePage() {
  return (
    <main id="main-content" className="container">
      <h1>BookTranslate Finder</h1>
      <p className="muted">
        Открытый агрегатор переводов книг: языки, издания и легальные источники.
      </p>
      <SearchBox />
    </main>
  );
}
