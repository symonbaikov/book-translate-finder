import type { Dictionary } from '../dictionary';

export const ca: Dictionary = {
  'nav.savedBooks': 'Llibres desats',
  'nav.signIn': 'Inicia la sessió',
  'nav.signOut': 'Tanca la sessió',
  'nav.language': 'Idioma',
  'nav.skipToContent': 'Vés al contingut',
  'footer.legal':
    'Només fonts legals: descàrrega directa exclusivament per a obres de domini públic i amb llicències obertes; llibres protegits pels drets d’autor — compra o préstec a la biblioteca. Cada enllaç indica explícitament l’estat dels drets.',
  'footer.openSource': 'Codi obert',
  'footer.openSourceRest': '— llicència MIT, es pot allotjar un mateix. El codi és a GitHub.',
  'home.title': 'Golden Library',
  'home.subtitle':
    'Un agregador obert de traduccions de llibres: llengües, edicions i fonts legals.',
  'home.searchLabel': 'Títol i autor',
  'home.searchPlaceholder': 'Guerra i pau Tolstoi',
  'home.searchButton': 'Cerca',
  'search.searching': 'S’està cercant…',
  'search.backfilling':
    'Encara no hi ha res — estem obtenint el llibre de les fonts. Triga uns segons.',
  'search.notFound': 'No s’ha trobat res per a aquesta consulta.',
  'search.retry': 'Torna-ho a provar',
  'search.signInPrompt':
    'per desar els llibres que trobis aquí i tornar-hi — i per comparar edicions de diferents anys de costat abans de triar-ne una.',
  'featured.yearHeading': 'Llibres de l’any',
  'featured.yearBlurb':
    'Llibres destacats de cadascun dels darrers anys. Una llista triada a mà, no una classificació de vendes: cap font oberta no en publica.',
  'featured.popularHeading': 'Molt llegits, molt traduïts',
  'featured.popularBlurb':
    'Llibres que existeixen en moltes llengües — que és exactament per això que existeix aquest lloc.',
  'featured.filling':
    'Encara n’estem obtenint uns quants en segon pla. Torna a carregar d’aquí a un minut per veure la resta.',
  'featured.freeCopy': 'Còpia gratuïta',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Gratis per llegir ara mateix',
  'free.homeBlurb':
    'Llibres de domini públic i amb llicència oberta que aquesta còpia del lloc et pot lliurar directament.',
  'free.seeAll': 'Mostra’n més',
  'free.downloadable': 'Descarrega',
  'free.pageTitle': 'Llibres gratuïts',
  'free.pageBlurb':
    'Cada llibre d’aquí té almenys una còpia legal gratuïta — domini públic o cedida pel titular dels drets. Sense compra, sense carnet de biblioteca.',
  'free.empty':
    'Encara no hi ha res gratuït aquí. Les còpies gratuïtes apareixen a mesura que aquesta instància obté llibres, així que cerca’n un i torna.',
  'free.emptyForLanguage':
    'Encara no hi ha còpies gratuïtes en {language}. Treu el filtre de dalt per veure tot el prestatge.',
  'free.showMore': 'Mostra’n més',
  'free.shown': 'Se’n mostren {shown} de {total}.',
  'free.allLanguages': 'Còpies gratuïtes en totes les llengües.',
  'free.filteredByLanguage': 'Només còpies gratuïtes en {language}.',
  'free.filterByLanguage': 'Mostra només les còpies gratuïtes en {language}.',
  'free.dropLanguageFilter': 'mostra totes les llengües',
  'free.loadFailed': 'Ara mateix no s’han pogut carregar els llibres gratuïts.',
  'work.original': 'original',
  'work.dataSources': 'Fonts de dades',
  'work.about': 'Sobre aquest llibre',
  'work.translatedInto': 'Traduït a',
  'work.availableIn': 'Disponible en',
  'work.languagesNote':
    'Només allò que llisten les fonts que llegim — una traducció que hi falti pot existir igualment.',
  'work.noTranslations': 'Encara no s’ha trobat cap traducció.',
  'work.yourLanguage.title': 'En la teva llengua',
  'work.yourLanguage.yes': 'Hi ha una traducció al {language}.',
  'work.yourLanguage.original': 'Aquest llibre es va escriure en {language}.',
  'work.yourLanguage.no': 'Cap traducció al {language} entre les edicions conegudes aquí.',
  'work.yourLanguage.show': 'Mostra les edicions en {language}',
  'work.editions': 'Edicions ({shown} de {total})',
  'work.filterLanguage': 'Llengua',
  'work.filterAllLanguages': 'Totes les llengües',
  'work.filterYear': 'Any',
  'work.filterApply': 'Filtra',
  'work.filterReset': 'Reinicia',
  'work.noEditionsMatch': 'Cap edició no coincideix amb aquests filtres.',
  'work.showMoreEditions': 'Mostra més edicions (en queden {remaining})',
  'work.badgeFreeDownload': 'descàrrega gratuïta',
  'work.freeDownloadFormat': 'Descarrega {format}',
  'work.freeDownloadNote': '{rights}. Gratis des de {provider} — sense compte, sense pagament.',
  'work.badgeReadBorrow': 'llegeix o demana en préstec',
  'work.badgeInBookstores': 'a les llibreries',
  'work.translatedBy': 'traducció de {name}',
  'work.pages': '{count} pàgines',
  'bookmark.save': 'Desa aquest llibre',
  'bookmark.saved': 'Desat',
  'bookmark.signInToSave': 'Inicia la sessió per desar-lo',
  'bookmark.failed': 'No s’ha pogut desar. Torna-ho a provar.',
  'links.show': 'Mostra els enllaços',
  'links.hide': 'Amaga els enllaços',
  'links.loading': 'S’estan carregant els enllaços',
  'links.none': 'Encara no hi ha enllaços legals per a aquesta edició.',
  'links.viaOtherEdition': 'còpia gratuïta de l’edició {label}',
  'links.failed': 'No s’han pogut carregar els enllaços.',
  'links.storesHeading': 'Troba’l en una llibreria',
  'links.storesInCountry': 'A {country}',
  'links.storesYourCountry': 'el teu país',
  'links.storesLanguageMarket': 'On es venen llibres en {language}',
  'links.storesLanguageMarketGeneric': 'On es ven la llengua d’aquesta edició',
  'links.storesWorldwide': 'Envia arreu del món',
  'links.storesCaption':
    'Cada enllaç cerca al catàleg de la mateixa llibreria — la disponibilitat i el preu els mostra ella mateixa.',
  'linkType.download': 'Descarrega',
  'linkType.buy': 'Compra',
  'linkType.borrow': 'Demana en préstec a la biblioteca',
  'linkType.listen': 'Escolta (audiollibre)',
  'rights.public_domain': 'Domini públic',
  'rights.open_license': 'Llicència oberta',
  'rights.copyrighted': 'Amb drets d’autor',
  'rights.unknown': 'Estat desconegut',
  'compare.heading': 'Compara edicions',
  'compare.blurb': 'Tria dues o tres edicions per veure què les diferencia realment.',
  'compare.selected': 'Se n’han triat {count} d’un mínim de 2.',
  'compare.editSelection': 'Canvia les edicions',
  'compare.showAllEditions': 'Mostra les {count} edicions',
  'compare.columnDifference': 'Diferència',
  'compare.identical': 'En tot el que registren les fonts, aquestes edicions són idèntiques.',
  'compare.rowLanguage': 'Llengua',
  'compare.rowPublished': 'Publicada',
  'compare.rowPublisher': 'Editorial',
  'compare.rowTranslator': 'Traductor',
  'compare.rowTranslatedFrom': 'Traduïda del',
  'compare.rowBinding': 'Enquadernació',
  'compare.rowPages': 'Pàgines',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Còpia gratuïta o en préstec',
  'compare.yes': 'sí ({count})',
  'compare.no': 'no s’ha trobat',
  'country.label': 'On compres llibres?',
  'country.worldwideOnly': 'Només botigues que envien arreu del món',
  'auth.signInTitle': 'Inici de sessió',
  'auth.registerTitle': 'Crea un compte',
  'auth.blurb':
    'Un compte existeix per un sol motiu: desar els llibres que trobis i tornar-hi — amb les llengües a què han estat traduïts, les edicions que existeixen i on aconseguir-ne cadascuna legalment. Sense butlletí, sense perfil, sense seguiment.',
  'auth.name': 'Nom (opcional)',
  'auth.email': 'Correu electrònic',
  'auth.password': 'Contrasenya',
  'auth.passwordHint':
    'Com a mínim {min} caràcters. Només se’n comprova la longitud — una frase llarga que recordis val més que una de curta plena de signes.',
  'auth.submitSignIn': 'Inicia la sessió',
  'auth.submitRegister': 'Crea el compte',
  'auth.working': 'Treballant-hi…',
  'auth.google': 'Continua amb Google',
  'auth.toRegister': 'Encara no tens compte? Crea’n un',
  'auth.toSignIn': 'Ja tens compte? Inicia la sessió',
  'auth.backToSearch': 'Torna a la cerca',
  'auth.errorGoogleState':
    'Aquell enllaç d’inici de sessió ha caducat o s’ha obert en un altre navegador. Torna-ho a provar.',
  'auth.errorGoogleFailed':
    'L’inici de sessió amb Google no s’ha completat. Pots fer servir un correu i una contrasenya.',
  'auth.errorGeneric': 'Alguna cosa ha anat malament.',
  'bookmarks.title': 'Llibres desats',
  'bookmarks.signedOut':
    'per conservar els llibres que trobis — i per comparar més endavant edicions del mateix llibre de costat.',
  'bookmarks.loading': 'S’està carregant…',
  'bookmarks.empty':
    'Encara no has desat res. Cerca un llibre i fes servir «Desa aquest llibre» a la seva fitxa.',
  'bookmarks.searchLink': 'Cerca',
  'bookmarks.remove': 'Elimina',
  'bookmarks.loadFailed': 'No s’han pogut carregar els teus llibres desats.',
  'search.failed': 'La cerca ha fallat.',
  'search.pending': 'Encara no és a la nostra base de dades — estem consultant les fonts',
  'search.pendingLong':
    'Encara cercant: la primera petició d’un llibre recull dades de les fonts, cosa que pot trigar un parell de minuts',
  'search.notFoundHint': 'No s’ha trobat res. Prova d’afinar el títol o l’autor.',
  'search.timedOut':
    'Les fonts responen lentament i encara no tenim dades. La sincronització en segon pla potser ja ha acabat — torna-ho a provar.',
  'search.freeOnlyToggle': 'Descàrrega gratuïta',
  'search.noFreeResults':
    'Cap d’aquests no té encara una descàrrega gratuïta — prova de desactivar el filtre.',
  'home.tagline': 'Troba el teu proper magnum opus',
  'subject.allLanguages': 'Totes les llengües.',
  'subject.filteredByLanguage': 'Només llibres amb una edició en {language}.',
  'subject.dropLanguageFilter': 'mostra totes les llengües',
  'subject.empty':
    'Encara no hi ha res sota aquesta etiqueta. Les etiquetes provenen dels llibres que aquesta instància ja ha obtingut.',
  'featured.year': '{year}',
  'nav.browse': 'Explora per gènere',
  'recommend.heading': 'A partir del que has estat llegint',
  'recommend.becauseOf': 'Vas obrir «{title}», així que aquí tens llibres dels mateixos gèneres.',
  'recommend.blurb': 'Llibres dels gèneres que has estat obrint.',
  'recommend.privacy':
    'Això es calcula al teu navegador — al servidor se li diuen els gèneres, mai qui ets.',
  'recommend.forget': 'oblida el meu historial',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Prestatge',
  'shelf.title': 'Prestatge',
  'shelf.intro':
    'Catàlegs oberts, i qualsevol servidor de biblioteca que gestionis tu mateix. Els catàlegs que afegeixis es queden en aquest navegador i mai no s’envien a aquest lloc.',
  'shelf.openCatalogs': 'Catàlegs oberts',
  'shelf.yourCatalogs': 'Els teus catàlegs',
  'shelf.addCatalog': 'Afegeix un catàleg',
  'shelf.name': 'Nom',
  'shelf.address': 'Adreça OPDS',
  'shelf.username': 'Nom d’usuari (opcional)',
  'shelf.password': 'Contrasenya (opcional)',
  'shelf.credentialsNote': 'L’adreça i qualsevol credencial es desen només en aquest navegador.',
  'shelf.add': 'Afegeix',
  'shelf.remove': 'Elimina',
  'shelf.loading': 'S’està carregant el catàleg…',
  'shelf.empty': 'Aquest catàleg no té entrades.',
  'shelf.noCatalogs':
    'Encara cap de propi. Afegeix més avall una adreça de Calibre-Web, COPS, Kavita o Audiobookshelf.',
  'shelf.unreachable':
    'El teu navegador no ha pogut llegir aquest catàleg. Un servidor a la teva pròpia xarxa funcionarà; els llocs públics sovint rebutgen les peticions d’altres orígens.',
  'shelf.nextPage': 'Pàgina següent',
  'shelf.previousPage': 'Pàgina anterior',
  'shelf.drm': 'Cal una aplicació amb DRM',
  'shelf.notFree': 'No és una descàrrega gratuïta',
  'shelf.download': 'Descarrega',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Llibreries a prop teu',
  'stores.useMyLocation': 'Fes servir la meva ubicació',
  'stores.placeLabel': 'Ciutat o codi postal',
  'stores.find': 'Cerca',
  'stores.locating': 'S’està cercant…',
  'stores.failed': 'La ubicació no està disponible. Escriu-hi una ciutat o un codi postal.',
  'stores.none': 'Cap llibreria cartografiada en un radi de {radius} km.',
  'stores.distance': 'a {distance} km',
  'stores.stockUnknown': 'Només dades de mapa — ningú no publica què té una botiga en estoc.',
  'stores.lookupFailed':
    'Ara mateix no s’ha pogut contactar amb OpenStreetMap. Prova-ho d’aquí a una estona.',
  'stores.privacy':
    'La teva ubicació s’arrodoneix a uns 100 m i només s’envia a OpenStreetMap — mai a aquest lloc.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Preus i botigues',
  'prices.loading': 'S’està preguntant a les botigues…',
  'prices.unknown': 'Preu no publicat',
  'prices.degraded': 'Sense resposta de: {providers}',
  'prices.format.hardcover': 'Tapa dura',
  'prices.format.paperback': 'Tapa tova',
  'prices.format.ebook': 'Llibre electrònic',
  'prices.format.audiobook': 'Audiollibre',
  'prices.format.unknown': 'Format no indicat',
  'recommend.hideGenre': 'amaga «{genre}»',
  'recommend.hiddenList': 'Gèneres amagats (fes clic per recuperar-ne un):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Desat',
  'settings.status.cleared': 'Esborrat',
  'settings.status.unstored': 'No desat',
  'settings.status.failed': 'Sense canvis',
  'settings.notStored':
    'Aquest navegador s’ha negat a desar el canvi, així que no ha passat res — continua vigent el valor que tenies abans.',
  'settings.language.title': 'Idioma de la interfície',
  'settings.language.changed':
    'Canviat de {from} a {to}. La interfície es torna a carregar en {to}; els títols dels llibres i els noms dels autors es mantenen en les seves llengües.',
  'settings.country.title': 'País de compra',
  'settings.country.changed':
    'Definit a {country}. Els enllaços de llibreries ara ofereixen botigues que hi lliuren, al costat de les internacionals.',
  'settings.country.cleared':
    'Cap país triat. Només s’oferiran llibreries que envien arreu del món.',
  'settings.bookLanguage.title': 'Llengua dels llibres',
  'settings.bookLanguage.changed':
    'Definida a {language}. Les pàgines de gènere encapçalaran amb llibres que tenen una edició en {language} fins que reiniciïs el filtre.',
  'settings.bookLanguage.cleared':
    'Esborrat. Les pàgines de gènere tornen a mostrar llibres en totes les llengües.',
  'settings.hiddenGenres.title': 'Gèneres amagats',
  'settings.hiddenGenres.hidden':
    '«{genre}» està amagat. Ja no s’envia al servidor quan es demanen suggeriments, i en total hi ha {count} gèneres amagats.',
  'settings.hiddenGenres.restored':
    '«{genre}» torna a ser als teus suggeriments. Encara hi ha {count} gèneres amagats.',
  'settings.history.title': 'Historial de lectura',
  'settings.history.cleared':
    'Els llibres que havies obert s’han esborrat d’aquest navegador. Els suggeriments no tornaran fins que no obris un altre llibre.',
  'settings.bookmarks.title': 'Llibres desats',
  'settings.bookmarks.added': '«{title}» s’ha afegit als teus llibres desats.',
  'settings.bookmarks.removed': '«{title}» s’ha tret dels teus llibres desats.',
  'settings.bookmarks.failed':
    'El servidor no ha acceptat el canvi, així que els teus llibres desats són els mateixos.',
  'settings.catalogs.title': 'Els teus catàlegs',
  'settings.catalogs.added':
    '«{name}» s’ha afegit a {url}. La seva adreça es queda en aquest navegador i mai no s’envia a aquest lloc.',
  'settings.catalogs.addedWithCredentials':
    '«{name}» s’ha afegit a {url}, amb el nom d’usuari i la contrasenya que has escrit. Tot es queda en aquest navegador i res no s’envia a aquest lloc.',
  'settings.catalogs.removed':
    '«{name}» s’ha tret d’aquest navegador, juntament amb qualsevol credencial que hi tingués desada.',
  'settings.catalogs.rejected': 'No s’ha afegit res: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Complements',
  'addons.title': 'Complements',
  'addons.intro':
    'Un complement afegeix fonts pròpies. L’instal·les enganxant-ne l’adreça; s’executa al teu dispositiu, dins d’un espai aïllat, o al servidor del seu autor. Golden Library no en distribueix cap, no en llista cap i no comprova què retornen.',
  'addons.addressLabel': 'Adreça del complement',
  'addons.addressHint': 'L’URL del manifest que t’ha donat l’autor del complement.',
  'addons.continue': 'Continua',
  'addons.fromServer': 'Des d’un servidor',
  'addons.fromFile': 'Des d’un fitxer del teu dispositiu',
  'addons.bundleLabel': 'Adreça del codi del complement',
  'addons.bundleHint':
    'L’URL del codi del complement. S’executarà en aquest dispositiu, no en un servidor.',
  'addons.integrityLabel': 'Resum d’integritat',
  'addons.integrityHint':
    'El dona l’autor del complement, com a sha256-… . És obligatori: sense ell, el codi que vas aprovar una vegada podria canviar després sense que ho sabessis mai.',
  'addons.checking': 'S’està llegint el complement…',
  'addons.installedHeading': 'Instal·lats',
  'addons.none':
    'Encara cap complement. Tot el que hi ha en aquest lloc fins ara ve de la instància mateixa.',
  'addons.priorityHint': 'L’ordre és la prioritat: el primer complement respon primer.',
  'addons.enable': 'Activa',
  'addons.disable': 'Desactiva',
  'addons.off': 'Desactivat',
  'addons.remove': 'Elimina',
  'addons.moveUp': 'Mou amunt',
  'addons.moveDown': 'Mou avall',
  'addons.configure': 'Configura',
  'addons.failedToStart': '«{name}» no s’ha iniciat: {reason}',
  'addons.consentTitle': 'Vols instal·lar «{name}»?',
  'addons.consentHosts': 'Contactarà amb: {hosts}',
  'addons.consentNoHosts': 'No ha demanat contactar amb res.',
  'addons.consentSeesYou':
    'Aquest complement s’executa al servidor del seu autor. Ell veurà la teva adreça i tot el que hi cerquis.',
  'addons.consentSandboxed':
    'Aquest complement s’executa al teu dispositiu, dins d’un espai aïllat. No pot llegir les teves galetes, les dades d’aquest lloc ni res més que tinguis obert.',
  'addons.consentNotVetted':
    'Golden Library no comprova què retorna un complement i no ha recomanat aquest. El que instal·lis és cosa teva.',
  'addons.install': 'Instal·la',
  'addons.cancel': 'Cancel·la',
  'addons.via': 'via {name}',
  'addons.sourcesTitle': 'Dels teus complements',
  'addons.searchTitle': 'Trobat pels teus complements',
  'addons.showLinks': 'Mostra els enllaços de descàrrega',
  'addons.unreadable': 'No s’han pogut llegir {count} entrades d’aquest complement.',
  'addons.browse': 'Explora el catàleg',
  'addons.browseTitle': 'El catàleg de {name}',
  'addons.browseNoCatalog': 'Aquest complement no ofereix cap catàleg per explorar.',
  'addons.browseEmpty': 'El catàleg d’aquest complement ara mateix és buit.',
  'addons.browseFailed': 'No s’ha pogut carregar el catàleg de «{name}»: {reason}',
  'addons.loadMore': 'Carrega’n més',
  'addons.notInstalled': 'Aquest complement no està instal·lat.',

  'settings.addons.title': 'Els teus complements',
  'settings.addons.installed':
    '«{name}» està instal·lat. Se li preguntarà al costat dels altres i pot contactar amb {hosts}.',
  'settings.addons.removed':
    '«{name}» s’ha eliminat. Els seus resultats han desaparegut d’aquest navegador, i també tot el que hi tenia desat.',
  'settings.addons.enabled': '«{name}» torna a estar actiu i se li preguntarà amb els altres.',
  'settings.addons.disabled':
    '«{name}» està desactivat. Continua instal·lat amb la seva configuració, però no es mostrarà res del que retorni.',
  'settings.addons.reordered': '«{name}» ara respon en la posició {position} de {total}.',
  'settings.addons.rejected': 'No s’ha instal·lat res: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Fonts pròpies',
  'customSources.title': 'Fonts pròpies',
  'customSources.intro':
    'Afegeix una botiga o un catàleg propis donant-los un nom i un URL de cerca amb {isbn}, {query}, {title}, {author} o {language} a dins. L’enllaç es construeix en aquest dispositiu i aquest lloc no el consulta mai.',
  'customSources.nameLabel': 'Nom',
  'customSources.templateLabel': 'Plantilla d’URL',
  'customSources.templateHint':
    'Una adreça https:// absoluta. {isbn}, {query}, {title}, {author} i {language} s’omplen a partir de l’edició; un marcador que quedi buit vol dir que l’enllaç s’omet per a aquella edició.',
  'customSources.add': 'Afegeix una font',
  'customSources.listHeading': 'Les teves fonts',
  'customSources.none': 'Encara cap font pròpia.',
  'customSources.off': 'Desactivada',
  'customSources.enable': 'Activa',
  'customSources.disable': 'Desactiva',
  'customSources.remove': 'Elimina',
  'customSources.heading': 'Les teves fonts',
  'customSources.caption':
    'Enllaços que has configurat tu mateix. Aquesta instància no comprova on porten.',

  'settings.customSources.title': 'Les teves fonts pròpies',
  'settings.customSources.added': '«{name}» s’ha afegit i s’oferirà al costat de les altres.',
  'settings.customSources.removed': '«{name}» s’ha tret d’aquest navegador.',
  'settings.customSources.enabled': '«{name}» torna a estar activa.',
  'settings.customSources.disabled':
    '«{name}» està desactivada. Continua configurada, però el seu enllaç no es mostrarà.',
  'settings.customSources.rejected': 'No s’ha afegit res: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Llibres en la teva llengua',
  'featured.inLanguageBlurb':
    'Llibres escrits en la llengua en què llegeixes aquest lloc, primer els més publicats — l’ordre de la mateixa Open Library, no una llista de més venuts.',
  'work.newSearch': 'Cerca nova',
  'work.descriptionFrom': 'Descripció:',
  'work.descriptionNotLocalized':
    'Aquesta descripció és en la llengua en què la va escriure la font — en la teva llengua encara no n’hi ha cap per a aquest llibre.',

  // Reader ratings of an edition, never of a translation — see TranslationRatings.tsx.
  'ratings.edition': '{average} de {outOf} de {votes} lectors a {source}',
  'ratings.lowConfidence': 'massa pocs vots per comparar',
  'ratings.reviews': 'Ressenyes',
  'ratings.reviewsOn': 'Ressenyes d’aquesta edició a {source}',
  'ratings.noteNoRatings':
    'Cap font oberta no puntua una traducció, i cap d’aquestes tirades no té aquí una valoració de lectors.',
  'ratings.noteReviews':
    'On una edició es coneix a {sources}, l’enllaç porta a les ressenyes exactament d’aquella tirada — la majoria d’edicions no s’hi coneixen.',
  'ratings.translator':
    'Edicions traduïdes per {name}: {average} de {outOf} en {editions} edicions valorades, {votes} lectors en total.',
  'ratings.note':
    'Són valoracions de lectors d’una edició concreta a {sources}, no un judici sobre la traducció mateixa — això no ho publica ningú. Val la pena llegir-les de costat: mateix llibre, mateixa llengua, traductors diferents, i sempre amb el nombre de vots a la vista.',
  'ratings.gapWithoutIsbn':
    '{count} edicions d’aquí no porten ISBN, així que no s’hi ha pogut fer coincidir cap valoració.',
  'ratings.gapNotLookedUp': '{count} edicions més no s’han consultat en aquesta petició.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Llegeix al teu navegador',
  'reader.privacy':
    'El teu navegador obre aquest llibre pel seu compte. El fitxer, el lloc d’on ve i fins on has llegit no arriben mai a aquest lloc.',
  'reader.chooseFile': 'Obre un llibre d’aquest dispositiu',
  'reader.formats': 'EPUB, FB2, MOBI i CBZ.',
  'reader.loading': 'S’està obrint…',
  'reader.failed': 'Aquest llibre no s’ha pogut obrir: {reason}',
  'reader.previous': 'Pàgina anterior',
  'reader.next': 'Pàgina següent',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…o deixa anar un llibre aquí',
  'reader.fetching': 'S’està demanant el fitxer a {host}…',
  'reader.blockedTitle': '{host} no ha lliurat el fitxer a aquesta pàgina',
  'reader.blockedBody':
    'O no s’hi pot arribar, o no permet que altres llocs llegeixin els seus fitxers. Aquest lloc no l’anirà a buscar en lloc teu: el teu llibre no hi passa mai, i aquesta és tota la gràcia de llegir aquí.',
  'reader.blockedDownload': 'Descarrega’l de {host}',
  'reader.blockedOpenHere': 'i després obre’l aquí des del teu dispositiu',
  'reader.blockedAddon': 'També funciona un complement que serveixi el fitxer ell mateix.',
  'reader.keepFile': 'Conserva aquest llibre en aquest navegador',
  'reader.keepFileHint':
    'Desactivat per defecte. Sense això, el fitxer desapareix quan tanques la pestanya; amb això, es queda només en aquest dispositiu.',
  'reader.library': 'Conservats en aquest navegador',
  'reader.libraryEmpty':
    'Encara no hi ha res conservat. Els llibres que conserves es queden en aquest dispositiu i no es pugen mai enlloc.',
  'reader.libraryOpen': 'Obre',
  'reader.libraryRemove': 'Elimina',
  'reader.libraryFileKept': 'fitxer conservat',
  'reader.libraryFileGone': 'fitxer no conservat',
  'reader.untitled': 'Llibre sense títol',
  'settings.reader.libraryTitle': 'Llibres conservats en aquest navegador',
  'settings.reader.kept':
    '«{title}» ara es conserva en aquest dispositiu, així que s’obre sense tornar-lo a descarregar. No es puja enlloc.',
  'settings.reader.forgotten':
    'El fitxer de «{title}» s’ha esborrat d’aquest navegador. L’entrada es queda a la llista, així que el pots tornar a obrir des de la seva font.',
  'settings.reader.removed':
    '«{title}» s’ha tret completament d’aquest navegador — el fitxer i l’entrada.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Obert on ho vas deixar — al {percent}%.',
  'reader.bookmarks': 'Marcadors',
  'reader.bookmarkAdd': 'Posa un marcador en aquesta pàgina',
  'reader.bookmarkNone': 'Encara no hi ha marcadors en aquest llibre.',
  'reader.bookmarkGo': 'Vés a',
  'reader.bookmarkRemove': 'Treu el marcador',
  'reader.bookmarkNote': 'Nota',
  'reader.bookmarkNotePlaceholder': 'Les teves paraules sobre aquesta pàgina',
  'reader.bookmarkAt': 'al {percent}%',
  'settings.reader.bookmarkTitle': 'Marcadors en aquest navegador',
  'settings.reader.bookmarkAdded':
    'Marcador al {percent}% de «{title}». Els marcadors es queden en aquest dispositiu amb el llibre.',
  'settings.reader.bookmarkRemoved': 'Aquell marcador de «{title}» s’ha tret d’aquest navegador.',
  'settings.reader.noteSaved':
    'La teva nota d’aquesta pàgina de «{title}» s’ha desat en aquest dispositiu.',
  'settings.reader.positionTitle': 'Punt de lectura',
  'settings.reader.positionUnstored':
    'Aquest navegador no ha volgut desar on ets a «{title}», així que la propera vegada s’obrirà des del començament. Tant el mode privat com un disc ple fan això.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': 'Com es veu aquest llibre',
  'reader.theme': 'Colors',
  'reader.themeApp': 'Com el lloc',
  'reader.themeLight': 'Paper',
  'reader.themeDark': 'Tinta',
  'reader.themeSepia': 'Sèpia',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint':
    'Negre pur sobre blanc, sense animació, una columna — per a pantalles de paper electrònic.',
  'reader.fontSize': 'Mida de la lletra',
  'reader.smaller': 'Més petita',
  'reader.larger': 'Més gran',
  'reader.lineHeight': 'Interlineat',
  'reader.margin': 'Marges',
  'reader.flow': 'Pàgines',
  'reader.flowPaged': 'Passa pàgines',
  'reader.flowScrolled': 'Desplaça',
  'reader.justify': 'Justifica el text',
  'reader.hyphenate': 'Partició de mots',
  'reader.displayReset': 'Torna als valors per defecte',
  'settings.reader.displayTitle': 'Aspecte de lectura',
  'settings.reader.displayChanged':
    '{setting} ara és {value}. S’aplica a cada llibre que obris en aquest navegador.',
  'settings.reader.displayReset':
    'L’aspecte de lectura ha tornat als valors per defecte per a tots els llibres d’aquest navegador.',
  'reader.on': 'Activat',
  'reader.off': 'Desactivat',
  'reader.openHere': 'Llegeix al teu navegador',
  'reader.notAFileTitle': '{host} ha enviat una pàgina web, no el fitxer',
  'reader.notAFileBody':
    'L’enllaç porta a una pàgina i no a un llibre — una pàgina de descàrrega, una pantalla de consentiment o una comprovació que no ets un robot. Obre-la tu mateix i el fitxer hi serà.',
  'settings.status.session': 'No recordat',
  'settings.notRemembered':
    'Aquest navegador no ho ha volgut recordar, així que tornarà a ser com era la propera vegada que obris un llibre.',
  'compare.rowEditionStatement': 'Edició',
  'home.genres': 'Gèneres populars',
  'home.genresBlurb': 'Les etiquetes amb més llibres al darrere. Cadascuna obre el seu catàleg.',
};
