/**
 * English is the source dictionary: its keys define the type every other language must satisfy,
 * so a missing translation is a compile error rather than an English word in the middle of a
 * Japanese page.
 *
 * Keys are named for where the string appears, not for the English text, so rewording the English
 * does not orphan fifteen translations.
 */
export const en = {
  // --- Chrome -------------------------------------------------------------
  'nav.savedBooks': 'Saved books',
  'nav.signIn': 'Sign in',
  'nav.signOut': 'Sign out',
  'nav.language': 'Language',
  'nav.skipToContent': 'Skip to content',

  'footer.legal':
    'Legal sources only: direct downloads exclusively for public domain and openly licensed works; copyrighted books — purchase or library lending. Every link carries an explicit rights status.',
  'footer.openSource': 'Open source',
  'footer.openSourceRest': '— MIT licensed, self-hostable. View the code on GitHub.',

  // --- Home ---------------------------------------------------------------
  'home.title': 'BookTranslate Finder',
  'home.subtitle': 'An open book translation aggregator: languages, editions, and legal sources.',
  'home.searchLabel': 'Title and author',
  'home.searchPlaceholder': 'War and Peace Tolstoy',
  'home.searchButton': 'Search',

  'search.searching': 'Searching…',
  'search.backfilling':
    'Nothing here yet — fetching this book from the sources. This takes a few seconds.',
  'search.notFound': 'Nothing found for this query.',
  'search.retry': 'Try again',
  'search.signInPrompt':
    'to save the books you find here and come back to them — and to compare editions from different years side by side before you choose one.',

  'featured.yearHeading': 'Books of the year',
  'featured.yearBlurb':
    'Notable books from each recent year. A hand-curated list, not a sales chart — no open source publishes one.',
  'featured.popularHeading': 'Widely read, widely translated',
  'featured.popularBlurb': 'Books that exist in many languages — which is what this site is for.',
  'featured.filling':
    'Still fetching a few of these in the background. Reload in a minute to see the rest.',
  'featured.freeCopy': 'Free copy',

  // --- Work card ----------------------------------------------------------
  'work.original': 'original',
  'work.dataSources': 'Data sources',
  'work.about': 'About this book',
  'work.translatedInto': 'Translated into',
  'work.noTranslations': 'No translations found yet.',
  'work.editions': 'Editions ({shown} of {total})',
  'work.filterLanguage': 'Language',
  'work.filterAllLanguages': 'All languages',
  'work.filterYear': 'Year',
  'work.filterApply': 'Filter',
  'work.filterReset': 'Reset',
  'work.noEditionsMatch': 'No editions match these filters.',
  'work.badgeReadBorrow': 'read or borrow',
  'work.badgeInBookstores': 'in bookstores',
  'work.translatedBy': 'translated by {name}',
  'work.pages': '{count} pages',

  'bookmark.save': 'Save this book',
  'bookmark.saved': 'Saved',
  'bookmark.signInToSave': 'Sign in to save',
  'bookmark.failed': 'Could not save. Try again.',

  // --- Links panel --------------------------------------------------------
  'links.show': 'Show links',
  'links.hide': 'Hide links',
  'links.loading': 'Loading links',
  'links.none': 'No legal links for this edition yet.',
  'links.failed': 'Failed to load links.',
  'links.storesHeading': 'Find in a bookstore',
  'links.storesInCountry': 'In {country}',
  'links.storesYourCountry': 'your country',
  'links.storesLanguageMarket': 'Where {language} books are sold',
  'links.storesLanguageMarketGeneric': "Where this edition's language is sold",
  'links.storesWorldwide': 'Ships worldwide',
  'links.storesCaption':
    "Each link searches that store's own catalogue — availability and price are shown by the store itself.",

  'linkType.download': 'Download',
  'linkType.buy': 'Buy',
  'linkType.borrow': 'Borrow from a library',
  'linkType.listen': 'Listen (audiobook)',
  'rights.public_domain': 'Public domain',
  'rights.open_license': 'Open license',
  'rights.copyrighted': 'Copyrighted',
  'rights.unknown': 'Status unknown',

  // --- Comparison ---------------------------------------------------------
  'compare.heading': 'Compare editions',
  'compare.blurb': 'Pick two or three editions to see what actually differs between them.',
  'compare.selected': 'Selected {count} of at least 2.',
  'compare.columnDifference': 'Difference',
  'compare.identical': 'These editions are identical in everything the sources record.',
  'compare.rowLanguage': 'Language',
  'compare.rowPublished': 'Published',
  'compare.rowPublisher': 'Publisher',
  'compare.rowTranslator': 'Translator',
  'compare.rowTranslatedFrom': 'Translated from',
  'compare.rowBinding': 'Binding',
  'compare.rowPages': 'Pages',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Free or borrowable copy',
  'compare.yes': 'yes ({count})',
  'compare.no': 'not found',

  // --- Country selector ---------------------------------------------------
  'country.label': 'Where do you buy books?',
  'country.worldwideOnly': 'Worldwide stores only',

  // --- Accounts -----------------------------------------------------------
  'auth.signInTitle': 'Sign in',
  'auth.registerTitle': 'Create an account',
  'auth.blurb':
    'An account exists for one reason: to save books you find and come back to them — with the languages they were translated into, the editions that exist, and where to get each one legally. No newsletter, no profile, no tracking.',
  'auth.name': 'Name (optional)',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.passwordHint':
    'At least {min} characters. Length is all that is checked — a long phrase you can remember beats a short one with punctuation in it.',
  'auth.submitSignIn': 'Sign in',
  'auth.submitRegister': 'Create account',
  'auth.working': 'Working…',
  'auth.google': 'Continue with Google',
  'auth.toRegister': 'No account yet? Create one',
  'auth.toSignIn': 'Already have an account? Sign in',
  'auth.backToSearch': 'Back to search',
  'auth.errorGoogleState':
    'That sign-in link expired or was opened in a different browser. Please try again.',
  'auth.errorGoogleFailed':
    'Google sign-in did not complete. You can use an email and password instead.',
  'auth.errorGeneric': 'Something went wrong.',

  'bookmarks.title': 'Saved books',
  'bookmarks.signedOut':
    'to keep the books you find — and to compare editions of the same book side by side later.',
  'bookmarks.loading': 'Loading…',
  'bookmarks.empty': 'Nothing saved yet. Find a book and use “Save this book” on its card.',
  'bookmarks.searchLink': 'Search',
  'bookmarks.remove': 'Remove',
  'bookmarks.loadFailed': 'Could not load your saved books.',
  'search.failed': 'Search failed.',
  'search.pending': 'Not in our database yet — checking the sources',
  'search.pendingLong':
    'Still searching: the first request for a book gathers data from the sources, which can take up to a couple of minutes',
  'search.notFoundHint': 'Nothing found. Try refining the title or author.',
  'search.timedOut':
    'The sources are responding slowly and we have no data yet. The background sync may have already finished — try again.',
  'home.tagline': 'Find your next magnum opus',
  'subject.allLanguages': 'All languages.',
  'subject.filteredByLanguage': 'Only books with a {language} edition.',
  'subject.dropLanguageFilter': 'show all languages',
  'subject.empty':
    'Nothing under this tag yet. Tags come from the books this instance has already fetched.',
  'featured.year': '{year}',
  'nav.browse': 'Browse by genre',
  'recommend.heading': 'Because of what you have been reading',
  'recommend.becauseOf': 'You opened “{title}”, so here are books sharing its genres.',
  'recommend.blurb': 'Books sharing the genres you have been opening.',
  'recommend.privacy':
    'This is worked out in your browser — the server is told the genres, never who you are.',
  'recommend.forget': 'forget my history',
} as const;
