import { CoverSkeleton } from '../../../components/CoverImage';

/**
 * Route-level skeleton (Next.js app-router convention): shown instantly while the work card's
 * server component fetches the card and editions — the page keeps its final shape (cover slot,
 * heading, edition cards) instead of a blank screen during SSR navigation.
 */
export default function WorkPageLoading() {
  return (
    <main id="main-content" className="container" aria-busy="true">
      <div className="skeleton skeleton--text" style={{ width: '7rem' }} />

      <div className="media-row" style={{ marginTop: '1.5rem' }}>
        <CoverSkeleton large />
        <div className="media-row__body">
          <div className="skeleton skeleton--text" style={{ width: '55%', height: '1.6rem' }} />
          <div className="skeleton skeleton--text" style={{ width: '40%' }} />
          <div className="skeleton skeleton--text" style={{ width: '25%' }} />
        </div>
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <div className="skeleton skeleton--text" style={{ width: '10rem', height: '1.2rem' }} />
        {[0, 1, 2].map((i) => (
          <div key={i} className="card" style={{ marginTop: '0.85rem' }}>
            <div className="media-row">
              <CoverSkeleton />
              <div className="media-row__body">
                <div className="skeleton skeleton--text" style={{ width: '50%' }} />
                <div className="skeleton skeleton--text" style={{ width: '70%' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
