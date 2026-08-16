import type { Dictionary } from '../dictionary';

export const lv: Dictionary = {
  'nav.savedBooks': 'Saglabātās grāmatas',
  'nav.signIn': 'Pieteikties',
  'nav.signOut': 'Atteikties',
  'nav.language': 'Valoda',
  'nav.skipToContent': 'Pāriet uz saturu',
  'footer.legal':
    'Tikai likumīgi avoti: tieša lejupielāde vienīgi publiskajā īpašumā esošiem un ar atvērtām licencēm izdotiem darbiem; ar autortiesībām aizsargātas grāmatas — pirkšana vai bibliotēkas izsniegums. Katrai saitei ir skaidri norādīts tiesību statuss.',
  'footer.openSource': 'Atvērtais pirmkods',
  'footer.openSourceRest': '— MIT licence, iespējams uzturēt pašam. Kods pieejams GitHub.',
  'home.title': 'Golden Library',
  'home.subtitle': 'Atvērts grāmatu tulkojumu apkopotājs: valodas, izdevumi un likumīgi avoti.',
  'home.searchLabel': 'Nosaukums un autors',
  'home.searchPlaceholder': 'Karš un miers Tolstojs',
  'home.searchButton': 'Meklēt',
  'search.searching': 'Meklējam…',
  'search.backfilling':
    'Šeit vēl nekā nav — ielādējam grāmatu no avotiem. Tas aizņem dažas sekundes.',
  'search.notFound': 'Šim vaicājumam nekas netika atrasts.',
  'search.retry': 'Mēģināt vēlreiz',
  'search.signInPrompt':
    'lai saglabātu šeit atrastās grāmatas un atgrieztos pie tām — un lai pirms izvēles salīdzinātu blakus dažādu gadu izdevumus.',
  'featured.yearHeading': 'Gada grāmatas',
  'featured.yearBlurb':
    'Ievērības cienīgas grāmatas no katra pēdējā gada. Ar roku veidots saraksts, nevis pārdošanas tops — tādu neviens atvērtais avots nepublicē.',
  'featured.popularHeading': 'Daudz lasītas, daudz tulkotas',
  'featured.popularBlurb':
    'Grāmatas, kas pastāv daudzās valodās — tieši tāpēc šī vietne ir izveidota.',
  'featured.filling':
    'Dažas no tām vēl ielādējam fonā. Pēc minūtes pārlādējiet lapu, lai redzētu pārējās.',
  'featured.freeCopy': 'Bezmaksas eksemplārs',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Bez maksas lasāms tūlīt',
  'free.homeBlurb':
    'Publiskajā īpašumā esošas un ar atvērtu licenci izdotas grāmatas, ko šī vietnes kopija var izsniegt tieši.',
  'free.seeAll': 'Skatīt vairāk',
  'free.downloadable': 'Lejupielādēt',
  'free.pageTitle': 'Bezmaksas grāmatas',
  'free.pageBlurb':
    'Katrai šeit esošajai grāmatai ir vismaz viens likumīgs bezmaksas eksemplārs — publiskais īpašums vai tiesību īpašnieka dāvinājums. Bez pirkšanas, bez lasītāja kartes.',
  'free.empty':
    'Šeit vēl nekā bezmaksas nav. Bezmaksas eksemplāri parādās, kad šī instance ielādē grāmatas, tāpēc sameklējiet kādu un atgriezieties.',
  'free.emptyForLanguage':
    'Valodā {language} vēl nav bezmaksas eksemplāru. Noņemiet augšā esošo filtru, lai redzētu visu plauktu.',
  'free.showMore': 'Rādīt vairāk',
  'free.shown': 'Rāda {shown} no {total}.',
  'free.allLanguages': 'Bezmaksas eksemplāri visās valodās.',
  'free.filteredByLanguage': 'Tikai bezmaksas eksemplāri valodā {language}.',
  'free.filterByLanguage': 'Rādīt tikai bezmaksas eksemplārus valodā {language}.',
  'free.dropLanguageFilter': 'rādīt visas valodas',
  'free.loadFailed': 'Bezmaksas grāmatas šobrīd neizdevās ielādēt.',
  'work.original': 'oriģināls',
  'work.dataSources': 'Datu avoti',
  'work.about': 'Par šo grāmatu',
  'work.translatedInto': 'Tulkota valodās',
  'work.availableIn': 'Pieejama valodās',
  'work.languagesNote':
    'Tikai tas, ko uzskaita mūsu lasītie avoti — tulkojums, kura šeit nav, tomēr var pastāvēt.',
  'work.noTranslations': 'Tulkojumi vēl nav atrasti.',
  'work.yourLanguage.title': 'Jūsu valodā',
  'work.yourLanguage.yes': 'Tulkojums valodā {language} pastāv.',
  'work.yourLanguage.original': 'Šī grāmata sarakstīta valodā {language}.',
  'work.yourLanguage.no': 'Starp šeit zināmajiem izdevumiem nav tulkojuma valodā {language}.',
  'work.yourLanguage.show': 'Rādīt izdevumus valodā {language}',
  'work.editions': 'Izdevumi ({shown} no {total})',
  'work.filterLanguage': 'Valoda',
  'work.filterAllLanguages': 'Visas valodas',
  'work.filterYear': 'Gads',
  'work.filterApply': 'Filtrēt',
  'work.filterReset': 'Atiestatīt',
  'work.noEditionsMatch': 'Šiem filtriem neatbilst neviens izdevums.',
  'work.showMoreEditions': 'Rādīt vairāk izdevumu (atlikuši {remaining})',
  'work.badgeFreeDownload': 'bezmaksas lejupielāde',
  'work.freeDownloadFormat': 'Lejupielādēt {format}',
  'work.freeDownloadNote': '{rights}. Bez maksas no {provider} — bez konta, bez samaksas.',
  'work.badgeReadBorrow': 'lasīt vai aizņemties',
  'work.badgeInBookstores': 'grāmatnīcās',
  'work.translatedBy': 'tulkojis(-usi) {name}',
  'work.pages': '{count} lpp.',
  'bookmark.save': 'Saglabāt šo grāmatu',
  'bookmark.saved': 'Saglabāta',
  'bookmark.signInToSave': 'Piesakieties, lai saglabātu',
  'bookmark.failed': 'Neizdevās saglabāt. Mēģiniet vēlreiz.',
  'links.show': 'Rādīt saites',
  'links.hide': 'Slēpt saites',
  'links.loading': 'Ielādē saites',
  'links.none': 'Šim izdevumam vēl nav likumīgu saišu.',
  'links.viaOtherEdition': 'bezmaksas eksemplārs no izdevuma {label}',
  'links.failed': 'Saites neizdevās ielādēt.',
  'links.storesHeading': 'Atrast grāmatnīcā',
  'links.storesInCountry': 'Valstī {country}',
  'links.storesYourCountry': 'jūsu valsts',
  'links.storesLanguageMarket': 'Kur pārdod grāmatas valodā {language}',
  'links.storesLanguageMarketGeneric': 'Kur pārdod šī izdevuma valodu',
  'links.storesWorldwide': 'Piegādā visā pasaulē',
  'links.storesCaption':
    'Katra saite meklē pašas grāmatnīcas katalogā — pieejamību un cenu rāda pati grāmatnīca.',
  'linkType.download': 'Lejupielādēt',
  'linkType.buy': 'Pirkt',
  'linkType.borrow': 'Aizņemties bibliotēkā',
  'linkType.listen': 'Klausīties (audiogrāmata)',
  'rights.public_domain': 'Publiskais īpašums',
  'rights.open_license': 'Atvērta licence',
  'rights.copyrighted': 'Aizsargāta ar autortiesībām',
  'rights.unknown': 'Statuss nezināms',
  'compare.heading': 'Salīdzināt izdevumus',
  'compare.blurb': 'Izvēlieties divus vai trīs izdevumus, lai redzētu, kas patiesībā atšķiras.',
  'compare.selected': 'Izvēlēti {count}, vajadzīgi vismaz 2.',
  'compare.editSelection': 'Mainīt izdevumus',
  'compare.showAllEditions': 'Rādīt visus {count} izdevumus',
  'compare.columnDifference': 'Atšķirība',
  'compare.identical': 'Visā, ko avoti fiksē, šie izdevumi ir vienādi.',
  'compare.rowLanguage': 'Valoda',
  'compare.rowPublished': 'Izdošanas gads',
  'compare.rowPublisher': 'Izdevniecība',
  'compare.rowTranslator': 'Tulkotājs',
  'compare.rowTranslatedFrom': 'Tulkots no',
  'compare.rowBinding': 'Iesējums',
  'compare.rowPages': 'Lappuses',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Bezmaksas vai aizņemams eksemplārs',
  'compare.yes': 'jā ({count})',
  'compare.no': 'nav atrasts',
  'country.label': 'Kur jūs pērkat grāmatas?',
  'country.worldwideOnly': 'Tikai veikali ar piegādi visā pasaulē',
  'auth.signInTitle': 'Pieteikšanās',
  'auth.registerTitle': 'Izveidot kontu',
  'auth.blurb':
    'Kontam ir viens mērķis: saglabāt atrastās grāmatas un atgriezties pie tām — ar valodām, kurās tās tulkotas, ar esošajiem izdevumiem un ar to, kur katru iegūt likumīgi. Nekādu jaunumu vēstuļu, nekāda profila, nekādas izsekošanas.',
  'auth.name': 'Vārds (nav obligāts)',
  'auth.email': 'E-pasts',
  'auth.password': 'Parole',
  'auth.passwordHint':
    'Vismaz {min} rakstzīmes. Pārbauda tikai garumu — gara frāze, ko atceraties, ir labāka nekā īsa ar pieturzīmēm.',
  'auth.submitSignIn': 'Pieteikties',
  'auth.submitRegister': 'Izveidot kontu',
  'auth.working': 'Strādājam…',
  'auth.google': 'Turpināt ar Google',
  'auth.toRegister': 'Vēl nav konta? Izveidojiet to',
  'auth.toSignIn': 'Jau ir konts? Piesakieties',
  'auth.backToSearch': 'Atpakaļ uz meklēšanu',
  'auth.errorGoogleState':
    'Šī pieteikšanās saite beigusies vai tika atvērta citā pārlūkā. Mēģiniet vēlreiz.',
  'auth.errorGoogleFailed':
    'Pieteikšanās ar Google netika pabeigta. Tā vietā varat izmantot e-pastu un paroli.',
  'auth.errorGeneric': 'Kaut kas nogāja greizi.',
  'bookmarks.title': 'Saglabātās grāmatas',
  'bookmarks.signedOut':
    'lai paturētu atrastās grāmatas — un lai vēlāk blakus salīdzinātu vienas un tās pašas grāmatas izdevumus.',
  'bookmarks.loading': 'Ielādē…',
  'bookmarks.empty':
    'Vēl nekas nav saglabāts. Atrodiet grāmatu un tās kartītē izmantojiet „Saglabāt šo grāmatu”.',
  'bookmarks.searchLink': 'Meklēt',
  'bookmarks.remove': 'Noņemt',
  'bookmarks.loadFailed': 'Jūsu saglabātās grāmatas neizdevās ielādēt.',
  'search.failed': 'Meklēšana neizdevās.',
  'search.pending': 'Mūsu datubāzē vēl nav — pārbaudām avotus',
  'search.pendingLong':
    'Vēl meklējam: pirmais pieprasījums par grāmatu vāc datus no avotiem, kas var aizņemt līdz pāris minūtēm',
  'search.notFoundHint': 'Nekas netika atrasts. Mēģiniet precizēt nosaukumu vai autoru.',
  'search.timedOut':
    'Avoti atbild lēni, un datu vēl nav. Fona sinhronizācija varbūt jau beigusies — mēģiniet vēlreiz.',
  'search.freeOnlyToggle': 'Bez maksas lejupielādējams',
  'search.noFreeResults':
    'Nevienai no tām vēl nav bezmaksas lejupielādes — pamēģiniet izslēgt filtru.',
  'home.tagline': 'Atrodiet savu nākamo magnum opus',
  'subject.allLanguages': 'Visas valodas.',
  'subject.filteredByLanguage': 'Tikai grāmatas ar izdevumu valodā {language}.',
  'subject.dropLanguageFilter': 'rādīt visas valodas',
  'subject.empty':
    'Zem šī birkas vēl nekā nav. Birkas nāk no grāmatām, ko šī instance jau ielādējusi.',
  'featured.year': '{year}',
  'nav.browse': 'Pārlūkot pēc žanra',
  'recommend.heading': 'Balstoties uz to, ko esat lasījis',
  'recommend.becauseOf': 'Jūs atvērāt „{title}”, tāpēc lūk grāmatas no tiem pašiem žanriem.',
  'recommend.blurb': 'Grāmatas no žanriem, kurus atverat.',
  'recommend.privacy':
    'Tas tiek aprēķināts jūsu pārlūkā — serverim tiek pateikti žanri, nekad tas, kas jūs esat.',
  'recommend.forget': 'aizmirst manu vēsturi',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Plaukts',
  'shelf.title': 'Plaukts',
  'shelf.intro':
    'Atvērti katalogi un jebkurš bibliotēkas serveris, ko uzturat pats. Pievienotie katalogi paliek šajā pārlūkā un nekad netiek nosūtīti uz šo vietni.',
  'shelf.openCatalogs': 'Atvērtie katalogi',
  'shelf.yourCatalogs': 'Jūsu katalogi',
  'shelf.addCatalog': 'Pievienot katalogu',
  'shelf.name': 'Nosaukums',
  'shelf.address': 'OPDS adrese',
  'shelf.username': 'Lietotājvārds (nav obligāts)',
  'shelf.password': 'Parole (nav obligāta)',
  'shelf.credentialsNote': 'Adrese un jebkuri piekļuves dati tiek glabāti tikai šajā pārlūkā.',
  'shelf.add': 'Pievienot',
  'shelf.remove': 'Noņemt',
  'shelf.loading': 'Ielādē katalogu…',
  'shelf.empty': 'Šajā katalogā nav ierakstu.',
  'shelf.noCatalogs':
    'Sava vēl nav neviena. Zemāk pievienojiet Calibre-Web, COPS, Kavita vai Audiobookshelf adresi.',
  'shelf.unreachable':
    'Jūsu pārlūks nespēja nolasīt šo katalogu. Serveris jūsu paša tīklā darbosies; publiskas vietnes bieži atsaka pieprasījumus no citas izcelsmes.',
  'shelf.nextPage': 'Nākamā lapa',
  'shelf.previousPage': 'Iepriekšējā lapa',
  'shelf.drm': 'Nepieciešama DRM lietotne',
  'shelf.notFree': 'Nav bezmaksas lejupielāde',
  'shelf.download': 'Lejupielādēt',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Grāmatnīcas jūsu tuvumā',
  'stores.useMyLocation': 'Izmantot manu atrašanās vietu',
  'stores.placeLabel': 'Pilsēta vai pasta indekss',
  'stores.find': 'Atrast',
  'stores.locating': 'Meklējam…',
  'stores.failed': 'Atrašanās vieta nav pieejama. Ierakstiet pilsētu vai pasta indeksu.',
  'stores.none': '{radius} km rādiusā kartē nav nevienas grāmatnīcas.',
  'stores.distance': '{distance} km attālumā',
  'stores.stockUnknown': 'Tikai kartes dati — neviens nepublicē, kas veikalam ir noliktavā.',
  'stores.lookupFailed': 'Šobrīd neizdevās sazvanīt OpenStreetMap. Mēģiniet pēc brīža vēlreiz.',
  'stores.privacy':
    'Jūsu atrašanās vieta tiek noapaļota līdz aptuveni 100 m un nosūtīta tikai OpenStreetMap — nekad uz šo vietni.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Cenas un veikali',
  'prices.loading': 'Jautājam veikaliem…',
  'prices.unknown': 'Cena nav publicēta',
  'prices.degraded': 'Nav atbildes no: {providers}',
  'prices.format.hardcover': 'Cietos vākos',
  'prices.format.paperback': 'Mīkstos vākos',
  'prices.format.ebook': 'E-grāmata',
  'prices.format.audiobook': 'Audiogrāmata',
  'prices.format.unknown': 'Formāts nav norādīts',
  'recommend.hideGenre': 'slēpt „{genre}”',
  'recommend.hiddenList': 'Slēptie žanri (uzklikšķiniet, lai atgrieztu kādu):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Saglabāts',
  'settings.status.cleared': 'Notīrīts',
  'settings.status.unstored': 'Nav saglabāts',
  'settings.status.failed': 'Bez izmaiņām',
  'settings.notStored':
    'Šis pārlūks atteicās saglabāt izmaiņu, tāpēc nekas nenotika — joprojām ir spēkā iepriekšējā vērtība.',
  'settings.language.title': 'Saskarnes valoda',
  'settings.language.changed':
    'Mainīta no {from} uz {to}. Saskarne tiek pārlādēta valodā {to}; grāmatu nosaukumi un autoru vārdi paliek savās valodās.',
  'settings.country.title': 'Pirkšanas valsts',
  'settings.country.changed':
    'Iestatīts: {country}. Grāmatnīcu saites tagad piedāvā veikalus, kas piegādā turp, līdzās starptautiskajiem.',
  'settings.country.cleared':
    'Valsts nav izvēlēta. Tiks piedāvātas tikai grāmatnīcas, kas piegādā visā pasaulē.',
  'settings.bookLanguage.title': 'Grāmatu valoda',
  'settings.bookLanguage.changed':
    'Iestatīts: {language}. Žanru lapas vispirms rādīs grāmatas ar izdevumu valodā {language}, līdz atiestatīsiet filtru.',
  'settings.bookLanguage.cleared': 'Notīrīts. Žanru lapas atkal rāda grāmatas visās valodās.',
  'settings.hiddenGenres.title': 'Slēptie žanri',
  'settings.hiddenGenres.hidden':
    'Žanrs „{genre}” ir paslēpts. Ieteikumu ielādē tas vairs netiek sūtīts serverim, un kopā slēpti ir {count} žanri.',
  'settings.hiddenGenres.restored':
    'Žanrs „{genre}” ir atgriezies jūsu ieteikumos. Slēpti paliek {count} žanri.',
  'settings.history.title': 'Lasīšanas vēsture',
  'settings.history.cleared':
    'Jūsu atvērtās grāmatas ir izdzēstas no šī pārlūka. Ieteikumi neparādīsies, līdz atvērsiet nākamo grāmatu.',
  'settings.bookmarks.title': 'Saglabātās grāmatas',
  'settings.bookmarks.added': '„{title}” pievienota jūsu saglabātajām grāmatām.',
  'settings.bookmarks.removed': '„{title}” noņemta no jūsu saglabātajām grāmatām.',
  'settings.bookmarks.failed':
    'Serveris izmaiņu nepieņēma, tāpēc jūsu saglabātās grāmatas palika, kā bija.',
  'settings.catalogs.title': 'Jūsu katalogi',
  'settings.catalogs.added':
    '„{name}” pievienots adresē {url}. Adrese paliek šajā pārlūkā un nekad netiek nosūtīta uz šo vietni.',
  'settings.catalogs.addedWithCredentials':
    '„{name}” pievienots adresē {url} kopā ar ievadīto lietotājvārdu un paroli. Viss paliek šajā pārlūkā, un nekas no tā netiek nosūtīts uz šo vietni.',
  'settings.catalogs.removed':
    '„{name}” noņemts no šī pārlūka kopā ar visiem tam glabātajiem piekļuves datiem.',
  'settings.catalogs.rejected': 'Nekas netika pievienots: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Papildinājumi',
  'addons.title': 'Papildinājumi',
  'addons.intro':
    'Papildinājums pievieno savus avotus. To uzstāda, ielīmējot tā adresi; tas darbojas vai nu jūsu ierīcē smilškastē, vai sava autora serverī. Golden Library nevienu nepiegādā, nevienu neuzskaita un nepārbauda, ko tie atgriež.',
  'addons.addressLabel': 'Papildinājuma adrese',
  'addons.addressHint': 'Manifesta URL, ko jums iedeva papildinājuma autors.',
  'addons.continue': 'Turpināt',
  'addons.fromServer': 'No servera',
  'addons.fromFile': 'No faila jūsu ierīcē',
  'addons.bundleLabel': 'Papildinājuma koda adrese',
  'addons.bundleHint': 'Papildinājuma koda URL. Tas darbosies šajā ierīcē, nevis serverī.',
  'addons.integrityLabel': 'Integritātes jaucējkods',
  'addons.integrityHint':
    'To dod papildinājuma autors formā sha256-… . Obligāts: bez tā reiz apstiprināts kods vēlāk varētu mainīties, un jūs to nekad neuzzinātu.',
  'addons.checking': 'Lasām papildinājumu…',
  'addons.installedHeading': 'Uzstādītie',
  'addons.none':
    'Papildinājumu vēl nav. Viss, kas šajā vietnē redzams līdz šim, nāk no pašas instances.',
  'addons.priorityHint': 'Secība ir prioritāte: pirmais papildinājums atbild pirmais.',
  'addons.enable': 'Ieslēgt',
  'addons.disable': 'Izslēgt',
  'addons.off': 'Izslēgts',
  'addons.remove': 'Noņemt',
  'addons.moveUp': 'Pārvietot augšup',
  'addons.moveDown': 'Pārvietot lejup',
  'addons.configure': 'Konfigurēt',
  'addons.failedToStart': '„{name}” nesāka darboties: {reason}',
  'addons.consentTitle': 'Uzstādīt „{name}”?',
  'addons.consentHosts': 'Tas sazināsies ar: {hosts}',
  'addons.consentNoHosts': 'Tas nav lūdzis sazināties ne ar ko.',
  'addons.consentSeesYou':
    'Šis papildinājums darbojas sava autora serverī. Autors redzēs jūsu adresi un visu, ko caur to meklējat.',
  'addons.consentSandboxed':
    'Šis papildinājums darbojas jūsu ierīcē smilškastē. Tas nevar nolasīt jūsu sīkdatnes, šīs vietnes datus vai ko citu, kas jums atvērts.',
  'addons.consentNotVetted':
    'Golden Library nepārbauda, ko papildinājums atgriež, un šo neieteica. Ko uzstādāt, ir jūsu izvēle.',
  'addons.install': 'Uzstādīt',
  'addons.cancel': 'Atcelt',
  'addons.via': 'caur {name}',
  'addons.sourcesTitle': 'No jūsu papildinājumiem',
  'addons.searchTitle': 'Atrasts ar jūsu papildinājumiem',
  'addons.showLinks': 'Rādīt lejupielādes saites',
  'addons.unreadable': 'No šī papildinājuma neizdevās nolasīt {count} ierakstus.',
  'addons.browse': 'Pārlūkot katalogu',
  'addons.browseTitle': 'Papildinājuma {name} katalogs',
  'addons.browseNoCatalog': 'Šis papildinājums nepiedāvā pārlūkojamu katalogu.',
  'addons.browseEmpty': 'Šī papildinājuma katalogs pašlaik ir tukšs.',
  'addons.browseFailed': 'Papildinājuma „{name}” katalogu neizdevās ielādēt: {reason}',
  'addons.loadMore': 'Ielādēt vairāk',
  'addons.notInstalled': 'Šis papildinājums nav uzstādīts.',

  'settings.addons.title': 'Jūsu papildinājumi',
  'settings.addons.installed':
    '„{name}” ir uzstādīts. Tam jautās līdzās pārējiem, un tas var sazināties ar {hosts}.',
  'settings.addons.removed':
    '„{name}” noņemts. Tā rezultāti no šī pārlūka ir pazuduši, tāpat kā viss, ko tas šeit bija saglabājis.',
  'settings.addons.enabled': '„{name}” atkal ir ieslēgts, un tam jautās kopā ar pārējiem.',
  'settings.addons.disabled':
    '„{name}” ir izslēgts. Tas paliek uzstādīts ar saviem iestatījumiem, taču nekas no tā atgrieztā netiks rādīts.',
  'settings.addons.reordered': '„{name}” tagad atbild kā {position}. no {total}.',
  'settings.addons.rejected': 'Nekas netika uzstādīts: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Savi avoti',
  'customSources.title': 'Savi avoti',
  'customSources.intro':
    'Pievienojiet savu veikalu vai katalogu, dodot tam nosaukumu un meklēšanas URL ar {isbn}, {query}, {title}, {author} vai {language}. Saite tiek izveidota šajā ierīcē, un šī vietne to nekad neizsauc.',
  'customSources.nameLabel': 'Nosaukums',
  'customSources.templateLabel': 'URL veidne',
  'customSources.templateHint':
    'Absolūta https:// adrese. {isbn}, {query}, {title}, {author} un {language} tiek aizpildīti no izdevuma; tukšs vietturis nozīmē, ka šim izdevumam saite tiek izlaista.',
  'customSources.add': 'Pievienot avotu',
  'customSources.listHeading': 'Jūsu avoti',
  'customSources.none': 'Savu avotu vēl nav.',
  'customSources.off': 'Izslēgts',
  'customSources.enable': 'Ieslēgt',
  'customSources.disable': 'Izslēgt',
  'customSources.remove': 'Noņemt',
  'customSources.heading': 'Jūsu avoti',
  'customSources.caption': 'Saites, ko iestatījāt pats. Šī instance nepārbauda, kurp tās ved.',

  'settings.customSources.title': 'Jūsu paša avoti',
  'settings.customSources.added': '„{name}” pievienots un tiks piedāvāts līdzās pārējiem.',
  'settings.customSources.removed': '„{name}” noņemts no šī pārlūka.',
  'settings.customSources.enabled': '„{name}” atkal ir ieslēgts.',
  'settings.customSources.disabled':
    '„{name}” ir izslēgts. Tas paliek konfigurēts, bet tā saite netiks rādīta.',
  'settings.customSources.rejected': 'Nekas netika pievienots: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Grāmatas jūsu valodā',
  'featured.inLanguageBlurb':
    'Grāmatas, kas sarakstītas valodā, kurā lasāt šo vietni, vispirms visvairāk izdotās — tā ir pašas Open Library kārtība, nevis bestselleru tops.',
  'work.newSearch': 'Jauna meklēšana',
  'work.descriptionFrom': 'Apraksts:',
  'work.descriptionNotLocalized':
    'Šis apraksts ir valodā, kurā to rakstīja avots — jūsu valodā šai grāmatai tāda vēl nav.',

  // Reader ratings of an edition, never of a translation — see TranslationRatings.tsx.
  'ratings.edition': '{average} no {outOf}, {votes} lasītāju vietnē {source}',
  'ratings.lowConfidence': 'par maz balsu, lai salīdzinātu',
  'ratings.reviews': 'Atsauksmes',
  'ratings.reviewsOn': 'Šī izdevuma atsauksmes vietnē {source}',
  'ratings.noteNoRatings':
    'Neviens atvērtais avots nevērtē tulkojumu, un nevienam no šiem metieniem šeit nav lasītāju vērtējuma.',
  'ratings.noteReviews':
    'Kur izdevums ir zināms vietnē {sources}, saite ved uz tieši tā metiena atsauksmēm — vairums izdevumu nav zināmi.',
  'ratings.translator':
    'Izdevumi {name} tulkojumā: {average} no {outOf} pāri {editions} vērtētiem izdevumiem, kopā {votes} lasītāju.',
  'ratings.note':
    'Šie ir lasītāju vērtējumi konkrētam izdevumam vietnē {sources}, nevis paša tulkojuma novērtējums — tādu neviens nepublicē. Tos vērts lasīt blakus: tā pati grāmata, tā pati valoda, dažādi tulkotāji, un vienmēr ar balsu skaitu acu priekšā.',
  'ratings.gapWithoutIsbn':
    '{count} šejienes izdevumiem nav ISBN, tāpēc tiem nevarēja piesaistīt nevienu vērtējumu.',
  'ratings.gapNotLookedUp': 'Vēl {count} izdevumi šajā pieprasījumā netika pārbaudīti.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Lasiet savā pārlūkā',
  'reader.privacy':
    'Jūsu pārlūks atver šo grāmatu pats. Fails, vieta, no kuras tas nāca, un tas, cik tālu esat izlasījis, nekad nenonāk šajā vietnē.',
  'reader.chooseFile': 'Atvērt grāmatu no šīs ierīces',
  'reader.formats': 'EPUB, FB2, MOBI un CBZ.',
  'reader.loading': 'Atver…',
  'reader.failed': 'Šo grāmatu neizdevās atvērt: {reason}',
  'reader.previous': 'Iepriekšējā lapa',
  'reader.next': 'Nākamā lapa',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…vai nometiet grāmatu šeit',
  'reader.fetching': 'Pieprasa failu no {host}…',
  'reader.blockedTitle': '{host} neatdeva failu šai lapai',
  'reader.blockedBody':
    'Vai nu tas nav sasniedzams, vai arī neļauj citām vietnēm lasīt savus failus. Šī vietne to jūsu vietā neielādēs: jūsu grāmata caur to nekad neiet, un tieši tāda ir šeit lasīšanas jēga.',
  'reader.blockedDownload': 'Lejupielādējiet to no {host}',
  'reader.blockedOpenHere': 'un tad atveriet to šeit no savas ierīces',
  'reader.blockedAddon': 'Der arī papildinājums, kas pats piegādā failu.',
  'reader.keepFile': 'Paturēt šo grāmatu šajā pārlūkā',
  'reader.keepFileHint':
    'Pēc noklusējuma izslēgts. Bez tā fails pazūd, tiklīdz aizverat cilni; ar to tas paliek tikai šajā ierīcē.',
  'reader.library': 'Paturēts šajā pārlūkā',
  'reader.libraryEmpty':
    'Vēl nekas nav paturēts. Grāmatas, ko paturat, paliek šajā ierīcē un nekad netiek nekur augšupielādētas.',
  'reader.libraryOpen': 'Atvērt',
  'reader.libraryRemove': 'Noņemt',
  'reader.libraryFileKept': 'fails paturēts',
  'reader.libraryFileGone': 'fails nav paturēts',
  'reader.untitled': 'Grāmata bez nosaukuma',
  'settings.reader.libraryTitle': 'Šajā pārlūkā paturētās grāmatas',
  'settings.reader.kept':
    '„{title}” tagad tiek paturēta šajā ierīcē, tāpēc atveras bez atkārtotas lejupielādes. Tā nekur netiek augšupielādēta.',
  'settings.reader.forgotten':
    'Grāmatas „{title}” fails tika izdzēsts no šī pārlūka. Ieraksts paliek sarakstā, tāpēc varat to atkal atvērt no tās avota.',
  'settings.reader.removed':
    '„{title}” tika pilnībā noņemta no šī pārlūka — gan fails, gan ieraksts.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Atvērta tur, kur beidzāt — {percent}% vietā.',
  'reader.bookmarks': 'Grāmatzīmes',
  'reader.bookmarkAdd': 'Ielikt grāmatzīmi šajā lapā',
  'reader.bookmarkNone': 'Šajā grāmatā vēl nav grāmatzīmju.',
  'reader.bookmarkGo': 'Pāriet',
  'reader.bookmarkRemove': 'Noņemt grāmatzīmi',
  'reader.bookmarkNote': 'Piezīme',
  'reader.bookmarkNotePlaceholder': 'Jūsu pašu vārdi par šo lapu',
  'reader.bookmarkAt': '{percent}% vietā',
  'settings.reader.bookmarkTitle': 'Grāmatzīmes šajā pārlūkā',
  'settings.reader.bookmarkAdded':
    'Grāmatzīme grāmatas „{title}” {percent}% vietā. Grāmatzīmes paliek šajā ierīcē kopā ar grāmatu.',
  'settings.reader.bookmarkRemoved': 'Tā grāmatzīme grāmatā „{title}” tika noņemta no šī pārlūka.',
  'settings.reader.noteSaved':
    'Jūsu piezīme šajā grāmatas „{title}” lapā tika saglabāta šajā ierīcē.',
  'settings.reader.positionTitle': 'Lasīšanas vieta',
  'settings.reader.positionUnstored':
    'Šis pārlūks neglabāja, kur esat grāmatā „{title}”, tāpēc nākamreiz tā atvērsies no sākuma. Tā dara gan privātais režīms, gan pilns disks.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': 'Kā šī grāmata izskatās',
  'reader.theme': 'Krāsas',
  'reader.themeApp': 'Kā vietnē',
  'reader.themeLight': 'Papīrs',
  'reader.themeDark': 'Tinte',
  'reader.themeSepia': 'Sēpija',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint':
    'Tīri melns uz balta, bez animācijas, viena sleja — elektroniskā papīra ekrāniem.',
  'reader.fontSize': 'Burtu lielums',
  'reader.smaller': 'Mazāks',
  'reader.larger': 'Lielāks',
  'reader.lineHeight': 'Rindstarpa',
  'reader.margin': 'Malas',
  'reader.flow': 'Lapas',
  'reader.flowPaged': 'Šķirstīt',
  'reader.flowScrolled': 'Ritināt',
  'reader.justify': 'Izlīdzināt abās malās',
  'reader.hyphenate': 'Vārdu pārnese',
  'reader.displayReset': 'Atpakaļ uz noklusējumu',
  'settings.reader.displayTitle': 'Lasīšanas izskats',
  'settings.reader.displayChanged':
    '{setting} tagad ir {value}. Tas attiecas uz katru grāmatu, ko atverat šajā pārlūkā.',
  'settings.reader.displayReset':
    'Lasīšanas izskats šajā pārlūkā ir atgriezts noklusējumā visām grāmatām.',
  'reader.on': 'Ieslēgts',
  'reader.off': 'Izslēgts',
  'reader.openHere': 'Lasiet savā pārlūkā',
  'reader.notAFileTitle': '{host} atsūtīja tīmekļa lapu, nevis failu',
  'reader.notAFileBody':
    'Saite ved uz lapu, nevis uz grāmatu — lejupielādes lapu, piekrišanas ekrānu vai pārbaudi, ka neesat robots. Atveriet to pats, un fails tur būs.',
  'settings.status.session': 'Neatcerējās',
  'settings.notRemembered':
    'Šis pārlūks to neatcerējās, tāpēc nākamreiz, kad atvērsiet grāmatu, viss būs kā iepriekš.',
};
