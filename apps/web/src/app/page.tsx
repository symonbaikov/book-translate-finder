import { SearchBox } from '../components/SearchBox';

export default function HomePage() {
  return (
    <main id="main-content" className="container">
      <h1>BookTranslate Finder</h1>
      <p className="muted">
        An open book translation aggregator: languages, editions, and legal sources.
      </p>
      <SearchBox />
    </main>
  );
}
