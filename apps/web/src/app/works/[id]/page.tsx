import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { EditionFreeDownload, EditionSummary } from '@golden/contracts';
import { CountrySelector } from '../../../components/CountrySelector';
import { EditionComparison } from '../../../components/EditionComparison';
import { BookmarkButton } from '../../../components/BookmarkButton';
import { AddonSources } from '../../../components/AddonSources';
import { EditionLinks } from '../../../components/EditionLinks';
import { EditionPrices } from '../../../components/EditionPrices';
import { NearbyBookshops } from '../../../components/NearbyBookshops';
import { getWorkCard, listEditions } from '../../../lib/api-client';
import { languageName } from '../../../lib/language-names';
import { parseBookLanguage } from '../../../lib/book-language';
import { readBookLanguageFromCookie } from '../../../lib/book-language.server';
import { TranslationAnswer } from '../../../components/TranslationAnswer';
import { getLocale, getT } from '../../../i18n/server';
import { RememberBookLanguage } from '../../../components/RememberBookLanguage';
import { RecordVisit } from '../../../components/RecordVisit';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  ChipLink,
  Cluster,
  Field,
  Page,
  Poster,
  Section,
  TextInput,
} from '../../../ui';
import type { Translate } from '../../../i18n/dictionary';
import styles from './work.module.css';

/**
 * How a description source is written for a reader. Only a display spelling — the API's own
 * `name` stays the machine one, and an unknown source falls back to it rather than to nothing.
 */
const SOURCE_LABELS: Record<string, string> = { wikipedia: 'Wikipedia' };

interface WorkPageProps {
  params: { id: string };
  searchParams: { language?: string; year?: string; shown?: string };
}

/**
 * How many editions one press of "show more" adds, and how many the page opens with.
 *
 * The page used to render every edition a work has. For *Dracula* that is 980 cards, each with a
 * cover request of roughly a second, and 980 editions serialized into the payload a second time
 * for `EditionComparison`. Nobody reads 980 printings; they read a screen of them and filter.
 */
const EDITIONS_PAGE_SIZE = 24;

/**
 * Free editions first, then editions with legal links (the product's core promise — "where to get
 * the text" must not hide behind expanding editions one by one), then grouped by language name,
 * newest first inside a group. Phase 3 live-UX finding, extended.
 *
 * Free goes above everything, including the reader's language filter's own ordering, because it is
 * the one answer on this page that costs nothing to act on: a public domain copy in a language you
 * read is better news than the same book to buy, and burying it eighteen printings down was the
 * page failing to say what it knew. Language is still the tie-break below it, so a filtered list
 * is unaffected.
 */
function sortEditions(editions: EditionSummary[], locale: string): EditionSummary[] {
  return [...editions].sort((a, b) => {
    const aFree = a.freeDownloads.length > 0 ? 0 : 1;
    const bFree = b.freeDownloads.length > 0 ? 0 : 1;
    if (aFree !== bFree) return aFree - bFree;
    const aHasLinks = a.linkCount > 0 || a.hasBookstores ? 0 : 1;
    const bHasLinks = b.linkCount > 0 || b.hasBookstores ? 0 : 1;
    if (aHasLinks !== bHasLinks) return aHasLinks - bHasLinks;
    // Grouped by the language name the reader actually sees, and collated in their locale — the
    // alphabetical order of "Немецкий, Русский, Французский" is not the order of their English names.
    const byLanguage = languageName(a.language, locale).localeCompare(
      languageName(b.language, locale),
      locale,
    );
    if (byLanguage !== 0) return byLanguage;
    return (b.year ?? 0) - (a.year ?? 0);
  });
}

/**
 * A filter link that changes one parameter and leaves the reader's other choices alone.
 *
 * `shown` is deliberately not among them: a different filter is a different list, and carrying
 * "I had expanded to 96" into it would open the new one part-way down.
 */
function filterHref(id: string, current: WorkPageProps['searchParams'], language: string): string {
  const params = new URLSearchParams();
  if (language) params.set('language', language);
  if (current.year) params.set('year', current.year);
  const query = params.toString();
  return query ? `/works/${id}?${query}` : `/works/${id}`;
}

/** The same page, one screen further down the edition list. Keeps the filters as they are. */
function showMoreHref(id: string, current: WorkPageProps['searchParams'], shown: number): string {
  const params = new URLSearchParams();
  if (current.language) params.set('language', current.language);
  if (current.year) params.set('year', current.year);
  params.set('shown', String(shown + EDITIONS_PAGE_SIZE));
  return `/works/${id}?${params.toString()}#editions`;
}

