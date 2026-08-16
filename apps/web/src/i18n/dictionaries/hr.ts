import type { Dictionary } from '../dictionary';

export const hr: Dictionary = {
  'nav.savedBooks': 'Spremljene knjige',
  'nav.signIn': 'Prijava',
  'nav.signOut': 'Odjava',
  'nav.language': 'Jezik',
  'nav.skipToContent': 'Prijeđi na sadržaj',
  'footer.legal':
    'Isključivo legalni izvori: izravno preuzimanje samo za djela u javnom vlasništvu i s otvorenim licencijama; knjige zaštićene autorskim pravom — kupnja ili posudba u knjižnici. Uz svaku poveznicu stoji izričit status prava.',
  'footer.openSource': 'Otvoreni kod',
  'footer.openSourceRest': '— MIT licencija, može se pokrenuti kod sebe. Kod je na GitHubu.',
  'home.title': 'Golden Library',
  'home.subtitle': 'Otvoreni agregator prijevoda knjiga: jezici, izdanja i legalni izvori.',
  'home.searchLabel': 'Naslov i autor',
  'home.searchPlaceholder': 'Rat i mir Tolstoj',
  'home.searchButton': 'Traži',
  'search.searching': 'Tražimo…',
  'search.backfilling':
    'Ovdje još nema ničega — dohvaćamo knjigu iz izvora. To traje nekoliko sekundi.',
  'search.notFound': 'Za ovaj upit nije pronađeno ništa.',
  'search.retry': 'Pokušajte ponovno',
  'search.signInPrompt':
    'kako biste spremali knjige koje ovdje nađete i vraćali im se — i kako biste prije odabira usporedili izdanja iz različitih godina jedno uz drugo.',
  'featured.yearHeading': 'Knjige godine',
  'featured.yearBlurb':
    'Zapažene knjige iz svake od posljednjih godina. Ručno sastavljen popis, a ne ljestvica prodaje — takvu ne objavljuje nijedan otvoreni izvor.',
  'featured.popularHeading': 'Mnogo čitane, mnogo prevođene',
  'featured.popularBlurb':
    'Knjige koje postoje na mnogo jezika — upravo zbog toga ova stranica i postoji.',
  'featured.filling':
    'Neke od njih još dohvaćamo u pozadini. Osvježite stranicu za minutu da vidite ostale.',
  'featured.freeCopy': 'Besplatan primjerak',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Besplatno za čitanje odmah',
  'free.homeBlurb':
    'Knjige u javnom vlasništvu i s otvorenom licencijom koje vam ova kopija stranice može dati izravno.',
  'free.seeAll': 'Vidi više',
  'free.downloadable': 'Preuzmi',
  'free.pageTitle': 'Besplatne knjige',
  'free.pageBlurb':
    'Svaka knjiga ovdje ima barem jedan legalan besplatan primjerak — javno vlasništvo ili dar nositelja prava. Bez kupnje, bez članske iskaznice.',
  'free.empty':
    'Ovdje još nema ničega besplatnog. Besplatni primjerci pojavljuju se kako ova instanca dohvaća knjige, pa potražite neku i vratite se.',
  'free.emptyForLanguage':
    'Još nema besplatnih primjeraka na jeziku {language}. Uklonite filtar iznad da vidite cijelu policu.',
  'free.showMore': 'Prikaži više',
  'free.shown': 'Prikazano {shown} od {total}.',
  'free.allLanguages': 'Besplatni primjerci na svim jezicima.',
  'free.filteredByLanguage': 'Samo besplatni primjerci na jeziku {language}.',
  'free.filterByLanguage': 'Prikaži samo besplatne primjerke na jeziku {language}.',
  'free.dropLanguageFilter': 'prikaži sve jezike',
  'free.loadFailed': 'Besplatne knjige trenutačno nije bilo moguće učitati.',
  'work.original': 'izvornik',
  'work.dataSources': 'Izvori podataka',
  'work.about': 'O ovoj knjizi',
  'work.translatedInto': 'Prevedeno na',
  'work.availableIn': 'Dostupno na',
  'work.languagesNote':
    'Samo ono što navode izvori koje čitamo — prijevod koji ovdje nedostaje ipak može postojati.',
  'work.noTranslations': 'Prijevodi još nisu pronađeni.',
  'work.yourLanguage.title': 'Na vašem jeziku',
  'work.yourLanguage.yes': 'Prijevod na jezik {language} postoji.',
  'work.yourLanguage.original': 'Ova je knjiga napisana na jeziku {language}.',
  'work.yourLanguage.no': 'Među ovdje poznatim izdanjima nema prijevoda na {language}.',
  'work.yourLanguage.show': 'Prikaži izdanja na jeziku {language}',
  'work.editions': 'Izdanja ({shown} od {total})',
  'work.filterLanguage': 'Jezik',
  'work.filterAllLanguages': 'Svi jezici',
  'work.filterYear': 'Godina',
  'work.filterApply': 'Filtriraj',
  'work.filterReset': 'Poništi',
  'work.noEditionsMatch': 'Nijedno izdanje ne odgovara ovim filtrima.',
  'work.showMoreEditions': 'Prikaži još izdanja (preostalo {remaining})',
  'work.badgeFreeDownload': 'besplatno preuzimanje',
  'work.freeDownloadFormat': 'Preuzmi {format}',
  'work.freeDownloadNote': '{rights}. Besplatno od {provider} — bez računa, bez plaćanja.',
  'work.badgeReadBorrow': 'čitaj ili posudi',
  'work.badgeInBookstores': 'u knjižarama',
  'work.translatedBy': 'prijevod: {name}',
  'work.pages': '{count} str.',
  'bookmark.save': 'Spremi ovu knjigu',
  'bookmark.saved': 'Spremljeno',
  'bookmark.signInToSave': 'Prijavite se za spremanje',
  'bookmark.failed': 'Spremanje nije uspjelo. Pokušajte ponovno.',
  'links.show': 'Prikaži poveznice',
  'links.hide': 'Sakrij poveznice',
  'links.loading': 'Učitavanje poveznica',
  'links.none': 'Za ovo izdanje još nema legalnih poveznica.',
  'links.viaOtherEdition': 'besplatan primjerak iz izdanja {label}',
  'links.failed': 'Poveznice nije bilo moguće učitati.',
  'links.storesHeading': 'Pronađite u knjižari',
  'links.storesInCountry': 'U zemlji {country}',
  'links.storesYourCountry': 'vaša zemlja',
  'links.storesLanguageMarket': 'Gdje se prodaju knjige na jeziku {language}',
  'links.storesLanguageMarketGeneric': 'Gdje se prodaje jezik ovog izdanja',
  'links.storesWorldwide': 'Šalje u cijeli svijet',
  'links.storesCaption':
    'Svaka poveznica pretražuje vlastiti katalog te knjižare — dostupnost i cijenu prikazuje sama knjižara.',
  'linkType.download': 'Preuzmi',
  'linkType.buy': 'Kupi',
  'linkType.borrow': 'Posudi u knjižnici',
  'linkType.listen': 'Slušaj (audioknjiga)',
  'rights.public_domain': 'Javno vlasništvo',
  'rights.open_license': 'Otvorena licencija',
  'rights.copyrighted': 'Zaštićeno autorskim pravom',
  'rights.unknown': 'Status nepoznat',
  'compare.heading': 'Usporedi izdanja',
  'compare.blurb': 'Odaberite dva ili tri izdanja da vidite što ih zaista razlikuje.',
  'compare.selected': 'Odabrano {count} od najmanje 2.',
  'compare.editSelection': 'Promijeni izdanja',
  'compare.showAllEditions': 'Prikaži svih {count} izdanja',
  'compare.columnDifference': 'Razlika',
  'compare.identical': 'U svemu što izvori bilježe ova su izdanja istovjetna.',
  'compare.rowLanguage': 'Jezik',
  'compare.rowPublished': 'Objavljeno',
  'compare.rowPublisher': 'Nakladnik',
  'compare.rowTranslator': 'Prevoditelj',
  'compare.rowTranslatedFrom': 'Prevedeno s',
  'compare.rowBinding': 'Uvez',
  'compare.rowPages': 'Stranica',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Besplatan ili posudiv primjerak',
  'compare.yes': 'da ({count})',
  'compare.no': 'nije pronađeno',
  'country.label': 'Gdje kupujete knjige?',
  'country.worldwideOnly': 'Samo trgovine koje šalju u cijeli svijet',
  'auth.signInTitle': 'Prijava',
  'auth.registerTitle': 'Otvori račun',
  'auth.blurb':
    'Račun postoji iz jednog razloga: da spremate knjige koje nađete i vraćate im se — s jezicima na koje su prevedene, s izdanjima koja postoje i s time gdje svako od njih legalno nabaviti. Bez newslettera, bez profila, bez praćenja.',
  'auth.name': 'Ime (nije obavezno)',
  'auth.email': 'E-pošta',
  'auth.password': 'Lozinka',
  'auth.passwordHint':
    'Najmanje {min} znakova. Provjerava se samo duljina — duga rečenica koju pamtite bolja je od kratke pune interpunkcije.',
  'auth.submitSignIn': 'Prijavi se',
  'auth.submitRegister': 'Otvori račun',
  'auth.working': 'Radimo…',
  'auth.google': 'Nastavi s Googleom',
  'auth.toRegister': 'Još nemate račun? Otvorite ga',
  'auth.toSignIn': 'Već imate račun? Prijavite se',
  'auth.backToSearch': 'Natrag na pretraživanje',
  'auth.errorGoogleState':
    'Ta je poveznica za prijavu istekla ili je otvorena u drugom pregledniku. Pokušajte ponovno.',
  'auth.errorGoogleFailed':
    'Prijava putem Googlea nije dovršena. Umjesto toga možete koristiti e-poštu i lozinku.',
  'auth.errorGeneric': 'Nešto je pošlo po zlu.',
  'bookmarks.title': 'Spremljene knjige',
  'bookmarks.signedOut':
    'da zadržite knjige koje nađete — i da kasnije usporedite izdanja iste knjige jedno uz drugo.',
  'bookmarks.loading': 'Učitavanje…',
  'bookmarks.empty':
    'Još ništa nije spremljeno. Nađite knjigu i na njezinoj kartici upotrijebite „Spremi ovu knjigu”.',
  'bookmarks.searchLink': 'Traži',
  'bookmarks.remove': 'Ukloni',
  'bookmarks.loadFailed': 'Vaše spremljene knjige nije bilo moguće učitati.',
  'search.failed': 'Pretraživanje nije uspjelo.',
  'search.pending': 'Još nije u našoj bazi — provjeravamo izvore',
  'search.pendingLong':
    'Još tražimo: prvi upit za knjigu prikuplja podatke iz izvora, što može potrajati i nekoliko minuta',
  'search.notFoundHint': 'Ništa nije pronađeno. Pokušajte precizirati naslov ili autora.',
  'search.timedOut':
    'Izvori odgovaraju sporo i još nemamo podatke. Pozadinska sinkronizacija možda je već završila — pokušajte ponovno.',
  'search.freeOnlyToggle': 'Besplatno za preuzimanje',
  'search.noFreeResults':
    'Nijedna od njih još nema besplatno preuzimanje — pokušajte isključiti filtar.',
  'home.tagline': 'Pronađite svoj sljedeći magnum opus',
  'subject.allLanguages': 'Svi jezici.',
  'subject.filteredByLanguage': 'Samo knjige s izdanjem na jeziku {language}.',
  'subject.dropLanguageFilter': 'prikaži sve jezike',
  'subject.empty':
    'Pod ovom oznakom još nema ničega. Oznake dolaze iz knjiga koje je ova instanca već dohvatila.',
  'featured.year': '{year}',
  'nav.browse': 'Pregledaj po žanru',
  'recommend.heading': 'Prema onome što ste čitali',
  'recommend.becauseOf': 'Otvorili ste „{title}”, pa evo knjiga iz istih žanrova.',
  'recommend.blurb': 'Knjige iz žanrova koje otvarate.',
  'recommend.privacy':
    'To se izračunava u vašem pregledniku — poslužitelju se kažu žanrovi, nikad tko ste.',
  'recommend.forget': 'zaboravi moju povijest',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Polica',
  'shelf.title': 'Polica',
  'shelf.intro':
    'Otvoreni katalozi i bilo koji knjižnični poslužitelj koji sami održavate. Katalozi koje dodate ostaju u ovom pregledniku i nikad se ne šalju na ovu stranicu.',
  'shelf.openCatalogs': 'Otvoreni katalozi',
  'shelf.yourCatalogs': 'Vaši katalozi',
  'shelf.addCatalog': 'Dodaj katalog',
  'shelf.name': 'Naziv',
  'shelf.address': 'OPDS adresa',
  'shelf.username': 'Korisničko ime (nije obavezno)',
  'shelf.password': 'Lozinka (nije obavezna)',
  'shelf.credentialsNote':
    'Adresa i eventualni podaci za prijavu pohranjuju se samo u ovom pregledniku.',
  'shelf.add': 'Dodaj',
  'shelf.remove': 'Ukloni',
  'shelf.loading': 'Učitavanje kataloga…',
  'shelf.empty': 'Ovaj katalog nema unosa.',
  'shelf.noCatalogs':
    'Još nemate vlastitih. Dodajte ispod adresu Calibre-Weba, COPS-a, Kavite ili Audiobookshelfa.',
  'shelf.unreachable':
    'Vaš preglednik nije mogao pročitati ovaj katalog. Poslužitelj u vašoj mreži radit će; javne stranice često odbijaju zahtjeve s drugog izvora.',
  'shelf.nextPage': 'Sljedeća stranica',
  'shelf.previousPage': 'Prethodna stranica',
  'shelf.drm': 'Potrebna je aplikacija s DRM-om',
  'shelf.notFree': 'Nije besplatno preuzimanje',
  'shelf.download': 'Preuzmi',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Knjižare u blizini',
  'stores.useMyLocation': 'Upotrijebi moju lokaciju',
  'stores.placeLabel': 'Grad ili poštanski broj',
  'stores.find': 'Pronađi',
  'stores.locating': 'Tražimo…',
  'stores.failed': 'Lokacija nije dostupna. Upišite umjesto toga grad ili poštanski broj.',
  'stores.none': 'U krugu od {radius} km na karti nema nijedne knjižare.',
  'stores.distance': '{distance} km odavde',
  'stores.stockUnknown': 'Samo podaci s karte — nitko ne objavljuje što trgovina ima na zalihi.',
  'stores.lookupFailed': 'OpenStreetMap trenutačno nije bio dostupan. Pokušajte za koji trenutak.',
  'stores.privacy':
    'Vaša se lokacija zaokružuje na oko 100 m i šalje samo OpenStreetMapu — nikad ovoj stranici.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Cijene i trgovine',
  'prices.loading': 'Pitamo trgovine…',
  'prices.unknown': 'Cijena nije objavljena',
  'prices.degraded': 'Nema odgovora od: {providers}',
  'prices.format.hardcover': 'Tvrdi uvez',
  'prices.format.paperback': 'Meki uvez',
  'prices.format.ebook': 'E-knjiga',
  'prices.format.audiobook': 'Audioknjiga',
  'prices.format.unknown': 'Format nije naveden',
  'recommend.hideGenre': 'sakrij „{genre}”',
  'recommend.hiddenList': 'Skriveni žanrovi (kliknite da vratite jedan):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Spremljeno',
  'settings.status.cleared': 'Očišćeno',
  'settings.status.unstored': 'Nije pohranjeno',
  'settings.status.failed': 'Nepromijenjeno',
  'settings.notStored':
    'Ovaj je preglednik odbio pohraniti promjenu, pa se ništa nije dogodilo — i dalje vrijedi prijašnja vrijednost.',
  'settings.language.title': 'Jezik sučelja',
  'settings.language.changed':
    'Promijenjen s {from} na {to}. Sučelje se ponovno učitava na jeziku {to}; naslovi knjiga i imena autora ostaju na svojim jezicima.',
  'settings.country.title': 'Zemlja kupnje',
  'settings.country.changed':
    'Postavljeno na {country}. Poveznice na knjižare sada nude trgovine koje ondje dostavljaju, uz one svjetske.',
  'settings.country.cleared':
    'Nije odabrana zemlja. Nudit će se samo knjižare koje šalju u cijeli svijet.',
  'settings.bookLanguage.title': 'Jezik knjiga',
  'settings.bookLanguage.changed':
    'Postavljeno na {language}. Stranice žanrova prvo će prikazivati knjige s izdanjem na jeziku {language} dok ne poništite filtar.',
  'settings.bookLanguage.cleared':
    'Očišćeno. Stranice žanrova opet prikazuju knjige na svim jezicima.',
  'settings.hiddenGenres.title': 'Skriveni žanrovi',
  'settings.hiddenGenres.hidden':
    'Žanr „{genre}” je skriven. Više se ne šalje poslužitelju pri dohvaćanju prijedloga, a ukupno je skriveno {count} žanrova.',
  'settings.hiddenGenres.restored':
    'Žanr „{genre}” vratio se u vaše prijedloge. Skriveno je još {count} žanrova.',
  'settings.history.title': 'Povijest čitanja',
  'settings.history.cleared':
    'Knjige koje ste otvarali obrisane su iz ovog preglednika. Prijedlozi se neće pojavljivati dok ne otvorite novu knjigu.',
  'settings.bookmarks.title': 'Spremljene knjige',
  'settings.bookmarks.added': '„{title}” je dodana u vaše spremljene knjige.',
  'settings.bookmarks.removed': '„{title}” je uklonjena iz vaših spremljenih knjiga.',
  'settings.bookmarks.failed':
    'Poslužitelj nije prihvatio promjenu, pa su vaše spremljene knjige ostale kakve su bile.',
  'settings.catalogs.title': 'Vaši katalozi',
  'settings.catalogs.added':
    '„{name}” je dodan na {url}. Adresa ostaje u ovom pregledniku i nikad se ne šalje na ovu stranicu.',
  'settings.catalogs.addedWithCredentials':
    '„{name}” je dodan na {url}, s korisničkim imenom i lozinkom koje ste upisali. Sve ostaje u ovom pregledniku i ništa se od toga ne šalje na ovu stranicu.',
  'settings.catalogs.removed':
    '„{name}” je uklonjen iz ovog preglednika, zajedno sa svim podacima za prijavu koji su za njega bili pohranjeni.',
  'settings.catalogs.rejected': 'Ništa nije dodano: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Dodaci',
  'addons.title': 'Dodaci',
  'addons.intro':
    'Dodatak donosi vlastite izvore. Instalirate ga lijepljenjem njegove adrese; radi ili na vašem uređaju, u pješčaniku, ili na poslužitelju svojeg autora. Golden Library ne isporučuje nijedan, ne popisuje nijedan i ne provjerava što vraćaju.',
  'addons.addressLabel': 'Adresa dodatka',
  'addons.addressHint': 'URL manifesta koji vam je dao autor dodatka.',
  'addons.continue': 'Nastavi',
  'addons.fromServer': 'S poslužitelja',
  'addons.fromFile': 'Iz datoteke na vašem uređaju',
  'addons.bundleLabel': 'Adresa koda dodatka',
  'addons.bundleHint': 'URL koda dodatka. Izvodit će se na ovom uređaju, ne na poslužitelju.',
  'addons.integrityLabel': 'Sažetak integriteta',
  'addons.integrityHint':
    'Daje ga autor dodatka, u obliku sha256-… . Obavezan je: bez njega bi se kod koji ste jednom odobrili poslije mogao promijeniti, a vi to ne biste nikad saznali.',
  'addons.checking': 'Čitamo dodatak…',
  'addons.installedHeading': 'Instalirano',
  'addons.none': 'Još nema dodataka. Sve što je dosad na ovoj stranici dolazi od same instance.',
  'addons.priorityHint': 'Redoslijed je prioritet: prvi dodatak odgovara prvi.',
  'addons.enable': 'Uključi',
  'addons.disable': 'Isključi',
  'addons.off': 'Isključen',
  'addons.remove': 'Ukloni',
  'addons.moveUp': 'Pomakni gore',
  'addons.moveDown': 'Pomakni dolje',
  'addons.configure': 'Postavi',
  'addons.failedToStart': '„{name}” se nije pokrenuo: {reason}',
  'addons.consentTitle': 'Instalirati „{name}”?',
  'addons.consentHosts': 'Kontaktirat će: {hosts}',
  'addons.consentNoHosts': 'Nije zatražio kontakt ni s čim.',
  'addons.consentSeesYou':
    'Ovaj dodatak radi na poslužitelju svojeg autora. On će vidjeti vašu adresu i sve što kroz njega tražite.',
  'addons.consentSandboxed':
    'Ovaj dodatak radi na vašem uređaju, u pješčaniku. Ne može čitati vaše kolačiće, podatke ove stranice ni bilo što drugo što imate otvoreno.',
  'addons.consentNotVetted':
    'Golden Library ne provjerava što dodatak vraća i nije preporučila ovaj. Što instalirate, vaš je izbor.',
  'addons.install': 'Instaliraj',
  'addons.cancel': 'Odustani',
  'addons.via': 'preko {name}',
  'addons.sourcesTitle': 'Iz vaših dodataka',
  'addons.searchTitle': 'Pronašli vaši dodaci',
  'addons.showLinks': 'Prikaži poveznice za preuzimanje',
  'addons.unreadable': '{count} unosa iz ovog dodatka nije bilo moguće pročitati.',
  'addons.browse': 'Pregledaj katalog',
  'addons.browseTitle': 'Katalog dodatka {name}',
  'addons.browseNoCatalog': 'Ovaj dodatak ne nudi katalog za pregledavanje.',
  'addons.browseEmpty': 'Katalog ovog dodatka trenutačno je prazan.',
  'addons.browseFailed': 'Katalog dodatka „{name}” nije bilo moguće učitati: {reason}',
  'addons.loadMore': 'Učitaj još',
  'addons.notInstalled': 'Ovaj dodatak nije instaliran.',

  'settings.addons.title': 'Vaši dodaci',
  'settings.addons.installed':
    '„{name}” je instaliran. Pitat će se zajedno s ostalima i može kontaktirati {hosts}.',
  'settings.addons.removed':
    '„{name}” je uklonjen. Njegovi su rezultati nestali iz ovog preglednika, kao i sve što je ovdje pohranio.',
  'settings.addons.enabled': '„{name}” je ponovno uključen i pitat će se zajedno s ostalima.',
  'settings.addons.disabled':
    '„{name}” je isključen. Ostaje instaliran sa svojim postavkama, ali ništa od onoga što vraća neće se prikazivati.',
  'settings.addons.reordered': '„{name}” sada odgovara kao {position}. od {total}.',
  'settings.addons.rejected': 'Ništa nije instalirano: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Vlastiti izvori',
  'customSources.title': 'Vlastiti izvori',
  'customSources.intro':
    'Dodajte vlastitu trgovinu ili katalog tako da mu date naziv i URL pretraživanja s {isbn}, {query}, {title}, {author} ili {language} u sebi. Poveznica se gradi na ovom uređaju i ova je stranica nikad ne dohvaća.',
  'customSources.nameLabel': 'Naziv',
  'customSources.templateLabel': 'Predložak URL-a',
  'customSources.templateHint':
    'Apsolutna https:// adresa. {isbn}, {query}, {title}, {author} i {language} popunjavaju se iz izdanja; rezervirano mjesto koje ostane prazno znači da se poveznica za to izdanje preskače.',
  'customSources.add': 'Dodaj izvor',
  'customSources.listHeading': 'Vaši izvori',
  'customSources.none': 'Još nema vlastitih izvora.',
  'customSources.off': 'Isključen',
  'customSources.enable': 'Uključi',
  'customSources.disable': 'Isključi',
  'customSources.remove': 'Ukloni',
  'customSources.heading': 'Vaši izvori',
  'customSources.caption':
    'Poveznice koje ste sami postavili. Ova instanca ne provjerava kamo vode.',

  'settings.customSources.title': 'Vaši vlastiti izvori',
  'settings.customSources.added': '„{name}” je dodan i nudit će se zajedno s ostalima.',
  'settings.customSources.removed': '„{name}” je uklonjen iz ovog preglednika.',
  'settings.customSources.enabled': '„{name}” je ponovno uključen.',
  'settings.customSources.disabled':
    '„{name}” je isključen. Ostaje postavljen, ali njegova se poveznica neće prikazivati.',
  'settings.customSources.rejected': 'Ništa nije dodano: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Knjige na vašem jeziku',
  'featured.inLanguageBlurb':
    'Knjige napisane na jeziku na kojem čitate ovu stranicu, najizdavanije prve — to je poredak same Open Library, a ne ljestvica bestselera.',
  'work.newSearch': 'Novo pretraživanje',
  'work.descriptionFrom': 'Opis:',
  'work.descriptionNotLocalized':
    'Ovaj je opis na jeziku na kojem ga je napisao izvor — na vašem jeziku za ovu knjigu još ga nema.',
};
