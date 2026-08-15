import type { Dictionary } from '../dictionary';

export const es: Dictionary = {
  'nav.savedBooks': 'Libros guardados',
  'nav.signIn': 'Iniciar sesión',
  'nav.signOut': 'Cerrar sesión',
  'nav.language': 'Idioma',
  'nav.skipToContent': 'Ir al contenido',

  'footer.legal':
    'Solo fuentes legales: descarga directa exclusivamente para obras de dominio público y con licencia abierta; libros con derechos de autor — compra o préstamo bibliotecario. Cada enlace indica explícitamente su estado legal.',
  'footer.openSource': 'Código abierto',
  'footer.openSourceRest': '— licencia MIT, alojable por ti. Código en GitHub.',

  'home.title': 'Golden Library',
  'home.subtitle':
    'Un agregador abierto de traducciones de libros: idiomas, ediciones y fuentes legales.',
  'home.searchLabel': 'Título y autor',
  'home.searchPlaceholder': 'Guerra y paz Tolstói',
  'home.searchButton': 'Buscar',

  'search.searching': 'Buscando…',
  'search.backfilling':
    'Aún no hay nada — estamos trayendo este libro de las fuentes. Tarda unos segundos.',
  'search.notFound': 'No se encontró nada para esta búsqueda.',
  'search.retry': 'Intentar de nuevo',
  'search.signInPrompt':
    ' para guardar los libros que encuentres y volver a ellos — y comparar ediciones de distintos años antes de elegir una.',

  'featured.yearHeading': 'Libros del año',
  'featured.yearBlurb':
    'Libros destacados de cada año reciente. Una lista elegida a mano, no una lista de ventas — no existe ninguna fuente abierta que las publique.',
  'featured.popularHeading': 'Muy leídos, muy traducidos',
  'featured.popularBlurb':
    'Libros que existen en muchos idiomas — que es justo para lo que sirve este sitio.',
  'featured.filling': 'Algunos se están trayendo en segundo plano. Recarga la página en un minuto.',
  'featured.freeCopy': 'Copia gratuita',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Gratis para leer ahora',
  'free.homeBlurb':
    'Libros de dominio público y con licencia abierta que esta copia del sitio entrega directamente.',
  'free.seeAll': 'Ver más',
  'free.downloadable': 'Descargar',
  'free.pageTitle': 'Libros gratuitos',
  'free.pageBlurb':
    'Cada libro de aquí tiene al menos una copia gratuita legal: dominio público o cedida por el titular de los derechos. Sin compra y sin carné de biblioteca.',
  'free.empty':
    'Todavía no hay nada gratuito. Las copias gratuitas aparecen a medida que esta instancia obtiene libros: busca uno y vuelve por aquí.',
  'free.emptyForLanguage':
    'Todavía no hay copias gratuitas en {language}. Quita el filtro de arriba para ver toda la estantería.',
  'free.showMore': 'Mostrar más',
  'free.shown': 'Mostrando {shown} de {total}.',
  'free.allLanguages': 'Copias gratuitas en todos los idiomas.',
  'free.filteredByLanguage': 'Solo copias gratuitas en {language}.',
  'free.filterByLanguage': 'Mostrar solo las copias gratuitas en {language}.',
  'free.dropLanguageFilter': 'mostrar todos los idiomas',
  'free.loadFailed': 'No se han podido cargar los libros gratuitos ahora mismo.',

  'work.original': 'original',
  'work.dataSources': 'Fuentes de datos',
  'work.about': 'Sobre este libro',
  'work.translatedInto': 'Traducido a',
  'work.availableIn': 'Disponible en',
  'work.languagesNote':
    'Solo lo que registran nuestras fuentes: una traducción ausente aquí puede existir igualmente.',
  'work.noTranslations': 'Aún no se han encontrado traducciones.',
  'work.yourLanguage.title': 'En tu idioma',
  'work.yourLanguage.yes': 'Existe una traducción al {language}.',
  'work.yourLanguage.original': 'Este libro se escribió en {language}.',
  'work.yourLanguage.no': 'No hay traducción al {language} entre las ediciones conocidas.',
  'work.yourLanguage.show': 'Ver ediciones en {language}',
  'work.editions': 'Ediciones ({shown} de {total})',
  'work.filterLanguage': 'Idioma',
  'work.filterAllLanguages': 'Todos los idiomas',
  'work.filterYear': 'Año',
  'work.filterApply': 'Filtrar',
  'work.filterReset': 'Restablecer',
  'work.noEditionsMatch': 'Ninguna edición coincide con estos filtros.',
  'work.showMoreEditions': 'Mostrar más ediciones (quedan {remaining})',
  'work.badgeFreeDownload': 'descarga gratuita',
  'work.freeDownloadFormat': 'Descargar {format}',
  'work.freeDownloadNote': '{rights}. Gratis desde {provider}: sin cuenta y sin pago.',
  'work.badgeReadBorrow': 'leer o tomar prestado',
  'work.badgeInBookstores': 'en librerías',
  'work.translatedBy': 'traducido por {name}',
  'work.pages': '{count} páginas',

  'bookmark.save': 'Guardar este libro',
  'bookmark.saved': 'Guardado',
  'bookmark.signInToSave': 'Inicia sesión para guardar',
  'bookmark.failed': 'No se pudo guardar. Inténtalo de nuevo.',

  'links.show': 'Mostrar enlaces',
  'links.hide': 'Ocultar enlaces',
  'links.loading': 'Cargando enlaces',
  'links.none': 'Todavía no hay enlaces legales para esta edición.',
  'links.viaOtherEdition': 'copia gratuita de la edición {label}',
  'links.failed': 'No se pudieron cargar los enlaces.',
  'links.storesHeading': 'Encontrar en una librería',
  'links.storesInCountry': 'En {country}',
  'links.storesYourCountry': 'tu país',
  'links.storesLanguageMarket': 'Dónde se venden libros en {language}',
  'links.storesLanguageMarketGeneric': 'Dónde se venden libros en el idioma de esta edición',
  'links.storesWorldwide': 'Envío a todo el mundo',
  'links.storesCaption':
    'Cada enlace busca en el catálogo de la propia librería — la disponibilidad y el precio los muestra ella.',

  'linkType.download': 'Descargar',
  'linkType.buy': 'Comprar',
  'linkType.borrow': 'Pedir prestado en una biblioteca',
  'linkType.listen': 'Escuchar (audiolibro)',
  'rights.public_domain': 'Dominio público',
  'rights.open_license': 'Licencia abierta',
  'rights.copyrighted': 'Con derechos de autor',
  'rights.unknown': 'Estado desconocido',

  'compare.heading': 'Comparar ediciones',
  'compare.blurb': 'Elige dos o tres ediciones para ver en qué se diferencian realmente.',
  'compare.selected': 'Seleccionadas {count}, hacen falta al menos 2.',
  'compare.editSelection': 'Cambiar ediciones',
  'compare.showAllEditions': 'Mostrar las {count} ediciones',
  'compare.columnDifference': 'Diferencia',
  'compare.identical': 'En todo lo que registran las fuentes, estas ediciones son idénticas.',
  'compare.rowLanguage': 'Idioma',
  'compare.rowPublished': 'Publicación',
  'compare.rowPublisher': 'Editorial',
  'compare.rowTranslator': 'Traductor',
  'compare.rowTranslatedFrom': 'Traducido del',
  'compare.rowBinding': 'Encuadernación',
  'compare.rowPages': 'Páginas',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Copia gratuita o en préstamo',
  'compare.yes': 'sí ({count})',
  'compare.no': 'no encontrada',

  'country.label': '¿Dónde compras libros?',
  'country.worldwideOnly': 'Solo librerías con envío mundial',

  'auth.signInTitle': 'Iniciar sesión',
  'auth.registerTitle': 'Crear una cuenta',
  'auth.blurb':
    'La cuenta existe por un solo motivo: guardar los libros que encuentres y volver a ellos — con los idiomas a los que se tradujeron, las ediciones que existen y dónde conseguir cada una legalmente. Sin boletines, sin perfil, sin rastreo.',
  'auth.name': 'Nombre (opcional)',
  'auth.email': 'Correo electrónico',
  'auth.password': 'Contraseña',
  'auth.passwordHint':
    'Al menos {min} caracteres. Solo se comprueba la longitud — una frase larga que recuerdes vale más que una corta con signos de puntuación.',
  'auth.submitSignIn': 'Iniciar sesión',
  'auth.submitRegister': 'Crear cuenta',
  'auth.working': 'Un momento…',
  'auth.google': 'Continuar con Google',
  'auth.toRegister': '¿Aún no tienes cuenta? Crea una',
  'auth.toSignIn': '¿Ya tienes cuenta? Inicia sesión',
  'auth.backToSearch': 'Volver a la búsqueda',
  'auth.errorGoogleState':
    'Ese enlace de inicio de sesión caducó o se abrió en otro navegador. Inténtalo de nuevo.',
  'auth.errorGoogleFailed':
    'El inicio de sesión con Google no se completó. Puedes usar un correo y una contraseña.',
  'auth.errorGeneric': 'Algo salió mal.',

  'bookmarks.title': 'Libros guardados',
  'bookmarks.signedOut':
    ' para conservar los libros que encuentres — y comparar más tarde ediciones del mismo libro.',
  'bookmarks.loading': 'Cargando…',
  'bookmarks.empty':
    'Todavía no hay nada guardado. Busca un libro y usa «Guardar este libro» en su ficha.',
  'bookmarks.searchLink': 'Buscar',
  'bookmarks.remove': 'Quitar',
  'bookmarks.loadFailed': 'No se pudieron cargar tus libros guardados.',
  'search.failed': 'La búsqueda falló.',
  'search.pending': 'Todavía no está en nuestra base — estamos consultando las fuentes',
  'search.pendingLong':
    'Seguimos buscando: la primera consulta de un libro recopila datos de las fuentes y puede tardar un par de minutos',
  'search.notFoundHint': 'No se encontró nada. Prueba a precisar el título o el autor.',
  'search.timedOut':
    'Las fuentes responden con lentitud y aún no tenemos datos. La sincronización en segundo plano puede haber terminado ya — inténtalo de nuevo.',
  'search.freeOnlyToggle': 'Descarga gratuita',
  'search.noFreeResults':
    'Ninguno de estos tiene descarga gratuita todavía — prueba a desactivar el filtro.',
  'home.tagline': 'Encuentra tu próximo magnum opus',
  'subject.allLanguages': 'Todos los idiomas.',
  'subject.filteredByLanguage': 'Solo libros con una edición en {language}.',
  'subject.dropLanguageFilter': 'mostrar todos los idiomas',
  'subject.empty':
    'Todavía no hay nada con esta etiqueta. Las etiquetas provienen de los libros que esta instancia ya ha obtenido.',
  'featured.year': '{year}',
  'nav.browse': 'Por género',
  'recommend.heading': 'A partir de lo que has leído',
  'recommend.becauseOf': 'Abriste «{title}», así que aquí tienes libros de sus mismos géneros.',
  'recommend.blurb': 'Libros de los géneros que has estado abriendo.',
  'recommend.privacy':
    'Esto se calcula en tu navegador — al servidor se le dicen los géneros, nunca quién eres.',
  'recommend.forget': 'olvidar mi historial',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Estantería',
  'shelf.title': 'Estantería',
  'shelf.intro':
    'Catálogos abiertos y cualquier servidor de biblioteca que usted mismo aloje. Los catálogos que añada permanecen en este navegador y nunca se envían a este sitio.',
  'shelf.openCatalogs': 'Catálogos abiertos',
  'shelf.yourCatalogs': 'Sus catálogos',
  'shelf.addCatalog': 'Añadir un catálogo',
  'shelf.name': 'Nombre',
  'shelf.address': 'Dirección OPDS',
  'shelf.username': 'Usuario (opcional)',
  'shelf.password': 'Contraseña (opcional)',
  'shelf.credentialsNote': 'La dirección y las credenciales se guardan solo en este navegador.',
  'shelf.add': 'Añadir',
  'shelf.remove': 'Quitar',
  'shelf.loading': 'Cargando catálogo…',
  'shelf.empty': 'Este catálogo no tiene entradas.',
  'shelf.noCatalogs':
    'Todavía ninguno propio. Añada abajo una dirección de Calibre-Web, COPS, Kavita o Audiobookshelf.',
  'shelf.unreachable':
    'Su navegador no pudo leer este catálogo. Un servidor de su propia red funcionará; los sitios públicos suelen rechazar las peticiones de origen cruzado.',
  'shelf.nextPage': 'Página siguiente',
  'shelf.previousPage': 'Página anterior',
  'shelf.drm': 'Requiere una aplicación con DRM',
  'shelf.notFree': 'No es una descarga gratuita',
  'shelf.download': 'Descargar',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Librerías cerca de usted',
  'stores.useMyLocation': 'Usar mi ubicación',
  'stores.placeLabel': 'Ciudad o código postal',
  'stores.find': 'Buscar',
  'stores.locating': 'Buscando…',
  'stores.failed': 'Ubicación no disponible. Escriba una ciudad o un código postal.',
  'stores.none': 'No hay librerías cartografiadas en {radius} km a la redonda.',
  'stores.distance': 'a {distance} km',
  'stores.stockUnknown':
    'Solo datos del mapa: nadie publica lo que una librería tiene en existencias.',
  'stores.lookupFailed':
    'No se pudo contactar con OpenStreetMap ahora mismo. Inténtelo de nuevo en un momento.',
  'stores.privacy':
    'Su ubicación se redondea a unos 100 m y se envía solo a OpenStreetMap, nunca a este sitio.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Precios y librerías',
  'prices.loading': 'Preguntando a las librerías…',
  'prices.unknown': 'Precio no publicado',
  'prices.degraded': 'Sin respuesta de: {providers}',
  'prices.format.hardcover': 'Tapa dura',
  'prices.format.paperback': 'Tapa blanda',
  'prices.format.ebook': 'Libro electrónico',
  'prices.format.audiobook': 'Audiolibro',
  'prices.format.unknown': 'Formato no indicado',
  'recommend.hideGenre': 'ocultar «{genre}»',
  'recommend.hiddenList': 'Géneros ocultos (haz clic para recuperar uno):',

  // --- Ventanas emergentes de ajustes ---
  'settings.status.saved': 'Guardado',
  'settings.status.cleared': 'Restablecido',
  'settings.status.unstored': 'Sin guardar',
  'settings.status.failed': 'Sin cambios',
  'settings.notStored':
    'Este navegador se negó a guardar el cambio, así que no pasó nada: sigue vigente el valor anterior.',
  'settings.language.title': 'Idioma de la interfaz',
  'settings.language.changed':
    'Cambiado de {from} a {to}. La interfaz se recarga en {to}; los títulos y los nombres de autores se mantienen en su idioma.',
  'settings.country.title': 'País de compra',
  'settings.country.changed':
    'Establecido en {country}. Los enlaces a librerías ahora incluyen tiendas que envían allí, junto a las internacionales.',
  'settings.country.cleared':
    'Ningún país elegido. Solo se ofrecerán librerías con envío a todo el mundo.',
  'settings.bookLanguage.title': 'Idioma de los libros',
  'settings.bookLanguage.changed':
    'Establecido en {language}. Las páginas de géneros mostrarán primero los libros con edición en {language} hasta que restablezcas el filtro.',
  'settings.bookLanguage.cleared':
    'Restablecido. Las páginas de géneros vuelven a mostrar libros en todos los idiomas.',
  'settings.hiddenGenres.title': 'Géneros ocultos',
  'settings.hiddenGenres.hidden':
    '«{genre}» está oculto. Ya no se envía al servidor al pedir sugerencias, y hay {count} géneros ocultos en total.',
  'settings.hiddenGenres.restored':
    '«{genre}» vuelve a tus sugerencias. Siguen ocultos {count} géneros.',
  'settings.history.title': 'Historial de lectura',
  'settings.history.cleared':
    'Los libros que habías abierto se han borrado de este navegador. Las sugerencias no volverán hasta que abras otro libro.',
  'settings.bookmarks.title': 'Libros guardados',
  'settings.bookmarks.added': '«{title}» se ha añadido a tus libros guardados.',
  'settings.bookmarks.removed': '«{title}» se ha quitado de tus libros guardados.',
  'settings.bookmarks.failed':
    'El servidor no aceptó el cambio, así que tus libros guardados siguen igual.',
  'settings.catalogs.title': 'Tus catálogos',
  'settings.catalogs.added':
    '«{name}» se ha añadido en {url}. Su dirección se queda en este navegador y nunca se envía a este sitio.',
  'settings.catalogs.addedWithCredentials':
    '«{name}» se ha añadido en {url}, con el usuario y la contraseña que escribiste. Todo ello se queda en este navegador y nada se envía a este sitio.',
  'settings.catalogs.removed':
    '«{name}» se ha eliminado de este navegador, junto con las credenciales guardadas para él.',
  'settings.catalogs.rejected': 'No se añadió nada: {reason}',
  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Complementos',
  'addons.title': 'Complementos',
  'addons.intro':
    'Un complemento aporta sus propias fuentes. Se instala pegando su dirección; funciona o en tu dispositivo, dentro de un entorno aislado, o en el servidor de su autor. Golden Library no incluye ninguno, no publica ninguna lista y no comprueba lo que devuelven.',
  'addons.addressLabel': 'Dirección del complemento',
  'addons.addressHint': 'La URL del manifiesto que te dio su autor.',
  'addons.continue': 'Continuar',
  'addons.fromServer': 'Desde un servidor',
  'addons.fromFile': 'Desde un archivo, en tu dispositivo',
  'addons.bundleLabel': 'Dirección del código del complemento',
  'addons.bundleHint':
    'La URL del código del complemento. Se ejecutará en este dispositivo, no en un servidor.',
  'addons.integrityLabel': 'Hash de integridad',
  'addons.integrityHint':
    'Lo da el autor, como sha256-… . Obligatorio: sin él, el código que aprobaste una vez podría cambiar después sin que te enteres.',
  'addons.checking': 'Leyendo el complemento…',
  'addons.installedHeading': 'Instalados',
  'addons.none': 'Aún no hay complementos. Todo lo que ves aquí viene de la propia instancia.',
  'addons.priorityHint': 'El orden es la prioridad: el primero responde primero.',
  'addons.enable': 'Activar',
  'addons.disable': 'Desactivar',
  'addons.off': 'Desactivado',
  'addons.remove': 'Quitar',
  'addons.moveUp': 'Subir',
  'addons.moveDown': 'Bajar',
  'addons.configure': 'Configurar',
  'addons.failedToStart': '«{name}» no arrancó: {reason}',
  'addons.consentTitle': '¿Instalar «{name}»?',
  'addons.consentHosts': 'Contactará con: {hosts}',
  'addons.consentNoHosts': 'No ha pedido contactar con nada.',
  'addons.consentSeesYou':
    'Este complemento funciona en el servidor de su autor. Verá tu dirección y todo lo que busques a través de él.',
  'addons.consentSandboxed':
    'Este complemento funciona en tu dispositivo, aislado. No puede leer tus cookies, ni los datos de este sitio, ni nada más que tengas abierto.',
  'addons.consentNotVetted':
    'Golden Library no comprueba lo que devuelve un complemento ni ha recomendado este. Lo que instales es cosa tuya.',
  'addons.install': 'Instalar',
  'addons.cancel': 'Cancelar',
  'addons.via': 'vía {name}',
  'addons.sourcesTitle': 'De tus complementos',
  'addons.searchTitle': 'Encontrado por tus complementos',
  'addons.showLinks': 'Mostrar enlaces de descarga',
  'addons.unreadable': 'No se pudieron leer {count} entradas de este complemento.',
  'addons.browse': 'Ver catálogo',
  'addons.browseTitle': 'Catálogo de «{name}»',
  'addons.browseNoCatalog': 'Este complemento no ofrece un catálogo para explorar.',
  'addons.browseEmpty': 'El catálogo de este complemento está vacío por ahora.',
  'addons.browseFailed': 'No se pudo cargar el catálogo de «{name}»: {reason}',
  'addons.loadMore': 'Cargar más',
  'addons.notInstalled': 'Este complemento no está instalado.',

  'settings.addons.title': 'Tus complementos',
  'settings.addons.installed':
    '«{name}» está instalado. Se le preguntará junto a los demás y podrá contactar con {hosts}.',
  'settings.addons.removed':
    '«{name}» se ha quitado. Sus resultados han desaparecido de este navegador, y también todo lo que guardaba aquí.',
  'settings.addons.enabled': '«{name}» vuelve a estar activo y se le preguntará con los demás.',
  'settings.addons.disabled':
    '«{name}» está desactivado. Sigue instalado con sus ajustes, pero no se mostrará nada de lo que devuelva.',
  'settings.addons.reordered': '«{name}» ahora responde en el puesto {position} de {total}.',
  'settings.addons.rejected': 'No se ha instalado nada: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Fuentes personalizadas',
  'customSources.title': 'Fuentes personalizadas',
  'customSources.intro':
    'Añade tu propia tienda o catálogo dándole un nombre y una URL de búsqueda con {isbn}, {query}, {title}, {author} o {language}. El enlace se genera en este dispositivo y este sitio nunca lo consulta.',
  'customSources.nameLabel': 'Nombre',
  'customSources.templateLabel': 'Plantilla de URL',
  'customSources.templateHint':
    'Una dirección https:// absoluta. {isbn}, {query}, {title}, {author} y {language} se rellenan con los datos de la edición; si un marcador queda vacío, el enlace se omite para esa edición.',
  'customSources.add': 'Añadir fuente',
  'customSources.listHeading': 'Tus fuentes',
  'customSources.none': 'Aún no hay fuentes personalizadas.',
  'customSources.off': 'Desactivada',
  'customSources.enable': 'Activar',
  'customSources.disable': 'Desactivar',
  'customSources.remove': 'Eliminar',
  'customSources.heading': 'Tus fuentes',
  'customSources.caption':
    'Enlaces que configuraste tú mismo. Esta instancia no comprueba a dónde llevan.',

  'settings.customSources.title': 'Tus fuentes personalizadas',
  'settings.customSources.added': '«{name}» se añadió y se ofrecerá junto a las demás.',
  'settings.customSources.removed': '«{name}» se eliminó de este navegador.',
  'settings.customSources.enabled': '«{name}» está activada de nuevo.',
  'settings.customSources.disabled':
    '«{name}» está desactivada. Sigue configurada, pero su enlace no se mostrará.',
  'settings.customSources.rejected': 'No se ha añadido nada: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Libros en tu idioma',
  'featured.inLanguageBlurb':
    'Libros escritos en el idioma en el que lees este sitio, primero los más reeditados: es el orden de la propia Open Library, no una lista de más vendidos.',
  'work.newSearch': 'Nueva búsqueda',
  'work.descriptionFrom': 'Descripción:',
  'work.descriptionNotLocalized':
    'Esta descripción está en el idioma en que la escribió la fuente: todavía no hay ninguna en el tuyo para este libro.',
};
