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
};
