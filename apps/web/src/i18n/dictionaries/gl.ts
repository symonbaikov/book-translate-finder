import type { Dictionary } from '../dictionary';

export const gl: Dictionary = {
  'nav.savedBooks': 'Libros gardados',
  'nav.signIn': 'Iniciar sesión',
  'nav.signOut': 'Pechar sesión',
  'nav.language': 'Idioma',
  'nav.skipToContent': 'Ir ao contido',
  'footer.legal':
    'Só fontes legais: descarga directa exclusivamente para obras de dominio público e con licenzas abertas; libros protexidos por dereitos de autor — compra ou préstamo na biblioteca. Cada ligazón indica explicitamente o estado dos dereitos.',
  'footer.openSource': 'Código aberto',
  'footer.openSourceRest': '— licenza MIT, pódese aloxar un mesmo. O código está en GitHub.',
  'home.title': 'Golden Library',
  'home.subtitle':
    'Un agregador aberto de traducións de libros: linguas, edicións e fontes legais.',
  'home.searchLabel': 'Título e autor',
  'home.searchPlaceholder': 'Guerra e paz Tolstoi',
  'home.searchButton': 'Buscar',
  'search.searching': 'Buscando…',
  'search.backfilling':
    'Aínda non hai nada aquí — estamos a obter o libro das fontes. Isto leva uns segundos.',
  'search.notFound': 'Non se atopou nada para esta busca.',
  'search.retry': 'Téntao de novo',
  'search.signInPrompt':
    'para gardar os libros que atopes aquí e volver a eles — e para comparar edicións de distintos anos lado a lado antes de escoller unha.',
  'featured.yearHeading': 'Libros do ano',
  'featured.yearBlurb':
    'Libros salientables de cada un dos últimos anos. Unha lista escollida a man, non unha clasificación de vendas: ningunha fonte aberta publica unha.',
  'featured.popularHeading': 'Moi lidos, moi traducidos',
  'featured.popularBlurb':
    'Libros que existen en moitas linguas — que é xustamente para o que existe este sitio.',
  'featured.filling':
    'Aínda estamos a obter algúns en segundo plano. Recarga nun minuto para ver o resto.',
  'featured.freeCopy': 'Copia gratuíta',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'De balde para ler agora mesmo',
  'free.homeBlurb':
    'Libros de dominio público e con licenza aberta que esta copia do sitio pode entregarche directamente.',
  'free.seeAll': 'Ver máis',
  'free.downloadable': 'Descargar',
  'free.pageTitle': 'Libros gratuítos',
  'free.pageBlurb':
    'Cada libro de aquí ten polo menos unha copia legal gratuíta — dominio público, ou cedida polo titular dos dereitos. Sen compra, sen carné de biblioteca.',
  'free.empty':
    'Aínda non hai nada de balde aquí. As copias gratuítas aparecen a medida que esta instancia obtén libros, así que busca un e volve.',
  'free.emptyForLanguage':
    'Aínda non hai copias gratuítas en {language}. Retira o filtro de arriba para ver todo o andel.',
  'free.showMore': 'Amosar máis',
  'free.shown': 'Amósanse {shown} de {total}.',
  'free.allLanguages': 'Copias gratuítas en todas as linguas.',
  'free.filteredByLanguage': 'Só copias gratuítas en {language}.',
  'free.filterByLanguage': 'Amosar só as copias gratuítas en {language}.',
  'free.dropLanguageFilter': 'amosar todas as linguas',
  'free.loadFailed': 'Non se puideron cargar agora os libros gratuítos.',
  'work.original': 'orixinal',
  'work.dataSources': 'Fontes de datos',
  'work.about': 'Sobre este libro',
  'work.translatedInto': 'Traducido a',
  'work.availableIn': 'Dispoñible en',
  'work.languagesNote':
    'Só o que listan as fontes que lemos — unha tradución que falte aquí pode existir igualmente.',
  'work.noTranslations': 'Aínda non se atoparon traducións.',
  'work.yourLanguage.title': 'Na túa lingua',
  'work.yourLanguage.yes': 'Existe unha tradución ao {language}.',
  'work.yourLanguage.original': 'Este libro escribiuse en {language}.',
  'work.yourLanguage.no': 'Ningunha tradución ao {language} entre as edicións coñecidas aquí.',
  'work.yourLanguage.show': 'Amosar as edicións en {language}',
  'work.editions': 'Edicións ({shown} de {total})',
  'work.filterLanguage': 'Lingua',
  'work.filterAllLanguages': 'Todas as linguas',
  'work.filterYear': 'Ano',
  'work.filterApply': 'Filtrar',
  'work.filterReset': 'Restablecer',
  'work.noEditionsMatch': 'Ningunha edición coincide con estes filtros.',
  'work.showMoreEditions': 'Amosar máis edicións (quedan {remaining})',
  'work.badgeFreeDownload': 'descarga gratuíta',
  'work.freeDownloadFormat': 'Descargar {format}',
  'work.freeDownloadNote': '{rights}. De balde desde {provider} — sen conta, sen pago.',
  'work.badgeReadBorrow': 'ler ou pedir prestado',
  'work.badgeInBookstores': 'nas librarías',
  'work.translatedBy': 'tradución de {name}',
  'work.pages': '{count} páxinas',
  'bookmark.save': 'Gardar este libro',
  'bookmark.saved': 'Gardado',
  'bookmark.signInToSave': 'Inicia sesión para gardalo',
  'bookmark.failed': 'Non se puido gardar. Téntao de novo.',
  'links.show': 'Amosar as ligazóns',
  'links.hide': 'Agochar as ligazóns',
  'links.loading': 'Cargando as ligazóns',
  'links.none': 'Aínda non hai ligazóns legais para esta edición.',
  'links.viaOtherEdition': 'copia gratuíta da edición {label}',
  'links.failed': 'Non se puideron cargar as ligazóns.',
  'links.storesHeading': 'Atópao nunha libraría',
  'links.storesInCountry': 'En {country}',
  'links.storesYourCountry': 'o teu país',
  'links.storesLanguageMarket': 'Onde se venden libros en {language}',
  'links.storesLanguageMarketGeneric': 'Onde se vende a lingua desta edición',
  'links.storesWorldwide': 'Envía a todo o mundo',
  'links.storesCaption':
    'Cada ligazón busca no catálogo da propia libraría — a dispoñibilidade e o prezo amósaos ela mesma.',
  'linkType.download': 'Descargar',
  'linkType.buy': 'Mercar',
  'linkType.borrow': 'Pedir prestado na biblioteca',
  'linkType.listen': 'Escoitar (audiolibro)',
  'rights.public_domain': 'Dominio público',
  'rights.open_license': 'Licenza aberta',
  'rights.copyrighted': 'Con dereitos de autor',
  'rights.unknown': 'Estado descoñecido',
  'compare.heading': 'Comparar edicións',
  'compare.blurb': 'Escolle dúas ou tres edicións para ver que as diferencia realmente.',
  'compare.selected': 'Escolléronse {count} dun mínimo de 2.',
  'compare.editSelection': 'Cambiar as edicións',
  'compare.showAllEditions': 'Amosar as {count} edicións',
  'compare.columnDifference': 'Diferenza',
  'compare.identical': 'En todo o que rexistran as fontes, estas edicións son idénticas.',
  'compare.rowLanguage': 'Lingua',
  'compare.rowPublished': 'Publicada',
  'compare.rowPublisher': 'Editorial',
  'compare.rowTranslator': 'Tradutor',
  'compare.rowTranslatedFrom': 'Traducida do',
  'compare.rowBinding': 'Encadernación',
  'compare.rowPages': 'Páxinas',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Copia gratuíta ou en préstamo',
  'compare.yes': 'si ({count})',
  'compare.no': 'non se atopou',
  'country.label': 'Onde mercas libros?',
  'country.worldwideOnly': 'Só tendas que envían a todo o mundo',
  'auth.signInTitle': 'Inicio de sesión',
  'auth.registerTitle': 'Crear unha conta',
  'auth.blurb':
    'Unha conta existe por un só motivo: gardar os libros que atopes e volver a eles — coas linguas ás que foron traducidos, as edicións que existen e onde conseguir cada unha legalmente. Sen boletín, sen perfil, sen seguimento.',
  'auth.name': 'Nome (opcional)',
  'auth.email': 'Correo electrónico',
  'auth.password': 'Contrasinal',
  'auth.passwordHint':
    'Polo menos {min} caracteres. Só se comproba a lonxitude — unha frase longa que lembres vale máis que unha curta chea de signos.',
  'auth.submitSignIn': 'Iniciar sesión',
  'auth.submitRegister': 'Crear a conta',
  'auth.working': 'Traballando…',
  'auth.google': 'Continuar con Google',
  'auth.toRegister': 'Aínda non tes conta? Crea unha',
  'auth.toSignIn': 'Xa tes conta? Inicia sesión',
  'auth.backToSearch': 'Volver á busca',
  'auth.errorGoogleState':
    'Esa ligazón de inicio de sesión caducou ou abriuse noutro navegador. Téntao de novo.',
  'auth.errorGoogleFailed':
    'O inicio de sesión con Google non se completou. Podes usar un correo e un contrasinal.',
  'auth.errorGeneric': 'Algo foi mal.',
  'bookmarks.title': 'Libros gardados',
  'bookmarks.signedOut':
    'para conservar os libros que atopes — e para comparar máis adiante edicións do mesmo libro lado a lado.',
  'bookmarks.loading': 'Cargando…',
  'bookmarks.empty':
    'Aínda non gardaches nada. Atopa un libro e usa «Gardar este libro» na súa ficha.',
  'bookmarks.searchLink': 'Buscar',
  'bookmarks.remove': 'Eliminar',
  'bookmarks.loadFailed': 'Non se puideron cargar os teus libros gardados.',
  'search.failed': 'A busca fallou.',
  'search.pending': 'Aínda non está na nosa base de datos — estamos a consultar as fontes',
  'search.pendingLong':
    'Aínda buscando: a primeira petición dun libro recolle datos das fontes, o que pode levar uns minutos',
  'search.notFoundHint': 'Non se atopou nada. Proba a precisar o título ou o autor.',
  'search.timedOut':
    'As fontes responden amodo e aínda non temos datos. A sincronización en segundo plano quizais xa rematou — téntao de novo.',
  'search.freeOnlyToggle': 'Descarga gratuíta',
  'search.noFreeResults':
    'Ningún destes ten aínda unha descarga gratuíta — proba a desactivar o filtro.',
  'home.tagline': 'Atopa o teu próximo magnum opus',
  'subject.allLanguages': 'Todas as linguas.',
  'subject.filteredByLanguage': 'Só libros cunha edición en {language}.',
  'subject.dropLanguageFilter': 'amosar todas as linguas',
  'subject.empty':
    'Aínda non hai nada baixo esta etiqueta. As etiquetas veñen dos libros que esta instancia xa obtivo.',
  'featured.year': '{year}',
  'nav.browse': 'Explorar por xénero',
  'recommend.heading': 'A partir do que estiveches lendo',
  'recommend.becauseOf': 'Abriches «{title}», así que aquí tes libros dos mesmos xéneros.',
  'recommend.blurb': 'Libros dos xéneros que estiveches abrindo.',
  'recommend.privacy':
    'Isto calcúlase no teu navegador — ao servidor dínselle os xéneros, nunca quen es.',
  'recommend.forget': 'esquece o meu historial',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Andel',
  'shelf.title': 'Andel',
  'shelf.intro':
    'Catálogos abertos, e calquera servidor de biblioteca que xestiones ti mesmo. Os catálogos que engadas quedan neste navegador e nunca se envían a este sitio.',
  'shelf.openCatalogs': 'Catálogos abertos',
  'shelf.yourCatalogs': 'Os teus catálogos',
  'shelf.addCatalog': 'Engadir un catálogo',
  'shelf.name': 'Nome',
  'shelf.address': 'Enderezo OPDS',
  'shelf.username': 'Nome de usuario (opcional)',
  'shelf.password': 'Contrasinal (opcional)',
  'shelf.credentialsNote': 'O enderezo e calquera credencial gárdanse só neste navegador.',
  'shelf.add': 'Engadir',
  'shelf.remove': 'Eliminar',
  'shelf.loading': 'Cargando o catálogo…',
  'shelf.empty': 'Este catálogo non ten entradas.',
  'shelf.noCatalogs':
    'Aínda ningún propio. Engade abaixo un enderezo de Calibre-Web, COPS, Kavita ou Audiobookshelf.',
  'shelf.unreachable':
    'O teu navegador non puido ler este catálogo. Un servidor na túa propia rede funcionará; os sitios públicos adoitan rexeitar as peticións doutras orixes.',
  'shelf.nextPage': 'Páxina seguinte',
  'shelf.previousPage': 'Páxina anterior',
  'shelf.drm': 'Precisa unha aplicación con DRM',
  'shelf.notFree': 'Non é unha descarga gratuíta',
  'shelf.download': 'Descargar',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Librarías preto de ti',
  'stores.useMyLocation': 'Usar a miña localización',
  'stores.placeLabel': 'Cidade ou código postal',
  'stores.find': 'Atopar',
  'stores.locating': 'Buscando…',
  'stores.failed': 'A localización non está dispoñible. Escribe unha cidade ou un código postal.',
  'stores.none': 'Ningunha libraría cartografada nun raio de {radius} km.',
  'stores.distance': 'a {distance} km',
  'stores.stockUnknown': 'Só datos do mapa — ninguén publica o que ten unha tenda en existencias.',
  'stores.lookupFailed': 'Non se puido contactar con OpenStreetMap agora. Téntao dentro dun anaco.',
  'stores.privacy':
    'A túa localización arredóndase a uns 100 m e só se envía a OpenStreetMap — nunca a este sitio.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Prezos e tendas',
  'prices.loading': 'Preguntando ás tendas…',
  'prices.unknown': 'Prezo non publicado',
  'prices.degraded': 'Sen resposta de: {providers}',
  'prices.format.hardcover': 'Tapa dura',
  'prices.format.paperback': 'Tapa branda',
  'prices.format.ebook': 'Libro electrónico',
  'prices.format.audiobook': 'Audiolibro',
  'prices.format.unknown': 'Formato non indicado',
  'recommend.hideGenre': 'agochar «{genre}»',
  'recommend.hiddenList': 'Xéneros agochados (fai clic para recuperar un):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Gardado',
  'settings.status.cleared': 'Borrado',
  'settings.status.unstored': 'Non gardado',
  'settings.status.failed': 'Sen cambios',
  'settings.notStored':
    'Este navegador negouse a gardar o cambio, así que non pasou nada — segue vixente o valor anterior.',
  'settings.language.title': 'Idioma da interface',
  'settings.language.changed':
    'Cambiado de {from} a {to}. A interface recárgase en {to}; os títulos dos libros e os nomes dos autores permanecen nas súas linguas.',
  'settings.country.title': 'País de compra',
  'settings.country.changed':
    'Definido en {country}. As ligazóns de librarías agora ofrecen tendas que entregan alí, xunto coas internacionais.',
  'settings.country.cleared':
    'Ningún país escollido. Só se ofrecerán librarías que envían a todo o mundo.',
  'settings.bookLanguage.title': 'Lingua dos libros',
  'settings.bookLanguage.changed':
    'Definida en {language}. As páxinas de xénero encabezarán con libros que teñen unha edición en {language} ata que restablezas o filtro.',
  'settings.bookLanguage.cleared':
    'Borrado. As páxinas de xénero volven amosar libros en todas as linguas.',
  'settings.hiddenGenres.title': 'Xéneros agochados',
  'settings.hiddenGenres.hidden':
    '«{genre}» está agochado. Xa non se envía ao servidor cando se piden suxestións, e en total hai {count} xéneros agochados.',
  'settings.hiddenGenres.restored':
    '«{genre}» volve estar nas túas suxestións. Aínda hai {count} xéneros agochados.',
  'settings.history.title': 'Historial de lectura',
  'settings.history.cleared':
    'Os libros que abriras borráronse deste navegador. As suxestións non volverán ata que abras outro libro.',
  'settings.bookmarks.title': 'Libros gardados',
  'settings.bookmarks.added': '«{title}» engadiuse aos teus libros gardados.',
  'settings.bookmarks.removed': '«{title}» retirouse dos teus libros gardados.',
  'settings.bookmarks.failed':
    'O servidor non aceptou o cambio, así que os teus libros gardados seguen igual.',
  'settings.catalogs.title': 'Os teus catálogos',
  'settings.catalogs.added':
    '«{name}» engadiuse en {url}. O seu enderezo queda neste navegador e nunca se envía a este sitio.',
  'settings.catalogs.addedWithCredentials':
    '«{name}» engadiuse en {url}, co nome de usuario e o contrasinal que escribiches. Todo queda neste navegador e nada se envía a este sitio.',
  'settings.catalogs.removed':
    '«{name}» retirouse deste navegador, xunto con calquera credencial que tivese gardada.',
  'settings.catalogs.rejected': 'Non se engadiu nada: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Complementos',
  'addons.title': 'Complementos',
  'addons.intro':
    'Un complemento engade fontes propias. Instálalo pegando o seu enderezo; execútase no teu dispositivo, nun contorno illado, ou no servidor do seu autor. Golden Library non distribúe ningún, non lista ningún e non comproba o que devolven.',
  'addons.addressLabel': 'Enderezo do complemento',
  'addons.addressHint': 'O URL do manifesto que che deu o autor do complemento.',
  'addons.continue': 'Continuar',
  'addons.fromServer': 'Desde un servidor',
  'addons.fromFile': 'Desde un ficheiro do teu dispositivo',
  'addons.bundleLabel': 'Enderezo do código do complemento',
  'addons.bundleHint':
    'O URL do código do complemento. Executarase neste dispositivo, non nun servidor.',
  'addons.integrityLabel': 'Resumo de integridade',
  'addons.integrityHint':
    'Dáo o autor do complemento, como sha256-… . É obrigatorio: sen el, o código que aprobaches unha vez podería cambiar despois sen que o souberas nunca.',
  'addons.checking': 'Lendo o complemento…',
  'addons.installedHeading': 'Instalados',
  'addons.none':
    'Aínda ningún complemento. Todo o que hai neste sitio ata agora vén da propia instancia.',
  'addons.priorityHint': 'A orde é a prioridade: o primeiro complemento responde primeiro.',
  'addons.enable': 'Activar',
  'addons.disable': 'Desactivar',
  'addons.off': 'Desactivado',
  'addons.remove': 'Eliminar',
  'addons.moveUp': 'Subir',
  'addons.moveDown': 'Baixar',
  'addons.configure': 'Configurar',
  'addons.failedToStart': '«{name}» non arrincou: {reason}',
  'addons.consentTitle': 'Instalar «{name}»?',
  'addons.consentHosts': 'Contactará con: {hosts}',
  'addons.consentNoHosts': 'Non pediu contactar con nada.',
  'addons.consentSeesYou':
    'Este complemento execútase no servidor do seu autor. Verá o teu enderezo e todo o que busques a través del.',
  'addons.consentSandboxed':
    'Este complemento execútase no teu dispositivo, nun contorno illado. Non pode ler as túas cookies, os datos deste sitio nin nada máis que teñas aberto.',
  'addons.consentNotVetted':
    'Golden Library non comproba o que devolve un complemento e non recomendou este. O que instales é cousa túa.',
  'addons.install': 'Instalar',
  'addons.cancel': 'Cancelar',
  'addons.via': 'vía {name}',
  'addons.sourcesTitle': 'Dos teus complementos',
  'addons.searchTitle': 'Atopado polos teus complementos',
  'addons.showLinks': 'Amosar as ligazóns de descarga',
  'addons.unreadable': 'Non se puideron ler {count} entradas deste complemento.',
  'addons.browse': 'Explorar o catálogo',
  'addons.browseTitle': 'O catálogo de {name}',
  'addons.browseNoCatalog': 'Este complemento non ofrece un catálogo para explorar.',
  'addons.browseEmpty': 'O catálogo deste complemento está baleiro agora mesmo.',
  'addons.browseFailed': 'Non se puido cargar o catálogo de «{name}»: {reason}',
  'addons.loadMore': 'Cargar máis',
  'addons.notInstalled': 'Este complemento non está instalado.',

  'settings.addons.title': 'Os teus complementos',
  'settings.addons.installed':
    '«{name}» está instalado. Preguntaráselle xunto cos demais, e pode contactar con {hosts}.',
  'settings.addons.removed':
    '«{name}» eliminouse. Os seus resultados desapareceron deste navegador, e tamén todo o que tiña gardado aquí.',
  'settings.addons.enabled': '«{name}» volve estar activo e preguntaráselle cos demais.',
  'settings.addons.disabled':
    '«{name}» está desactivado. Segue instalado coa súa configuración, pero non se amosará nada do que devolva.',
  'settings.addons.reordered': '«{name}» agora responde na posición {position} de {total}.',
  'settings.addons.rejected': 'Non se instalou nada: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Fontes propias',
  'customSources.title': 'Fontes propias',
  'customSources.intro':
    'Engade unha tenda ou catálogo propios dándolle un nome e un URL de busca con {isbn}, {query}, {title}, {author} ou {language} dentro. A ligazón constrúese neste dispositivo e este sitio nunca a consulta.',
  'customSources.nameLabel': 'Nome',
  'customSources.templateLabel': 'Modelo de URL',
  'customSources.templateHint':
    'Un enderezo https:// absoluto. {isbn}, {query}, {title}, {author} e {language} énchense a partir da edición; un marcador que quede baleiro significa que a ligazón se omite para esa edición.',
  'customSources.add': 'Engadir fonte',
  'customSources.listHeading': 'As túas fontes',
  'customSources.none': 'Aínda ningunha fonte propia.',
  'customSources.off': 'Desactivada',
  'customSources.enable': 'Activar',
  'customSources.disable': 'Desactivar',
  'customSources.remove': 'Eliminar',
  'customSources.heading': 'As túas fontes',
  'customSources.caption':
    'Ligazóns que configuraches ti mesmo. Esta instancia non comproba a onde levan.',

  'settings.customSources.title': 'As túas fontes propias',
  'settings.customSources.added': '«{name}» engadiuse e ofrecerase xunto coas demais.',
  'settings.customSources.removed': '«{name}» retirouse deste navegador.',
  'settings.customSources.enabled': '«{name}» volve estar activa.',
  'settings.customSources.disabled':
    '«{name}» está desactivada. Segue configurada, pero a súa ligazón non se amosará.',
  'settings.customSources.rejected': 'Non se engadiu nada: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Libros na túa lingua',
  'featured.inLanguageBlurb':
    'Libros escritos na lingua na que les este sitio, primeiro os máis publicados — a orde da propia Open Library, non unha lista de máis vendidos.',
  'work.newSearch': 'Nova busca',
  'work.descriptionFrom': 'Descrición:',
  'work.descriptionNotLocalized':
    'Esta descrición está na lingua na que a escribiu a fonte — na túa lingua aínda non hai ningunha para este libro.',

  // Reader ratings of an edition, never of a translation — see TranslationRatings.tsx.
  'ratings.edition': '{average} de {outOf} de {votes} lectores en {source}',
  'ratings.lowConfidence': 'poucos votos para comparar',
  'ratings.reviews': 'Recensións',
  'ratings.reviewsOn': 'Recensións desta edición en {source}',
  'ratings.noteNoRatings':
    'Ningunha fonte aberta puntúa unha tradución, e ningunha destas tiradas ten aquí unha valoración de lectores.',
  'ratings.noteReviews':
    'Onde unha edición se coñece en {sources}, a ligazón leva ás recensións exactamente desa tirada — a maioría das edicións non se coñecen.',
  'ratings.translator':
    'Edicións traducidas por {name}: {average} de {outOf} en {editions} edicións valoradas, {votes} lectores en total.',
  'ratings.note':
    'Son valoracións de lectores dunha edición concreta en {sources}, non un xuízo sobre a tradución en si — iso non o publica ninguén. Paga a pena lelas unha a rentes doutra: mesmo libro, mesma lingua, tradutores distintos, e sempre co número de votos á vista.',
  'ratings.gapWithoutIsbn':
    '{count} edicións de aquí non teñen ISBN, así que non se lles puido asociar ningunha valoración.',
  'ratings.gapNotLookedUp': 'Outras {count} edicións non se consultaron nesta petición.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Le no teu navegador',
  'reader.privacy':
    'O teu navegador abre este libro pola súa conta. O ficheiro, o lugar do que veu e ata onde liches non chegan nunca a este sitio.',
  'reader.chooseFile': 'Abre un libro deste dispositivo',
  'reader.formats': 'EPUB, FB2, MOBI e CBZ.',
  'reader.loading': 'Abrindo…',
  'reader.failed': 'Non se puido abrir este libro: {reason}',
  'reader.previous': 'Páxina anterior',
  'reader.next': 'Páxina seguinte',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…ou solta aquí un libro',
  'reader.fetching': 'Pedíndolle o ficheiro a {host}…',
  'reader.blockedTitle': '{host} non lle entregou o ficheiro a esta páxina',
  'reader.blockedBody':
    'Ou non se pode acceder a el, ou non permite que outros sitios lean os seus ficheiros. Este sitio non o vai buscar no teu lugar: o teu libro non pasa nunca por el, e niso consiste ler aquí.',
  'reader.blockedDownload': 'Descárgao de {host}',
  'reader.blockedOpenHere': 'e despois ábreo aquí desde o teu dispositivo',
  'reader.blockedAddon': 'Tamén serve un complemento que entregue o ficheiro el mesmo.',
  'reader.keepFile': 'Gardar este libro neste navegador',
  'reader.keepFileHint':
    'Desactivado por defecto. Sen iso, o ficheiro desaparece cando pechas a lapela; con iso, queda só neste dispositivo.',
  'reader.library': 'Gardados neste navegador',
  'reader.libraryEmpty':
    'Aínda non hai nada gardado. Os libros que gardas quedan neste dispositivo e non se envían nunca a ningures.',
  'reader.libraryOpen': 'Abrir',
  'reader.libraryRemove': 'Eliminar',
  'reader.libraryFileKept': 'ficheiro gardado',
  'reader.libraryFileGone': 'ficheiro non gardado',
  'reader.untitled': 'Libro sen título',
  'settings.reader.libraryTitle': 'Libros gardados neste navegador',
  'settings.reader.kept':
    '«{title}» gárdase agora neste dispositivo, así que se abre sen descargalo outra vez. Non se envía a ningures.',
  'settings.reader.forgotten':
    'O ficheiro de «{title}» borrouse deste navegador. A entrada queda na lista, así que podes abrilo de novo desde a súa fonte.',
  'settings.reader.removed':
    '«{title}» retirouse por completo deste navegador — o ficheiro e a entrada.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Aberto onde o deixaches — no {percent}%.',
  'reader.bookmarks': 'Marcadores',
  'reader.bookmarkAdd': 'Pór marcador nesta páxina',
  'reader.bookmarkNone': 'Aínda non hai marcadores neste libro.',
  'reader.bookmarkGo': 'Ir a',
  'reader.bookmarkRemove': 'Quitar o marcador',
  'reader.bookmarkNote': 'Nota',
  'reader.bookmarkNotePlaceholder': 'As túas palabras sobre esta páxina',
  'reader.bookmarkAt': 'no {percent}%',
  'settings.reader.bookmarkTitle': 'Marcadores neste navegador',
  'settings.reader.bookmarkAdded':
    'Marcador no {percent}% de «{title}». Os marcadores quedan neste dispositivo co libro.',
  'settings.reader.bookmarkRemoved': 'Aquel marcador de «{title}» retirouse deste navegador.',
  'settings.reader.noteSaved': 'A túa nota desta páxina de «{title}» gardouse neste dispositivo.',
  'settings.reader.positionTitle': 'Punto de lectura',
  'settings.reader.positionUnstored':
    'Este navegador non quixo gardar onde estás en «{title}», así que a próxima vez abrirase desde o principio. Tanto o modo privado como un disco cheo fan iso.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': 'Como se ve este libro',
  'reader.theme': 'Cores',
  'reader.themeApp': 'Como o sitio',
  'reader.themeLight': 'Papel',
  'reader.themeDark': 'Tinta',
  'reader.themeSepia': 'Sepia',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint':
    'Negro puro sobre branco, sen animación, unha columna — para pantallas de papel electrónico.',
  'reader.fontSize': 'Tamaño da letra',
  'reader.smaller': 'Máis pequena',
  'reader.larger': 'Máis grande',
  'reader.lineHeight': 'Entreliñado',
  'reader.margin': 'Marxes',
  'reader.flow': 'Páxinas',
  'reader.flowPaged': 'Pasar páxinas',
  'reader.flowScrolled': 'Desprazar',
  'reader.justify': 'Xustificar o texto',
  'reader.hyphenate': 'Partición de palabras',
  'reader.displayReset': 'Volver aos valores por defecto',
  'settings.reader.displayTitle': 'Aspecto de lectura',
  'settings.reader.displayChanged':
    '{setting} agora é {value}. Aplícase a cada libro que abras neste navegador.',
  'settings.reader.displayReset':
    'O aspecto de lectura volveu aos valores por defecto para todos os libros deste navegador.',
  'reader.on': 'Activado',
  'reader.off': 'Desactivado',
  'reader.openHere': 'Le no teu navegador',
  'reader.notAFileTitle': '{host} enviou unha páxina web, non o ficheiro',
  'reader.notAFileBody':
    'A ligazón leva a unha páxina e non a un libro — unha páxina de descarga, unha pantalla de consentimento ou unha comprobación de que non es un robot. Ábrea ti e o ficheiro estará alí.',
  'settings.status.session': 'Non lembrado',
  'settings.notRemembered':
    'Este navegador non quixo lembralo, así que a próxima vez que abras un libro todo estará como antes.',
  'compare.rowEditionStatement': 'Edición',
  'home.genres': 'Xéneros populares',
  'home.genresBlurb': 'As etiquetas con máis libros detrás. Cada unha abre o seu catálogo.',

  // --- The first-run walkthrough (components/OnboardingTour.tsx) -----------
  'tour.next': 'Seguinte',
  'tour.back': 'Atrás',
  'tour.skip': 'Agora non',
  'tour.finish': 'Feito',
  'tour.close': 'Pechar a visita',
  'tour.welcome.title': 'Benvido a Golden Library',
  'tour.welcome.text':
    'Un minuto e saberás onde está cada cousa. Este sitio descobre en que linguas existe un libro e onde conseguilo legalmente — e faino mellor canto máis claro lle digas onde buscar. Por aí comezamos.',
  'tour.customSourcesNav.title': 'Comeza polas túas propias fontes',
  'tour.customSourcesNav.text':
    'Abre <strong>Fontes propias</strong>: a páxina na que decides que catálogos se consultan ademais dos incluídos.',
  'tour.presets.title': 'Non fai falla escribila desde cero',
  'tour.presets.text':
    'Alí publícanse modelos xa feitos. Son de quen os escribiu: este sitio non comproba nada nesa canle, e unha fonte que engadas busca desde o teu navegador, non desde este servidor. Ábrea noutra lapela, colle o que precises e volve.',
  'tour.sourceForm.title': 'Dous campos e listo',
  'tour.sourceForm.text':
    'Un nome que recoñezas e mais o enderezo dunha busca con <strong>{query}</strong> no lugar das túas palabras. Engade unha agora ou preme «Seguinte» e volve máis tarde.',
  'tour.sourceList.title': 'Todo o que engadas queda aquí',
  'tour.sourceList.text':
    'As túas fontes están abaixo e cada unha pode apagarse ou eliminarse. Viven neste navegador e nunca van ao servidor: aquí ninguén as ve, e noutro dispositivo non estarán.',
  'tour.addonsNav.title': 'Os complementos van máis alá',
  'tour.addonsNav.text':
    'Abre <strong>Complementos</strong>. Unha fonte propia é un enderezo que escribiches; un complemento é un pequeno programa doutra persoa que sabe consultar un catálogo de verdade.',
  'tour.addons.title': 'Nada se instala antes de que o vexas',
  'tour.addons.text':
    'Pega o enderezo dun complemento e este formulario amosa que é e con que servidores vai falar; só despois se instala. Os seus resultados levan sempre o nome do complemento que os produciu.',
  'tour.shelfNav.title': 'O andel',
  'tour.shelfNav.text':
    'Abre <strong>Andel</strong> para ver os catálogos dos que podes ler directamente.',
  'tour.shelf.title': 'Catálogos abertos, e mais os teus',
  'tour.shelf.text':
    'O Proxecto Gutenberg e semellantes están aquí desde o principio. Debaixo podes engadir calquera catálogo OPDS — por exemplo un servidor Calibre na túa rede, ao que chega o teu navegador e este sitio nunca.',
  'tour.language.title': 'A lingua da interface',
  'tour.language.text':
    'Cámbiaa aquí cando queiras. Coma todos os axustes deste sitio, escríbese no teu navegador e ten efecto ao momento — e dío nun aviso, tamén cando o navegador se nega a gardala.',
  'tour.done.title': 'Isto foi a visita',
  'tour.done.text':
    'Busca desde a portada e inicia sesión se queres conservar os libros que atopes. A ligazón do pé de calquera páxina volve iniciar esta visita.',
  'settings.tour.title': 'A visita guiada',
  'settings.tour.finished':
    'Xa fixeches a visita, así que non se abrirá soa outra vez. A ligazón do pé da páxina iníciaa cando queiras.',
  'settings.tour.skipped':
    'A visita está pechada e non se abrirá soa outra vez. A ligazón do pé da páxina iníciaa cando queiras.',
  'settings.tour.restarted':
    'Comezamos de novo polo primeiro paso, e este navegador esqueceu que xa a viras.',
  'customSources.presets': 'Modelos xa feitos',
  'customSources.presetsCaption':
    'Modelos que comparten outros lectores, na canle desta instancia. Aquí ninguén os revisa: le un antes de engadilo e lembra que buscará desde o teu navegador.',
  'footer.takeTheTour': 'Facer a visita',
};
