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

  'home.title': 'BookTranslate Finder',
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
    "Un livre marquant par année récente. Une liste choisie à la main, pas un classement des ventes — aucune source ouverte n'en publie.",
  'featured.popularHeading': 'Très lus, très traduits',
  'featured.popularBlurb':
    "Des livres qui existent en de nombreuses langues — c'est précisément l'objet de ce site.",
  'featured.filling':
    'Quelques-uns sont encore en cours de récupération. Rechargez la page dans une minute.',
  'featured.freeCopy': 'Copie gratuite',

  'work.original': 'original',
  'work.dataSources': 'Sources des données',
  'work.about': 'À propos de ce livre',
  'work.translatedInto': 'Traduit en',
  'work.noTranslations': 'Aucune traduction trouvée pour le moment.',
  'work.editions': 'Éditions ({shown} sur {total})',
  'work.filterLanguage': 'Langue',
  'work.filterAllLanguages': 'Toutes les langues',
  'work.filterYear': 'Année',
  'work.filterApply': 'Filtrer',
  'work.filterReset': 'Réinitialiser',
  'work.noEditionsMatch': 'Aucune édition ne correspond à ces filtres.',
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
  'home.tagline': 'Trouvez votre prochain magnum opus',
  'subject.allLanguages': 'Toutes les langues.',
  'subject.filteredByLanguage': 'Uniquement les livres ayant une édition en {language}.',
  'subject.dropLanguageFilter': 'afficher toutes les langues',
  'subject.empty':
    "Rien sous cette étiquette pour l'instant. Les étiquettes viennent des livres déjà récupérés par cette instance.",
  'featured.year': '{year}',
  'nav.browse': 'Par genre',
};
