'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { EditionRating, TranslatorRating, WorkRatingsResponse } from '@golden/contracts';
import { getWorkRatings } from '../lib/api-client';
import { useT } from '../i18n/I18nProvider';

/**
 * What readers made of each printing, under the printing.
 *
 * **What this is not.** No open source rates a translation. Google Books — the one API that scores
 * a *volume* rather than a work — publishes what its readers thought of the book they bought,
 * which for a translated edition is the novel, the translator, the typesetting and the shipping
 * all at once. So every number here is labelled with whose readers gave it and how many there
 * were, the section says in one sentence what it is, and nothing in the UI is allowed to phrase it
 * as a verdict on a translator's work.
 *
 * **What it is for.** Two Russian editions, two translators, two crowds. Alone, "4.3" says almost
 * nothing; next to "3.6 from four hundred readers" it is the closest thing to a translation signal
 * that open data can give a reader. That is why the per-translator line exists and why it only
 * appears where a language has more than one translator to compare.
 *
 * **One request for the whole page.** `EditionLinks` and `EditionPrices` both had to retreat behind
 * a button after fetching per row tripped the API's own rate limit from a single reader. Ratings
 * have to be visible without a click to be worth anything, so the fetch is per *work*: one request
 * on mount, shared through context with every card.
 */

type State =
  | { kind: 'loading' }
  | { kind: 'loaded'; ratings: WorkRatingsResponse }
  /** Ratings are an extra. When the source is down the page loses a decoration, not its answer. */
  | { kind: 'unavailable' };

const RatingsContext = createContext<State>({ kind: 'unavailable' });

export function TranslationRatingsProvider({
  workId,
  language,
  editionIds,
  children,
}: {
  workId: string;
  /** The edition list's own language filter, so both lists describe the same set. */
  language?: string | null;
  /**
   * The editions this page renders, in the order it renders them. Sent to the API because it
   * cannot know: the list arrives unordered and is sorted here, so on a work with hundreds of
   * printings the visible rows are not the ones a server would have picked.
   */
  editionIds: readonly string[];
  children: ReactNode;
}) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  // A stable dependency: the array is rebuilt on every render, the string is not.
  const scope = editionIds.join(',');

  useEffect(() => {
    let current = true;
    setState({ kind: 'loading' });

    getWorkRatings(workId, language ?? null, scope ? scope.split(',') : [])
      .then((ratings) => {
        if (current) setState({ kind: 'loaded', ratings });
      })
      .catch(() => {
        if (current) setState({ kind: 'unavailable' });
      });

    return () => {
      current = false;
    };
  }, [workId, language, scope]);

  return <RatingsContext.Provider value={state}>{children}</RatingsContext.Provider>;
}

function useRatings(): WorkRatingsResponse | null {
  const state = useContext(RatingsContext);
  return state.kind === 'loaded' ? state.ratings : null;
}

function findEdition(
  ratings: WorkRatingsResponse | null,
  editionId: string,
): EditionRating | undefined {
  return ratings?.editions.find((entry) => entry.editionId === editionId);
}

function findTranslator(
  ratings: WorkRatingsResponse | null,
  translator: string | null,
  language: string,
): TranslatorRating | undefined {
  if (!translator) return undefined;
  return ratings?.translators.find(
    (row) => row.language === language && row.translator.toLowerCase() === translator.toLowerCase(),
  );
}

/**
 * The rating of one edition, plus its translator's standing where there is a rival to compare
 * them with. Renders nothing at all when this edition has no rating — a row of "no data" under
 * every unrated printing would bury the ones that do.
 */
export function EditionRatingLine({
  editionId,
  translator,
  language,
  className,
}: {
  editionId: string;
  translator: string | null;
  /** The edition's own language code — a translator's average never crosses languages. */
  language: string;
  /** `| undefined` because a CSS-module class is typed that way (`exactOptionalPropertyTypes`). */
  className?: string | undefined;
}) {
  const t = useT();
  const ratings = useRatings();
  const rating = findEdition(ratings, editionId);
  const byTranslator = findTranslator(ratings, translator, language);
  const reviewLinks = ratings?.reviewLinks.filter((link) => link.editionId === editionId) ?? [];

  // A link with no number is the normal case on an instance with no Google Books key, and it is
  // worth a line of its own: the reader still gets to the opinions about this exact printing.
  if (!rating && reviewLinks.length === 0) return null;

  return (
    <p className={className}>
      {rating ? (
        <>
          <span aria-hidden="true">★ </span>
          {t('ratings.edition', {
            average: rating.average,
            outOf: rating.outOf,
            votes: rating.votes,
            source: rating.providerName,
          })}
          {rating.lowConfidence ? ` · ${t('ratings.lowConfidence')}` : ''}
          {rating.url ? (
            <>
              {' · '}
              {/* The source is named in the sentence just before, so the link says only what
                  it is. */}
              <a href={rating.url} target="_blank" rel="noopener noreferrer nofollow">
                {t('ratings.reviews')}
              </a>
            </>
          ) : null}
        </>
      ) : null}
      {reviewLinks.map((link, index) => (
        <span key={link.url}>
          {rating || index > 0 ? ' · ' : ''}
          {/* Named, because this one leaves for a site the instance neither reads nor vouches
              for — and because "reviews of this edition" is the whole claim being made. */}
          <a href={link.url} target="_blank" rel="noopener noreferrer nofollow">
            {t('ratings.reviewsOn', { source: link.providerName })}
          </a>
        </span>
      ))}
      {byTranslator ? (
        <>
          <br />
          {t('ratings.translator', {
            name: byTranslator.translator,
            average: byTranslator.average,
            outOf: byTranslator.outOf,
            editions: byTranslator.ratedEditions,
            votes: byTranslator.votes,
          })}
        </>
      ) : null}
    </p>
  );
}

/**
 * The one sentence that says what these numbers are, and the gaps in them.
 *
 * Rendered once above the edition list rather than under every card: repeated twenty times it
 * would be wallpaper, and a caveat nobody reads is the same as no caveat. The gaps are here for
 * the same reason `degraded` travels in the price response — a reader comparing four translations
 * has to know the page could only ask about two of them.
 */
export function TranslationRatingsNote({ className }: { className?: string | undefined }) {
  const t = useT();
  const ratings = useRatings();

  if (!ratings || (ratings.editions.length === 0 && ratings.reviewLinks.length === 0)) return null;

  const sources = [...new Set(ratings.editions.map((entry) => entry.providerName))].join(', ');
  const reviewSources = [...new Set(ratings.reviewLinks.map((link) => link.providerName))].join(
    ', ',
  );

  return (
    <p className={className}>
      {/* Two sentences, either of which may stand alone: an instance with no Google Books key has
          links and no numbers, and the note has to describe what is actually on the page. */}
      {ratings.editions.length > 0 ? t('ratings.note', { sources }) : t('ratings.noteNoRatings')}
      {ratings.reviewLinks.length > 0
        ? ` ${t('ratings.noteReviews', { sources: reviewSources })}`
        : ''}
      {ratings.withoutIsbn > 0
        ? ` ${t('ratings.gapWithoutIsbn', { count: ratings.withoutIsbn })}`
        : ''}
      {ratings.notLookedUp > 0
        ? ` ${t('ratings.gapNotLookedUp', { count: ratings.notLookedUp })}`
        : ''}
    </p>
  );
}
