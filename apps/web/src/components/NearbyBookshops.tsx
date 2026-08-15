'use client';

import { useCallback, useRef, useState } from 'react';
import { OverpassStoreLocator, type PhysicalStoreResult } from '@golden/plugins';
import {
  GeolocationError,
  locateFromDevice,
  locateFromPlace,
  type Coordinates,
} from '../lib/geolocation';
import { useT } from '../i18n/I18nProvider';
import type { Translate } from '../i18n/dictionary';

/**
 * Module B in the page: bookshops near the reader.
 *
 * **Every request here leaves the browser directly.** The reader's coordinates are never sent to
 * this site's API — the OpenStreetMap lookup runs in this component, against a position already
 * rounded to about 110 m (docs/adr/0007). That is the reason the plugin is imported here rather
 * than called through an endpoint.
 *
 * **It says "near you", never "in stock".** OpenStreetMap knows where bookshops are; no open
 * dataset says what any of them has on the shelf, so each result carries the note explaining that
 * rather than an availability the app cannot know (docs/plan.md 4.7).
 */

const RADIUS_KM = 5;

type State =
  | { kind: 'idle' }
  | { kind: 'locating' }
  | { kind: 'loaded'; origin: Coordinates; stores: readonly PhysicalStoreResult[] }
  | { kind: 'error'; message: string };

export function NearbyBookshops({ isbn }: { isbn?: string | null }) {
  const t = useT();
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [place, setPlace] = useState('');
  // One locator for the component's lifetime — it holds no per-request state, only configuration.
  const locatorRef = useRef(new OverpassStoreLocator());

  const search = useCallback(
    async (locate: () => Promise<Coordinates>) => {
      setState({ kind: 'locating' });
      try {
        const origin = await locate();
        const stores = await locatorRef.current.findStores({
          editionIsbn: isbn ?? '',
          userLat: origin.lat,
          userLng: origin.lng,
          radiusKm: RADIUS_KM,
        });
        setState({ kind: 'loaded', origin, stores });
      } catch (error) {
        // The two failures need different words. A refused permission is not something to
        // apologise for — the manual field is right there, so the message points at it. An
        // Overpass outage (a live run met a real 504 from the public endpoint) is our problem,
        // not the reader's, and telling them to retype their city would send them in circles.
        setState({
          kind: 'error',
          message:
            error instanceof GeolocationError ? t('stores.failed') : t('stores.lookupFailed'),
        });
      }
    },
    [isbn, t],
  );

  return (
    <section style={{ marginTop: '1rem' }}>
      <h3>{t('stores.title')}</h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'flex-end' }}>
        <button
          type="button"
          className="button--secondary"
          onClick={() => void search(locateFromDevice)}
          disabled={state.kind === 'locating'}
        >
          {state.kind === 'locating' ? t('stores.locating') : t('stores.useMyLocation')}
        </button>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void search(() => locateFromPlace(place));
          }}
          style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-end' }}
        >
          <div>
            <label htmlFor="nearby-place">{t('stores.placeLabel')}</label>
            <input
              id="nearby-place"
              type="text"
              value={place}
              onChange={(event) => setPlace(event.target.value)}
              autoComplete="postal-code"
            />
          </div>
          <button type="submit" className="button--secondary" disabled={!place.trim()}>
            {t('stores.find')}
          </button>
        </form>
      </div>

      <p className="muted" style={{ marginTop: '0.4rem' }}>
        {t('stores.privacy')}
      </p>

      <div aria-live="polite">
        {state.kind === 'error' && <p className="error-box">{state.message}</p>}
        {state.kind === 'loaded' && <StoreList stores={state.stores} t={t} />}
      </div>
    </section>
  );
}

function StoreList({ stores, t }: { stores: readonly PhysicalStoreResult[]; t: Translate }) {
  if (stores.length === 0) {
    return <p className="muted">{t('stores.none', { radius: RADIUS_KM })}</p>;
  }

  return (
    <>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
        {stores.map((store) => (
          <li key={store.storeId} style={{ marginTop: '0.5rem' }}>
            <strong>
              {store.website ? (
                <a href={store.website} target="_blank" rel="noopener noreferrer">
                  {store.storeName}
                </a>
              ) : (
                store.storeName
              )}
            </strong>{' '}
            <span className="muted">{t('stores.distance', { distance: store.distanceKm })}</span>
            {store.address && (
              <>
                <br />
                <span className="muted">{store.address}</span>
              </>
            )}
            {store.openingHours && (
              <>
                <br />
                <span className="muted">{store.openingHours}</span>
              </>
            )}
          </li>
        ))}
      </ul>
      <p className="muted" style={{ marginTop: '0.5rem' }}>
        {t('stores.stockUnknown')}
      </p>
    </>
  );
}
