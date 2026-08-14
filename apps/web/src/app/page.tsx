import { FeaturedBooks } from '../components/FeaturedBooks';
import { Recommendations } from '../components/Recommendations';
import { SearchBox } from '../components/SearchBox';
import { getT } from '../i18n/server';

export default async function HomePage() {
  const t = await getT();

  return (
    <main id="main-content" className="container">
      <h1>{t('home.tagline')}</h1>
      <p className="muted">{t('home.subtitle')}</p>
      <SearchBox />
      {/* Above the curated lists: a returning reader's own trail is more useful than an
          editor's pick, and a first-time visitor sees nothing here at all. */}
      <Recommendations />
      <FeaturedBooks />
    </main>
  );
}
