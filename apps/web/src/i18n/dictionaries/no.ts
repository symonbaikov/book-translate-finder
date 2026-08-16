import type { Dictionary } from '../dictionary';

export const no: Dictionary = {
  'nav.savedBooks': 'Lagrede bøker',
  'nav.signIn': 'Logg inn',
  'nav.signOut': 'Logg ut',
  'nav.language': 'Språk',
  'nav.skipToContent': 'Gå til innholdet',
  'footer.legal':
    'Bare lovlige kilder: direkte nedlasting utelukkende for verk i det fri og med åpne lisenser; opphavsrettsbeskyttede bøker — kjøp eller bibliotekslån. Hver lenke har en uttalt rettighetsstatus.',
  'footer.openSource': 'Åpen kildekode',
  'footer.openSourceRest': '— MIT-lisensiert, kan driftes selv. Se koden på GitHub.',
  'home.title': 'Golden Library',
  'home.subtitle': 'En åpen aggregator for bokoversettelser: språk, utgaver og lovlige kilder.',
  'home.searchLabel': 'Tittel og forfatter',
  'home.searchPlaceholder': 'Krig og fred Tolstoj',
  'home.searchButton': 'Søk',
  'search.searching': 'Søker…',
  'search.backfilling': 'Ingenting her ennå — vi henter boken fra kildene. Det tar noen sekunder.',
  'search.notFound': 'Ingenting funnet for dette søket.',
  'search.retry': 'Prøv igjen',
  'search.signInPrompt':
    'for å lagre bøkene du finner her og komme tilbake til dem — og for å sammenligne utgaver fra ulike år side om side før du velger.',
  'featured.yearHeading': 'Årets bøker',
  'featured.yearBlurb':
    'Bemerkelsesverdige bøker fra hvert av de siste årene. En håndplukket liste, ikke en salgsliste — noe slikt publiserer ingen åpen kilde.',
  'featured.popularHeading': 'Mye lest, mye oversatt',
  'featured.popularBlurb':
    'Bøker som finnes på mange språk — som er hele poenget med dette nettstedet.',
  'featured.filling':
    'Noen av dem hentes fortsatt i bakgrunnen. Last inn siden på nytt om et minutt for å se resten.',
  'featured.freeCopy': 'Gratis eksemplar',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Gratis å lese med én gang',
  'free.homeBlurb':
    'Bøker i det fri og med åpen lisens som denne kopien av nettstedet kan gi deg direkte.',
  'free.seeAll': 'Se flere',
  'free.downloadable': 'Last ned',
  'free.pageTitle': 'Gratis bøker',
  'free.pageBlurb':
    'Hver bok her har minst ett lovlig gratiseksemplar — i det fri, eller gitt bort av rettighetshaveren. Ingen kjøp, intet lånekort.',
  'free.empty':
    'Ingenting gratis her ennå. Gratiseksemplarer dukker opp etter hvert som denne instansen henter bøker, så søk etter en og kom tilbake.',
  'free.emptyForLanguage':
    'Ingen gratiseksemplarer på {language} ennå. Fjern filteret over for å se hele hyllen.',
  'free.showMore': 'Vis flere',
  'free.shown': 'Viser {shown} av {total}.',
  'free.allLanguages': 'Gratiseksemplarer på alle språk.',
  'free.filteredByLanguage': 'Bare gratiseksemplarer på {language}.',
  'free.filterByLanguage': 'Vis bare gratiseksemplarene på {language}.',
  'free.dropLanguageFilter': 'vis alle språk',
  'free.loadFailed': 'De gratis bøkene kunne ikke lastes akkurat nå.',
  'work.original': 'original',
  'work.dataSources': 'Datakilder',
  'work.about': 'Om denne boken',
  'work.translatedInto': 'Oversatt til',
  'work.availableIn': 'Finnes på',
  'work.languagesNote':
    'Bare det kildene våre lister opp — en oversettelse som mangler her, kan likevel finnes.',
  'work.noTranslations': 'Ingen oversettelser funnet ennå.',
  'work.yourLanguage.title': 'På ditt språk',
  'work.yourLanguage.yes': 'Det finnes en oversettelse til {language}.',
  'work.yourLanguage.original': 'Denne boken ble skrevet på {language}.',
  'work.yourLanguage.no': 'Ingen oversettelse til {language} blant utgavene som er kjent her.',
  'work.yourLanguage.show': 'Vis utgaver på {language}',
  'work.editions': 'Utgaver ({shown} av {total})',
  'work.filterLanguage': 'Språk',
  'work.filterAllLanguages': 'Alle språk',
  'work.filterYear': 'År',
  'work.filterApply': 'Filtrer',
  'work.filterReset': 'Nullstill',
  'work.noEditionsMatch': 'Ingen utgaver passer med disse filtrene.',
  'work.showMoreEditions': 'Vis flere utgaver ({remaining} igjen)',
  'work.badgeFreeDownload': 'gratis nedlasting',
  'work.freeDownloadFormat': 'Last ned {format}',
  'work.freeDownloadNote': '{rights}. Gratis fra {provider} — ingen konto, ingen betaling.',
  'work.badgeReadBorrow': 'les eller lån',
  'work.badgeInBookstores': 'i bokhandelen',
  'work.translatedBy': 'oversatt av {name}',
  'work.pages': '{count} sider',
  'bookmark.save': 'Lagre denne boken',
  'bookmark.saved': 'Lagret',
  'bookmark.signInToSave': 'Logg inn for å lagre',
  'bookmark.failed': 'Kunne ikke lagre. Prøv igjen.',
  'links.show': 'Vis lenker',
  'links.hide': 'Skjul lenker',
  'links.loading': 'Laster lenker',
  'links.none': 'Ingen lovlige lenker til denne utgaven ennå.',
  'links.viaOtherEdition': 'gratis eksemplar fra utgaven {label}',
  'links.failed': 'Kunne ikke laste lenkene.',
  'links.storesHeading': 'Finn i en bokhandel',
  'links.storesInCountry': 'I {country}',
  'links.storesYourCountry': 'landet ditt',
  'links.storesLanguageMarket': 'Der bøker på {language} selges',
  'links.storesLanguageMarketGeneric': 'Der språket til denne utgaven selges',
  'links.storesWorldwide': 'Sender over hele verden',
  'links.storesCaption':
    'Hver lenke søker i butikkens egen katalog — tilgjengelighet og pris vises av butikken selv.',
  'linkType.download': 'Last ned',
  'linkType.buy': 'Kjøp',
  'linkType.borrow': 'Lån på bibliotek',
  'linkType.listen': 'Lytt (lydbok)',
  'rights.public_domain': 'I det fri',
  'rights.open_license': 'Åpen lisens',
  'rights.copyrighted': 'Opphavsrettsbeskyttet',
  'rights.unknown': 'Ukjent status',
  'compare.heading': 'Sammenlign utgaver',
  'compare.blurb': 'Velg to eller tre utgaver for å se hva som faktisk skiller dem.',
  'compare.selected': 'Valgt {count} av minst 2.',
  'compare.editSelection': 'Bytt utgaver',
  'compare.showAllEditions': 'Vis alle {count} utgaver',
  'compare.columnDifference': 'Forskjell',
  'compare.identical': 'Disse utgavene er like i alt kildene registrerer.',
  'compare.rowLanguage': 'Språk',
  'compare.rowPublished': 'Utgitt',
  'compare.rowPublisher': 'Forlag',
  'compare.rowTranslator': 'Oversetter',
  'compare.rowTranslatedFrom': 'Oversatt fra',
  'compare.rowBinding': 'Innbinding',
  'compare.rowPages': 'Sider',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Gratis eksemplar eller til utlån',
  'compare.yes': 'ja ({count})',
  'compare.no': 'ikke funnet',
  'country.label': 'Hvor kjøper du bøker?',
  'country.worldwideOnly': 'Bare butikker som sender over hele verden',
  'auth.signInTitle': 'Logg inn',
  'auth.registerTitle': 'Opprett en konto',
  'auth.blurb':
    'En konto finnes av én grunn: å lagre bøker du finner og komme tilbake til dem — med språkene de er oversatt til, utgavene som finnes, og hvor du får tak i hver enkelt lovlig. Ingen nyhetsbrev, ingen profil, ingen sporing.',
  'auth.name': 'Navn (valgfritt)',
  'auth.email': 'E-post',
  'auth.password': 'Passord',
  'auth.passwordHint':
    'Minst {min} tegn. Bare lengden blir sjekket — en lang setning du husker slår en kort med tegnsetting i.',
  'auth.submitSignIn': 'Logg inn',
  'auth.submitRegister': 'Opprett konto',
  'auth.working': 'Jobber…',
  'auth.google': 'Fortsett med Google',
  'auth.toRegister': 'Ingen konto ennå? Opprett en',
  'auth.toSignIn': 'Har du allerede konto? Logg inn',
  'auth.backToSearch': 'Tilbake til søket',
  'auth.errorGoogleState':
    'Den innloggingslenken er utløpt eller ble åpnet i en annen nettleser. Prøv igjen.',
  'auth.errorGoogleFailed':
    'Innloggingen med Google ble ikke fullført. Du kan bruke e-post og passord i stedet.',
  'auth.errorGeneric': 'Noe gikk galt.',
  'bookmarks.title': 'Lagrede bøker',
  'bookmarks.signedOut':
    'for å beholde bøkene du finner — og senere sammenligne utgaver av den samme boken side om side.',
  'bookmarks.loading': 'Laster…',
  'bookmarks.empty':
    'Ingenting lagret ennå. Finn en bok og bruk «Lagre denne boken» på kortet dens.',
  'bookmarks.searchLink': 'Søk',
  'bookmarks.remove': 'Fjern',
  'bookmarks.loadFailed': 'Kunne ikke laste de lagrede bøkene dine.',
  'search.failed': 'Søket mislyktes.',
  'search.pending': 'Ikke i databasen vår ennå — vi sjekker kildene',
  'search.pendingLong':
    'Søker fortsatt: den første forespørselen om en bok samler data fra kildene, noe som kan ta et par minutter',
  'search.notFoundHint': 'Ingenting funnet. Prøv å presisere tittelen eller forfatteren.',
  'search.timedOut':
    'Kildene svarer sakte, og vi har ingen data ennå. Bakgrunnssynkroniseringen kan allerede være ferdig — prøv igjen.',
  'search.freeOnlyToggle': 'Gratis å laste ned',
  'search.noFreeResults': 'Ingen av disse har gratis nedlasting ennå — prøv å slå av filteret.',
  'home.tagline': 'Finn ditt neste magnum opus',
  'subject.allLanguages': 'Alle språk.',
  'subject.filteredByLanguage': 'Bare bøker med en utgave på {language}.',
  'subject.dropLanguageFilter': 'vis alle språk',
  'subject.empty':
    'Ingenting under denne merkelappen ennå. Merkelapper kommer fra bøkene denne instansen allerede har hentet.',
  'featured.year': '{year}',
  'nav.browse': 'Bla etter sjanger',
  'recommend.heading': 'Ut fra det du har lest',
  'recommend.becauseOf': 'Du åpnet «{title}», så her er bøker med de samme sjangrene.',
  'recommend.blurb': 'Bøker i sjangrene du har åpnet.',
  'recommend.privacy':
    'Dette regnes ut i nettleseren din — serveren får vite sjangrene, aldri hvem du er.',
  'recommend.forget': 'glem historikken min',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Hylle',
  'shelf.title': 'Hylle',
  'shelf.intro':
    'Åpne kataloger, og hvilken som helst biblioteksserver du kjører selv. Kataloger du legger til, blir i denne nettleseren og sendes aldri til dette nettstedet.',
  'shelf.openCatalogs': 'Åpne kataloger',
  'shelf.yourCatalogs': 'Katalogene dine',
  'shelf.addCatalog': 'Legg til en katalog',
  'shelf.name': 'Navn',
  'shelf.address': 'OPDS-adresse',
  'shelf.username': 'Brukernavn (valgfritt)',
  'shelf.password': 'Passord (valgfritt)',
  'shelf.credentialsNote': 'Adressen og eventuell innlogging lagres bare i denne nettleseren.',
  'shelf.add': 'Legg til',
  'shelf.remove': 'Fjern',
  'shelf.loading': 'Laster katalog…',
  'shelf.empty': 'Denne katalogen har ingen oppføringer.',
  'shelf.noCatalogs':
    'Ingen egne ennå. Legg til en adresse til Calibre-Web, COPS, Kavita eller Audiobookshelf under.',
  'shelf.unreachable':
    'Nettleseren din klarte ikke å lese denne katalogen. En server på ditt eget nettverk fungerer; offentlige nettsteder avviser ofte forespørsler på tvers av opphav.',
  'shelf.nextPage': 'Neste side',
  'shelf.previousPage': 'Forrige side',
  'shelf.drm': 'Krever en DRM-app',
  'shelf.notFree': 'Ikke en gratis nedlasting',
  'shelf.download': 'Last ned',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Bokhandler i nærheten',
  'stores.useMyLocation': 'Bruk posisjonen min',
  'stores.placeLabel': 'By eller postnummer',
  'stores.find': 'Finn',
  'stores.locating': 'Leter…',
  'stores.failed': 'Posisjonen er ikke tilgjengelig. Skriv inn en by eller et postnummer i stedet.',
  'stores.none': 'Ingen bokhandler er kartlagt innenfor {radius} km.',
  'stores.distance': '{distance} km herfra',
  'stores.stockUnknown': 'Bare kartdata — ingen publiserer hva en butikk har på lager.',
  'stores.lookupFailed': 'Kunne ikke nå OpenStreetMap akkurat nå. Prøv igjen om litt.',
  'stores.privacy':
    'Posisjonen din rundes av til omtrent 100 m og sendes bare til OpenStreetMap — aldri til dette nettstedet.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Priser og butikker',
  'prices.loading': 'Spør butikkene…',
  'prices.unknown': 'Prisen er ikke publisert',
  'prices.degraded': 'Ingen svar fra: {providers}',
  'prices.format.hardcover': 'Innbundet',
  'prices.format.paperback': 'Heftet',
  'prices.format.ebook': 'E-bok',
  'prices.format.audiobook': 'Lydbok',
  'prices.format.unknown': 'Format ikke oppgitt',
  'recommend.hideGenre': 'skjul «{genre}»',
  'recommend.hiddenList': 'Skjulte sjangre (klikk for å hente en tilbake):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Lagret',
  'settings.status.cleared': 'Tømt',
  'settings.status.unstored': 'Ikke lagret',
  'settings.status.failed': 'Uendret',
  'settings.notStored':
    'Denne nettleseren nektet å lagre endringen, så ingenting skjedde — verdien du hadde før, gjelder fortsatt.',
  'settings.language.title': 'Språk i grensesnittet',
  'settings.language.changed':
    'Endret fra {from} til {to}. Grensesnittet lastes inn på nytt på {to}; boktitler og forfatternavn blir stående på sine egne språk.',
  'settings.country.title': 'Kjøpsland',
  'settings.country.changed':
    'Satt til {country}. Bokhandellenker tilbyr nå butikker som leverer dit, ved siden av de verdensomspennende.',
  'settings.country.cleared':
    'Ingen land valgt. Bare bokhandler som sender over hele verden, blir tilbudt.',
  'settings.bookLanguage.title': 'Bokspråk',
  'settings.bookLanguage.changed':
    'Satt til {language}. Sjangersider viser først bøker som har en utgave på {language}, til du nullstiller filteret.',
  'settings.bookLanguage.cleared': 'Tømt. Sjangersider viser igjen bøker på alle språk.',
  'settings.hiddenGenres.title': 'Skjulte sjangre',
  'settings.hiddenGenres.hidden':
    '«{genre}» er skjult. Den sendes ikke lenger til serveren når forslag hentes, og til sammen er {count} sjangre skjult.',
  'settings.hiddenGenres.restored':
    '«{genre}» er tilbake i forslagene dine. {count} sjangre er fortsatt skjult.',
  'settings.history.title': 'Lesehistorikk',
  'settings.history.cleared':
    'Bøkene du hadde åpnet, er slettet fra denne nettleseren. Forslagene holder seg borte til du åpner en ny bok.',
  'settings.bookmarks.title': 'Lagrede bøker',
  'settings.bookmarks.added': '«{title}» ble lagt til i de lagrede bøkene dine.',
  'settings.bookmarks.removed': '«{title}» ble fjernet fra de lagrede bøkene dine.',
  'settings.bookmarks.failed':
    'Serveren godtok ikke endringen, så de lagrede bøkene dine er som før.',
  'settings.catalogs.title': 'Katalogene dine',
  'settings.catalogs.added':
    '«{name}» ble lagt til på {url}. Adressen blir i denne nettleseren og sendes aldri til dette nettstedet.',
  'settings.catalogs.addedWithCredentials':
    '«{name}» ble lagt til på {url}, med brukernavnet og passordet du skrev inn. Alt blir i denne nettleseren, og ingenting av det sendes til dette nettstedet.',
  'settings.catalogs.removed':
    '«{name}» ble fjernet fra denne nettleseren, sammen med innloggingen som var lagret for den.',
  'settings.catalogs.rejected': 'Ingenting ble lagt til: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Tillegg',
  'addons.title': 'Tillegg',
  'addons.intro':
    'Et tillegg tar med sine egne kilder. Du installerer det ved å lime inn adressen; det kjører enten på enheten din, i en sandkasse, eller på serveren til forfatteren. Golden Library leverer ingen, lister ingen og sjekker ikke hva de returnerer.',
  'addons.addressLabel': 'Adressen til tillegget',
  'addons.addressHint': 'Manifest-URL-en forfatteren av tillegget ga deg.',
  'addons.continue': 'Fortsett',
  'addons.fromServer': 'Fra en server',
  'addons.fromFile': 'Fra en fil på enheten din',
  'addons.bundleLabel': 'Adresse til koden i tillegget',
  'addons.bundleHint':
    'URL-en til koden i tillegget. Den kjører på denne enheten, ikke på en server.',
  'addons.integrityLabel': 'Integritetshash',
  'addons.integrityHint':
    'Oppgis av forfatteren av tillegget, som sha256-… . Påkrevd: uten den kunne kode du har godkjent én gang, endre seg etterpå uten at du fikk vite det.',
  'addons.checking': 'Leser tillegget…',
  'addons.installedHeading': 'Installert',
  'addons.none': 'Ingen tillegg ennå. Alt på dette nettstedet så langt kommer fra instansen selv.',
  'addons.priorityHint': 'Rekkefølgen er prioritet: det første tillegget svarer først.',
  'addons.enable': 'Slå på',
  'addons.disable': 'Slå av',
  'addons.off': 'Av',
  'addons.remove': 'Fjern',
  'addons.moveUp': 'Flytt opp',
  'addons.moveDown': 'Flytt ned',
  'addons.configure': 'Konfigurer',
  'addons.failedToStart': '«{name}» startet ikke: {reason}',
  'addons.consentTitle': 'Installere «{name}»?',
  'addons.consentHosts': 'Det vil kontakte: {hosts}',
  'addons.consentNoHosts': 'Det har ikke bedt om å kontakte noe.',
  'addons.consentSeesYou':
    'Dette tillegget kjører på serveren til forfatteren. De ser adressen din og alt du leter etter gjennom det.',
  'addons.consentSandboxed':
    'Dette tillegget kjører på enheten din, i en sandkasse. Det kan ikke lese informasjonskapslene dine, dataene til dette nettstedet eller noe annet du har åpent.',
  'addons.consentNotVetted':
    'Golden Library sjekker ikke hva et tillegg returnerer, og har ikke anbefalt dette. Hva du installerer, er ditt eget valg.',
  'addons.install': 'Installer',
  'addons.cancel': 'Avbryt',
  'addons.via': 'via {name}',
  'addons.sourcesTitle': 'Fra tilleggene dine',
  'addons.searchTitle': 'Funnet av tilleggene dine',
  'addons.showLinks': 'Vis nedlastingslenker',
  'addons.unreadable': '{count} oppføringer fra dette tillegget kunne ikke leses.',
  'addons.browse': 'Bla i katalogen',
  'addons.browseTitle': 'Katalogen til {name}',
  'addons.browseNoCatalog': 'Dette tillegget tilbyr ingen katalog å bla i.',
  'addons.browseEmpty': 'Katalogen til dette tillegget er tom akkurat nå.',
  'addons.browseFailed': 'Katalogen til «{name}» kunne ikke lastes: {reason}',
  'addons.loadMore': 'Last inn flere',
  'addons.notInstalled': 'Dette tillegget er ikke installert.',

  'settings.addons.title': 'Tilleggene dine',
  'settings.addons.installed':
    '«{name}» er installert. Det blir spurt sammen med de andre, og kan kontakte {hosts}.',
  'settings.addons.removed':
    '«{name}» ble fjernet. Resultatene er borte fra denne nettleseren, og det samme er alt det hadde lagret her.',
  'settings.addons.enabled': '«{name}» er på igjen og blir spurt sammen med de andre.',
  'settings.addons.disabled':
    '«{name}» er av. Det forblir installert med innstillingene sine, men ingenting det returnerer, blir vist.',
  'settings.addons.reordered': '«{name}» svarer nå som nummer {position} av {total}.',
  'settings.addons.rejected': 'Ingenting ble installert: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Egne kilder',
  'customSources.title': 'Egne kilder',
  'customSources.intro':
    'Legg til din egen butikk eller katalog ved å gi den et navn og en søke-URL med {isbn}, {query}, {title}, {author} eller {language} i seg. Lenken bygges på denne enheten, og dette nettstedet henter den aldri.',
  'customSources.nameLabel': 'Navn',
  'customSources.templateLabel': 'URL-mal',
  'customSources.templateHint':
    'En absolutt https://-adresse. {isbn}, {query}, {title}, {author} og {language} fylles inn fra utgaven; en plassholder som står tom, betyr at lenken hoppes over for den utgaven.',
  'customSources.add': 'Legg til kilde',
  'customSources.listHeading': 'Kildene dine',
  'customSources.none': 'Ingen egne kilder ennå.',
  'customSources.off': 'Av',
  'customSources.enable': 'Slå på',
  'customSources.disable': 'Slå av',
  'customSources.remove': 'Fjern',
  'customSources.heading': 'Kildene dine',
  'customSources.caption':
    'Lenker du har satt opp selv. Denne instansen sjekker ikke hvor de fører.',

  'settings.customSources.title': 'Dine egne kilder',
  'settings.customSources.added': '«{name}» ble lagt til og blir tilbudt sammen med de andre.',
  'settings.customSources.removed': '«{name}» ble fjernet fra denne nettleseren.',
  'settings.customSources.enabled': '«{name}» er på igjen.',
  'settings.customSources.disabled':
    '«{name}» er av. Den forblir konfigurert, men lenken vises ikke.',
  'settings.customSources.rejected': 'Ingenting ble lagt til: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Bøker på ditt språk',
  'featured.inLanguageBlurb':
    'Bøker skrevet på språket du leser dette nettstedet på, de mest utgitte først — Open Librarys egen rekkefølge, ikke en bestselgerliste.',
  'work.newSearch': 'Nytt søk',
  'work.descriptionFrom': 'Beskrivelse:',
  'work.descriptionNotLocalized':
    'Denne beskrivelsen er på språket kilden skrev den på — det finnes ingen på ditt språk for denne boken ennå.',

  // Reader ratings of an edition, never of a translation — see TranslationRatings.tsx.
  'ratings.edition': '{average} av {outOf} fra {votes} lesere på {source}',
  'ratings.lowConfidence': 'for få stemmer til å sammenligne',
  'ratings.reviews': 'Omtaler',
  'ratings.reviewsOn': 'Omtaler av denne utgaven på {source}',
  'ratings.noteNoRatings':
    'Ingen åpen kilde vurderer en oversettelse, og ingen av disse opplagene har en leservurdering her.',
  'ratings.noteReviews':
    'Der en utgave er kjent på {sources}, går lenken til omtalene av nettopp det opplaget — de fleste utgaver er ikke det.',
  'ratings.translator':
    'Utgaver oversatt av {name}: {average} av {outOf} på tvers av {editions} vurderte utgaver, {votes} lesere til sammen.',
  'ratings.note':
    'Dette er lesernes vurderinger av en bestemt utgave på {sources}, ikke en bedømmelse av selve oversettelsen — det publiserer ingen. De er verdt å lese side om side: samme bok, samme språk, ulike oversettere, og alltid med antallet stemmer i syne.',
  'ratings.gapWithoutIsbn':
    '{count} utgaver her har ingen ISBN, så ingen vurdering kunne knyttes til dem.',
  'ratings.gapNotLookedUp': '{count} flere utgaver ble ikke slått opp i denne forespørselen.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Les i nettleseren din',
  'reader.privacy':
    'Nettleseren din åpner denne boken på egen hånd. Filen, stedet den kom fra, og hvor langt du har lest, når aldri fram til dette nettstedet.',
  'reader.chooseFile': 'Åpne en bok fra denne enheten',
  'reader.formats': 'EPUB, FB2, MOBI og CBZ.',
  'reader.loading': 'Åpner…',
  'reader.failed': 'Denne boken kunne ikke åpnes: {reason}',
  'reader.previous': 'Forrige side',
  'reader.next': 'Neste side',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…eller slipp en bok her',
  'reader.fetching': 'Ber {host} om filen…',
  'reader.blockedTitle': '{host} ga ikke filen til denne siden',
  'reader.blockedBody':
    'Enten er den ikke tilgjengelig, eller så tillater den ikke at andre nettsteder leser filene sine. Dette nettstedet henter den ikke for deg i stedet: boken din passerer aldri gjennom det, og det er hele poenget med å lese her.',
  'reader.blockedDownload': 'Last den ned fra {host}',
  'reader.blockedOpenHere': 'og åpne den så her fra enheten din',
  'reader.blockedAddon': 'Et tillegg som serverer filen selv, fungerer også.',
  'reader.keepFile': 'Behold denne boken i denne nettleseren',
  'reader.keepFileHint':
    'Av som standard. Uten den er filen borte når du lukker fanen; med den blir den kun på denne enheten.',
  'reader.library': 'Beholdt i denne nettleseren',
  'reader.libraryEmpty':
    'Ingenting beholdt ennå. Bøker du beholder, blir på denne enheten og lastes aldri opp.',
  'reader.libraryOpen': 'Åpne',
  'reader.libraryRemove': 'Fjern',
  'reader.libraryFileKept': 'filen beholdt',
  'reader.libraryFileGone': 'filen ikke beholdt',
  'reader.untitled': 'Bok uten tittel',
  'settings.reader.libraryTitle': 'Bøker som beholdes i denne nettleseren',
  'settings.reader.kept':
    '«{title}» beholdes nå på denne enheten, så den åpnes uten å lastes ned på nytt. Den lastes ikke opp noe sted.',
  'settings.reader.forgotten':
    'Filen til «{title}» ble slettet fra denne nettleseren. Den blir stående i listen, så du kan åpne den igjen fra kilden sin.',
  'settings.reader.removed':
    '«{title}» ble fjernet helt fra denne nettleseren — filen og oppføringen.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Åpnet der du slapp — {percent}% inn.',
  'reader.bookmarks': 'Bokmerker',
  'reader.bookmarkAdd': 'Bokmerk denne siden',
  'reader.bookmarkNone': 'Ingen bokmerker i denne boken ennå.',
  'reader.bookmarkGo': 'Gå til',
  'reader.bookmarkRemove': 'Fjern bokmerket',
  'reader.bookmarkNote': 'Notat',
  'reader.bookmarkNotePlaceholder': 'Dine egne ord om denne siden',
  'reader.bookmarkAt': '{percent}% inn',
  'settings.reader.bookmarkTitle': 'Bokmerker i denne nettleseren',
  'settings.reader.bookmarkAdded':
    'Bokmerke {percent}% inn i «{title}». Bokmerker blir på denne enheten sammen med boken.',
  'settings.reader.bookmarkRemoved': 'Det bokmerket i «{title}» ble fjernet fra denne nettleseren.',
  'settings.reader.noteSaved':
    'Notatet ditt på denne siden av «{title}» ble lagret på denne enheten.',
  'settings.reader.positionTitle': 'Leseposisjon',
  'settings.reader.positionUnstored':
    'Denne nettleseren ville ikke lagre hvor du er i «{title}», så den åpnes fra begynnelsen neste gang. Privat modus og en full disk gjør begge det.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': 'Slik ser denne boken ut',
  'reader.theme': 'Farger',
  'reader.themeApp': 'Følg nettstedet',
  'reader.themeLight': 'Papir',
  'reader.themeDark': 'Blekk',
  'reader.themeSepia': 'Sepia',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint': 'Rent svart på hvitt, ingen animasjon, én spalte — for e-papirskjermer.',
  'reader.fontSize': 'Skriftstørrelse',
  'reader.smaller': 'Mindre',
  'reader.larger': 'Større',
  'reader.lineHeight': 'Linjeavstand',
  'reader.margin': 'Marger',
  'reader.flow': 'Sider',
  'reader.flowPaged': 'Bla',
  'reader.flowScrolled': 'Rull',
  'reader.justify': 'Blokkjustering',
  'reader.hyphenate': 'Orddeling',
  'reader.displayReset': 'Tilbake til standard',
  'settings.reader.displayTitle': 'Lesevisning',
  'settings.reader.displayChanged':
    '{setting} er nå {value}. Det gjelder hver bok du åpner i denne nettleseren.',
  'settings.reader.displayReset':
    'Lesevisningen er tilbake til standard for hver bok i denne nettleseren.',
  'reader.on': 'På',
  'reader.off': 'Av',
  'reader.openHere': 'Les i nettleseren din',
  'reader.notAFileTitle': '{host} sendte en nettside, ikke filen',
  'reader.notAFileBody':
    'Lenken fører til en side i stedet for til en bok — en nedlastingsside, et samtykkevindu, eller en sjekk av at du ikke er en robot. Åpne den selv, så er filen der.',
  'settings.status.session': 'Ikke husket',
  'settings.notRemembered':
    'Denne nettleseren ville ikke huske det, så det er tilbake slik det var neste gang du åpner en bok.',
  'compare.rowEditionStatement': 'Utgave',
  'home.genres': 'Populære sjangre',
  'home.genresBlurb': 'Merkelappene med flest bøker bak seg. Hver av dem åpner katalogen sin.',

  // --- The first-run walkthrough (components/OnboardingTour.tsx) -----------
  'tour.next': 'Videre',
  'tour.back': 'Tilbake',
  'tour.skip': 'Ikke nå',
  'tour.finish': 'Ferdig',
  'tour.close': 'Lukk omvisningen',
  'tour.welcome.title': 'Velkommen til Golden Library',
  'tour.welcome.text':
    'Ett minutt, så vet du hvor ting er. Nettstedet finner ut hvilke språk en bok finnes på og hvor du får tak i den lovlig — og gjør det desto bedre jo mer presist du sier hvor det skal lete. Så der begynner vi.',
  'tour.customSourcesNav.title': 'Begynn med dine egne kilder',
  'tour.customSourcesNav.text':
    'Åpne <strong>Egne kilder</strong> — siden der du bestemmer hvilke kataloger som søkes i ved siden av de innebygde.',
  'tour.presets.title': 'Du trenger ikke begynne fra bunnen',
  'tour.presets.text':
    'Der publiseres ferdige maler. De tilhører dem som skrev dem: dette nettstedet kontrollerer ingenting på den kanalen, og en kilde du legger til søker fra din nettleser, ikke fra denne tjeneren. Åpne i en ny fane, ta det du trenger, og kom tilbake.',
  'tour.sourceForm.title': 'To felt, så er det gjort',
  'tour.sourceForm.text':
    'Et navn du kjenner igjen, og adressen til et søk der <strong>{query}</strong> står der ordene dine skal inn. Legg til én nå, eller trykk «Videre» og kom tilbake til det.',
  'tour.sourceList.title': 'Alt du legger til blir her',
  'tour.sourceList.text':
    'Kildene dine står nedenfor, og hver enkelt kan slås av eller fjernes. De bor i denne nettleseren og sendes aldri til tjeneren: ingen her ser dem, og på en annen enhet finnes de ikke.',
  'tour.addonsNav.title': 'Tillegg går lenger',
  'tour.addonsNav.text':
    'Åpne <strong>Tillegg</strong>. En egen kilde er én adresse du har skrevet; et tillegg er et lite program skrevet av noen andre, som kan søke gjennom en katalog ordentlig.',
  'tour.addons.title': 'Ingenting installeres før du har sett det',
  'tour.addons.text':
    'Lim inn adressen til et tillegg, og skjemaet viser deg hva det er og hvilke verter det vil snakke med; først da installeres det. Resultatene bærer alltid navnet på tillegget som ga dem.',
  'tour.shelfNav.title': 'Hyllen',
  'tour.shelfNav.text': 'Åpne <strong>Hylle</strong> for å se katalogene du kan lese direkte fra.',
  'tour.shelf.title': 'Åpne kataloger — og dine egne',
  'tour.shelf.text':
    'Project Gutenberg og dets like er her fra starten. Under dem kan du legge til hvilken som helst OPDS-katalog — for eksempel en Calibre-tjener på ditt eget nett, som nettleseren din når og dette nettstedet aldri.',
  'tour.language.title': 'Grensesnittets språk',
  'tour.language.text':
    'Bytt det her når du vil. Som alle innstillinger her skrives det inn i nettleseren din og gjelder straks — og det sies i en melding, også når nettleseren nektet å huske det.',
  'tour.done.title': 'Det var omvisningen',
  'tour.done.text':
    'Søk fra forsiden, og logg inn hvis bøkene du finner skal tas vare på. Lenken nederst på enhver side starter omvisningen på nytt.',
  'settings.tour.title': 'Den guidede omvisningen',
  'settings.tour.finished':
    'Du har vært gjennom omvisningen, så den åpner seg ikke av seg selv igjen. Lenken nederst på siden starter den når du vil.',
  'settings.tour.skipped':
    'Omvisningen er lukket og åpner seg ikke av seg selv igjen. Lenken nederst på siden starter den når du vil.',
  'settings.tour.restarted':
    'Vi begynner på nytt fra første steg, og denne nettleseren har glemt at du hadde sett den.',
  'customSources.presets': 'Ferdige maler',
  'customSources.presetsCaption':
    'Maler som andre lesere deler, på kanalen til denne instansen. Ingen her kontrollerer dem: les en mal før du legger den til, og husk at den søker fra din nettleser.',
  'footer.takeTheTour': 'Ta omvisningen',
};
