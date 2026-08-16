import type { Dictionary } from '../dictionary';

export const pl: Dictionary = {
  'nav.savedBooks': 'Zapisane książki',
  'nav.signIn': 'Zaloguj się',
  'nav.signOut': 'Wyloguj się',
  'nav.language': 'Język',
  'nav.skipToContent': 'Przejdź do treści',
  'footer.legal':
    'Wyłącznie legalne źródła: bezpośrednie pobieranie tylko dla domeny publicznej i otwartych licencji; książki objęte prawem autorskim — zakup lub wypożyczenie w bibliotece. Każdy odnośnik ma wyraźnie podany status prawny.',
  'footer.openSource': 'Otwarte źródła',
  'footer.openSourceRest': '— licencja MIT, można uruchomić u siebie. Kod na GitHubie.',
  'home.title': 'Golden Library',
  'home.subtitle': 'Otwarty agregator przekładów: języki, wydania i legalne źródła.',
  'home.searchLabel': 'Tytuł i autor',
  'home.searchPlaceholder': 'Wojna i pokój Tołstoj',
  'home.searchButton': 'Szukaj',
  'search.searching': 'Szukamy…',
  'search.backfilling': 'Na razie pusto — pobieramy tę książkę ze źródeł. Zajmie to kilka sekund.',
  'search.notFound': 'Nic nie znaleziono dla tego zapytania.',
  'search.retry': 'Spróbuj ponownie',
  'search.signInPrompt':
    ', aby zapisywać znalezione książki i do nich wracać — oraz porównywać wydania z różnych lat, zanim wybierzesz.',
  'featured.yearHeading': 'Książki roku',
  'featured.yearBlurb':
    'Wyróżniające się książki z każdego ostatniego roku. Lista wybrana ręcznie, nie zestawienie sprzedaży — żadne otwarte źródło takiego nie publikuje.',
  'featured.popularHeading': 'Dużo czytane, dużo tłumaczone',
  'featured.popularBlurb': 'Książki istniejące w wielu językach — po to właśnie jest ten serwis.',
  'featured.filling': 'Część z nich wciąż pobieramy w tle. Odśwież stronę za minutę.',
  'featured.freeCopy': 'Dostępna za darmo',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Do czytania za darmo',
  'free.homeBlurb':
    'Książki w domenie publicznej i na otwartych licencjach, które ta instancja udostępnia bezpośrednio.',
  'free.seeAll': 'Zobacz więcej',
  'free.downloadable': 'Pobierz',
  'free.pageTitle': 'Darmowe książki',
  'free.pageBlurb':
    'Każda książka tutaj ma co najmniej jedną legalną darmową kopię: domena publiczna albo zgoda właściciela praw. Bez zakupu i bez karty bibliotecznej.',
  'free.empty':
    'Na razie nie ma tu nic za darmo. Darmowe kopie pojawiają się, gdy ta instancja pobiera książki — poszukaj książki i zajrzyj tu ponownie.',
  'free.emptyForLanguage':
    'Nie ma jeszcze darmowych kopii w języku {language}. Usuń filtr powyżej, aby zobaczyć całą półkę.',
  'free.showMore': 'Pokaż więcej',
  'free.shown': 'Pokazano {shown} z {total}.',
  'free.allLanguages': 'Darmowe kopie we wszystkich językach.',
  'free.filteredByLanguage': 'Tylko darmowe kopie w języku: {language}.',
  'free.filterByLanguage': 'Pokaż tylko darmowe kopie w języku: {language}.',
  'free.dropLanguageFilter': 'pokaż wszystkie języki',
  'free.loadFailed': 'Nie udało się teraz wczytać darmowych książek.',
  'work.original': 'oryginał',
  'work.dataSources': 'Źródła danych',
  'work.about': 'O tej książce',
  'work.translatedInto': 'Przetłumaczona na',
  'work.availableIn': 'Dostępne języki',
  'work.languagesNote':
    'Tylko to, co wymieniają nasze źródła. Brak języka tutaj nie oznacza, że przekładu nie ma.',
  'work.noTranslations': 'Nie znaleziono jeszcze przekładów.',
  'work.yourLanguage.title': 'W twoim języku',
  'work.yourLanguage.yes': 'Istnieje przekład na {language}.',
  'work.yourLanguage.original': 'To jest język oryginału: {language}.',
  'work.yourLanguage.no': 'Brak przekładu na {language} wśród znanych wydań.',
  'work.yourLanguage.show': 'Pokaż wydania: {language}',
  'work.editions': 'Wydania ({shown} z {total})',
  'work.filterLanguage': 'Język',
  'work.filterAllLanguages': 'Wszystkie języki',
  'work.filterYear': 'Rok',
  'work.filterApply': 'Filtruj',
  'work.filterReset': 'Wyczyść',
  'work.noEditionsMatch': 'Żadne wydanie nie pasuje do tych filtrów.',
  'work.showMoreEditions': 'Pokaż więcej wydań (pozostało {remaining})',
  'work.badgeFreeDownload': 'darmowe pobranie',
  'work.freeDownloadFormat': 'Pobierz {format}',
  'work.freeDownloadNote': '{rights}. Za darmo z {provider} — bez konta i bez płatności.',
  'work.badgeReadBorrow': 'czytaj lub wypożycz',
  'work.badgeInBookstores': 'w księgarniach',
  'work.translatedBy': 'przekład: {name}',
  'work.pages': '{count} s.',
  'bookmark.save': 'Zapisz tę książkę',
  'bookmark.saved': 'Zapisano',
  'bookmark.signInToSave': 'Zaloguj się, aby zapisać',
  'bookmark.failed': 'Nie udało się zapisać. Spróbuj ponownie.',
  'links.show': 'Pokaż odnośniki',
  'links.hide': 'Ukryj odnośniki',
  'links.loading': 'Wczytywanie odnośników',
  'links.none': 'Do tego wydania nie ma jeszcze legalnych odnośników.',
  'links.viaOtherEdition': 'bezpłatny egzemplarz z wydania {label}',
  'links.failed': 'Nie udało się wczytać odnośników.',
  'links.storesHeading': 'Znajdź w księgarni',
  'links.storesInCountry': 'W kraju: {country}',
  'links.storesYourCountry': 'Twój kraj',
  'links.storesLanguageMarket': 'Gdzie sprzedaje się książki w języku: {language}',
  'links.storesLanguageMarketGeneric': 'Gdzie sprzedaje się książki w języku tego wydania',
  'links.storesWorldwide': 'Wysyłka na cały świat',
  'links.storesCaption':
    'Każdy odnośnik przeszukuje katalog samej księgarni — dostępność i cenę pokazuje ona sama.',
  'linkType.download': 'Pobierz',
  'linkType.buy': 'Kup',
  'linkType.borrow': 'Wypożycz w bibliotece',
  'linkType.listen': 'Posłuchaj (audiobook)',
  'rights.public_domain': 'Domena publiczna',
  'rights.open_license': 'Otwarta licencja',
  'rights.copyrighted': 'Objęta prawem autorskim',
  'rights.unknown': 'Status nieznany',
  'compare.heading': 'Porównaj wydania',
  'compare.blurb': 'Wybierz dwa lub trzy wydania, aby zobaczyć, czym naprawdę się różnią.',
  'compare.selected': 'Wybrano {count}, potrzeba co najmniej 2.',
  'compare.editSelection': 'Zmień wydania',
  'compare.showAllEditions': 'Pokaż wszystkie wydania ({count})',
  'compare.columnDifference': 'Różnica',
  'compare.identical': 'We wszystkim, co zapisują źródła, te wydania są identyczne.',
  'compare.rowLanguage': 'Język',
  'compare.rowPublished': 'Rok wydania',
  'compare.rowPublisher': 'Wydawnictwo',
  'compare.rowTranslator': 'Tłumacz',
  'compare.rowTranslatedFrom': 'Przekład z języka',
  'compare.rowBinding': 'Oprawa',
  'compare.rowPages': 'Stron',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Bezpłatny lub wypożyczalny egzemplarz',
  'compare.yes': 'tak ({count})',
  'compare.no': 'nie znaleziono',
  'country.label': 'Gdzie kupujesz książki?',
  'country.worldwideOnly': 'Tylko księgarnie wysyłające na cały świat',
  'auth.signInTitle': 'Logowanie',
  'auth.registerTitle': 'Załóż konto',
  'auth.blurb':
    'Konto istnieje z jednego powodu: aby zapisywać znalezione książki i do nich wracać — z językami przekładów, listą wydań i tym, gdzie każde zdobyć legalnie. Bez newslettera, bez profilu, bez śledzenia.',
  'auth.name': 'Imię (opcjonalnie)',
  'auth.email': 'E-mail',
  'auth.password': 'Hasło',
  'auth.passwordHint':
    'Co najmniej {min} znaków. Sprawdzana jest tylko długość — długie zdanie, które zapamiętasz, jest lepsze niż krótkie ze znakami interpunkcyjnymi.',
  'auth.submitSignIn': 'Zaloguj się',
  'auth.submitRegister': 'Załóż konto',
  'auth.working': 'Chwileczkę…',
  'auth.google': 'Kontynuuj z Google',
  'auth.toRegister': 'Nie masz konta? Załóż je',
  'auth.toSignIn': 'Masz już konto? Zaloguj się',
  'auth.backToSearch': 'Wróć do wyszukiwania',
  'auth.errorGoogleState':
    'Ten odnośnik logowania wygasł albo został otwarty w innej przeglądarce. Spróbuj ponownie.',
  'auth.errorGoogleFailed':
    'Logowanie przez Google nie zostało ukończone. Możesz użyć adresu e-mail i hasła.',
  'auth.errorGeneric': 'Coś poszło nie tak.',
  'bookmarks.title': 'Zapisane książki',
  'bookmarks.signedOut':
    ', aby zachować znalezione książki — i później porównywać wydania tej samej książki.',
  'bookmarks.loading': 'Wczytywanie…',
  'bookmarks.empty':
    'Nic jeszcze nie zapisano. Znajdź książkę i użyj „Zapisz tę książkę” na jej karcie.',
  'bookmarks.searchLink': 'Szukaj',
  'bookmarks.remove': 'Usuń',
  'bookmarks.loadFailed': 'Nie udało się wczytać zapisanych książek.',
  'search.failed': 'Wyszukiwanie się nie powiodło.',
  'search.pending': 'Nie ma tego jeszcze w naszej bazie — sprawdzamy źródła',
  'search.pendingLong':
    'Wciąż szukamy: pierwsze zapytanie o książkę zbiera dane ze źródeł, co może potrwać kilka minut',
  'search.notFoundHint': 'Nic nie znaleziono. Spróbuj doprecyzować tytuł lub autora.',
  'search.timedOut':
    'Źródła odpowiadają wolno i nie mamy jeszcze danych. Synchronizacja w tle mogła się już zakończyć — spróbuj ponownie.',
  'search.freeOnlyToggle': 'Dostępne za darmo',
  'search.noFreeResults':
    'Żadna z tych pozycji nie ma jeszcze darmowego pobrania — spróbuj wyłączyć filtr.',
  'home.tagline': 'Znajdź swoje kolejne magnum opus',
  'subject.allLanguages': 'Wszystkie języki.',
  'subject.filteredByLanguage': 'Tylko książki z wydaniem w języku: {language}.',
  'subject.dropLanguageFilter': 'pokaż wszystkie języki',
  'subject.empty':
    'Pod tym tagiem nic jeszcze nie ma. Tagi pochodzą z książek, które ta instancja już pobrała.',
  'featured.year': '{year}',
  'nav.browse': 'Według gatunku',
  'recommend.heading': 'Na podstawie tego, co czytasz',
  'recommend.becauseOf': 'Otworzyłeś „{title}” — oto książki z tych samych gatunków.',
  'recommend.blurb': 'Książki z gatunków, które otwierasz.',
  'recommend.privacy':
    'Liczone jest to w Twojej przeglądarce — serwer poznaje gatunki, nigdy to, kim jesteś.',
  'recommend.forget': 'zapomnij moją historię',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Półka',
  'shelf.title': 'Półka',
  'shelf.intro':
    'Otwarte katalogi i dowolny serwer biblioteczny, który prowadzisz sam. Dodane katalogi zostają w tej przeglądarce i nigdy nie trafiają na tę stronę.',
  'shelf.openCatalogs': 'Otwarte katalogi',
  'shelf.yourCatalogs': 'Twoje katalogi',
  'shelf.addCatalog': 'Dodaj katalog',
  'shelf.name': 'Nazwa',
  'shelf.address': 'Adres OPDS',
  'shelf.username': 'Nazwa użytkownika (opcjonalnie)',
  'shelf.password': 'Hasło (opcjonalnie)',
  'shelf.credentialsNote': 'Adres i dane logowania są przechowywane wyłącznie w tej przeglądarce.',
  'shelf.add': 'Dodaj',
  'shelf.remove': 'Usuń',
  'shelf.loading': 'Wczytywanie katalogu…',
  'shelf.empty': 'Ten katalog nie ma żadnych pozycji.',
  'shelf.noCatalogs':
    'Jeszcze żadnego własnego. Dodaj poniżej adres Calibre-Web, COPS, Kavity lub Audiobookshelf.',
  'shelf.unreachable':
    'Przeglądarka nie mogła odczytać tego katalogu. Serwer w Twojej sieci zadziała; publiczne strony często odrzucają żądania z innych źródeł.',
  'shelf.nextPage': 'Następna strona',
  'shelf.previousPage': 'Poprzednia strona',
  'shelf.drm': 'Wymaga aplikacji z DRM',
  'shelf.notFree': 'To nie jest darmowe pobranie',
  'shelf.download': 'Pobierz',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Księgarnie w pobliżu',
  'stores.useMyLocation': 'Użyj mojej lokalizacji',
  'stores.placeLabel': 'Miasto lub kod pocztowy',
  'stores.find': 'Szukaj',
  'stores.locating': 'Szukanie…',
  'stores.failed': 'Lokalizacja niedostępna. Wpisz miasto lub kod pocztowy.',
  'stores.none': 'W promieniu {radius} km nie ma na mapie żadnej księgarni.',
  'stores.distance': '{distance} km stąd',
  'stores.stockUnknown': 'Tylko dane mapy — nikt nie publikuje, co księgarnia ma na stanie.',
  'stores.lookupFailed':
    'Nie udało się teraz połączyć z OpenStreetMap. Spróbuj ponownie za chwilę.',
  'stores.privacy':
    'Twoja lokalizacja jest zaokrąglana do około 100 m i wysyłana wyłącznie do OpenStreetMap — nigdy na tę stronę.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Ceny i księgarnie',
  'prices.loading': 'Pytamy księgarnie…',
  'prices.unknown': 'Cena nieopublikowana',
  'prices.degraded': 'Brak odpowiedzi od: {providers}',
  'prices.format.hardcover': 'Twarda oprawa',
  'prices.format.paperback': 'Miękka oprawa',
  'prices.format.ebook': 'E-book',
  'prices.format.audiobook': 'Audiobook',
  'prices.format.unknown': 'Nie podano formatu',

  'ratings.edition': '{average} z {outOf}, ocen czytelników: {votes} ({source})',
  'ratings.lowConfidence': 'za mało ocen, by porównywać',
  'ratings.reviews': 'Recenzje',
  'ratings.reviewsOn': 'Recenzje tego wydania w {source}',
  'ratings.noteNoRatings':
    'Żadne otwarte źródło nie ocenia przekładu, a te wydania nie mają tu ocen czytelników.',
  'ratings.noteReviews':
    'Jeśli wydanie jest znane w {sources}, odnośnik prowadzi do recenzji dokładnie tego nakładu — większość nie jest znana.',
  'ratings.translator':
    'Wydania w przekładzie {name}: {average} z {outOf} na podstawie {editions} ocenionych wydań, łącznie {votes} ocen.',
  'ratings.note':
    'To oceny konkretnego wydania wystawione przez czytelników {sources}, a nie ocena samego przekładu — takiej nikt nie publikuje. Wartość mają w zestawieniu: ta sama książka, ten sam język, różni tłumacze — i zawsze z liczbą głosów przed oczami.',
  'ratings.gapWithoutIsbn':
    '{count} wydań nie ma numeru ISBN, więc nie dało się przypisać im oceny.',
  'ratings.gapNotLookedUp': 'Kolejnych {count} wydań nie sprawdzano w tym zapytaniu.',
  'recommend.hideGenre': 'ukryj „{genre}”',
  'recommend.hiddenList': 'Ukryte gatunki (kliknij, aby przywrócić):',

  // --- Wyskakujące okna ustawień ---
  'settings.status.saved': 'Zapisano',
  'settings.status.cleared': 'Wyczyszczono',
  'settings.status.unstored': 'Niezapisane',
  'settings.status.failed': 'Bez zmian',
  'settings.notStored':
    'Ta przeglądarka odmówiła zapisania zmiany, więc nic się nie stało — obowiązuje poprzednia wartość.',
  'settings.language.title': 'Język interfejsu',
  'settings.language.changed':
    'Zmieniono z {from} na {to}. Interfejs przeładowuje się w języku {to}; tytuły książek i nazwiska autorów zostają w swoich językach.',
  'settings.country.title': 'Kraj zakupów',
  'settings.country.changed':
    'Ustawiono: {country}. Linki do księgarń pokazują teraz sklepy dostarczające tam, obok tych światowych.',
  'settings.country.cleared':
    'Nie wybrano kraju. Proponowane będą tylko księgarnie wysyłające na cały świat.',
  'settings.bookLanguage.title': 'Język książek',
  'settings.bookLanguage.changed':
    'Ustawiono: {language}. Strony gatunków pokażą najpierw książki z wydaniem w języku {language}, dopóki nie wyczyścisz filtra.',
  'settings.bookLanguage.cleared':
    'Wyczyszczono. Strony gatunków znów pokazują książki we wszystkich językach.',
  'settings.hiddenGenres.title': 'Ukryte gatunki',
  'settings.hiddenGenres.hidden':
    'Gatunek „{genre}” jest ukryty. Nie jest już wysyłany na serwer przy pobieraniu propozycji; ukrytych gatunków jest łącznie {count}.',
  'settings.hiddenGenres.restored':
    'Gatunek „{genre}” wrócił do propozycji. Ukrytych pozostaje {count} gatunków.',
  'settings.history.title': 'Historia czytania',
  'settings.history.cleared':
    'Otwierane przez Ciebie książki zostały usunięte z tej przeglądarki. Propozycje wrócą dopiero po otwarciu kolejnej książki.',
  'settings.bookmarks.title': 'Zapisane książki',
  'settings.bookmarks.added': 'Pozycja „{title}” trafiła do zapisanych książek.',
  'settings.bookmarks.removed': 'Pozycja „{title}” została usunięta z zapisanych książek.',
  'settings.bookmarks.failed':
    'Serwer nie przyjął zmiany, więc lista zapisanych książek pozostała bez zmian.',
  'settings.catalogs.title': 'Twoje katalogi',
  'settings.catalogs.added':
    'Katalog „{name}” dodano pod adresem {url}. Adres zostaje w tej przeglądarce i nigdy nie trafia na tę stronę.',
  'settings.catalogs.addedWithCredentials':
    'Katalog „{name}” dodano pod adresem {url}, wraz z wpisaną nazwą użytkownika i hasłem. Wszystko to zostaje w tej przeglądarce i nic nie trafia na tę stronę.',
  'settings.catalogs.removed':
    'Katalog „{name}” usunięto z tej przeglądarki wraz z zapisanymi dla niego danymi logowania.',
  'settings.catalogs.rejected': 'Nic nie dodano: {reason}',
  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Dodatki',
  'addons.title': 'Dodatki',
  'addons.intro':
    'Dodatek wnosi własne źródła. Instalujesz go, wklejając adres; działa albo na twoim urządzeniu, w piaskownicy, albo na serwerze swojego autora. Golden Library żadnych nie dostarcza, nie prowadzi ich listy i nie sprawdza, co zwracają.',
  'addons.addressLabel': 'Adres dodatku',
  'addons.addressHint': 'Adres manifestu, który podał autor dodatku.',
  'addons.continue': 'Dalej',
  'addons.fromServer': 'Z serwera',
  'addons.fromFile': 'Z pliku, na twoim urządzeniu',
  'addons.bundleLabel': 'Adres kodu dodatku',
  'addons.bundleHint': 'Adres kodu dodatku. Będzie działał na tym urządzeniu, nie na serwerze.',
  'addons.integrityLabel': 'Skrót integralności',
  'addons.integrityHint':
    'Podaje go autor, w postaci sha256-… . Wymagany: bez niego raz zatwierdzony kod mógłby się potem zmienić, a ty byś o tym nie wiedział.',
  'addons.checking': 'Czytam dodatek…',
  'addons.installedHeading': 'Zainstalowane',
  'addons.none': 'Na razie brak dodatków. Wszystko, co tu widzisz, pochodzi od samej instancji.',
  'addons.priorityHint': 'Kolejność to priorytet: pierwszy dodatek odpowiada pierwszy.',
  'addons.enable': 'Włącz',
  'addons.disable': 'Wyłącz',
  'addons.off': 'Wyłączony',
  'addons.remove': 'Usuń',
  'addons.moveUp': 'W górę',
  'addons.moveDown': 'W dół',
  'addons.configure': 'Skonfiguruj',
  'addons.failedToStart': '„{name}” nie uruchomił się: {reason}',
  'addons.consentTitle': 'Zainstalować „{name}”?',
  'addons.consentHosts': 'Będzie się łączyć z: {hosts}',
  'addons.consentNoHosts': 'Nie poprosił o połączenie z niczym.',
  'addons.consentSeesYou':
    'Ten dodatek działa na serwerze swojego autora. Zobaczy on twój adres i wszystko, czego przez niego szukasz.',
  'addons.consentSandboxed':
    'Ten dodatek działa na twoim urządzeniu, w piaskownicy. Nie może odczytać twoich ciasteczek, danych tej strony ani niczego innego, co masz otwarte.',
  'addons.consentNotVetted':
    'Golden Library nie sprawdza, co zwraca dodatek, i nie poleciła tego. To, co instalujesz, jest twoim wyborem.',
  'addons.install': 'Zainstaluj',
  'addons.cancel': 'Anuluj',
  'addons.via': 'przez {name}',
  'addons.sourcesTitle': 'Z twoich dodatków',
  'addons.searchTitle': 'Znalezione przez twoje dodatki',
  'addons.showLinks': 'Pokaż linki do pobrania',
  'addons.unreadable': 'Nie udało się odczytać {count} pozycji z tego dodatku.',
  'addons.browse': 'Przeglądaj katalog',
  'addons.browseTitle': 'Katalog „{name}”',
  'addons.browseNoCatalog': 'Ten dodatek nie udostępnia katalogu do przeglądania.',
  'addons.browseEmpty': 'Katalog tego dodatku jest obecnie pusty.',
  'addons.browseFailed': 'Nie udało się wczytać katalogu „{name}”: {reason}',
  'addons.loadMore': 'Pokaż więcej',
  'addons.notInstalled': 'Ten dodatek nie jest zainstalowany.',

  'settings.addons.title': 'Twoje dodatki',
  'settings.addons.installed':
    '„{name}” jest zainstalowany. Będzie pytany razem z pozostałymi i może łączyć się z {hosts}.',
  'settings.addons.removed':
    '„{name}” został usunięty. Jego wyniki zniknęły z tej przeglądarki, razem ze wszystkim, co tu przechowywał.',
  'settings.addons.enabled': '„{name}” jest znowu włączony i będzie pytany z pozostałymi.',
  'settings.addons.disabled':
    '„{name}” jest wyłączony. Pozostaje zainstalowany wraz z ustawieniami, ale nic z tego, co zwraca, nie zostanie pokazane.',
  'settings.addons.reordered': '„{name}” odpowiada teraz jako {position} z {total}.',
  'settings.addons.rejected': 'Nic nie zainstalowano: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Własne źródła',
  'customSources.title': 'Własne źródła',
  'customSources.intro':
    'Dodaj własny sklep lub katalog, nadając mu nazwę i adres URL wyszukiwania z {isbn}, {query}, {title}, {author} lub {language}. Link jest budowany na tym urządzeniu, a ta strona nigdy go nie pobiera.',
  'customSources.nameLabel': 'Nazwa',
  'customSources.templateLabel': 'Szablon adresu URL',
  'customSources.templateHint':
    'Bezwzględny adres https://. {isbn}, {query}, {title}, {author} i {language} są uzupełniane danymi wydania; jeśli jakiś symbol zastępczy zostanie pusty, link dla tego wydania jest pomijany.',
  'customSources.add': 'Dodaj źródło',
  'customSources.listHeading': 'Twoje źródła',
  'customSources.none': 'Brak własnych źródeł.',
  'customSources.off': 'Wyłączone',
  'customSources.enable': 'Włącz',
  'customSources.disable': 'Wyłącz',
  'customSources.remove': 'Usuń',
  'customSources.heading': 'Twoje źródła',
  'customSources.caption':
    'Linki, które sam skonfigurowałeś. Ta instancja nie sprawdza, dokąd prowadzą.',

  'settings.customSources.title': 'Twoje własne źródła',
  'settings.customSources.added':
    '„{name}” zostało dodane i będzie proponowane razem z pozostałymi.',
  'settings.customSources.removed': '„{name}” zostało usunięte z tej przeglądarki.',
  'settings.customSources.enabled': '„{name}” jest znów włączone.',
  'settings.customSources.disabled':
    '„{name}” jest wyłączone. Pozostaje skonfigurowane, ale jego link nie będzie wyświetlany.',
  'settings.customSources.rejected': 'Nic nie dodano: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Książki w Twoim języku',
  'featured.inLanguageBlurb':
    'Książki napisane w języku, w którym czytasz tę stronę; najpierw najczęściej wznawiane — to kolejność samej Open Library, a nie lista bestsellerów.',
  'work.newSearch': 'Nowe wyszukiwanie',
  'work.descriptionFrom': 'Opis:',
  'work.descriptionNotLocalized':
    'Ten opis jest w języku, w którym napisało go źródło — w Twoim języku dla tej książki jeszcze go nie ma.',
};
