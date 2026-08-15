import { FeaturedBooks } from '../components/FeaturedBooks';
import { FreeBooks } from '../components/FreeBooks';
import { Recommendations } from '../components/Recommendations';
import { SearchBox } from '../components/SearchBox';
import { getLocale, getT } from '../i18n/server';
import { Page } from '../ui';
import styles from './home.module.css';

export default async function HomePage() {
  const t = await getT();
  // The *interface* language, not the book-language cookie, and deliberately so. That cookie
  // records a filter someone once clicked on one work card; this row is headed "books in your
  // language", and answering it with the language of a filter they set last week would make the
  // heading false. The cookie keeps its job on the genre pages, where the reader is choosing which
  // editions to see.
  const locale = await getLocale();

  return (
    <Page>
      <div className={styles.hero}>
        <h1 className={styles.title}>{t('home.tagline')}</h1>
        <p className={styles.subtitle}>{t('home.subtitle')}</p>
        <SearchBox />
      </div>
      {/* Above the curated lists: a returning reader's own trail is more useful than an
          editor's pick, and a first-time visitor sees nothing here at all. */}
      <Recommendations />
      {/* Above the curated lists too: "you can read this one right now, for nothing" is the
          strongest thing this site can say, and it is worth saying before a wall of books that
          mostly have to be bought. */}
      <FreeBooks />
      <FeaturedBooks language={locale} />
    </Page>
  );
}
