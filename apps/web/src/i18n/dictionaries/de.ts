import type { Dictionary } from '../dictionary';

export const de: Dictionary = {
  'nav.savedBooks': 'Gespeicherte Bücher',
  'nav.signIn': 'Anmelden',
  'nav.signOut': 'Abmelden',
  'nav.language': 'Sprache',
  'nav.skipToContent': 'Zum Inhalt springen',

  'footer.legal':
    'Nur legale Quellen: Direkte Downloads ausschließlich für gemeinfreie und offen lizenzierte Werke; urheberrechtlich geschützte Bücher — Kauf oder Bibliotheksausleihe. Jeder Link nennt seinen Rechtsstatus ausdrücklich.',
  'footer.openSource': 'Open Source',
  'footer.openSourceRest': '— MIT-Lizenz, selbst hostbar. Quellcode auf GitHub.',

  'home.title': 'BookTranslate Finder',
  'home.subtitle':
    'Ein offener Aggregator für Buchübersetzungen: Sprachen, Ausgaben und legale Quellen.',
  'home.searchLabel': 'Titel und Autor',
  'home.searchPlaceholder': 'Krieg und Frieden Tolstoi',
  'home.searchButton': 'Suchen',

  'search.searching': 'Wird gesucht…',
  'search.backfilling':
    'Noch nichts da — das Buch wird gerade von den Quellen geholt. Das dauert ein paar Sekunden.',
  'search.notFound': 'Zu dieser Anfrage wurde nichts gefunden.',
  'search.retry': 'Erneut versuchen',
  'search.signInPrompt':
    ', um gefundene Bücher zu speichern und später zurückzukehren — und um Ausgaben verschiedener Jahre zu vergleichen, bevor Sie eine wählen.',

  'featured.yearHeading': 'Bücher des Jahres',
  'featured.yearBlurb':
    'Bemerkenswerte Bücher aus jedem der letzten Jahre. Eine handverlesene Liste, keine Verkaufscharts — offene Verkaufsranglisten gibt es nicht.',
  'featured.popularHeading': 'Viel gelesen, viel übersetzt',
  'featured.popularBlurb':
    'Bücher, die es in vielen Sprachen gibt — genau dafür ist diese Seite da.',
  'featured.filling':
    'Einige davon werden noch im Hintergrund geholt. Laden Sie die Seite in einer Minute neu.',
  'featured.freeCopy': 'Kostenlos verfügbar',

  'work.original': 'Original',
  'work.dataSources': 'Datenquellen',
  'work.about': 'Über dieses Buch',
  'work.translatedInto': 'Übersetzt in',
  'work.noTranslations': 'Noch keine Übersetzungen gefunden.',
  'work.editions': 'Ausgaben ({shown} von {total})',
  'work.filterLanguage': 'Sprache',
  'work.filterAllLanguages': 'Alle Sprachen',
  'work.filterYear': 'Jahr',
  'work.filterApply': 'Filtern',
  'work.filterReset': 'Zurücksetzen',
  'work.noEditionsMatch': 'Keine Ausgabe passt zu diesen Filtern.',
  'work.badgeReadBorrow': 'lesen oder ausleihen',
  'work.badgeInBookstores': 'im Buchhandel',
  'work.translatedBy': 'übersetzt von {name}',
  'work.pages': '{count} Seiten',

  'bookmark.save': 'Buch speichern',
  'bookmark.saved': 'Gespeichert',
  'bookmark.signInToSave': 'Zum Speichern anmelden',
  'bookmark.failed': 'Speichern fehlgeschlagen. Bitte erneut versuchen.',

  'links.show': 'Links anzeigen',
  'links.hide': 'Links ausblenden',
  'links.loading': 'Links werden geladen',
  'links.none': 'Für diese Ausgabe gibt es noch keine legalen Links.',
  'links.failed': 'Links konnten nicht geladen werden.',
  'links.storesHeading': 'Im Buchhandel finden',
  'links.storesInCountry': 'In {country}',
  'links.storesYourCountry': 'Ihrem Land',
  'links.storesLanguageMarket': 'Wo Bücher auf {language} verkauft werden',
  'links.storesLanguageMarketGeneric': 'Wo Bücher in der Sprache dieser Ausgabe verkauft werden',
  'links.storesWorldwide': 'Versand weltweit',
  'links.storesCaption':
    'Jeder Link sucht im Katalog des jeweiligen Shops — Verfügbarkeit und Preis zeigt der Shop selbst.',

  'linkType.download': 'Herunterladen',
  'linkType.buy': 'Kaufen',
  'linkType.borrow': 'In einer Bibliothek ausleihen',
  'linkType.listen': 'Anhören (Hörbuch)',
  'rights.public_domain': 'Gemeinfrei',
  'rights.open_license': 'Offene Lizenz',
  'rights.copyrighted': 'Urheberrechtlich geschützt',
  'rights.unknown': 'Status unbekannt',

  'compare.heading': 'Ausgaben vergleichen',
  'compare.blurb':
    'Wählen Sie zwei oder drei Ausgaben, um zu sehen, worin sie sich tatsächlich unterscheiden.',
  'compare.selected': '{count} ausgewählt, mindestens 2 nötig.',
  'compare.columnDifference': 'Unterschied',
  'compare.identical': 'In allem, was die Quellen erfassen, sind diese Ausgaben identisch.',
  'compare.rowLanguage': 'Sprache',
  'compare.rowPublished': 'Erschienen',
  'compare.rowPublisher': 'Verlag',
  'compare.rowTranslator': 'Übersetzung',
  'compare.rowTranslatedFrom': 'Übersetzt aus',
  'compare.rowBinding': 'Einband',
  'compare.rowPages': 'Seiten',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Kostenloses oder ausleihbares Exemplar',
  'compare.yes': 'ja ({count})',
  'compare.no': 'nicht gefunden',

  'country.label': 'Wo kaufen Sie Bücher?',
  'country.worldwideOnly': 'Nur weltweit versendende Shops',

  'auth.signInTitle': 'Anmelden',
  'auth.registerTitle': 'Konto erstellen',
  'auth.blurb':
    'Ein Konto gibt es aus genau einem Grund: gefundene Bücher zu speichern und später zurückzukehren — mit den Sprachen, in die sie übersetzt wurden, den vorhandenen Ausgaben und dem legalen Weg zu jeder. Kein Newsletter, kein Profil, kein Tracking.',
  'auth.name': 'Name (optional)',
  'auth.email': 'E-Mail',
  'auth.password': 'Passwort',
  'auth.passwordHint':
    'Mindestens {min} Zeichen. Geprüft wird nur die Länge — ein langer Satz, den Sie sich merken, schlägt einen kurzen mit Sonderzeichen.',
  'auth.submitSignIn': 'Anmelden',
  'auth.submitRegister': 'Konto erstellen',
  'auth.working': 'Einen Moment…',
  'auth.google': 'Weiter mit Google',
  'auth.toRegister': 'Noch kein Konto? Jetzt erstellen',
  'auth.toSignIn': 'Schon ein Konto? Anmelden',
  'auth.backToSearch': 'Zurück zur Suche',
  'auth.errorGoogleState':
    'Dieser Anmeldelink ist abgelaufen oder wurde in einem anderen Browser geöffnet. Bitte erneut versuchen.',
  'auth.errorGoogleFailed':
    'Die Google-Anmeldung wurde nicht abgeschlossen. Sie können stattdessen E-Mail und Passwort verwenden.',
  'auth.errorGeneric': 'Etwas ist schiefgelaufen.',

  'bookmarks.title': 'Gespeicherte Bücher',
  'bookmarks.signedOut':
    ', um gefundene Bücher zu behalten — und später Ausgaben desselben Buches nebeneinander zu vergleichen.',
  'bookmarks.loading': 'Wird geladen…',
  'bookmarks.empty':
    'Noch nichts gespeichert. Suchen Sie ein Buch und nutzen Sie „Buch speichern“ auf seiner Karte.',
  'bookmarks.searchLink': 'Suchen',
  'bookmarks.remove': 'Entfernen',
  'bookmarks.loadFailed': 'Ihre gespeicherten Bücher konnten nicht geladen werden.',
  'search.failed': 'Die Suche ist fehlgeschlagen.',
  'search.pending': 'Noch nicht in unserer Datenbank — wir prüfen die Quellen',
  'search.pendingLong':
    'Wir suchen weiter: Die erste Anfrage zu einem Buch sammelt Daten aus den Quellen, das kann ein paar Minuten dauern',
  'search.notFoundHint': 'Nichts gefunden. Versuchen Sie es mit einem genaueren Titel oder Autor.',
  'search.timedOut':
    'Die Quellen antworten langsam und wir haben noch keine Daten. Die Hintergrundsynchronisierung ist womöglich schon fertig — versuchen Sie es erneut.',
  'home.tagline': 'Finden Sie Ihr nächstes Opus magnum',
  'subject.allLanguages': 'Alle Sprachen.',
  'subject.filteredByLanguage': 'Nur Bücher mit einer Ausgabe auf {language}.',
  'subject.dropLanguageFilter': 'alle Sprachen anzeigen',
  'subject.empty':
    'Unter diesem Schlagwort gibt es noch nichts. Schlagwörter stammen aus den Büchern, die diese Instanz bereits geholt hat.',
  'featured.year': '{year}',
  'nav.browse': 'Nach Genre',
  'recommend.heading': 'Aufgrund dessen, was Sie gelesen haben',
  'recommend.becauseOf': 'Sie haben „{title}“ geöffnet — hier sind Bücher derselben Genres.',
  'recommend.blurb': 'Bücher aus den Genres, die Sie geöffnet haben.',
  'recommend.privacy':
    'Das wird in Ihrem Browser berechnet — der Server erfährt die Genres, nie wer Sie sind.',
  'recommend.forget': 'meinen Verlauf vergessen',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Regal',
  'shelf.title': 'Regal',
  'shelf.intro':
    'Offene Kataloge und jeder Bibliotheksserver, den Sie selbst betreiben. Hinzugefügte Kataloge bleiben in diesem Browser und werden nie an diese Seite gesendet.',
  'shelf.openCatalogs': 'Offene Kataloge',
  'shelf.yourCatalogs': 'Ihre Kataloge',
  'shelf.addCatalog': 'Katalog hinzufügen',
  'shelf.name': 'Name',
  'shelf.address': 'OPDS-Adresse',
  'shelf.username': 'Benutzername (optional)',
  'shelf.password': 'Passwort (optional)',
  'shelf.credentialsNote':
    'Adresse und Zugangsdaten werden ausschließlich in diesem Browser gespeichert.',
  'shelf.add': 'Hinzufügen',
  'shelf.remove': 'Entfernen',
  'shelf.loading': 'Katalog wird geladen…',
  'shelf.empty': 'Dieser Katalog enthält keine Einträge.',
  'shelf.noCatalogs':
    'Noch keine eigenen. Fügen Sie unten eine Adresse von Calibre-Web, COPS, Kavita oder Audiobookshelf hinzu.',
  'shelf.unreachable':
    'Ihr Browser konnte diesen Katalog nicht lesen. Ein Server in Ihrem eigenen Netz funktioniert; öffentliche Seiten verweigern Cross-Origin-Anfragen häufig.',
  'shelf.nextPage': 'Nächste Seite',
  'shelf.previousPage': 'Vorherige Seite',
  'shelf.drm': 'Benötigt eine DRM-App',
  'shelf.notFree': 'Kein kostenloser Download',
  'shelf.download': 'Herunterladen',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Buchhandlungen in Ihrer Nähe',
  'stores.useMyLocation': 'Meinen Standort verwenden',
  'stores.placeLabel': 'Stadt oder Postleitzahl',
  'stores.find': 'Suchen',
  'stores.locating': 'Wird gesucht…',
  'stores.failed':
    'Standort nicht verfügbar. Geben Sie stattdessen eine Stadt oder Postleitzahl ein.',
  'stores.none': 'Im Umkreis von {radius} km ist keine Buchhandlung verzeichnet.',
  'stores.distance': '{distance} km entfernt',
  'stores.stockUnknown':
    'Nur Kartendaten — niemand veröffentlicht, was eine Buchhandlung vorrätig hat.',
  'stores.lookupFailed':
    'OpenStreetMap ist gerade nicht erreichbar. Versuchen Sie es gleich noch einmal.',
  'stores.privacy':
    'Ihr Standort wird auf etwa 100 m gerundet und nur an OpenStreetMap gesendet — nie an diese Seite.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Preise und Buchhandlungen',
  'prices.loading': 'Buchhandlungen werden gefragt…',
  'prices.unknown': 'Kein Preis veröffentlicht',
  'prices.degraded': 'Keine Antwort von: {providers}',
  'prices.format.hardcover': 'Gebunden',
  'prices.format.paperback': 'Taschenbuch',
  'prices.format.ebook': 'E-Book',
  'prices.format.audiobook': 'Hörbuch',
  'prices.format.unknown': 'Format nicht angegeben',
  'recommend.hideGenre': '„{genre}“ ausblenden',
  'recommend.hiddenList': 'Ausgeblendete Genres (zum Zurückholen anklicken):',
};
