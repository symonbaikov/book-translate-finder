import type { Dictionary } from '../dictionary';

export const fr: Dictionary = {
  'nav.savedBooks': 'Livres enregistrés',
  'nav.signIn': 'Se connecter',
  'nav.signOut': 'Se déconnecter',
  'nav.language': 'Langue',
  'nav.skipToContent': 'Aller au contenu',

  'footer.legal':
    "Sources légales uniquement : téléchargement direct réservé au domaine public et aux licences ouvertes ; livres sous droit d'auteur — achat ou emprunt en bibliothèque. Chaque lien indique explicitement son statut juridique.",
  'footer.openSource': 'Open source',
  'footer.openSourceRest': '— licence MIT, auto-hébergeable. Code source sur GitHub.',

  'home.title': 'Golden Library',
  'home.subtitle': 'Un agrégateur ouvert de traductions : langues, éditions et sources légales.',
  'home.searchLabel': 'Titre et auteur',
  'home.searchPlaceholder': 'Guerre et Paix Tolstoï',
  'home.searchButton': 'Rechercher',

  'search.searching': 'Recherche en cours…',
  'search.backfilling':
    "Rien pour l'instant — nous récupérons ce livre auprès des sources. Cela prend quelques secondes.",
  'search.notFound': 'Aucun résultat pour cette recherche.',
  'search.retry': 'Réessayer',
  'search.signInPrompt':
    " pour enregistrer les livres trouvés et y revenir — et comparer des éditions de différentes années avant d'en choisir une.",

  'featured.yearHeading': "Livres de l'année",
  'featured.yearBlurb':
    "Des livres marquants pour chaque année récente. Une liste choisie à la main, pas un classement des ventes — aucune source ouverte n'en publie.",
  'featured.popularHeading': 'Très lus, très traduits',
  'featured.popularBlurb':
    "Des livres qui existent en de nombreuses langues — c'est précisément l'objet de ce site.",
  'featured.filling':
    'Quelques-uns sont encore en cours de récupération. Rechargez la page dans une minute.',
  'featured.freeCopy': 'Copie gratuite',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'À lire gratuitement',
  'free.homeBlurb':
    'Des livres du domaine public ou sous licence ouverte, que cette instance remet directement.',
  'free.seeAll': 'Voir plus',
  'free.downloadable': 'Télécharger',
  'free.pageTitle': 'Livres gratuits',
  'free.pageBlurb':
    'Chaque livre ici a au moins une copie gratuite légale : domaine public, ou offerte par l’ayant droit. Sans achat ni carte de bibliothèque.',
  'free.empty':
    'Rien de gratuit pour l’instant. Les copies gratuites apparaissent à mesure que cette instance récupère des livres : cherchez-en un et revenez.',
  'free.emptyForLanguage':
    'Aucune copie gratuite en {language} pour l’instant. Retirez le filtre ci-dessus pour voir toute l’étagère.',
  'free.showMore': 'Afficher plus',
  'free.shown': 'Affichage de {shown} sur {total}.',
  'free.allLanguages': 'Copies gratuites dans toutes les langues.',
  'free.filteredByLanguage': 'Uniquement les copies gratuites en {language}.',
  'free.filterByLanguage': 'Afficher uniquement les copies gratuites en {language}.',
  'free.dropLanguageFilter': 'afficher toutes les langues',
  'free.loadFailed': 'Impossible de charger les livres gratuits pour le moment.',

  'work.original': 'original',
  'work.dataSources': 'Sources des données',
  'work.about': 'À propos de ce livre',
  'work.translatedInto': 'Traduit en',
  'work.availableIn': 'Disponible en',
  'work.languagesNote':
    'Uniquement ce que recensent nos sources — une traduction absente ici peut exister malgré tout.',
  'work.noTranslations': 'Aucune traduction trouvée pour le moment.',
  'work.yourLanguage.title': 'Dans votre langue',
  'work.yourLanguage.yes': 'Il existe une traduction en {language}.',
  'work.yourLanguage.original': 'Ce livre a été écrit en {language}.',
  'work.yourLanguage.no': 'Aucune traduction en {language} parmi les éditions connues ici.',
  'work.yourLanguage.show': 'Voir les éditions en {language}',
  'work.editions': 'Éditions ({shown} sur {total})',
  'work.filterLanguage': 'Langue',
  'work.filterAllLanguages': 'Toutes les langues',
  'work.filterYear': 'Année',
  'work.filterApply': 'Filtrer',
  'work.filterReset': 'Réinitialiser',
  'work.noEditionsMatch': 'Aucune édition ne correspond à ces filtres.',
  'work.showMoreEditions': 'Afficher plus d’éditions (il en reste {remaining})',
  'work.badgeFreeDownload': 'téléchargement gratuit',
  'work.freeDownloadFormat': 'Télécharger {format}',
  'work.freeDownloadNote': '{rights}. Gratuit via {provider} — sans compte ni paiement.',
  'work.badgeReadBorrow': 'lire ou emprunter',
  'work.badgeInBookstores': 'en librairie',
  'work.translatedBy': 'traduit par {name}',
  'work.pages': '{count} pages',

  'bookmark.save': 'Enregistrer ce livre',
  'bookmark.saved': 'Enregistré',
  'bookmark.signInToSave': 'Connectez-vous pour enregistrer',
  'bookmark.failed': "L'enregistrement a échoué. Réessayez.",

  'links.show': 'Afficher les liens',
  'links.hide': 'Masquer les liens',
  'links.loading': 'Chargement des liens',
  'links.none': "Aucun lien légal pour cette édition pour l'instant.",
  'links.viaOtherEdition': "exemplaire gratuit de l'édition {label}",
  'links.failed': 'Impossible de charger les liens.',
  'links.storesHeading': 'Trouver en librairie',
  'links.storesInCountry': 'En {country}',
  'links.storesYourCountry': 'votre pays',
  'links.storesLanguageMarket': 'Où les livres en {language} sont vendus',
  'links.storesLanguageMarketGeneric': 'Où les livres dans la langue de cette édition sont vendus',
  'links.storesWorldwide': 'Livraison dans le monde entier',
  'links.storesCaption':
    "Chaque lien effectue une recherche dans le catalogue de la librairie — c'est elle qui affiche la disponibilité et le prix.",

  'linkType.download': 'Télécharger',
  'linkType.buy': 'Acheter',
  'linkType.borrow': 'Emprunter en bibliothèque',
  'linkType.listen': 'Écouter (livre audio)',
  'rights.public_domain': 'Domaine public',
  'rights.open_license': 'Licence ouverte',
  'rights.copyrighted': "Sous droit d'auteur",
  'rights.unknown': 'Statut inconnu',

  'compare.heading': 'Comparer les éditions',
  'compare.blurb': 'Choisissez deux ou trois éditions pour voir ce qui les distingue réellement.',
  'compare.selected': '{count} sélectionnée(s), il en faut au moins 2.',
  'compare.editSelection': 'Modifier les éditions',
  'compare.showAllEditions': 'Afficher les {count} éditions',
  'compare.columnDifference': 'Différence',
  'compare.identical': 'Sur tout ce que les sources enregistrent, ces éditions sont identiques.',
  'compare.rowLanguage': 'Langue',
  'compare.rowPublished': 'Publication',
  'compare.rowPublisher': 'Éditeur',
  'compare.rowTranslator': 'Traducteur',
  'compare.rowTranslatedFrom': 'Traduit du',
  'compare.rowBinding': 'Reliure',
  'compare.rowPages': 'Pages',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Exemplaire gratuit ou empruntable',
  'compare.yes': 'oui ({count})',
  'compare.no': 'introuvable',

  'country.label': 'Où achetez-vous vos livres ?',
  'country.worldwideOnly': 'Uniquement les librairies expédiant partout',

  'auth.signInTitle': 'Connexion',
  'auth.registerTitle': 'Créer un compte',
  'auth.blurb':
    "Un compte sert à une seule chose : enregistrer les livres que vous trouvez et y revenir — avec les langues de traduction, les éditions existantes et le moyen légal d'obtenir chacune. Pas de newsletter, pas de profil, pas de traçage.",
  'auth.name': 'Nom (facultatif)',
  'auth.email': 'E-mail',
  'auth.password': 'Mot de passe',
  'auth.passwordHint':
    'Au moins {min} caractères. Seule la longueur est vérifiée — une phrase longue dont vous vous souvenez vaut mieux qu’un mot court avec de la ponctuation.',
  'auth.submitSignIn': 'Se connecter',
  'auth.submitRegister': 'Créer le compte',
  'auth.working': 'En cours…',
  'auth.google': 'Continuer avec Google',
  'auth.toRegister': 'Pas encore de compte ? Créez-en un',
  'auth.toSignIn': 'Vous avez déjà un compte ? Connectez-vous',
  'auth.backToSearch': 'Retour à la recherche',
  'auth.errorGoogleState':
    'Ce lien de connexion a expiré ou a été ouvert dans un autre navigateur. Réessayez.',
  'auth.errorGoogleFailed':
    "La connexion Google n'a pas abouti. Vous pouvez utiliser un e-mail et un mot de passe.",
  'auth.errorGeneric': "Une erreur s'est produite.",

  'bookmarks.title': 'Livres enregistrés',
  'bookmarks.signedOut':
    ' pour garder les livres que vous trouvez — et comparer plus tard les éditions d’un même livre.',
  'bookmarks.loading': 'Chargement…',
  'bookmarks.empty':
    "Rien d'enregistré pour l'instant. Trouvez un livre et utilisez « Enregistrer ce livre » sur sa fiche.",
  'bookmarks.searchLink': 'Rechercher',
  'bookmarks.remove': 'Retirer',
  'bookmarks.loadFailed': 'Impossible de charger vos livres enregistrés.',
  'search.failed': 'La recherche a échoué.',
  'search.pending': 'Pas encore dans notre base — nous interrogeons les sources',
  'search.pendingLong':
    'Recherche toujours en cours : la première requête pour un livre collecte les données auprès des sources, ce qui peut prendre quelques minutes',
  'search.notFoundHint': "Aucun résultat. Essayez de préciser le titre ou l'auteur.",
  'search.timedOut':
    "Les sources répondent lentement et nous n'avons pas encore de données. La synchronisation en arrière-plan est peut-être déjà terminée — réessayez.",
  'search.freeOnlyToggle': 'Téléchargement gratuit',
  'search.noFreeResults':
    "Aucun de ces résultats n'a de téléchargement gratuit pour l'instant — essayez de désactiver le filtre.",
  'home.tagline': 'Trouvez votre prochain magnum opus',
  'subject.allLanguages': 'Toutes les langues.',
  'subject.filteredByLanguage': 'Uniquement les livres ayant une édition en {language}.',
  'subject.dropLanguageFilter': 'afficher toutes les langues',
  'subject.empty':
    "Rien sous cette étiquette pour l'instant. Les étiquettes viennent des livres déjà récupérés par cette instance.",
  'featured.year': '{year}',
  'nav.browse': 'Par genre',
  'recommend.heading': 'D’après vos lectures',
  'recommend.becauseOf': 'Vous avez ouvert « {title} » : voici des livres des mêmes genres.',
  'recommend.blurb': 'Des livres dans les genres que vous avez ouverts.',
  'recommend.privacy':
    'Le calcul se fait dans votre navigateur — le serveur reçoit les genres, jamais votre identité.',
  'recommend.forget': 'oublier mon historique',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Étagère',
  'shelf.title': 'Étagère',
  'shelf.intro':
    'Catalogues ouverts, et tout serveur de bibliothèque que vous hébergez vous-même. Les catalogues que vous ajoutez restent dans ce navigateur et ne sont jamais envoyés à ce site.',
  'shelf.openCatalogs': 'Catalogues ouverts',
  'shelf.yourCatalogs': 'Vos catalogues',
  'shelf.addCatalog': 'Ajouter un catalogue',
  'shelf.name': 'Nom',
  'shelf.address': 'Adresse OPDS',
  'shelf.username': "Nom d'utilisateur (facultatif)",
  'shelf.password': 'Mot de passe (facultatif)',
  'shelf.credentialsNote':
    "L'adresse et les identifiants sont conservés uniquement dans ce navigateur.",
  'shelf.add': 'Ajouter',
  'shelf.remove': 'Supprimer',
  'shelf.loading': 'Chargement du catalogue…',
  'shelf.empty': 'Ce catalogue ne contient aucune entrée.',
  'shelf.noCatalogs':
    "Aucun des vôtres pour l'instant. Ajoutez ci-dessous une adresse Calibre-Web, COPS, Kavita ou Audiobookshelf.",
  'shelf.unreachable':
    "Votre navigateur n'a pas pu lire ce catalogue. Un serveur de votre propre réseau fonctionnera ; les sites publics refusent souvent les requêtes cross-origin.",
  'shelf.nextPage': 'Page suivante',
  'shelf.previousPage': 'Page précédente',
  'shelf.drm': 'Nécessite une application DRM',
  'shelf.notFree': 'Téléchargement payant',
  'shelf.download': 'Télécharger',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Librairies près de chez vous',
  'stores.useMyLocation': 'Utiliser ma position',
  'stores.placeLabel': 'Ville ou code postal',
  'stores.find': 'Chercher',
  'stores.locating': 'Recherche…',
  'stores.failed': 'Position indisponible. Saisissez plutôt une ville ou un code postal.',
  'stores.none': 'Aucune librairie cartographiée dans un rayon de {radius} km.',
  'stores.distance': 'à {distance} km',
  'stores.stockUnknown':
    "Données cartographiques uniquement — personne ne publie ce qu'une librairie a en stock.",
  'stores.lookupFailed': 'OpenStreetMap est injoignable pour le moment. Réessayez dans un instant.',
  'stores.privacy':
    'Votre position est arrondie à environ 100 m et envoyée uniquement à OpenStreetMap — jamais à ce site.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Prix et librairies',
  'prices.loading': 'Interrogation des librairies…',
  'prices.unknown': 'Prix non publié',
  'prices.degraded': 'Sans réponse : {providers}',
  'prices.format.hardcover': 'Relié',
  'prices.format.paperback': 'Broché',
  'prices.format.ebook': 'Livre numérique',
  'prices.format.audiobook': 'Livre audio',
  'prices.format.unknown': 'Format non précisé',
  'recommend.hideGenre': 'masquer « {genre} »',
  'recommend.hiddenList': 'Genres masqués (cliquez pour en rétablir un) :',

  // --- Popups de réglages ---
  'settings.status.saved': 'Enregistré',
  'settings.status.cleared': 'Réinitialisé',
  'settings.status.unstored': 'Non enregistré',
  'settings.status.failed': 'Inchangé',
  'settings.notStored':
    'Ce navigateur a refusé d’enregistrer la modification : rien ne s’est passé, la valeur précédente reste en vigueur.',
  'settings.language.title': 'Langue de l’interface',
  'settings.language.changed':
    'Passée de {from} à {to}. L’interface se recharge en {to} ; les titres et les noms d’auteurs restent dans leur propre langue.',
  'settings.country.title': 'Pays d’achat',
  'settings.country.changed':
    'Défini sur {country}. Les liens vers les librairies proposent désormais les enseignes qui livrent là-bas, en plus des mondiales.',
  'settings.country.cleared':
    'Aucun pays choisi. Seules les librairies livrant dans le monde entier seront proposées.',
  'settings.bookLanguage.title': 'Langue des livres',
  'settings.bookLanguage.changed':
    'Définie sur {language}. Les pages de genres afficheront d’abord les livres ayant une édition en {language}, jusqu’à la réinitialisation du filtre.',
  'settings.bookLanguage.cleared':
    'Réinitialisée. Les pages de genres affichent de nouveau les livres dans toutes les langues.',
  'settings.hiddenGenres.title': 'Genres masqués',
  'settings.hiddenGenres.hidden':
    '« {genre} » est masqué. Il n’est plus envoyé au serveur lors des suggestions, et {count} genres sont masqués au total.',
  'settings.hiddenGenres.restored':
    '« {genre} » réapparaît dans vos suggestions. {count} genres restent masqués.',
  'settings.history.title': 'Historique de lecture',
  'settings.history.cleared':
    'Les livres que vous aviez ouverts ont été supprimés de ce navigateur. Les suggestions ne reviendront qu’après l’ouverture d’un nouveau livre.',
  'settings.bookmarks.title': 'Livres enregistrés',
  'settings.bookmarks.added': '« {title} » a été ajouté à vos livres enregistrés.',
  'settings.bookmarks.removed': '« {title} » a été retiré de vos livres enregistrés.',
  'settings.bookmarks.failed':
    'Le serveur n’a pas accepté la modification : vos livres enregistrés sont inchangés.',
  'settings.catalogs.title': 'Vos catalogues',
  'settings.catalogs.added':
    '« {name} » a été ajouté à l’adresse {url}. Son adresse reste dans ce navigateur et n’est jamais envoyée à ce site.',
  'settings.catalogs.addedWithCredentials':
    '« {name} » a été ajouté à l’adresse {url}, avec l’identifiant et le mot de passe saisis. Tout cela reste dans ce navigateur et rien n’est envoyé à ce site.',
  'settings.catalogs.removed':
    '« {name} » a été retiré de ce navigateur, ainsi que les identifiants qui y étaient enregistrés.',
  'settings.catalogs.rejected': 'Rien n’a été ajouté : {reason}',
  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Extensions',
  'addons.title': 'Extensions',
  'addons.intro':
    'Une extension apporte ses propres sources. Vous l’installez en collant son adresse ; elle s’exécute soit sur votre appareil, dans un bac à sable, soit sur le serveur de son auteur. Golden Library n’en fournit aucune, n’en publie aucune liste et ne vérifie pas ce qu’elles renvoient.',
  'addons.addressLabel': 'Adresse de l’extension',
  'addons.addressHint': 'L’URL du manifeste que son auteur vous a donnée.',
  'addons.continue': 'Continuer',
  'addons.fromServer': 'Depuis un serveur',
  'addons.fromFile': 'Depuis un fichier, sur votre appareil',
  'addons.bundleLabel': 'Adresse du code de l’extension',
  'addons.bundleHint':
    'L’URL du code de l’extension. Il s’exécutera sur cet appareil, pas sur un serveur.',
  'addons.integrityLabel': 'Empreinte d’intégrité',
  'addons.integrityHint':
    'Donnée par l’auteur, sous la forme sha256-… . Obligatoire : sans elle, un code approuvé une fois pourrait changer ensuite sans que vous le sachiez.',
  'addons.checking': 'Lecture de l’extension…',
  'addons.installedHeading': 'Installées',
  'addons.none':
    'Aucune extension pour l’instant. Tout ce que vous voyez ici vient de l’instance elle-même.',
  'addons.priorityHint': 'L’ordre est la priorité : la première extension répond en premier.',
  'addons.enable': 'Activer',
  'addons.disable': 'Désactiver',
  'addons.off': 'Désactivée',
  'addons.remove': 'Retirer',
  'addons.moveUp': 'Monter',
  'addons.moveDown': 'Descendre',
  'addons.configure': 'Configurer',
  'addons.failedToStart': '« {name} » n’a pas démarré : {reason}',
  'addons.consentTitle': 'Installer « {name} » ?',
  'addons.consentHosts': 'Elle contactera : {hosts}',
  'addons.consentNoHosts': 'Elle n’a demandé à contacter personne.',
  'addons.consentSeesYou':
    'Cette extension tourne sur le serveur de son auteur. Il verra votre adresse et tout ce que vous cherchez par son intermédiaire.',
  'addons.consentSandboxed':
    'Cette extension tourne sur votre appareil, dans un bac à sable. Elle ne peut lire ni vos cookies, ni les données de ce site, ni rien d’autre d’ouvert chez vous.',
  'addons.consentNotVetted':
    'Golden Library ne vérifie pas ce qu’une extension renvoie et n’a pas recommandé celle-ci. Ce que vous installez vous regarde.',
  'addons.install': 'Installer',
  'addons.cancel': 'Annuler',
  'addons.via': 'via {name}',
  'addons.sourcesTitle': 'De vos extensions',
  'addons.searchTitle': 'Trouvé par vos extensions',
  'addons.showLinks': 'Afficher les liens de téléchargement',
  'addons.unreadable': '{count} entrées de cette extension étaient illisibles.',
  'addons.browse': 'Parcourir le catalogue',
  'addons.browseTitle': 'Catalogue de « {name} »',
  'addons.browseNoCatalog': "Cette extension n'offre pas de catalogue à parcourir.",
  'addons.browseEmpty': 'Le catalogue de cette extension est vide pour le moment.',
  'addons.browseFailed': 'Impossible de charger le catalogue de « {name} » : {reason}',
  'addons.loadMore': 'Charger plus',
  'addons.notInstalled': "Cette extension n'est pas installée.",

  'settings.addons.title': 'Vos extensions',
  'settings.addons.installed':
    '« {name} » est installée. Elle sera interrogée avec les autres et pourra contacter {hosts}.',
  'settings.addons.removed':
    '« {name} » a été retirée. Ses résultats ont disparu de ce navigateur, ainsi que tout ce qu’elle y avait stocké.',
  'settings.addons.enabled': '« {name} » est réactivée et sera interrogée avec les autres.',
  'settings.addons.disabled':
    '« {name} » est désactivée. Elle reste installée avec ses réglages, mais rien de ce qu’elle renvoie ne sera affiché.',
  'settings.addons.reordered': '« {name} » répond maintenant en position {position} sur {total}.',
  'settings.addons.rejected': 'Rien n’a été installé : {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Sources personnalisées',
  'customSources.title': 'Sources personnalisées',
  'customSources.intro':
    'Ajoutez votre propre boutique ou catalogue en lui donnant un nom et une URL de recherche contenant {isbn}, {query}, {title}, {author} ou {language}. Le lien est construit sur cet appareil et ce site ne le récupère jamais.',
  'customSources.nameLabel': 'Nom',
  'customSources.templateLabel': 'Modèle d’URL',
  'customSources.templateHint':
    'Une adresse https:// absolue. {isbn}, {query}, {title}, {author} et {language} sont remplis à partir de l’édition ; si un espace réservé reste vide, le lien est omis pour cette édition.',
  'customSources.add': 'Ajouter une source',
  'customSources.listHeading': 'Vos sources',
  'customSources.none': 'Aucune source personnalisée pour l’instant.',
  'customSources.off': 'Désactivée',
  'customSources.enable': 'Activer',
  'customSources.disable': 'Désactiver',
  'customSources.remove': 'Supprimer',
  'customSources.heading': 'Vos sources',
  'customSources.caption':
    'Liens que vous avez configurés vous-même. Cette instance ne vérifie pas où ils mènent.',

  'settings.customSources.title': 'Vos sources personnalisées',
  'settings.customSources.added': '« {name} » a été ajoutée et sera proposée avec les autres.',
  'settings.customSources.removed': '« {name} » a été supprimée de ce navigateur.',
  'settings.customSources.enabled': '« {name} » est de nouveau activée.',
  'settings.customSources.disabled':
    '« {name} » est désactivée. Elle reste configurée, mais son lien ne sera pas affiché.',
  'settings.customSources.rejected': 'Rien n’a été ajouté : {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Livres dans votre langue',
  'featured.inLanguageBlurb':
    'Des livres écrits dans la langue dans laquelle vous lisez ce site, les plus réédités en premier — l’ordre d’Open Library elle-même, pas un palmarès de ventes.',
  'work.newSearch': 'Nouvelle recherche',
  'work.descriptionFrom': 'Description :',
  'work.descriptionNotLocalized':
    'Cette description est dans la langue où la source l’a écrite — il n’en existe pas encore dans la vôtre pour ce livre.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Lire dans le navigateur',
  'reader.privacy':
    'Votre navigateur ouvre ce livre lui-même. Ni le fichier, ni sa provenance, ni votre progression n’arrivent jusqu’à ce site.',
  'reader.chooseFile': 'Ouvrir un livre depuis cet appareil',
  'reader.formats': 'EPUB, FB2, MOBI et CBZ.',
  'reader.loading': 'Ouverture…',
  'reader.failed': 'Ce livre n’a pas pu être ouvert : {reason}',
  'reader.previous': 'Page précédente',
  'reader.next': 'Page suivante',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…ou déposez un livre ici',
  'reader.fetching': 'Demande du fichier à {host}…',
  'reader.blockedTitle': '{host} n’a pas transmis le fichier à cette page',
  'reader.blockedBody':
    'Soit il est injoignable, soit il n’autorise pas les autres sites à lire ses fichiers. Ce site ne le récupérera pas à votre place : votre livre ne passe jamais par lui, et c’est tout l’intérêt de lire ici.',
  'reader.blockedDownload': 'Le télécharger depuis {host}',
  'reader.blockedOpenHere': 'puis l’ouvrir ici depuis votre appareil',
  'reader.blockedAddon': 'Un module qui sert le fichier lui-même convient aussi.',
  'reader.keepFile': 'Conserver ce livre dans ce navigateur',
  'reader.keepFileHint':
    'Désactivé par défaut. Sans cela le fichier disparaît à la fermeture de l’onglet ; avec, il reste uniquement sur cet appareil.',
  'reader.library': 'Conservé dans ce navigateur',
  'reader.libraryEmpty':
    'Rien de conservé pour l’instant. Les livres conservés restent sur cet appareil et ne sont jamais envoyés ailleurs.',
  'reader.libraryOpen': 'Ouvrir',
  'reader.libraryRemove': 'Retirer',
  'reader.libraryFileKept': 'fichier conservé',
  'reader.libraryFileGone': 'fichier non conservé',
  'reader.untitled': 'Livre sans titre',
  'settings.reader.title': 'Livres dans ce navigateur',
  'settings.reader.kept':
    '« {title} » est maintenant conservé sur cet appareil et s’ouvre sans nouveau téléchargement. Rien n’est envoyé ailleurs.',
  'settings.reader.forgotten':
    'Le fichier de « {title} » a été supprimé de ce navigateur. L’entrée reste : vous pouvez le rouvrir depuis sa source.',
  'settings.reader.removed':
    '« {title} » a été entièrement retiré de ce navigateur — le fichier et l’entrée.',
};
