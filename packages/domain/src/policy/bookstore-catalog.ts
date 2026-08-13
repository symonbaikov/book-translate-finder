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
  /** Builds the ISBN lookup URL. Kept as a function so odd URL shapes stay expressible. */
  buildUrl: (isbn: string) => string;
}

/**
 * Deliberately curated, not exhaustive: large, long-lived retailers with stable URL shapes, plus
 * Bookshop.org (which routes profit to independent bookshops) wherever it operates. Adding a
 * store is a one-line change here — no new adapter, no migration.
 */
export const BOOKSTORES: readonly Bookstore[] = [
  // --- Worldwide -----------------------------------------------------------
  {
    id: 'google-play-books',
    name: 'Google Play Books',
    country: WORLDWIDE,
    buildUrl: (isbn) => `https://play.google.com/store/search?q=${isbn}&c=books`,
  },
  {
    id: 'abebooks',
    name: 'AbeBooks (used & rare)',
    country: WORLDWIDE,
    buildUrl: (isbn) => `https://www.abebooks.com/servlet/SearchResults?isbn=${isbn}`,
  },

  // --- United States -------------------------------------------------------
  {
    id: 'bookshop-org-us',
    name: 'Bookshop.org (supports local bookstores)',
    country: 'US',
    buildUrl: (isbn) => `https://bookshop.org/books?keywords=${isbn}`,
  },
  {
    id: 'barnes-noble',
    name: 'Barnes & Noble',
    country: 'US',
    buildUrl: (isbn) => `https://www.barnesandnoble.com/s/${isbn}`,
  },
  {
    id: 'amazon-us',
    name: 'Amazon.com',
    country: 'US',
    buildUrl: (isbn) => `https://www.amazon.com/s?k=${isbn}`,
  },

  // --- United Kingdom ------------------------------------------------------
  {
    id: 'bookshop-org-uk',
    name: 'Bookshop.org UK (supports local bookstores)',
    country: 'GB',
    buildUrl: (isbn) => `https://uk.bookshop.org/books?keywords=${isbn}`,
  },
  {
    id: 'waterstones',
    name: 'Waterstones',
    country: 'GB',
    buildUrl: (isbn) => `https://www.waterstones.com/books/search/term/${isbn}`,
  },
  {
    id: 'blackwells',
    name: "Blackwell's",
    country: 'GB',
    buildUrl: (isbn) => `https://blackwells.co.uk/bookshop/search/?keyword=${isbn}`,
  },
  {
    id: 'amazon-uk',
    name: 'Amazon.co.uk',
    country: 'GB',
    buildUrl: (isbn) => `https://www.amazon.co.uk/s?k=${isbn}`,
  },

  // --- Germany -------------------------------------------------------------
  {
    id: 'thalia',
    name: 'Thalia',
    country: 'DE',
    buildUrl: (isbn) => `https://www.thalia.de/suche?sq=${isbn}`,
  },
  {
    id: 'hugendubel',
    name: 'Hugendubel',
    country: 'DE',
    buildUrl: (isbn) => `https://www.hugendubel.de/de/search?searchString=${isbn}`,
  },
  {
    id: 'amazon-de',
    name: 'Amazon.de',
    country: 'DE',
    buildUrl: (isbn) => `https://www.amazon.de/s?k=${isbn}`,
  },

  // --- France --------------------------------------------------------------
  {
    id: 'fnac',
    name: 'Fnac',
    country: 'FR',
    buildUrl: (isbn) => `https://www.fnac.com/SearchResult/ResultList.aspx?Search=${isbn}`,
  },
  {
    id: 'decitre',
    name: 'Decitre',
    country: 'FR',
    buildUrl: (isbn) => `https://www.decitre.fr/rechercher/result?q=${isbn}`,
  },
  {
    id: 'amazon-fr',
    name: 'Amazon.fr',
    country: 'FR',
    buildUrl: (isbn) => `https://www.amazon.fr/s?k=${isbn}`,
  },

  // --- Spain ---------------------------------------------------------------
  {
    id: 'casa-del-libro',
    name: 'Casa del Libro',
    country: 'ES',
    buildUrl: (isbn) => `https://www.casadellibro.com/busqueda-generica?busqueda=${isbn}`,
  },
  {
    id: 'bookshop-org-es',
    name: 'Bookshop.org ES (supports local bookstores)',
    country: 'ES',
    buildUrl: (isbn) => `https://bookshop.org/es/books?keywords=${isbn}`,
  },
  {
    id: 'amazon-es',
    name: 'Amazon.es',
    country: 'ES',
    buildUrl: (isbn) => `https://www.amazon.es/s?k=${isbn}`,
  },

  // --- Italy ---------------------------------------------------------------
  {
    id: 'feltrinelli',
    name: 'la Feltrinelli',
    country: 'IT',
    buildUrl: (isbn) => `https://www.lafeltrinelli.it/ricerca?query=${isbn}`,
  },
  {
    id: 'ibs-it',
    name: 'IBS.it',
    country: 'IT',
    buildUrl: (isbn) => `https://www.ibs.it/search/?ts=as&query=${isbn}`,
  },
  {
    id: 'amazon-it',
    name: 'Amazon.it',
    country: 'IT',
    buildUrl: (isbn) => `https://www.amazon.it/s?k=${isbn}`,
  },

  // --- Netherlands ---------------------------------------------------------
  {
    id: 'bol-com',
    name: 'Bol.com',
    country: 'NL',
    buildUrl: (isbn) => `https://www.bol.com/nl/nl/s/?searchtext=${isbn}`,
  },
  {
    id: 'amazon-nl',
    name: 'Amazon.nl',
    country: 'NL',
    buildUrl: (isbn) => `https://www.amazon.nl/s?k=${isbn}`,
  },

  // --- Poland --------------------------------------------------------------
  {
    id: 'empik',
    name: 'Empik',
    country: 'PL',
    buildUrl: (isbn) => `https://www.empik.com/szukaj/produkt?q=${isbn}`,
  },

  // --- Canada / Australia --------------------------------------------------
  {
    id: 'indigo',
    name: 'Indigo',
    country: 'CA',
    buildUrl: (isbn) => `https://www.indigo.ca/en-ca/search?q=${isbn}`,
  },
  {
    id: 'amazon-ca',
    name: 'Amazon.ca',
    country: 'CA',
    buildUrl: (isbn) => `https://www.amazon.ca/s?k=${isbn}`,
  },
  {
    id: 'booktopia',
    name: 'Booktopia',
    country: 'AU',
    buildUrl: (isbn) => `https://www.booktopia.com.au/search.ep?keywords=${isbn}`,
  },

  // --- Russia --------------------------------------------------------------
  {
    id: 'labirint',
    name: 'Лабиринт',
    country: 'RU',
    buildUrl: (isbn) => `https://www.labirint.ru/search/${isbn}/`,
  },
  {
    id: 'chitai-gorod',
    name: 'Читай-город',
    country: 'RU',
    buildUrl: (isbn) => `https://www.chitai-gorod.ru/search?phrase=${isbn}`,
  },
  {
    id: 'ozon',
    name: 'Ozon',
    country: 'RU',
    buildUrl: (isbn) => `https://www.ozon.ru/search/?text=${isbn}`,
  },

  // --- Japan / Brazil ------------------------------------------------------
  {
    id: 'amazon-jp',
    name: 'Amazon.co.jp',
    country: 'JP',
    buildUrl: (isbn) => `https://www.amazon.co.jp/s?k=${isbn}`,
  },
  {
    id: 'amazon-br',
    name: 'Amazon.com.br',
    country: 'BR',
    buildUrl: (isbn) => `https://www.amazon.com.br/s?k=${isbn}`,
  },
];

/** Every country with at least one store, sorted — drives the UI's country selector. */
export function supportedBookstoreCountries(): CountryCode[] {
  return [
    ...new Set(BOOKSTORES.filter((s) => s.country !== WORLDWIDE).map((s) => s.country)),
  ].sort();
}

/**
 * Stores to offer for `country`: that country's own stores first (most useful — local currency,
 * local shipping), then the worldwide ones. An unknown/absent country yields worldwide only,
 * which is a sensible neutral default rather than an error.
 */
export function bookstoresForCountry(country: CountryCode | null): Bookstore[] {
  const normalized = country?.trim().toUpperCase() ?? null;
  const local = normalized ? BOOKSTORES.filter((s) => s.country === normalized) : [];
  const worldwide = BOOKSTORES.filter((s) => s.country === WORLDWIDE);
  return [...local, ...worldwide];
}
