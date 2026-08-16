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
  'home.title': 'Golden Library',
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

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Free to read right now',
  'free.homeBlurb':
    'Public domain and openly licensed books this copy of the site can hand you directly.',
  'free.seeAll': 'See more',
  'free.downloadable': 'Download',
  'free.pageTitle': 'Free books',
  'free.pageBlurb':
    'Every book here has at least one legal free copy — public domain, or given away by the rights holder. No purchase, no library card.',
  'free.empty':
    'Nothing free here yet. Free copies show up as this instance fetches books, so search for one and come back.',
  'free.emptyForLanguage':
    'No free copies in {language} yet. Drop the filter above to see the whole shelf.',
  'free.showMore': 'Show more',
  'free.shown': 'Showing {shown} of {total}.',
  'free.allLanguages': 'Free copies in every language.',
  'free.filteredByLanguage': 'Only free copies in {language}.',
  'free.filterByLanguage': 'Show only the free copies in {language}.',
  'free.dropLanguageFilter': 'show every language',
  'free.loadFailed': 'The free books could not be loaded just now.',

  // --- Work card ----------------------------------------------------------
  'work.original': 'original',
  'work.dataSources': 'Data sources',
  'work.about': 'About this book',
  'work.translatedInto': 'Translated into',
  'work.availableIn': 'Available in',
  'work.languagesNote':
    'Only what the sources we read list — a translation missing here may still exist.',
  'work.noTranslations': 'No translations found yet.',
  'work.yourLanguage.title': 'In your language',
  'work.yourLanguage.yes': 'There is a translation into {language}.',
  'work.yourLanguage.original': 'This book was written in {language}.',
  'work.yourLanguage.no': 'No translation into {language} among the editions known here.',
  'work.yourLanguage.show': 'Show editions in {language}',
  'work.editions': 'Editions ({shown} of {total})',
  'work.filterLanguage': 'Language',
  'work.filterAllLanguages': 'All languages',
  'work.filterYear': 'Year',
  'work.filterApply': 'Filter',
  'work.filterReset': 'Reset',
  'work.noEditionsMatch': 'No editions match these filters.',
  'work.showMoreEditions': 'Show more editions ({remaining} left)',
  'work.badgeFreeDownload': 'free download',
  'work.freeDownloadFormat': 'Download {format}',
  'work.freeDownloadNote': '{rights}. Free from {provider} — no account, no payment.',
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
  'links.viaOtherEdition': 'free copy from the {label} edition',
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
  'compare.editSelection': 'Change editions',
  'compare.showAllEditions': 'Show all {count} editions',
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
  'search.freeOnlyToggle': 'Free to download',
  'search.noFreeResults': 'None of these have a free download yet — try turning the filter off.',
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

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Shelf',
  'shelf.title': 'Shelf',
  'shelf.intro':
    'Open catalogs, and any library server you run yourself. Catalogs you add stay in this browser and are never sent to this site.',
  'shelf.openCatalogs': 'Open catalogs',
  'shelf.yourCatalogs': 'Your catalogs',
  'shelf.addCatalog': 'Add a catalog',
  'shelf.name': 'Name',
  'shelf.address': 'OPDS address',
  'shelf.username': 'Username (optional)',
  'shelf.password': 'Password (optional)',
  'shelf.credentialsNote': 'The address and any credentials are stored in this browser only.',
  'shelf.add': 'Add',
  'shelf.remove': 'Remove',
  'shelf.loading': 'Loading catalog…',
  'shelf.empty': 'This catalog has no entries.',
  'shelf.noCatalogs':
    'None of your own yet. Add a Calibre-Web, COPS, Kavita or Audiobookshelf address below.',
  'shelf.unreachable':
    'Your browser could not read this catalog. A server on your own network will work; public sites often refuse cross-origin requests.',
  'shelf.nextPage': 'Next page',
  'shelf.previousPage': 'Previous page',
  'shelf.drm': 'Needs a DRM app',
  'shelf.notFree': 'Not a free download',
  'shelf.download': 'Download',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Bookshops near you',
  'stores.useMyLocation': 'Use my location',
  'stores.placeLabel': 'City or postcode',
  'stores.find': 'Find',
  'stores.locating': 'Looking…',
  'stores.failed': 'Location unavailable. Type a city or postcode instead.',
  'stores.none': 'No bookshops mapped within {radius} km.',
  'stores.distance': '{distance} km away',
  'stores.stockUnknown': 'Map data only — nobody publishes what a shop has in stock.',
  'stores.lookupFailed': 'Could not reach OpenStreetMap just now. Try again in a moment.',
  'stores.privacy':
    'Your location is rounded to about 100 m and sent only to OpenStreetMap — never to this site.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Prices and shops',
  'prices.loading': 'Asking the shops…',
  'prices.unknown': 'Price not published',
  'prices.degraded': 'No answer from: {providers}',
  'prices.format.hardcover': 'Hardcover',
  'prices.format.paperback': 'Paperback',
  'prices.format.ebook': 'Ebook',
  'prices.format.audiobook': 'Audiobook',
  'prices.format.unknown': 'Format not stated',

  // Reader ratings of an edition, never of a translation — see TranslationRatings.tsx. Every one
  // of these strings has to keep saying so; a shorter phrasing that drops "readers" or the source
  // name turns a crowd's opinion into this project's verdict.
  'ratings.edition': '{average} of {outOf} from {votes} readers on {source}',
  'ratings.lowConfidence': 'too few votes to compare',
  'ratings.reviews': 'Reviews',
  'ratings.reviewsOn': 'Reviews of this edition on {source}',
  'ratings.noteNoRatings':
    'No open source rates a translation, and none of these printings has a reader rating here.',
  'ratings.noteReviews':
    'Where an edition is known on {sources}, the link goes to the reviews of that exact printing — most editions are not.',
  'ratings.translator':
    'Editions translated by {name}: {average} of {outOf} across {editions} rated editions, {votes} readers in total.',
  'ratings.note':
    'These are readers’ ratings of a specific edition on {sources}, not an assessment of the translation itself — nobody publishes that. They are worth reading side by side: same book, same language, different translators, and always with the number of votes in view.',
  'ratings.gapWithoutIsbn':
    '{count} editions here carry no ISBN, so no rating could be matched to them.',
  'ratings.gapNotLookedUp': '{count} further editions were not looked up in this request.',
  'recommend.hideGenre': 'hide “{genre}”',
  'recommend.hiddenList': 'Hidden genres (click to bring one back):',

  // --- Settings popups ------------------------------------------------------
  // One popup per changed preference. The status word says how it went, the sentence says what
  // changed and what it now affects — see `lib/setting-change.ts`.
  'settings.status.saved': 'Saved',
  'settings.status.cleared': 'Cleared',
  'settings.status.unstored': 'Not stored',
  'settings.status.failed': 'Unchanged',
  'settings.notStored':
    'This browser refused to store the change, so nothing happened — the value you had before still applies.',

  'settings.language.title': 'Interface language',
  'settings.language.changed':
    'Changed from {from} to {to}. The interface reloads in {to}; book titles and author names stay in their own languages.',

  'settings.country.title': 'Shopping country',
  'settings.country.changed':
    'Set to {country}. Bookstore links now offer shops that deliver there, alongside the worldwide ones.',
  'settings.country.cleared':
    'No country chosen. Only bookstores that ship worldwide will be offered.',

  'settings.bookLanguage.title': 'Book language',
  'settings.bookLanguage.changed':
    'Set to {language}. Genre pages will lead with books that have a {language} edition until you reset the filter.',
  'settings.bookLanguage.cleared': 'Cleared. Genre pages show books in every language again.',

  'settings.hiddenGenres.title': 'Hidden genres',
  'settings.hiddenGenres.hidden':
    '“{genre}” is hidden. It is no longer sent to the server when suggestions are fetched, and {count} genres are hidden in total.',
  'settings.hiddenGenres.restored':
    '“{genre}” is back in your suggestions. {count} genres are still hidden.',

  'settings.history.title': 'Reading history',
  'settings.history.cleared':
    'The books you had opened are deleted from this browser. Suggestions stay away until you open another book.',

  'settings.bookmarks.title': 'Saved books',
  'settings.bookmarks.added': '“{title}” was added to your saved books.',
  'settings.bookmarks.removed': '“{title}” was removed from your saved books.',
  'settings.bookmarks.failed':
    'The server did not accept the change, so your saved books are as they were.',

  'settings.catalogs.title': 'Your catalogs',
  'settings.catalogs.added':
    '“{name}” was added at {url}. Its address stays in this browser and is never sent to this site.',
  'settings.catalogs.addedWithCredentials':
    '“{name}” was added at {url}, with the username and password you typed. All of it stays in this browser and none of it is sent to this site.',
  'settings.catalogs.removed':
    '“{name}” was removed from this browser, along with any credentials stored for it.',
  'settings.catalogs.rejected': 'Nothing was added: {reason}',
  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Addons',
  'addons.title': 'Addons',
  'addons.intro':
    'An addon adds sources of its own. You install one by pasting its address; it runs either on your device, in a sandbox, or on its author’s server. Golden Library ships none, lists none, and does not check what they return.',
  'addons.addressLabel': 'Addon address',
  'addons.addressHint': 'The manifest URL the addon’s author gave you.',
  'addons.continue': 'Continue',
  'addons.fromServer': 'From a server',
  'addons.fromFile': 'From a file on your device',
  'addons.bundleLabel': 'Addon code address',
  'addons.bundleHint': 'The URL of the addon’s code. It will run on this device, not on a server.',
  'addons.integrityLabel': 'Integrity hash',
  'addons.integrityHint':
    'Given by the addon’s author, as sha256-… . Required: without it, code you approved once could change afterwards and you would never know.',
  'addons.checking': 'Reading the addon…',
  'addons.installedHeading': 'Installed',
  'addons.none': 'No addons yet. Everything on this site so far comes from the instance itself.',
  'addons.priorityHint': 'Order is priority: the first addon answers first.',
  'addons.enable': 'Turn on',
  'addons.disable': 'Turn off',
  'addons.off': 'Off',
  'addons.remove': 'Remove',
  'addons.moveUp': 'Move up',
  'addons.moveDown': 'Move down',
  'addons.configure': 'Configure',
  'addons.failedToStart': '“{name}” did not start: {reason}',
  'addons.consentTitle': 'Install “{name}”?',
  'addons.consentHosts': 'It will contact: {hosts}',
  'addons.consentNoHosts': 'It has not asked to contact anything.',
  'addons.consentSeesYou':
    'This addon runs on its author’s server. They will see your address and everything you look for through it.',
  'addons.consentSandboxed':
    'This addon runs on your device in a sandbox. It cannot read your cookies, this site’s data, or anything else you have open.',
  'addons.consentNotVetted':
    'Golden Library does not check what an addon returns, and did not recommend this one. What you install is your choice.',
  'addons.install': 'Install',
  'addons.cancel': 'Cancel',
  'addons.via': 'via {name}',
  'addons.sourcesTitle': 'From your addons',
  'addons.searchTitle': 'Found by your addons',
  'addons.showLinks': 'Show download links',
  'addons.unreadable': '{count} entries from this addon could not be read.',
  'addons.browse': 'Browse catalog',
  'addons.browseTitle': '{name}’s catalog',
  'addons.browseNoCatalog': 'This addon doesn’t offer a catalog to browse.',
  'addons.browseEmpty': 'This addon’s catalog is empty right now.',
  'addons.browseFailed': '“{name}”’s catalog could not be loaded: {reason}',
  'addons.loadMore': 'Load more',
  'addons.notInstalled': 'This addon isn’t installed.',

  'settings.addons.title': 'Your addons',
  'settings.addons.installed':
    '“{name}” is installed. It will be asked alongside the others, and may contact {hosts}.',
  'settings.addons.removed':
    '“{name}” was removed. Its results are gone from this browser, and so is anything it had stored here.',
  'settings.addons.enabled': '“{name}” is on again and will be asked with the others.',
  'settings.addons.disabled':
    '“{name}” is off. It stays installed with its settings, but nothing it returns will be shown.',
  'settings.addons.reordered': '“{name}” now answers {position} of {total}.',
  'settings.addons.rejected': 'Nothing was installed: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Custom sources',
  'customSources.title': 'Custom sources',
  'customSources.intro':
    'Add a shop or catalog of your own by giving it a name and a search URL with {isbn}, {query}, {title}, {author} or {language} in it. The link is built on this device and this site never fetches it.',
  'customSources.nameLabel': 'Name',
  'customSources.templateLabel': 'URL template',
  'customSources.templateHint':
    'An absolute https:// address. {isbn}, {query}, {title}, {author} and {language} are filled in from the edition; a placeholder left empty means the link is skipped for that edition.',
  'customSources.add': 'Add source',
  'customSources.listHeading': 'Your sources',
  'customSources.none': 'No custom sources yet.',
  'customSources.off': 'Off',
  'customSources.enable': 'Turn on',
  'customSources.disable': 'Turn off',
  'customSources.remove': 'Remove',
  'customSources.heading': 'Your sources',
  'customSources.caption':
    'Links you configured yourself. This instance does not check where they lead.',

  'settings.customSources.title': 'Your custom sources',
  'settings.customSources.added': '“{name}” was added and will be offered alongside the others.',
  'settings.customSources.removed': '“{name}” was removed from this browser.',
  'settings.customSources.enabled': '“{name}” is on again.',
  'settings.customSources.disabled':
    '“{name}” is off. It stays configured, but its link will not be shown.',
  'settings.customSources.rejected': 'Nothing was added: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Books in your language',
  'featured.inLanguageBlurb':
    'Books written in the language you are reading this site in, the most-published first — Open Library’s own ordering, not a bestseller chart.',
  'work.newSearch': 'New search',
  'work.descriptionFrom': 'Description:',
  'work.descriptionNotLocalized':
    'This description is in the language the source wrote it in — there is none in your language for this book yet.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Read in your browser',
  'reader.privacy':
    'Your browser opens this book on its own. The file, the place it came from, and how far you have read never reach this site.',
  'reader.chooseFile': 'Open a book from this device',
  'reader.formats': 'EPUB, FB2, MOBI and CBZ.',
  'reader.loading': 'Opening…',
  'reader.failed': 'This book could not be opened: {reason}',
  'reader.previous': 'Previous page',
  'reader.next': 'Next page',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…or drop a book here',
  'reader.fetching': 'Asking {host} for the file…',
  'reader.blockedTitle': '{host} did not hand the file to this page',
  'reader.blockedBody':
    'Either it is unreachable, or it does not allow other sites to read its files. This site will not fetch it for you instead: your book never passes through it, and that is the whole point of reading here.',
  'reader.blockedDownload': 'Download it from {host}',
  'reader.blockedOpenHere': 'then open it here from your device',
  'reader.blockedAddon': 'An addon that serves the file itself will also work.',
  'reader.keepFile': 'Keep this book in this browser',
  'reader.keepFileHint':
    'Off by default. Without it the file is gone when you close the tab; with it, it stays on this device only.',
  'reader.library': 'Kept in this browser',
  'reader.libraryEmpty':
    'Nothing kept yet. Books you keep stay on this device and are never uploaded.',
  'reader.libraryOpen': 'Open',
  'reader.libraryRemove': 'Remove',
  'reader.libraryFileKept': 'file kept',
  'reader.libraryFileGone': 'file not kept',
  'reader.untitled': 'Untitled book',
  'settings.reader.libraryTitle': 'Books kept in this browser',
  'settings.reader.kept':
    '“{title}” is now kept on this device, so it opens without downloading it again. It is not uploaded anywhere.',
  'settings.reader.forgotten':
    'The file for “{title}” was deleted from this browser. It stays in the list, so you can open it again from its source.',
  'settings.reader.removed':
    '“{title}” was removed from this browser entirely — the file and the entry.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Opened where you left off — {percent}% in.',
  'reader.bookmarks': 'Bookmarks',
  'reader.bookmarkAdd': 'Bookmark this page',
  'reader.bookmarkNone': 'No bookmarks in this book yet.',
  'reader.bookmarkGo': 'Go to',
  'reader.bookmarkRemove': 'Remove bookmark',
  'reader.bookmarkNote': 'Note',
  'reader.bookmarkNotePlaceholder': 'Your own words about this page',
  'reader.bookmarkAt': '{percent}% in',
  'settings.reader.bookmarkTitle': 'Bookmarks in this browser',
  'settings.reader.bookmarkAdded':
    'Bookmarked {percent}% into “{title}”. Bookmarks stay on this device with the book.',
  'settings.reader.bookmarkRemoved': 'That bookmark in “{title}” was removed from this browser.',
  'settings.reader.noteSaved': 'Your note on this page of “{title}” was saved on this device.',
  'settings.reader.positionTitle': 'Reading position',
  'settings.reader.positionUnstored':
    'This browser would not store where you are in “{title}”, so it will open at the beginning next time. Private mode and a full disk both do this.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': 'How this book looks',
  'reader.theme': 'Colours',
  'reader.themeApp': 'Follow the site',
  'reader.themeLight': 'Paper',
  'reader.themeDark': 'Ink',
  'reader.themeSepia': 'Sepia',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint': 'Pure black on white, no animation, one column — for e-paper screens.',
  'reader.fontSize': 'Type size',
  'reader.smaller': 'Smaller',
  'reader.larger': 'Larger',
  'reader.lineHeight': 'Line spacing',
  'reader.margin': 'Margins',
  'reader.flow': 'Pages',
  'reader.flowPaged': 'Turn pages',
  'reader.flowScrolled': 'Scroll',
  'reader.justify': 'Justify text',
  'reader.hyphenate': 'Hyphenate',
  'reader.displayReset': 'Back to defaults',
  'settings.reader.displayTitle': 'Reading display',
  'settings.reader.displayChanged':
    '{setting} is now {value}. It applies to every book you open in this browser.',
  'settings.reader.displayReset':
    'Reading display is back to its defaults for every book in this browser.',
  'reader.on': 'On',
  'reader.off': 'Off',
  'reader.openHere': 'Read in your browser',
  'reader.notAFileTitle': '{host} sent a web page, not the file',
  'reader.notAFileBody':
    'The link leads to a page rather than to a book — a download page, a consent screen, or a check that you are not a robot. Open it yourself and the file will be there.',
  'settings.status.session': 'Not remembered',
  'settings.notRemembered':
    'This browser would not remember it, so it will be back to how it was next time you open a book.',
} as const;
