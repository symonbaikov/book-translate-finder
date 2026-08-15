import { Card, Page, Skeleton } from '../../../ui';
import styles from './work.module.css';

/**
 * Route-level skeleton (Next.js app-router convention): shown instantly while the work card's
 * server component fetches the card and editions.
 *
 * It reuses the page's own layout classes rather than approximating them, which is the only way
 * the placeholder and the real page can stay the same shape — a skeleton that guesses its own
 * geometry becomes a lie the first time the page's layout changes, and the reader sees the content
 * jump on arrival.
 */
export default function WorkPageLoading() {
  return (
    <Page>
      <div aria-busy="true">
        <Skeleton shape="text" width="7rem" />

        <div className={styles.hero}>
          <Skeleton shape="poster" />
          <div>
            <Skeleton shape="title" width="60%" />
            <Skeleton shape="text" width="40%" />
            <Skeleton shape="text" width="25%" />
          </div>
        </div>

        <Skeleton shape="title" width="10rem" />
        {[0, 1, 2].map((i) => (
          <Card key={i} className={styles.edition}>
            <Skeleton shape="poster" />
            <div>
              <Skeleton shape="text" width="50%" />
              <Skeleton shape="text" width="70%" />
              <Skeleton shape="text" width="30%" />
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );
}
