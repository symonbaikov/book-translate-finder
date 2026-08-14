/**
 * The books offered on the home page, curated by hand.
 *
 * **Why curated.** No open source ranks book sales. Bestseller lists that exist (NYT, Spiegel,
 * national trade bodies) are licensed products with terms that forbid redistribution, and
 * inferring popularity from Open Library edition counts would measure "how often reprinted", not
 * "what people are reading now" — a list dominated by 19th-century classics presented as current.
 * So this is an editorial list, and the UI says so rather than calling it a chart.
 *
 * **What `year` means.** The year the book was first published — a fact, checkable. It is not a
 * claim that the book won anything or topped a list that year; the app never says that because it
 * has no source for it.
 *
 * **How to change it.** A PR editing this file. Entries are matched to the database by title and
 * author, and anything not yet known is fetched in the background on first request, so adding one
 * needs no migration and no re-seed.
 */

export type FeaturedList = 'books-of-the-year' | 'popular';

export interface FeaturedBook {
  /** Matched against the database by the same natural key the sync uses. */
  title: string;
  author: string;
  /** Year of first publication. */
  year: number;
  list: FeaturedList;
}

export const FEATURED_BOOKS: readonly FeaturedBook[] = [
  // --- One book per recent year, newest first ------------------------------
  { title: 'James', author: 'Percival Everett', year: 2024, list: 'books-of-the-year' },
  { title: 'Yellowface', author: 'R. F. Kuang', year: 2023, list: 'books-of-the-year' },
  {
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    year: 2022,
    list: 'books-of-the-year',
  },
  { title: 'Klara and the Sun', author: 'Kazuo Ishiguro', year: 2021, list: 'books-of-the-year' },
  { title: 'Hamnet', author: 'Maggie O’Farrell', year: 2020, list: 'books-of-the-year' },
  { title: 'The Testaments', author: 'Margaret Atwood', year: 2019, list: 'books-of-the-year' },
  { title: 'Circe', author: 'Madeline Miller', year: 2018, list: 'books-of-the-year' },

  // --- Widely read, and widely translated — which is what this app is for ---
  { title: 'Project Hail Mary', author: 'Andy Weir', year: 2021, list: 'popular' },
  { title: 'The Midnight Library', author: 'Matt Haig', year: 2020, list: 'popular' },
  { title: 'Piranesi', author: 'Susanna Clarke', year: 2020, list: 'popular' },
  { title: 'Normal People', author: 'Sally Rooney', year: 2018, list: 'popular' },
  {
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    year: 2017,
    list: 'popular',
  },
  { title: 'The Song of Achilles', author: 'Madeline Miller', year: 2011, list: 'popular' },
  { title: 'Educated', author: 'Tara Westover', year: 2018, list: 'popular' },
  { title: 'Where the Crawdads Sing', author: 'Delia Owens', year: 2018, list: 'popular' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', year: 2011, list: 'popular' },
  { title: 'Atomic Habits', author: 'James Clear', year: 2018, list: 'popular' },
];

export function featuredBooksIn(list: FeaturedList): FeaturedBook[] {
  return FEATURED_BOOKS.filter((book) => book.list === list);
}
