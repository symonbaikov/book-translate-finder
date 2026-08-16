import type { Dictionary } from '../dictionary';

export const sr: Dictionary = {
  'nav.savedBooks': 'Сачуване књиге',
  'nav.signIn': 'Пријава',
  'nav.signOut': 'Одјава',
  'nav.language': 'Језик',
  'nav.skipToContent': 'Пређи на садржај',
  'footer.legal':
    'Искључиво законити извори: непосредно преузимање само за дела у јавном власништву и са отвореним лиценцама; књиге заштићене ауторским правом — куповина или позајмица у библиотеци. Уз сваку везу јасно стоји статус права.',
  'footer.openSource': 'Отворени код',
  'footer.openSourceRest': '— MIT лиценца, може се покренути код себе. Код је на GitHub-у.',
  'home.title': 'Golden Library',
  'home.subtitle': 'Отворени агрегатор превода књига: језици, издања и законити извори.',
  'home.searchLabel': 'Наслов и аутор',
  'home.searchPlaceholder': 'Рат и мир Толстој',
  'home.searchButton': 'Тражи',
  'search.searching': 'Тражимо…',
  'search.backfilling':
    'Овде још нема ничега — преузимамо књигу из извора. То траје неколико секунди.',
  'search.notFound': 'За овај упит ништа није пронађено.',
  'search.retry': 'Покушајте поново',
  'search.signInPrompt':
    'да бисте чували књиге које овде нађете и враћали им се — и да бисте пре избора упоредили издања из различитих година једно поред другог.',
  'featured.yearHeading': 'Књиге године',
  'featured.yearBlurb':
    'Запажене књиге из сваке од последњих година. Ручно састављен списак, а не листа продаје — такву не објављује ниједан отворени извор.',
  'featured.popularHeading': 'Много читане, много превођене',
  'featured.popularBlurb':
    'Књиге које постоје на многим језицима — управо због тога овај сајт и постоји.',
  'featured.filling':
    'Неке од њих још преузимамо у позадини. Освежите страницу за минут да видите остале.',
  'featured.freeCopy': 'Бесплатан примерак',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Бесплатно за читање одмах',
  'free.homeBlurb':
    'Књиге у јавном власништву и са отвореном лиценцом које вам ова копија сајта може дати непосредно.',
  'free.seeAll': 'Види више',
  'free.downloadable': 'Преузми',
  'free.pageTitle': 'Бесплатне књиге',
  'free.pageBlurb':
    'Свака књига овде има бар један законит бесплатан примерак — јавно власништво или поклон носиоца права. Без куповине, без чланске карте.',
  'free.empty':
    'Овде још нема ничега бесплатног. Бесплатни примерци се појављују како ова инстанца преузима књиге, па потражите неку и вратите се.',
  'free.emptyForLanguage':
    'Још нема бесплатних примерака на језику {language}. Уклоните филтер изнад да видите целу полицу.',
  'free.showMore': 'Прикажи више',
  'free.shown': 'Приказано {shown} од {total}.',
  'free.allLanguages': 'Бесплатни примерци на свим језицима.',
  'free.filteredByLanguage': 'Само бесплатни примерци на језику {language}.',
  'free.filterByLanguage': 'Прикажи само бесплатне примерке на језику {language}.',
  'free.dropLanguageFilter': 'прикажи све језике',
  'free.loadFailed': 'Бесплатне књиге тренутно није било могуће учитати.',
  'work.original': 'изворник',
  'work.dataSources': 'Извори података',
  'work.about': 'О овој књизи',
  'work.translatedInto': 'Преведено на',
  'work.availableIn': 'Доступно на',
  'work.languagesNote':
    'Само оно што наводе извори које читамо — превод који овде недостаје ипак може постојати.',
  'work.noTranslations': 'Преводи још нису пронађени.',
  'work.yourLanguage.title': 'На вашем језику',
  'work.yourLanguage.yes': 'Превод на језик {language} постоји.',
  'work.yourLanguage.original': 'Ова књига је написана на језику {language}.',
  'work.yourLanguage.no': 'Међу овде познатим издањима нема превода на {language}.',
  'work.yourLanguage.show': 'Прикажи издања на језику {language}',
  'work.editions': 'Издања ({shown} од {total})',
  'work.filterLanguage': 'Језик',
  'work.filterAllLanguages': 'Сви језици',
  'work.filterYear': 'Година',
  'work.filterApply': 'Филтрирај',
  'work.filterReset': 'Поништи',
  'work.noEditionsMatch': 'Ниједно издање не одговара овим филтерима.',
  'work.showMoreEditions': 'Прикажи још издања (преостало {remaining})',
  'work.badgeFreeDownload': 'бесплатно преузимање',
  'work.freeDownloadFormat': 'Преузми {format}',
  'work.freeDownloadNote': '{rights}. Бесплатно од {provider} — без налога, без плаћања.',
  'work.badgeReadBorrow': 'читај или позајми',
  'work.badgeInBookstores': 'у књижарама',
  'work.translatedBy': 'превод: {name}',
  'work.pages': '{count} стр.',
  'bookmark.save': 'Сачувај ову књигу',
  'bookmark.saved': 'Сачувано',
  'bookmark.signInToSave': 'Пријавите се да сачувате',
  'bookmark.failed': 'Чување није успело. Покушајте поново.',
  'links.show': 'Прикажи везе',
  'links.hide': 'Сакриј везе',
  'links.loading': 'Учитавање веза',
  'links.none': 'За ово издање још нема законитих веза.',
  'links.viaOtherEdition': 'бесплатан примерак из издања {label}',
  'links.failed': 'Везе није било могуће учитати.',
  'links.storesHeading': 'Пронађите у књижари',
  'links.storesInCountry': 'У земљи {country}',
  'links.storesYourCountry': 'ваша земља',
  'links.storesLanguageMarket': 'Где се продају књиге на језику {language}',
  'links.storesLanguageMarketGeneric': 'Где се продаје језик овог издања',
  'links.storesWorldwide': 'Шаље у цео свет',
  'links.storesCaption':
    'Свака веза претражује сопствени каталог те књижаре — доступност и цену приказује сама књижара.',
  'linkType.download': 'Преузми',
  'linkType.buy': 'Купи',
  'linkType.borrow': 'Позајми у библиотеци',
  'linkType.listen': 'Слушај (аудио-књига)',
  'rights.public_domain': 'Јавно власништво',
  'rights.open_license': 'Отворена лиценца',
  'rights.copyrighted': 'Заштићено ауторским правом',
  'rights.unknown': 'Статус непознат',
  'compare.heading': 'Упореди издања',
  'compare.blurb': 'Изаберите два или три издања да видите шта их заиста разликује.',
  'compare.selected': 'Изабрано {count} од најмање 2.',
  'compare.editSelection': 'Промени издања',
  'compare.showAllEditions': 'Прикажи свих {count} издања',
  'compare.columnDifference': 'Разлика',
  'compare.identical': 'У свему што извори бележе ова издања су истоветна.',
  'compare.rowLanguage': 'Језик',
  'compare.rowPublished': 'Објављено',
  'compare.rowPublisher': 'Издавач',
  'compare.rowTranslator': 'Преводилац',
  'compare.rowTranslatedFrom': 'Преведено са',
  'compare.rowBinding': 'Повез',
  'compare.rowPages': 'Страна',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Бесплатан или позајмљив примерак',
  'compare.yes': 'да ({count})',
  'compare.no': 'није пронађено',
  'country.label': 'Где купујете књиге?',
  'country.worldwideOnly': 'Само продавнице које шаљу у цео свет',
  'auth.signInTitle': 'Пријава',
  'auth.registerTitle': 'Отвори налог',
  'auth.blurb':
    'Налог постоји из једног разлога: да чувате књиге које нађете и враћате им се — са језицима на које су преведене, издањима која постоје и тиме где свако од њих законито набавити. Без билтена, без профила, без праћења.',
  'auth.name': 'Име (није обавезно)',
  'auth.email': 'Е-пошта',
  'auth.password': 'Лозинка',
  'auth.passwordHint':
    'Најмање {min} знакова. Проверава се само дужина — дуга реченица коју памтите боља је од кратке пуне интерпункције.',
  'auth.submitSignIn': 'Пријави се',
  'auth.submitRegister': 'Отвори налог',
  'auth.working': 'Радимо…',
  'auth.google': 'Настави са Google-ом',
  'auth.toRegister': 'Још немате налог? Отворите га',
  'auth.toSignIn': 'Већ имате налог? Пријавите се',
  'auth.backToSearch': 'Назад на претрагу',
  'auth.errorGoogleState':
    'Та веза за пријаву је истекла или је отворена у другом прегледачу. Покушајте поново.',
  'auth.errorGoogleFailed':
    'Пријава преко Google-а није довршена. Уместо тога можете користити е-пошту и лозинку.',
  'auth.errorGeneric': 'Нешто је пошло наопако.',
  'bookmarks.title': 'Сачуване књиге',
  'bookmarks.signedOut':
    'да задржите књиге које нађете — и да касније упоредите издања исте књиге једно поред другог.',
  'bookmarks.loading': 'Учитавање…',
  'bookmarks.empty':
    'Још ништа није сачувано. Нађите књигу и на њеној картици употребите „Сачувај ову књигу“.',
  'bookmarks.searchLink': 'Тражи',
  'bookmarks.remove': 'Уклони',
  'bookmarks.loadFailed': 'Ваше сачуване књиге није било могуће учитати.',
  'search.failed': 'Претрага није успела.',
  'search.pending': 'Још није у нашој бази — проверавамо изворе',
  'search.pendingLong':
    'Још тражимо: први упит за књигу прикупља податке из извора, што може потрајати и неколико минута',
  'search.notFoundHint': 'Ништа није пронађено. Покушајте да прецизирате наслов или аутора.',
  'search.timedOut':
    'Извори одговарају споро и још немамо податке. Позадинска синхронизација је можда већ завршена — покушајте поново.',
  'search.freeOnlyToggle': 'Бесплатно за преузимање',
  'search.noFreeResults':
    'Ниједна од њих још нема бесплатно преузимање — покушајте да искључите филтер.',
  'home.tagline': 'Пронађите свој следећи magnum opus',
  'subject.allLanguages': 'Сви језици.',
  'subject.filteredByLanguage': 'Само књиге са издањем на језику {language}.',
  'subject.dropLanguageFilter': 'прикажи све језике',
  'subject.empty':
    'Под овом ознаком још нема ничега. Ознаке долазе из књига које је ова инстанца већ преузела.',
  'featured.year': '{year}',
  'nav.browse': 'Прегледај по жанру',
  'recommend.heading': 'Према ономе што сте читали',
  'recommend.becauseOf': 'Отворили сте „{title}“, па ево књига из истих жанрова.',
  'recommend.blurb': 'Књиге из жанрова које отварате.',
  'recommend.privacy':
    'То се израчунава у вашем прегледачу — серверу се кажу жанрови, никада ко сте.',
  'recommend.forget': 'заборави моју историју',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Полица',
  'shelf.title': 'Полица',
  'shelf.intro':
    'Отворени каталози и било који библиотечки сервер који сами одржавате. Каталози које додате остају у овом прегледачу и никада се не шаљу на овај сајт.',
  'shelf.openCatalogs': 'Отворени каталози',
  'shelf.yourCatalogs': 'Ваши каталози',
  'shelf.addCatalog': 'Додај каталог',
  'shelf.name': 'Назив',
  'shelf.address': 'OPDS адреса',
  'shelf.username': 'Корисничко име (није обавезно)',
  'shelf.password': 'Лозинка (није обавезна)',
  'shelf.credentialsNote':
    'Адреса и евентуални подаци за пријаву чувају се само у овом прегледачу.',
  'shelf.add': 'Додај',
  'shelf.remove': 'Уклони',
  'shelf.loading': 'Учитавање каталога…',
  'shelf.empty': 'Овај каталог нема ставки.',
  'shelf.noCatalogs':
    'Још немате сопствених. Додајте испод адресу Calibre-Web-а, COPS-а, Kavita или Audiobookshelf-а.',
  'shelf.unreachable':
    'Ваш прегледач није могао да прочита овај каталог. Сервер у вашој мрежи ће радити; јавни сајтови често одбијају захтеве са другог порекла.',
  'shelf.nextPage': 'Следећа страница',
  'shelf.previousPage': 'Претходна страница',
  'shelf.drm': 'Потребна је апликација са DRM-ом',
  'shelf.notFree': 'Није бесплатно преузимање',
  'shelf.download': 'Преузми',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Књижаре у близини',
  'stores.useMyLocation': 'Користи моју локацију',
  'stores.placeLabel': 'Град или поштански број',
  'stores.find': 'Пронађи',
  'stores.locating': 'Тражимо…',
  'stores.failed': 'Локација није доступна. Уместо тога упишите град или поштански број.',
  'stores.none': 'У кругу од {radius} km на мапи нема ниједне књижаре.',
  'stores.distance': '{distance} km одавде',
  'stores.stockUnknown': 'Само подаци са мапе — нико не објављује шта продавница има на залихама.',
  'stores.lookupFailed': 'OpenStreetMap тренутно није био доступан. Покушајте за који тренутак.',
  'stores.privacy':
    'Ваша локација се заокружује на око 100 m и шаље само OpenStreetMap-у — никада овом сајту.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Цене и продавнице',
  'prices.loading': 'Питамо продавнице…',
  'prices.unknown': 'Цена није објављена',
  'prices.degraded': 'Нема одговора од: {providers}',
  'prices.format.hardcover': 'Тврди повез',
  'prices.format.paperback': 'Меки повез',
  'prices.format.ebook': 'Е-књига',
  'prices.format.audiobook': 'Аудио-књига',
  'prices.format.unknown': 'Формат није наведен',
  'recommend.hideGenre': 'сакриј „{genre}“',
  'recommend.hiddenList': 'Сакривени жанрови (кликните да вратите неки):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Сачувано',
  'settings.status.cleared': 'Очишћено',
  'settings.status.unstored': 'Није сачувано',
  'settings.status.failed': 'Непромењено',
  'settings.notStored':
    'Овај прегледач је одбио да сачува промену, па се ништа није догодило — и даље важи претходна вредност.',
  'settings.language.title': 'Језик сучеља',
  'settings.language.changed':
    'Промењен са {from} на {to}. Сучеље се поново учитава на језику {to}; наслови књига и имена аутора остају на својим језицима.',
  'settings.country.title': 'Земља куповине',
  'settings.country.changed':
    'Постављено на {country}. Везе ка књижарама сада нуде продавнице које тамо испоручују, поред светских.',
  'settings.country.cleared': 'Земља није изабрана. Нудиће се само књижаре које шаљу у цео свет.',
  'settings.bookLanguage.title': 'Језик књига',
  'settings.bookLanguage.changed':
    'Постављено на {language}. Странице жанрова ће прво приказивати књиге са издањем на језику {language} док не поништите филтер.',
  'settings.bookLanguage.cleared':
    'Очишћено. Странице жанрова поново приказују књиге на свим језицима.',
  'settings.hiddenGenres.title': 'Сакривени жанрови',
  'settings.hiddenGenres.hidden':
    'Жанр „{genre}“ је сакривен. Више се не шаље серверу при учитавању предлога, а укупно је сакривено {count} жанрова.',
  'settings.hiddenGenres.restored':
    'Жанр „{genre}“ се вратио у ваше предлоге. Сакривено остаје {count} жанрова.',
  'settings.history.title': 'Историја читања',
  'settings.history.cleared':
    'Књиге које сте отварали обрисане су из овог прегледача. Предлози се неће појављивати док не отворите нову књигу.',
  'settings.bookmarks.title': 'Сачуване књиге',
  'settings.bookmarks.added': '„{title}“ је додата у ваше сачуване књиге.',
  'settings.bookmarks.removed': '„{title}“ је уклоњена из ваших сачуваних књига.',
  'settings.bookmarks.failed':
    'Сервер није прихватио промену, па су ваше сачуване књиге остале какве су биле.',
  'settings.catalogs.title': 'Ваши каталози',
  'settings.catalogs.added':
    '„{name}“ је додат на {url}. Адреса остаје у овом прегледачу и никада се не шаље на овај сајт.',
  'settings.catalogs.addedWithCredentials':
    '„{name}“ је додат на {url}, са корисничким именом и лозинком које сте уписали. Све остаје у овом прегледачу и ништа од тога се не шаље на овај сајт.',
  'settings.catalogs.removed':
    '„{name}“ је уклоњен из овог прегледача, заједно са свим подацима за пријаву који су за њега били сачувани.',
  'settings.catalogs.rejected': 'Ништа није додато: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Додаци',
  'addons.title': 'Додаци',
  'addons.intro':
    'Додатак доноси сопствене изворе. Инсталирате га лепљењем његове адресе; ради или на вашем уређају, у песковнику, или на серверу свог аутора. Golden Library не испоручује ниједан, не наводи ниједан и не проверава шта враћају.',
  'addons.addressLabel': 'Адреса додатка',
  'addons.addressHint': 'URL манифеста који вам је дао аутор додатка.',
  'addons.continue': 'Настави',
  'addons.fromServer': 'Са сервера',
  'addons.fromFile': 'Из датотеке на вашем уређају',
  'addons.bundleLabel': 'Адреса кода додатка',
  'addons.bundleHint': 'URL кода додатка. Извршаваће се на овом уређају, не на серверу.',
  'addons.integrityLabel': 'Сажетак интегритета',
  'addons.integrityHint':
    'Даје га аутор додатка, у облику sha256-… . Обавезан је: без њега би се код који сте једном одобрили касније могао променити, а ви то никада не бисте сазнали.',
  'addons.checking': 'Читамо додатак…',
  'addons.installedHeading': 'Инсталирано',
  'addons.none': 'Још нема додатака. Све што је до сада на овом сајту долази од саме инстанце.',
  'addons.priorityHint': 'Редослед је приоритет: први додатак одговара први.',
  'addons.enable': 'Укључи',
  'addons.disable': 'Искључи',
  'addons.off': 'Искључен',
  'addons.remove': 'Уклони',
  'addons.moveUp': 'Помери горе',
  'addons.moveDown': 'Помери доле',
  'addons.configure': 'Подеси',
  'addons.failedToStart': '„{name}“ се није покренуо: {reason}',
  'addons.consentTitle': 'Инсталирати „{name}“?',
  'addons.consentHosts': 'Контактираће: {hosts}',
  'addons.consentNoHosts': 'Није затражио контакт ни са чим.',
  'addons.consentSeesYou':
    'Овај додатак ради на серверу свог аутора. Он ће видети вашу адресу и све што кроз њега тражите.',
  'addons.consentSandboxed':
    'Овај додатак ради на вашем уређају, у песковнику. Не може да чита ваше колачиће, податке овог сајта нити било шта друго што имате отворено.',
  'addons.consentNotVetted':
    'Golden Library не проверава шта додатак враћа и није препоручила овај. Шта инсталирате, ваш је избор.',
  'addons.install': 'Инсталирај',
  'addons.cancel': 'Одустани',
  'addons.via': 'преко {name}',
  'addons.sourcesTitle': 'Из ваших додатака',
  'addons.searchTitle': 'Пронашли ваши додаци',
  'addons.showLinks': 'Прикажи везе за преузимање',
  'addons.unreadable': '{count} ставки из овог додатка није било могуће прочитати.',
  'addons.browse': 'Прегледај каталог',
  'addons.browseTitle': 'Каталог додатка {name}',
  'addons.browseNoCatalog': 'Овај додатак не нуди каталог за прегледање.',
  'addons.browseEmpty': 'Каталог овог додатка је тренутно празан.',
  'addons.browseFailed': 'Каталог додатка „{name}“ није било могуће учитати: {reason}',
  'addons.loadMore': 'Учитај још',
  'addons.notInstalled': 'Овај додатак није инсталиран.',

  'settings.addons.title': 'Ваши додаци',
  'settings.addons.installed':
    '„{name}“ је инсталиран. Питаће се заједно са осталима и може контактирати {hosts}.',
  'settings.addons.removed':
    '„{name}“ је уклоњен. Његови резултати су нестали из овог прегледача, као и све што је овде сачувао.',
  'settings.addons.enabled': '„{name}“ је поново укључен и питаће се заједно са осталима.',
  'settings.addons.disabled':
    '„{name}“ је искључен. Остаје инсталиран са својим подешавањима, али ништа од онога што враћа неће бити приказано.',
  'settings.addons.reordered': '„{name}“ сада одговара као {position}. од {total}.',
  'settings.addons.rejected': 'Ништа није инсталирано: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Сопствени извори',
  'customSources.title': 'Сопствени извори',
  'customSources.intro':
    'Додајте сопствену продавницу или каталог тако што ћете јој дати назив и URL претраге са {isbn}, {query}, {title}, {author} или {language} у себи. Веза се гради на овом уређају и овај сајт је никада не позива.',
  'customSources.nameLabel': 'Назив',
  'customSources.templateLabel': 'Шаблон URL-а',
  'customSources.templateHint':
    'Апсолутна https:// адреса. {isbn}, {query}, {title}, {author} и {language} се попуњавају из издања; чувар места који остане празан значи да се веза за то издање прескаче.',
  'customSources.add': 'Додај извор',
  'customSources.listHeading': 'Ваши извори',
  'customSources.none': 'Још нема сопствених извора.',
  'customSources.off': 'Искључен',
  'customSources.enable': 'Укључи',
  'customSources.disable': 'Искључи',
  'customSources.remove': 'Уклони',
  'customSources.heading': 'Ваши извори',
  'customSources.caption': 'Везе које сте сами подесили. Ова инстанца не проверава куда воде.',

  'settings.customSources.title': 'Ваши сопствени извори',
  'settings.customSources.added': '„{name}“ је додат и нудиће се заједно са осталима.',
  'settings.customSources.removed': '„{name}“ је уклоњен из овог прегледача.',
  'settings.customSources.enabled': '„{name}“ је поново укључен.',
  'settings.customSources.disabled':
    '„{name}“ је искључен. Остаје подешен, али његова веза неће бити приказана.',
  'settings.customSources.rejected': 'Ништа није додато: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Књиге на вашем језику',
  'featured.inLanguageBlurb':
    'Књиге написане на језику на ком читате овај сајт, најиздаваније прве — то је редослед саме Open Library, а не листа бестселера.',
  'work.newSearch': 'Нова претрага',
  'work.descriptionFrom': 'Опис:',
  'work.descriptionNotLocalized':
    'Овај опис је на језику на ком га је написао извор — на вашем језику за ову књигу га још нема.',

  // Reader ratings of an edition, never of a translation — see TranslationRatings.tsx.
  'ratings.edition': '{average} од {outOf}, {votes} читалаца на {source}',
  'ratings.lowConfidence': 'премало гласова за поређење',
  'ratings.reviews': 'Рецензије',
  'ratings.reviewsOn': 'Рецензије овог издања на {source}',
  'ratings.noteNoRatings':
    'Ниједан отворени извор не оцењује превод, а ниједан од ових тиража нема овде читалачку оцену.',
  'ratings.noteReviews':
    'Тамо где је издање познато на {sources}, веза води на рецензије баш тог тиража — већина издања није позната.',
  'ratings.translator':
    'Издања у преводу {name}: {average} од {outOf} кроз {editions} оцењених издања, укупно {votes} читалаца.',
  'ratings.note':
    'Ово су оцене читалаца за одређено издање на {sources}, а не процена самог превода — то нико не објављује. Вреди их читати једну уз другу: иста књига, исти језик, други преводиоци, и увек с бројем гласова пред очима.',
  'ratings.gapWithoutIsbn':
    '{count} овдашњих издања нема ISBN, па им се није могла придружити ниједна оцена.',
  'ratings.gapNotLookedUp': 'Још {count} издања није проверено у овом захтеву.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Читајте у свом прегледачу',
  'reader.privacy':
    'Ваш прегледач отвара ову књигу сам. Датотека, место одакле је дошла и то докле сте стигли никада не долазе до овог сајта.',
  'reader.chooseFile': 'Отворите књигу са овог уређаја',
  'reader.formats': 'EPUB, FB2, MOBI и CBZ.',
  'reader.loading': 'Отварам…',
  'reader.failed': 'Ову књигу није било могуће отворити: {reason}',
  'reader.previous': 'Претходна страница',
  'reader.next': 'Следећа страница',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…или овде испустите књигу',
  'reader.fetching': 'Тражим датотеку од {host}…',
  'reader.blockedTitle': '{host} није предао датотеку овој страници',
  'reader.blockedBody':
    'Или је недоступан, или не дозвољава другим сајтовима да читају његове датотеке. Овај сајт је неће преузети уместо вас: ваша књига никада не пролази кроз њега, а у томе је цео смисао читања овде.',
  'reader.blockedDownload': 'Преузмите је са {host}',
  'reader.blockedOpenHere': 'па је онда отворите овде са свог уређаја',
  'reader.blockedAddon': 'Ради и додатак који сам испоручује датотеку.',
  'reader.keepFile': 'Задржи ову књигу у овом прегледачу',
  'reader.keepFileHint':
    'Подразумевано искључено. Без тога датотека нестаје кад затворите картицу; са тим остаје само на овом уређају.',
  'reader.library': 'Задржано у овом прегледачу',
  'reader.libraryEmpty':
    'Засад ништа задржано. Књиге које задржите остају на овом уређају и никада се нигде не шаљу.',
  'reader.libraryOpen': 'Отвори',
  'reader.libraryRemove': 'Уклони',
  'reader.libraryFileKept': 'датотека задржана',
  'reader.libraryFileGone': 'датотека није задржана',
  'reader.untitled': 'Књига без наслова',
  'settings.reader.libraryTitle': 'Књиге задржане у овом прегледачу',
  'settings.reader.kept':
    '„{title}“ се сада чува на овом уређају, па се отвара без поновног преузимања. Нигде се не шаље.',
  'settings.reader.forgotten':
    'Датотека књиге „{title}“ обрисана је из овог прегледача. Запис остаје на списку, па је можете поново отворити са њеног извора.',
  'settings.reader.removed':
    '„{title}“ је у целости уклоњена из овог прегледача — и датотека и запис.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Отворена тамо где сте стали — на {percent} %.',
  'reader.bookmarks': 'Обележивачи',
  'reader.bookmarkAdd': 'Обележи ову страницу',
  'reader.bookmarkNone': 'У овој књизи још нема обележивача.',
  'reader.bookmarkGo': 'Иди на',
  'reader.bookmarkRemove': 'Уклони обележивач',
  'reader.bookmarkNote': 'Белешка',
  'reader.bookmarkNotePlaceholder': 'Ваше речи о овој страници',
  'reader.bookmarkAt': 'на {percent} %',
  'settings.reader.bookmarkTitle': 'Обележивачи у овом прегледачу',
  'settings.reader.bookmarkAdded':
    'Обележивач на {percent} % књиге „{title}“. Обележивачи остају на овом уређају заједно са књигом.',
  'settings.reader.bookmarkRemoved':
    'Тај обележивач у књизи „{title}“ уклоњен је из овог прегледача.',
  'settings.reader.noteSaved':
    'Ваша белешка на овој страници књиге „{title}“ сачувана је на овом уређају.',
  'settings.reader.positionTitle': 'Место у читању',
  'settings.reader.positionUnstored':
    'Овај прегледач није хтео да сачува где сте у књизи „{title}“, па ће се следећи пут отворити од почетка. То раде и приватни режим и пун диск.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': 'Како ова књига изгледа',
  'reader.theme': 'Боје',
  'reader.themeApp': 'Као сајт',
  'reader.themeLight': 'Папир',
  'reader.themeDark': 'Мастило',
  'reader.themeSepia': 'Сепија',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint':
    'Чиста црна на белој, без анимације, једна колона — за екране од електронског папира.',
  'reader.fontSize': 'Величина слова',
  'reader.smaller': 'Мање',
  'reader.larger': 'Веће',
  'reader.lineHeight': 'Проред',
  'reader.margin': 'Маргине',
  'reader.flow': 'Странице',
  'reader.flowPaged': 'Окретање страница',
  'reader.flowScrolled': 'Клизање',
  'reader.justify': 'Обострано поравнање',
  'reader.hyphenate': 'Растављање речи',
  'reader.displayReset': 'Назад на подразумевано',
  'settings.reader.displayTitle': 'Изглед читања',
  'settings.reader.displayChanged':
    '{setting} је сада {value}. Важи за сваку књигу коју отворите у овом прегледачу.',
  'settings.reader.displayReset':
    'Изглед читања враћен је на подразумеване вредности за сваку књигу у овом прегледачу.',
  'reader.on': 'Укључено',
  'reader.off': 'Искључено',
  'reader.openHere': 'Читајте у свом прегледачу',
  'reader.notAFileTitle': '{host} је послао веб-страницу, а не датотеку',
  'reader.notAFileBody':
    'Веза води на страницу, а не на књигу — на страницу за преузимање, екран са сагласношћу или проверу да нисте робот. Отворите је сами и датотека ће бити тамо.',
  'settings.status.session': 'Није запамћено',
  'settings.notRemembered':
    'Овај прегледач то није запамтио, па ће следећи пут кад отворите књигу све бити као пре.',
  'compare.rowEditionStatement': 'Издање',
  'home.genres': 'Популарни жанрови',
  'home.genresBlurb': 'Ознаке иза којих стоји највише књига. Свака отвара свој каталог.',
};
