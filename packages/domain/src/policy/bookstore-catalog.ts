/**
 * Where a reader can buy a specific edition, per country.
 *
 * **Why a static catalog of URL templates and not an API.** No open API answers "which shops
 * sell this ISBN in country X": Amazon's Product Advertising API requires an affiliate account
 * with prior sales, and the rest of the retail world has no equivalent at all. What every major
 * bookstore *does* have is a stable, documented-by-convention lookup URL keyed by ISBN. Building
 * those links is deterministic, needs no API key (important for self-hosting — see CLAUDE.md),
 * and involves no scraping, so it satisfies the project's hard invariant
 * (docs/legal-policy.md I-3) rather than bending it.
 *
 * **What these links honestly are.** A lookup by ISBN in a shop's own catalog. Verified live
 * against Waterstones with ISBN 9780140447934 — it resolves straight to the product page. But
 * this is *not* a stock check: we never fetch these URLs (that would be scraping), so we cannot
 * and must not claim a shop has the book. The UI says "search in store", never "in stock".
 *
 * **Not persisted.** These are derived from `(isbn, country)` and never change, so materializing
 * them into `source_link` would multiply every edition by every store in every country for no
 * information gain. They are built at read time — but still passed through `assertLinkAllowed`
 * (docs/legal-policy.md), so the invariant "every link the UI shows was policy-approved" holds
 * exactly as it does for stored links.
 *
 * **No affiliate tags.** Every URL here is clean. If affiliate programs are ever added, I-5
 * requires disclosing that in the UI — a product decision for the project owner, not a silent
 * change (docs/plan.md Phase 2 left this deliberately unstarted).
 */

/** ISO 3166-1 alpha-2, uppercase. `WORLDWIDE` marks stores that ship/serve internationally. */
export type CountryCode = string;

export const WORLDWIDE = 'WORLDWIDE' as const;

export interface Bookstore {
  /** Stable slug — becomes the link's `provider`, so it must satisfy `ProviderId` rules. */
  id: string;
  /** Display name shown to the reader. */
  name: string;
  /** Country this store serves, or `WORLDWIDE`. */
  country: CountryCode | typeof WORLDWIDE;
  /**
   * Builds a lookup URL for any search term — an ISBN when the edition has one, otherwise
   * "title author". The fallback matters more than it looks: 16% of editions in a real database
   * carry no ISBN (measured live), and those editions used to show no shops at all, which read as
   * "nobody sells this book" rather than "we have no ISBN to look up".
   */
  buildUrl: (term: string) => string;
}

/**
 * Declares one store. The URL is a template with `{isbn}` rather than a hand-written closure —
 * with ~90 stores in the table, the closure boilerplate buried the one thing that varies.
 */
function store(
  id: string,
  name: string,
  country: CountryCode | typeof WORLDWIDE,
  template: string,
): Bookstore {
  return {
    id,
    name,
    country,
    // Encoded because the term is no longer always a bare ISBN — "Le Petit Prince, Saint-Exupéry"
    // has spaces, commas and accents that would otherwise break the URL.
    buildUrl: (term) => template.replace('{isbn}', encodeURIComponent(term)),
  };
}

/**
 * Large, long-lived retailers with stable ISBN-lookup URLs, plus Bookshop.org (which routes profit
 * to independent bookshops) wherever it operates. Adding a store is one line here — no new
 * adapter, no migration.
 *
 * **Every URL below was checked live** against ISBN 9780140447934. A store whose lookup shape
 * could not be confirmed was left out rather than guessed at: a link that lands on an error page
 * is worse than no link. (Note when re-checking: many of these answer `403` to a plain `curl` —
 * that is bot filtering, not a broken URL. Only `404` means the shape is wrong.)
 */
