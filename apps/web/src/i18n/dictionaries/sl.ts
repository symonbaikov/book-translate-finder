import type { Dictionary } from '../dictionary';

export const sl: Dictionary = {
  'nav.savedBooks': 'Shranjene knjige',
  'nav.signIn': 'Prijava',
  'nav.signOut': 'Odjava',
  'nav.language': 'Jezik',
  'nav.skipToContent': 'Skoči na vsebino',
  'footer.legal':
    'Izključno zakoniti viri: neposreden prenos samo za dela v javni domeni in z odprtimi licencami; avtorsko zaščitene knjige — nakup ali izposoja v knjižnici. Pri vsaki povezavi je izrecno naveden status pravic.',
  'footer.openSource': 'Odprta koda',
  'footer.openSourceRest': '— licenca MIT, mogoče gostiti pri sebi. Koda je na GitHubu.',
  'home.title': 'Golden Library',
  'home.subtitle': 'Odprt agregator knjižnih prevodov: jeziki, izdaje in zakoniti viri.',
  'home.searchLabel': 'Naslov in avtor',
  'home.searchPlaceholder': 'Vojna in mir Tolstoj',
  'home.searchButton': 'Išči',
  'search.searching': 'Iščemo…',
  'search.backfilling': 'Tukaj še ni ničesar — knjigo pridobivamo iz virov. To traja nekaj sekund.',
  'search.notFound': 'Za to poizvedbo ni bilo najdeno nič.',
  'search.retry': 'Poskusite znova',
  'search.signInPrompt':
    'da boste shranjevali knjige, ki jih najdete tukaj, in se k njim vračali — ter da boste pred izbiro drugo ob drugi primerjali izdaje iz različnih let.',
  'featured.yearHeading': 'Knjige leta',
  'featured.yearBlurb':
    'Opazne knjige iz vsakega od zadnjih let. Ročno sestavljen seznam, ne prodajna lestvica — te ne objavlja noben odprt vir.',
  'featured.popularHeading': 'Veliko brane, veliko prevajane',
  'featured.popularBlurb': 'Knjige, ki obstajajo v mnogih jezikih — prav zato je to spletišče tu.',
  'featured.filling':
    'Nekaj jih še pridobivamo v ozadju. Čez minuto osvežite stran, da vidite ostale.',
  'featured.freeCopy': 'Brezplačen izvod',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Brezplačno za branje takoj',
  'free.homeBlurb':
    'Knjige v javni domeni in z odprto licenco, ki vam jih ta kopija spletišča lahko izroči neposredno.',
  'free.seeAll': 'Poglejte več',
  'free.downloadable': 'Prenesi',
  'free.pageTitle': 'Brezplačne knjige',
  'free.pageBlurb':
    'Vsaka knjiga tukaj ima vsaj en zakonit brezplačen izvod — javna domena ali darilo imetnika pravic. Brez nakupa, brez članske izkaznice.',
  'free.empty':
    'Tukaj še ni ničesar brezplačnega. Brezplačni izvodi se pojavljajo, ko ta instanca pridobiva knjige, zato poiščite kakšno in se vrnite.',
  'free.emptyForLanguage':
    'V jeziku {language} še ni brezplačnih izvodov. Odstranite filter zgoraj, da vidite celotno polico.',
  'free.showMore': 'Pokaži več',
  'free.shown': 'Prikazanih {shown} od {total}.',
  'free.allLanguages': 'Brezplačni izvodi v vseh jezikih.',
  'free.filteredByLanguage': 'Samo brezplačni izvodi v jeziku {language}.',
  'free.filterByLanguage': 'Pokaži samo brezplačne izvode v jeziku {language}.',
  'free.dropLanguageFilter': 'pokaži vse jezike',
  'free.loadFailed': 'Brezplačnih knjig trenutno ni bilo mogoče naložiti.',
  'work.original': 'izvirnik',
  'work.dataSources': 'Viri podatkov',
  'work.about': 'O tej knjigi',
  'work.translatedInto': 'Prevedeno v',
  'work.availableIn': 'Na voljo v',
  'work.languagesNote':
    'Samo to, kar navajajo viri, ki jih beremo — prevod, ki tu manjka, morda vseeno obstaja.',
  'work.noTranslations': 'Prevodov še ni bilo najdenih.',
  'work.yourLanguage.title': 'V vašem jeziku',
  'work.yourLanguage.yes': 'Prevod v jezik {language} obstaja.',
  'work.yourLanguage.original': 'Ta knjiga je bila napisana v jeziku {language}.',
  'work.yourLanguage.no': 'Med tu znanimi izdajami ni prevoda v jezik {language}.',
  'work.yourLanguage.show': 'Pokaži izdaje v jeziku {language}',
  'work.editions': 'Izdaje ({shown} od {total})',
  'work.filterLanguage': 'Jezik',
  'work.filterAllLanguages': 'Vsi jeziki',
  'work.filterYear': 'Leto',
  'work.filterApply': 'Filtriraj',
  'work.filterReset': 'Ponastavi',
  'work.noEditionsMatch': 'Tem filtrom ne ustreza nobena izdaja.',
  'work.showMoreEditions': 'Pokaži več izdaj (ostalo {remaining})',
  'work.badgeFreeDownload': 'brezplačen prenos',
  'work.freeDownloadFormat': 'Prenesi {format}',
  'work.freeDownloadNote': '{rights}. Brezplačno pri {provider} — brez računa, brez plačila.',
  'work.badgeReadBorrow': 'beri ali si izposodi',
  'work.badgeInBookstores': 'v knjigarnah',
  'work.translatedBy': 'prevod: {name}',
  'work.pages': '{count} str.',
  'bookmark.save': 'Shrani to knjigo',
  'bookmark.saved': 'Shranjeno',
  'bookmark.signInToSave': 'Prijavite se za shranjevanje',
  'bookmark.failed': 'Shranjevanje ni uspelo. Poskusite znova.',
  'links.show': 'Pokaži povezave',
  'links.hide': 'Skrij povezave',
  'links.loading': 'Nalaganje povezav',
  'links.none': 'Za to izdajo še ni zakonitih povezav.',
  'links.viaOtherEdition': 'brezplačen izvod iz izdaje {label}',
  'links.failed': 'Povezav ni bilo mogoče naložiti.',
  'links.storesHeading': 'Poiščite v knjigarni',
  'links.storesInCountry': 'V državi {country}',
  'links.storesYourCountry': 'vaša država',
  'links.storesLanguageMarket': 'Kjer prodajajo knjige v jeziku {language}',
  'links.storesLanguageMarketGeneric': 'Kjer prodajajo jezik te izdaje',
  'links.storesWorldwide': 'Pošilja po vsem svetu',
  'links.storesCaption':
    'Vsaka povezava išče po katalogu same trgovine — razpoložljivost in ceno prikaže trgovina sama.',
  'linkType.download': 'Prenesi',
  'linkType.buy': 'Kupi',
  'linkType.borrow': 'Izposodi si v knjižnici',
  'linkType.listen': 'Poslušaj (zvočna knjiga)',
  'rights.public_domain': 'Javna domena',
  'rights.open_license': 'Odprta licenca',
  'rights.copyrighted': 'Avtorsko zaščiteno',
  'rights.unknown': 'Status neznan',
  'compare.heading': 'Primerjaj izdaje',
  'compare.blurb': 'Izberite dve ali tri izdaje, da vidite, v čem se v resnici razlikujejo.',
  'compare.selected': 'Izbranih {count} od vsaj 2.',
  'compare.editSelection': 'Spremeni izdaje',
  'compare.showAllEditions': 'Pokaži vseh {count} izdaj',
  'compare.columnDifference': 'Razlika',
  'compare.identical': 'V vsem, kar viri beležijo, so te izdaje enake.',
  'compare.rowLanguage': 'Jezik',
  'compare.rowPublished': 'Izdano',
  'compare.rowPublisher': 'Založba',
  'compare.rowTranslator': 'Prevajalec',
  'compare.rowTranslatedFrom': 'Prevedeno iz',
  'compare.rowBinding': 'Vezava',
  'compare.rowPages': 'Strani',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Brezplačen ali izposojljiv izvod',
  'compare.yes': 'da ({count})',
  'compare.no': 'ni najdeno',
  'country.label': 'Kje kupujete knjige?',
  'country.worldwideOnly': 'Samo trgovine, ki pošiljajo po vsem svetu',
  'auth.signInTitle': 'Prijava',
  'auth.registerTitle': 'Ustvari račun',
  'auth.blurb':
    'Račun obstaja iz enega razloga: da shranjujete knjige, ki jih najdete, in se k njim vračate — z jeziki, v katere so prevedene, z izdajami, ki obstajajo, in s tem, kje vsako od njih zakonito dobiti. Brez novičnika, brez profila, brez sledenja.',
  'auth.name': 'Ime (neobvezno)',
  'auth.email': 'E-pošta',
  'auth.password': 'Geslo',
  'auth.passwordHint':
    'Vsaj {min} znakov. Preverja se samo dolžina — dolga poved, ki si jo zapomnite, je boljša od kratke s samimi ločili.',
  'auth.submitSignIn': 'Prijavi se',
  'auth.submitRegister': 'Ustvari račun',
  'auth.working': 'Delamo…',
  'auth.google': 'Nadaljuj z Googlom',
  'auth.toRegister': 'Še nimate računa? Ustvarite ga',
  'auth.toSignIn': 'Račun že imate? Prijavite se',
  'auth.backToSearch': 'Nazaj na iskanje',
  'auth.errorGoogleState':
    'Ta prijavna povezava je potekla ali pa je bila odprta v drugem brskalniku. Poskusite znova.',
  'auth.errorGoogleFailed':
    'Prijava z Googlom ni bila dokončana. Namesto tega lahko uporabite e-pošto in geslo.',
  'auth.errorGeneric': 'Nekaj je šlo narobe.',
  'bookmarks.title': 'Shranjene knjige',
  'bookmarks.signedOut':
    'da obdržite knjige, ki jih najdete — in da pozneje drugo ob drugi primerjate izdaje iste knjige.',
  'bookmarks.loading': 'Nalaganje…',
  'bookmarks.empty':
    'Ničesar še niste shranili. Poiščite knjigo in na njeni kartici uporabite »Shrani to knjigo«.',
  'bookmarks.searchLink': 'Išči',
  'bookmarks.remove': 'Odstrani',
  'bookmarks.loadFailed': 'Vaših shranjenih knjig ni bilo mogoče naložiti.',
  'search.failed': 'Iskanje ni uspelo.',
  'search.pending': 'Še ni v naši zbirki — preverjamo vire',
  'search.pendingLong':
    'Še iščemo: prva poizvedba za knjigo zbira podatke iz virov, kar lahko traja tudi nekaj minut',
  'search.notFoundHint': 'Nič ni bilo najdeno. Poskusite natančneje navesti naslov ali avtorja.',
  'search.timedOut':
    'Viri odgovarjajo počasi in podatkov še nimamo. Sinhronizacija v ozadju se je morda že končala — poskusite znova.',
  'search.freeOnlyToggle': 'Brezplačno za prenos',
  'search.noFreeResults':
    'Nobena od njih še nima brezplačnega prenosa — poskusite izklopiti filter.',
  'home.tagline': 'Najdite svoj naslednji magnum opus',
  'subject.allLanguages': 'Vsi jeziki.',
  'subject.filteredByLanguage': 'Samo knjige z izdajo v jeziku {language}.',
  'subject.dropLanguageFilter': 'pokaži vse jezike',
  'subject.empty':
    'Pod to oznako še ni ničesar. Oznake prihajajo iz knjig, ki jih je ta instanca že pridobila.',
  'featured.year': '{year}',
  'nav.browse': 'Brskaj po žanru',
  'recommend.heading': 'Glede na to, kar ste brali',
  'recommend.becauseOf': 'Odprli ste »{title}«, zato tu so knjige iz istih žanrov.',
  'recommend.blurb': 'Knjige iz žanrov, ki jih odpirate.',
  'recommend.privacy':
    'To se izračuna v vašem brskalniku — strežniku povemo žanre, nikoli tega, kdo ste.',
  'recommend.forget': 'pozabi mojo zgodovino',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Polica',
  'shelf.title': 'Polica',
  'shelf.intro':
    'Odprti katalogi in kateri koli knjižnični strežnik, ki ga poganjate sami. Katalogi, ki jih dodate, ostanejo v tem brskalniku in nikoli niso poslani na to spletišče.',
  'shelf.openCatalogs': 'Odprti katalogi',
  'shelf.yourCatalogs': 'Vaši katalogi',
  'shelf.addCatalog': 'Dodaj katalog',
  'shelf.name': 'Ime',
  'shelf.address': 'Naslov OPDS',
  'shelf.username': 'Uporabniško ime (neobvezno)',
  'shelf.password': 'Geslo (neobvezno)',
  'shelf.credentialsNote':
    'Naslov in morebitni prijavni podatki so shranjeni samo v tem brskalniku.',
  'shelf.add': 'Dodaj',
  'shelf.remove': 'Odstrani',
  'shelf.loading': 'Nalaganje kataloga…',
  'shelf.empty': 'Ta katalog nima vnosov.',
  'shelf.noCatalogs':
    'Svojega še nimate. Spodaj dodajte naslov Calibre-Weba, COPS-a, Kavite ali Audiobookshelfa.',
  'shelf.unreachable':
    'Vaš brskalnik tega kataloga ni mogel prebrati. Strežnik v vašem omrežju bo deloval; javna spletišča pogosto zavračajo zahteve iz drugega izvora.',
  'shelf.nextPage': 'Naslednja stran',
  'shelf.previousPage': 'Prejšnja stran',
  'shelf.drm': 'Potrebna je aplikacija z DRM',
  'shelf.notFree': 'Ni brezplačen prenos',
  'shelf.download': 'Prenesi',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Knjigarne blizu vas',
  'stores.useMyLocation': 'Uporabi mojo lokacijo',
  'stores.placeLabel': 'Mesto ali poštna številka',
  'stores.find': 'Najdi',
  'stores.locating': 'Iščemo…',
  'stores.failed': 'Lokacija ni na voljo. Namesto tega vpišite mesto ali poštno številko.',
  'stores.none': 'V polmeru {radius} km na zemljevidu ni nobene knjigarne.',
  'stores.distance': '{distance} km stran',
  'stores.stockUnknown':
    'Samo podatki z zemljevida — nihče ne objavlja, kaj ima trgovina na zalogi.',
  'stores.lookupFailed': 'OpenStreetMap trenutno ni bil dosegljiv. Poskusite čez trenutek.',
  'stores.privacy':
    'Vaša lokacija se zaokroži na približno 100 m in se pošlje samo OpenStreetMapu — nikoli temu spletišču.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Cene in trgovine',
  'prices.loading': 'Sprašujemo trgovine…',
  'prices.unknown': 'Cena ni objavljena',
  'prices.degraded': 'Brez odgovora: {providers}',
  'prices.format.hardcover': 'Trda vezava',
  'prices.format.paperback': 'Mehka vezava',
  'prices.format.ebook': 'E-knjiga',
  'prices.format.audiobook': 'Zvočna knjiga',
  'prices.format.unknown': 'Oblika ni navedena',
  'recommend.hideGenre': 'skrij »{genre}«',
  'recommend.hiddenList': 'Skriti žanri (kliknite, da enega vrnete):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Shranjeno',
  'settings.status.cleared': 'Počiščeno',
  'settings.status.unstored': 'Ni shranjeno',
  'settings.status.failed': 'Nespremenjeno',
  'settings.notStored':
    'Ta brskalnik spremembe ni hotel shraniti, zato se ni zgodilo nič — še naprej velja prejšnja vrednost.',
  'settings.language.title': 'Jezik vmesnika',
  'settings.language.changed':
    'Spremenjeno iz {from} v {to}. Vmesnik se znova naloži v jeziku {to}; naslovi knjig in imena avtorjev ostanejo v svojih jezikih.',
  'settings.country.title': 'Država nakupa',
  'settings.country.changed':
    'Nastavljeno na {country}. Povezave do knjigarn zdaj ponujajo trgovine, ki dostavljajo tja, ob svetovnih.',
  'settings.country.cleared':
    'Država ni izbrana. Ponujene bodo samo knjigarne, ki pošiljajo po vsem svetu.',
  'settings.bookLanguage.title': 'Jezik knjig',
  'settings.bookLanguage.changed':
    'Nastavljeno na {language}. Strani žanrov bodo najprej prikazovale knjige z izdajo v jeziku {language}, dokler filtra ne ponastavite.',
  'settings.bookLanguage.cleared':
    'Počiščeno. Strani žanrov spet prikazujejo knjige v vseh jezikih.',
  'settings.hiddenGenres.title': 'Skriti žanri',
  'settings.hiddenGenres.hidden':
    'Žanr »{genre}« je skrit. Pri pridobivanju predlogov ga ne pošiljamo več strežniku, skupaj pa je skritih {count} žanrov.',
  'settings.hiddenGenres.restored':
    'Žanr »{genre}« je spet med vašimi predlogi. Skritih ostaja {count} žanrov.',
  'settings.history.title': 'Zgodovina branja',
  'settings.history.cleared':
    'Knjige, ki ste jih odprli, so izbrisane iz tega brskalnika. Predlogi se ne bodo pojavljali, dokler ne odprete nove knjige.',
  'settings.bookmarks.title': 'Shranjene knjige',
  'settings.bookmarks.added': '»{title}« je bila dodana med vaše shranjene knjige.',
  'settings.bookmarks.removed': '»{title}« je bila odstranjena iz vaših shranjenih knjig.',
  'settings.bookmarks.failed':
    'Strežnik spremembe ni sprejel, zato so vaše shranjene knjige ostale takšne, kot so bile.',
  'settings.catalogs.title': 'Vaši katalogi',
  'settings.catalogs.added':
    '»{name}« je bil dodan na {url}. Naslov ostane v tem brskalniku in ni nikoli poslan na to spletišče.',
  'settings.catalogs.addedWithCredentials':
    '»{name}« je bil dodan na {url}, skupaj z uporabniškim imenom in geslom, ki ste ju vpisali. Vse ostane v tem brskalniku in nič od tega ni poslano na to spletišče.',
  'settings.catalogs.removed':
    '»{name}« je bil odstranjen iz tega brskalnika, skupaj z vsemi prijavnimi podatki, shranjenimi zanj.',
  'settings.catalogs.rejected': 'Nič ni bilo dodano: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Dodatki',
  'addons.title': 'Dodatki',
  'addons.intro':
    'Dodatek prinese svoje vire. Namestite ga tako, da prilepite njegov naslov; teče bodisi na vaši napravi, v peskovniku, bodisi na strežniku svojega avtorja. Golden Library nobenega ne dobavlja, nobenega ne navaja in ne preverja, kaj vračajo.',
  'addons.addressLabel': 'Naslov dodatka',
  'addons.addressHint': 'URL manifesta, ki vam ga je dal avtor dodatka.',
  'addons.continue': 'Naprej',
  'addons.fromServer': 'S strežnika',
  'addons.fromFile': 'Iz datoteke na vaši napravi',
  'addons.bundleLabel': 'Naslov kode dodatka',
  'addons.bundleHint': 'URL kode dodatka. Tekla bo na tej napravi, ne na strežniku.',
  'addons.integrityLabel': 'Zgoščena vrednost celovitosti',
  'addons.integrityHint':
    'Poda jo avtor dodatka, v obliki sha256-… . Obvezna je: brez nje bi se koda, ki ste jo enkrat odobrili, pozneje lahko spremenila, vi pa tega nikoli ne bi izvedeli.',
  'addons.checking': 'Beremo dodatek…',
  'addons.installedHeading': 'Nameščeno',
  'addons.none': 'Dodatkov še ni. Vse na tem spletišču doslej prihaja iz same instance.',
  'addons.priorityHint': 'Vrstni red je prednost: prvi dodatek odgovori prvi.',
  'addons.enable': 'Vklopi',
  'addons.disable': 'Izklopi',
  'addons.off': 'Izklopljen',
  'addons.remove': 'Odstrani',
  'addons.moveUp': 'Premakni gor',
  'addons.moveDown': 'Premakni dol',
  'addons.configure': 'Nastavi',
  'addons.failedToStart': '»{name}« se ni zagnal: {reason}',
  'addons.consentTitle': 'Namestim »{name}«?',
  'addons.consentHosts': 'Stopil bo v stik z: {hosts}',
  'addons.consentNoHosts': 'Ni zaprosil za stik z ničimer.',
  'addons.consentSeesYou':
    'Ta dodatek teče na strežniku svojega avtorja. Ta bo videl vaš naslov in vse, kar skozenj iščete.',
  'addons.consentSandboxed':
    'Ta dodatek teče na vaši napravi, v peskovniku. Ne more brati vaših piškotkov, podatkov tega spletišča ali česar koli drugega, kar imate odprto.',
  'addons.consentNotVetted':
    'Golden Library ne preverja, kaj dodatek vrne, in tega ni priporočila. Kaj namestite, je vaša odločitev.',
  'addons.install': 'Namesti',
  'addons.cancel': 'Prekliči',
  'addons.via': 'prek {name}',
  'addons.sourcesTitle': 'Iz vaših dodatkov',
  'addons.searchTitle': 'Našli vaši dodatki',
  'addons.showLinks': 'Pokaži povezave za prenos',
  'addons.unreadable': '{count} vnosov iz tega dodatka ni bilo mogoče prebrati.',
  'addons.browse': 'Brskaj po katalogu',
  'addons.browseTitle': 'Katalog dodatka {name}',
  'addons.browseNoCatalog': 'Ta dodatek ne ponuja kataloga za brskanje.',
  'addons.browseEmpty': 'Katalog tega dodatka je trenutno prazen.',
  'addons.browseFailed': 'Kataloga »{name}« ni bilo mogoče naložiti: {reason}',
  'addons.loadMore': 'Naloži več',
  'addons.notInstalled': 'Ta dodatek ni nameščen.',

  'settings.addons.title': 'Vaši dodatki',
  'settings.addons.installed':
    '»{name}« je nameščen. Vprašan bo skupaj z ostalimi in lahko stopi v stik z {hosts}.',
  'settings.addons.removed':
    '»{name}« je bil odstranjen. Njegovi rezultati so izginili iz tega brskalnika, prav tako vse, kar je tu shranil.',
  'settings.addons.enabled': '»{name}« je spet vklopljen in bo vprašan skupaj z ostalimi.',
  'settings.addons.disabled':
    '»{name}« je izklopljen. Ostaja nameščen s svojimi nastavitvami, a nič od tega, kar vrne, ne bo prikazano.',
  'settings.addons.reordered': '»{name}« zdaj odgovarja kot {position}. od {total}.',
  'settings.addons.rejected': 'Nič ni bilo nameščeno: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Lastni viri',
  'customSources.title': 'Lastni viri',
  'customSources.intro':
    'Dodajte svojo trgovino ali katalog tako, da mu date ime in iskalni URL z {isbn}, {query}, {title}, {author} ali {language}. Povezava se sestavi na tej napravi in to spletišče je nikoli ne kliče.',
  'customSources.nameLabel': 'Ime',
  'customSources.templateLabel': 'Predloga URL',
  'customSources.templateHint':
    'Absolutni naslov https://. {isbn}, {query}, {title}, {author} in {language} se izpolnijo iz izdaje; ograda, ki ostane prazna, pomeni, da se povezava za to izdajo preskoči.',
  'customSources.add': 'Dodaj vir',
  'customSources.listHeading': 'Vaši viri',
  'customSources.none': 'Lastnih virov še ni.',
  'customSources.off': 'Izklopljen',
  'customSources.enable': 'Vklopi',
  'customSources.disable': 'Izklopi',
  'customSources.remove': 'Odstrani',
  'customSources.heading': 'Vaši viri',
  'customSources.caption':
    'Povezave, ki ste jih nastavili sami. Ta instanca ne preverja, kam vodijo.',

  'settings.customSources.title': 'Vaši lastni viri',
  'settings.customSources.added': '»{name}« je bil dodan in bo ponujen skupaj z ostalimi.',
  'settings.customSources.removed': '»{name}« je bil odstranjen iz tega brskalnika.',
  'settings.customSources.enabled': '»{name}« je spet vklopljen.',
  'settings.customSources.disabled':
    '»{name}« je izklopljen. Ostaja nastavljen, a njegova povezava ne bo prikazana.',
  'settings.customSources.rejected': 'Nič ni bilo dodano: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Knjige v vašem jeziku',
  'featured.inLanguageBlurb':
    'Knjige, napisane v jeziku, v katerem berete to spletišče, najbolj izdajane najprej — to je vrstni red same Open Library, ne lestvica uspešnic.',
  'work.newSearch': 'Novo iskanje',
  'work.descriptionFrom': 'Opis:',
  'work.descriptionNotLocalized':
    'Ta opis je v jeziku, v katerem ga je napisal vir — v vašem jeziku ga za to knjigo še ni.',

  // Reader ratings of an edition, never of a translation — see TranslationRatings.tsx.
  'ratings.edition': '{average} od {outOf}, {votes} bralcev na {source}',
  'ratings.lowConfidence': 'premalo glasov za primerjavo',
  'ratings.reviews': 'Ocene',
  'ratings.reviewsOn': 'Ocene te izdaje na {source}',
  'ratings.noteNoRatings':
    'Noben odprt vir ne ocenjuje prevoda, in nobena od teh naklad tu nima bralske ocene.',
  'ratings.noteReviews':
    'Kjer je izdaja znana na {sources}, povezava vodi na ocene prav te naklade — večina izdaj ni znana.',
  'ratings.translator':
    'Izdaje v prevodu {name}: {average} od {outOf} čez {editions} ocenjenih izdaj, skupaj {votes} bralcev.',
  'ratings.note':
    'To so ocene bralcev za določeno izdajo na {sources}, ne presoja samega prevoda — te ne objavlja nihče. Vredno jih je brati drugo ob drugi: ista knjiga, isti jezik, drugi prevajalci, in vedno s številom glasov pred očmi.',
  'ratings.gapWithoutIsbn':
    '{count} tukajšnjih izdaj nima ISBN, zato jim ni bilo mogoče pripisati nobene ocene.',
  'ratings.gapNotLookedUp': 'Nadaljnjih {count} izdaj v tej zahtevi ni bilo preverjenih.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Berite v svojem brskalniku',
  'reader.privacy':
    'Vaš brskalnik odpre to knjigo sam. Datoteka, kraj, od koder je prišla, in to, kako daleč ste prebrali, nikoli ne pridejo do tega spletišča.',
  'reader.chooseFile': 'Odprite knjigo iz te naprave',
  'reader.formats': 'EPUB, FB2, MOBI in CBZ.',
  'reader.loading': 'Odpiram…',
  'reader.failed': 'Te knjige ni bilo mogoče odpreti: {reason}',
  'reader.previous': 'Prejšnja stran',
  'reader.next': 'Naslednja stran',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…ali spustite knjigo sem',
  'reader.fetching': 'Prosim za datoteko pri {host}…',
  'reader.blockedTitle': '{host} datoteke ni izročil tej strani',
  'reader.blockedBody':
    'Ali ni dosegljiv ali pa ne dovoli drugim spletiščem brati svojih datotek. To spletišče je namesto vas ne bo prineslo: vaša knjiga nikoli ne gre skozenj, in prav v tem je smisel branja tukaj.',
  'reader.blockedDownload': 'Prenesite jo z {host}',
  'reader.blockedOpenHere': 'in jo nato odprite tukaj iz svoje naprave',
  'reader.blockedAddon': 'Deluje tudi dodatek, ki datoteko postreže sam.',
  'reader.keepFile': 'Obdrži to knjigo v tem brskalniku',
  'reader.keepFileHint':
    'Privzeto izklopljeno. Brez tega datoteka izgine, ko zaprete zavihek; s tem ostane samo v tej napravi.',
  'reader.library': 'Obdržano v tem brskalniku',
  'reader.libraryEmpty':
    'Zaenkrat nič obdržanega. Knjige, ki jih obdržite, ostanejo v tej napravi in nikoli niso nikamor naložene.',
  'reader.libraryOpen': 'Odpri',
  'reader.libraryRemove': 'Odstrani',
  'reader.libraryFileKept': 'datoteka obdržana',
  'reader.libraryFileGone': 'datoteka ni obdržana',
  'reader.untitled': 'Knjiga brez naslova',
  'settings.reader.libraryTitle': 'Knjige, obdržane v tem brskalniku',
  'settings.reader.kept':
    '»{title}« se zdaj hrani v tej napravi, zato se odpre brez ponovnega prenosa. Nikamor ni naložena.',
  'settings.reader.forgotten':
    'Datoteka knjige »{title}« je bila izbrisana iz tega brskalnika. Zapis ostane na seznamu, tako da jo lahko znova odprete iz njenega vira.',
  'settings.reader.removed':
    '»{title}« je bila v celoti odstranjena iz tega brskalnika — datoteka in zapis.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Odprta tam, kjer ste končali — pri {percent} %.',
  'reader.bookmarks': 'Zaznamki',
  'reader.bookmarkAdd': 'Zaznamuj to stran',
  'reader.bookmarkNone': 'V tej knjigi še ni zaznamkov.',
  'reader.bookmarkGo': 'Pojdi na',
  'reader.bookmarkRemove': 'Odstrani zaznamek',
  'reader.bookmarkNote': 'Zapisek',
  'reader.bookmarkNotePlaceholder': 'Vaše besede o tej strani',
  'reader.bookmarkAt': 'pri {percent} %',
  'settings.reader.bookmarkTitle': 'Zaznamki v tem brskalniku',
  'settings.reader.bookmarkAdded':
    'Zaznamek pri {percent} % knjige »{title}«. Zaznamki ostanejo v tej napravi skupaj s knjigo.',
  'settings.reader.bookmarkRemoved':
    'Tisti zaznamek v knjigi »{title}« je bil odstranjen iz tega brskalnika.',
  'settings.reader.noteSaved':
    'Vaš zapisek na tej strani knjige »{title}« je bil shranjen v tej napravi.',
  'settings.reader.positionTitle': 'Mesto v branju',
  'settings.reader.positionUnstored':
    'Ta brskalnik ni hotel shraniti, kje ste v knjigi »{title}«, zato se bo naslednjič odprla od začetka. To počneta tako zasebni način kot poln disk.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': 'Kako je videti ta knjiga',
  'reader.theme': 'Barve',
  'reader.themeApp': 'Kot spletišče',
  'reader.themeLight': 'Papir',
  'reader.themeDark': 'Črnilo',
  'reader.themeSepia': 'Sepija',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint':
    'Čista črna na belem, brez animacije, en stolpec — za zaslone iz elektronskega papirja.',
  'reader.fontSize': 'Velikost črk',
  'reader.smaller': 'Manjše',
  'reader.larger': 'Večje',
  'reader.lineHeight': 'Razmik med vrsticami',
  'reader.margin': 'Robovi',
  'reader.flow': 'Strani',
  'reader.flowPaged': 'Obračanje strani',
  'reader.flowScrolled': 'Drsenje',
  'reader.justify': 'Obojestranska poravnava',
  'reader.hyphenate': 'Deljenje besed',
  'reader.displayReset': 'Nazaj na privzeto',
  'settings.reader.displayTitle': 'Videz branja',
  'settings.reader.displayChanged':
    '{setting} je zdaj {value}. Velja za vsako knjigo, ki jo odprete v tem brskalniku.',
  'settings.reader.displayReset':
    'Videz branja je za vse knjige v tem brskalniku vrnjen na privzete vrednosti.',
  'reader.on': 'Vklopljeno',
  'reader.off': 'Izklopljeno',
  'reader.openHere': 'Berite v svojem brskalniku',
  'reader.notAFileTitle': '{host} je poslal spletno stran, ne datoteke',
  'reader.notAFileBody':
    'Povezava vodi na stran, ne h knjigi — na stran za prenos, zaslon s privolitvijo ali preverjanje, da niste robot. Odprite jo sami in datoteka bo tam.',
  'settings.status.session': 'Ni zapomnjeno',
  'settings.notRemembered':
    'Ta brskalnik si tega ni zapomnil, zato bo naslednjič, ko odprete knjigo, vse tako, kot je bilo.',
  'compare.rowEditionStatement': 'Izdaja',
  'home.genres': 'Priljubljeni žanri',
  'home.genresBlurb': 'Oznake, za katerimi stoji največ knjig. Vsaka odpre svoj katalog.',
};
