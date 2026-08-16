import type { Dictionary } from '../dictionary';

export const mk: Dictionary = {
  'nav.savedBooks': 'Зачувани книги',
  'nav.signIn': 'Најава',
  'nav.signOut': 'Одјава',
  'nav.language': 'Јазик',
  'nav.skipToContent': 'Оди на содржината',
  'footer.legal':
    'Исклучиво законски извори: директно преземање само за дела во јавна сопственост и со отворени лиценци; книгите заштитени со авторско право — купување или позајмување во библиотека. Кај секоја врска изречно стои статусот на правата.',
  'footer.openSource': 'Отворен код',
  'footer.openSourceRest': '— MIT лиценца, може да се хостира самостојно. Кодот е на GitHub.',
  'home.title': 'Golden Library',
  'home.subtitle': 'Отворен агрегатор на книжевни преводи: јазици, изданија и законски извори.',
  'home.searchLabel': 'Наслов и автор',
  'home.searchPlaceholder': 'Војна и мир Толстој',
  'home.searchButton': 'Барај',
  'search.searching': 'Бараме…',
  'search.backfilling':
    'Тука сè уште нема ништо — ја преземаме книгата од изворите. Ова трае неколку секунди.',
  'search.notFound': 'За ова барање не е најдено ништо.',
  'search.retry': 'Обидете се повторно',
  'search.signInPrompt':
    'за да ги зачувувате книгите што ги наоѓате тука и да им се враќате — и за пред изборот да споредувате изданија од различни години едно до друго.',
  'featured.yearHeading': 'Книги на годината',
  'featured.yearBlurb':
    'Забележителни книги од секоја од последните години. Рачно составен список, а не ранг-листа на продажба — таква не објавува ниту еден отворен извор.',
  'featured.popularHeading': 'Многу читани, многу преведувани',
  'featured.popularBlurb': 'Книги што постојат на многу јазици — токму за тоа е оваа страница.',
  'featured.filling':
    'Некои од нив сè уште се преземаат во заднина. Освежете ја страницата за минута за да ги видите останатите.',
  'featured.freeCopy': 'Бесплатен примерок',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Бесплатно за читање веднаш',
  'free.homeBlurb':
    'Книги во јавна сопственост и со отворена лиценца што оваа копија на страницата може да ви ги даде директно.',
  'free.seeAll': 'Види повеќе',
  'free.downloadable': 'Преземи',
  'free.pageTitle': 'Бесплатни книги',
  'free.pageBlurb':
    'Секоја книга овде има барем еден законски бесплатен примерок — јавна сопственост или подарок од носителот на правата. Без купување, без членска карта.',
  'free.empty':
    'Тука сè уште нема ништо бесплатно. Бесплатните примероци се појавуваат како што оваа инстанца презема книги, па побарајте некоја и вратете се.',
  'free.emptyForLanguage':
    'Сè уште нема бесплатни примероци на {language}. Отстранете го филтерот погоре за да ја видите целата полица.',
  'free.showMore': 'Прикажи повеќе',
  'free.shown': 'Прикажани {shown} од {total}.',
  'free.allLanguages': 'Бесплатни примероци на сите јазици.',
  'free.filteredByLanguage': 'Само бесплатни примероци на {language}.',
  'free.filterByLanguage': 'Прикажи само бесплатни примероци на {language}.',
  'free.dropLanguageFilter': 'прикажи ги сите јазици',
  'free.loadFailed': 'Бесплатните книги не можеа да се вчитаат во моментов.',
  'work.original': 'оригинал',
  'work.dataSources': 'Извори на податоци',
  'work.about': 'За оваа книга',
  'work.translatedInto': 'Преведена на',
  'work.availableIn': 'Достапна на',
  'work.languagesNote':
    'Само тоа што го наведуваат изворите што ги читаме — превод што недостига тука сепак може да постои.',
  'work.noTranslations': 'Сè уште не се најдени преводи.',
  'work.yourLanguage.title': 'На вашиот јазик',
  'work.yourLanguage.yes': 'Постои превод на {language}.',
  'work.yourLanguage.original': 'Оваа книга е напишана на {language}.',
  'work.yourLanguage.no': 'Меѓу овде познатите изданија нема превод на {language}.',
  'work.yourLanguage.show': 'Прикажи изданија на {language}',
  'work.editions': 'Изданија ({shown} од {total})',
  'work.filterLanguage': 'Јазик',
  'work.filterAllLanguages': 'Сите јазици',
  'work.filterYear': 'Година',
  'work.filterApply': 'Филтрирај',
  'work.filterReset': 'Поништи',
  'work.noEditionsMatch': 'Ниту едно издание не одговара на овие филтри.',
  'work.showMoreEditions': 'Прикажи уште изданија (преостануваат {remaining})',
  'work.badgeFreeDownload': 'бесплатно преземање',
  'work.freeDownloadFormat': 'Преземи {format}',
  'work.freeDownloadNote': '{rights}. Бесплатно од {provider} — без сметка, без плаќање.',
  'work.badgeReadBorrow': 'читај или позајми',
  'work.badgeInBookstores': 'во книжарниците',
  'work.translatedBy': 'превод: {name}',
  'work.pages': '{count} стр.',
  'bookmark.save': 'Зачувај ја оваа книга',
  'bookmark.saved': 'Зачувано',
  'bookmark.signInToSave': 'Најавете се за да зачувате',
  'bookmark.failed': 'Зачувувањето не успеа. Обидете се повторно.',
  'links.show': 'Прикажи ги врските',
  'links.hide': 'Скриј ги врските',
  'links.loading': 'Вчитување врски',
  'links.none': 'За ова издание сè уште нема законски врски.',
  'links.viaOtherEdition': 'бесплатен примерок од изданието {label}',
  'links.failed': 'Врските не можеа да се вчитаат.',
  'links.storesHeading': 'Најдете во книжарница',
  'links.storesInCountry': 'Во {country}',
  'links.storesYourCountry': 'вашата земја',
  'links.storesLanguageMarket': 'Каде се продаваат книги на {language}',
  'links.storesLanguageMarketGeneric': 'Каде се продава јазикот на ова издание',
  'links.storesWorldwide': 'Испорачува во цел свет',
  'links.storesCaption':
    'Секоја врска пребарува во сопствениот каталог на таа книжарница — достапноста и цената ги прикажува самата книжарница.',
  'linkType.download': 'Преземи',
  'linkType.buy': 'Купи',
  'linkType.borrow': 'Позајми во библиотека',
  'linkType.listen': 'Слушај (аудиокнига)',
  'rights.public_domain': 'Јавна сопственост',
  'rights.open_license': 'Отворена лиценца',
  'rights.copyrighted': 'Заштитено со авторско право',
  'rights.unknown': 'Статусот е непознат',
  'compare.heading': 'Спореди изданија',
  'compare.blurb': 'Изберете две или три изданија за да видите што навистина ги разликува.',
  'compare.selected': 'Избрани {count} од најмалку 2.',
  'compare.editSelection': 'Смени изданија',
  'compare.showAllEditions': 'Прикажи ги сите {count} изданија',
  'compare.columnDifference': 'Разлика',
  'compare.identical': 'Во сè што изворите запишуваат, овие изданија се исти.',
  'compare.rowLanguage': 'Јазик',
  'compare.rowPublished': 'Објавено',
  'compare.rowPublisher': 'Издавач',
  'compare.rowTranslator': 'Преведувач',
  'compare.rowTranslatedFrom': 'Преведено од',
  'compare.rowBinding': 'Повез',
  'compare.rowPages': 'Страници',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Бесплатен или позајмлив примерок',
  'compare.yes': 'да ({count})',
  'compare.no': 'не е најдено',
  'country.label': 'Каде купувате книги?',
  'country.worldwideOnly': 'Само продавници што испорачуваат во цел свет',
  'auth.signInTitle': 'Најава',
  'auth.registerTitle': 'Создајте сметка',
  'auth.blurb':
    'Сметката постои од една причина: да ги зачувувате книгите што ги наоѓате и да им се враќате — со јазиците на кои се преведени, со изданијата што постојат и со тоа каде секое од нив да го добиете законски. Без билтен, без профил, без следење.',
  'auth.name': 'Име (не е задолжително)',
  'auth.email': 'Е-пошта',
  'auth.password': 'Лозинка',
  'auth.passwordHint':
    'Најмалку {min} знаци. Се проверува само должината — долга реченица што ја помните е подобра од кратка полна со интерпункција.',
  'auth.submitSignIn': 'Најави се',
  'auth.submitRegister': 'Создај сметка',
  'auth.working': 'Работиме…',
  'auth.google': 'Продолжи со Google',
  'auth.toRegister': 'Сè уште немате сметка? Создајте ја',
  'auth.toSignIn': 'Веќе имате сметка? Најавете се',
  'auth.backToSearch': 'Назад на пребарувањето',
  'auth.errorGoogleState':
    'Таа врска за најава истече или беше отворена во друг прелистувач. Обидете се повторно.',
  'auth.errorGoogleFailed':
    'Најавата преку Google не заврши. Наместо тоа можете да користите е-пошта и лозинка.',
  'auth.errorGeneric': 'Нешто тргна наопаку.',
  'bookmarks.title': 'Зачувани книги',
  'bookmarks.signedOut':
    'за да ги задржите книгите што ги наоѓате — и подоцна да споредите изданија на истата книга едно до друго.',
  'bookmarks.loading': 'Вчитување…',
  'bookmarks.empty':
    'Сè уште ништо не е зачувано. Најдете книга и на нејзината картичка употребете „Зачувај ја оваа книга“.',
  'bookmarks.searchLink': 'Барај',
  'bookmarks.remove': 'Отстрани',
  'bookmarks.loadFailed': 'Вашите зачувани книги не можеа да се вчитаат.',
  'search.failed': 'Пребарувањето не успеа.',
  'search.pending': 'Сè уште не е во нашата база — ги проверуваме изворите',
  'search.pendingLong':
    'Сè уште бараме: првото барање за книга собира податоци од изворите, што може да потрае и неколку минути',
  'search.notFoundHint': 'Ништо не е најдено. Обидете се да го прецизирате насловот или авторот.',
  'search.timedOut':
    'Изворите одговараат бавно и сè уште немаме податоци. Позадинската синхронизација можеби веќе заврши — обидете се повторно.',
  'search.freeOnlyToggle': 'Бесплатно за преземање',
  'search.noFreeResults':
    'Ниту една од нив сè уште нема бесплатно преземање — обидете се да го исклучите филтерот.',
  'home.tagline': 'Најдете го вашиот следен magnum opus',
  'subject.allLanguages': 'Сите јазици.',
  'subject.filteredByLanguage': 'Само книги со издание на {language}.',
  'subject.dropLanguageFilter': 'прикажи ги сите јазици',
  'subject.empty':
    'Под оваа ознака сè уште нема ништо. Ознаките доаѓаат од книгите што оваа инстанца веќе ги презеде.',
  'featured.year': '{year}',
  'nav.browse': 'Прелистај по жанр',
  'recommend.heading': 'Според тоа што сте читале',
  'recommend.becauseOf': 'Отворивте „{title}“, па еве книги од истите жанрови.',
  'recommend.blurb': 'Книги од жанровите што ги отворате.',
  'recommend.privacy':
    'Ова се пресметува во вашиот прелистувач — на серверот му се кажуваат жанровите, никогаш кој сте.',
  'recommend.forget': 'заборави ја мојата историја',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Полица',
  'shelf.title': 'Полица',
  'shelf.intro':
    'Отворени каталози и кој било библиотечен сервер што го одржувате сами. Каталозите што ги додавате остануваат во овој прелистувач и никогаш не се испраќаат на оваа страница.',
  'shelf.openCatalogs': 'Отворени каталози',
  'shelf.yourCatalogs': 'Вашите каталози',
  'shelf.addCatalog': 'Додај каталог',
  'shelf.name': 'Име',
  'shelf.address': 'OPDS адреса',
  'shelf.username': 'Корисничко име (не е задолжително)',
  'shelf.password': 'Лозинка (не е задолжителна)',
  'shelf.credentialsNote':
    'Адресата и евентуалните податоци за најава се чуваат само во овој прелистувач.',
  'shelf.add': 'Додај',
  'shelf.remove': 'Отстрани',
  'shelf.loading': 'Вчитување каталог…',
  'shelf.empty': 'Овој каталог нема ставки.',
  'shelf.noCatalogs':
    'Сè уште немате свој. Додајте подолу адреса на Calibre-Web, COPS, Kavita или Audiobookshelf.',
  'shelf.unreachable':
    'Вашиот прелистувач не можеше да го прочита овој каталог. Сервер во вашата мрежа ќе работи; јавните страници често одбиваат барања од друго потекло.',
  'shelf.nextPage': 'Следна страница',
  'shelf.previousPage': 'Претходна страница',
  'shelf.drm': 'Потребна е апликација со DRM',
  'shelf.notFree': 'Не е бесплатно преземање',
  'shelf.download': 'Преземи',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Книжарници во ваша близина',
  'stores.useMyLocation': 'Користи ја мојата локација',
  'stores.placeLabel': 'Град или поштенски број',
  'stores.find': 'Најди',
  'stores.locating': 'Бараме…',
  'stores.failed': 'Локацијата не е достапна. Наместо тоа впишете град или поштенски број.',
  'stores.none': 'Во радиус од {radius} км на картата нема ниту една книжарница.',
  'stores.distance': '{distance} км оддалеченост',
  'stores.stockUnknown':
    'Само податоци од картата — никој не објавува што има продавницата на залиха.',
  'stores.lookupFailed': 'OpenStreetMap не беше достапен во моментов. Обидете се за миг.',
  'stores.privacy':
    'Вашата локација се заокружува на околу 100 м и се испраќа само до OpenStreetMap — никогаш до оваа страница.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Цени и продавници',
  'prices.loading': 'Ги прашуваме продавниците…',
  'prices.unknown': 'Цената не е објавена',
  'prices.degraded': 'Нема одговор од: {providers}',
  'prices.format.hardcover': 'Тврд повез',
  'prices.format.paperback': 'Мек повез',
  'prices.format.ebook': 'Е-книга',
  'prices.format.audiobook': 'Аудиокнига',
  'prices.format.unknown': 'Форматот не е наведен',
  'recommend.hideGenre': 'скриј „{genre}“',
  'recommend.hiddenList': 'Скриени жанрови (кликнете за да вратите некој):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Зачувано',
  'settings.status.cleared': 'Исчистено',
  'settings.status.unstored': 'Не е зачувано',
  'settings.status.failed': 'Непроменето',
  'settings.notStored':
    'Овој прелистувач одби да ја зачува промената, па не се случи ништо — сè уште важи претходната вредност.',
  'settings.language.title': 'Јазик на интерфејсот',
  'settings.language.changed':
    'Променет од {from} на {to}. Интерфејсот се вчитува повторно на {to}; насловите на книгите и имињата на авторите остануваат на своите јазици.',
  'settings.country.title': 'Земја на купување',
  'settings.country.changed':
    'Поставено на {country}. Врските кон книжарници сега нудат продавници што испорачуваат таму, покрај светските.',
  'settings.country.cleared':
    'Не е избрана земја. Ќе се нудат само книжарници што испорачуваат во цел свет.',
  'settings.bookLanguage.title': 'Јазик на книгите',
  'settings.bookLanguage.changed':
    'Поставено на {language}. Страниците по жанр прво ќе прикажуваат книги со издание на {language} додека не го поништите филтерот.',
  'settings.bookLanguage.cleared':
    'Исчистено. Страниците по жанр повторно прикажуваат книги на сите јазици.',
  'settings.hiddenGenres.title': 'Скриени жанрови',
  'settings.hiddenGenres.hidden':
    'Жанрот „{genre}“ е скриен. Веќе не се испраќа до серверот кога се преземаат предлози, а вкупно се скриени {count} жанрови.',
  'settings.hiddenGenres.restored':
    'Жанрот „{genre}“ се врати во вашите предлози. Скриени остануваат {count} жанрови.',
  'settings.history.title': 'Историја на читање',
  'settings.history.cleared':
    'Книгите што ги отворавте се избришани од овој прелистувач. Предлозите нема да се појавуваат додека не отворите нова книга.',
  'settings.bookmarks.title': 'Зачувани книги',
  'settings.bookmarks.added': '„{title}“ е додадена во вашите зачувани книги.',
  'settings.bookmarks.removed': '„{title}“ е отстранета од вашите зачувани книги.',
  'settings.bookmarks.failed':
    'Серверот не ја прифати промената, па вашите зачувани книги останаа какви што беа.',
  'settings.catalogs.title': 'Вашите каталози',
  'settings.catalogs.added':
    '„{name}“ е додаден на {url}. Адресата останува во овој прелистувач и никогаш не се испраќа на оваа страница.',
  'settings.catalogs.addedWithCredentials':
    '„{name}“ е додаден на {url}, со корисничкото име и лозинката што ги внесовте. Сето тоа останува во овој прелистувач и ништо од него не се испраќа на оваа страница.',
  'settings.catalogs.removed':
    '„{name}“ е отстранет од овој прелистувач, заедно со сите податоци за најава зачувани за него.',
  'settings.catalogs.rejected': 'Ништо не беше додадено: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Додатоци',
  'addons.title': 'Додатоци',
  'addons.intro':
    'Додатокот донесува свои извори. Го инсталирате со лепење на неговата адреса; работи или на вашиот уред, во песочник, или на серверот на својот автор. Golden Library не испорачува ниту еден, не наведува ниту еден и не проверува што враќаат.',
  'addons.addressLabel': 'Адреса на додатокот',
  'addons.addressHint': 'URL на манифестот што ви го даде авторот на додатокот.',
  'addons.continue': 'Продолжи',
  'addons.fromServer': 'Од сервер',
  'addons.fromFile': 'Од датотека на вашиот уред',
  'addons.bundleLabel': 'Адреса на кодот на додатокот',
  'addons.bundleHint': 'URL на кодот на додатокот. Ќе се извршува на овој уред, не на сервер.',
  'addons.integrityLabel': 'Отпечаток за интегритет',
  'addons.integrityHint':
    'Го дава авторот на додатокот, во облик sha256-… . Задолжителен е: без него кодот што сте го одобриле еднаш би можел подоцна да се промени, а вие никогаш не би дознале.',
  'addons.checking': 'Го читаме додатокот…',
  'addons.installedHeading': 'Инсталирани',
  'addons.none':
    'Сè уште нема додатоци. Сè што е досега на оваа страница доаѓа од самата инстанца.',
  'addons.priorityHint': 'Редоследот е приоритет: првиот додаток одговара прв.',
  'addons.enable': 'Вклучи',
  'addons.disable': 'Исклучи',
  'addons.off': 'Исклучен',
  'addons.remove': 'Отстрани',
  'addons.moveUp': 'Помести нагоре',
  'addons.moveDown': 'Помести надолу',
  'addons.configure': 'Постави',
  'addons.failedToStart': '„{name}“ не се стартуваше: {reason}',
  'addons.consentTitle': 'Да се инсталира „{name}“?',
  'addons.consentHosts': 'Ќе контактира со: {hosts}',
  'addons.consentNoHosts': 'Не побара контакт со ништо.',
  'addons.consentSeesYou':
    'Овој додаток работи на серверот на својот автор. Тој ќе ја види вашата адреса и сè што барате преку него.',
  'addons.consentSandboxed':
    'Овој додаток работи на вашиот уред, во песочник. Не може да ги чита вашите колачиња, податоците на оваа страница ниту што било друго што ви е отворено.',
  'addons.consentNotVetted':
    'Golden Library не проверува што враќа додаток и не го препорача овој. Што инсталирате е ваш избор.',
  'addons.install': 'Инсталирај',
  'addons.cancel': 'Откажи',
  'addons.via': 'преку {name}',
  'addons.sourcesTitle': 'Од вашите додатоци',
  'addons.searchTitle': 'Најдено од вашите додатоци',
  'addons.showLinks': 'Прикажи врски за преземање',
  'addons.unreadable': '{count} ставки од овој додаток не можеа да се прочитаат.',
  'addons.browse': 'Прелистај го каталогот',
  'addons.browseTitle': 'Каталогот на {name}',
  'addons.browseNoCatalog': 'Овој додаток не нуди каталог за прелистување.',
  'addons.browseEmpty': 'Каталогот на овој додаток моментално е празен.',
  'addons.browseFailed': 'Каталогот на „{name}“ не можеше да се вчита: {reason}',
  'addons.loadMore': 'Вчитај повеќе',
  'addons.notInstalled': 'Овој додаток не е инсталиран.',

  'settings.addons.title': 'Вашите додатоци',
  'settings.addons.installed':
    '„{name}“ е инсталиран. Ќе биде прашуван заедно со другите и може да контактира со {hosts}.',
  'settings.addons.removed':
    '„{name}“ е отстранет. Неговите резултати ги нема во овој прелистувач, како и сè што чуваше тука.',
  'settings.addons.enabled': '„{name}“ повторно е вклучен и ќе биде прашуван заедно со другите.',
  'settings.addons.disabled':
    '„{name}“ е исклучен. Останува инсталиран со своите поставки, но ништо од тоа што враќа нема да се прикажува.',
  'settings.addons.reordered': '„{name}“ сега одговара како {position} од {total}.',
  'settings.addons.rejected': 'Ништо не беше инсталирано: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Сопствени извори',
  'customSources.title': 'Сопствени извори',
  'customSources.intro':
    'Додајте своја продавница или каталог со тоа што ќе ѝ дадете име и URL за пребарување со {isbn}, {query}, {title}, {author} или {language} во него. Врската се гради на овој уред и оваа страница никогаш не ја повикува.',
  'customSources.nameLabel': 'Име',
  'customSources.templateLabel': 'Шаблон за URL',
  'customSources.templateHint':
    'Апсолутна https:// адреса. {isbn}, {query}, {title}, {author} и {language} се пополнуваат од изданието; резервирано место што ќе остане празно значи дека врската за тоа издание се прескокнува.',
  'customSources.add': 'Додај извор',
  'customSources.listHeading': 'Вашите извори',
  'customSources.none': 'Сè уште нема сопствени извори.',
  'customSources.off': 'Исклучен',
  'customSources.enable': 'Вклучи',
  'customSources.disable': 'Исклучи',
  'customSources.remove': 'Отстрани',
  'customSources.heading': 'Вашите извори',
  'customSources.caption':
    'Врски што сами сте ги поставиле. Оваа инстанца не проверува каде водат.',

  'settings.customSources.title': 'Вашите сопствени извори',
  'settings.customSources.added': '„{name}“ е додаден и ќе се нуди заедно со другите.',
  'settings.customSources.removed': '„{name}“ е отстранет од овој прелистувач.',
  'settings.customSources.enabled': '„{name}“ повторно е вклучен.',
  'settings.customSources.disabled':
    '„{name}“ е исклучен. Останува поставен, но неговата врска нема да се прикажува.',
  'settings.customSources.rejected': 'Ништо не беше додадено: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Книги на вашиот јазик',
  'featured.inLanguageBlurb':
    'Книги напишани на јазикот на кој ја читате оваа страница, најиздаваните први — тоа е редоследот на самата Open Library, а не ранг-листа на бестселери.',
  'work.newSearch': 'Ново пребарување',
  'work.descriptionFrom': 'Опис:',
  'work.descriptionNotLocalized':
    'Овој опис е на јазикот на кој го напишал изворот — на вашиот јазик за оваа книга сè уште го нема.',

  // Reader ratings of an edition, never of a translation — see TranslationRatings.tsx.
  'ratings.edition': '{average} од {outOf}, {votes} читатели на {source}',
  'ratings.lowConfidence': 'премалку гласови за споредба',
  'ratings.reviews': 'Осврти',
  'ratings.reviewsOn': 'Осврти за ова издание на {source}',
  'ratings.noteNoRatings':
    'Ниту еден отворен извор не оценува превод, а ниту еден од овие тиражи нема тука читателска оценка.',
  'ratings.noteReviews':
    'Таму каде што изданието е познато на {sources}, врската води до осврти токму за тој тираж — повеќето изданија не се познати.',
  'ratings.translator':
    'Изданија во превод на {name}: {average} од {outOf} низ {editions} оценети изданија, вкупно {votes} читатели.',
  'ratings.note':
    'Ова се оценки на читателите за одредено издание на {sources}, а не проценка на самиот превод — таква никој не објавува. Вреди да се читаат една до друга: истата книга, истиот јазик, други преведувачи, и секогаш со бројот на гласови пред очи.',
  'ratings.gapWithoutIsbn':
    '{count} овдешни изданија немаат ISBN, па на нив не можеше да им се придружи никаква оценка.',
  'ratings.gapNotLookedUp': 'Уште {count} изданија не беа проверени во ова барање.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Читајте во вашиот прелистувач',
  'reader.privacy':
    'Вашиот прелистувач ја отвора оваа книга сам. Датотеката, местото од каде дошла и тоа докаде сте стигнале никогаш не стигнуваат до оваа страница.',
  'reader.chooseFile': 'Отворете книга од овој уред',
  'reader.formats': 'EPUB, FB2, MOBI и CBZ.',
  'reader.loading': 'Отворам…',
  'reader.failed': 'Оваа книга не можеше да се отвори: {reason}',
  'reader.previous': 'Претходна страница',
  'reader.next': 'Следна страница',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…или спуштете книга тука',
  'reader.fetching': 'Ја барам датотеката од {host}…',
  'reader.blockedTitle': '{host} не ѝ ја предаде датотеката на оваа страница',
  'reader.blockedBody':
    'Или е недостапен, или не дозволува други страници да ги читаат неговите датотеки. Оваа страница нема да ја преземе наместо вас: вашата книга никогаш не поминува низ неа, а токму во тоа е смислата на читањето тука.',
  'reader.blockedDownload': 'Преземете ја од {host}',
  'reader.blockedOpenHere': 'па потоа отворете ја тука од вашиот уред',
  'reader.blockedAddon': 'Работи и додаток што сам ја дава датотеката.',
  'reader.keepFile': 'Задржи ја оваа книга во овој прелистувач',
  'reader.keepFileHint':
    'Стандардно исклучено. Без тоа датотеката исчезнува кога ќе го затворите јазичето; со тоа останува само на овој уред.',
  'reader.library': 'Задржано во овој прелистувач',
  'reader.libraryEmpty':
    'Засега ништо задржано. Книгите што ги задржувате остануваат на овој уред и никогаш не се качуваат никаде.',
  'reader.libraryOpen': 'Отвори',
  'reader.libraryRemove': 'Отстрани',
  'reader.libraryFileKept': 'датотеката е задржана',
  'reader.libraryFileGone': 'датотеката не е задржана',
  'reader.untitled': 'Книга без наслов',
  'settings.reader.libraryTitle': 'Книги задржани во овој прелистувач',
  'settings.reader.kept':
    '„{title}“ сега се чува на овој уред, па се отвора без повторно преземање. Никаде не се качува.',
  'settings.reader.forgotten':
    'Датотеката на „{title}“ беше избришана од овој прелистувач. Записот останува во списокот, за да можете повторно да ја отворите од нејзиниот извор.',
  'settings.reader.removed':
    '„{title}“ беше целосно отстранета од овој прелистувач — и датотеката и записот.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Отворена таму каде што застанавте — на {percent} %.',
  'reader.bookmarks': 'Обележувачи',
  'reader.bookmarkAdd': 'Обележи ја оваа страница',
  'reader.bookmarkNone': 'Во оваа книга сè уште нема обележувачи.',
  'reader.bookmarkGo': 'Оди на',
  'reader.bookmarkRemove': 'Отстрани обележувач',
  'reader.bookmarkNote': 'Белешка',
  'reader.bookmarkNotePlaceholder': 'Вашите зборови за оваа страница',
  'reader.bookmarkAt': 'на {percent} %',
  'settings.reader.bookmarkTitle': 'Обележувачи во овој прелистувач',
  'settings.reader.bookmarkAdded':
    'Обележувач на {percent} % од „{title}“. Обележувачите остануваат на овој уред заедно со книгата.',
  'settings.reader.bookmarkRemoved':
    'Тој обележувач во „{title}“ беше отстранет од овој прелистувач.',
  'settings.reader.noteSaved':
    'Вашата белешка на оваа страница од „{title}“ беше зачувана на овој уред.',
  'settings.reader.positionTitle': 'Место во читањето',
  'settings.reader.positionUnstored':
    'Овој прелистувач не сакаше да зачува каде сте во „{title}“, па следниот пат ќе се отвори од почеток. Тоа го прават и приватниот режим и полниот диск.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': 'Како изгледа оваа книга',
  'reader.theme': 'Бои',
  'reader.themeApp': 'Како страницата',
  'reader.themeLight': 'Хартија',
  'reader.themeDark': 'Мастило',
  'reader.themeSepia': 'Сепија',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint':
    'Чиста црна на бело, без анимација, една колона — за екрани од електронска хартија.',
  'reader.fontSize': 'Големина на буквите',
  'reader.smaller': 'Помало',
  'reader.larger': 'Поголемо',
  'reader.lineHeight': 'Проред',
  'reader.margin': 'Маргини',
  'reader.flow': 'Страници',
  'reader.flowPaged': 'Превртување страници',
  'reader.flowScrolled': 'Лизгање',
  'reader.justify': 'Порамнување од двете страни',
  'reader.hyphenate': 'Делење на зборови',
  'reader.displayReset': 'Назад на стандардното',
  'settings.reader.displayTitle': 'Изглед при читање',
  'settings.reader.displayChanged':
    '{setting} сега е {value}. Важи за секоја книга што ја отворате во овој прелистувач.',
  'settings.reader.displayReset':
    'Изгледот при читање е вратен на стандардните вредности за секоја книга во овој прелистувач.',
  'reader.on': 'Вклучено',
  'reader.off': 'Исклучено',
  'reader.openHere': 'Читајте во вашиот прелистувач',
  'reader.notAFileTitle': '{host} испрати веб-страница, а не датотека',
  'reader.notAFileBody':
    'Врската води до страница, а не до книга — страница за преземање, екран за согласност или проверка дека не сте робот. Отворете ја сами и датотеката ќе биде таму.',
  'settings.status.session': 'Не е запаметено',
  'settings.notRemembered':
    'Овој прелистувач не го запамети тоа, па следниот пат кога ќе отворите книга сè ќе биде како порано.',
};