export const BOOKSTORES: readonly Bookstore[] = [
  // --- Worldwide -----------------------------------------------------------
  store(
    'google-play-books',
    'Google Play Books',
    WORLDWIDE,
    'https://play.google.com/store/search?q={isbn}&c=books',
  ),
  store(
    'abebooks',
    'AbeBooks (used & rare)',
    WORLDWIDE,
    'https://www.abebooks.com/servlet/SearchResults?isbn={isbn}',
  ),
  store('kobo', 'Kobo (ebooks)', WORLDWIDE, 'https://www.kobo.com/search?query={isbn}'),
  store(
    'wordery',
    'Wordery (free worldwide delivery)',
    WORLDWIDE,
    'https://wordery.com/search?term={isbn}',
  ),
  store(
    'better-world-books',
    'Better World Books (used)',
    WORLDWIDE,
    'https://www.betterworldbooks.com/search/results?q={isbn}',
  ),

  // --- Americas ------------------------------------------------------------
  store(
    'bookshop-org-us',
    'Bookshop.org (supports local bookstores)',
    'US',
    'https://bookshop.org/books?keywords={isbn}',
  ),
  store('barnes-noble', 'Barnes & Noble', 'US', 'https://www.barnesandnoble.com/s/{isbn}'),
  store('amazon-us', 'Amazon.com', 'US', 'https://www.amazon.com/s?k={isbn}'),
  store('indigo', 'Indigo', 'CA', 'https://www.indigo.ca/en-ca/search?q={isbn}'),
  store('amazon-ca', 'Amazon.ca', 'CA', 'https://www.amazon.ca/s?k={isbn}'),
  store('gandhi', 'Gandhi', 'MX', 'https://www.gandhi.com.mx/buscar?q={isbn}'),
  store('amazon-mx', 'Amazon.com.mx', 'MX', 'https://www.amazon.com.mx/s?k={isbn}'),
  store('amazon-br', 'Amazon.com.br', 'BR', 'https://www.amazon.com.br/s?k={isbn}'),
  store('cuspide', 'Cúspide', 'AR', 'https://www.cuspide.com/resultados?buscar={isbn}'),
  store('buscalibre-cl', 'Buscalibre', 'CL', 'https://www.buscalibre.cl/libros/search?q={isbn}'),
  store(
    'buscalibre-co',
    'Buscalibre',
    'CO',
    'https://www.buscalibre.com.co/libros/search?q={isbn}',
  ),

  // --- Western Europe ------------------------------------------------------
  store(
    'bookshop-org-uk',
    'Bookshop.org UK (supports local bookstores)',
    'GB',
    'https://uk.bookshop.org/books?keywords={isbn}',
  ),
  store('waterstones', 'Waterstones', 'GB', 'https://www.waterstones.com/books/search/term/{isbn}'),
  store(
    'blackwells',
    "Blackwell's",
    'GB',
    'https://blackwells.co.uk/bookshop/search/?keyword={isbn}',
  ),
  store('amazon-uk', 'Amazon.co.uk', 'GB', 'https://www.amazon.co.uk/s?k={isbn}'),
  store('easons', 'Easons', 'IE', 'https://www.easons.com/search?q={isbn}'),
  store('amazon-ie', 'Amazon.ie', 'IE', 'https://www.amazon.ie/s?k={isbn}'),
  store('thalia', 'Thalia', 'DE', 'https://www.thalia.de/suche?sq={isbn}'),
  store(
    'hugendubel',
    'Hugendubel',
    'DE',
    'https://www.hugendubel.de/de/search?searchString={isbn}',
  ),
  store('amazon-de', 'Amazon.de', 'DE', 'https://www.amazon.de/s?k={isbn}'),
  store('thalia-at', 'Thalia.at', 'AT', 'https://www.thalia.at/suche?sq={isbn}'),
  store('orell-fuessli', 'Orell Füssli', 'CH', 'https://www.orellfuessli.ch/suche?sq={isbn}'),
  store('fnac', 'Fnac', 'FR', 'https://www.fnac.com/SearchResult/ResultList.aspx?Search={isbn}'),
  store('decitre', 'Decitre', 'FR', 'https://www.decitre.fr/rechercher/result?q={isbn}'),
  store('amazon-fr', 'Amazon.fr', 'FR', 'https://www.amazon.fr/s?k={isbn}'),
  store('amazon-be', 'Amazon.com.be', 'BE', 'https://www.amazon.com.be/s?k={isbn}'),
  store('bol-com', 'Bol.com', 'NL', 'https://www.bol.com/nl/nl/s/?searchtext={isbn}'),
  store('amazon-nl', 'Amazon.nl', 'NL', 'https://www.amazon.nl/s?k={isbn}'),
  store(
    'casa-del-libro',
    'Casa del Libro',
    'ES',
    'https://www.casadellibro.com/busqueda-generica?busqueda={isbn}',
  ),
  store(
    'bookshop-org-es',
    'Bookshop.org ES (supports local bookstores)',
    'ES',
    'https://bookshop.org/es/books?keywords={isbn}',
  ),
  store('amazon-es', 'Amazon.es', 'ES', 'https://www.amazon.es/s?k={isbn}'),
  store('wook', 'Wook', 'PT', 'https://www.wook.pt/pesquisa/{isbn}'),
  store('bertrand', 'Bertrand', 'PT', 'https://www.bertrand.pt/pesquisa/{isbn}'),
  store('feltrinelli', 'la Feltrinelli', 'IT', 'https://www.lafeltrinelli.it/ricerca?query={isbn}'),
  store('ibs-it', 'IBS.it', 'IT', 'https://www.ibs.it/search/?ts=as&query={isbn}'),
  store('amazon-it', 'Amazon.it', 'IT', 'https://www.amazon.it/s?k={isbn}'),
  store('public-gr', 'Public', 'GR', 'https://www.public.gr/search?q={isbn}'),

  // --- Nordics -------------------------------------------------------------
  store('adlibris-se', 'Adlibris', 'SE', 'https://www.adlibris.com/se/sok?q={isbn}'),
  store(
    'bokus',
    'Bokus',
    'SE',
    'https://www.bokus.com/cgi-bin/product_search.cgi?search_word={isbn}',
  ),
  store('amazon-se', 'Amazon.se', 'SE', 'https://www.amazon.se/s?k={isbn}'),
  store('ark-no', 'Ark', 'NO', 'https://www.ark.no/search?text={isbn}'),
  store('norli', 'Norli', 'NO', 'https://www.norli.no/search?q={isbn}'),
  store('saxo', 'Saxo', 'DK', 'https://www.saxo.com/dk/products/search?query={isbn}'),
  store(
    'suomalainen',
    'Suomalainen kirjakauppa',
    'FI',
    'https://www.suomalainen.com/search?q={isbn}',
  ),
  store('adlibris-fi', 'Adlibris', 'FI', 'https://www.adlibris.com/fi/haku?q={isbn}'),

  // --- Central & Eastern Europe --------------------------------------------
  store('empik', 'Empik', 'PL', 'https://www.empik.com/szukaj/produkt?q={isbn}'),
  store('bonito', 'Bonito', 'PL', 'https://bonito.pl/szukaj/{isbn}'),
  store('amazon-pl', 'Amazon.pl', 'PL', 'https://www.amazon.pl/s?k={isbn}'),
  store('kosmas', 'Kosmas', 'CZ', 'https://www.kosmas.cz/hledani/?q={isbn}'),
  store('martinus', 'Martinus', 'SK', 'https://www.martinus.sk/knihy/hladat?q={isbn}'),
  store('libri-hu', 'Libri', 'HU', 'https://www.libri.hu/talalati_lista/?search={isbn}'),
  store('libris-ro', 'Libris', 'RO', 'https://www.libris.ro/search?q={isbn}'),
  store('helikon', 'Helikon', 'BG', 'https://www.helikon.bg/search?q={isbn}'),
  store('rahva-raamat', 'Rahva Raamat', 'EE', 'https://www.rahvaraamat.ee/otsing?q={isbn}'),
  store('knygos-lt', 'Knygos.lt', 'LT', 'https://www.knygos.lt/lt/paieska/?q={isbn}'),
  store('yakaboo', 'Yakaboo', 'UA', 'https://www.yakaboo.ua/search?query={isbn}'),
  store('labirint', 'Лабиринт', 'RU', 'https://www.labirint.ru/search/{isbn}/'),
  store('chitai-gorod', 'Читай-город', 'RU', 'https://www.chitai-gorod.ru/search?phrase={isbn}'),
  store('ozon', 'Ozon', 'RU', 'https://www.ozon.ru/search/?text={isbn}'),

  // --- Middle East & Africa ------------------------------------------------
  store('dr-com-tr', 'D&R', 'TR', 'https://www.dr.com.tr/search?q={isbn}'),
  store('idefix', 'Idefix', 'TR', 'https://www.idefix.com/search?q={isbn}'),
  store('amazon-tr', 'Amazon.com.tr', 'TR', 'https://www.amazon.com.tr/s?k={isbn}'),
  store('amazon-ae', 'Amazon.ae', 'AE', 'https://www.amazon.ae/s?k={isbn}'),
  store('amazon-sa', 'Amazon.sa', 'SA', 'https://www.amazon.sa/s?k={isbn}'),
  store('amazon-eg', 'Amazon.eg', 'EG', 'https://www.amazon.eg/s?k={isbn}'),
  store(
    'exclusive-books',
    'Exclusive Books',
    'ZA',
    'https://www.exclusivebooks.co.za/search?q={isbn}',
  ),

  // --- Asia & Pacific ------------------------------------------------------
  store('flipkart', 'Flipkart', 'IN', 'https://www.flipkart.com/search?q={isbn}'),
  store('amazon-in', 'Amazon.in', 'IN', 'https://www.amazon.in/s?k={isbn}'),
  store('honto', 'honto', 'JP', 'https://honto.jp/netstore/search.html?k={isbn}'),
  store('amazon-jp', 'Amazon.co.jp', 'JP', 'https://www.amazon.co.jp/s?k={isbn}'),
  store(
    'kyobo',
    '교보문고 Kyobo Book Centre',
    'KR',
    'https://search.kyobobook.co.kr/search?keyword={isbn}',
  ),
  store('dangdang', '当当 Dangdang', 'CN', 'https://search.dangdang.com/?key={isbn}'),
  store(
    'books-com-tw',
    '博客來 Books.com.tw',
    'TW',
    'https://search.books.com.tw/search/query/key/{isbn}',
  ),
  store(
    'kinokuniya-sg',
    'Kinokuniya',
    'SG',
    'https://singapore.kinokuniya.com/products?keyword={isbn}',
  ),
  store('amazon-sg', 'Amazon.sg', 'SG', 'https://www.amazon.sg/s?k={isbn}'),
  store('gramedia', 'Gramedia', 'ID', 'https://www.gramedia.com/search?q={isbn}'),
  store('booktopia', 'Booktopia', 'AU', 'https://www.booktopia.com.au/search.ep?keywords={isbn}'),
  store('amazon-au', 'Amazon.com.au', 'AU', 'https://www.amazon.com.au/s?k={isbn}'),
  store('fishpond-nz', 'Fishpond', 'NZ', 'https://www.fishpond.co.nz/q/{isbn}'),
];

