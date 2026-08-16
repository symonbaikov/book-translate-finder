import type { Dictionary } from '../dictionary';

export const uk: Dictionary = {
  'nav.savedBooks': 'Збережені книжки',
  'nav.signIn': 'Увійти',
  'nav.signOut': 'Вийти',
  'nav.language': 'Мова',
  'nav.skipToContent': 'Перейти до вмісту',

  'footer.legal':
    'Лише законні джерела: пряме завантаження — виключно для суспільного надбання та відкритих ліцензій; книжки під авторським правом — купівля або бібліотечна видача. Кожне посилання має явно вказаний правовий статус.',
  'footer.openSource': 'Відкритий код',
  'footer.openSourceRest': '— ліцензія MIT, можна розгорнути у себе. Код на GitHub.',

  'home.title': 'Golden Library',
  'home.subtitle': 'Відкритий агрегатор перекладів книжок: мови, видання та законні джерела.',
  'home.searchLabel': 'Назва та автор',
  'home.searchPlaceholder': 'Війна і мир Толстой',
  'home.searchButton': 'Шукати',

  'search.searching': 'Шукаємо…',
  'search.backfilling': 'Поки порожньо — забираємо цю книжку з джерел. Це триває кілька секунд.',
  'search.notFound': 'За цим запитом нічого не знайдено.',
  'search.retry': 'Спробувати ще раз',
  'search.signInPrompt':
    ', щоб зберігати знайдені книжки й повертатися до них — і порівнювати видання різних років, перш ніж обрати.',

  'featured.yearHeading': 'Книжки року',
  'featured.yearBlurb':
    'Помітні книжки кожного недавнього року. Список складено вручну, це не рейтинг продажів — відкритих рейтингів не існує.',
  'featured.popularHeading': 'Багато читають, багато перекладають',
  'featured.popularBlurb': 'Книжки, що існують багатьма мовами, — заради цього сайт і зроблено.',
  'featured.filling': 'Частина книжок ще завантажується у фоні. Оновіть сторінку за хвилину.',
  'featured.freeCopy': 'Є безкоштовно',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Можна читати безкоштовно',
  'free.homeBlurb':
    'Книжки в суспільному надбанні та під відкритими ліцензіями — ця копія сайту віддає їх напряму.',
  'free.seeAll': 'Дивитися ще',
  'free.downloadable': 'Завантажити',
  'free.pageTitle': 'Безкоштовні книжки',
  'free.pageBlurb':
    'Кожна книжка тут має щонайменше одну легальну безкоштовну копію: суспільне надбання або дозвіл правовласника. Без купівлі й без читацького квитка.',
  'free.empty':
    'Поки що нічого безкоштовного. Безкоштовні копії з’являються, коли ця копія сайту завантажує книжки, — пошукайте книжку й загляньте сюди знову.',
  'free.emptyForLanguage':
    'Безкоштовних копій цією мовою ({language}) поки немає. Зніміть фільтр вище, щоб побачити всю полицю.',
  'free.showMore': 'Показати ще',
  'free.shown': 'Показано {shown} з {total}.',
  'free.allLanguages': 'Безкоштовні копії всіма мовами.',
  'free.filteredByLanguage': 'Лише безкоштовні копії мовою: {language}.',
  'free.filterByLanguage': 'Показати лише безкоштовні копії мовою: {language}.',
  'free.dropLanguageFilter': 'показати всі мови',
  'free.loadFailed': 'Зараз не вдалося завантажити безкоштовні книжки.',

  'work.original': 'оригінал',
  'work.dataSources': 'Джерела даних',
  'work.about': 'Про цю книжку',
  'work.translatedInto': 'Перекладено на',
  'work.availableIn': 'Доступні мови',
  'work.languagesNote':
    'Лише те, що перелічують наші джерела. Відсутність мови тут не означає, що перекладу немає.',
  'work.noTranslations': 'Перекладів поки не знайдено.',
  'work.yourLanguage.title': 'Вашою мовою',
  'work.yourLanguage.yes': 'Переклад є. Мова: {language}.',
  'work.yourLanguage.original': 'Це мова оригіналу: {language}.',
  'work.yourLanguage.no': 'Серед відомих видань перекладу немає. Мова: {language}.',
  'work.yourLanguage.show': 'Показати видання: {language}',
  'work.editions': 'Видання ({shown} з {total})',
  'work.filterLanguage': 'Мова',
  'work.filterAllLanguages': 'Усі мови',
  'work.filterYear': 'Рік',
  'work.filterApply': 'Фільтрувати',
  'work.filterReset': 'Скинути',
  'work.noEditionsMatch': 'Під ці фільтри не підходить жодне видання.',
  'work.showMoreEditions': 'Показати ще видання (лишилося {remaining})',
  'work.badgeFreeDownload': 'завантажити безкоштовно',
  'work.freeDownloadFormat': 'Завантажити {format}',
  'work.freeDownloadNote': '{rights}. Безкоштовно, джерело — {provider}: без акаунта й без оплати.',
  'work.badgeReadBorrow': 'читати або взяти',
  'work.badgeInBookstores': 'у магазинах',
  'work.translatedBy': 'переклад: {name}',
  'work.pages': '{count} с.',

  'bookmark.save': 'Зберегти книжку',
  'bookmark.saved': 'Збережено',
  'bookmark.signInToSave': 'Увійдіть, щоб зберегти',
  'bookmark.failed': 'Не вдалося зберегти. Спробуйте ще раз.',

  'links.show': 'Показати посилання',
  'links.hide': 'Сховати посилання',
  'links.loading': 'Завантажуємо посилання',
  'links.none': 'Для цього видання законних посилань поки немає.',
  'links.viaOtherEdition': 'безкоштовна копія з видання {label}',
  'links.failed': 'Не вдалося завантажити посилання.',
  'links.storesHeading': 'Знайти в магазині',
  'links.storesInCountry': 'У країні: {country}',
  'links.storesYourCountry': 'ваша країна',
  'links.storesLanguageMarket': 'Де продають книжки мовою: {language}',
  'links.storesLanguageMarketGeneric': 'Де продають книжки мовою цього видання',
  'links.storesWorldwide': 'Доставка по всьому світу',
  'links.storesCaption':
    'Кожне посилання шукає в каталозі самого магазину — наявність і ціну показує він сам.',

  'linkType.download': 'Завантажити',
  'linkType.buy': 'Купити',
  'linkType.borrow': 'Взяти в бібліотеці',
  'linkType.listen': 'Слухати (аудіокнижка)',
  'rights.public_domain': 'Суспільне надбання',
  'rights.open_license': 'Відкрита ліцензія',
  'rights.copyrighted': 'Під авторським правом',
  'rights.unknown': 'Статус невідомий',

  'compare.heading': 'Порівняти видання',
  'compare.blurb': 'Оберіть два або три видання, щоб побачити, чим вони справді різняться.',
  'compare.selected': 'Обрано {count}, потрібно щонайменше 2.',
  'compare.editSelection': 'Змінити видання',
  'compare.showAllEditions': 'Показати всі видання ({count})',
  'compare.columnDifference': 'Відмінність',
  'compare.identical': 'За всіма даними джерел ці видання ідентичні.',
  'compare.rowLanguage': 'Мова',
  'compare.rowPublished': 'Рік видання',
  'compare.rowPublisher': 'Видавництво',
  'compare.rowTranslator': 'Перекладач',
  'compare.rowTranslatedFrom': 'Переклад з мови',
  'compare.rowBinding': 'Оправа',
  'compare.rowPages': 'Сторінок',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Безкоштовна копія або видача',
  'compare.yes': 'так ({count})',
  'compare.no': 'не знайдено',

  'country.label': 'Де ви купуєте книжки?',
  'country.worldwideOnly': 'Лише магазини з доставкою по світу',

  'auth.signInTitle': 'Вхід',
  'auth.registerTitle': 'Створення акаунта',
  'auth.blurb':
    'Акаунт потрібен рівно для одного: зберігати знайдені книжки й повертатися до них — з мовами перекладів, переліком видань і тим, де кожне взяти законно. Без розсилок, профілю та стеження.',
  'auth.name': "Ім'я (необов'язково)",
  'auth.email': 'Пошта',
  'auth.password': 'Пароль',
  'auth.passwordHint':
    'Щонайменше {min} символів. Перевіряється лише довжина — довга фраза, яку ви запамʼятаєте, краща за коротку з пунктуацією.',
  'auth.submitSignIn': 'Увійти',
  'auth.submitRegister': 'Створити акаунт',
  'auth.working': 'Виконуємо…',
  'auth.google': 'Увійти через Google',
  'auth.toRegister': 'Немає акаунта? Створіть',
  'auth.toSignIn': 'Уже маєте акаунт? Увійдіть',
  'auth.backToSearch': 'Повернутися до пошуку',
  'auth.errorGoogleState':
    'Посилання для входу застаріло або відкрите в іншому браузері. Спробуйте ще раз.',
  'auth.errorGoogleFailed': 'Вхід через Google не завершився. Можна увійти поштою та паролем.',
  'auth.errorGeneric': 'Щось пішло не так.',

  'bookmarks.title': 'Збережені книжки',
  'bookmarks.signedOut':
    ', щоб зберігати знайдені книжки — і згодом порівнювати видання однієї книжки між собою.',
  'bookmarks.loading': 'Завантажуємо…',
  'bookmarks.empty':
    'Поки нічого не збережено. Знайдіть книжку та натисніть «Зберегти книжку» на її картці.',
  'bookmarks.searchLink': 'Шукати',
  'bookmarks.remove': 'Прибрати',
  'bookmarks.loadFailed': 'Не вдалося завантажити збережені книжки.',
  'search.failed': 'Пошук не вдався.',
  'search.pending': 'У нашій базі цього поки немає — перевіряємо джерела',
  'search.pendingLong':
    'Ще шукаємо: перший запит щодо книжки збирає дані з джерел, це може тривати кілька хвилин',
  'search.notFoundHint': 'Нічого не знайшлося. Спробуйте уточнити назву або автора.',
  'search.timedOut':
    'Джерела відповідають повільно, даних поки немає. Фонова синхронізація могла вже завершитися — спробуйте ще раз.',
  'search.freeOnlyToggle': 'Є безкоштовно',
  'search.noFreeResults':
    'Серед цих результатів поки немає безкоштовних — спробуйте вимкнути фільтр.',
  'home.tagline': 'Знайдіть свій наступний magnum opus',
  'subject.allLanguages': 'Усі мови.',
  'subject.filteredByLanguage': 'Лише книжки з виданням мовою: {language}.',
  'subject.dropLanguageFilter': 'показати всі мови',
  'subject.empty':
    'Під цим тегом поки нічого немає. Теги беруться з книжок, які ця копія вже завантажила.',
  'featured.year': '{year}',
  'nav.browse': 'За жанрами',
  'recommend.heading': 'На основі того, що ви читали',
  'recommend.becauseOf': 'Ви відкривали «{title}» — ось книжки тих самих жанрів.',
  'recommend.blurb': 'Книжки тих жанрів, які ви відкривали.',
  'recommend.privacy':
    'Це обчислюється у вашому браузері — серверу повідомляються жанри, але не те, хто ви.',
  'recommend.forget': 'забути мою історію',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Полиця',
  'shelf.title': 'Полиця',
  'shelf.intro':
    'Відкриті каталоги та будь-який бібліотечний сервер, який ви тримаєте самі. Додані каталоги лишаються в цьому браузері й ніколи не надсилаються на сайт.',
  'shelf.openCatalogs': 'Відкриті каталоги',
  'shelf.yourCatalogs': 'Ваші каталоги',
  'shelf.addCatalog': 'Додати каталог',
  'shelf.name': 'Назва',
  'shelf.address': 'Адреса OPDS',
  'shelf.username': "Ім'я користувача (необов'язково)",
  'shelf.password': "Пароль (необов'язково)",
  'shelf.credentialsNote': 'Адреса та будь-які облікові дані зберігаються лише в цьому браузері.',
  'shelf.add': 'Додати',
  'shelf.remove': 'Вилучити',
  'shelf.loading': 'Завантажуємо каталог…',
  'shelf.empty': 'У цьому каталозі немає записів.',
  'shelf.noCatalogs':
    'Своїх поки немає. Додайте нижче адресу Calibre-Web, COPS, Kavita або Audiobookshelf.',
  'shelf.unreachable':
    'Браузер не зміг прочитати цей каталог. Сервер у вашій мережі працюватиме; публічні сайти часто забороняють міжсайтові запити.',
  'shelf.nextPage': 'Наступна сторінка',
  'shelf.previousPage': 'Попередня сторінка',
  'shelf.drm': 'Потрібен застосунок із DRM',
  'shelf.notFree': 'Не безкоштовне завантаження',
  'shelf.download': 'Завантажити',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Книгарні поруч',
  'stores.useMyLocation': 'Визначити моє місцеположення',
  'stores.placeLabel': 'Місто або поштовий індекс',
  'stores.find': 'Знайти',
  'stores.locating': 'Шукаємо…',
  'stores.failed': 'Місцеположення недоступне. Введіть місто або індекс.',
  'stores.none': 'У радіусі {radius} км книгарень на мапі немає.',
  'stores.distance': '{distance} км від вас',
  'stores.stockUnknown': 'Лише дані мапи — ніхто не публікує, що є в книгарні в наявності.',
  'stores.lookupFailed':
    'Зараз не вдалося звʼязатися з OpenStreetMap. Спробуйте ще раз за хвилину.',
  'stores.privacy':
    'Ваші координати округлюються приблизно до 100 м і надсилаються лише до OpenStreetMap — ніколи на цей сайт.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Ціни та магазини',
  'prices.loading': 'Питаємо магазини…',
  'prices.unknown': 'Ціну не опубліковано',
  'prices.degraded': 'Не відповіли: {providers}',
  'prices.format.hardcover': 'Тверда палітурка',
  'prices.format.paperback': "М'яка обкладинка",
  'prices.format.ebook': 'Електронна книга',
  'prices.format.audiobook': 'Аудіокнига',
  'prices.format.unknown': 'Формат не вказано',
  'recommend.hideGenre': 'сховати «{genre}»',
  'recommend.hiddenList': 'Приховані жанри (натисніть, щоб повернути):',

  // --- Спливаючі вікна налаштувань ---
  'settings.status.saved': 'Збережено',
  'settings.status.cleared': 'Скинуто',
  'settings.status.unstored': 'Не збережено',
  'settings.status.failed': 'Без змін',
  'settings.notStored':
    'Браузер відмовився зберегти зміну, тож нічого не сталося — діє попереднє значення.',
  'settings.language.title': 'Мова інтерфейсу',
  'settings.language.changed':
    'Змінено з {from} на {to}. Інтерфейс перезавантажується мовою {to}; назви книжок та імена авторів лишаються своїми мовами.',
  'settings.country.title': 'Країна покупок',
  'settings.country.changed':
    'Обрано: {country}. У посиланнях на книгарні тепер є ті, що доставляють туди, разом із міжнародними.',
  'settings.country.cleared':
    'Країну не обрано. Пропонуватимуться лише книгарні з доставкою по всьому світу.',
  'settings.bookLanguage.title': 'Мова книжок',
  'settings.bookLanguage.changed':
    'Обрано: {language}. На сторінках жанрів спершу будуть книжки з виданням мовою {language} — доки ви не скинете фільтр.',
  'settings.bookLanguage.cleared':
    'Скинуто. На сторінках жанрів знову показуються книжки всіма мовами.',
  'settings.hiddenGenres.title': 'Приховані жанри',
  'settings.hiddenGenres.hidden':
    'Жанр «{genre}» приховано. Він більше не надсилається на сервер під час запиту рекомендацій; усього приховано жанрів: {count}.',
  'settings.hiddenGenres.restored':
    'Жанр «{genre}» знову в рекомендаціях. Ще приховано жанрів: {count}.',
  'settings.history.title': 'Історія читання',
  'settings.history.cleared':
    'Відкриті вами книжки видалено з цього браузера. Рекомендації не з’являться, доки ви не відкриєте наступну книжку.',
  'settings.bookmarks.title': 'Збережені книжки',
  'settings.bookmarks.added': '«{title}» додано до збережених книжок.',
  'settings.bookmarks.removed': '«{title}» вилучено зі збережених книжок.',
  'settings.bookmarks.failed':
    'Сервер не прийняв зміну, тож список збережених книжок лишився без змін.',
  'settings.catalogs.title': 'Ваші каталоги',
  'settings.catalogs.added':
    'Каталог «{name}» додано за адресою {url}. Його адреса лишається в цьому браузері й ніколи не надсилається на цей сайт.',
  'settings.catalogs.addedWithCredentials':
    'Каталог «{name}» додано за адресою {url} разом із введеними логіном і паролем. Усе це лишається в цьому браузері й не надсилається на цей сайт.',
  'settings.catalogs.removed':
    'Каталог «{name}» вилучено з цього браузера разом із збереженими для нього обліковими даними.',
  'settings.catalogs.rejected': 'Нічого не додано: {reason}',
  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Доповнення',
  'addons.title': 'Доповнення',
  'addons.intro':
    'Доповнення додає власні джерела. Ви встановлюєте його, вставивши адресу; воно працює або на вашому пристрої в пісочниці, або на сервері свого автора. Golden Library не постачає доповнень, не веде їхнього списку й не перевіряє, що вони повертають.',
  'addons.addressLabel': 'Адреса доповнення',
  'addons.addressHint': 'Посилання на маніфест, яке дав автор доповнення.',
  'addons.continue': 'Далі',
  'addons.fromServer': 'З сервера',
  'addons.fromFile': 'З файлу, на вашому пристрої',
  'addons.bundleLabel': 'Адреса коду доповнення',
  'addons.bundleHint':
    'Посилання на код доповнення. Він виконуватиметься на цьому пристрої, а не на сервері.',
  'addons.integrityLabel': 'Хеш цілісності',
  'addons.integrityHint':
    'Його дає автор доповнення, у вигляді sha256-… . Обовʼязковий: без нього одного разу схвалений код міг би потім змінитися, а ви б про це не дізналися.',
  'addons.checking': 'Читаємо доповнення…',
  'addons.installedHeading': 'Встановлені',
  'addons.none': 'Доповнень поки немає. Усе, що ви бачите на сайті, надходить від самого інстансу.',
  'addons.priorityHint': 'Порядок — це пріоритет: перше доповнення відповідає першим.',
  'addons.enable': 'Увімкнути',
  'addons.disable': 'Вимкнути',
  'addons.off': 'Вимкнено',
  'addons.remove': 'Видалити',
  'addons.moveUp': 'Вище',
  'addons.moveDown': 'Нижче',
  'addons.configure': 'Налаштувати',
  'addons.failedToStart': 'Доповнення «{name}» не запустилося: {reason}',
  'addons.consentTitle': 'Встановити «{name}»?',
  'addons.consentHosts': 'Воно звертатиметься до: {hosts}',
  'addons.consentNoHosts': 'Воно не запитало доступу до жодної адреси.',
  'addons.consentSeesYou':
    'Це доповнення працює на сервері свого автора. Він побачить вашу адресу й усе, що ви через нього шукаєте.',
  'addons.consentSandboxed':
    'Це доповнення працює на вашому пристрої в пісочниці. Воно не може прочитати ваші куки, дані цього сайту чи будь-що інше, що у вас відкрито.',
  'addons.consentNotVetted':
    'Golden Library не перевіряє, що повертає доповнення, і не рекомендувала це. Що встановлювати — ваш вибір.',
  'addons.install': 'Встановити',
  'addons.cancel': 'Скасувати',
  'addons.via': 'через {name}',
  'addons.sourcesTitle': 'Від ваших доповнень',
  'addons.searchTitle': 'Знайдено вашими доповненнями',
  'addons.showLinks': 'Показати посилання для завантаження',
  'addons.unreadable': 'Записів від цього доповнення не вдалося прочитати: {count}.',
  'addons.browse': 'Переглянути каталог',
  'addons.browseTitle': 'Каталог «{name}»',
  'addons.browseNoCatalog': 'Це доповнення не пропонує каталогу для перегляду.',
  'addons.browseEmpty': 'Каталог цього доповнення поки що порожній.',
  'addons.browseFailed': 'Не вдалося завантажити каталог «{name}»: {reason}',
  'addons.loadMore': 'Показати ще',
  'addons.notInstalled': 'Це доповнення не встановлено.',

  'settings.addons.title': 'Ваші доповнення',
  'settings.addons.installed':
    'Доповнення «{name}» встановлено. Його питатимуть нарівні з іншими, і воно може звертатися до {hosts}.',
  'settings.addons.removed':
    'Доповнення «{name}» видалено. Його результати зникли з цього браузера разом з усім, що воно тут зберігало.',
  'settings.addons.enabled': 'Доповнення «{name}» знову увімкнено і буде опитуватися з усіма.',
  'settings.addons.disabled':
    'Доповнення «{name}» вимкнено. Воно лишається встановленим разом зі своїми налаштуваннями, але нічого з того, що воно повертає, показано не буде.',
  'settings.addons.reordered': 'Доповнення «{name}» тепер відповідає {position}-м з {total}.',
  'settings.addons.rejected': 'Нічого не встановлено: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Власні джерела',
  'customSources.title': 'Власні джерела',
  'customSources.intro':
    'Додайте власний магазин чи каталог, надавши йому назву та URL пошуку з {isbn}, {query}, {title}, {author} або {language}. Посилання будується на цьому пристрої, і цей сайт ніколи його не запитує.',
  'customSources.nameLabel': 'Назва',
  'customSources.templateLabel': 'Шаблон URL',
  'customSources.templateHint':
    'Абсолютна адреса https://. {isbn}, {query}, {title}, {author} і {language} підставляються з видання; якщо якась підстановка залишиться порожньою, посилання для цього видання пропускається.',
  'customSources.add': 'Додати джерело',
  'customSources.listHeading': 'Ваші джерела',
  'customSources.none': 'Поки що немає власних джерел.',
  'customSources.off': 'Вимкнено',
  'customSources.enable': 'Увімкнути',
  'customSources.disable': 'Вимкнути',
  'customSources.remove': 'Видалити',
  'customSources.heading': 'Ваші джерела',
  'customSources.caption':
    'Посилання, які ви налаштували самі. Цей екземпляр не перевіряє, куди вони ведуть.',

  'settings.customSources.title': 'Ваші власні джерела',
  'settings.customSources.added': '«{name}» додано, і його пропонуватимуть нарівні з іншими.',
  'settings.customSources.removed': '«{name}» видалено з цього браузера.',
  'settings.customSources.enabled': '«{name}» знову увімкнено.',
  'settings.customSources.disabled':
    '«{name}» вимкнено. Налаштування збережено, але посилання не показуватиметься.',
  'settings.customSources.rejected': 'Нічого не додано: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Книжки вашою мовою',
  'featured.inLanguageBlurb':
    'Книжки, написані мовою, якою ви читаєте цей сайт; спершу найчастіше перевидані — це порядок самої Open Library, а не рейтинг продажів.',
  'work.newSearch': 'Новий пошук',
  'work.descriptionFrom': 'Опис:',
  'work.descriptionNotLocalized':
    'Опис подано так, як його написало джерело, — вашою мовою для цієї книжки його поки немає.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Читати у браузері',
  'reader.privacy':
    'Книжку відкриває сам ваш браузер. Ані файл, ані те, звідки він узятий, ані те, доки ви дочитали, на цей сайт не потрапляють.',
  'reader.chooseFile': 'Відкрити книжку з цього пристрою',
  'reader.formats': 'EPUB, FB2, MOBI та CBZ.',
  'reader.loading': 'Відкриваємо…',
  'reader.failed': 'Не вдалося відкрити книжку: {reason}',
  'reader.previous': 'Попередня сторінка',
  'reader.next': 'Наступна сторінка',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…або перетягніть книжку сюди',
  'reader.fetching': 'Запитуємо файл у {host}…',
  'reader.blockedTitle': '{host} не віддав файл цій сторінці',
  'reader.blockedBody':
    'Або він недоступний, або не дозволяє іншим сайтам читати свої файли. Цей сайт не завантажуватиме його за вас: ваша книжка крізь нього не проходить — саме заради цього читання тут і влаштоване.',
  'reader.blockedDownload': 'Завантажити з {host}',
  'reader.blockedOpenHere': 'і відкрити тут зі свого пристрою',
  'reader.blockedAddon': 'Аддон, який віддає файл сам, теж підійде.',
  'reader.keepFile': 'Зберігати цю книжку в цьому браузері',
  'reader.keepFileHint':
    'Типово вимкнено. Без цього файл зникне із закриттям вкладки; з ним — залишиться лише на цьому пристрої.',
  'reader.library': 'Зберігається в цьому браузері',
  'reader.libraryEmpty':
    'Поки нічого не збережено. Збережені книжки залишаються на цьому пристрої й нікуди не завантажуються.',
  'reader.libraryOpen': 'Відкрити',
  'reader.libraryRemove': 'Видалити',
  'reader.libraryFileKept': 'файл збережено',
  'reader.libraryFileGone': 'файл не збережено',
  'reader.untitled': 'Книжка без назви',
  'settings.reader.title': 'Книжки в цьому браузері',
  'settings.reader.kept':
    '«{title}» тепер зберігається на цьому пристрої й відкривається без повторного завантаження. Нікуди не надсилається.',
  'settings.reader.forgotten':
    'Файл «{title}» видалено з цього браузера. Запис лишився — книжку можна відкрити з джерела знову.',
  'settings.reader.removed': '«{title}» видалено з цього браузера повністю — і файл, і запис.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Відкрито з того місця, де ви спинилися, — {percent}%.',
  'reader.bookmarks': 'Закладки',
  'reader.bookmarkAdd': 'Закласти цю сторінку',
  'reader.bookmarkNone': 'У цій книжці поки немає закладок.',
  'reader.bookmarkGo': 'Перейти',
  'reader.bookmarkRemove': 'Прибрати закладку',
  'reader.bookmarkNote': 'Нотатка',
  'reader.bookmarkNotePlaceholder': 'Ваші слова про цю сторінку',
  'reader.bookmarkAt': '{percent}%',
  'settings.reader.bookmarkTitle': 'Закладки в цьому браузері',
  'settings.reader.bookmarkAdded':
    'Закладка на {percent}% книжки «{title}». Закладки залишаються на цьому пристрої разом із книжкою.',
  'settings.reader.bookmarkRemoved': 'Закладку в «{title}» видалено з цього браузера.',
  'settings.reader.noteSaved':
    'Вашу нотатку до цієї сторінки «{title}» збережено на цьому пристрої.',
  'settings.reader.positionTitle': 'Позиція читання',
  'settings.reader.positionUnstored':
    'Браузер не зберіг, де ви спинилися в «{title}», — наступного разу книжка відкриється спочатку. Так буває в приватному режимі та при заповненому диску.',
};
