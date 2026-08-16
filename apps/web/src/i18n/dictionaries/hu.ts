import type { Dictionary } from '../dictionary';

export const hu: Dictionary = {
  'nav.savedBooks': 'Mentett könyvek',
  'nav.signIn': 'Bejelentkezés',
  'nav.signOut': 'Kijelentkezés',
  'nav.language': 'Nyelv',
  'nav.skipToContent': 'Ugrás a tartalomra',
  'footer.legal':
    'Kizárólag legális források: közvetlen letöltés csak közkincs és nyílt licencű művek esetén; szerzői jogi védelem alatt álló könyvek — vásárlás vagy könyvtári kölcsönzés. Minden hivatkozás mellett ott áll a jogi állapota.',
  'footer.openSource': 'Nyílt forráskód',
  'footer.openSourceRest': '— MIT licenc, saját gépen is futtatható. A kód a GitHubon.',
  'home.title': 'Golden Library',
  'home.subtitle': 'Nyílt könyvfordítás-aggregátor: nyelvek, kiadások és legális források.',
  'home.searchLabel': 'Cím és szerző',
  'home.searchPlaceholder': 'Háború és béke Tolsztoj',
  'home.searchButton': 'Keresés',
  'search.searching': 'Keresés…',
  'search.backfilling':
    'Itt még nincs semmi — lekérjük a könyvet a forrásokból. Ez néhány másodpercig tart.',
  'search.notFound': 'Erre a keresésre nem találtunk semmit.',
  'search.retry': 'Próbálja újra',
  'search.signInPrompt':
    'hogy elmenthesse az itt talált könyveket és visszatérhessen hozzájuk — és hogy a választás előtt egymás mellett hasonlíthasson össze különböző évekből származó kiadásokat.',
  'featured.yearHeading': 'Az év könyvei',
  'featured.yearBlurb':
    'Figyelemre méltó könyvek az elmúlt évek mindegyikéből. Kézzel válogatott lista, nem eladási toplista — olyat egyetlen nyílt forrás sem tesz közzé.',
  'featured.popularHeading': 'Sokat olvasott, sokat fordított',
  'featured.popularBlurb':
    'Könyvek, amelyek sok nyelven léteznek — pontosan ezért van ez az oldal.',
  'featured.filling':
    'Néhányat még a háttérben töltünk le. Egy perc múlva frissítse az oldalt a többiért.',
  'featured.freeCopy': 'Ingyenes példány',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Most azonnal ingyen olvasható',
  'free.homeBlurb':
    'Közkincs és nyílt licencű könyvek, amelyeket az oldal e példánya közvetlenül átadhat Önnek.',
  'free.seeAll': 'Továbbiak',
  'free.downloadable': 'Letöltés',
  'free.pageTitle': 'Ingyenes könyvek',
  'free.pageBlurb':
    'Itt minden könyvhöz tartozik legalább egy legális ingyenes példány — közkincs, vagy a jogtulajdonos ajándéka. Nincs vásárlás, nincs olvasójegy.',
  'free.empty':
    'Itt még nincs semmi ingyen. Az ingyenes példányok akkor jelennek meg, ahogy ez a példány könyveket tölt le, úgyhogy keressen egyet, és térjen vissza.',
  'free.emptyForLanguage':
    'Még nincs ingyenes példány ezen a nyelven: {language}. Vegye le a fenti szűrőt a teljes polchoz.',
  'free.showMore': 'Több megjelenítése',
  'free.shown': '{shown} / {total} látható.',
  'free.allLanguages': 'Ingyenes példányok minden nyelven.',
  'free.filteredByLanguage': 'Csak ingyenes példányok ezen a nyelven: {language}.',
  'free.filterByLanguage': 'Csak a(z) {language} nyelvű ingyenes példányok mutatása.',
  'free.dropLanguageFilter': 'minden nyelv mutatása',
  'free.loadFailed': 'Az ingyenes könyveket most nem sikerült betölteni.',
  'work.original': 'eredeti',
  'work.dataSources': 'Adatforrások',
  'work.about': 'A könyvről',
  'work.translatedInto': 'Lefordítva erre',
  'work.availableIn': 'Elérhető nyelvek',
  'work.languagesNote':
    'Csak az, amit az általunk olvasott források felsorolnak — egy itt hiányzó fordítás attól még létezhet.',
  'work.noTranslations': 'Egyelőre nem találtunk fordítást.',
  'work.yourLanguage.title': 'Az Ön nyelvén',
  'work.yourLanguage.yes': 'Létezik {language} fordítás.',
  'work.yourLanguage.original': 'Ez a könyv {language} nyelven íródott.',
  'work.yourLanguage.no': 'Az itt ismert kiadások közt nincs {language} fordítás.',
  'work.yourLanguage.show': 'Kiadások mutatása ezen a nyelven: {language}',
  'work.editions': 'Kiadások ({shown} / {total})',
  'work.filterLanguage': 'Nyelv',
  'work.filterAllLanguages': 'Minden nyelv',
  'work.filterYear': 'Év',
  'work.filterApply': 'Szűrés',
  'work.filterReset': 'Alaphelyzet',
  'work.noEditionsMatch': 'Ezekre a szűrőkre egyetlen kiadás sem illik.',
  'work.showMoreEditions': 'További kiadások ({remaining} maradt)',
  'work.badgeFreeDownload': 'ingyenes letöltés',
  'work.freeDownloadFormat': '{format} letöltése',
  'work.freeDownloadNote': '{rights}. Ingyen innen: {provider} — nincs fiók, nincs fizetés.',
  'work.badgeReadBorrow': 'olvasás vagy kölcsönzés',
  'work.badgeInBookstores': 'könyvesboltokban',
  'work.translatedBy': 'fordította: {name}',
  'work.pages': '{count} oldal',
  'bookmark.save': 'Könyv mentése',
  'bookmark.saved': 'Mentve',
  'bookmark.signInToSave': 'Mentéshez jelentkezzen be',
  'bookmark.failed': 'A mentés nem sikerült. Próbálja újra.',
  'links.show': 'Hivatkozások mutatása',
  'links.hide': 'Hivatkozások elrejtése',
  'links.loading': 'Hivatkozások betöltése',
  'links.none': 'Ehhez a kiadáshoz még nincs legális hivatkozás.',
  'links.viaOtherEdition': 'ingyenes példány a(z) {label} kiadásból',
  'links.failed': 'A hivatkozásokat nem sikerült betölteni.',
  'links.storesHeading': 'Keresés könyvesboltban',
  'links.storesInCountry': 'Itt: {country}',
  'links.storesYourCountry': 'az Ön országa',
  'links.storesLanguageMarket': 'Ahol {language} nyelvű könyveket árulnak',
  'links.storesLanguageMarketGeneric': 'Ahol e kiadás nyelvét árulják',
  'links.storesWorldwide': 'Világszerte szállít',
  'links.storesCaption':
    'Minden hivatkozás az adott bolt saját katalógusában keres — az elérhetőséget és az árat maga a bolt mutatja.',
  'linkType.download': 'Letöltés',
  'linkType.buy': 'Megvásárlás',
  'linkType.borrow': 'Kölcsönzés könyvtárból',
  'linkType.listen': 'Meghallgatás (hangoskönyv)',
  'rights.public_domain': 'Közkincs',
  'rights.open_license': 'Nyílt licenc',
  'rights.copyrighted': 'Szerzői jogi védelem alatt',
  'rights.unknown': 'Ismeretlen állapot',
  'compare.heading': 'Kiadások összehasonlítása',
  'compare.blurb': 'Válasszon két vagy három kiadást, és látni fogja, miben térnek el valójában.',
  'compare.selected': 'Kiválasztva: {count}, legalább 2 kell.',
  'compare.editSelection': 'Kiadások módosítása',
  'compare.showAllEditions': 'Mind a(z) {count} kiadás mutatása',
  'compare.columnDifference': 'Eltérés',
  'compare.identical': 'Mindabban, amit a források rögzítenek, ezek a kiadások azonosak.',
  'compare.rowLanguage': 'Nyelv',
  'compare.rowPublished': 'Megjelenés',
  'compare.rowPublisher': 'Kiadó',
  'compare.rowTranslator': 'Fordító',
  'compare.rowTranslatedFrom': 'Fordítás forrásnyelve',
  'compare.rowBinding': 'Kötés',
  'compare.rowPages': 'Oldalszám',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Ingyenes vagy kölcsönözhető példány',
  'compare.yes': 'igen ({count})',
  'compare.no': 'nem található',
  'country.label': 'Hol vásárol könyvet?',
  'country.worldwideOnly': 'Csak világszerte szállító boltok',
  'auth.signInTitle': 'Bejelentkezés',
  'auth.registerTitle': 'Fiók létrehozása',
  'auth.blurb':
    'A fióknak egyetlen célja van: elmenteni a talált könyveket és visszatérni hozzájuk — a nyelvekkel, amelyekre lefordították, a létező kiadásokkal, és azzal, hol szerezhető be mindegyik legálisan. Nincs hírlevél, nincs profil, nincs követés.',
  'auth.name': 'Név (nem kötelező)',
  'auth.email': 'E-mail',
  'auth.password': 'Jelszó',
  'auth.passwordHint':
    'Legalább {min} karakter. Csak a hossz számít — egy hosszú mondat, amit megjegyez, többet ér, mint egy rövid, tele írásjelekkel.',
  'auth.submitSignIn': 'Bejelentkezés',
  'auth.submitRegister': 'Fiók létrehozása',
  'auth.working': 'Dolgozunk…',
  'auth.google': 'Folytatás Google-fiókkal',
  'auth.toRegister': 'Még nincs fiókja? Hozzon létre egyet',
  'auth.toSignIn': 'Már van fiókja? Jelentkezzen be',
  'auth.backToSearch': 'Vissza a kereséshez',
  'auth.errorGoogleState':
    'Ez a bejelentkezési hivatkozás lejárt, vagy másik böngészőben nyílt meg. Próbálja újra.',
  'auth.errorGoogleFailed':
    'A Google-bejelentkezés nem fejeződött be. Használhat helyette e-mailt és jelszót.',
  'auth.errorGeneric': 'Valami hiba történt.',
  'bookmarks.title': 'Mentett könyvek',
  'bookmarks.signedOut':
    'hogy megtarthassa a talált könyveket — és hogy később egymás mellett hasonlíthassa össze ugyanannak a könyvnek a kiadásait.',
  'bookmarks.loading': 'Betöltés…',
  'bookmarks.empty':
    'Még nincs elmentve semmi. Keressen egy könyvet, és használja a kártyáján a „Könyv mentése” gombot.',
  'bookmarks.searchLink': 'Keresés',
  'bookmarks.remove': 'Eltávolítás',
  'bookmarks.loadFailed': 'A mentett könyveit nem sikerült betölteni.',
  'search.failed': 'A keresés nem sikerült.',
  'search.pending': 'Az adatbázisunkban még nincs meg — ellenőrizzük a forrásokat',
  'search.pendingLong':
    'Még keresünk: egy könyv első lekérése a forrásokból gyűjti össze az adatokat, ami akár néhány percig is eltarthat',
  'search.notFoundHint': 'Nem találtunk semmit. Pontosítsa a címet vagy a szerzőt.',
  'search.timedOut':
    'A források lassan válaszolnak, és még nincs adatunk. A háttérszinkronizálás lehet, hogy már befejeződött — próbálja újra.',
  'search.freeOnlyToggle': 'Ingyen letölthető',
  'search.noFreeResults':
    'Ezek közül még egyikhez sincs ingyenes letöltés — próbálja kikapcsolni a szűrőt.',
  'home.tagline': 'Találja meg a következő magnum opusát',
  'subject.allLanguages': 'Minden nyelv.',
  'subject.filteredByLanguage': 'Csak azok a könyvek, amelyeknek van {language} kiadásuk.',
  'subject.dropLanguageFilter': 'minden nyelv mutatása',
  'subject.empty':
    'E címke alatt még nincs semmi. A címkék azokból a könyvekből származnak, amelyeket ez a példány már letöltött.',
  'featured.year': '{year}',
  'nav.browse': 'Böngészés műfaj szerint',
  'recommend.heading': 'Az alapján, amit olvasott',
  'recommend.becauseOf': 'Megnyitotta ezt: „{title}”, íme könyvek ugyanezekből a műfajokból.',
  'recommend.blurb': 'Könyvek azokból a műfajokból, amelyeket megnyitott.',
  'recommend.privacy':
    'Ezt a böngészője számolja ki — a kiszolgáló a műfajokat tudja meg, azt sosem, hogy Ön kicsoda.',
  'recommend.forget': 'előzményeim elfelejtése',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Polc',
  'shelf.title': 'Polc',
  'shelf.intro':
    'Nyílt katalógusok, és bármelyik könyvtárkiszolgáló, amelyet Ön üzemeltet. A hozzáadott katalógusok ebben a böngészőben maradnak, és soha nem kerülnek el erre az oldalra.',
  'shelf.openCatalogs': 'Nyílt katalógusok',
  'shelf.yourCatalogs': 'Az Ön katalógusai',
  'shelf.addCatalog': 'Katalógus hozzáadása',
  'shelf.name': 'Név',
  'shelf.address': 'OPDS-cím',
  'shelf.username': 'Felhasználónév (nem kötelező)',
  'shelf.password': 'Jelszó (nem kötelező)',
  'shelf.credentialsNote': 'A cím és a belépési adatok csak ebben a böngészőben tárolódnak.',
  'shelf.add': 'Hozzáadás',
  'shelf.remove': 'Eltávolítás',
  'shelf.loading': 'Katalógus betöltése…',
  'shelf.empty': 'Ebben a katalógusban nincsenek tételek.',
  'shelf.noCatalogs':
    'Még nincs sajátja. Adjon meg lent egy Calibre-Web-, COPS-, Kavita- vagy Audiobookshelf-címet.',
  'shelf.unreachable':
    'A böngészője nem tudta beolvasni ezt a katalógust. A saját hálózatán futó kiszolgáló működni fog; a nyilvános oldalak gyakran elutasítják a más eredetű kéréseket.',
  'shelf.nextPage': 'Következő oldal',
  'shelf.previousPage': 'Előző oldal',
  'shelf.drm': 'DRM-alkalmazás szükséges',
  'shelf.notFree': 'Nem ingyenes letöltés',
  'shelf.download': 'Letöltés',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Könyvesboltok a közelben',
  'stores.useMyLocation': 'A helyzetem használata',
  'stores.placeLabel': 'Város vagy irányítószám',
  'stores.find': 'Keresés',
  'stores.locating': 'Keressük…',
  'stores.failed': 'A helyzet nem érhető el. Írjon be helyette várost vagy irányítószámot.',
  'stores.none': '{radius} km-en belül nincs térképre vett könyvesbolt.',
  'stores.distance': '{distance} km-re',
  'stores.stockUnknown': 'Csak térképadat — senki nem teszi közzé, mi van egy bolt készletén.',
  'stores.lookupFailed': 'Az OpenStreetMap most nem érhető el. Próbálja újra kis idő múlva.',
  'stores.privacy':
    'A helyzetét körülbelül 100 m-re kerekítjük, és csak az OpenStreetMapnak küldjük el — soha nem ennek az oldalnak.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Árak és boltok',
  'prices.loading': 'Kérdezzük a boltokat…',
  'prices.unknown': 'Az árat nem tették közzé',
  'prices.degraded': 'Nem válaszolt: {providers}',
  'prices.format.hardcover': 'Keménytáblás',
  'prices.format.paperback': 'Puhafedeles',
  'prices.format.ebook': 'E-könyv',
  'prices.format.audiobook': 'Hangoskönyv',
  'prices.format.unknown': 'A formátum nincs megadva',
  'recommend.hideGenre': '„{genre}” elrejtése',
  'recommend.hiddenList': 'Elrejtett műfajok (kattintson, hogy visszahozza valamelyiket):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Mentve',
  'settings.status.cleared': 'Törölve',
  'settings.status.unstored': 'Nem tárolva',
  'settings.status.failed': 'Változatlan',
  'settings.notStored':
    'Ez a böngésző nem volt hajlandó tárolni a változtatást, így semmi sem történt — a korábbi érték érvényes tovább.',
  'settings.language.title': 'A felület nyelve',
  'settings.language.changed':
    'Módosítva erről: {from}, erre: {to}. A felület {to} nyelven töltődik újra; a könyvcímek és a szerzők nevei a saját nyelvükön maradnak.',
  'settings.country.title': 'Vásárlási ország',
  'settings.country.changed':
    'Beállítva: {country}. A könyvesbolti hivatkozások mostantól az oda szállító boltokat is kínálják, a világszerte szállítók mellett.',
  'settings.country.cleared':
    'Nincs kiválasztott ország. Csak a világszerte szállító könyvesboltokat kínáljuk.',
  'settings.bookLanguage.title': 'Könyvek nyelve',
  'settings.bookLanguage.changed':
    'Beállítva: {language}. A műfajoldalak azokat a könyveket hozzák előre, amelyeknek van {language} kiadásuk, amíg vissza nem állítja a szűrőt.',
  'settings.bookLanguage.cleared':
    'Törölve. A műfajoldalak ismét minden nyelven mutatnak könyveket.',
  'settings.hiddenGenres.title': 'Elrejtett műfajok',
  'settings.hiddenGenres.hidden':
    'A(z) „{genre}” el van rejtve. Az ajánlások lekérésekor már nem küldjük el a kiszolgálónak, és összesen {count} műfaj rejtett.',
  'settings.hiddenGenres.restored':
    'A(z) „{genre}” visszakerült az ajánlásai közé. Még {count} műfaj rejtett.',
  'settings.history.title': 'Olvasási előzmények',
  'settings.history.cleared':
    'A megnyitott könyvek törlődtek ebből a böngészőből. Az ajánlások addig maradnak távol, amíg meg nem nyit egy újabb könyvet.',
  'settings.bookmarks.title': 'Mentett könyvek',
  'settings.bookmarks.added': 'A(z) „{title}” bekerült a mentett könyvei közé.',
  'settings.bookmarks.removed': 'A(z) „{title}” kikerült a mentett könyvei közül.',
  'settings.bookmarks.failed':
    'A kiszolgáló nem fogadta el a változtatást, így a mentett könyvei változatlanok.',
  'settings.catalogs.title': 'Az Ön katalógusai',
  'settings.catalogs.added':
    'A(z) „{name}” hozzáadva ezen a címen: {url}. A cím ebben a böngészőben marad, és soha nem kerül el erre az oldalra.',
  'settings.catalogs.addedWithCredentials':
    'A(z) „{name}” hozzáadva ezen a címen: {url}, a beírt felhasználónévvel és jelszóval együtt. Mindez ebben a böngészőben marad, és semmi sem kerül el erre az oldalra.',
  'settings.catalogs.removed':
    'A(z) „{name}” eltávolítva ebből a böngészőből, a hozzá tárolt belépési adatokkal együtt.',
  'settings.catalogs.rejected': 'Semmi nem került hozzáadásra: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Kiegészítők',
  'addons.title': 'Kiegészítők',
  'addons.intro':
    'A kiegészítő saját forrásokat hoz. A címének beillesztésével telepíti; vagy az Ön eszközén fut homokozóban, vagy a szerzője kiszolgálóján. A Golden Library egyet sem szállít, egyet sem listáz, és nem ellenőrzi, mit adnak vissza.',
  'addons.addressLabel': 'A kiegészítő címe',
  'addons.addressHint': 'A manifest URL-je, amelyet a kiegészítő szerzőjétől kapott.',
  'addons.continue': 'Tovább',
  'addons.fromServer': 'Kiszolgálóról',
  'addons.fromFile': 'Az eszközén lévő fájlból',
  'addons.bundleLabel': 'A kiegészítő kódjának címe',
  'addons.bundleHint': 'A kiegészítő kódjának URL-je. Ezen az eszközön fut, nem kiszolgálón.',
  'addons.integrityLabel': 'Integritás-hash',
  'addons.integrityHint':
    'A kiegészítő szerzője adja meg, sha256-… alakban. Kötelező: nélküle az egyszer jóváhagyott kód utólag megváltozhatna, és Ön soha nem tudná meg.',
  'addons.checking': 'Kiegészítő beolvasása…',
  'addons.installedHeading': 'Telepítve',
  'addons.none':
    'Még nincs kiegészítő. Ezen az oldalon eddig minden magától a példánytól származik.',
  'addons.priorityHint': 'A sorrend a rangsor: az első kiegészítő válaszol elsőként.',
  'addons.enable': 'Bekapcsolás',
  'addons.disable': 'Kikapcsolás',
  'addons.off': 'Ki',
  'addons.remove': 'Eltávolítás',
  'addons.moveUp': 'Feljebb',
  'addons.moveDown': 'Lejjebb',
  'addons.configure': 'Beállítás',
  'addons.failedToStart': 'A(z) „{name}” nem indult el: {reason}',
  'addons.consentTitle': 'Telepíti a(z) „{name}” kiegészítőt?',
  'addons.consentHosts': 'A következőkkel fog kapcsolatba lépni: {hosts}',
  'addons.consentNoHosts': 'Semmivel sem kért kapcsolatot.',
  'addons.consentSeesYou':
    'Ez a kiegészítő a szerzője kiszolgálóján fut. Ő látja az Ön címét és mindent, amit rajta keresztül keres.',
  'addons.consentSandboxed':
    'Ez a kiegészítő az Ön eszközén fut, homokozóban. Nem olvashatja a sütijeit, ennek az oldalnak az adatait, sem bármi mást, ami nyitva van Önnél.',
  'addons.consentNotVetted':
    'A Golden Library nem ellenőrzi, mit ad vissza egy kiegészítő, és ezt nem ajánlotta. Amit telepít, az az Ön döntése.',
  'addons.install': 'Telepítés',
  'addons.cancel': 'Mégse',
  'addons.via': 'innen: {name}',
  'addons.sourcesTitle': 'Az Ön kiegészítőitől',
  'addons.searchTitle': 'A kiegészítői találatai',
  'addons.showLinks': 'Letöltési hivatkozások mutatása',
  'addons.unreadable': 'E kiegészítő {count} tételét nem sikerült beolvasni.',
  'addons.browse': 'Katalógus böngészése',
  'addons.browseTitle': 'A(z) {name} katalógusa',
  'addons.browseNoCatalog': 'Ez a kiegészítő nem kínál böngészhető katalógust.',
  'addons.browseEmpty': 'E kiegészítő katalógusa jelenleg üres.',
  'addons.browseFailed': 'A(z) „{name}” katalógusát nem sikerült betölteni: {reason}',
  'addons.loadMore': 'Több betöltése',
  'addons.notInstalled': 'Ez a kiegészítő nincs telepítve.',

  'settings.addons.title': 'Az Ön kiegészítői',
  'settings.addons.installed':
    'A(z) „{name}” telepítve. A többivel együtt kérdezzük le, és kapcsolatba léphet ezekkel: {hosts}.',
  'settings.addons.removed':
    'A(z) „{name}” eltávolítva. Találatai eltűntek ebből a böngészőből, és minden, amit itt tárolt, szintén.',
  'settings.addons.enabled':
    'A(z) „{name}” ismét be van kapcsolva, és a többivel együtt kérdezzük le.',
  'settings.addons.disabled':
    'A(z) „{name}” ki van kapcsolva. Telepítve marad a beállításaival, de semmit sem mutatunk abból, amit visszaad.',
  'settings.addons.reordered':
    'A(z) „{name}” mostantól {total} közül a(z) {position}. helyen felel.',
  'settings.addons.rejected': 'Semmi nem került telepítésre: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Saját források',
  'customSources.title': 'Saját források',
  'customSources.intro':
    'Vegyen fel saját boltot vagy katalógust: adjon neki nevet és egy keresési URL-t, amelyben szerepel az {isbn}, {query}, {title}, {author} vagy {language}. A hivatkozás ezen az eszközön áll össze, és ez az oldal soha nem hívja le.',
  'customSources.nameLabel': 'Név',
  'customSources.templateLabel': 'URL-sablon',
  'customSources.templateHint':
    'Abszolút https:// cím. Az {isbn}, {query}, {title}, {author} és {language} a kiadás adataiból töltődik ki; egy üresen maradó helyőrző azt jelenti, hogy annál a kiadásnál kihagyjuk a hivatkozást.',
  'customSources.add': 'Forrás hozzáadása',
  'customSources.listHeading': 'Az Ön forrásai',
  'customSources.none': 'Még nincsenek saját források.',
  'customSources.off': 'Ki',
  'customSources.enable': 'Bekapcsolás',
  'customSources.disable': 'Kikapcsolás',
  'customSources.remove': 'Eltávolítás',
  'customSources.heading': 'Az Ön forrásai',
  'customSources.caption':
    'Hivatkozások, amelyeket Ön állított be. Ez a példány nem ellenőrzi, hová vezetnek.',

  'settings.customSources.title': 'Az Ön saját forrásai',
  'settings.customSources.added': 'A(z) „{name}” hozzáadva, és a többivel együtt kínáljuk.',
  'settings.customSources.removed': 'A(z) „{name}” eltávolítva ebből a böngészőből.',
  'settings.customSources.enabled': 'A(z) „{name}” ismét be van kapcsolva.',
  'settings.customSources.disabled':
    'A(z) „{name}” ki van kapcsolva. Beállítva marad, de a hivatkozása nem jelenik meg.',
  'settings.customSources.rejected': 'Semmi nem került hozzáadásra: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Könyvek az Ön nyelvén',
  'featured.inLanguageBlurb':
    'Azon a nyelven írt könyvek, amelyen ezt az oldalt olvassa, a legtöbbször kiadottakkal az élen — ez az Open Library saját sorrendje, nem bestsellerlista.',
  'work.newSearch': 'Új keresés',
  'work.descriptionFrom': 'Leírás:',
  'work.descriptionNotLocalized':
    'Ez a leírás azon a nyelven van, amelyen a forrás megírta — az Ön nyelvén ehhez a könyvhöz még nincs.',
};