/** Every country with at least one store, sorted — drives the UI's country selector. */
export function supportedBookstoreCountries(): CountryCode[] {
  return [
    ...new Set(BOOKSTORES.filter((s) => s.country !== WORLDWIDE).map((s) => s.country)),
  ].sort();
}

/**
 * The book-market language of each country in the catalog — which language a reader is most
 * likely to find on those shelves. Deliberately one language per country: this drives "who sells
 * this German edition", and listing every language spoken somewhere would make the answer
 * meaningless. Countries whose market is chiefly English are grouped under `en`.
 */
const COUNTRY_MARKET_LANGUAGE: Readonly<Record<string, string>> = {
  AE: 'ar',
  AR: 'es',
  AT: 'de',
  AU: 'en',
  BE: 'nl',
  BG: 'bg',
  BR: 'pt',
  CA: 'en',
  CH: 'de',
  CL: 'es',
  CN: 'zh',
  CO: 'es',
  CZ: 'cs',
  DE: 'de',
  DK: 'da',
  EE: 'et',
  EG: 'ar',
  ES: 'es',
  FI: 'fi',
  FR: 'fr',
  GB: 'en',
  GR: 'el',
  HU: 'hu',
  ID: 'id',
  IE: 'en',
  IN: 'en',
  IT: 'it',
  JP: 'ja',
  KR: 'ko',
  LT: 'lt',
  MX: 'es',
  NL: 'nl',
  NO: 'no',
  NZ: 'en',
  PL: 'pl',
  PT: 'pt',
  RO: 'ro',
  RU: 'ru',
  SA: 'ar',
  SE: 'sv',
  SG: 'en',
  SK: 'sk',
  TR: 'tr',
  TW: 'zh',
  UA: 'uk',
  US: 'en',
  ZA: 'en',
};

