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

  'home.title': 'Golden Library',
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

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Jetzt kostenlos lesen',
  'free.homeBlurb': 'Gemeinfreie und frei lizenzierte Bücher, die diese Instanz direkt herausgibt.',
  'free.seeAll': 'Mehr ansehen',
  'free.downloadable': 'Herunterladen',
  'free.pageTitle': 'Kostenlose Bücher',
  'free.pageBlurb':
    'Jedes Buch hier hat mindestens eine legale kostenlose Ausgabe – gemeinfrei oder vom Rechteinhaber freigegeben. Kein Kauf, kein Bibliotheksausweis.',
  'free.empty':
    'Hier ist noch nichts kostenlos verfügbar. Kostenlose Ausgaben erscheinen, sobald diese Instanz Bücher holt – suchen Sie ein Buch und schauen Sie wieder vorbei.',
  'free.emptyForLanguage':
    'Noch keine kostenlosen Ausgaben auf {language}. Entfernen Sie den Filter oben, um das ganze Regal zu sehen.',
  'free.showMore': 'Mehr anzeigen',
  'free.shown': '{shown} von {total} werden angezeigt.',
  'free.allLanguages': 'Kostenlose Ausgaben in allen Sprachen.',
  'free.filteredByLanguage': 'Nur kostenlose Ausgaben auf {language}.',
  'free.filterByLanguage': 'Nur kostenlose Ausgaben auf {language} zeigen.',
  'free.dropLanguageFilter': 'alle Sprachen anzeigen',
  'free.loadFailed': 'Die kostenlosen Bücher konnten gerade nicht geladen werden.',

  'work.original': 'Original',
  'work.dataSources': 'Datenquellen',
  'work.about': 'Über dieses Buch',
  'work.translatedInto': 'Übersetzt in',
  'work.availableIn': 'Verfügbar auf',
  'work.languagesNote':
    'Nur was unsere Quellen führen — eine hier fehlende Übersetzung kann trotzdem existieren.',
  'work.noTranslations': 'Noch keine Übersetzungen gefunden.',
  'work.yourLanguage.title': 'In Ihrer Sprache',
  'work.yourLanguage.yes': 'Eine Übersetzung ist vorhanden: {language}.',
  'work.yourLanguage.original': 'Originalsprache: {language}.',
  'work.yourLanguage.no': 'Unter den bekannten Ausgaben gibt es keine Übersetzung: {language}.',
  'work.yourLanguage.show': 'Ausgaben anzeigen: {language}',
  'work.editions': 'Ausgaben ({shown} von {total})',
  'work.filterLanguage': 'Sprache',
  'work.filterAllLanguages': 'Alle Sprachen',
  'work.filterYear': 'Jahr',
  'work.filterApply': 'Filtern',
  'work.filterReset': 'Zurücksetzen',
  'work.noEditionsMatch': 'Keine Ausgabe passt zu diesen Filtern.',
  'work.showMoreEditions': 'Weitere Ausgaben anzeigen (noch {remaining})',
  'work.badgeFreeDownload': 'kostenloser Download',
  'work.freeDownloadFormat': '{format} herunterladen',
  'work.freeDownloadNote': '{rights}. Kostenlos von {provider} — ohne Konto, ohne Bezahlung.',
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
  'links.viaOtherEdition': 'kostenloses Exemplar aus der Ausgabe {label}',
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
  'compare.editSelection': 'Ausgaben ändern',
  'compare.showAllEditions': 'Alle {count} Ausgaben anzeigen',
  'compare.columnDifference': 'Unterschied',
  'compare.identical': 'In allem, was die Quellen erfassen, sind diese Ausgaben identisch.',
  'compare.rowLanguage': 'Sprache',
  'compare.rowPublished': 'Erschienen',
  'compare.rowPublisher': 'Verlag',
  'compare.rowTranslator': 'Übersetzung',
  'compare.rowTranslatedFrom': 'Übersetzt aus',
  'compare.rowEditionStatement': 'Ausgabe',
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
  'search.freeOnlyToggle': 'Kostenlos verfügbar',
  'search.noFreeResults':
    'Keiner dieser Titel ist bisher kostenlos verfügbar — versuchen Sie, den Filter zu deaktivieren.',
  'home.tagline': 'Finden Sie Ihr nächstes Opus magnum',
  'home.genres': 'Beliebte Genres',
  'home.genresBlurb':
    'Die Schlagwörter mit den meisten Büchern dahinter. Jedes öffnet seinen Katalog.',
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

  'ratings.edition': '{average} von {outOf} aus {votes} Leserstimmen auf {source}',
  'ratings.lowConfidence': 'zu wenige Stimmen für einen Vergleich',
  'ratings.reviews': 'Rezensionen',
  'ratings.reviewsOn': 'Rezensionen zu dieser Ausgabe auf {source}',
  'ratings.noteNoRatings':
    'Keine offene Quelle bewertet eine Übersetzung, und für diese Ausgaben liegen hier keine Leserbewertungen vor.',
  'ratings.noteReviews':
    'Ist eine Ausgabe auf {sources} bekannt, führt der Link zu den Rezensionen genau dieser Auflage — die meisten sind es nicht.',
  'ratings.translator':
    'Ausgaben in der Übersetzung von {name}: {average} von {outOf} über {editions} bewertete Ausgaben, insgesamt {votes} Stimmen.',
  'ratings.note':
    'Das sind Leserbewertungen einer bestimmten Ausgabe auf {sources}, keine Bewertung der Übersetzung selbst — die veröffentlicht niemand. Ihren Wert haben sie im Vergleich: dasselbe Buch, dieselbe Sprache, verschiedene Übersetzer — und immer mit der Zahl der Stimmen daneben.',
  'ratings.gapWithoutIsbn':
    '{count} Ausgaben hier haben keine ISBN, deshalb ließ sich ihnen keine Bewertung zuordnen.',
  'ratings.gapNotLookedUp': 'Weitere {count} Ausgaben wurden in dieser Anfrage nicht abgefragt.',
  'recommend.hideGenre': '„{genre}“ ausblenden',
  'recommend.hiddenList': 'Ausgeblendete Genres (zum Zurückholen anklicken):',

  // --- Einstellungs-Popups ---
  'settings.status.saved': 'Gespeichert',
  'settings.status.cleared': 'Zurückgesetzt',
  'settings.status.unstored': 'Nicht gespeichert',
  'settings.status.failed': 'Unverändert',
  'settings.notStored':
    'Dieser Browser hat das Speichern verweigert, also ist nichts passiert — der vorherige Wert gilt weiter.',
  'settings.language.title': 'Sprache der Oberfläche',
  'settings.language.changed':
    'Von {from} auf {to} geändert. Die Oberfläche lädt auf {to} neu; Buchtitel und Autorennamen bleiben in ihrer eigenen Sprache.',
  'settings.country.title': 'Einkaufsland',
  'settings.country.changed':
    'Auf {country} gesetzt. Die Buchhandlungs-Links zeigen jetzt auch Läden, die dorthin liefern, neben den weltweiten.',
  'settings.country.cleared':
    'Kein Land gewählt. Es werden nur Buchhandlungen mit weltweitem Versand angeboten.',
  'settings.bookLanguage.title': 'Buchsprache',
  'settings.bookLanguage.changed':
    'Auf {language} gesetzt. Genre-Seiten zeigen zuerst Bücher mit einer Ausgabe auf {language}, bis Sie den Filter zurücksetzen.',
  'settings.bookLanguage.cleared':
    'Zurückgesetzt. Genre-Seiten zeigen wieder Bücher in allen Sprachen.',
  'settings.hiddenGenres.title': 'Ausgeblendete Genres',
  'settings.hiddenGenres.hidden':
    '„{genre}“ ist ausgeblendet. Es wird bei Empfehlungen nicht mehr an den Server geschickt; insgesamt sind {count} Genres ausgeblendet.',
  'settings.hiddenGenres.restored':
    '„{genre}“ erscheint wieder in Ihren Empfehlungen. {count} Genres bleiben ausgeblendet.',
  'settings.history.title': 'Leseverlauf',
  'settings.history.cleared':
    'Die von Ihnen geöffneten Bücher wurden aus diesem Browser gelöscht. Empfehlungen bleiben aus, bis Sie das nächste Buch öffnen.',
  'settings.bookmarks.title': 'Gespeicherte Bücher',
  'settings.bookmarks.added': '„{title}“ wurde zu Ihren gespeicherten Büchern hinzugefügt.',
  'settings.bookmarks.removed': '„{title}“ wurde aus Ihren gespeicherten Büchern entfernt.',
  'settings.bookmarks.failed':
    'Der Server hat die Änderung nicht angenommen, Ihre gespeicherten Bücher sind unverändert.',
  'settings.catalogs.title': 'Ihre Kataloge',
  'settings.catalogs.added':
    '„{name}“ wurde unter {url} hinzugefügt. Die Adresse bleibt in diesem Browser und wird nie an diese Seite gesendet.',
  'settings.catalogs.addedWithCredentials':
    '„{name}“ wurde unter {url} hinzugefügt, samt eingegebenem Benutzernamen und Passwort. All das bleibt in diesem Browser und nichts davon wird an diese Seite gesendet.',
  'settings.catalogs.removed':
    '„{name}“ wurde aus diesem Browser entfernt, zusammen mit den dafür gespeicherten Zugangsdaten.',
  'settings.catalogs.rejected': 'Nichts hinzugefügt: {reason}',
  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Add-ons',
  'addons.title': 'Add-ons',
  'addons.intro':
    'Ein Add-on bringt eigene Quellen mit. Sie installieren es, indem Sie seine Adresse einfügen; es läuft entweder in einer Sandbox auf Ihrem Gerät oder auf dem Server seines Autors. Golden Library liefert keine mit, führt keine Liste und prüft nicht, was sie zurückgeben.',
  'addons.addressLabel': 'Adresse des Add-ons',
  'addons.addressHint': 'Die Manifest-URL, die Ihnen der Autor des Add-ons genannt hat.',
  'addons.continue': 'Weiter',
  'addons.fromServer': 'Von einem Server',
  'addons.fromFile': 'Aus einer Datei, auf Ihrem Gerät',
  'addons.bundleLabel': 'Adresse des Add-on-Codes',
  'addons.bundleHint':
    'Die URL des Add-on-Codes. Er läuft auf diesem Gerät, nicht auf einem Server.',
  'addons.integrityLabel': 'Integritäts-Hash',
  'addons.integrityHint':
    'Vom Autor des Add-ons angegeben, als sha256-… . Erforderlich: ohne ihn könnte einmal genehmigter Code sich später ändern, ohne dass Sie es merken.',
  'addons.checking': 'Add-on wird gelesen…',
  'addons.installedHeading': 'Installiert',
  'addons.none': 'Noch keine Add-ons. Alles auf dieser Seite stammt bisher von der Instanz selbst.',
  'addons.priorityHint': 'Die Reihenfolge ist die Priorität: Das erste Add-on antwortet zuerst.',
  'addons.enable': 'Einschalten',
  'addons.disable': 'Ausschalten',
  'addons.off': 'Aus',
  'addons.remove': 'Entfernen',
  'addons.moveUp': 'Nach oben',
  'addons.moveDown': 'Nach unten',
  'addons.configure': 'Einrichten',
  'addons.failedToStart': '„{name}“ ist nicht gestartet: {reason}',
  'addons.consentTitle': '„{name}“ installieren?',
  'addons.consentHosts': 'Es wird Kontakt aufnehmen zu: {hosts}',
  'addons.consentNoHosts': 'Es hat um keinen Kontakt gebeten.',
  'addons.consentSeesYou':
    'Dieses Add-on läuft auf dem Server seines Autors. Er sieht Ihre Adresse und alles, wonach Sie darüber suchen.',
  'addons.consentSandboxed':
    'Dieses Add-on läuft in einer Sandbox auf Ihrem Gerät. Es kann weder Ihre Cookies noch die Daten dieser Seite noch sonst etwas Geöffnetes lesen.',
  'addons.consentNotVetted':
    'Golden Library prüft nicht, was ein Add-on zurückgibt, und hat dieses nicht empfohlen. Was Sie installieren, ist Ihre Entscheidung.',
  'addons.install': 'Installieren',
  'addons.cancel': 'Abbrechen',
  'addons.via': 'über {name}',
  'addons.sourcesTitle': 'Aus Ihren Add-ons',
  'addons.searchTitle': 'Von Ihren Add-ons gefunden',
  'addons.showLinks': 'Download-Links anzeigen',
  'addons.unreadable': '{count} Einträge dieses Add-ons waren nicht lesbar.',
  'addons.browse': 'Katalog durchsuchen',
  'addons.browseTitle': 'Katalog von „{name}“',
  'addons.browseNoCatalog': 'Dieses Add-on bietet keinen durchsuchbaren Katalog.',
  'addons.browseEmpty': 'Der Katalog dieses Add-ons ist derzeit leer.',
  'addons.browseFailed': 'Katalog von „{name}“ konnte nicht geladen werden: {reason}',
  'addons.loadMore': 'Mehr laden',
  'addons.notInstalled': 'Dieses Add-on ist nicht installiert.',

  'settings.addons.title': 'Ihre Add-ons',
  'settings.addons.installed':
    '„{name}“ ist installiert. Es wird neben den anderen gefragt und darf {hosts} kontaktieren.',
  'settings.addons.removed':
    '„{name}“ wurde entfernt. Seine Ergebnisse sind aus diesem Browser verschwunden, und alles, was es hier gespeichert hatte, ebenfalls.',
  'settings.addons.enabled': '„{name}“ ist wieder an und wird mit den anderen gefragt.',
  'settings.addons.disabled':
    '„{name}“ ist aus. Es bleibt mitsamt seinen Einstellungen installiert, aber nichts davon wird angezeigt.',
  'settings.addons.reordered': '„{name}“ antwortet jetzt als {position}. von {total}.',
  'settings.addons.rejected': 'Es wurde nichts installiert: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Eigene Quellen',
  'customSources.title': 'Eigene Quellen',
  'customSources.intro':
    'Fügen Sie einen eigenen Shop oder Katalog hinzu, indem Sie ihm einen Namen und eine Such-URL mit {isbn}, {query}, {title}, {author} oder {language} geben. Der Link wird auf diesem Gerät erstellt, diese Seite ruft ihn nie ab.',
  'customSources.nameLabel': 'Name',
  'customSources.templateLabel': 'URL-Vorlage',
  'customSources.templateHint':
    'Eine absolute https://-Adresse. {isbn}, {query}, {title}, {author} und {language} werden aus der Ausgabe gefüllt; bleibt ein Platzhalter leer, wird der Link für diese Ausgabe übersprungen.',
  'customSources.add': 'Quelle hinzufügen',
  'customSources.listHeading': 'Ihre Quellen',
  'customSources.none': 'Noch keine eigenen Quellen.',
  'customSources.off': 'Aus',
  'customSources.enable': 'Einschalten',
  'customSources.disable': 'Ausschalten',
  'customSources.remove': 'Entfernen',
  'customSources.heading': 'Ihre Quellen',
  'customSources.caption':
    'Links, die Sie selbst eingerichtet haben. Diese Instanz prüft nicht, wohin sie führen.',

  'settings.customSources.title': 'Ihre eigenen Quellen',
  'settings.customSources.added':
    '„{name}“ wurde hinzugefügt und wird neben den anderen angeboten.',
  'settings.customSources.removed': '„{name}“ wurde aus diesem Browser entfernt.',
  'settings.customSources.enabled': '„{name}“ ist wieder an.',
  'settings.customSources.disabled':
    '„{name}“ ist aus. Es bleibt konfiguriert, aber sein Link wird nicht angezeigt.',
  'settings.customSources.rejected': 'Es wurde nichts hinzugefügt: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Bücher in Ihrer Sprache',
  'featured.inLanguageBlurb':
    'Bücher, die in der Sprache geschrieben sind, in der Sie diese Seite lesen — die am häufigsten aufgelegten zuerst, so wie Open Library selbst sortiert, keine Bestsellerliste.',
  'work.newSearch': 'Neue Suche',
  'work.descriptionFrom': 'Beschreibung:',
  'work.descriptionNotLocalized':
    'Diese Beschreibung steht in der Sprache, in der die Quelle sie verfasst hat — in Ihrer Sprache gibt es für dieses Buch noch keine.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Im Browser lesen',
  'reader.privacy':
    'Ihr Browser öffnet dieses Buch selbst. Weder die Datei noch ihre Herkunft noch Ihr Lesefortschritt erreichen diese Website.',
  'reader.chooseFile': 'Ein Buch von diesem Gerät öffnen',
  'reader.formats': 'EPUB, FB2, MOBI und CBZ.',
  'reader.loading': 'Wird geöffnet…',
  'reader.failed': 'Dieses Buch konnte nicht geöffnet werden: {reason}',
  'reader.previous': 'Vorherige Seite',
  'reader.next': 'Nächste Seite',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…oder ein Buch hierher ziehen',
  'reader.fetching': 'Die Datei wird bei {host} angefragt…',
  'reader.blockedTitle': '{host} hat die Datei nicht an diese Seite übergeben',
  'reader.blockedBody':
    'Entweder ist der Server nicht erreichbar, oder er erlaubt anderen Websites nicht, seine Dateien zu lesen. Diese Website holt sie nicht ersatzweise für Sie: Ihr Buch läuft nie über sie — genau darum geht es beim Lesen hier.',
  'reader.blockedDownload': 'Bei {host} herunterladen',
  'reader.blockedOpenHere': 'und hier von Ihrem Gerät öffnen',
  'reader.blockedAddon': 'Ein Add-on, das die Datei selbst ausliefert, funktioniert ebenfalls.',
  'reader.keepFile': 'Dieses Buch in diesem Browser behalten',
  'reader.keepFileHint':
    'Standardmäßig aus. Ohne das ist die Datei beim Schließen des Tabs weg; damit bleibt sie ausschließlich auf diesem Gerät.',
  'reader.library': 'In diesem Browser behalten',
  'reader.libraryEmpty':
    'Noch nichts behalten. Behaltene Bücher bleiben auf diesem Gerät und werden nirgendwohin hochgeladen.',
  'reader.libraryOpen': 'Öffnen',
  'reader.libraryRemove': 'Entfernen',
  'reader.libraryFileKept': 'Datei behalten',
  'reader.libraryFileGone': 'Datei nicht behalten',
  'reader.untitled': 'Buch ohne Titel',
  'settings.reader.libraryTitle': 'Bücher in diesem Browser',
  'settings.reader.kept':
    '„{title}“ liegt jetzt auf diesem Gerät und öffnet sich ohne erneuten Download. Es wird nirgendwohin hochgeladen.',
  'settings.reader.forgotten':
    'Die Datei zu „{title}“ wurde aus diesem Browser gelöscht. Der Eintrag bleibt, Sie können das Buch erneut aus seiner Quelle öffnen.',
  'settings.reader.removed':
    '„{title}“ wurde vollständig aus diesem Browser entfernt — Datei und Eintrag.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Dort geöffnet, wo Sie aufgehört haben — bei {percent}%.',
  'reader.bookmarks': 'Lesezeichen',
  'reader.bookmarkAdd': 'Diese Seite mit einem Lesezeichen versehen',
  'reader.bookmarkNone': 'In diesem Buch gibt es noch keine Lesezeichen.',
  'reader.bookmarkGo': 'Hingehen',
  'reader.bookmarkRemove': 'Lesezeichen entfernen',
  'reader.bookmarkNote': 'Notiz',
  'reader.bookmarkNotePlaceholder': 'Ihre eigenen Worte zu dieser Seite',
  'reader.bookmarkAt': 'bei {percent}%',
  'settings.reader.bookmarkTitle': 'Lesezeichen in diesem Browser',
  'settings.reader.bookmarkAdded':
    'Lesezeichen bei {percent}% von „{title}“. Lesezeichen bleiben mit dem Buch auf diesem Gerät.',
  'settings.reader.bookmarkRemoved':
    'Dieses Lesezeichen in „{title}“ wurde aus diesem Browser entfernt.',
  'settings.reader.noteSaved':
    'Ihre Notiz zu dieser Seite von „{title}“ wurde auf diesem Gerät gespeichert.',
  'settings.reader.positionTitle': 'Leseposition',
  'settings.reader.positionUnstored':
    'Dieser Browser wollte nicht speichern, wo Sie in „{title}“ sind — beim nächsten Mal beginnt das Buch von vorn. Privater Modus und eine volle Festplatte tun beides.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': 'Wie dieses Buch aussieht',
  'reader.theme': 'Farben',
  'reader.themeApp': 'Wie die Website',
  'reader.themeLight': 'Papier',
  'reader.themeDark': 'Tinte',
  'reader.themeSepia': 'Sepia',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint':
    'Reines Schwarz auf Weiß, keine Animation, eine Spalte — für E-Paper-Displays.',
  'reader.fontSize': 'Schriftgröße',
  'reader.smaller': 'Kleiner',
  'reader.larger': 'Größer',
  'reader.lineHeight': 'Zeilenabstand',
  'reader.margin': 'Ränder',
  'reader.flow': 'Seiten',
  'reader.flowPaged': 'Blättern',
  'reader.flowScrolled': 'Scrollen',
  'reader.justify': 'Blocksatz',
  'reader.hyphenate': 'Silbentrennung',
  'reader.displayReset': 'Zurück zu den Standardwerten',
  'settings.reader.displayTitle': 'Darstellung beim Lesen',
  'settings.reader.displayChanged':
    '{setting} ist jetzt {value}. Das gilt für jedes Buch, das Sie in diesem Browser öffnen.',
  'settings.reader.displayReset':
    'Die Darstellung beim Lesen steht wieder auf den Standardwerten — für jedes Buch in diesem Browser.',
  'reader.on': 'Ein',
  'reader.off': 'Aus',
  'reader.openHere': 'Im Browser lesen',
  'reader.notAFileTitle': '{host} hat eine Webseite geschickt, nicht die Datei',
  'reader.notAFileBody':
    'Der Link führt auf eine Seite statt auf ein Buch — eine Downloadseite, eine Einwilligung oder eine Prüfung, ob Sie ein Roboter sind. Öffnen Sie sie selbst, dann ist die Datei dort.',
  'settings.status.session': 'Nicht gemerkt',
  'settings.notRemembered':
    'Dieser Browser wollte es sich nicht merken — beim nächsten Buch ist wieder alles wie vorher.',

  // --- The first-run walkthrough (components/OnboardingTour.tsx) -----------
  'tour.next': 'Weiter',
  'tour.back': 'Zurück',
  'tour.skip': 'Jetzt nicht',
  'tour.finish': 'Fertig',
  'tour.close': 'Tour schließen',
  'tour.welcome.title': 'Willkommen in der Golden Library',
  'tour.welcome.text':
    'Eine Minute, und Sie wissen, wo hier was steht. Die Seite findet, in welchen Sprachen ein Buch existiert und wo es legal zu bekommen ist — und das umso besser, je genauer Sie ihr sagen, wo sie suchen soll. Damit fangen wir an.',
  'tour.customSourcesNav.title': 'Beginnen Sie mit eigenen Quellen',
  'tour.customSourcesNav.text':
    'Öffnen Sie <strong>Eigene Quellen</strong>: die Seite, auf der Sie entscheiden, welche Kataloge zusätzlich zu den eingebauten durchsucht werden.',
  'tour.presets.title': 'Sie müssen nichts bei null anfangen',
  'tour.presets.text':
    'Dort werden fertige Vorlagen veröffentlicht. Sie gehören denen, die sie geschrieben haben: Diese Seite prüft in diesem Kanal nichts, und eine Quelle, die Sie hinzufügen, sucht von Ihrem Browser aus, nicht von diesem Server. In einem neuen Tab öffnen, mitnehmen, was Sie brauchen, und zurückkommen.',
  'tour.sourceForm.title': 'Zwei Felder, und es steht',
  'tour.sourceForm.text':
    'Ein Name, den Sie wiedererkennen, und die Adresse einer Suche, in der <strong>{query}</strong> dort steht, wo Ihre Wörter hingehören. Fügen Sie jetzt eine hinzu oder klicken Sie auf „Weiter“ und kommen später darauf zurück.',
  'tour.sourceList.title': 'Alles Hinzugefügte bleibt hier',
  'tour.sourceList.text':
    'Ihre Quellen stehen unten, jede lässt sich abschalten oder entfernen. Sie liegen in diesem Browser und gehen nie an den Server: Hier sieht sie niemand, und auf einem anderen Gerät sind sie nicht vorhanden.',
  'tour.addonsNav.title': 'Add-ons gehen weiter',
  'tour.addonsNav.text':
    'Öffnen Sie <strong>Add-ons</strong>. Eine eigene Quelle ist eine URL, die Sie geschrieben haben; ein Add-on ist ein kleines Programm von jemand anderem, das einen Katalog richtig durchsuchen kann.',
  'tour.addons.title': 'Nichts wird installiert, bevor Sie es gesehen haben',
  'tour.addons.text':
    'Fügen Sie die Adresse eines Add-ons ein, und dieses Formular zeigt Ihnen, was es ist und mit welchen Hosts es sprechen wird; erst danach wird installiert. Seine Ergebnisse tragen immer den Namen des Add-ons, das sie geliefert hat.',
  'tour.shelfNav.title': 'Das Regal',
  'tour.shelfNav.text':
    'Öffnen Sie <strong>Regal</strong>, um die Kataloge zu sehen, aus denen Sie direkt lesen können.',
  'tour.shelf.title': 'Offene Kataloge und Ihre eigenen',
  'tour.shelf.text':
    'Das Projekt Gutenberg und seinesgleichen sind von Anfang an da. Darunter können Sie jeden OPDS-Katalog eintragen — etwa einen Calibre-Server in Ihrem Netz, den Ihr Browser erreicht und diese Seite nie.',
  'tour.language.title': 'Fünfzehn Sprachen',
  'tour.language.text':
    'Die Sprache der Oberfläche ändern Sie hier jederzeit. Wie jede Einstellung hier wird sie in Ihren Browser geschrieben und gilt sofort — und sagt es in einer Meldung, auch dann, wenn der Browser sich weigert, sie zu behalten.',
  'tour.done.title': 'Das war die Tour',
  'tour.done.text':
    'Suchen Sie von der Startseite aus, und melden Sie sich an, wenn gefundene Bücher aufgehoben werden sollen. Der Link am Fuß jeder Seite startet diese Tour erneut.',
  'settings.tour.title': 'Die geführte Tour',
  'settings.tour.finished':
    'Sie haben die Tour durchlaufen, von allein öffnet sie sich nicht wieder. Der Link am Fuß der Seite startet sie, wann immer Sie wollen.',
  'settings.tour.skipped':
    'Die Tour ist geschlossen und öffnet sich nicht von allein wieder. Der Link am Fuß der Seite startet sie, wann immer Sie wollen.',
  'settings.tour.restarted':
    'Wir beginnen wieder beim ersten Schritt; dieser Browser hat vergessen, dass Sie die Tour schon gesehen hatten.',
  'customSources.presets': 'Fertige Vorlagen',
  'customSources.presetsCaption':
    'Vorlagen, die andere Lesende teilen, im Kanal dieser Instanz. Hier prüft sie niemand: Lesen Sie eine Vorlage, bevor Sie sie übernehmen, und denken Sie daran, dass sie von Ihrem Browser aus sucht.',
  'footer.takeTheTour': 'Tour ansehen',
};
