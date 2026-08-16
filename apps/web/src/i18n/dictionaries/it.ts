import type { Dictionary } from '../dictionary';

export const it: Dictionary = {
  'nav.savedBooks': 'Libri salvati',
  'nav.signIn': 'Accedi',
  'nav.signOut': 'Esci',
  'nav.language': 'Lingua',
  'nav.skipToContent': 'Vai al contenuto',
  'footer.legal':
    "Solo fonti legali: download diretto esclusivamente per opere di pubblico dominio e con licenza aperta; libri sotto diritto d'autore — acquisto o prestito bibliotecario. Ogni link dichiara esplicitamente il proprio stato giuridico.",
  'footer.openSource': 'Open source',
  'footer.openSourceRest': '— licenza MIT, ospitabile in proprio. Codice su GitHub.',
  'home.title': 'Golden Library',
  'home.subtitle': 'Un aggregatore aperto di traduzioni: lingue, edizioni e fonti legali.',
  'home.searchLabel': 'Titolo e autore',
  'home.searchPlaceholder': 'Guerra e pace Tolstoj',
  'home.searchButton': 'Cerca',
  'search.searching': 'Ricerca in corso…',
  'search.backfilling':
    'Ancora niente — stiamo recuperando questo libro dalle fonti. Ci vogliono pochi secondi.',
  'search.notFound': 'Nessun risultato per questa ricerca.',
  'search.retry': 'Riprova',
  'search.signInPrompt':
    ' per salvare i libri che trovi e tornarci — e confrontare edizioni di anni diversi prima di sceglierne una.',
  'featured.yearHeading': "Libri dell'anno",
  'featured.yearBlurb':
    'Libri significativi per ciascuno degli anni recenti. Un elenco curato a mano, non una classifica di vendite — nessuna fonte aperta ne pubblica una.',
  'featured.popularHeading': 'Molto letti, molto tradotti',
  'featured.popularBlurb':
    'Libri che esistono in molte lingue — è esattamente a questo che serve il sito.',
  'featured.filling':
    'Alcuni sono ancora in arrivo in background. Ricarica la pagina tra un minuto.',
  'featured.freeCopy': 'Copia gratuita',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Da leggere gratis',
  'free.homeBlurb':
    'Libri di pubblico dominio e con licenza aperta che questa istanza consegna direttamente.',
  'free.seeAll': 'Vedi altro',
  'free.downloadable': 'Scarica',
  'free.pageTitle': 'Libri gratuiti',
  'free.pageBlurb':
    'Ogni libro qui ha almeno una copia gratuita legale: pubblico dominio, o concessa dal titolare dei diritti. Senza acquisto e senza tessera della biblioteca.',
  'free.empty':
    'Qui non c’è ancora nulla di gratuito. Le copie gratuite compaiono man mano che questa istanza recupera libri: cercane uno e torna a controllare.',
  'free.emptyForLanguage':
    'Non ci sono ancora copie gratuite in {language}. Togli il filtro qui sopra per vedere tutto lo scaffale.',
  'free.showMore': 'Mostra altri',
  'free.shown': 'Mostrati {shown} di {total}.',
  'free.allLanguages': 'Copie gratuite in tutte le lingue.',
  'free.filteredByLanguage': 'Solo copie gratuite in {language}.',
  'free.filterByLanguage': 'Mostra solo le copie gratuite in {language}.',
  'free.dropLanguageFilter': 'mostra tutte le lingue',
  'free.loadFailed': 'Al momento non è stato possibile caricare i libri gratuiti.',
  'work.original': 'originale',
  'work.dataSources': 'Fonti dei dati',
  'work.about': 'Su questo libro',
  'work.translatedInto': 'Tradotto in',
  'work.availableIn': 'Disponibile in',
  'work.languagesNote':
    'Solo ciò che elencano le nostre fonti: una traduzione assente qui può esistere comunque.',
  'work.noTranslations': 'Nessuna traduzione trovata per ora.',
  'work.yourLanguage.title': 'Nella tua lingua',
  'work.yourLanguage.yes': 'Esiste una traduzione in {language}.',
  'work.yourLanguage.original': 'Questo libro è stato scritto in {language}.',
  'work.yourLanguage.no': 'Nessuna traduzione in {language} tra le edizioni note.',
  'work.yourLanguage.show': 'Mostra le edizioni in {language}',
  'work.editions': 'Edizioni ({shown} di {total})',
  'work.filterLanguage': 'Lingua',
  'work.filterAllLanguages': 'Tutte le lingue',
  'work.filterYear': 'Anno',
  'work.filterApply': 'Filtra',
  'work.filterReset': 'Reimposta',
  'work.noEditionsMatch': 'Nessuna edizione corrisponde a questi filtri.',
  'work.showMoreEditions': 'Mostra altre edizioni (ne restano {remaining})',
  'work.badgeFreeDownload': 'download gratuito',
  'work.freeDownloadFormat': 'Scarica {format}',
  'work.freeDownloadNote': '{rights}. Gratis da {provider}: senza account e senza pagamento.',
  'work.badgeReadBorrow': 'leggi o prendi in prestito',
  'work.badgeInBookstores': 'in libreria',
  'work.translatedBy': 'traduzione di {name}',
  'work.pages': '{count} pagine',
  'bookmark.save': 'Salva questo libro',
  'bookmark.saved': 'Salvato',
  'bookmark.signInToSave': 'Accedi per salvare',
  'bookmark.failed': 'Salvataggio non riuscito. Riprova.',
  'links.show': 'Mostra i link',
  'links.hide': 'Nascondi i link',
  'links.loading': 'Caricamento dei link',
  'links.none': 'Per questa edizione non ci sono ancora link legali.',
  'links.viaOtherEdition': "copia gratuita dall'edizione {label}",
  'links.failed': 'Impossibile caricare i link.',
  'links.storesHeading': 'Trova in libreria',
  'links.storesInCountry': 'In {country}',
  'links.storesYourCountry': 'il tuo paese',
  'links.storesLanguageMarket': 'Dove si vendono libri in {language}',
  'links.storesLanguageMarketGeneric': 'Dove si vendono libri nella lingua di questa edizione',
  'links.storesWorldwide': 'Spedizione in tutto il mondo',
  'links.storesCaption':
    'Ogni link cerca nel catalogo della libreria stessa — disponibilità e prezzo li mostra lei.',
  'linkType.download': 'Scarica',
  'linkType.buy': 'Acquista',
  'linkType.borrow': 'Prendi in prestito in biblioteca',
  'linkType.listen': 'Ascolta (audiolibro)',
  'rights.public_domain': 'Pubblico dominio',
  'rights.open_license': 'Licenza aperta',
  'rights.copyrighted': "Sotto diritto d'autore",
  'rights.unknown': 'Stato sconosciuto',
  'compare.heading': 'Confronta le edizioni',
  'compare.blurb': 'Scegli due o tre edizioni per vedere in cosa differiscono davvero.',
  'compare.selected': 'Selezionate {count}, ne servono almeno 2.',
  'compare.editSelection': 'Cambia edizioni',
  'compare.showAllEditions': 'Mostra tutte le {count} edizioni',
  'compare.columnDifference': 'Differenza',
  'compare.identical': 'In tutto ciò che le fonti registrano, queste edizioni sono identiche.',
  'compare.rowLanguage': 'Lingua',
  'compare.rowPublished': 'Pubblicazione',
  'compare.rowPublisher': 'Editore',
  'compare.rowTranslator': 'Traduttore',
  'compare.rowTranslatedFrom': 'Tradotto dal',
  'compare.rowBinding': 'Rilegatura',
  'compare.rowPages': 'Pagine',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Copia gratuita o in prestito',
  'compare.yes': 'sì ({count})',
  'compare.no': 'non trovata',
  'country.label': 'Dove compri i libri?',
  'country.worldwideOnly': 'Solo librerie che spediscono ovunque',
  'auth.signInTitle': 'Accedi',
  'auth.registerTitle': 'Crea un account',
  'auth.blurb':
    "L'account serve a una cosa sola: salvare i libri che trovi e tornarci — con le lingue in cui sono stati tradotti, le edizioni esistenti e dove ottenere ciascuna legalmente. Nessuna newsletter, nessun profilo, nessun tracciamento.",
  'auth.name': 'Nome (facoltativo)',
  'auth.email': 'E-mail',
  'auth.password': 'Password',
  'auth.passwordHint':
    'Almeno {min} caratteri. Viene controllata solo la lunghezza — una frase lunga che ricordi vale più di una corta con la punteggiatura.',
  'auth.submitSignIn': 'Accedi',
  'auth.submitRegister': 'Crea account',
  'auth.working': 'Un attimo…',
  'auth.google': 'Continua con Google',
  'auth.toRegister': 'Non hai ancora un account? Crealo',
  'auth.toSignIn': 'Hai già un account? Accedi',
  'auth.backToSearch': 'Torna alla ricerca',
  'auth.errorGoogleState':
    'Questo link di accesso è scaduto o è stato aperto in un altro browser. Riprova.',
  'auth.errorGoogleFailed':
    "L'accesso con Google non è andato a buon fine. Puoi usare e-mail e password.",
  'auth.errorGeneric': 'Qualcosa è andato storto.',
  'bookmarks.title': 'Libri salvati',
  'bookmarks.signedOut':
    ' per conservare i libri che trovi — e in seguito confrontare edizioni dello stesso libro.',
  'bookmarks.loading': 'Caricamento…',
  'bookmarks.empty':
    'Non hai ancora salvato nulla. Trova un libro e usa «Salva questo libro» sulla sua scheda.',
  'bookmarks.searchLink': 'Cerca',
  'bookmarks.remove': 'Rimuovi',
  'bookmarks.loadFailed': 'Impossibile caricare i tuoi libri salvati.',
  'search.failed': 'La ricerca non è riuscita.',
  'search.pending': 'Non è ancora nel nostro archivio — stiamo interrogando le fonti',
  'search.pendingLong':
    'Stiamo ancora cercando: la prima richiesta per un libro raccoglie i dati dalle fonti e può richiedere un paio di minuti',
  'search.notFoundHint': "Nessun risultato. Prova a precisare il titolo o l'autore.",
  'search.timedOut':
    'Le fonti rispondono lentamente e non abbiamo ancora dati. La sincronizzazione in background potrebbe essere già finita — riprova.',
  'search.freeOnlyToggle': 'Copia gratuita',
  'search.noFreeResults':
    'Nessuno di questi ha ancora una copia gratuita — prova a disattivare il filtro.',
  'home.tagline': 'Trova il tuo prossimo magnum opus',
  'subject.allLanguages': 'Tutte le lingue.',
  'subject.filteredByLanguage': 'Solo libri con un’edizione in {language}.',
  'subject.dropLanguageFilter': 'mostra tutte le lingue',
  'subject.empty':
    'Sotto questa etichetta non c’è ancora nulla. Le etichette vengono dai libri già recuperati da questa istanza.',
  'featured.year': '{year}',
  'nav.browse': 'Per genere',
  'recommend.heading': 'In base a ciò che hai letto',
  'recommend.becauseOf': 'Hai aperto «{title}»: ecco libri degli stessi generi.',
  'recommend.blurb': 'Libri dei generi che hai aperto.',
  'recommend.privacy':
    'Il calcolo avviene nel tuo browser — al server vengono comunicati i generi, mai chi sei.',
  'recommend.forget': 'dimentica la mia cronologia',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Scaffale',
  'shelf.title': 'Scaffale',
  'shelf.intro':
    'Cataloghi aperti e qualsiasi server di biblioteca che gestisci tu stesso. I cataloghi che aggiungi restano in questo browser e non vengono mai inviati a questo sito.',
  'shelf.openCatalogs': 'Cataloghi aperti',
  'shelf.yourCatalogs': 'I tuoi cataloghi',
  'shelf.addCatalog': 'Aggiungi un catalogo',
  'shelf.name': 'Nome',
  'shelf.address': 'Indirizzo OPDS',
  'shelf.username': 'Nome utente (facoltativo)',
  'shelf.password': 'Password (facoltativa)',
  'shelf.credentialsNote': "L'indirizzo e le credenziali sono conservati solo in questo browser.",
  'shelf.add': 'Aggiungi',
  'shelf.remove': 'Rimuovi',
  'shelf.loading': 'Caricamento del catalogo…',
  'shelf.empty': 'Questo catalogo non contiene voci.',
  'shelf.noCatalogs':
    'Ancora nessuno tuo. Aggiungi qui sotto un indirizzo di Calibre-Web, COPS, Kavita o Audiobookshelf.',
  'shelf.unreachable':
    'Il tuo browser non è riuscito a leggere questo catalogo. Un server sulla tua rete funziona; i siti pubblici spesso rifiutano le richieste cross-origin.',
  'shelf.nextPage': 'Pagina successiva',
  'shelf.previousPage': 'Pagina precedente',
  'shelf.drm': 'Richiede unʼapp con DRM',
  'shelf.notFree': 'Non è un download gratuito',
  'shelf.download': 'Scarica',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Librerie vicino a te',
  'stores.useMyLocation': 'Usa la mia posizione',
  'stores.placeLabel': 'Città o codice postale',
  'stores.find': 'Cerca',
  'stores.locating': 'Ricerca…',
  'stores.failed': 'Posizione non disponibile. Scrivi invece una città o un codice postale.',
  'stores.none': 'Nessuna libreria mappata entro {radius} km.',
  'stores.distance': 'a {distance} km',
  'stores.stockUnknown':
    'Solo dati cartografici — nessuno pubblica cosa una libreria ha in magazzino.',
  'stores.lookupFailed': 'OpenStreetMap non è raggiungibile in questo momento. Riprova tra poco.',
  'stores.privacy':
    'La tua posizione è arrotondata a circa 100 m e inviata solo a OpenStreetMap, mai a questo sito.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Prezzi e librerie',
  'prices.loading': 'Sto chiedendo alle librerie…',
  'prices.unknown': 'Prezzo non pubblicato',
  'prices.degraded': 'Nessuna risposta da: {providers}',
  'prices.format.hardcover': 'Copertina rigida',
  'prices.format.paperback': 'Brossura',
  'prices.format.ebook': 'Ebook',
  'prices.format.audiobook': 'Audiolibro',
  'prices.format.unknown': 'Formato non indicato',
  'recommend.hideGenre': 'nascondi «{genre}»',
  'recommend.hiddenList': 'Generi nascosti (clicca per ripristinarne uno):',

  // --- Popup delle impostazioni ---
  'settings.status.saved': 'Salvato',
  'settings.status.cleared': 'Azzerato',
  'settings.status.unstored': 'Non salvato',
  'settings.status.failed': 'Invariato',
  'settings.notStored':
    'Questo browser ha rifiutato di salvare la modifica, quindi non è successo nulla: resta valido il valore precedente.',
  'settings.language.title': 'Lingua dell’interfaccia',
  'settings.language.changed':
    'Cambiata da {from} a {to}. L’interfaccia si ricarica in {to}; i titoli dei libri e i nomi degli autori restano nella loro lingua.',
  'settings.country.title': 'Paese di acquisto',
  'settings.country.changed':
    'Impostato su {country}. I link alle librerie ora includono negozi che consegnano lì, oltre a quelli internazionali.',
  'settings.country.cleared':
    'Nessun paese scelto. Verranno proposte solo librerie che spediscono in tutto il mondo.',
  'settings.bookLanguage.title': 'Lingua dei libri',
  'settings.bookLanguage.changed':
    'Impostata su {language}. Le pagine dei generi mostreranno per primi i libri con un’edizione in {language}, finché non azzeri il filtro.',
  'settings.bookLanguage.cleared':
    'Azzerata. Le pagine dei generi mostrano di nuovo libri in tutte le lingue.',
  'settings.hiddenGenres.title': 'Generi nascosti',
  'settings.hiddenGenres.hidden':
    '«{genre}» è nascosto. Non viene più inviato al server quando si chiedono i suggerimenti, e in totale i generi nascosti sono {count}.',
  'settings.hiddenGenres.restored':
    '«{genre}» è di nuovo tra i suggerimenti. Restano nascosti {count} generi.',
  'settings.history.title': 'Cronologia di lettura',
  'settings.history.cleared':
    'I libri che avevi aperto sono stati cancellati da questo browser. I suggerimenti torneranno solo quando aprirai un altro libro.',
  'settings.bookmarks.title': 'Libri salvati',
  'settings.bookmarks.added': '«{title}» è stato aggiunto ai tuoi libri salvati.',
  'settings.bookmarks.removed': '«{title}» è stato rimosso dai tuoi libri salvati.',
  'settings.bookmarks.failed':
    'Il server non ha accettato la modifica, quindi i tuoi libri salvati sono rimasti invariati.',
  'settings.catalogs.title': 'I tuoi cataloghi',
  'settings.catalogs.added':
    '«{name}» è stato aggiunto all’indirizzo {url}. L’indirizzo resta in questo browser e non viene mai inviato a questo sito.',
  'settings.catalogs.addedWithCredentials':
    '«{name}» è stato aggiunto all’indirizzo {url}, con il nome utente e la password che hai digitato. Tutto resta in questo browser e nulla viene inviato a questo sito.',
  'settings.catalogs.removed':
    '«{name}» è stato rimosso da questo browser, insieme alle credenziali salvate per esso.',
  'settings.catalogs.rejected': 'Non è stato aggiunto nulla: {reason}',
  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Estensioni',
  'addons.title': 'Estensioni',
  'addons.intro':
    'Un’estensione porta con sé le proprie fonti. La installi incollando il suo indirizzo; gira o sul tuo dispositivo, in un ambiente isolato, o sul server del suo autore. Golden Library non ne fornisce nessuna, non ne pubblica elenchi e non controlla ciò che restituiscono.',
  'addons.addressLabel': 'Indirizzo dell’estensione',
  'addons.addressHint': 'L’URL del manifesto che ti ha dato il suo autore.',
  'addons.continue': 'Continua',
  'addons.fromServer': 'Da un server',
  'addons.fromFile': 'Da un file, sul tuo dispositivo',
  'addons.bundleLabel': 'Indirizzo del codice dell’estensione',
  'addons.bundleHint':
    'L’URL del codice dell’estensione. Girerà su questo dispositivo, non su un server.',
  'addons.integrityLabel': 'Hash di integrità',
  'addons.integrityHint':
    'Lo fornisce l’autore, nella forma sha256-… . Obbligatorio: senza, il codice che hai approvato una volta potrebbe cambiare dopo senza che tu lo sappia.',
  'addons.checking': 'Lettura dell’estensione…',
  'addons.installedHeading': 'Installate',
  'addons.none': 'Ancora nessuna estensione. Tutto quello che vedi qui viene dall’istanza stessa.',
  'addons.priorityHint': 'L’ordine è la priorità: la prima estensione risponde per prima.',
  'addons.enable': 'Attiva',
  'addons.disable': 'Disattiva',
  'addons.off': 'Disattivata',
  'addons.remove': 'Rimuovi',
  'addons.moveUp': 'Su',
  'addons.moveDown': 'Giù',
  'addons.configure': 'Configura',
  'addons.failedToStart': '«{name}» non è partita: {reason}',
  'addons.consentTitle': 'Installare «{name}»?',
  'addons.consentHosts': 'Contatterà: {hosts}',
  'addons.consentNoHosts': 'Non ha chiesto di contattare nulla.',
  'addons.consentSeesYou':
    'Questa estensione gira sul server del suo autore. Vedrà il tuo indirizzo e tutto ciò che cerchi tramite essa.',
  'addons.consentSandboxed':
    'Questa estensione gira sul tuo dispositivo, isolata. Non può leggere i tuoi cookie, i dati di questo sito o nient’altro che tu abbia aperto.',
  'addons.consentNotVetted':
    'Golden Library non controlla ciò che un’estensione restituisce e non ha consigliato questa. Cosa installare è una tua scelta.',
  'addons.install': 'Installa',
  'addons.cancel': 'Annulla',
  'addons.via': 'via {name}',
  'addons.sourcesTitle': 'Dalle tue estensioni',
  'addons.searchTitle': 'Trovato dalle tue estensioni',
  'addons.showLinks': 'Mostra i link di download',
  'addons.unreadable': '{count} voci di questa estensione non erano leggibili.',
  'addons.browse': 'Sfoglia catalogo',
  'addons.browseTitle': 'Catalogo di «{name}»',
  'addons.browseNoCatalog': 'Questa estensione non offre un catalogo da sfogliare.',
  'addons.browseEmpty': 'Il catalogo di questa estensione è vuoto al momento.',
  'addons.browseFailed': 'Impossibile caricare il catalogo di «{name}»: {reason}',
  'addons.loadMore': 'Carica altri',
  'addons.notInstalled': 'Questa estensione non è installata.',

  'settings.addons.title': 'Le tue estensioni',
  'settings.addons.installed':
    '«{name}» è installata. Sarà interrogata insieme alle altre e potrà contattare {hosts}.',
  'settings.addons.removed':
    '«{name}» è stata rimossa. I suoi risultati sono spariti da questo browser, e con essi tutto ciò che vi aveva salvato.',
  'settings.addons.enabled': '«{name}» è di nuovo attiva e sarà interrogata con le altre.',
  'settings.addons.disabled':
    '«{name}» è disattivata. Resta installata con le sue impostazioni, ma nulla di ciò che restituisce verrà mostrato.',
  'settings.addons.reordered': '«{name}» ora risponde come {position} su {total}.',
  'settings.addons.rejected': 'Non è stato installato nulla: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Fonti personalizzate',
  'customSources.title': 'Fonti personalizzate',
  'customSources.intro':
    'Aggiungi un tuo negozio o catalogo dandogli un nome e un URL di ricerca con {isbn}, {query}, {title}, {author} o {language}. Il link viene creato su questo dispositivo e questo sito non lo recupera mai.',
  'customSources.nameLabel': 'Nome',
  'customSources.templateLabel': 'Modello di URL',
  'customSources.templateHint':
    'Un indirizzo https:// assoluto. {isbn}, {query}, {title}, {author} e {language} vengono compilati dall’edizione; se un segnaposto resta vuoto, il link viene omesso per quell’edizione.',
  'customSources.add': 'Aggiungi fonte',
  'customSources.listHeading': 'Le tue fonti',
  'customSources.none': 'Ancora nessuna fonte personalizzata.',
  'customSources.off': 'Disattivata',
  'customSources.enable': 'Attiva',
  'customSources.disable': 'Disattiva',
  'customSources.remove': 'Rimuovi',
  'customSources.heading': 'Le tue fonti',
  'customSources.caption':
    'Link che hai configurato tu stesso. Questa istanza non verifica dove portano.',

  'settings.customSources.title': 'Le tue fonti personalizzate',
  'settings.customSources.added': '«{name}» è stata aggiunta e sarà proposta insieme alle altre.',
  'settings.customSources.removed': '«{name}» è stata rimossa da questo browser.',
  'settings.customSources.enabled': '«{name}» è di nuovo attiva.',
  'settings.customSources.disabled':
    '«{name}» è disattivata. Resta configurata, ma il suo link non sarà mostrato.',
  'settings.customSources.rejected': 'Non è stato aggiunto nulla: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Libri nella tua lingua',
  'featured.inLanguageBlurb':
    'Libri scritti nella lingua in cui leggi questo sito, prima i più ristampati: è l’ordine di Open Library stessa, non una classifica di vendite.',
  'work.newSearch': 'Nuova ricerca',
  'work.descriptionFrom': 'Descrizione:',
  'work.descriptionNotLocalized':
    'Questa descrizione è nella lingua in cui l’ha scritta la fonte: nella tua, per questo libro, non ce n’è ancora una.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Leggi nel browser',
  'reader.privacy':
    'È il tuo browser ad aprire questo libro. Né il file, né la sua provenienza, né il punto in cui sei arrivato raggiungono questo sito.',
  'reader.chooseFile': 'Apri un libro da questo dispositivo',
  'reader.formats': 'EPUB, FB2, MOBI e CBZ.',
  'reader.loading': 'Apertura…',
  'reader.failed': 'Non è stato possibile aprire questo libro: {reason}',
  'reader.previous': 'Pagina precedente',
  'reader.next': 'Pagina successiva',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…oppure trascina un libro qui',
  'reader.fetching': 'Richiesta del file a {host}…',
  'reader.blockedTitle': '{host} non ha consegnato il file a questa pagina',
  'reader.blockedBody':
    'O è irraggiungibile, o non permette ad altri siti di leggere i suoi file. Questo sito non lo scaricherà al posto tuo: il tuo libro non passa mai da qui, ed è esattamente il senso di leggere qui.',
  'reader.blockedDownload': 'Scaricarlo da {host}',
  'reader.blockedOpenHere': 'e aprirlo qui dal tuo dispositivo',
  'reader.blockedAddon': 'Va bene anche un addon che serva il file da sé.',
  'reader.keepFile': 'Tieni questo libro in questo browser',
  'reader.keepFileHint':
    'Disattivato di default. Senza, il file sparisce chiudendo la scheda; con, resta solo su questo dispositivo.',
  'reader.library': 'Tenuti in questo browser',
  'reader.libraryEmpty':
    'Ancora nulla. I libri che tieni restano su questo dispositivo e non vengono mai caricati altrove.',
  'reader.libraryOpen': 'Apri',
  'reader.libraryRemove': 'Rimuovi',
  'reader.libraryFileKept': 'file tenuto',
  'reader.libraryFileGone': 'file non tenuto',
  'reader.untitled': 'Libro senza titolo',
  'settings.reader.title': 'Libri in questo browser',
  'settings.reader.kept':
    '«{title}» ora è tenuto su questo dispositivo e si apre senza riscaricarlo. Non viene caricato da nessuna parte.',
  'settings.reader.forgotten':
    'Il file di «{title}» è stato cancellato da questo browser. La voce resta: puoi riaprirlo dalla sua fonte.',
  'settings.reader.removed':
    '«{title}» è stato rimosso del tutto da questo browser — il file e la voce.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Aperto dove avevi lasciato — al {percent}%.',
  'reader.bookmarks': 'Segnalibri',
  'reader.bookmarkAdd': 'Metti un segnalibro qui',
  'reader.bookmarkNone': 'In questo libro non ci sono ancora segnalibri.',
  'reader.bookmarkGo': 'Vai',
  'reader.bookmarkRemove': 'Togli il segnalibro',
  'reader.bookmarkNote': 'Nota',
  'reader.bookmarkNotePlaceholder': 'Le tue parole su questa pagina',
  'reader.bookmarkAt': 'al {percent}%',
  'settings.reader.bookmarkTitle': 'Segnalibri in questo browser',
  'settings.reader.bookmarkAdded':
    'Segnalibro al {percent}% di «{title}». I segnalibri restano su questo dispositivo insieme al libro.',
  'settings.reader.bookmarkRemoved':
    'Quel segnalibro in «{title}» è stato tolto da questo browser.',
  'settings.reader.noteSaved':
    'La tua nota su questa pagina di «{title}» è stata salvata su questo dispositivo.',
  'settings.reader.positionTitle': 'Punto di lettura',
  'settings.reader.positionUnstored':
    'Questo browser non ha voluto salvare a che punto sei di «{title}»: la prossima volta il libro si aprirà dall’inizio. Succede in navigazione privata e con il disco pieno.',
};
