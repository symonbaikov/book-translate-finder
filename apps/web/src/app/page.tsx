import { FeaturedBooks } from '../components/FeaturedBooks';
import { SearchBox } from '../components/SearchBox';
import { getT } from '../i18n/server';

export default async function HomePage() {
  const t = await getT();

  return (
    <main id="main-content" className="container">
      <h1>{t('home.tagline')}</h1>
      <p className="muted">{t('home.subtitle')}</p>
      <SearchBox />
      <FeaturedBooks />
    </main>
  );
}