/**
 * The ids an addon might recognise this book by.
 *
 * Only ISBNs, and deliberately so. This application's own work id is meaningless outside it, and
 * inventing a mapping to somebody else's identifier scheme would be guessing on the reader's behalf.
 * An edition without an ISBN simply contributes nothing here — an addon that cannot be asked is
 * better than an addon asked about the wrong book.
 */
function isbnCandidates(editions: readonly EditionSummary[]): string[] {
  const seen = new Set<string>();
  for (const edition of editions) {
    if (edition.isbn) seen.add(`isbn:${edition.isbn}`);
  }
  return [...seen];
}

export default async function WorkPage({ params, searchParams }: WorkPageProps) {
  const t = await getT();
  const locale = await getLocale();
  // The interface language, so the card can look for a description written in it. It filters
  // nothing: every edition and every translation stays on the page whichever language this is.
  const work = await getWorkCard(params.id, locale);
  if (!work) notFound();

  const yearFilter = searchParams.year ? Number(searchParams.year) : undefined;
  const editionsResult = await listEditions(params.id, {
    ...(searchParams.language ? { language: searchParams.language } : {}),
    ...(yearFilter !== undefined && !Number.isNaN(yearFilter) ? { year: yearFilter } : {}),
  });
  const editions = sortEditions(editionsResult.editions, locale);
  // Rounded up to a whole page and bounded by the list itself, so a hand-edited `?shown=` is a
  // number of editions that exist rather than an arbitrary one. Someone who really does press
  // "show more" forty times gets all 980 — that is their choice, made one screen at a time.
  const requestedShown = Number(searchParams.shown);
  const shown = Math.min(
    Number.isFinite(requestedShown) && requestedShown > 0
      ? Math.ceil(requestedShown / EDITIONS_PAGE_SIZE) * EDITIONS_PAGE_SIZE
      : EDITIONS_PAGE_SIZE,
    editions.length,
  );
  const visibleEditions = editions.slice(0, shown);
  const languageOptions = [...new Set([work.originalLanguage, ...work.translatedLanguages])].sort(
    (a, b) => languageName(a, locale).localeCompare(languageName(b, locale), locale),
  );

  // Which language this reader wants the book *in*, most recent evidence first: the filter they
  // just used, then the one they used last time, and only then the language they read the site in.
  // The interface language is the weakest of the three on purpose — someone reading the site in
  // English is very often looking for a book in something else, which is the whole reason the
  // book language has a cookie of its own (lib/book-language.ts).
  const readerLanguage =
    parseBookLanguage(searchParams.language) ?? (await readBookLanguageFromCookie()) ?? locale;

  return (
    <Page>
      <Link href="/" className={styles.back}>
        <svg
          className={styles.backIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {t('work.newSearch')}
      </Link>

      <div className={styles.hero}>
        <Poster
          className={styles.cover}
          src={work.coverUrl}
          title={work.originalTitle}
          author={work.author}
          priority
        />
        <div>
          <h1 className={styles.title}>{work.originalTitle}</h1>
          <p className={styles.byline}>
            {work.author}
            {work.firstPublishedYear ? `, ${work.firstPublishedYear}` : ''} · {t('work.original')}:{' '}
            {languageName(work.originalLanguage, locale)}
          </p>
          {work.subjects.length > 0 && (
            <Cluster>
              {work.subjects.map((subject) => (
                <ChipLink key={subject} href={`/subjects/${encodeURIComponent(subject)}`}>
                  {subject}
                </ChipLink>
              ))}
            </Cluster>
          )}
          <div className={styles.actions}>
            <BookmarkButton workId={work.id} title={work.originalTitle} />
          </div>
          {work.sources.length > 0 && (
            <p className={styles.sources}>
              {t('work.dataSources')}: {work.sources.join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* The reader's own question first, then the full list, then everything else. A card that
          opens with a blurb makes someone who came to ask "is this in my language" read a
          paragraph about the plot before they find out. */}
      <Section title={t('work.yourLanguage.title')}>
        <TranslationAnswer
          readerLanguage={readerLanguage}
          originalLanguage={work.originalLanguage}
          translatedLanguages={work.translatedLanguages}
          editionsHref={`${filterHref(params.id, searchParams, readerLanguage)}#editions`}
          locale={locale}
          t={t}
        />
      </Section>

      {/* Every language the book exists in *here*, the original among them.
       *
       * It used to list translations only, which is the literally correct reading of "translated
       * into" and the wrong answer to the question being asked. «Метро 2033» then showed six
       * languages with Russian absent — while holding two Russian editions all along — and a
       * reader looking for the original could only conclude the site did not have it. A list of
       * available languages that silently omits one of them is worse than no list.
       *
       * Chips rather than prose: each one is also the filter for that language's editions, which
       * is what a reader asks the moment they find their language in the list. */}
      <Section title={t('work.availableIn')} note={t('work.languagesNote')}>
        {languageOptions.length > 0 ? (
          <Cluster>
            {languageOptions.map((code) => (
              <ChipLink key={code} href={filterHref(params.id, searchParams, code)}>
                {code === work.originalLanguage
                  ? `${languageName(code, locale)} · ${t('work.original')}`
                  : languageName(code, locale)}
              </ChipLink>
            ))}
          </Cluster>
        ) : (
          <p className={styles.empty}>{t('work.noTranslations')}</p>
        )}
      </Section>

      {work.description && (
        <Section title={t('work.about')}>
          <p className={styles.description}>{work.description}</p>
          {work.descriptionSource ? (
            // Attribution, not a credit line: Wikipedia's text is CC BY-SA and reusing it without
            // naming and linking the article would be a licence violation.
            <p className={styles.attribution}>
              {t('work.descriptionFrom')}{' '}
              <a href={work.descriptionSource.url} rel="noopener noreferrer" target="_blank">
                {SOURCE_LABELS[work.descriptionSource.name] ?? work.descriptionSource.name}
              </a>
            </p>
          ) : (
            // Said out loud rather than left for the reader to work out: they asked for the site in
            // this language and this paragraph is not in it. Not shown to an English reader — every
            // source this project reads writes its blurbs in English, so for them the fallback text
            // already *is* localized and the note would be the only false thing on the page.
            locale !== 'en' && (
              <p className={styles.attribution}>
                {t('work.descriptionNotLocalized', { language: languageName(locale, locale) })}
              </p>
            )
          )}
        </Section>
      )}

      <RecordVisit workId={work.id} title={work.originalTitle} subjects={[...work.subjects]} />
      <RememberBookLanguage language={searchParams.language ?? null} />

      <Section
        id="editions"
        title={t('work.editions', { shown: visibleEditions.length, total: work.editionCount })}
      >
        <div className={styles.toolbar}>
          <CountrySelector />
        </div>

        {/* Module B, once per page rather than once per edition. "Which bookshops are near me"
            does not vary by edition — nobody publishes shop stock, so the answer is the same list
            whichever binding you are looking at, and one form beats thirty identical ones. The
            whole lookup runs in the browser so coordinates never reach this instance (ADR-0007). */}
        <NearbyBookshops isbn={visibleEditions[0]?.isbn ?? null} />

        <Cluster className={styles.filters}>
          <ChipLink href={filterHref(params.id, searchParams, '')}>
            {t('work.filterAllLanguages')}
          </ChipLink>
          {languageOptions.map((code) => (
            <ChipLink
              key={code}
              href={filterHref(params.id, searchParams, code)}
              aria-current={searchParams.language === code ? 'true' : undefined}
            >
              {languageName(code, locale)}
            </ChipLink>
          ))}
        </Cluster>

        {/* The year stays a typed field: it is a number out of a couple of hundred, and a chip row
            of every printing year would be longer than the edition list it filters. */}
        <form method="get" className={styles.filters}>
          {searchParams.language && (
            <input type="hidden" name="language" value={searchParams.language} />
          )}
          <Field label={t('work.filterYear')} htmlFor="year-filter" className={styles.yearField}>
            <TextInput
              id="year-filter"
              name="year"
              defaultValue={searchParams.year ?? ''}
              inputMode="numeric"
            />
          </Field>
          <Button type="submit" variant="secondary" size="lg">
            {t('work.filterApply')}
          </Button>
          {(searchParams.language || searchParams.year) && (
            <Link href={`/works/${params.id}`}>{t('work.filterReset')}</Link>
          )}
        </form>

        {editions.length === 0 ? (
          <p className={styles.empty}>{t('work.noEditionsMatch')}</p>
        ) : (
          visibleEditions.map((edition) => (
            <EditionCard
              key={edition.id}
              edition={edition}
              author={work.author}
              t={t}
              locale={locale}
            />
          ))
        )}

        {editions.length > shown ? (
          <p className={styles.showMore}>
            {/* A plain link, so this works with no JavaScript and each step is a real URL the
                reader can share or go back from. */}
            <Link href={showMoreHref(params.id, searchParams, shown)}>
              {/* Only `remaining` — none of the fifteen dictionaries has plural machinery, and
                  "осталось 1" is a smaller lie than a phrase built to need one. */}
              {t('work.showMoreEditions', { remaining: editions.length - shown })}
            </Link>
          </p>
        ) : null}
      </Section>

      {/* Only what is on screen: the comparison table is a client component, so every edition
          handed to it is also serialized into the page payload a second time. */}
      <EditionComparison editions={visibleEditions} />

      {/* Last, and separate. These come from the reader's own addons, which this instance does not
          inspect and does not vouch for (docs/adr/0009-blind-core-link-policy-scope.md). The ids
          are candidates in the only spelling an addon is likely to share with us — an ISBN. Our
          own work id means nothing to anybody else. */}
      <AddonSources ids={isbnCandidates(editions)} />
    </Page>
  );
}

function EditionCard({
  edition,
  author,
  t,
  locale,
}: {
  edition: EditionSummary;
  author: string;
  t: Translate;
  locale: string;
}) {
  return (
    <Card className={styles.edition}>
      <Poster src={edition.coverUrl} title={edition.title} />
      <div>
        <div className={styles.editionHead}>
          <span className={styles.editionTitle}>{edition.title}</span>
          {edition.freeDownloads.length > 0 ? (
            // Its own badge, above "read or borrow": both are true of a free edition, and the
            // stronger one is the one worth the reader's attention.
            <Badge tone="positive">{t('work.badgeFreeDownload')}</Badge>
          ) : edition.linkCount > 0 ? (
            <Badge tone="positive">{t('work.badgeReadBorrow')}</Badge>
          ) : edition.hasBookstores ? (
            <Badge tone="neutral">{t('work.badgeInBookstores')}</Badge>
          ) : null}
        </div>
        <div className={styles.editionMeta}>
          {languageName(edition.language, locale)}
          {edition.publisher ? ` · ${edition.publisher}` : ''}
          {edition.year ? ` · ${edition.year}` : ''}
          {edition.translator ? ` · ${t('work.translatedBy', { name: edition.translator })}` : ''}
          {/* Verbatim from the catalogue, and unlabelled for the same reason `binding` is: it is
              already a phrase in the cataloguer's own words ("First edition", "Limited ed.,
              signed"), and a label in front of it would be the only translated word in the line. */}
          {edition.editionStatement ? ` · ${edition.editionStatement}` : ''}
          {edition.binding ? ` · ${edition.binding}` : ''}
          {edition.pages ? ` · ${t('work.pages', { count: edition.pages })}` : ''}
          {edition.isbn ? ` · ISBN ${edition.isbn}` : ''}
        </div>
        <FreeDownloads downloads={edition.freeDownloads} t={t} />
        <EditionLinks
          editionId={edition.id}
          language={languageName(edition.language, locale)}
          bookMeta={{
            isbn: edition.isbn,
            title: edition.title,
            author,
            language: edition.language,
          }}
        />
        {/* Module C. Per edition, because a price is a price for one binding — and collapsed
            by default, because a popular work lists dozens of editions and fetching them all
            on mount trips the API's own rate limit for prices nobody asked for. */}
        <EditionPrices editionId={edition.id} />
      </div>
    </Card>
  );
}

/**
 * The free copies of one edition, as buttons that go straight to the file.
 *
 * Not behind the links panel, unlike everything else on the card: this is the page's best answer
 * to "where do I get this", and an answer that needs a click to appear is an answer most readers
 * never see. Each button says what it hands over — the format, or the act when the source states
 * no format — and the rights status travels with it, because "free" is a claim this project makes
 * on the record and never by implication (docs/legal-policy.md).
 *
 * These come from the instance's own allowlisted sources, not from a reader's addon; the two are
 * different types and never mix (ADR-0009).
 */
function FreeDownloads({
  downloads,
  t,
}: {
  downloads: readonly EditionFreeDownload[];
  t: Translate;
}) {
  if (downloads.length === 0) return null;

  return (
    <div className={styles.freeDownloads}>
      <Cluster>
        {downloads.map((download) => (
          <ButtonLink
            key={download.url}
            href={download.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="primary"
            size="sm"
          >
            {download.format
              ? t('work.freeDownloadFormat', { format: download.format.toUpperCase() })
              : t(`linkType.${download.type}` as never)}
          </ButtonLink>
        ))}
      </Cluster>
      <p className={styles.freeDownloadsNote}>
        {t('work.freeDownloadNote', {
          rights: t(`rights.${downloads[0]!.rightsStatus}` as never),
          provider: [...new Set(downloads.map((d) => d.provider))].join(', '),
        })}
      </p>
    </div>
  );
}
