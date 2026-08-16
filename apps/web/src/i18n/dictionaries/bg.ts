import type { Dictionary } from '../dictionary';

export const bg: Dictionary = {
  'nav.savedBooks': 'Запазени книги',
  'nav.signIn': 'Вход',
  'nav.signOut': 'Изход',
  'nav.language': 'Език',
  'nav.skipToContent': 'Към съдържанието',
  'footer.legal':
    'Само законни източници: пряко изтегляне единствено за произведения в обществено достояние и с отворени лицензи; книгите под авторско право — покупка или заемане от библиотека. Всяка връзка носи изричен статут на правата.',
  'footer.openSource': 'Отворен код',
  'footer.openSourceRest': '— лиценз MIT, може да се хоства самостоятелно. Кодът е в GitHub.',
  'home.title': 'Golden Library',
  'home.subtitle': 'Отворен агрегатор на книжни преводи: езици, издания и законни източници.',
  'home.searchLabel': 'Заглавие и автор',
  'home.searchPlaceholder': 'Война и мир Толстой',
  'home.searchButton': 'Търсене',
  'search.searching': 'Търсим…',
  'search.backfilling':
    'Тук още няма нищо — извличаме книгата от източниците. Отнема няколко секунди.',
  'search.notFound': 'Нищо не бе намерено по това запитване.',
  'search.retry': 'Опитайте отново',
  'search.signInPrompt':
    'за да запазвате книгите, които намирате тук, и да се връщате към тях — и да сравнявате едно до друго издания от различни години, преди да изберете.',
  'featured.yearHeading': 'Книги на годината',
  'featured.yearBlurb':
    'Забележителни книги от всяка от последните години. Ръчно подбран списък, а не класация по продажби — такава не публикува нито един отворен източник.',
  'featured.popularHeading': 'Много четени, много превеждани',
  'featured.popularBlurb': 'Книги, които съществуват на много езици — точно затова е този сайт.',
  'featured.filling':
    'Няколко от тях още се извличат във фонов режим. Презаредете след минута, за да видите останалите.',
  'featured.freeCopy': 'Безплатно копие',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Безплатно за четене веднага',
  'free.homeBlurb':
    'Книги в обществено достояние и с отворен лиценз, които това копие на сайта може да ви даде директно.',
  'free.seeAll': 'Вижте още',
  'free.downloadable': 'Изтегляне',
  'free.pageTitle': 'Безплатни книги',
  'free.pageBlurb':
    'Всяка книга тук има поне едно законно безплатно копие — обществено достояние или подарено от притежателя на правата. Без покупка, без читателска карта.',
  'free.empty':
    'Тук още няма нищо безплатно. Безплатните копия се появяват, докато този екземпляр извлича книги, така че потърсете някоя и се върнете.',
  'free.emptyForLanguage':
    'Още няма безплатни копия на {language}. Махнете филтъра по-горе, за да видите целия рафт.',
  'free.showMore': 'Покажи още',
  'free.shown': 'Показани {shown} от {total}.',
  'free.allLanguages': 'Безплатни копия на всички езици.',
  'free.filteredByLanguage': 'Само безплатни копия на {language}.',
  'free.filterByLanguage': 'Покажи само безплатните копия на {language}.',
  'free.dropLanguageFilter': 'покажи всички езици',
  'free.loadFailed': 'Безплатните книги не можаха да бъдат заредени в момента.',
  'work.original': 'оригинал',
  'work.dataSources': 'Източници на данни',
  'work.about': 'За тази книга',
  'work.translatedInto': 'Преведена на',
  'work.availableIn': 'Налична на',
  'work.languagesNote':
    'Само това, което изброяват четените от нас източници — превод, който липсва тук, все пак може да съществува.',
  'work.noTranslations': 'Още не са намерени преводи.',
  'work.yourLanguage.title': 'На вашия език',
  'work.yourLanguage.yes': 'Има превод на {language}.',
  'work.yourLanguage.original': 'Тази книга е написана на {language}.',
  'work.yourLanguage.no': 'Няма превод на {language} сред известните тук издания.',
  'work.yourLanguage.show': 'Покажи изданията на {language}',
  'work.editions': 'Издания ({shown} от {total})',
  'work.filterLanguage': 'Език',
  'work.filterAllLanguages': 'Всички езици',
  'work.filterYear': 'Година',
  'work.filterApply': 'Филтрирай',
  'work.filterReset': 'Изчисти',
  'work.noEditionsMatch': 'Няма издания, отговарящи на тези филтри.',
  'work.showMoreEditions': 'Покажи още издания (остават {remaining})',
  'work.badgeFreeDownload': 'безплатно изтегляне',
  'work.freeDownloadFormat': 'Изтегли {format}',
  'work.freeDownloadNote': '{rights}. Безплатно от {provider} — без акаунт, без плащане.',
  'work.badgeReadBorrow': 'четене или заемане',
  'work.badgeInBookstores': 'в книжарниците',
  'work.translatedBy': 'превод: {name}',
  'work.pages': '{count} стр.',
  'bookmark.save': 'Запази тази книга',
  'bookmark.saved': 'Запазена',
  'bookmark.signInToSave': 'Влезте, за да запазите',
  'bookmark.failed': 'Запазването не успя. Опитайте отново.',
  'links.show': 'Покажи връзките',
  'links.hide': 'Скрий връзките',
  'links.loading': 'Зареждане на връзките',
  'links.none': 'За това издание още няма законни връзки.',
  'links.viaOtherEdition': 'безплатно копие от изданието {label}',
  'links.failed': 'Връзките не можаха да бъдат заредени.',
  'links.storesHeading': 'Намерете в книжарница',
  'links.storesInCountry': 'В {country}',
  'links.storesYourCountry': 'вашата страна',
  'links.storesLanguageMarket': 'Където се продават книги на {language}',
  'links.storesLanguageMarketGeneric': 'Където се продава езикът на това издание',
  'links.storesWorldwide': 'Доставя по целия свят',
  'links.storesCaption':
    'Всяка връзка търси в собствения каталог на магазина — наличността и цената показва самият магазин.',
  'linkType.download': 'Изтегляне',
  'linkType.buy': 'Купуване',
  'linkType.borrow': 'Заемане от библиотека',
  'linkType.listen': 'Слушане (аудиокнига)',
  'rights.public_domain': 'Обществено достояние',
  'rights.open_license': 'Отворен лиценз',
  'rights.copyrighted': 'Под авторско право',
  'rights.unknown': 'Неизвестен статут',
  'compare.heading': 'Сравнете изданията',
  'compare.blurb': 'Изберете две или три издания, за да видите какво наистина ги различава.',
  'compare.selected': 'Избрани {count} от поне 2.',
  'compare.editSelection': 'Смени изданията',
  'compare.showAllEditions': 'Покажи всички {count} издания',
  'compare.columnDifference': 'Разлика',
  'compare.identical': 'Във всичко, което източниците записват, тези издания са еднакви.',
  'compare.rowLanguage': 'Език',
  'compare.rowPublished': 'Издадена',
  'compare.rowPublisher': 'Издателство',
  'compare.rowTranslator': 'Преводач',
  'compare.rowTranslatedFrom': 'Преведена от',
  'compare.rowBinding': 'Подвързия',
  'compare.rowPages': 'Страници',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Безплатно или заемно копие',
  'compare.yes': 'да ({count})',
  'compare.no': 'не е намерено',
  'country.label': 'Откъде купувате книги?',
  'country.worldwideOnly': 'Само магазини с доставка по целия свят',
  'auth.signInTitle': 'Вход',
  'auth.registerTitle': 'Създаване на акаунт',
  'auth.blurb':
    'Акаунтът съществува по една причина: да запазвате книгите, които намирате, и да се връщате към тях — с езиците, на които са преведени, съществуващите издания и къде да получите всяко законно. Без бюлетин, без профил, без проследяване.',
  'auth.name': 'Име (по избор)',
  'auth.email': 'Имейл',
  'auth.password': 'Парола',
  'auth.passwordHint':
    'Поне {min} знака. Проверява се само дължината — дълга фраза, която помните, е по-добра от кратка с препинателни знаци.',
  'auth.submitSignIn': 'Вход',
  'auth.submitRegister': 'Създай акаунт',
  'auth.working': 'Работим…',
  'auth.google': 'Продължи с Google',
  'auth.toRegister': 'Още нямате акаунт? Създайте си',
  'auth.toSignIn': 'Вече имате акаунт? Влезте',
  'auth.backToSearch': 'Обратно към търсенето',
  'auth.errorGoogleState':
    'Тази връзка за вход е изтекла или е отворена в друг браузър. Опитайте отново.',
  'auth.errorGoogleFailed':
    'Входът с Google не завърши. Вместо това можете да използвате имейл и парола.',
  'auth.errorGeneric': 'Нещо се обърка.',
  'bookmarks.title': 'Запазени книги',
  'bookmarks.signedOut':
    'за да запазите книгите, които намирате — и по-късно да сравните едно до друго издания на една и съща книга.',
  'bookmarks.loading': 'Зареждане…',
  'bookmarks.empty':
    'Още нищо не е запазено. Намерете книга и използвайте „Запази тази книга“ на нейната карта.',
  'bookmarks.searchLink': 'Търсене',
  'bookmarks.remove': 'Премахни',
  'bookmarks.loadFailed': 'Запазените ви книги не можаха да бъдат заредени.',
  'search.failed': 'Търсенето не успя.',
  'search.pending': 'Още не е в нашата база — проверяваме източниците',
  'search.pendingLong':
    'Още търсим: първата заявка за книга събира данни от източниците, което може да отнеме до няколко минути',
  'search.notFoundHint': 'Нищо не бе намерено. Опитайте да уточните заглавието или автора.',
  'search.timedOut':
    'Източниците отговарят бавно и още нямаме данни. Фоновата синхронизация може вече да е приключила — опитайте отново.',
  'search.freeOnlyToggle': 'Безплатно за изтегляне',
  'search.noFreeResults':
    'Никоя от тях още няма безплатно изтегляне — опитайте да изключите филтъра.',
  'home.tagline': 'Намерете следващия си magnum opus',
  'subject.allLanguages': 'Всички езици.',
  'subject.filteredByLanguage': 'Само книги с издание на {language}.',
  'subject.dropLanguageFilter': 'покажи всички езици',
  'subject.empty':
    'Под този етикет още няма нищо. Етикетите идват от книгите, които този екземпляр вече е извлякъл.',
  'featured.year': '{year}',
  'nav.browse': 'Разглеждане по жанр',
  'recommend.heading': 'Според това, което сте чели',
  'recommend.becauseOf': 'Отворихте „{title}“, ето книги от същите жанрове.',
  'recommend.blurb': 'Книги от жанровете, които отваряте.',
  'recommend.privacy':
    'Това се изчислява във вашия браузър — сървърът научава жанровете, никога кой сте.',
  'recommend.forget': 'забрави историята ми',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Рафт',
  'shelf.title': 'Рафт',
  'shelf.intro':
    'Отворени каталози и всеки библиотечен сървър, който поддържате сами. Каталозите, които добавяте, остават в този браузър и никога не се изпращат към този сайт.',
  'shelf.openCatalogs': 'Отворени каталози',
  'shelf.yourCatalogs': 'Вашите каталози',
  'shelf.addCatalog': 'Добавяне на каталог',
  'shelf.name': 'Име',
  'shelf.address': 'Адрес OPDS',
  'shelf.username': 'Потребителско име (по избор)',
  'shelf.password': 'Парола (по избор)',
  'shelf.credentialsNote': 'Адресът и евентуалните данни за достъп се пазят само в този браузър.',
  'shelf.add': 'Добави',
  'shelf.remove': 'Премахни',
  'shelf.loading': 'Зареждане на каталога…',
  'shelf.empty': 'Този каталог няма записи.',
  'shelf.noCatalogs':
    'Още нямате свой. Добавете по-долу адрес на Calibre-Web, COPS, Kavita или Audiobookshelf.',
  'shelf.unreachable':
    'Браузърът ви не можа да прочете този каталог. Сървър в собствената ви мрежа ще работи; публичните сайтове често отказват заявки от друг източник.',
  'shelf.nextPage': 'Следваща страница',
  'shelf.previousPage': 'Предишна страница',
  'shelf.drm': 'Нужно е приложение с DRM',
  'shelf.notFree': 'Не е безплатно изтегляне',
  'shelf.download': 'Изтегляне',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Книжарници наблизо',
  'stores.useMyLocation': 'Използвай моето местоположение',
  'stores.placeLabel': 'Град или пощенски код',
  'stores.find': 'Намери',
  'stores.locating': 'Търсим…',
  'stores.failed': 'Местоположението не е достъпно. Въведете вместо това град или пощенски код.',
  'stores.none': 'В радиус от {radius} км няма нанесени книжарници.',
  'stores.distance': 'на {distance} км',
  'stores.stockUnknown':
    'Само картни данни — никой не публикува какво има един магазин в наличност.',
  'stores.lookupFailed': 'OpenStreetMap не отговори в момента. Опитайте отново след малко.',
  'stores.privacy':
    'Местоположението ви се закръгля до около 100 м и се изпраща само към OpenStreetMap — никога към този сайт.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Цени и магазини',
  'prices.loading': 'Питаме магазините…',
  'prices.unknown': 'Цената не е публикувана',
  'prices.degraded': 'Няма отговор от: {providers}',
  'prices.format.hardcover': 'Твърди корици',
  'prices.format.paperback': 'Меки корици',
  'prices.format.ebook': 'Електронна книга',
  'prices.format.audiobook': 'Аудиокнига',
  'prices.format.unknown': 'Форматът не е посочен',
  'recommend.hideGenre': 'скрий „{genre}“',
  'recommend.hiddenList': 'Скрити жанрове (щракнете, за да върнете някой):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Запазено',
  'settings.status.cleared': 'Изчистено',
  'settings.status.unstored': 'Не е запазено',
  'settings.status.failed': 'Без промяна',
  'settings.notStored':
    'Този браузър отказа да запази промяната, така че нищо не се случи — важи предишната стойност.',
  'settings.language.title': 'Език на интерфейса',
  'settings.language.changed':
    'Променен от {from} на {to}. Интерфейсът се презарежда на {to}; заглавията на книгите и имената на авторите остават на своите езици.',
  'settings.country.title': 'Държава за покупки',
  'settings.country.changed':
    'Зададена: {country}. Връзките към книжарници вече предлагат магазини, които доставят там, наред с международните.',
  'settings.country.cleared':
    'Не е избрана държава. Ще се предлагат само книжарници с доставка по целия свят.',
  'settings.bookLanguage.title': 'Език на книгите',
  'settings.bookLanguage.changed':
    'Зададен: {language}. Страниците по жанр ще извеждат напред книги с издание на {language}, докато не изчистите филтъра.',
  'settings.bookLanguage.cleared':
    'Изчистено. Страниците по жанр отново показват книги на всички езици.',
  'settings.hiddenGenres.title': 'Скрити жанрове',
  'settings.hiddenGenres.hidden':
    'Жанрът „{genre}“ е скрит. Вече не се изпраща на сървъра при извличане на предложения, а общо са скрити {count} жанра.',
  'settings.hiddenGenres.restored':
    'Жанрът „{genre}“ се върна в предложенията ви. Скрити остават {count} жанра.',
  'settings.history.title': 'История на четенето',
  'settings.history.cleared':
    'Книгите, които сте отваряли, са изтрити от този браузър. Предложенията остават настрана, докато не отворите друга книга.',
  'settings.bookmarks.title': 'Запазени книги',
  'settings.bookmarks.added': '„{title}“ бе добавена към запазените ви книги.',
  'settings.bookmarks.removed': '„{title}“ бе премахната от запазените ви книги.',
  'settings.bookmarks.failed':
    'Сървърът не прие промяната, така че запазените ви книги останаха каквито бяха.',
  'settings.catalogs.title': 'Вашите каталози',
  'settings.catalogs.added':
    '„{name}“ бе добавен на {url}. Адресът остава в този браузър и никога не се изпраща към този сайт.',
  'settings.catalogs.addedWithCredentials':
    '„{name}“ бе добавен на {url}, с потребителското име и паролата, които въведохте. Всичко остава в този браузър и нищо от него не се изпраща към този сайт.',
  'settings.catalogs.removed':
    '„{name}“ бе премахнат от този браузър заедно с всички запазени за него данни за достъп.',
  'settings.catalogs.rejected': 'Нищо не бе добавено: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Добавки',
  'addons.title': 'Добавки',
  'addons.intro':
    'Добавката носи собствени източници. Инсталирате я, като поставите нейния адрес; тя работи или на вашето устройство, в пясъчник, или на сървъра на своя автор. Golden Library не доставя нито една, не изброява нито една и не проверява какво връщат.',
  'addons.addressLabel': 'Адрес на добавката',
  'addons.addressHint': 'Адресът на манифеста, който ви е дал авторът на добавката.',
  'addons.continue': 'Напред',
  'addons.fromServer': 'От сървър',
  'addons.fromFile': 'От файл на вашето устройство',
  'addons.bundleLabel': 'Адрес на кода на добавката',
  'addons.bundleHint':
    'Адресът на кода на добавката. Ще се изпълни на това устройство, не на сървър.',
  'addons.integrityLabel': 'Контролна сума',
  'addons.integrityHint':
    'Дава я авторът на добавката, във вида sha256-… . Задължителна е: без нея веднъж одобреният код би могъл да се промени по-късно, а вие никога да не разберете.',
  'addons.checking': 'Четем добавката…',
  'addons.installedHeading': 'Инсталирани',
  'addons.none': 'Още няма добавки. Всичко на този сайт досега идва от самия екземпляр.',
  'addons.priorityHint': 'Редът е приоритет: първата добавка отговаря първа.',
  'addons.enable': 'Включи',
  'addons.disable': 'Изключи',
  'addons.off': 'Изключена',
  'addons.remove': 'Премахни',
  'addons.moveUp': 'Нагоре',
  'addons.moveDown': 'Надолу',
  'addons.configure': 'Настрой',
  'addons.failedToStart': '„{name}“ не се стартира: {reason}',
  'addons.consentTitle': 'Да се инсталира ли „{name}“?',
  'addons.consentHosts': 'Ще се свързва с: {hosts}',
  'addons.consentNoHosts': 'Не е поискала връзка с нищо.',
  'addons.consentSeesYou':
    'Тази добавка работи на сървъра на своя автор. Той ще вижда вашия адрес и всичко, което търсите чрез нея.',
  'addons.consentSandboxed':
    'Тази добавка работи на вашето устройство, в пясъчник. Тя не може да чете вашите бисквитки, данните на този сайт или каквото и да е друго, което сте отворили.',
  'addons.consentNotVetted':
    'Golden Library не проверява какво връща една добавка и не е препоръчала тази. Какво инсталирате е ваш избор.',
  'addons.install': 'Инсталирай',
  'addons.cancel': 'Отказ',
  'addons.via': 'чрез {name}',
  'addons.sourcesTitle': 'От вашите добавки',
  'addons.searchTitle': 'Намерено от вашите добавки',
  'addons.showLinks': 'Покажи връзките за изтегляне',
  'addons.unreadable': '{count} записа от тази добавка не можаха да бъдат прочетени.',
  'addons.browse': 'Разгледай каталога',
  'addons.browseTitle': 'Каталогът на {name}',
  'addons.browseNoCatalog': 'Тази добавка не предлага каталог за разглеждане.',
  'addons.browseEmpty': 'Каталогът на тази добавка в момента е празен.',
  'addons.browseFailed': 'Каталогът на „{name}“ не можа да бъде зареден: {reason}',
  'addons.loadMore': 'Зареди още',
  'addons.notInstalled': 'Тази добавка не е инсталирана.',

  'settings.addons.title': 'Вашите добавки',
  'settings.addons.installed':
    '„{name}“ е инсталирана. Ще бъде питана наред с останалите и може да се свързва с {hosts}.',
  'settings.addons.removed':
    '„{name}“ бе премахната. Резултатите ѝ ги няма в този браузър, както и всичко, което бе запазила тук.',
  'settings.addons.enabled': '„{name}“ отново е включена и ще бъде питана наред с останалите.',
  'settings.addons.disabled':
    '„{name}“ е изключена. Остава инсталирана с настройките си, но нищо от това, което връща, няма да се показва.',
  'settings.addons.reordered': '„{name}“ вече отговаря {position}-а от {total}.',
  'settings.addons.rejected': 'Нищо не бе инсталирано: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Собствени източници',
  'customSources.title': 'Собствени източници',
  'customSources.intro':
    'Добавете свой магазин или каталог, като му дадете име и адрес за търсене с {isbn}, {query}, {title}, {author} или {language} в него. Връзката се сглобява на това устройство и този сайт никога не я отваря.',
  'customSources.nameLabel': 'Име',
  'customSources.templateLabel': 'Шаблон за адрес',
  'customSources.templateHint':
    'Абсолютен адрес https://. {isbn}, {query}, {title}, {author} и {language} се попълват от изданието; заместител, останал празен, означава, че връзката се пропуска за това издание.',
  'customSources.add': 'Добави източник',
  'customSources.listHeading': 'Вашите източници',
  'customSources.none': 'Още няма собствени източници.',
  'customSources.off': 'Изключен',
  'customSources.enable': 'Включи',
  'customSources.disable': 'Изключи',
  'customSources.remove': 'Премахни',
  'customSources.heading': 'Вашите източници',
  'customSources.caption':
    'Връзки, които сте настроили сами. Този екземпляр не проверява накъде водят.',

  'settings.customSources.title': 'Вашите собствени източници',
  'settings.customSources.added': '„{name}“ бе добавен и ще се предлага наред с останалите.',
  'settings.customSources.removed': '„{name}“ бе премахнат от този браузър.',
  'settings.customSources.enabled': '„{name}“ отново е включен.',
  'settings.customSources.disabled':
    '„{name}“ е изключен. Остава настроен, но връзката му няма да се показва.',
  'settings.customSources.rejected': 'Нищо не бе добавено: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Книги на вашия език',
  'featured.inLanguageBlurb':
    'Книги, написани на езика, на който четете този сайт, като най-издаваните са първи — това е подредбата на самата Open Library, а не класация на бестселъри.',
  'work.newSearch': 'Ново търсене',
  'work.descriptionFrom': 'Описание:',
  'work.descriptionNotLocalized':
    'Това описание е на езика, на който източникът го е написал — на вашия език за тази книга още няма.',

  // Reader ratings of an edition, never of a translation — see TranslationRatings.tsx.
  'ratings.edition': '{average} от {outOf} от {votes} читатели в {source}',
  'ratings.lowConfidence': 'твърде малко гласове за сравнение',
  'ratings.reviews': 'Отзиви',
  'ratings.reviewsOn': 'Отзиви за това издание в {source}',
  'ratings.noteNoRatings':
    'Никой отворен източник не оценява превод, а нито едно от тези издания няма тук читателска оценка.',
  'ratings.noteReviews':
    'Там, където изданието е познато в {sources}, връзката води към отзивите точно за този тираж — повечето издания не са познати.',
  'ratings.translator':
    'Издания в превод на {name}: {average} от {outOf} по {editions} оценени издания, общо {votes} читатели.',
  'ratings.note':
    'Това са оценки на читателите за конкретно издание в {sources}, а не преценка за самия превод — такава никой не публикува. Струва си да се четат едно до друго: същата книга, същият език, различни преводачи, и винаги с броя гласове пред очите.',
  'ratings.gapWithoutIsbn':
    '{count} издания тук нямат ISBN, затова към тях не можа да се съотнесе оценка.',
  'ratings.gapNotLookedUp': 'Още {count} издания не бяха проверени при тази заявка.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Четете в браузъра си',
  'reader.privacy':
    'Браузърът ви отваря тази книга сам. Файлът, мястото, откъдето идва, и докъде сте стигнали никога не достигат до този сайт.',
  'reader.chooseFile': 'Отворете книга от това устройство',
  'reader.formats': 'EPUB, FB2, MOBI и CBZ.',
  'reader.loading': 'Отваряне…',
  'reader.failed': 'Тази книга не можа да бъде отворена: {reason}',
  'reader.previous': 'Предишна страница',
  'reader.next': 'Следваща страница',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…или пуснете книга тук',
  'reader.fetching': 'Файлът се иска от {host}…',
  'reader.blockedTitle': '{host} не предаде файла на тази страница',
  'reader.blockedBody':
    'Или е недостъпен, или не позволява на други сайтове да четат файловете му. Този сайт няма да го изтегли вместо вас: книгата ви никога не минава през него, а точно в това е смисълът да четете тук.',
  'reader.blockedDownload': 'Изтеглете я от {host}',
  'reader.blockedOpenHere': 'и после я отворете тук от устройството си',
  'reader.blockedAddon': 'Работи и добавка, която сама предоставя файла.',
  'reader.keepFile': 'Запази тази книга в този браузър',
  'reader.keepFileHint':
    'По подразбиране изключено. Без него файлът изчезва, щом затворите раздела; с него остава само на това устройство.',
  'reader.library': 'Запазени в този браузър',
  'reader.libraryEmpty':
    'Още нищо не е запазено. Книгите, които запазвате, остават на това устройство и никога не се качват никъде.',
  'reader.libraryOpen': 'Отвори',
  'reader.libraryRemove': 'Премахни',
  'reader.libraryFileKept': 'файлът е запазен',
  'reader.libraryFileGone': 'файлът не е запазен',
  'reader.untitled': 'Книга без заглавие',
  'settings.reader.libraryTitle': 'Книги, запазени в този браузър',
  'settings.reader.kept':
    '„{title}“ вече се пази на това устройство, така че се отваря без ново изтегляне. Никъде не се качва.',
  'settings.reader.forgotten':
    'Файлът на „{title}“ бе изтрит от този браузър. Записът остава в списъка, за да можете да я отворите отново от нейния източник.',
  'settings.reader.removed': '„{title}“ бе премахната напълно от този браузър — файлът и записът.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Отворена оттам, докъдето стигнахте — на {percent}%.',
  'reader.bookmarks': 'Отметки',
  'reader.bookmarkAdd': 'Отметни тази страница',
  'reader.bookmarkNone': 'В тази книга още няма отметки.',
  'reader.bookmarkGo': 'Към',
  'reader.bookmarkRemove': 'Премахни отметката',
  'reader.bookmarkNote': 'Бележка',
  'reader.bookmarkNotePlaceholder': 'Вашите думи за тази страница',
  'reader.bookmarkAt': 'на {percent}%',
  'settings.reader.bookmarkTitle': 'Отметки в този браузър',
  'settings.reader.bookmarkAdded':
    'Отметка на {percent}% от „{title}“. Отметките остават на това устройство заедно с книгата.',
  'settings.reader.bookmarkRemoved': 'Онази отметка в „{title}“ бе премахната от този браузър.',
  'settings.reader.noteSaved':
    'Бележката ви на тази страница от „{title}“ бе запазена на това устройство.',
  'settings.reader.positionTitle': 'Място в четенето',
  'settings.reader.positionUnstored':
    'Този браузър отказа да запази докъде сте в „{title}“, затова следващия път ще се отвори отначало. Същото правят режимът инкогнито и пълният диск.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': 'Как изглежда тази книга',
  'reader.theme': 'Цветове',
  'reader.themeApp': 'Като сайта',
  'reader.themeLight': 'Хартия',
  'reader.themeDark': 'Мастило',
  'reader.themeSepia': 'Сепия',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint':
    'Чисто черно върху бяло, без анимация, една колона — за екрани с електронна хартия.',
  'reader.fontSize': 'Размер на буквите',
  'reader.smaller': 'По-малко',
  'reader.larger': 'По-голямо',
  'reader.lineHeight': 'Междуредие',
  'reader.margin': 'Полета',
  'reader.flow': 'Страници',
  'reader.flowPaged': 'Прелистване',
  'reader.flowScrolled': 'Превъртане',
  'reader.justify': 'Двустранно подравняване',
  'reader.hyphenate': 'Пренасяне на думи',
  'reader.displayReset': 'Обратно към стандартните',
  'settings.reader.displayTitle': 'Изглед при четене',
  'settings.reader.displayChanged':
    '{setting} вече е {value}. Важи за всяка книга, която отваряте в този браузър.',
  'settings.reader.displayReset':
    'Изгледът при четене се върна към стандартния за всяка книга в този браузър.',
  'reader.on': 'Включено',
  'reader.off': 'Изключено',
  'reader.openHere': 'Четете в браузъра си',
  'reader.notAFileTitle': '{host} изпрати уебстраница, а не файла',
  'reader.notAFileBody':
    'Връзката води към страница, а не към книга — страница за изтегляне, екран за съгласие или проверка, че не сте робот. Отворете я сами и файлът ще е там.',
  'settings.status.session': 'Незапомнено',
  'settings.notRemembered':
    'Този браузър отказа да го запомни, така че следващия път, когато отворите книга, всичко ще е както преди.',
};