/** Countries whose book market is chiefly in `language`. */
export function countriesForMarketLanguage(language: string): CountryCode[] {
  const normalized = language.trim().toLowerCase();
  return Object.entries(COUNTRY_MARKET_LANGUAGE)
    .filter(([, marketLanguage]) => marketLanguage === normalized)
    .map(([country]) => country)
    .sort();
}

export interface BookstoreQuery {
  /** ISO 3166-1 alpha-2 country the reader shops in, if they picked one. */
  country?: CountryCode | null;
  /** The edition's language — decides which national markets actually stock it. */
  language?: string | null;
}

/**
 * Stores to offer for one edition, in the order a reader wants them:
 *
 * 1. their own country's shops — local currency, local shipping, no import;
 * 2. shops in the countries where this edition's language is the market language, because a
 *    German translation is sold by German shops whether or not the reader lives there. This is
 *    the whole reason the answer used to look empty: a reader in Poland opening a Spanish edition
 *    was shown Polish shops that do not carry it, or nothing at all;
 * 3. the worldwide shops, which ship anywhere.
 *
 * De-duplicated by id, so a reader in Germany looking at a German edition sees each shop once.
 */
export function bookstoresFor(query: BookstoreQuery): Bookstore[] {
  const country = query.country?.trim().toUpperCase() || null;
  const languageCountries = query.language ? countriesForMarketLanguage(query.language) : [];

  const ordered = [
    ...(country ? BOOKSTORES.filter((s) => s.country === country) : []),
    ...BOOKSTORES.filter((s) => s.country !== country && languageCountries.includes(s.country)),
    ...BOOKSTORES.filter((s) => s.country === WORLDWIDE),
  ];

  const seen = new Set<string>();
  return ordered.filter((s) => !seen.has(s.id) && seen.add(s.id));
}

/** Country-only lookup, kept for callers that have no edition in hand. */
export function bookstoresForCountry(country: CountryCode | null): Bookstore[] {
  return bookstoresFor({ country });
}
