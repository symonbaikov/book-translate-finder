'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { EditionPricesResponse } from '@golden/contracts';
import { ApiRequestError, getEditionPrices } from '../lib/api-client';
import { COUNTRY_CHANGE_EVENT, readCountry } from '../lib/country';
import { useLocale, useT } from '../i18n/I18nProvider';
import type { Translate } from '../i18n/dictionary';

/**
 * Module C in the page: every shop that can be reached for this edition, grouped by binding, with
 * a real price where one is published and an honest blank where none is.
 *
 * The blank is the point. Only Google Play publishes a price through an open API, so most rows say
 * "price not published" — and that is a truer answer than a plausible number, which is what a
 * scraped shop page would give us and what the project's invariant forbids anyway.
 *
 * **It loads on click, not on mount.** A popular work's card lists dozens of editions, and
 * fetching on mount fired one request per row the moment the page opened — enough to trip the
 * API's own 60-per-minute rate limit from a single reader, for prices almost none of which they
 * were going to read. Caught the first time this rendered against a real book, not by a test.
 * Same reasoning, and the same shape, as `EditionLinks`.
 */

type State =
  | { kind: 'collapsed' }
  | { kind: 'loading' }
  | { kind: 'loaded'; prices: EditionPricesResponse }
  | { kind: 'error'; message: string };

export function EditionPrices({ editionId }: { editionId: string }) {
  const t = useT();
  const locale = useLocale();
  const [state, setState] = useState<State>({ kind: 'collapsed' });
  // Same stale-response guard as EditionLinks: a country switch mid-flight must not be overwritten
  // by the slower answer for the previous country.
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setState({ kind: 'loading' });
    try {
      const prices = await getEditionPrices(editionId, readCountry());
      if (requestId !== requestIdRef.current) return;
      setState({ kind: 'loaded', prices });
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setState({
        kind: 'error',
        message: error instanceof ApiRequestError ? error.message : t('links.failed'),
      });
    }
  }, [editionId, t]);

  // Only an already-open panel refetches on a country change; a collapsed one must stay collapsed,
  // or switching country would fire a request for every edition on the page at once.
  useEffect(() => {
    function onCountryChange(): void {
      setState((current) => {
        if (current.kind === 'collapsed') return current;
        void load();
        return { kind: 'loading' };
      });
    }
    window.addEventListener(COUNTRY_CHANGE_EVENT, onCountryChange);
    return () => window.removeEventListener(COUNTRY_CHANGE_EVENT, onCountryChange);
  }, [load]);

  return (
    <section style={{ marginTop: '0.5rem' }}>
      <button
        type="button"
        className="button--secondary"
        aria-expanded={state.kind === 'loaded'}
        onClick={() => {
          if (state.kind === 'collapsed' || state.kind === 'error') {
            void load();
            return;
          }
          requestIdRef.current += 1; // drop any in-flight response
          setState({ kind: 'collapsed' });
        }}
      >
        {t('prices.title')}
      </button>
      <div aria-live="polite">
        {state.kind === 'loading' && <p className="muted">{t('prices.loading')}</p>}
        {state.kind === 'error' && <p className="error-box">{state.message}</p>}
        {state.kind === 'loaded' && (
          <div className="animate-in">
            <PriceGroups prices={state.prices} locale={locale} t={t} />
          </div>
        )}
      </div>
    </section>
  );
}

function PriceGroups({
  prices,
  locale,
  t,
}: {
  prices: EditionPricesResponse;
  locale: string;
  t: Translate;
}) {
  if (prices.groups.length === 0) {
    return <p className="muted">{t('links.none')}</p>;
  }

  return (
    <>
      {prices.groups.map((group) => (
        <div key={group.format} style={{ marginTop: '0.6rem' }}>
          <h4 style={{ margin: '0 0 0.3rem' }}>{t(`prices.format.${group.format}` as never)}</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {group.offers.map((offer) => (
              <li key={`${offer.providerId}-${offer.url}`} style={{ marginTop: '0.3rem' }}>
                <a href={offer.url} target="_blank" rel="noopener noreferrer">
                  {offer.providerName}
                </a>{' '}
                {offer.amount !== null && offer.currency ? (
                  <strong>{formatMoney(offer.amount, offer.currency, locale)}</strong>
                ) : (
                  <span className="muted">{t('prices.unknown')}</span>
                )}
                {offer.note && <span className="muted"> · {offer.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {/* A shop that failed is named rather than dropped: a shorter list that looks complete is
          the misleading outcome the API's `degraded` field exists to prevent. */}
      {prices.degraded.length > 0 && (
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          {t('prices.degraded', {
            providers: prices.degraded.map((entry) => entry.providerId).join(', '),
          })}
        </p>
      )}
    </>
  );
}

/**
 * `Intl.NumberFormat` prints the currency the way the reader's own locale writes it, and knows
 * each currency's decimal count — so JPY comes out as ¥1,200 and not ¥1,200.00.
 */
function formatMoney(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}
