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

  'home.title': 'BookTranslate Finder',
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
    'Un libro destacado por cada año reciente. Una lista elegida a mano, no una lista de ventas — no existe ninguna fuente abierta que las publique.',
  'featured.popularHeading': 'Muy leídos, muy traducidos',
  'featured.popularBlurb':
    'Libros que existen en muchos idiomas — que es justo para lo que sirve este sitio.',
  'featured.filling': 'Algunos se están trayendo en segundo plano. Recarga la página en un minuto.',
  'featured.freeCopy': 'Copia gratuita',

  'work.original': 'original',
  'work.dataSources': 'Fuentes de datos',
  'work.about': 'Sobre este libro',
  'work.translatedInto': 'Traducido a',
  'work.noTranslations': 'Aún no se han encontrado traducciones.',
  'work.editions': 'Ediciones ({shown} de {total})',
  'work.filterLanguage': 'Idioma',
  'work.filterAllLanguages': 'Todos los idiomas',
  'work.filterYear': 'Año',
  'work.filterApply': 'Filtrar',
  'work.filterReset': 'Restablecer',
  'work.noEditionsMatch': 'Ninguna edición coincide con estos filtros.',
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
  'home.tagline': 'Encuentra tu próximo magnum opus',
  'subject.allLanguages': 'Todos los idiomas.',
  'subject.filteredByLanguage': 'Solo libros con una edición en {language}.',
  'subject.dropLanguageFilter': 'mostrar todos los idiomas',
  'subject.empty':
    'Todavía no hay nada con esta etiqueta. Las etiquetas provienen de los libros que esta instancia ya ha obtenido.',
  'featured.year': '{year}',
  'nav.browse': 'Por género',
};
