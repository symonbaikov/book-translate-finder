import type { Dictionary } from '../dictionary';

export const bs: Dictionary = {
  'nav.savedBooks': 'Sačuvane knjige',
  'nav.signIn': 'Prijava',
  'nav.signOut': 'Odjava',
  'nav.language': 'Jezik',
  'nav.skipToContent': 'Pređi na sadržaj',
  'footer.legal':
    'Isključivo legalni izvori: direktno preuzimanje samo za djela u javnom vlasništvu i s otvorenim licencama; knjige zaštićene autorskim pravom — kupovina ili posudba u biblioteci. Uz svaki link jasno stoji status prava.',
  'footer.openSource': 'Otvoreni kod',
  'footer.openSourceRest': '— MIT licenca, može se pokrenuti kod sebe. Kod je na GitHubu.',
  'home.title': 'Golden Library',
  'home.subtitle': 'Otvoreni agregator prijevoda knjiga: jezici, izdanja i legalni izvori.',
  'home.searchLabel': 'Naslov i autor',
  'home.searchPlaceholder': 'Rat i mir Tolstoj',
  'home.searchButton': 'Traži',
  'search.searching': 'Tražimo…',
  'search.backfilling':
    'Ovdje još nema ničega — preuzimamo knjigu iz izvora. To traje nekoliko sekundi.',
  'search.notFound': 'Za ovaj upit nije pronađeno ništa.',
  'search.retry': 'Pokušajte ponovo',
  'search.signInPrompt':
    'da biste čuvali knjige koje ovdje nađete i vraćali im se — i da biste prije izbora uporedili izdanja iz različitih godina jedno pored drugog.',
  'featured.yearHeading': 'Knjige godine',
  'featured.yearBlurb':
    'Zapažene knjige iz svake od posljednjih godina. Ručno sastavljen spisak, a ne lista prodaje — takvu ne objavljuje nijedan otvoreni izvor.',
  'featured.popularHeading': 'Mnogo čitane, mnogo prevođene',
  'featured.popularBlurb':
    'Knjige koje postoje na mnogo jezika — upravo zbog toga ova stranica i postoji.',
  'featured.filling':
    'Neke od njih još preuzimamo u pozadini. Osvježite stranicu za minutu da vidite ostale.',
  'featured.freeCopy': 'Besplatan primjerak',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Besplatno za čitanje odmah',
  'free.homeBlurb':
    'Knjige u javnom vlasništvu i s otvorenom licencom koje vam ova kopija stranice može dati direktno.',
  'free.seeAll': 'Vidi više',
  'free.downloadable': 'Preuzmi',
  'free.pageTitle': 'Besplatne knjige',
  'free.pageBlurb':
    'Svaka knjiga ovdje ima barem jedan legalan besplatan primjerak — javno vlasništvo ili poklon nosioca prava. Bez kupovine, bez članske karte.',
  'free.empty':
    'Ovdje još nema ničega besplatnog. Besplatni primjerci pojavljuju se kako ova instanca preuzima knjige, pa potražite neku i vratite se.',
  'free.emptyForLanguage':
    'Još nema besplatnih primjeraka na jeziku {language}. Uklonite filter iznad da vidite cijelu policu.',
  'free.showMore': 'Prikaži više',
  'free.shown': 'Prikazano {shown} od {total}.',
  'free.allLanguages': 'Besplatni primjerci na svim jezicima.',
  'free.filteredByLanguage': 'Samo besplatni primjerci na jeziku {language}.',
  'free.filterByLanguage': 'Prikaži samo besplatne primjerke na jeziku {language}.',
  'free.dropLanguageFilter': 'prikaži sve jezike',
  'free.loadFailed': 'Besplatne knjige trenutno nije bilo moguće učitati.',
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
  'work.yourLanguage.original': 'Ova knjiga je napisana na jeziku {language}.',
  'work.yourLanguage.no': 'Među ovdje poznatim izdanjima nema prijevoda na {language}.',
  'work.yourLanguage.show': 'Prikaži izdanja na jeziku {language}',
  'work.editions': 'Izdanja ({shown} od {total})',
  'work.filterLanguage': 'Jezik',
  'work.filterAllLanguages': 'Svi jezici',
  'work.filterYear': 'Godina',
  'work.filterApply': 'Filtriraj',
  'work.filterReset': 'Poništi',
  'work.noEditionsMatch': 'Nijedno izdanje ne odgovara ovim filterima.',
  'work.showMoreEditions': 'Prikaži još izdanja (preostalo {remaining})',
  'work.badgeFreeDownload': 'besplatno preuzimanje',
  'work.freeDownloadFormat': 'Preuzmi {format}',
  'work.freeDownloadNote': '{rights}. Besplatno od {provider} — bez naloga, bez plaćanja.',
  'work.badgeReadBorrow': 'čitaj ili posudi',
  'work.badgeInBookstores': 'u knjižarama',
  'work.translatedBy': 'prijevod: {name}',
  'work.pages': '{count} str.',
  'bookmark.save': 'Sačuvaj ovu knjigu',
  'bookmark.saved': 'Sačuvano',
  'bookmark.signInToSave': 'Prijavite se da sačuvate',
  'bookmark.failed': 'Čuvanje nije uspjelo. Pokušajte ponovo.',
  'links.show': 'Prikaži linkove',
  'links.hide': 'Sakrij linkove',
  'links.loading': 'Učitavanje linkova',
  'links.none': 'Za ovo izdanje još nema legalnih linkova.',
  'links.viaOtherEdition': 'besplatan primjerak iz izdanja {label}',
  'links.failed': 'Linkove nije bilo moguće učitati.',
  'links.storesHeading': 'Pronađite u knjižari',
  'links.storesInCountry': 'U državi {country}',
  'links.storesYourCountry': 'vaša država',
  'links.storesLanguageMarket': 'Gdje se prodaju knjige na jeziku {language}',
  'links.storesLanguageMarketGeneric': 'Gdje se prodaje jezik ovog izdanja',
  'links.storesWorldwide': 'Šalje u cijeli svijet',
  'links.storesCaption':
    'Svaki link pretražuje vlastiti katalog te knjižare — dostupnost i cijenu prikazuje sama knjižara.',
  'linkType.download': 'Preuzmi',
  'linkType.buy': 'Kupi',
  'linkType.borrow': 'Posudi u biblioteci',
  'linkType.listen': 'Slušaj (audio-knjiga)',
  'rights.public_domain': 'Javno vlasništvo',
  'rights.open_license': 'Otvorena licenca',
  'rights.copyrighted': 'Zaštićeno autorskim pravom',
  'rights.unknown': 'Status nepoznat',
  'compare.heading': 'Uporedi izdanja',
  'compare.blurb': 'Odaberite dva ili tri izdanja da vidite šta ih zaista razlikuje.',
  'compare.selected': 'Odabrano {count} od najmanje 2.',
  'compare.editSelection': 'Promijeni izdanja',
  'compare.showAllEditions': 'Prikaži svih {count} izdanja',
  'compare.columnDifference': 'Razlika',
  'compare.identical': 'U svemu što izvori bilježe ova izdanja su istovjetna.',
  'compare.rowLanguage': 'Jezik',
  'compare.rowPublished': 'Objavljeno',
  'compare.rowPublisher': 'Izdavač',
  'compare.rowTranslator': 'Prevodilac',
  'compare.rowTranslatedFrom': 'Prevedeno sa',
  'compare.rowBinding': 'Povez',
  'compare.rowPages': 'Strana',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Besplatan ili posudiv primjerak',
  'compare.yes': 'da ({count})',
  'compare.no': 'nije pronađeno',
  'country.label': 'Gdje kupujete knjige?',
  'country.worldwideOnly': 'Samo prodavnice koje šalju u cijeli svijet',
  'auth.signInTitle': 'Prijava',
  'auth.registerTitle': 'Otvori račun',
  'auth.blurb':
    'Račun postoji iz jednog razloga: da čuvate knjige koje nađete i vraćate im se — s jezicima na koje su prevedene, s izdanjima koja postoje i s time gdje svako od njih legalno nabaviti. Bez newslettera, bez profila, bez praćenja.',
  'auth.name': 'Ime (nije obavezno)',
  'auth.email': 'E-pošta',
  'auth.password': 'Lozinka',
  'auth.passwordHint':
    'Najmanje {min} znakova. Provjerava se samo dužina — duga rečenica koju pamtite bolja je od kratke pune interpunkcije.',
  'auth.submitSignIn': 'Prijavi se',
  'auth.submitRegister': 'Otvori račun',
  'auth.working': 'Radimo…',
  'auth.google': 'Nastavi s Googleom',
  'auth.toRegister': 'Još nemate račun? Otvorite ga',
  'auth.toSignIn': 'Već imate račun? Prijavite se',
  'auth.backToSearch': 'Nazad na pretragu',
  'auth.errorGoogleState':
    'Taj link za prijavu je istekao ili je otvoren u drugom pregledniku. Pokušajte ponovo.',
  'auth.errorGoogleFailed':
    'Prijava putem Googlea nije dovršena. Umjesto toga možete koristiti e-poštu i lozinku.',
  'auth.errorGeneric': 'Nešto je pošlo po zlu.',
  'bookmarks.title': 'Sačuvane knjige',
  'bookmarks.signedOut':
    'da zadržite knjige koje nađete — i da kasnije uporedite izdanja iste knjige jedno pored drugog.',
  'bookmarks.loading': 'Učitavanje…',
  'bookmarks.empty':
    'Još ništa nije sačuvano. Nađite knjigu i na njenoj kartici upotrijebite „Sačuvaj ovu knjigu”.',
  'bookmarks.searchLink': 'Traži',
  'bookmarks.remove': 'Ukloni',
  'bookmarks.loadFailed': 'Vaše sačuvane knjige nije bilo moguće učitati.',
  'search.failed': 'Pretraga nije uspjela.',
  'search.pending': 'Još nije u našoj bazi — provjeravamo izvore',
  'search.pendingLong':
    'Još tražimo: prvi upit za knjigu prikuplja podatke iz izvora, što može potrajati i nekoliko minuta',
  'search.notFoundHint': 'Ništa nije pronađeno. Pokušajte precizirati naslov ili autora.',
  'search.timedOut':
    'Izvori odgovaraju sporo i još nemamo podatke. Pozadinska sinhronizacija je možda već završila — pokušajte ponovo.',
  'search.freeOnlyToggle': 'Besplatno za preuzimanje',
  'search.noFreeResults':
    'Nijedna od njih još nema besplatno preuzimanje — pokušajte isključiti filter.',
  'home.tagline': 'Pronađite svoj sljedeći magnum opus',
  'subject.allLanguages': 'Svi jezici.',
  'subject.filteredByLanguage': 'Samo knjige s izdanjem na jeziku {language}.',
  'subject.dropLanguageFilter': 'prikaži sve jezike',
  'subject.empty':
    'Pod ovom oznakom još nema ničega. Oznake dolaze iz knjiga koje je ova instanca već preuzela.',
  'featured.year': '{year}',
  'nav.browse': 'Pregledaj po žanru',
  'recommend.heading': 'Prema onome što ste čitali',
  'recommend.becauseOf': 'Otvorili ste „{title}”, pa evo knjiga iz istih žanrova.',
  'recommend.blurb': 'Knjige iz žanrova koje otvarate.',
  'recommend.privacy':
    'To se izračunava u vašem pregledniku — serveru se kažu žanrovi, nikad ko ste.',
  'recommend.forget': 'zaboravi moju historiju',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Polica',
  'shelf.title': 'Polica',
  'shelf.intro':
    'Otvoreni katalozi i bilo koji bibliotečki server koji sami održavate. Katalozi koje dodate ostaju u ovom pregledniku i nikad se ne šalju na ovu stranicu.',
  'shelf.openCatalogs': 'Otvoreni katalozi',
  'shelf.yourCatalogs': 'Vaši katalozi',
  'shelf.addCatalog': 'Dodaj katalog',
  'shelf.name': 'Naziv',
  'shelf.address': 'OPDS adresa',
  'shelf.username': 'Korisničko ime (nije obavezno)',
  'shelf.password': 'Lozinka (nije obavezna)',
  'shelf.credentialsNote':
    'Adresa i eventualni podaci za prijavu čuvaju se samo u ovom pregledniku.',
  'shelf.add': 'Dodaj',
  'shelf.remove': 'Ukloni',
  'shelf.loading': 'Učitavanje kataloga…',
  'shelf.empty': 'Ovaj katalog nema stavki.',
  'shelf.noCatalogs':
    'Još nemate vlastitih. Dodajte ispod adresu Calibre-Weba, COPS-a, Kavite ili Audiobookshelfa.',
  'shelf.unreachable':
    'Vaš preglednik nije mogao pročitati ovaj katalog. Server u vašoj mreži će raditi; javne stranice često odbijaju zahtjeve s drugog izvora.',
  'shelf.nextPage': 'Sljedeća stranica',
  'shelf.previousPage': 'Prethodna stranica',
  'shelf.drm': 'Potrebna je aplikacija s DRM-om',
  'shelf.notFree': 'Nije besplatno preuzimanje',
  'shelf.download': 'Preuzmi',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Knjižare u blizini',
  'stores.useMyLocation': 'Koristi moju lokaciju',
  'stores.placeLabel': 'Grad ili poštanski broj',
  'stores.find': 'Pronađi',
  'stores.locating': 'Tražimo…',
  'stores.failed': 'Lokacija nije dostupna. Umjesto toga upišite grad ili poštanski broj.',
  'stores.none': 'U krugu od {radius} km na mapi nema nijedne knjižare.',
  'stores.distance': '{distance} km odavde',
  'stores.stockUnknown': 'Samo podaci s mape — niko ne objavljuje šta prodavnica ima na zalihama.',
  'stores.lookupFailed': 'OpenStreetMap trenutno nije bio dostupan. Pokušajte za koji trenutak.',
  'stores.privacy':
    'Vaša lokacija se zaokružuje na oko 100 m i šalje samo OpenStreetMapu — nikad ovoj stranici.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Cijene i prodavnice',
  'prices.loading': 'Pitamo prodavnice…',
  'prices.unknown': 'Cijena nije objavljena',
  'prices.degraded': 'Nema odgovora od: {providers}',
  'prices.format.hardcover': 'Tvrdi povez',
  'prices.format.paperback': 'Meki povez',
  'prices.format.ebook': 'E-knjiga',
  'prices.format.audiobook': 'Audio-knjiga',
  'prices.format.unknown': 'Format nije naveden',
  'recommend.hideGenre': 'sakrij „{genre}”',
  'recommend.hiddenList': 'Sakriveni žanrovi (kliknite da vratite neki):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Sačuvano',
  'settings.status.cleared': 'Očišćeno',
  'settings.status.unstored': 'Nije sačuvano',
  'settings.status.failed': 'Nepromijenjeno',
  'settings.notStored':
    'Ovaj preglednik je odbio sačuvati promjenu, pa se ništa nije dogodilo — i dalje vrijedi prethodna vrijednost.',
  'settings.language.title': 'Jezik sučelja',
  'settings.language.changed':
    'Promijenjen s {from} na {to}. Sučelje se ponovo učitava na jeziku {to}; naslovi knjiga i imena autora ostaju na svojim jezicima.',
  'settings.country.title': 'Država kupovine',
  'settings.country.changed':
    'Postavljeno na {country}. Linkovi ka knjižarama sada nude prodavnice koje tamo dostavljaju, uz one svjetske.',
  'settings.country.cleared':
    'Država nije odabrana. Nudit će se samo knjižare koje šalju u cijeli svijet.',
  'settings.bookLanguage.title': 'Jezik knjiga',
  'settings.bookLanguage.changed':
    'Postavljeno na {language}. Stranice žanrova će prvo prikazivati knjige s izdanjem na jeziku {language} dok ne poništite filter.',
  'settings.bookLanguage.cleared':
    'Očišćeno. Stranice žanrova opet prikazuju knjige na svim jezicima.',
  'settings.hiddenGenres.title': 'Sakriveni žanrovi',
  'settings.hiddenGenres.hidden':
    'Žanr „{genre}” je sakriven. Više se ne šalje serveru pri učitavanju prijedloga, a ukupno je sakriveno {count} žanrova.',
  'settings.hiddenGenres.restored':
    'Žanr „{genre}” se vratio u vaše prijedloge. Sakriveno ostaje {count} žanrova.',
  'settings.history.title': 'Historija čitanja',
  'settings.history.cleared':
    'Knjige koje ste otvarali obrisane su iz ovog preglednika. Prijedlozi se neće pojavljivati dok ne otvorite novu knjigu.',
  'settings.bookmarks.title': 'Sačuvane knjige',
  'settings.bookmarks.added': '„{title}” je dodana u vaše sačuvane knjige.',
  'settings.bookmarks.removed': '„{title}” je uklonjena iz vaših sačuvanih knjiga.',
  'settings.bookmarks.failed':
    'Server nije prihvatio promjenu, pa su vaše sačuvane knjige ostale kakve su bile.',
  'settings.catalogs.title': 'Vaši katalozi',
  'settings.catalogs.added':
    '„{name}” je dodan na {url}. Adresa ostaje u ovom pregledniku i nikad se ne šalje na ovu stranicu.',
  'settings.catalogs.addedWithCredentials':
    '„{name}” je dodan na {url}, s korisničkim imenom i lozinkom koje ste upisali. Sve ostaje u ovom pregledniku i ništa od toga se ne šalje na ovu stranicu.',
  'settings.catalogs.removed':
    '„{name}” je uklonjen iz ovog preglednika, zajedno sa svim podacima za prijavu koji su za njega bili sačuvani.',
  'settings.catalogs.rejected': 'Ništa nije dodano: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Dodaci',
  'addons.title': 'Dodaci',
  'addons.intro':
    'Dodatak donosi vlastite izvore. Instalirate ga lijepljenjem njegove adrese; radi ili na vašem uređaju, u pješčaniku, ili na serveru svog autora. Golden Library ne isporučuje nijedan, ne navodi nijedan i ne provjerava šta vraćaju.',
  'addons.addressLabel': 'Adresa dodatka',
  'addons.addressHint': 'URL manifesta koji vam je dao autor dodatka.',
  'addons.continue': 'Nastavi',
  'addons.fromServer': 'Sa servera',
  'addons.fromFile': 'Iz datoteke na vašem uređaju',
  'addons.bundleLabel': 'Adresa koda dodatka',
  'addons.bundleHint': 'URL koda dodatka. Izvršavat će se na ovom uređaju, ne na serveru.',
  'addons.integrityLabel': 'Sažetak integriteta',
  'addons.integrityHint':
    'Daje ga autor dodatka, u obliku sha256-… . Obavezan je: bez njega bi se kod koji ste jednom odobrili kasnije mogao promijeniti, a vi to nikad ne biste saznali.',
  'addons.checking': 'Čitamo dodatak…',
  'addons.installedHeading': 'Instalirano',
  'addons.none': 'Još nema dodataka. Sve što je dosad na ovoj stranici dolazi od same instance.',
  'addons.priorityHint': 'Redoslijed je prioritet: prvi dodatak odgovara prvi.',
  'addons.enable': 'Uključi',
  'addons.disable': 'Isključi',
  'addons.off': 'Isključen',
  'addons.remove': 'Ukloni',
  'addons.moveUp': 'Pomjeri gore',
  'addons.moveDown': 'Pomjeri dolje',
  'addons.configure': 'Podesi',
  'addons.failedToStart': '„{name}” se nije pokrenuo: {reason}',
  'addons.consentTitle': 'Instalirati „{name}”?',
  'addons.consentHosts': 'Kontaktirat će: {hosts}',
  'addons.consentNoHosts': 'Nije zatražio kontakt ni s čim.',
  'addons.consentSeesYou':
    'Ovaj dodatak radi na serveru svog autora. On će vidjeti vašu adresu i sve što kroz njega tražite.',
  'addons.consentSandboxed':
    'Ovaj dodatak radi na vašem uređaju, u pješčaniku. Ne može čitati vaše kolačiće, podatke ove stranice ni bilo šta drugo što imate otvoreno.',
  'addons.consentNotVetted':
    'Golden Library ne provjerava šta dodatak vraća i nije preporučila ovaj. Šta instalirate, vaš je izbor.',
  'addons.install': 'Instaliraj',
  'addons.cancel': 'Odustani',
  'addons.via': 'preko {name}',
  'addons.sourcesTitle': 'Iz vaših dodataka',
  'addons.searchTitle': 'Pronašli vaši dodaci',
  'addons.showLinks': 'Prikaži linkove za preuzimanje',
  'addons.unreadable': '{count} stavki iz ovog dodatka nije bilo moguće pročitati.',
  'addons.browse': 'Pregledaj katalog',
  'addons.browseTitle': 'Katalog dodatka {name}',
  'addons.browseNoCatalog': 'Ovaj dodatak ne nudi katalog za pregledanje.',
  'addons.browseEmpty': 'Katalog ovog dodatka je trenutno prazan.',
  'addons.browseFailed': 'Katalog dodatka „{name}” nije bilo moguće učitati: {reason}',
  'addons.loadMore': 'Učitaj još',
  'addons.notInstalled': 'Ovaj dodatak nije instaliran.',

  'settings.addons.title': 'Vaši dodaci',
  'settings.addons.installed':
    '„{name}” je instaliran. Pitat će se zajedno s ostalima i može kontaktirati {hosts}.',
  'settings.addons.removed':
    '„{name}” je uklonjen. Njegovi rezultati su nestali iz ovog preglednika, kao i sve što je ovdje sačuvao.',
  'settings.addons.enabled': '„{name}” je ponovo uključen i pitat će se zajedno s ostalima.',
  'settings.addons.disabled':
    '„{name}” je isključen. Ostaje instaliran sa svojim postavkama, ali ništa od onoga što vraća neće biti prikazano.',
  'settings.addons.reordered': '„{name}” sada odgovara kao {position}. od {total}.',
  'settings.addons.rejected': 'Ništa nije instalirano: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Vlastiti izvori',
  'customSources.title': 'Vlastiti izvori',
  'customSources.intro':
    'Dodajte vlastitu prodavnicu ili katalog tako što ćete joj dati naziv i URL pretrage s {isbn}, {query}, {title}, {author} ili {language} u sebi. Link se gradi na ovom uređaju i ova stranica ga nikad ne poziva.',
  'customSources.nameLabel': 'Naziv',
  'customSources.templateLabel': 'Predložak URL-a',
  'customSources.templateHint':
    'Apsolutna https:// adresa. {isbn}, {query}, {title}, {author} i {language} popunjavaju se iz izdanja; rezervirano mjesto koje ostane prazno znači da se link za to izdanje preskače.',
  'customSources.add': 'Dodaj izvor',
  'customSources.listHeading': 'Vaši izvori',
  'customSources.none': 'Još nema vlastitih izvora.',
  'customSources.off': 'Isključen',
  'customSources.enable': 'Uključi',
  'customSources.disable': 'Isključi',
  'customSources.remove': 'Ukloni',
  'customSources.heading': 'Vaši izvori',
  'customSources.caption': 'Linkovi koje ste sami podesili. Ova instanca ne provjerava kuda vode.',

  'settings.customSources.title': 'Vaši vlastiti izvori',
  'settings.customSources.added': '„{name}” je dodan i nudit će se zajedno s ostalima.',
  'settings.customSources.removed': '„{name}” je uklonjen iz ovog preglednika.',
  'settings.customSources.enabled': '„{name}” je ponovo uključen.',
  'settings.customSources.disabled':
    '„{name}” je isključen. Ostaje podešen, ali njegov link neće biti prikazan.',
  'settings.customSources.rejected': 'Ništa nije dodano: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Knjige na vašem jeziku',
  'featured.inLanguageBlurb':
    'Knjige napisane na jeziku na kojem čitate ovu stranicu, najizdavanije prve — to je poredak same Open Library, a ne lista bestselera.',
  'work.newSearch': 'Nova pretraga',
  'work.descriptionFrom': 'Opis:',
  'work.descriptionNotLocalized':
    'Ovaj opis je na jeziku na kojem ga je napisao izvor — na vašem jeziku za ovu knjigu ga još nema.',
};
