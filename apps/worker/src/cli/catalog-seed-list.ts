/**
 * Curated popular core for `pnpm db:seed:catalog` (docs/plan.md Phase 3): takes the cold-start
 * sting out of a fresh self-host install (the "user deletes the container in the first minute"
 * risk from docs/plan.md's risk table). Deliberately skewed toward heavily-translated classics —
 * the books a new user is most likely to try first — with original languages spread beyond
 * English, mirroring the Phase 0 research sample's design.
 *
 * Only metadata and legal links enter the database: the list feeds the ordinary
 * `SyncWorkFromSource` pipeline, so `LinkPolicy` (docs/legal-policy.md) applies to every link
 * exactly as it does for organic queries — the seed has no special powers.
 */
export const CATALOG_SEED_QUERIES: readonly string[] = [
  // Russian classics
  'Война и мир Толстой',
  'Преступление и наказание Достоевский',
  'Мастер и Маргарита Булгаков',
  'Анна Каренина Толстой',
  // English classics
  'Pride and Prejudice Jane Austen',
  '1984 George Orwell',
  'The Great Gatsby Fitzgerald',
  'Jane Eyre Charlotte Bronte',
  'The Picture of Dorian Gray Oscar Wilde',
  // French / German / Spanish / Italian originals
  'Le Petit Prince Saint-Exupery',
  'Les Miserables Victor Hugo',
  'Der Prozess Franz Kafka',
  'Cien años de soledad Gabriel García Márquez',
  'Don Quijote Cervantes',
  'Il nome della rosa Umberto Eco',
  // Broader spread
  'Norwegian Wood Haruki Murakami',
  'The Hobbit Tolkien',
  'Fahrenheit 451 Ray Bradbury',
  'Brave New World Aldous Huxley',
  'The Alchemist Paulo Coelho',
];
