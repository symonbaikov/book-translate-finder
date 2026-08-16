import type { Dictionary } from '../dictionary';

export const is: Dictionary = {
  'nav.savedBooks': 'Vistaðar bækur',
  'nav.signIn': 'Skrá inn',
  'nav.signOut': 'Skrá út',
  'nav.language': 'Tungumál',
  'nav.skipToContent': 'Fara í efnið',
  'footer.legal':
    'Eingöngu löglegar heimildir: bein niðurhal aðeins fyrir verk í almenningseign og með opnum leyfum; höfundarréttarvarðar bækur — kaup eða útlán á bókasafni. Hver hlekkur ber skýra réttarstöðu.',
  'footer.openSource': 'Opinn hugbúnaður',
  'footer.openSourceRest': '— með MIT-leyfi, hægt að hýsa sjálf. Kóðinn er á GitHub.',
  'home.title': 'Golden Library',
  'home.subtitle': 'Opið safn um bókaþýðingar: tungumál, útgáfur og löglegar heimildir.',
  'home.searchLabel': 'Titill og höfundur',
  'home.searchPlaceholder': 'Stríð og friður Tolstoj',
  'home.searchButton': 'Leita',
  'search.searching': 'Leita…',
  'search.backfilling':
    'Ekkert hér enn — við sækjum bókina í heimildirnar. Það tekur nokkrar sekúndur.',
  'search.notFound': 'Ekkert fannst fyrir þessa leit.',
  'search.retry': 'Reyna aftur',
  'search.signInPrompt':
    'til að vista bækurnar sem þú finnur hér og koma aftur að þeim — og til að bera saman útgáfur frá ólíkum árum hlið við hlið áður en þú velur.',
  'featured.yearHeading': 'Bækur ársins',
  'featured.yearBlurb':
    'Eftirtektarverðar bækur frá hverju síðustu ára. Handvalinn listi, ekki sölulisti — engin opin heimild gefur slíkan út.',
  'featured.popularHeading': 'Mikið lesnar, mikið þýddar',
  'featured.popularBlurb':
    'Bækur sem til eru á mörgum tungumálum — sem er einmitt tilgangur þessa vefs.',
  'featured.filling':
    'Nokkrar þeirra eru enn sóttar í bakgrunni. Endurhlaðið eftir mínútu til að sjá afganginn.',
  'featured.freeCopy': 'Ókeypis eintak',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Ókeypis að lesa strax',
  'free.homeBlurb':
    'Bækur í almenningseign og með opnu leyfi sem þetta eintak vefsins getur rétt þér beint.',
  'free.seeAll': 'Sjá fleiri',
  'free.downloadable': 'Sækja',
  'free.pageTitle': 'Ókeypis bækur',
  'free.pageBlurb':
    'Hver bók hér á að minnsta kosti eitt löglegt ókeypis eintak — í almenningseign eða gefið af rétthafa. Engin kaup, ekkert bókasafnsskírteini.',
  'free.empty':
    'Ekkert ókeypis hér enn. Ókeypis eintök birtast eftir því sem þetta tilvik sækir bækur, svo leitaðu að einni og komdu aftur.',
  'free.emptyForLanguage':
    'Engin ókeypis eintök á {language} enn. Fjarlægðu síuna hér að ofan til að sjá alla hilluna.',
  'free.showMore': 'Sýna fleiri',
  'free.shown': 'Sýni {shown} af {total}.',
  'free.allLanguages': 'Ókeypis eintök á öllum tungumálum.',
  'free.filteredByLanguage': 'Aðeins ókeypis eintök á {language}.',
  'free.filterByLanguage': 'Sýna aðeins ókeypis eintökin á {language}.',
  'free.dropLanguageFilter': 'sýna öll tungumál',
  'free.loadFailed': 'Ekki tókst að sækja ókeypis bækurnar í augnablikinu.',
  'work.original': 'frumtexti',
  'work.dataSources': 'Gagnaheimildir',
  'work.about': 'Um þessa bók',
  'work.translatedInto': 'Þýtt á',
  'work.availableIn': 'Fáanlegt á',
  'work.languagesNote':
    'Aðeins það sem heimildirnar okkar telja upp — þýðing sem vantar hér gæti samt verið til.',
  'work.noTranslations': 'Engar þýðingar fundust enn.',
  'work.yourLanguage.title': 'Á þínu tungumáli',
  'work.yourLanguage.yes': 'Til er þýðing á {language}.',
  'work.yourLanguage.original': 'Þessi bók var skrifuð á {language}.',
  'work.yourLanguage.no': 'Engin þýðing á {language} meðal þeirra útgáfa sem hér eru þekktar.',
  'work.yourLanguage.show': 'Sýna útgáfur á {language}',
  'work.editions': 'Útgáfur ({shown} af {total})',
  'work.filterLanguage': 'Tungumál',
  'work.filterAllLanguages': 'Öll tungumál',
  'work.filterYear': 'Ár',
  'work.filterApply': 'Sía',
  'work.filterReset': 'Núllstilla',
  'work.noEditionsMatch': 'Engar útgáfur passa við þessar síur.',
  'work.showMoreEditions': 'Sýna fleiri útgáfur ({remaining} eftir)',
  'work.badgeFreeDownload': 'ókeypis niðurhal',
  'work.freeDownloadFormat': 'Sækja {format}',
  'work.freeDownloadNote': '{rights}. Ókeypis frá {provider} — enginn aðgangur, engin greiðsla.',
  'work.badgeReadBorrow': 'lesa eða fá lánað',
  'work.badgeInBookstores': 'í bókabúðum',
  'work.translatedBy': 'þýtt af {name}',
  'work.pages': '{count} blaðsíður',
  'bookmark.save': 'Vista þessa bók',
  'bookmark.saved': 'Vistað',
  'bookmark.signInToSave': 'Skráðu þig inn til að vista',
  'bookmark.failed': 'Ekki tókst að vista. Reyndu aftur.',
  'links.show': 'Sýna hlekki',
  'links.hide': 'Fela hlekki',
  'links.loading': 'Sæki hlekki',
  'links.none': 'Engir löglegir hlekkir fyrir þessa útgáfu enn.',
  'links.viaOtherEdition': 'ókeypis eintak úr útgáfunni {label}',
  'links.failed': 'Ekki tókst að sækja hlekkina.',
  'links.storesHeading': 'Finna í bókabúð',
  'links.storesInCountry': 'Í {country}',
  'links.storesYourCountry': 'landinu þínu',
  'links.storesLanguageMarket': 'Þar sem bækur á {language} eru seldar',
  'links.storesLanguageMarketGeneric': 'Þar sem tungumál þessarar útgáfu er selt',
  'links.storesWorldwide': 'Sendir um allan heim',
  'links.storesCaption':
    'Hver hlekkur leitar í skrá búðarinnar sjálfrar — framboð og verð birtir búðin sjálf.',
  'linkType.download': 'Sækja',
  'linkType.buy': 'Kaupa',
  'linkType.borrow': 'Fá lánað á bókasafni',
  'linkType.listen': 'Hlusta (hljóðbók)',
  'rights.public_domain': 'Almenningseign',
  'rights.open_license': 'Opið leyfi',
  'rights.copyrighted': 'Höfundarréttarvarið',
  'rights.unknown': 'Staða óþekkt',
  'compare.heading': 'Bera saman útgáfur',
  'compare.blurb': 'Veldu tvær eða þrjár útgáfur til að sjá hvað raunverulega skilur þær að.',
  'compare.selected': 'Valdar {count} af að minnsta kosti 2.',
  'compare.editSelection': 'Breyta útgáfum',
  'compare.showAllEditions': 'Sýna allar {count} útgáfurnar',
  'compare.columnDifference': 'Munur',
  'compare.identical': 'Þessar útgáfur eru eins í öllu sem heimildirnar skrá.',
  'compare.rowLanguage': 'Tungumál',
  'compare.rowPublished': 'Útgáfuár',
  'compare.rowPublisher': 'Útgefandi',
  'compare.rowTranslator': 'Þýðandi',
  'compare.rowTranslatedFrom': 'Þýtt úr',
  'compare.rowBinding': 'Band',
  'compare.rowPages': 'Blaðsíður',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Ókeypis eintak eða til útláns',
  'compare.yes': 'já ({count})',
  'compare.no': 'fannst ekki',
  'country.label': 'Hvar kaupir þú bækur?',
  'country.worldwideOnly': 'Aðeins búðir sem senda um allan heim',
  'auth.signInTitle': 'Skrá inn',
  'auth.registerTitle': 'Stofna aðgang',
  'auth.blurb':
    'Aðgangur er til af einni ástæðu: að vista bækur sem þú finnur og koma aftur að þeim — með tungumálunum sem þær voru þýddar á, útgáfunum sem til eru og hvar má nálgast hverja þeirra löglega. Ekkert fréttabréf, engin persónusnið, engin rakning.',
  'auth.name': 'Nafn (valfrjálst)',
  'auth.email': 'Netfang',
  'auth.password': 'Lykilorð',
  'auth.passwordHint':
    'Að minnsta kosti {min} stafir. Aðeins lengdin er athuguð — löng setning sem þú manst er betri en stutt með greinarmerkjum.',
  'auth.submitSignIn': 'Skrá inn',
  'auth.submitRegister': 'Stofna aðgang',
  'auth.working': 'Vinn…',
  'auth.google': 'Halda áfram með Google',
  'auth.toRegister': 'Enginn aðgangur enn? Stofnaðu einn',
  'auth.toSignIn': 'Ertu þegar með aðgang? Skráðu þig inn',
  'auth.backToSearch': 'Aftur í leitina',
  'auth.errorGoogleState':
    'Þessi innskráningarhlekkur rann út eða var opnaður í öðrum vafra. Reyndu aftur.',
  'auth.errorGoogleFailed':
    'Innskráning með Google kláraðist ekki. Þú getur notað netfang og lykilorð í staðinn.',
  'auth.errorGeneric': 'Eitthvað fór úrskeiðis.',
  'bookmarks.title': 'Vistaðar bækur',
  'bookmarks.signedOut':
    'til að halda þeim bókum sem þú finnur — og til að bera saman útgáfur sömu bókar hlið við hlið síðar.',
  'bookmarks.loading': 'Sæki…',
  'bookmarks.empty': 'Ekkert vistað enn. Finndu bók og notaðu „Vista þessa bók“ á spjaldi hennar.',
  'bookmarks.searchLink': 'Leita',
  'bookmarks.remove': 'Fjarlægja',
  'bookmarks.loadFailed': 'Ekki tókst að sækja vistuðu bækurnar þínar.',
  'search.failed': 'Leitin mistókst.',
  'search.pending': 'Ekki enn í gagnagrunninum okkar — við athugum heimildirnar',
  'search.pendingLong':
    'Leita enn: fyrsta fyrirspurn um bók safnar gögnum úr heimildunum, sem getur tekið allt að nokkrar mínútur',
  'search.notFoundHint': 'Ekkert fannst. Reyndu að skerpa á titli eða höfundi.',
  'search.timedOut':
    'Heimildirnar svara hægt og við höfum engin gögn enn. Bakgrunnssamstillingin gæti þegar verið búin — reyndu aftur.',
  'search.freeOnlyToggle': 'Ókeypis niðurhal',
  'search.noFreeResults': 'Engin þeirra er með ókeypis niðurhal enn — prófaðu að slökkva á síunni.',
  'home.tagline': 'Finndu næsta magnum opus þitt',
  'subject.allLanguages': 'Öll tungumál.',
  'subject.filteredByLanguage': 'Aðeins bækur með útgáfu á {language}.',
  'subject.dropLanguageFilter': 'sýna öll tungumál',
  'subject.empty':
    'Ekkert undir þessu merki enn. Merkin koma úr bókunum sem þetta tilvik hefur þegar sótt.',
  'featured.year': '{year}',
  'nav.browse': 'Skoða eftir tegund',
  'recommend.heading': 'Út frá því sem þú hefur verið að lesa',
  'recommend.becauseOf': 'Þú opnaðir „{title}“, svo hér eru bækur í sömu tegundum.',
  'recommend.blurb': 'Bækur í þeim tegundum sem þú hefur verið að opna.',
  'recommend.privacy':
    'Þetta er reiknað í vafranum þínum — þjóninum eru sagðar tegundirnar, aldrei hver þú ert.',
  'recommend.forget': 'gleyma sögunni minni',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Hilla',
  'shelf.title': 'Hilla',
  'shelf.intro':
    'Opnar skrár og hvaða bókasafnsþjónn sem þú rekur sjálf. Skrár sem þú bætir við haldast í þessum vafra og eru aldrei sendar á þennan vef.',
  'shelf.openCatalogs': 'Opnar skrár',
  'shelf.yourCatalogs': 'Skrárnar þínar',
  'shelf.addCatalog': 'Bæta við skrá',
  'shelf.name': 'Nafn',
  'shelf.address': 'OPDS-slóð',
  'shelf.username': 'Notandanafn (valfrjálst)',
  'shelf.password': 'Lykilorð (valfrjálst)',
  'shelf.credentialsNote': 'Slóðin og öll aðgangsorð eru aðeins geymd í þessum vafra.',
  'shelf.add': 'Bæta við',
  'shelf.remove': 'Fjarlægja',
  'shelf.loading': 'Sæki skrá…',
  'shelf.empty': 'Þessi skrá inniheldur engar færslur.',
  'shelf.noCatalogs':
    'Engar eigin enn. Bættu við slóð fyrir Calibre-Web, COPS, Kavita eða Audiobookshelf hér að neðan.',
  'shelf.unreachable':
    'Vafrinn þinn gat ekki lesið þessa skrá. Þjónn á þínu eigin neti virkar; opinberir vefir hafna oft beiðnum frá öðrum uppruna.',
  'shelf.nextPage': 'Næsta síða',
  'shelf.previousPage': 'Fyrri síða',
  'shelf.drm': 'Þarf DRM-forrit',
  'shelf.notFree': 'Ekki ókeypis niðurhal',
  'shelf.download': 'Sækja',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Bókabúðir nálægt þér',
  'stores.useMyLocation': 'Nota staðsetninguna mína',
  'stores.placeLabel': 'Borg eða póstnúmer',
  'stores.find': 'Finna',
  'stores.locating': 'Leita…',
  'stores.failed': 'Staðsetning er ekki tiltæk. Sláðu inn borg eða póstnúmer í staðinn.',
  'stores.none': 'Engar bókabúðir eru á kortinu innan {radius} km.',
  'stores.distance': '{distance} km héðan',
  'stores.stockUnknown': 'Aðeins kortagögn — enginn birtir hvað búð á til á lager.',
  'stores.lookupFailed': 'Náði ekki í OpenStreetMap í augnablikinu. Reyndu aftur eftir smástund.',
  'stores.privacy':
    'Staðsetningin þín er námunduð að um 100 m og send aðeins til OpenStreetMap — aldrei á þennan vef.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Verð og búðir',
  'prices.loading': 'Spyr búðirnar…',
  'prices.unknown': 'Verð ekki birt',
  'prices.degraded': 'Ekkert svar frá: {providers}',
  'prices.format.hardcover': 'Harðspjalda',
  'prices.format.paperback': 'Kilja',
  'prices.format.ebook': 'Rafbók',
  'prices.format.audiobook': 'Hljóðbók',
  'prices.format.unknown': 'Snið ekki tilgreint',
  'recommend.hideGenre': 'fela „{genre}“',
  'recommend.hiddenList': 'Faldar tegundir (smelltu til að ná einni til baka):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Vistað',
  'settings.status.cleared': 'Hreinsað',
  'settings.status.unstored': 'Ekki geymt',
  'settings.status.failed': 'Óbreytt',
  'settings.notStored':
    'Þessi vafri neitaði að geyma breytinguna, svo ekkert gerðist — fyrra gildi gildir enn.',
  'settings.language.title': 'Tungumál viðmóts',
  'settings.language.changed':
    'Breytt úr {from} í {to}. Viðmótið endurhleðst á {to}; bókatitlar og höfundanöfn haldast á sínum eigin tungumálum.',
  'settings.country.title': 'Innkaupaland',
  'settings.country.changed':
    'Stillt á {country}. Hlekkir í bókabúðir bjóða nú búðir sem senda þangað, ásamt þeim alþjóðlegu.',
  'settings.country.cleared':
    'Ekkert land valið. Aðeins bókabúðir sem senda um allan heim verða í boði.',
  'settings.bookLanguage.title': 'Tungumál bóka',
  'settings.bookLanguage.changed':
    'Stillt á {language}. Tegundasíður setja bækur með útgáfu á {language} fremst þar til þú núllstillir síuna.',
  'settings.bookLanguage.cleared': 'Hreinsað. Tegundasíður sýna aftur bækur á öllum tungumálum.',
  'settings.hiddenGenres.title': 'Faldar tegundir',
  'settings.hiddenGenres.hidden':
    '„{genre}“ er falin. Hún er ekki lengur send á þjóninn þegar tillögur eru sóttar, og alls eru {count} tegundir faldar.',
  'settings.hiddenGenres.restored':
    '„{genre}“ er komin aftur í tillögurnar þínar. {count} tegundir eru enn faldar.',
  'settings.history.title': 'Lestrarsaga',
  'settings.history.cleared':
    'Bækurnar sem þú hafðir opnað hafa verið eyddar úr þessum vafra. Tillögur halda sig fjarri þar til þú opnar aðra bók.',
  'settings.bookmarks.title': 'Vistaðar bækur',
  'settings.bookmarks.added': '„{title}“ var bætt við vistuðu bækurnar þínar.',
  'settings.bookmarks.removed': '„{title}“ var fjarlægð úr vistuðu bókunum þínum.',
  'settings.bookmarks.failed':
    'Þjónninn tók ekki við breytingunni, svo vistuðu bækurnar þínar eru óbreyttar.',
  'settings.catalogs.title': 'Skrárnar þínar',
  'settings.catalogs.added':
    '„{name}“ var bætt við á {url}. Slóðin helst í þessum vafra og er aldrei send á þennan vef.',
  'settings.catalogs.addedWithCredentials':
    '„{name}“ var bætt við á {url}, ásamt notandanafninu og lykilorðinu sem þú slóst inn. Allt helst í þessum vafra og ekkert af því er sent á þennan vef.',
  'settings.catalogs.removed':
    '„{name}“ var fjarlægð úr þessum vafra, ásamt öllum aðgangsorðum sem geymd voru fyrir hana.',
  'settings.catalogs.rejected': 'Engu var bætt við: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Viðbætur',
  'addons.title': 'Viðbætur',
  'addons.intro':
    'Viðbót bætir við eigin heimildum. Þú setur hana upp með því að líma inn slóð hennar; hún keyrir annaðhvort í tækinu þínu, í sandkassa, eða á þjóni höfundar síns. Golden Library fylgir engin, telur engar upp og athugar ekki hverju þær skila.',
  'addons.addressLabel': 'Slóð viðbótar',
  'addons.addressHint': 'Slóð lýsingarskrárinnar sem höfundur viðbótarinnar gaf þér.',
  'addons.continue': 'Halda áfram',
  'addons.fromServer': 'Frá þjóni',
  'addons.fromFile': 'Úr skrá í tækinu þínu',
  'addons.bundleLabel': 'Slóð á kóða viðbótarinnar',
  'addons.bundleHint': 'Slóð kóðans. Hann keyrir í þessu tæki, ekki á þjóni.',
  'addons.integrityLabel': 'Heilleikatætigildi',
  'addons.integrityHint':
    'Gefið af höfundi viðbótarinnar, á forminu sha256-… . Nauðsynlegt: án þess gæti kóði sem þú samþykktir einu sinni breyst síðar án þess að þú vissir nokkurn tíma af því.',
  'addons.checking': 'Les viðbótina…',
  'addons.installedHeading': 'Uppsettar',
  'addons.none': 'Engar viðbætur enn. Allt á þessum vef hingað til kemur frá tilvikinu sjálfu.',
  'addons.priorityHint': 'Röðin er forgangur: fyrsta viðbótin svarar fyrst.',
  'addons.enable': 'Kveikja',
  'addons.disable': 'Slökkva',
  'addons.off': 'Slökkt',
  'addons.remove': 'Fjarlægja',
  'addons.moveUp': 'Færa upp',
  'addons.moveDown': 'Færa niður',
  'addons.configure': 'Stilla',
  'addons.failedToStart': '„{name}“ fór ekki í gang: {reason}',
  'addons.consentTitle': 'Setja upp „{name}“?',
  'addons.consentHosts': 'Hún mun hafa samband við: {hosts}',
  'addons.consentNoHosts': 'Hún hefur ekki beðið um að hafa samband við neitt.',
  'addons.consentSeesYou':
    'Þessi viðbót keyrir á þjóni höfundar síns. Hann sér vistfangið þitt og allt sem þú leitar að í gegnum hana.',
  'addons.consentSandboxed':
    'Þessi viðbót keyrir í tækinu þínu, í sandkassa. Hún getur ekki lesið vafrakökurnar þínar, gögn þessa vefs eða neitt annað sem þú hefur opið.',
  'addons.consentNotVetted':
    'Golden Library athugar ekki hverju viðbót skilar og mælti ekki með þessari. Það sem þú setur upp er þitt val.',
  'addons.install': 'Setja upp',
  'addons.cancel': 'Hætta við',
  'addons.via': 'gegnum {name}',
  'addons.sourcesTitle': 'Frá viðbótunum þínum',
  'addons.searchTitle': 'Fundið af viðbótunum þínum',
  'addons.showLinks': 'Sýna niðurhalshlekki',
  'addons.unreadable': 'Ekki tókst að lesa {count} færslur frá þessari viðbót.',
  'addons.browse': 'Skoða skrá',
  'addons.browseTitle': 'Skrá {name}',
  'addons.browseNoCatalog': 'Þessi viðbót býður ekki upp á skrá til að skoða.',
  'addons.browseEmpty': 'Skrá þessarar viðbótar er tóm í augnablikinu.',
  'addons.browseFailed': 'Ekki tókst að sækja skrá „{name}“: {reason}',
  'addons.loadMore': 'Sækja fleiri',
  'addons.notInstalled': 'Þessi viðbót er ekki uppsett.',

  'settings.addons.title': 'Viðbæturnar þínar',
  'settings.addons.installed':
    '„{name}“ er uppsett. Hún verður spurð ásamt hinum og gæti haft samband við {hosts}.',
  'settings.addons.removed':
    '„{name}“ var fjarlægð. Niðurstöður hennar eru horfnar úr þessum vafra, og sömuleiðis allt sem hún hafði geymt hér.',
  'settings.addons.enabled': '„{name}“ er kveikt aftur og verður spurð ásamt hinum.',
  'settings.addons.disabled':
    '„{name}“ er slökkt. Hún helst uppsett með stillingum sínum, en engu sem hún skilar verður sýnt.',
  'settings.addons.reordered': '„{name}“ svarar nú sem númer {position} af {total}.',
  'settings.addons.rejected': 'Ekkert var sett upp: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Eigin heimildir',
  'customSources.title': 'Eigin heimildir',
  'customSources.intro':
    'Bættu við eigin búð eða skrá með því að gefa henni nafn og leitarslóð sem inniheldur {isbn}, {query}, {title}, {author} eða {language}. Hlekkurinn er byggður í þessu tæki og þessi vefur sækir hann aldrei.',
  'customSources.nameLabel': 'Nafn',
  'customSources.templateLabel': 'Slóðasnið',
  'customSources.templateHint':
    'Algild https://-slóð. {isbn}, {query}, {title}, {author} og {language} eru fyllt út úr útgáfunni; staðgengill sem stendur tómur þýðir að hlekknum er sleppt fyrir þá útgáfu.',
  'customSources.add': 'Bæta við heimild',
  'customSources.listHeading': 'Heimildirnar þínar',
  'customSources.none': 'Engar eigin heimildir enn.',
  'customSources.off': 'Slökkt',
  'customSources.enable': 'Kveikja',
  'customSources.disable': 'Slökkva',
  'customSources.remove': 'Fjarlægja',
  'customSources.heading': 'Heimildirnar þínar',
  'customSources.caption':
    'Hlekkir sem þú stilltir sjálf. Þetta tilvik athugar ekki hvert þeir leiða.',

  'settings.customSources.title': 'Eigin heimildirnar þínar',
  'settings.customSources.added': '„{name}“ var bætt við og verður boðin ásamt hinum.',
  'settings.customSources.removed': '„{name}“ var fjarlægð úr þessum vafra.',
  'settings.customSources.enabled': '„{name}“ er kveikt aftur.',
  'settings.customSources.disabled':
    '„{name}“ er slökkt. Hún helst stillt, en hlekkur hennar verður ekki sýndur.',
  'settings.customSources.rejected': 'Engu var bætt við: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Bækur á þínu tungumáli',
  'featured.inLanguageBlurb':
    'Bækur skrifaðar á því tungumáli sem þú lest þennan vef á, þær mest útgefnu fyrst — röðun Open Library sjálfrar, ekki metsölulisti.',
  'work.newSearch': 'Ný leit',
  'work.descriptionFrom': 'Lýsing:',
  'work.descriptionNotLocalized':
    'Þessi lýsing er á því tungumáli sem heimildin skrifaði hana á — engin er til á þínu tungumáli fyrir þessa bók enn.',

  // Reader ratings of an edition, never of a translation — see TranslationRatings.tsx.
  'ratings.edition': '{average} af {outOf} frá {votes} lesendum á {source}',
  'ratings.lowConfidence': 'of fá atkvæði til að bera saman',
  'ratings.reviews': 'Umsagnir',
  'ratings.reviewsOn': 'Umsagnir um þessa útgáfu á {source}',
  'ratings.noteNoRatings':
    'Engin opin heimild gefur þýðingu einkunn og ekkert þessara upplaga hefur lesendaeinkunn hér.',
  'ratings.noteReviews':
    'Þar sem útgáfa er þekkt á {sources} vísar hlekkurinn á umsagnir um einmitt það upplag — flestar útgáfur eru það ekki.',
  'ratings.translator':
    'Útgáfur þýddar af {name}: {average} af {outOf} yfir {editions} útgáfur með einkunn, {votes} lesendur alls.',
  'ratings.note':
    'Þetta eru einkunnir lesenda á tiltekinni útgáfu á {sources}, ekki mat á þýðingunni sjálfri — það birtir enginn. Það borgar sig að lesa þær hlið við hlið: sama bók, sama tungumál, ólíkir þýðendur, og alltaf með fjölda atkvæða í sjónmáli.',
  'ratings.gapWithoutIsbn':
    '{count} útgáfur hér bera ekkert ISBN, svo engri einkunn var hægt að para við þær.',
  'ratings.gapNotLookedUp': '{count} útgáfur til viðbótar voru ekki flettar upp í þessari beiðni.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Lestu í vafranum þínum',
  'reader.privacy':
    'Vafrinn þinn opnar þessa bók upp á eigin spýtur. Skráin, staðurinn sem hún kom frá og hversu langt þú ert komin berast aldrei á þennan vef.',
  'reader.chooseFile': 'Opnaðu bók úr þessu tæki',
  'reader.formats': 'EPUB, FB2, MOBI og CBZ.',
  'reader.loading': 'Opna…',
  'reader.failed': 'Ekki tókst að opna þessa bók: {reason}',
  'reader.previous': 'Fyrri síða',
  'reader.next': 'Næsta síða',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…eða slepptu bók hér',
  'reader.fetching': 'Bið {host} um skrána…',
  'reader.blockedTitle': '{host} afhenti þessari síðu ekki skrána',
  'reader.blockedBody':
    'Annaðhvort næst ekki í hann eða hann leyfir ekki öðrum vefjum að lesa skrárnar sínar. Þessi vefur sækir hana ekki fyrir þig í staðinn: bókin þín fer aldrei í gegnum hann, og það er einmitt tilgangurinn með að lesa hér.',
  'reader.blockedDownload': 'Sæktu hana frá {host}',
  'reader.blockedOpenHere': 'og opnaðu hana svo hér úr tækinu þínu',
  'reader.blockedAddon': 'Viðbót sem afhendir skrána sjálf virkar líka.',
  'reader.keepFile': 'Geymdu þessa bók í þessum vafra',
  'reader.keepFileHint':
    'Sjálfgefið slökkt. Án þess hverfur skráin þegar þú lokar flipanum; með því helst hún aðeins í þessu tæki.',
  'reader.library': 'Geymt í þessum vafra',
  'reader.libraryEmpty':
    'Ekkert geymt enn. Bækur sem þú geymir haldast í þessu tæki og eru aldrei sendar upp.',
  'reader.libraryOpen': 'Opna',
  'reader.libraryRemove': 'Fjarlægja',
  'reader.libraryFileKept': 'skrá geymd',
  'reader.libraryFileGone': 'skrá ekki geymd',
  'reader.untitled': 'Ónefnd bók',
  'settings.reader.libraryTitle': 'Bækur geymdar í þessum vafra',
  'settings.reader.kept':
    '„{title}“ er nú geymd í þessu tæki og opnast því án þess að sækja hana aftur. Hún er ekki send neitt.',
  'settings.reader.forgotten':
    'Skránni fyrir „{title}“ var eytt úr þessum vafra. Færslan er áfram á listanum, svo þú getur opnað hana aftur frá upprunanum.',
  'settings.reader.removed':
    '„{title}“ var fjarlægð alveg úr þessum vafra — bæði skráin og færslan.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Opnuð þar sem frá var horfið — {percent}% komin.',
  'reader.bookmarks': 'Bókamerki',
  'reader.bookmarkAdd': 'Setja bókamerki á þessa síðu',
  'reader.bookmarkNone': 'Engin bókamerki í þessari bók enn.',
  'reader.bookmarkGo': 'Fara á',
  'reader.bookmarkRemove': 'Fjarlægja bókamerki',
  'reader.bookmarkNote': 'Athugasemd',
  'reader.bookmarkNotePlaceholder': 'Þín eigin orð um þessa síðu',
  'reader.bookmarkAt': '{percent}% komin',
  'settings.reader.bookmarkTitle': 'Bókamerki í þessum vafra',
  'settings.reader.bookmarkAdded':
    'Bókamerki við {percent}% í „{title}“. Bókamerki haldast í þessu tæki með bókinni.',
  'settings.reader.bookmarkRemoved': 'Það bókamerki í „{title}“ var fjarlægt úr þessum vafra.',
  'settings.reader.noteSaved':
    'Athugasemdin þín á þessari síðu í „{title}“ var vistuð í þessu tæki.',
  'settings.reader.positionTitle': 'Lesstaða',
  'settings.reader.positionUnstored':
    'Þessi vafri vildi ekki geyma hvar þú ert stödd í „{title}“, svo hún opnast frá byrjun næst. Huliðsstilling og fullur diskur gera hvort tveggja þetta.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': 'Hvernig þessi bók lítur út',
  'reader.theme': 'Litir',
  'reader.themeApp': 'Fylgja vefnum',
  'reader.themeLight': 'Pappír',
  'reader.themeDark': 'Blek',
  'reader.themeSepia': 'Sepía',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint': 'Hreint svart á hvítu, engin hreyfing, einn dálkur — fyrir rafblekskjái.',
  'reader.fontSize': 'Leturstærð',
  'reader.smaller': 'Minna',
  'reader.larger': 'Stærra',
  'reader.lineHeight': 'Línubil',
  'reader.margin': 'Spássíur',
  'reader.flow': 'Síður',
  'reader.flowPaged': 'Fletta',
  'reader.flowScrolled': 'Skruna',
  'reader.justify': 'Jafna báðar spássíur',
  'reader.hyphenate': 'Orðskipting',
  'reader.displayReset': 'Aftur í sjálfgefið',
  'settings.reader.displayTitle': 'Lestrarútlit',
  'settings.reader.displayChanged':
    '{setting} er núna {value}. Það gildir um hverja bók sem þú opnar í þessum vafra.',
  'settings.reader.displayReset':
    'Lestrarútlitið er komið aftur í sjálfgefin gildi fyrir allar bækur í þessum vafra.',
  'reader.on': 'Kveikt',
  'reader.off': 'Slökkt',
  'reader.openHere': 'Lestu í vafranum þínum',
  'reader.notAFileTitle': '{host} sendi vefsíðu, ekki skrána',
  'reader.notAFileBody':
    'Hlekkurinn vísar á síðu frekar en á bók — niðurhalssíðu, samþykkisskjá eða athugun á því hvort þú sért vélmenni. Opnaðu hana sjálf og skráin verður þar.',
  'settings.status.session': 'Ekki munað',
  'settings.notRemembered':
    'Þessi vafri vildi ekki muna það, svo það verður eins og áður næst þegar þú opnar bók.',
};
