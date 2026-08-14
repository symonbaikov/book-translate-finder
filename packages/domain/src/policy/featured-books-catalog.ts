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
 * has no source for it. Several books share each year: a single pick per year reads as a verdict
 * this project has no standing to deliver, and gave the home page one cover per row.
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
  // --- Notable books, newest year first --------------------------------------
  // 2024
  { title: 'Funny Story', author: 'Emily Henry', year: 2024, list: 'books-of-the-year' },
  { title: 'The Women', author: 'Kristin Hannah', year: 2024, list: 'books-of-the-year' },
  { title: 'You Like It Darker', author: 'Stephen King', year: 2024, list: 'books-of-the-year' },
  { title: 'Held', author: 'Anne Michaels', year: 2024, list: 'books-of-the-year' },
  { title: 'James', author: 'Percival Everett', year: 2024, list: 'books-of-the-year' },
  {
    title: 'The Ministry of Time',
    author: 'Kaliane Bradley',
    year: 2024,
    list: 'books-of-the-year',
  },
  { title: 'Intermezzo', author: 'Sally Rooney', year: 2024, list: 'books-of-the-year' },
  { title: 'Martyr!', author: 'Kaveh Akbar', year: 2024, list: 'books-of-the-year' },
  { title: 'Wandering Stars', author: 'Tommy Orange', year: 2024, list: 'books-of-the-year' },
  { title: 'All Fours', author: 'Miranda July', year: 2024, list: 'books-of-the-year' },
  // 2023
  {
    title: 'The Covenant of Water',
    author: 'Abraham Verghese',
    year: 2023,
    list: 'books-of-the-year',
  },
  { title: 'Tom Lake', author: 'Ann Patchett', year: 2023, list: 'books-of-the-year' },
  {
    title: 'The Heaven & Earth Grocery Store',
    author: 'James McBride',
    year: 2023,
    list: 'books-of-the-year',
  },
  { title: 'Happy Place', author: 'Emily Henry', year: 2023, list: 'books-of-the-year' },
  { title: 'Yellowface', author: 'R. F. Kuang', year: 2023, list: 'books-of-the-year' },
  { title: 'Prophet Song', author: 'Paul Lynch', year: 2023, list: 'books-of-the-year' },
  { title: 'The Bee Sting', author: 'Paul Murray', year: 2023, list: 'books-of-the-year' },
  { title: 'Holly', author: 'Stephen King', year: 2023, list: 'books-of-the-year' },
  { title: 'Hello Beautiful', author: 'Ann Napolitano', year: 2023, list: 'books-of-the-year' },
  { title: 'Fourth Wing', author: 'Rebecca Yarros', year: 2023, list: 'books-of-the-year' },
  // 2022
  {
    title: 'The Marriage Portrait',
    author: 'Maggie O’Farrell',
    year: 2022,
    list: 'books-of-the-year',
  },
  { title: 'Our Missing Hearts', author: 'Celeste Ng', year: 2022, list: 'books-of-the-year' },
  { title: 'The Candy House', author: 'Jennifer Egan', year: 2022, list: 'books-of-the-year' },
  { title: 'Bliss Montage', author: 'Ling Ma', year: 2022, list: 'books-of-the-year' },
  {
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    year: 2022,
    list: 'books-of-the-year',
  },
  {
    title: 'Demon Copperhead',
    author: 'Barbara Kingsolver',
    year: 2022,
    list: 'books-of-the-year',
  },
  { title: 'Lessons in Chemistry', author: 'Bonnie Garmus', year: 2022, list: 'books-of-the-year' },
  {
    title: 'Sea of Tranquility',
    author: 'Emily St. John Mandel',
    year: 2022,
    list: 'books-of-the-year',
  },
  { title: 'Babel', author: 'R. F. Kuang', year: 2022, list: 'books-of-the-year' },
  { title: 'Trust', author: 'Hernan Diaz', year: 2022, list: 'books-of-the-year' },
  // 2021
  {
    title: 'No One Is Talking About This',
    author: 'Patricia Lockwood',
    year: 2021,
    list: 'books-of-the-year',
  },
  { title: 'Harlem Shuffle', author: 'Colson Whitehead', year: 2021, list: 'books-of-the-year' },
  { title: 'Great Circle', author: 'Maggie Shipstead', year: 2021, list: 'books-of-the-year' },
  { title: 'The Every', author: 'Dave Eggers', year: 2021, list: 'books-of-the-year' },
  { title: 'Klara and the Sun', author: 'Kazuo Ishiguro', year: 2021, list: 'books-of-the-year' },
  { title: 'Project Hail Mary', author: 'Andy Weir', year: 2021, list: 'books-of-the-year' },
  { title: 'The Lincoln Highway', author: 'Amor Towles', year: 2021, list: 'books-of-the-year' },
  { title: 'Cloud Cuckoo Land', author: 'Anthony Doerr', year: 2021, list: 'books-of-the-year' },
  {
    title: 'Beautiful World, Where Are You',
    author: 'Sally Rooney',
    year: 2021,
    list: 'books-of-the-year',
  },
  { title: 'Crossroads', author: 'Jonathan Franzen', year: 2021, list: 'books-of-the-year' },
  // 2020
  { title: 'Transcendent Kingdom', author: 'Yaa Gyasi', year: 2020, list: 'books-of-the-year' },
  { title: 'Luster', author: 'Raven Leilani', year: 2020, list: 'books-of-the-year' },
  { title: 'Homeland Elegies', author: 'Ayad Akhtar', year: 2020, list: 'books-of-the-year' },
  {
    title: 'The Discomfort of Evening',
    author: 'Marieke Lucas Rijneveld',
    year: 2020,
    list: 'books-of-the-year',
  },
  { title: 'Hamnet', author: 'Maggie O’Farrell', year: 2020, list: 'books-of-the-year' },
  { title: 'The Midnight Library', author: 'Matt Haig', year: 2020, list: 'books-of-the-year' },
  { title: 'Piranesi', author: 'Susanna Clarke', year: 2020, list: 'books-of-the-year' },
  { title: 'Shuggie Bain', author: 'Douglas Stuart', year: 2020, list: 'books-of-the-year' },
  { title: 'The Vanishing Half', author: 'Brit Bennett', year: 2020, list: 'books-of-the-year' },
  {
    title: 'Mexican Gothic',
    author: 'Silvia Moreno-Garcia',
    year: 2020,
    list: 'books-of-the-year',
  },
  // 2019
  { title: 'The Nickel Boys', author: 'Colson Whitehead', year: 2019, list: 'books-of-the-year' },
  { title: 'Machines Like Me', author: 'Ian McEwan', year: 2019, list: 'books-of-the-year' },
  { title: 'Trust Exercise', author: 'Susan Choi', year: 2019, list: 'books-of-the-year' },
  { title: 'The Institute', author: 'Stephen King', year: 2019, list: 'books-of-the-year' },
  { title: 'The Testaments', author: 'Margaret Atwood', year: 2019, list: 'books-of-the-year' },
  {
    title: 'Girl, Woman, Other',
    author: 'Bernardine Evaristo',
    year: 2019,
    list: 'books-of-the-year',
  },
  {
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    year: 2019,
    list: 'books-of-the-year',
  },
  { title: 'Ninth House', author: 'Leigh Bardugo', year: 2019, list: 'books-of-the-year' },
  {
    title: 'On Earth We’re Briefly Gorgeous',
    author: 'Ocean Vuong',
    year: 2019,
    list: 'books-of-the-year',
  },
  { title: 'The Dutch House', author: 'Ann Patchett', year: 2019, list: 'books-of-the-year' },
  // 2018
  { title: 'The Overstory', author: 'Richard Powers', year: 2018, list: 'books-of-the-year' },
  { title: 'Washington Black', author: 'Esi Edugyan', year: 2018, list: 'books-of-the-year' },
  { title: 'An American Marriage', author: 'Tayari Jones', year: 2018, list: 'books-of-the-year' },
  {
    title: 'My Sister, the Serial Killer',
    author: 'Oyinkan Braithwaite',
    year: 2018,
    list: 'books-of-the-year',
  },
  { title: 'Circe', author: 'Madeline Miller', year: 2018, list: 'books-of-the-year' },
  { title: 'Normal People', author: 'Sally Rooney', year: 2018, list: 'books-of-the-year' },
  { title: 'Educated', author: 'Tara Westover', year: 2018, list: 'books-of-the-year' },
  { title: 'Milkman', author: 'Anna Burns', year: 2018, list: 'books-of-the-year' },
  { title: 'There There', author: 'Tommy Orange', year: 2018, list: 'books-of-the-year' },
  {
    title: 'The Silence of the Girls',
    author: 'Pat Barker',
    year: 2018,
    list: 'books-of-the-year',
  },

  // --- Widely read and widely translated, from further back ------------------
  { title: 'The Song of Achilles', author: 'Madeline Miller', year: 2011, list: 'popular' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', year: 2011, list: 'popular' },
  { title: 'A Little Life', author: 'Hanya Yanagihara', year: 2015, list: 'popular' },
  { title: 'The Nightingale', author: 'Kristin Hannah', year: 2015, list: 'popular' },
  { title: 'Pachinko', author: 'Min Jin Lee', year: 2017, list: 'popular' },
  {
    title: 'The Seven Husbands of Evelyn Hugo',
    author: 'Taylor Jenkins Reid',
    year: 2017,
    list: 'popular',
  },
  { title: 'Where the Crawdads Sing', author: 'Delia Owens', year: 2018, list: 'popular' },
  { title: 'Atomic Habits', author: 'James Clear', year: 2018, list: 'popular' },
];

export function featuredBooksIn(list: FeaturedList): FeaturedBook[] {
  return FEATURED_BOOKS.filter((book) => book.list === list);
}
