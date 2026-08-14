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

  'home.title': 'BookTranslate Finder',
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
    'По одной заметной книге на каждый недавний год. Список составлен вручную, это не рейтинг продаж — открытых рейтингов не существует.',
  'featured.popularHeading': 'Много читают, много переводят',
  'featured.popularBlurb': 'Книги, существующие на многих языках, — ради этого сайт и сделан.',
  'featured.filling': 'Часть книг ещё подгружается в фоне. Обновите страницу через минуту.',
  'featured.freeCopy': 'Есть бесплатно',

  'work.original': 'оригинал',
  'work.dataSources': 'Источники данных',
  'work.about': 'Об этой книге',
  'work.translatedInto': 'Переведена на',
  'work.noTranslations': 'Переводы пока не найдены.',
  'work.editions': 'Издания ({shown} из {total})',
  'work.filterLanguage': 'Язык',
  'work.filterAllLanguages': 'Все языки',
  'work.filterYear': 'Год',
  'work.filterApply': 'Отфильтровать',
  'work.filterReset': 'Сбросить',
  'work.noEditionsMatch': 'Под эти фильтры не подходит ни одно издание.',
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
  'compare.columnDifference': 'Отличие',
  'compare.identical': 'По всем данным источников эти издания идентичны.',
  'compare.rowLanguage': 'Язык',
  'compare.rowPublished': 'Год издания',
  'compare.rowPublisher': 'Издательство',
  'compare.rowTranslator': 'Переводчик',
  'compare.rowTranslatedFrom': 'Перевод с языка',
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
  'home.tagline': 'Найдите свой следующий magnum opus',
  'subject.allLanguages': 'Все языки.',
  'subject.filteredByLanguage': 'Только книги с изданием на языке: {language}.',
  'subject.dropLanguageFilter': 'показать все языки',
  'subject.empty':
    'Под этим тегом пока ничего нет. Теги берутся из книг, которые эта копия уже загрузила.',
  'featured.year': '{year}',
  'nav.browse': 'По жанрам',
};
