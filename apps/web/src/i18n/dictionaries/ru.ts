import type { Dictionary } from '../dictionary';

export const ru: Dictionary = {
  'nav.savedBooks': 'Сохранённые книги',
  'nav.signIn': 'Войти',
  'nav.signOut': 'Выйти',
  'nav.language': 'Язык',
  'nav.skipToContent': 'Перейти к содержимому',

  'footer.legal':
    'Только законные источники: прямое скачивание — исключительно для общественного достояния и открытых лицензий; книги под авторским правом — покупка или библиотечная выдача. У каждой ссылки явно указан правовой статус.',
  'footer.openSource': 'Открытый код',
  'footer.openSourceRest': '— лицензия MIT, можно развернуть у себя. Исходники на GitHub.',

  'home.title': 'Golden Library',
  'home.subtitle': 'Открытый агрегатор переводов книг: языки, издания и законные источники.',
  'home.searchLabel': 'Название и автор',
  'home.searchPlaceholder': 'Война и мир Толстой',
  'home.searchButton': 'Искать',

  'search.searching': 'Ищем…',
  'search.backfilling':
    'Пока пусто — забираем эту книгу из источников. Это займёт несколько секунд.',
  'search.notFound': 'По этому запросу ничего не нашлось.',
  'search.retry': 'Попробовать снова',
  'search.signInPrompt':
    ', чтобы сохранять найденные книги и возвращаться к ним — и сравнивать издания разных лет, прежде чем выбрать.',

  'featured.yearHeading': 'Книги года',
  'featured.yearBlurb':
    'Заметные книги каждого недавнего года. Список составлен вручную, это не рейтинг продаж — открытых рейтингов не существует.',
  'featured.popularHeading': 'Много читают, много переводят',
  'featured.popularBlurb': 'Книги, существующие на многих языках, — ради этого сайт и сделан.',
  'featured.filling': 'Часть книг ещё подгружается в фоне. Обновите страницу через минуту.',
  'featured.freeCopy': 'Есть бесплатно',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Можно читать бесплатно',
  'free.homeBlurb':
    'Книги в общественном достоянии и под открытыми лицензиями — эта копия сайта отдаёт их напрямую.',
  'free.seeAll': 'Смотреть ещё',
  'free.downloadable': 'Скачать',
  'free.pageTitle': 'Бесплатные книги',
  'free.pageBlurb':
    'У каждой книги здесь есть хотя бы одна легальная бесплатная копия: общественное достояние или разрешение правообладателя. Без покупки и без читательского билета.',
  'free.empty':
    'Пока ничего бесплатного. Бесплатные копии появляются по мере того, как эта копия сайта загружает книги, — поищите книгу и загляните сюда снова.',
  'free.emptyForLanguage':
    'Бесплатных копий на этом языке ({language}) пока нет. Снимите фильтр выше, чтобы увидеть всю полку.',
  'free.showMore': 'Показать ещё',
  'free.shown': 'Показано {shown} из {total}.',
  'free.allLanguages': 'Бесплатные копии на всех языках.',
  'free.filteredByLanguage': 'Только бесплатные копии на языке: {language}.',
  'free.filterByLanguage': 'Показать только бесплатные копии на языке: {language}.',
  'free.dropLanguageFilter': 'показать все языки',
  'free.loadFailed': 'Сейчас не удалось загрузить бесплатные книги.',

  'work.original': 'оригинал',
  'work.dataSources': 'Источники данных',
  'work.about': 'Об этой книге',
  'work.translatedInto': 'Переведена на',
  'work.availableIn': 'Доступные языки',
  'work.languagesNote':
    'Только то, что перечисляют наши источники. Отсутствие языка здесь не значит, что перевода нет.',
  'work.noTranslations': 'Переводы пока не найдены.',
  'work.yourLanguage.title': 'На вашем языке',
  'work.yourLanguage.yes': 'Перевод на {language} есть.',
  'work.yourLanguage.original': 'Это язык оригинала: {language}.',
  'work.yourLanguage.no': 'Перевода на {language} среди известных изданий нет.',
  'work.yourLanguage.show': 'Показать издания: {language}',
  'work.editions': 'Издания ({shown} из {total})',
  'work.filterLanguage': 'Язык',
  'work.filterAllLanguages': 'Все языки',
  'work.filterYear': 'Год',
  'work.filterApply': 'Отфильтровать',
  'work.filterReset': 'Сбросить',
  'work.noEditionsMatch': 'Под эти фильтры не подходит ни одно издание.',
  'work.showMoreEditions': 'Показать ещё издания (осталось {remaining})',
  'work.badgeFreeDownload': 'скачать бесплатно',
  'work.freeDownloadFormat': 'Скачать {format}',
  'work.freeDownloadNote': '{rights}. Бесплатно, источник — {provider}: без аккаунта и без оплаты.',
  'work.badgeReadBorrow': 'читать или взять',
  'work.badgeInBookstores': 'в магазинах',
  'work.translatedBy': 'перевод: {name}',
  'work.pages': '{count} с.',

  'bookmark.save': 'Сохранить книгу',
  'bookmark.saved': 'Сохранено',
  'bookmark.signInToSave': 'Войдите, чтобы сохранить',
  'bookmark.failed': 'Не удалось сохранить. Попробуйте ещё раз.',

  'links.show': 'Показать ссылки',
  'links.hide': 'Скрыть ссылки',
  'links.loading': 'Загружаем ссылки',
  'links.none': 'Для этого издания законных ссылок пока нет.',
  'links.viaOtherEdition': 'бесплатная копия из издания {label}',
  'links.failed': 'Не удалось загрузить ссылки.',
  'links.storesHeading': 'Найти в магазине',
  'links.storesInCountry': 'В стране: {country}',
  'links.storesYourCountry': 'ваша страна',
  'links.storesLanguageMarket': 'Где продают книги на языке: {language}',
  'links.storesLanguageMarketGeneric': 'Где продают книги на языке этого издания',
  'links.storesWorldwide': 'Доставка по всему миру',
  'links.storesCaption':
    'Каждая ссылка ищет по каталогу самого магазина — наличие и цену показывает он сам.',

  'linkType.download': 'Скачать',
  'linkType.buy': 'Купить',
  'linkType.borrow': 'Взять в библиотеке',
  'linkType.listen': 'Слушать (аудиокнига)',
  'rights.public_domain': 'Общественное достояние',
  'rights.open_license': 'Открытая лицензия',
  'rights.copyrighted': 'Под авторским правом',
  'rights.unknown': 'Статус неизвестен',

  'compare.heading': 'Сравнить издания',
  'compare.blurb': 'Выберите два или три издания, чтобы увидеть, чем они действительно отличаются.',
  'compare.selected': 'Выбрано {count}, нужно минимум 2.',
  'compare.editSelection': 'Изменить издания',
  'compare.showAllEditions': 'Показать все издания ({count})',
  'compare.columnDifference': 'Отличие',
  'compare.identical': 'По всем данным источников эти издания идентичны.',
  'compare.rowLanguage': 'Язык',
  'compare.rowPublished': 'Год издания',
  'compare.rowPublisher': 'Издательство',
  'compare.rowTranslator': 'Переводчик',
  'compare.rowTranslatedFrom': 'Перевод с языка',
  'compare.rowEditionStatement': 'Издание',
  'compare.rowBinding': 'Переплёт',
  'compare.rowPages': 'Страниц',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Бесплатная копия или выдача',
  'compare.yes': 'да ({count})',
  'compare.no': 'не найдено',

  'country.label': 'Где вы покупаете книги?',
  'country.worldwideOnly': 'Только магазины с доставкой по миру',

  'auth.signInTitle': 'Вход',
  'auth.registerTitle': 'Создание аккаунта',
  'auth.blurb':
    'Аккаунт нужен ровно для одного: сохранять найденные книги и возвращаться к ним — с языками переводов, списком изданий и тем, где каждое взять законно. Без рассылок, профиля и слежки.',
  'auth.name': 'Имя (необязательно)',
  'auth.email': 'Почта',
  'auth.password': 'Пароль',
  'auth.passwordHint':
    'Минимум {min} символов. Проверяется только длина — длинная фраза, которую вы запомните, лучше короткой с пунктуацией.',
  'auth.submitSignIn': 'Войти',
  'auth.submitRegister': 'Создать аккаунт',
  'auth.working': 'Выполняем…',
  'auth.google': 'Войти через Google',
  'auth.toRegister': 'Нет аккаунта? Создайте',
  'auth.toSignIn': 'Уже есть аккаунт? Войдите',
  'auth.backToSearch': 'Вернуться к поиску',
  'auth.errorGoogleState':
    'Ссылка для входа устарела или открыта в другом браузере. Попробуйте ещё раз.',
  'auth.errorGoogleFailed': 'Вход через Google не завершился. Можно войти по почте и паролю.',
  'auth.errorGeneric': 'Что-то пошло не так.',

  'bookmarks.title': 'Сохранённые книги',
  'bookmarks.signedOut':
    ', чтобы сохранять найденные книги — и позже сравнивать издания одной книги между собой.',
  'bookmarks.loading': 'Загружаем…',
  'bookmarks.empty':
    'Пока ничего не сохранено. Найдите книгу и нажмите «Сохранить книгу» на её карточке.',
  'bookmarks.searchLink': 'Искать',
  'bookmarks.remove': 'Убрать',
  'bookmarks.loadFailed': 'Не удалось загрузить сохранённые книги.',
  'search.failed': 'Поиск не удался.',
  'search.pending': 'В нашей базе этого пока нет — проверяем источники',
  'search.pendingLong':
    'Всё ещё ищем: первый запрос по книге собирает данные из источников, это может занять пару минут',
  'search.notFoundHint': 'Ничего не нашлось. Попробуйте уточнить название или автора.',
  'search.timedOut':
    'Источники отвечают медленно, данных пока нет. Фоновая синхронизация могла уже завершиться — попробуйте ещё раз.',
  'search.freeOnlyToggle': 'Можно скачать бесплатно',
  'search.noFreeResults':
    'Среди этих результатов пока нет бесплатных — попробуйте отключить фильтр.',
  'home.tagline': 'Найдите свой следующий magnum opus',
  'subject.allLanguages': 'Все языки.',
  'subject.filteredByLanguage': 'Только книги с изданием на языке: {language}.',
  'subject.dropLanguageFilter': 'показать все языки',
  'subject.empty':
    'Под этим тегом пока ничего нет. Теги берутся из книг, которые эта копия уже загрузила.',
  'featured.year': '{year}',
  'nav.browse': 'По жанрам',
  'recommend.heading': 'На основе того, что вы читали',
  'recommend.becauseOf': 'Вы открывали «{title}» — вот книги тех же жанров.',
  'recommend.blurb': 'Книги тех жанров, которые вы открывали.',
  'recommend.privacy':
    'Это вычисляется в вашем браузере — серверу сообщаются жанры, но не то, кто вы.',
  'recommend.forget': 'забыть мою историю',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Полка',
  'shelf.title': 'Полка',
  'shelf.intro':
    'Открытые каталоги и любой библиотечный сервер, который вы держите сами. Добавленные каталоги остаются в этом браузере и никогда не отправляются на сайт.',
  'shelf.openCatalogs': 'Открытые каталоги',
  'shelf.yourCatalogs': 'Ваши каталоги',
  'shelf.addCatalog': 'Добавить каталог',
  'shelf.name': 'Название',
  'shelf.address': 'Адрес OPDS',
  'shelf.username': 'Имя пользователя (необязательно)',
  'shelf.password': 'Пароль (необязательно)',
  'shelf.credentialsNote': 'Адрес и любые учётные данные хранятся только в этом браузере.',
  'shelf.add': 'Добавить',
  'shelf.remove': 'Удалить',
  'shelf.loading': 'Загружаем каталог…',
  'shelf.empty': 'В этом каталоге нет записей.',
  'shelf.noCatalogs':
    'Своих пока нет. Добавьте ниже адрес Calibre-Web, COPS, Kavita или Audiobookshelf.',
  'shelf.unreachable':
    'Браузер не смог прочитать этот каталог. Сервер в вашей сети работать будет; публичные сайты часто запрещают межсайтовые запросы.',
  'shelf.nextPage': 'Следующая страница',
  'shelf.previousPage': 'Предыдущая страница',
  'shelf.drm': 'Нужно приложение с DRM',
  'shelf.notFree': 'Не бесплатное скачивание',
  'shelf.download': 'Скачать',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Книжные магазины рядом',
  'stores.useMyLocation': 'Определить моё местоположение',
  'stores.placeLabel': 'Город или индекс',
  'stores.find': 'Найти',
  'stores.locating': 'Ищем…',
  'stores.failed': 'Местоположение недоступно. Введите город или индекс.',
  'stores.none': 'В радиусе {radius} км книжных магазинов на карте нет.',
  'stores.distance': '{distance} км от вас',
  'stores.stockUnknown': 'Только данные карты — никто не публикует, что есть в магазине в наличии.',
  'stores.lookupFailed':
    'Сейчас не удалось связаться с OpenStreetMap. Попробуйте ещё раз через минуту.',
  'stores.privacy':
    'Ваши координаты округляются примерно до 100 м и отправляются только в OpenStreetMap — никогда на этот сайт.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Цены и магазины',
  'prices.loading': 'Спрашиваем магазины…',
  'prices.unknown': 'Цена не опубликована',
  'prices.degraded': 'Не ответили: {providers}',
  'prices.format.hardcover': 'Твёрдый переплёт',
  'prices.format.paperback': 'Мягкая обложка',
  'prices.format.ebook': 'Электронная книга',
  'prices.format.audiobook': 'Аудиокнига',
  'prices.format.unknown': 'Формат не указан',
  'recommend.hideGenre': 'скрыть «{genre}»',
  'recommend.hiddenList': 'Скрытые жанры (нажмите, чтобы вернуть):',

  // --- Всплывающие окна настроек ---
  'settings.status.saved': 'Сохранено',
  'settings.status.cleared': 'Сброшено',
  'settings.status.unstored': 'Не сохранено',
  'settings.status.failed': 'Без изменений',
  'settings.notStored':
    'Браузер отказался сохранить изменение, поэтому ничего не произошло — действует прежнее значение.',
  'settings.language.title': 'Язык интерфейса',
  'settings.language.changed':
    'Изменён с {from} на {to}. Интерфейс перезагружается на языке {to}; названия книг и имена авторов остаются на своих языках.',
  'settings.country.title': 'Страна покупок',
  'settings.country.changed':
    'Выбрана {country}. В ссылках на магазины теперь есть те, что доставляют туда, вместе с международными.',
  'settings.country.cleared':
    'Страна не выбрана. Будут предлагаться только магазины с доставкой по всему миру.',
  'settings.bookLanguage.title': 'Язык книг',
  'settings.bookLanguage.changed':
    'Выбран {language}. На страницах жанров сначала будут книги с изданием на языке {language} — пока вы не сбросите фильтр.',
  'settings.bookLanguage.cleared':
    'Сброшен. На страницах жанров снова показываются книги на всех языках.',
  'settings.hiddenGenres.title': 'Скрытые жанры',
  'settings.hiddenGenres.hidden':
    'Жанр «{genre}» скрыт. Он больше не отправляется на сервер при запросе рекомендаций; всего скрыто жанров: {count}.',
  'settings.hiddenGenres.restored':
    'Жанр «{genre}» снова в рекомендациях. Ещё скрыто жанров: {count}.',
  'settings.history.title': 'История чтения',
  'settings.history.cleared':
    'Открытые вами книги удалены из этого браузера. Рекомендации не появятся, пока вы не откроете следующую книгу.',
  'settings.bookmarks.title': 'Сохранённые книги',
  'settings.bookmarks.added': '«{title}» добавлена в сохранённые книги.',
  'settings.bookmarks.removed': '«{title}» удалена из сохранённых книг.',
  'settings.bookmarks.failed':
    'Сервер не принял изменение, поэтому список сохранённых книг остался прежним.',
  'settings.catalogs.title': 'Ваши каталоги',
  'settings.catalogs.added':
    'Каталог «{name}» добавлен по адресу {url}. Его адрес остаётся в этом браузере и никогда не отправляется на этот сайт.',
  'settings.catalogs.addedWithCredentials':
    'Каталог «{name}» добавлен по адресу {url} вместе с введёнными логином и паролем. Всё это остаётся в этом браузере и не отправляется на этот сайт.',
  'settings.catalogs.removed':
    'Каталог «{name}» удалён из этого браузера вместе с сохранёнными для него учётными данными.',
  'settings.catalogs.rejected': 'Ничего не добавлено: {reason}',
  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Дополнения',
  'addons.title': 'Дополнения',
  'addons.intro':
    'Дополнение добавляет свои источники. Вы устанавливаете его, вставив адрес; оно работает либо на вашем устройстве в песочнице, либо на сервере своего автора. Golden Library не поставляет дополнений, не ведёт их списка и не проверяет, что они возвращают.',
  'addons.addressLabel': 'Адрес дополнения',
  'addons.addressHint': 'Ссылка на манифест, которую дал автор дополнения.',
  'addons.continue': 'Далее',
  'addons.fromServer': 'С сервера',
  'addons.fromFile': 'Из файла, на вашем устройстве',
  'addons.bundleLabel': 'Адрес кода дополнения',
  'addons.bundleHint':
    'Ссылка на код дополнения. Он будет выполняться на этом устройстве, а не на сервере.',
  'addons.integrityLabel': 'Хеш целостности',
  'addons.integrityHint':
    'Его даёт автор дополнения, в виде sha256-… . Обязателен: без него однажды одобренный код мог бы потом измениться, а вы бы об этом не узнали.',
  'addons.checking': 'Читаем дополнение…',
  'addons.installedHeading': 'Установленные',
  'addons.none': 'Дополнений пока нет. Всё, что вы видите на сайте, приходит от самого инстанса.',
  'addons.priorityHint': 'Порядок — это приоритет: первое дополнение отвечает первым.',
  'addons.enable': 'Включить',
  'addons.disable': 'Выключить',
  'addons.off': 'Выключено',
  'addons.remove': 'Удалить',
  'addons.moveUp': 'Выше',
  'addons.moveDown': 'Ниже',
  'addons.configure': 'Настроить',
  'addons.failedToStart': 'Дополнение «{name}» не запустилось: {reason}',
  'addons.consentTitle': 'Установить «{name}»?',
  'addons.consentHosts': 'Оно будет обращаться к: {hosts}',
  'addons.consentNoHosts': 'Оно не запросило доступа ни к одному адресу.',
  'addons.consentSeesYou':
    'Это дополнение работает на сервере своего автора. Он увидит ваш адрес и всё, что вы через него ищете.',
  'addons.consentSandboxed':
    'Это дополнение работает на вашем устройстве в песочнице. Оно не может прочитать ваши куки, данные этого сайта и что-либо ещё, что у вас открыто.',
  'addons.consentNotVetted':
    'Golden Library не проверяет, что возвращает дополнение, и не рекомендовала это. Что устанавливать — ваш выбор.',
  'addons.install': 'Установить',
  'addons.cancel': 'Отмена',
  'addons.via': 'через {name}',
  'addons.sourcesTitle': 'От ваших дополнений',
  'addons.searchTitle': 'Найдено вашими дополнениями',
  'addons.showLinks': 'Показать ссылки на скачивание',
  'addons.unreadable': 'Записей от этого дополнения не удалось прочитать: {count}.',
  'addons.browse': 'Открыть каталог',
  'addons.browseTitle': 'Каталог «{name}»',
  'addons.browseNoCatalog': 'У этого дополнения нет каталога для просмотра.',
  'addons.browseEmpty': 'Каталог этого дополнения пока пуст.',
  'addons.browseFailed': 'Не удалось загрузить каталог «{name}»: {reason}',
  'addons.loadMore': 'Показать ещё',
  'addons.notInstalled': 'Это дополнение не установлено.',

  'settings.addons.title': 'Ваши дополнения',
  'settings.addons.installed':
    'Дополнение «{name}» установлено. Его будут спрашивать наравне с остальными, и оно может обращаться к {hosts}.',
  'settings.addons.removed':
    'Дополнение «{name}» удалено. Его результаты исчезли из этого браузера вместе со всем, что оно здесь хранило.',
  'settings.addons.enabled': 'Дополнение «{name}» снова включено и будет спрашиваться со всеми.',
  'settings.addons.disabled':
    'Дополнение «{name}» выключено. Оно остаётся установленным вместе со своими настройками, но ничего из того, что оно возвращает, показано не будет.',
  'settings.addons.reordered': 'Дополнение «{name}» теперь отвечает {position}-м из {total}.',
  'settings.addons.rejected': 'Ничего не установлено: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Свои источники',
  'customSources.title': 'Свои источники',
  'customSources.intro':
    'Добавьте свой магазин или каталог, задав ему название и URL поиска с {isbn}, {query}, {title}, {author} или {language}. Ссылка строится на этом устройстве, и этот сайт никогда её не запрашивает.',
  'customSources.nameLabel': 'Название',
  'customSources.templateLabel': 'Шаблон URL',
  'customSources.templateHint':
    'Абсолютный адрес https://. {isbn}, {query}, {title}, {author} и {language} подставляются из издания; если какая-то подстановка окажется пустой, ссылка для этого издания пропускается.',
  'customSources.add': 'Добавить источник',
  'customSources.listHeading': 'Ваши источники',
  'customSources.none': 'Пока нет своих источников.',
  'customSources.off': 'Выключен',
  'customSources.enable': 'Включить',
  'customSources.disable': 'Выключить',
  'customSources.remove': 'Удалить',
  'customSources.heading': 'Ваши источники',
  'customSources.caption':
    'Ссылки, которые вы настроили сами. Этот экземпляр не проверяет, куда они ведут.',

  'settings.customSources.title': 'Ваши источники',
  'settings.customSources.added': '«{name}» добавлен и будет предложен наравне с остальными.',
  'settings.customSources.removed': '«{name}» удалён из этого браузера.',
  'settings.customSources.enabled': '«{name}» снова включён.',
  'settings.customSources.disabled':
    '«{name}» выключен. Настройки сохранены, но ссылка не будет показана.',
  'settings.customSources.rejected': 'Ничего не добавлено: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Книги на вашем языке',
  'featured.inLanguageBlurb':
    'Книги, написанные на языке, на котором вы читаете этот сайт; сначала самые переиздаваемые — это порядок самой Open Library, а не рейтинг продаж.',
  'work.newSearch': 'Новый поиск',
  'work.descriptionFrom': 'Описание:',
  'work.descriptionNotLocalized':
    'Описание приводится так, как его написал источник, — на вашем языке для этой книги его пока нет.',
};
