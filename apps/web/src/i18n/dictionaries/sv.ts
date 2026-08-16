import type { Dictionary } from '../dictionary';

export const sv: Dictionary = {
  'nav.savedBooks': 'Sparade böcker',
  'nav.signIn': 'Logga in',
  'nav.signOut': 'Logga ut',
  'nav.language': 'Språk',
  'nav.skipToContent': 'Hoppa till innehållet',
  'footer.legal':
    'Enbart lagliga källor: direkt nedladdning endast för verk i public domain och med öppen licens; upphovsrättsskyddade böcker — köp eller lån på bibliotek. Varje länk har en uttalad rättighetsstatus.',
  'footer.openSource': 'Öppen källkod',
  'footer.openSourceRest': '— MIT-licensierad, kan köras i egen regi. Se koden på GitHub.',
  'home.title': 'Golden Library',
  'home.subtitle': 'En öppen aggregator för boköversättningar: språk, utgåvor och lagliga källor.',
  'home.searchLabel': 'Titel och författare',
  'home.searchPlaceholder': 'Krig och fred Tolstoj',
  'home.searchButton': 'Sök',
  'search.searching': 'Söker…',
  'search.backfilling': 'Inget här ännu — vi hämtar boken från källorna. Det tar några sekunder.',
  'search.notFound': 'Ingenting hittades för den här sökningen.',
  'search.retry': 'Försök igen',
  'search.signInPrompt':
    'för att spara böckerna du hittar här och komma tillbaka till dem — och för att jämföra utgåvor från olika år sida vid sida innan du väljer.',
  'featured.yearHeading': 'Årets böcker',
  'featured.yearBlurb':
    'Böcker värda att märka från vart och ett av de senaste åren. En handplockad lista, inte en försäljningstopplista — någon sådan publiceras inte öppet.',
  'featured.popularHeading': 'Mycket lästa, mycket översatta',
  'featured.popularBlurb':
    'Böcker som finns på många språk — vilket är hela poängen med den här sajten.',
  'featured.filling':
    'Några av dem hämtas fortfarande i bakgrunden. Ladda om sidan om en minut för att se resten.',
  'featured.freeCopy': 'Gratis exemplar',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Gratis att läsa direkt',
  'free.homeBlurb':
    'Böcker i public domain och med öppen licens som den här instansen kan ge dig direkt.',
  'free.seeAll': 'Se fler',
  'free.downloadable': 'Ladda ned',
  'free.pageTitle': 'Gratis böcker',
  'free.pageBlurb':
    'Varje bok här har minst ett lagligt gratisexemplar — public domain eller bortskänkt av rättighetshavaren. Inget köp, inget lånekort.',
  'free.empty':
    'Inget gratis här ännu. Gratisexemplar dyker upp allteftersom den här instansen hämtar böcker, så sök efter en och kom tillbaka.',
  'free.emptyForLanguage':
    'Inga gratisexemplar på {language} ännu. Ta bort filtret ovan för att se hela hyllan.',
  'free.showMore': 'Visa fler',
  'free.shown': 'Visar {shown} av {total}.',
  'free.allLanguages': 'Gratisexemplar på alla språk.',
  'free.filteredByLanguage': 'Endast gratisexemplar på {language}.',
  'free.filterByLanguage': 'Visa bara gratisexemplaren på {language}.',
  'free.dropLanguageFilter': 'visa alla språk',
  'free.loadFailed': 'De gratis böckerna kunde inte laddas just nu.',
  'work.original': 'original',
  'work.dataSources': 'Datakällor',
  'work.about': 'Om boken',
  'work.translatedInto': 'Översatt till',
  'work.availableIn': 'Finns på',
  'work.languagesNote':
    'Bara det som våra källor listar — en översättning som saknas här kan ändå finnas.',
  'work.noTranslations': 'Inga översättningar hittade ännu.',
  'work.yourLanguage.title': 'På ditt språk',
  'work.yourLanguage.yes': 'Det finns en översättning till {language}.',
  'work.yourLanguage.original': 'Den här boken skrevs på {language}.',
  'work.yourLanguage.no': 'Ingen översättning till {language} bland de utgåvor som är kända här.',
  'work.yourLanguage.show': 'Visa utgåvor på {language}',
  'work.editions': 'Utgåvor ({shown} av {total})',
  'work.filterLanguage': 'Språk',
  'work.filterAllLanguages': 'Alla språk',
  'work.filterYear': 'År',
  'work.filterApply': 'Filtrera',
  'work.filterReset': 'Återställ',
  'work.noEditionsMatch': 'Inga utgåvor matchar de här filtren.',
  'work.showMoreEditions': 'Visa fler utgåvor ({remaining} kvar)',
  'work.badgeFreeDownload': 'gratis nedladdning',
  'work.freeDownloadFormat': 'Ladda ned {format}',
  'work.freeDownloadNote': '{rights}. Gratis från {provider} — inget konto, ingen betalning.',
  'work.badgeReadBorrow': 'läs eller låna',
  'work.badgeInBookstores': 'i bokhandeln',
  'work.translatedBy': 'översatt av {name}',
  'work.pages': '{count} sidor',
  'bookmark.save': 'Spara den här boken',
  'bookmark.saved': 'Sparad',
  'bookmark.signInToSave': 'Logga in för att spara',
  'bookmark.failed': 'Kunde inte spara. Försök igen.',
  'links.show': 'Visa länkar',
  'links.hide': 'Dölj länkar',
  'links.loading': 'Laddar länkar',
  'links.none': 'Inga lagliga länkar till den här utgåvan ännu.',
  'links.viaOtherEdition': 'gratis exemplar från utgåvan {label}',
  'links.failed': 'Länkarna kunde inte laddas.',
  'links.storesHeading': 'Hitta i en bokhandel',
  'links.storesInCountry': 'I {country}',
  'links.storesYourCountry': 'ditt land',
  'links.storesLanguageMarket': 'Där böcker på {language} säljs',
  'links.storesLanguageMarketGeneric': 'Där den här utgåvans språk säljs',
  'links.storesWorldwide': 'Skickar över hela världen',
  'links.storesCaption':
    'Varje länk söker i butikens egen katalog — tillgång och pris visas av butiken själv.',
  'linkType.download': 'Ladda ned',
  'linkType.buy': 'Köp',
  'linkType.borrow': 'Låna på bibliotek',
  'linkType.listen': 'Lyssna (ljudbok)',
  'rights.public_domain': 'Public domain',
  'rights.open_license': 'Öppen licens',
  'rights.copyrighted': 'Upphovsrättsskyddad',
  'rights.unknown': 'Okänd status',
  'compare.heading': 'Jämför utgåvor',
  'compare.blurb': 'Välj två eller tre utgåvor för att se vad som faktiskt skiljer dem åt.',
  'compare.selected': 'Valda: {count} av minst 2.',
  'compare.editSelection': 'Byt utgåvor',
  'compare.showAllEditions': 'Visa alla {count} utgåvor',
  'compare.columnDifference': 'Skillnad',
  'compare.identical': 'De här utgåvorna är identiska i allt källorna registrerar.',
  'compare.rowLanguage': 'Språk',
  'compare.rowPublished': 'Utgiven',
  'compare.rowPublisher': 'Förlag',
  'compare.rowTranslator': 'Översättare',
  'compare.rowTranslatedFrom': 'Översatt från',
  'compare.rowBinding': 'Bindning',
  'compare.rowPages': 'Sidor',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Gratis eller lånbart exemplar',
  'compare.yes': 'ja ({count})',
  'compare.no': 'hittades inte',
  'country.label': 'Var köper du böcker?',
  'country.worldwideOnly': 'Endast butiker som skickar över hela världen',
  'auth.signInTitle': 'Logga in',
  'auth.registerTitle': 'Skapa ett konto',
  'auth.blurb':
    'Ett konto finns av ett enda skäl: att spara böcker du hittar och komma tillbaka till dem — med språken de översatts till, utgåvorna som finns och var du får tag på var och en lagligt. Inget nyhetsbrev, ingen profil, ingen spårning.',
  'auth.name': 'Namn (valfritt)',
  'auth.email': 'E-post',
  'auth.password': 'Lösenord',
  'auth.passwordHint':
    'Minst {min} tecken. Bara längden kontrolleras — en lång fras du kommer ihåg slår en kort med skiljetecken i.',
  'auth.submitSignIn': 'Logga in',
  'auth.submitRegister': 'Skapa konto',
  'auth.working': 'Arbetar…',
  'auth.google': 'Fortsätt med Google',
  'auth.toRegister': 'Inget konto än? Skapa ett',
  'auth.toSignIn': 'Har du redan ett konto? Logga in',
  'auth.backToSearch': 'Tillbaka till sökningen',
  'auth.errorGoogleState':
    'Den inloggningslänken har gått ut eller öppnades i en annan webbläsare. Försök igen.',
  'auth.errorGoogleFailed':
    'Inloggningen med Google slutfördes inte. Du kan använda e-post och lösenord i stället.',
  'auth.errorGeneric': 'Något gick fel.',
  'bookmarks.title': 'Sparade böcker',
  'bookmarks.signedOut':
    'för att behålla böckerna du hittar — och för att senare jämföra utgåvor av samma bok sida vid sida.',
  'bookmarks.loading': 'Laddar…',
  'bookmarks.empty':
    'Inget sparat ännu. Hitta en bok och använd ”Spara den här boken” på dess kort.',
  'bookmarks.searchLink': 'Sök',
  'bookmarks.remove': 'Ta bort',
  'bookmarks.loadFailed': 'Dina sparade böcker kunde inte laddas.',
  'search.failed': 'Sökningen misslyckades.',
  'search.pending': 'Inte i vår databas ännu — vi kollar källorna',
  'search.pendingLong':
    'Söker fortfarande: den första förfrågan om en bok samlar in data från källorna, vilket kan ta upp till ett par minuter',
  'search.notFoundHint': 'Inget hittat. Försök precisera titeln eller författaren.',
  'search.timedOut':
    'Källorna svarar långsamt och vi har ingen data ännu. Bakgrundssynkroniseringen kan redan vara klar — försök igen.',
  'search.freeOnlyToggle': 'Gratis att ladda ned',
  'search.noFreeResults':
    'Ingen av dem har en gratis nedladdning ännu — prova att stänga av filtret.',
  'home.tagline': 'Hitta ditt nästa magnum opus',
  'subject.allLanguages': 'Alla språk.',
  'subject.filteredByLanguage': 'Endast böcker med en utgåva på {language}.',
  'subject.dropLanguageFilter': 'visa alla språk',
  'subject.empty':
    'Inget under den här taggen ännu. Taggarna kommer från böckerna den här instansen redan har hämtat.',
  'featured.year': '{year}',
  'nav.browse': 'Bläddra efter genre',
  'recommend.heading': 'Utifrån vad du har läst',
  'recommend.becauseOf': 'Du öppnade ”{title}”, så här är böcker som delar dess genrer.',
  'recommend.blurb': 'Böcker i de genrer du har öppnat.',
  'recommend.privacy':
    'Det här räknas ut i din webbläsare — servern får veta genrerna, aldrig vem du är.',
  'recommend.forget': 'glöm min historik',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Hylla',
  'shelf.title': 'Hylla',
  'shelf.intro':
    'Öppna kataloger, och vilken biblioteksserver du än kör själv. Kataloger du lägger till stannar i den här webbläsaren och skickas aldrig till den här sajten.',
  'shelf.openCatalogs': 'Öppna kataloger',
  'shelf.yourCatalogs': 'Dina kataloger',
  'shelf.addCatalog': 'Lägg till en katalog',
  'shelf.name': 'Namn',
  'shelf.address': 'OPDS-adress',
  'shelf.username': 'Användarnamn (valfritt)',
  'shelf.password': 'Lösenord (valfritt)',
  'shelf.credentialsNote':
    'Adressen och eventuella inloggningsuppgifter lagras bara i den här webbläsaren.',
  'shelf.add': 'Lägg till',
  'shelf.remove': 'Ta bort',
  'shelf.loading': 'Laddar katalogen…',
  'shelf.empty': 'Den här katalogen har inga poster.',
  'shelf.noCatalogs':
    'Inga egna ännu. Lägg till en adress till Calibre-Web, COPS, Kavita eller Audiobookshelf nedan.',
  'shelf.unreachable':
    'Din webbläsare kunde inte läsa den här katalogen. En server i ditt eget nätverk fungerar; publika sajter avvisar ofta förfrågningar från andra ursprung.',
  'shelf.nextPage': 'Nästa sida',
  'shelf.previousPage': 'Föregående sida',
  'shelf.drm': 'Kräver en DRM-app',
  'shelf.notFree': 'Ingen gratis nedladdning',
  'shelf.download': 'Ladda ned',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Bokhandlar nära dig',
  'stores.useMyLocation': 'Använd min plats',
  'stores.placeLabel': 'Stad eller postnummer',
  'stores.find': 'Sök',
  'stores.locating': 'Letar…',
  'stores.failed': 'Platsen är inte tillgänglig. Skriv in en stad eller ett postnummer i stället.',
  'stores.none': 'Inga bokhandlar utsatta på kartan inom {radius} km.',
  'stores.distance': '{distance} km härifrån',
  'stores.stockUnknown': 'Bara kartdata — ingen publicerar vad en butik har i lager.',
  'stores.lookupFailed': 'Kunde inte nå OpenStreetMap just nu. Försök igen om en stund.',
  'stores.privacy':
    'Din plats avrundas till omkring 100 m och skickas bara till OpenStreetMap — aldrig till den här sajten.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Priser och butiker',
  'prices.loading': 'Frågar butikerna…',
  'prices.unknown': 'Priset är inte publicerat',
  'prices.degraded': 'Inget svar från: {providers}',
  'prices.format.hardcover': 'Inbunden',
  'prices.format.paperback': 'Pocket',
  'prices.format.ebook': 'E-bok',
  'prices.format.audiobook': 'Ljudbok',
  'prices.format.unknown': 'Formatet anges inte',
  'recommend.hideGenre': 'dölj ”{genre}”',
  'recommend.hiddenList': 'Dolda genrer (klicka för att ta tillbaka en):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Sparat',
  'settings.status.cleared': 'Rensat',
  'settings.status.unstored': 'Inte lagrat',
  'settings.status.failed': 'Oförändrat',
  'settings.notStored':
    'Webbläsaren vägrade lagra ändringen, så ingenting hände — värdet du hade innan gäller fortfarande.',
  'settings.language.title': 'Gränssnittets språk',
  'settings.language.changed':
    'Ändrat från {from} till {to}. Gränssnittet laddas om på {to}; boktitlar och författarnamn står kvar på sina egna språk.',
  'settings.country.title': 'Land för inköp',
  'settings.country.changed':
    'Satt till {country}. Bokhandelslänkarna erbjuder nu butiker som levererar dit, vid sidan av de världsomspännande.',
  'settings.country.cleared':
    'Inget land valt. Bara bokhandlar som skickar över hela världen erbjuds.',
  'settings.bookLanguage.title': 'Bokspråk',
  'settings.bookLanguage.changed':
    'Satt till {language}. Genresidorna leder med böcker som har en utgåva på {language} tills du återställer filtret.',
  'settings.bookLanguage.cleared': 'Rensat. Genresidorna visar böcker på alla språk igen.',
  'settings.hiddenGenres.title': 'Dolda genrer',
  'settings.hiddenGenres.hidden':
    '”{genre}” är dold. Den skickas inte längre till servern när förslag hämtas, och totalt är {count} genrer dolda.',
  'settings.hiddenGenres.restored':
    '”{genre}” är tillbaka bland dina förslag. {count} genrer är fortfarande dolda.',
  'settings.history.title': 'Läshistorik',
  'settings.history.cleared':
    'Böckerna du hade öppnat är raderade från den här webbläsaren. Förslagen håller sig borta tills du öppnar en ny bok.',
  'settings.bookmarks.title': 'Sparade böcker',
  'settings.bookmarks.added': '”{title}” lades till bland dina sparade böcker.',
  'settings.bookmarks.removed': '”{title}” togs bort från dina sparade böcker.',
  'settings.bookmarks.failed':
    'Servern accepterade inte ändringen, så dina sparade böcker är som de var.',
  'settings.catalogs.title': 'Dina kataloger',
  'settings.catalogs.added':
    '”{name}” lades till på {url}. Adressen stannar i den här webbläsaren och skickas aldrig till den här sajten.',
  'settings.catalogs.addedWithCredentials':
    '”{name}” lades till på {url}, med användarnamnet och lösenordet du skrev in. Allt stannar i den här webbläsaren och inget av det skickas till den här sajten.',
  'settings.catalogs.removed':
    '”{name}” togs bort från den här webbläsaren, tillsammans med de inloggningsuppgifter som sparats för den.',
  'settings.catalogs.rejected': 'Ingenting lades till: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Tillägg',
  'addons.title': 'Tillägg',
  'addons.intro':
    'Ett tillägg lägger till egna källor. Du installerar det genom att klistra in dess adress; det körs antingen på din enhet, i en sandlåda, eller på upphovspersonens server. Golden Library levererar inga, listar inga och kontrollerar inte vad de returnerar.',
  'addons.addressLabel': 'Tilläggets adress',
  'addons.addressHint': 'Manifest-URL:en som tilläggets upphovsperson gav dig.',
  'addons.continue': 'Fortsätt',
  'addons.fromServer': 'Från en server',
  'addons.fromFile': 'Från en fil på din enhet',
  'addons.bundleLabel': 'Adress till tilläggets kod',
  'addons.bundleHint':
    'URL:en till tilläggets kod. Den körs på den här enheten, inte på en server.',
  'addons.integrityLabel': 'Integritetshash',
  'addons.integrityHint':
    'Ges av tilläggets upphovsperson, som sha256-… . Obligatorisk: utan den kunde kod du en gång godkänt ändras efteråt utan att du någonsin fick veta det.',
  'addons.checking': 'Läser tillägget…',
  'addons.installedHeading': 'Installerade',
  'addons.none': 'Inga tillägg ännu. Allt på den här sajten hittills kommer från instansen själv.',
  'addons.priorityHint': 'Ordningen är prioritet: det första tillägget svarar först.',
  'addons.enable': 'Slå på',
  'addons.disable': 'Slå av',
  'addons.off': 'Av',
  'addons.remove': 'Ta bort',
  'addons.moveUp': 'Flytta upp',
  'addons.moveDown': 'Flytta ned',
  'addons.configure': 'Konfigurera',
  'addons.failedToStart': '”{name}” startade inte: {reason}',
  'addons.consentTitle': 'Installera ”{name}”?',
  'addons.consentHosts': 'Det kommer att kontakta: {hosts}',
  'addons.consentNoHosts': 'Det har inte bett om att få kontakta någonting.',
  'addons.consentSeesYou':
    'Det här tillägget körs på upphovspersonens server. De ser din adress och allt du söker efter genom det.',
  'addons.consentSandboxed':
    'Det här tillägget körs på din enhet i en sandlåda. Det kan inte läsa dina kakor, den här sajtens data eller något annat du har öppet.',
  'addons.consentNotVetted':
    'Golden Library kontrollerar inte vad ett tillägg returnerar och har inte rekommenderat det här. Vad du installerar är ditt eget val.',
  'addons.install': 'Installera',
  'addons.cancel': 'Avbryt',
  'addons.via': 'via {name}',
  'addons.sourcesTitle': 'Från dina tillägg',
  'addons.searchTitle': 'Hittat av dina tillägg',
  'addons.showLinks': 'Visa nedladdningslänkar',
  'addons.unreadable': '{count} poster från det här tillägget kunde inte läsas.',
  'addons.browse': 'Bläddra i katalogen',
  'addons.browseTitle': 'Katalogen för {name}',
  'addons.browseNoCatalog': 'Det här tillägget erbjuder ingen katalog att bläddra i.',
  'addons.browseEmpty': 'Det här tilläggets katalog är tom just nu.',
  'addons.browseFailed': 'Katalogen för ”{name}” kunde inte laddas: {reason}',
  'addons.loadMore': 'Ladda fler',
  'addons.notInstalled': 'Det här tillägget är inte installerat.',

  'settings.addons.title': 'Dina tillägg',
  'settings.addons.installed':
    '”{name}” är installerat. Det tillfrågas tillsammans med de andra och kan kontakta {hosts}.',
  'settings.addons.removed':
    '”{name}” togs bort. Dess resultat är borta från den här webbläsaren, och det är även allt det hade lagrat här.',
  'settings.addons.enabled': '”{name}” är på igen och tillfrågas tillsammans med de andra.',
  'settings.addons.disabled':
    '”{name}” är av. Det förblir installerat med sina inställningar, men inget det returnerar visas.',
  'settings.addons.reordered': '”{name}” svarar nu som nummer {position} av {total}.',
  'settings.addons.rejected': 'Ingenting installerades: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Egna källor',
  'customSources.title': 'Egna källor',
  'customSources.intro':
    'Lägg till en egen butik eller katalog genom att ge den ett namn och en sök-URL med {isbn}, {query}, {title}, {author} eller {language} i sig. Länken byggs på den här enheten och den här sajten hämtar den aldrig.',
  'customSources.nameLabel': 'Namn',
  'customSources.templateLabel': 'URL-mall',
  'customSources.templateHint':
    'En absolut https://-adress. {isbn}, {query}, {title}, {author} och {language} fylls i från utgåvan; en platshållare som lämnas tom gör att länken hoppas över för den utgåvan.',
  'customSources.add': 'Lägg till källa',
  'customSources.listHeading': 'Dina källor',
  'customSources.none': 'Inga egna källor ännu.',
  'customSources.off': 'Av',
  'customSources.enable': 'Slå på',
  'customSources.disable': 'Slå av',
  'customSources.remove': 'Ta bort',
  'customSources.heading': 'Dina källor',
  'customSources.caption':
    'Länkar du har ställt in själv. Den här instansen kontrollerar inte vart de leder.',

  'settings.customSources.title': 'Dina egna källor',
  'settings.customSources.added': '”{name}” lades till och erbjuds tillsammans med de andra.',
  'settings.customSources.removed': '”{name}” togs bort från den här webbläsaren.',
  'settings.customSources.enabled': '”{name}” är på igen.',
  'settings.customSources.disabled':
    '”{name}” är av. Den förblir konfigurerad, men dess länk visas inte.',
  'settings.customSources.rejected': 'Ingenting lades till: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Böcker på ditt språk',
  'featured.inLanguageBlurb':
    'Böcker skrivna på det språk du läser den här sajten på, de mest utgivna först — Open Librarys egen ordning, inte en bestsellerlista.',
  'work.newSearch': 'Ny sökning',
  'work.descriptionFrom': 'Beskrivning:',
  'work.descriptionNotLocalized':
    'Den här beskrivningen är på det språk källan skrev den på — det finns ingen på ditt språk för den här boken ännu.',

  // Reader ratings of an edition, never of a translation — see TranslationRatings.tsx.
  'ratings.edition': '{average} av {outOf} från {votes} läsare på {source}',
  'ratings.lowConfidence': 'för få röster för att jämföra',
  'ratings.reviews': 'Recensioner',
  'ratings.reviewsOn': 'Recensioner av den här utgåvan på {source}',
  'ratings.noteNoRatings':
    'Ingen öppen källa betygsätter en översättning, och ingen av de här tryckningarna har något läsarbetyg här.',
  'ratings.noteReviews':
    'Där en utgåva är känd på {sources} går länken till recensionerna av just den tryckningen — de flesta utgåvor är det inte.',
  'ratings.translator':
    'Utgåvor översatta av {name}: {average} av {outOf} över {editions} betygsatta utgåvor, {votes} läsare totalt.',
  'ratings.note':
    'Det här är läsarnas betyg på en bestämd utgåva på {sources}, inte ett omdöme om själva översättningen — det publicerar ingen. De är värda att läsa sida vid sida: samma bok, samma språk, olika översättare, och alltid med antalet röster i sikte.',
  'ratings.gapWithoutIsbn':
    '{count} utgåvor här saknar ISBN, så inget betyg kunde matchas mot dem.',
  'ratings.gapNotLookedUp': '{count} ytterligare utgåvor slogs inte upp i den här förfrågan.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Läs i din webbläsare',
  'reader.privacy':
    'Din webbläsare öppnar den här boken på egen hand. Filen, platsen den kom ifrån och hur långt du har läst når aldrig den här sajten.',
  'reader.chooseFile': 'Öppna en bok från den här enheten',
  'reader.formats': 'EPUB, FB2, MOBI och CBZ.',
  'reader.loading': 'Öppnar…',
  'reader.failed': 'Den här boken kunde inte öppnas: {reason}',
  'reader.previous': 'Föregående sida',
  'reader.next': 'Nästa sida',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…eller släpp en bok här',
  'reader.fetching': 'Ber {host} om filen…',
  'reader.blockedTitle': '{host} lämnade inte filen till den här sidan',
  'reader.blockedBody':
    'Antingen går den inte att nå, eller så tillåter den inte att andra sajter läser dess filer. Den här sajten hämtar den inte åt dig i stället: din bok passerar aldrig genom den, och det är hela poängen med att läsa här.',
  'reader.blockedDownload': 'Ladda ned den från {host}',
  'reader.blockedOpenHere': 'och öppna den sedan här från din enhet',
  'reader.blockedAddon': 'Ett tillägg som serverar filen själv fungerar också.',
  'reader.keepFile': 'Behåll den här boken i den här webbläsaren',
  'reader.keepFileHint':
    'Av som standard. Utan den är filen borta när du stänger fliken; med den stannar den bara på den här enheten.',
  'reader.library': 'Behållna i den här webbläsaren',
  'reader.libraryEmpty':
    'Inget behållet ännu. Böcker du behåller stannar på den här enheten och laddas aldrig upp.',
  'reader.libraryOpen': 'Öppna',
  'reader.libraryRemove': 'Ta bort',
  'reader.libraryFileKept': 'filen behållen',
  'reader.libraryFileGone': 'filen inte behållen',
  'reader.untitled': 'Bok utan titel',
  'settings.reader.libraryTitle': 'Böcker som behålls i den här webbläsaren',
  'settings.reader.kept':
    '”{title}” behålls nu på den här enheten, så den öppnas utan att laddas ned igen. Den laddas inte upp någonstans.',
  'settings.reader.forgotten':
    'Filen för ”{title}” raderades från den här webbläsaren. Den står kvar i listan, så du kan öppna den igen från dess källa.',
  'settings.reader.removed':
    '”{title}” togs bort från den här webbläsaren helt och hållet — filen och posten.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Öppnad där du slutade — {percent}% in.',
  'reader.bookmarks': 'Bokmärken',
  'reader.bookmarkAdd': 'Bokmärk den här sidan',
  'reader.bookmarkNone': 'Inga bokmärken i den här boken ännu.',
  'reader.bookmarkGo': 'Gå till',
  'reader.bookmarkRemove': 'Ta bort bokmärket',
  'reader.bookmarkNote': 'Anteckning',
  'reader.bookmarkNotePlaceholder': 'Dina egna ord om den här sidan',
  'reader.bookmarkAt': '{percent}% in',
  'settings.reader.bookmarkTitle': 'Bokmärken i den här webbläsaren',
  'settings.reader.bookmarkAdded':
    'Bokmärke {percent}% in i ”{title}”. Bokmärken stannar på den här enheten tillsammans med boken.',
  'settings.reader.bookmarkRemoved':
    'Det bokmärket i ”{title}” togs bort från den här webbläsaren.',
  'settings.reader.noteSaved':
    'Din anteckning på den här sidan av ”{title}” sparades på den här enheten.',
  'settings.reader.positionTitle': 'Läsposition',
  'settings.reader.positionUnstored':
    'Den här webbläsaren ville inte lagra var du är i ”{title}”, så den öppnas från början nästa gång. Privat läge och en full disk gör båda så.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': 'Hur den här boken ser ut',
  'reader.theme': 'Färger',
  'reader.themeApp': 'Följ sajten',
  'reader.themeLight': 'Papper',
  'reader.themeDark': 'Bläck',
  'reader.themeSepia': 'Sepia',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint': 'Rent svart på vitt, ingen animation, en spalt — för e-pappersskärmar.',
  'reader.fontSize': 'Textstorlek',
  'reader.smaller': 'Mindre',
  'reader.larger': 'Större',
  'reader.lineHeight': 'Radavstånd',
  'reader.margin': 'Marginaler',
  'reader.flow': 'Sidor',
  'reader.flowPaged': 'Bläddra',
  'reader.flowScrolled': 'Rulla',
  'reader.justify': 'Marginaljustera',
  'reader.hyphenate': 'Avstavning',
  'reader.displayReset': 'Tillbaka till standard',
  'settings.reader.displayTitle': 'Läsvy',
  'settings.reader.displayChanged':
    '{setting} är nu {value}. Det gäller varje bok du öppnar i den här webbläsaren.',
  'settings.reader.displayReset':
    'Läsvyn är tillbaka till sina standardvärden för varje bok i den här webbläsaren.',
  'reader.on': 'På',
  'reader.off': 'Av',
  'reader.openHere': 'Läs i din webbläsare',
  'reader.notAFileTitle': '{host} skickade en webbsida, inte filen',
  'reader.notAFileBody':
    'Länken leder till en sida i stället för till en bok — en nedladdningssida, en samtyckesruta, eller en kontroll av att du inte är en robot. Öppna den själv så finns filen där.',
  'settings.status.session': 'Inte ihågkommet',
  'settings.notRemembered':
    'Den här webbläsaren ville inte komma ihåg det, så det är tillbaka som det var nästa gång du öppnar en bok.',
  'compare.rowEditionStatement': 'Utgåva',
  'home.genres': 'Populära genrer',
  'home.genresBlurb': 'De etiketter som har flest böcker bakom sig. Var och en öppnar sin katalog.',

  // --- The first-run walkthrough (components/OnboardingTour.tsx) -----------
  'tour.next': 'Vidare',
  'tour.back': 'Tillbaka',
  'tour.skip': 'Inte nu',
  'tour.finish': 'Klart',
  'tour.close': 'Stäng rundturen',
  'tour.welcome.title': 'Välkommen till Golden Library',
  'tour.welcome.text':
    'En minut, så vet du var allt finns. Den här webbplatsen tar reda på vilka språk en bok finns på och var du får tag i den lagligt — och gör det desto bättre ju noggrannare du talar om var den ska leta. Så där börjar vi.',
  'tour.customSourcesNav.title': 'Börja med dina egna källor',
  'tour.customSourcesNav.text':
    'Öppna <strong>Egna källor</strong> — sidan där du bestämmer vilka kataloger som genomsöks vid sidan av de inbyggda.',
  'tour.presets.title': 'Du behöver inte börja från noll',
  'tour.presets.text':
    'Där publiceras färdiga mallar. De tillhör dem som skrev dem: den här webbplatsen kontrollerar ingenting i den kanalen, och en källa du lägger till söker från din webbläsare, inte från den här servern. Öppna i en ny flik, ta det du behöver och kom tillbaka.',
  'tour.sourceForm.title': 'Två fält, sedan är det gjort',
  'tour.sourceForm.text':
    'Ett namn du känner igen och adressen till en sökning där <strong>{query}</strong> står där dina ord ska in. Lägg till en nu, eller tryck «Vidare» och återkom till det.',
  'tour.sourceList.title': 'Allt du lägger till stannar här',
  'tour.sourceList.text':
    'Dina källor står nedan och var och en kan stängas av eller tas bort. De bor i den här webbläsaren och skickas aldrig till servern: ingen här ser dem, och på en annan enhet finns de inte.',
  'tour.addonsNav.title': 'Tillägg går längre',
  'tour.addonsNav.text':
    'Öppna <strong>Tillägg</strong>. En egen källa är en adress du själv skrivit; ett tillägg är ett litet program skrivet av någon annan, som kan söka igenom en katalog på riktigt.',
  'tour.addons.title': 'Ingenting installeras innan du har sett det',
  'tour.addons.text':
    'Klistra in adressen till ett tillägg, så visar formuläret vad det är och vilka värdar det kommer att prata med; först därefter installeras det. Dess resultat bär alltid namnet på tillägget som gav dem.',
  'tour.shelfNav.title': 'Hyllan',
  'tour.shelfNav.text':
    'Öppna <strong>Hylla</strong> för att se katalogerna du kan läsa direkt ur.',
  'tour.shelf.title': 'Öppna kataloger — och dina egna',
  'tour.shelf.text':
    'Project Gutenberg och dess likar finns här från början. Under dem kan du lägga till vilken OPDS-katalog som helst — till exempel en Calibre-server i ditt eget nät, som din webbläsare når och den här webbplatsen aldrig.',
  'tour.language.title': 'Gränssnittets språk',
  'tour.language.text':
    'Byt det här när du vill. Som alla inställningar här skrivs det in i din webbläsare och gäller genast — och det sägs i en avisering, även när webbläsaren vägrade minnas det.',
  'tour.done.title': 'Det var rundturen',
  'tour.done.text':
    'Sök från startsidan, och logga in om böckerna du hittar ska sparas. Länken längst ned på varje sida startar rundturen igen.',
  'settings.tour.title': 'Den guidade rundturen',
  'settings.tour.finished':
    'Du har gått igenom rundturen, så den öppnas inte av sig själv igen. Länken längst ned på sidan startar den när du vill.',
  'settings.tour.skipped':
    'Rundturen är stängd och öppnas inte av sig själv igen. Länken längst ned på sidan startar den när du vill.',
  'settings.tour.restarted':
    'Vi börjar om från första steget, och den här webbläsaren har glömt att du redan sett den.',
  'customSources.presets': 'Färdiga mallar',
  'customSources.presetsCaption':
    'Mallar som andra läsare delar, på den här instansens egen kanal. Ingen här granskar dem: läs en mall innan du lägger till den, och kom ihåg att den söker från din webbläsare.',
  'footer.takeTheTour': 'Ta rundturen',
};
