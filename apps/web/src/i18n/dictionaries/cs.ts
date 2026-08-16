import type { Dictionary } from '../dictionary';

export const cs: Dictionary = {
  'nav.savedBooks': 'Uložené knihy',
  'nav.signIn': 'Přihlásit se',
  'nav.signOut': 'Odhlásit se',
  'nav.language': 'Jazyk',
  'nav.skipToContent': 'Přejít k obsahu',
  'footer.legal':
    'Výhradně legální zdroje: přímé stahování pouze u volných děl a otevřených licencí; knihy chráněné autorským právem — koupě nebo výpůjčka v knihovně. U každého odkazu je výslovně uveden právní stav.',
  'footer.openSource': 'Otevřený zdrojový kód',
  'footer.openSourceRest': '— licence MIT, lze provozovat u sebe. Kód je na GitHubu.',
  'home.title': 'Golden Library',
  'home.subtitle': 'Otevřený agregátor knižních překladů: jazyky, vydání a legální zdroje.',
  'home.searchLabel': 'Název a autor',
  'home.searchPlaceholder': 'Vojna a mír Tolstoj',
  'home.searchButton': 'Hledat',
  'search.searching': 'Hledáme…',
  'search.backfilling': 'Zatím tu nic není — stahujeme knihu ze zdrojů. Zabere to několik sekund.',
  'search.notFound': 'Pro tento dotaz se nic nenašlo.',
  'search.retry': 'Zkusit znovu',
  'search.signInPrompt':
    'a budete si moci ukládat knihy, které tu najdete, a vracet se k nim — a porovnávat vedle sebe vydání z různých let, než si jedno vyberete.',
  'featured.yearHeading': 'Knihy roku',
  'featured.yearBlurb':
    'Pozoruhodné knihy z každého z posledních let. Ručně vybraný seznam, nikoli žebříček prodejů — ten žádný otevřený zdroj nezveřejňuje.',
  'featured.popularHeading': 'Hodně čtené, hodně překládané',
  'featured.popularBlurb':
    'Knihy, které existují v mnoha jazycích — přesně kvůli tomu tenhle web je.',
  'featured.filling':
    'Několik z nich ještě stahujeme na pozadí. Za minutu stránku obnovte a uvidíte zbytek.',
  'featured.freeCopy': 'Zdarma',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Zdarma ke čtení hned teď',
  'free.homeBlurb':
    'Volná díla a knihy s otevřenou licencí, které vám tato kopie webu může předat přímo.',
  'free.seeAll': 'Zobrazit další',
  'free.downloadable': 'Stáhnout',
  'free.pageTitle': 'Knihy zdarma',
  'free.pageBlurb':
    'Každá kniha tady má aspoň jednu legální bezplatnou kopii — volné dílo, nebo dar od držitele práv. Bez nákupu, bez čtenářského průkazu.',
  'free.empty':
    'Zatím tu nic zdarma není. Bezplatné kopie přibývají, jak tato instance stahuje knihy — vyhledejte nějakou a vraťte se.',
  'free.emptyForLanguage':
    'V jazyce {language} zatím žádné bezplatné kopie nejsou. Zrušte filtr výše a uvidíte celou polici.',
  'free.showMore': 'Zobrazit další',
  'free.shown': 'Zobrazeno {shown} z {total}.',
  'free.allLanguages': 'Bezplatné kopie ve všech jazycích.',
  'free.filteredByLanguage': 'Pouze bezplatné kopie v jazyce {language}.',
  'free.filterByLanguage': 'Zobrazit jen bezplatné kopie v jazyce {language}.',
  'free.dropLanguageFilter': 'zobrazit všechny jazyky',
  'free.loadFailed': 'Knihy zdarma se teď nepodařilo načíst.',
  'work.original': 'originál',
  'work.dataSources': 'Zdroje dat',
  'work.about': 'O této knize',
  'work.translatedInto': 'Přeloženo do',
  'work.availableIn': 'Dostupné v jazycích',
  'work.languagesNote':
    'Pouze to, co uvádějí zdroje, které čteme — překlad, který tu chybí, může přesto existovat.',
  'work.noTranslations': 'Zatím nebyly nalezeny žádné překlady.',
  'work.yourLanguage.title': 'Ve vašem jazyce',
  'work.yourLanguage.yes': 'Překlad do jazyka {language} existuje.',
  'work.yourLanguage.original': 'Tato kniha byla napsána v jazyce {language}.',
  'work.yourLanguage.no': 'Mezi zde známými vydáními není překlad do jazyka {language}.',
  'work.yourLanguage.show': 'Zobrazit vydání v jazyce {language}',
  'work.editions': 'Vydání ({shown} z {total})',
  'work.filterLanguage': 'Jazyk',
  'work.filterAllLanguages': 'Všechny jazyky',
  'work.filterYear': 'Rok',
  'work.filterApply': 'Filtrovat',
  'work.filterReset': 'Zrušit',
  'work.noEditionsMatch': 'Těmto filtrům neodpovídá žádné vydání.',
  'work.showMoreEditions': 'Zobrazit další vydání (zbývá {remaining})',
  'work.badgeFreeDownload': 'stažení zdarma',
  'work.freeDownloadFormat': 'Stáhnout {format}',
  'work.freeDownloadNote': '{rights}. Zdarma od {provider} — bez účtu, bez placení.',
  'work.badgeReadBorrow': 'číst nebo půjčit',
  'work.badgeInBookstores': 'v knihkupectvích',
  'work.translatedBy': 'přeložil(a) {name}',
  'work.pages': '{count} s.',
  'bookmark.save': 'Uložit tuto knihu',
  'bookmark.saved': 'Uloženo',
  'bookmark.signInToSave': 'Přihlaste se pro uložení',
  'bookmark.failed': 'Uložení se nezdařilo. Zkuste to znovu.',
  'links.show': 'Zobrazit odkazy',
  'links.hide': 'Skrýt odkazy',
  'links.loading': 'Načítám odkazy',
  'links.none': 'K tomuto vydání zatím nejsou žádné legální odkazy.',
  'links.viaOtherEdition': 'bezplatná kopie z vydání {label}',
  'links.failed': 'Odkazy se nepodařilo načíst.',
  'links.storesHeading': 'Najít v knihkupectví',
  'links.storesInCountry': 'V zemi {country}',
  'links.storesYourCountry': 'vaše země',
  'links.storesLanguageMarket': 'Kde se prodávají knihy v jazyce {language}',
  'links.storesLanguageMarketGeneric': 'Kde se prodává jazyk tohoto vydání',
  'links.storesWorldwide': 'Doručuje po celém světě',
  'links.storesCaption':
    'Každý odkaz prohledá vlastní katalog daného obchodu — dostupnost i cenu uvádí obchod sám.',
  'linkType.download': 'Stáhnout',
  'linkType.buy': 'Koupit',
  'linkType.borrow': 'Půjčit v knihovně',
  'linkType.listen': 'Poslechnout (audiokniha)',
  'rights.public_domain': 'Volné dílo',
  'rights.open_license': 'Otevřená licence',
  'rights.copyrighted': 'Chráněno autorským právem',
  'rights.unknown': 'Stav neznámý',
  'compare.heading': 'Porovnat vydání',
  'compare.blurb': 'Vyberte dvě nebo tři vydání a uvidíte, čím se od sebe opravdu liší.',
  'compare.selected': 'Vybráno {count} z nejméně 2.',
  'compare.editSelection': 'Změnit vydání',
  'compare.showAllEditions': 'Zobrazit všech {count} vydání',
  'compare.columnDifference': 'Rozdíl',
  'compare.identical': 'Ve všem, co zdroje zaznamenávají, jsou tato vydání shodná.',
  'compare.rowLanguage': 'Jazyk',
  'compare.rowPublished': 'Vydáno',
  'compare.rowPublisher': 'Nakladatelství',
  'compare.rowTranslator': 'Překladatel',
  'compare.rowTranslatedFrom': 'Přeloženo z',
  'compare.rowBinding': 'Vazba',
  'compare.rowPages': 'Stran',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Bezplatná nebo vypůjčitelná kopie',
  'compare.yes': 'ano ({count})',
  'compare.no': 'nenalezeno',
  'country.label': 'Kde kupujete knihy?',
  'country.worldwideOnly': 'Jen obchody s celosvětovým doručením',
  'auth.signInTitle': 'Přihlášení',
  'auth.registerTitle': 'Vytvořit účet',
  'auth.blurb':
    'Účet existuje z jediného důvodu: abyste si mohli ukládat nalezené knihy a vracet se k nim — s jazyky, do nichž byly přeloženy, s existujícími vydáními a s tím, kde každé z nich legálně získat. Žádný newsletter, žádný profil, žádné sledování.',
  'auth.name': 'Jméno (nepovinné)',
  'auth.email': 'E-mail',
  'auth.password': 'Heslo',
  'auth.passwordHint':
    'Nejméně {min} znaků. Kontroluje se jen délka — dlouhá věta, kterou si zapamatujete, je lepší než krátká plná interpunkce.',
  'auth.submitSignIn': 'Přihlásit se',
  'auth.submitRegister': 'Vytvořit účet',
  'auth.working': 'Pracujeme…',
  'auth.google': 'Pokračovat přes Google',
  'auth.toRegister': 'Ještě nemáte účet? Vytvořte si ho',
  'auth.toSignIn': 'Už účet máte? Přihlaste se',
  'auth.backToSearch': 'Zpět na hledání',
  'auth.errorGoogleState':
    'Tento přihlašovací odkaz vypršel nebo byl otevřen v jiném prohlížeči. Zkuste to prosím znovu.',
  'auth.errorGoogleFailed':
    'Přihlášení přes Google se nedokončilo. Můžete místo toho použít e-mail a heslo.',
  'auth.errorGeneric': 'Něco se pokazilo.',
  'bookmarks.title': 'Uložené knihy',
  'bookmarks.signedOut':
    'a knihy, které najdete, vám zůstanou — a později budete moci porovnat vydání téže knihy vedle sebe.',
  'bookmarks.loading': 'Načítám…',
  'bookmarks.empty':
    'Zatím nic uloženého. Najděte knihu a na její kartě použijte „Uložit tuto knihu“.',
  'bookmarks.searchLink': 'Hledat',
  'bookmarks.remove': 'Odebrat',
  'bookmarks.loadFailed': 'Uložené knihy se nepodařilo načíst.',
  'search.failed': 'Hledání selhalo.',
  'search.pending': 'V naší databázi zatím není — prověřujeme zdroje',
  'search.pendingLong':
    'Stále hledáme: první dotaz na knihu sbírá data ze zdrojů, což může trvat i pár minut',
  'search.notFoundHint': 'Nic nenalezeno. Zkuste upřesnit název nebo autora.',
  'search.timedOut':
    'Zdroje odpovídají pomalu a zatím nemáme data. Synchronizace na pozadí už mohla skončit — zkuste to znovu.',
  'search.freeOnlyToggle': 'Zdarma ke stažení',
  'search.noFreeResults': 'Žádná z nich zatím nemá bezplatné stažení — zkuste filtr vypnout.',
  'home.tagline': 'Najděte své další magnum opus',
  'subject.allLanguages': 'Všechny jazyky.',
  'subject.filteredByLanguage': 'Pouze knihy s vydáním v jazyce {language}.',
  'subject.dropLanguageFilter': 'zobrazit všechny jazyky',
  'subject.empty':
    'Pod tímto štítkem zatím nic není. Štítky pocházejí z knih, které už tato instance stáhla.',
  'featured.year': '{year}',
  'nav.browse': 'Procházet podle žánru',
  'recommend.heading': 'Podle toho, co jste četli',
  'recommend.becauseOf': 'Otevřeli jste „{title}“, tady jsou knihy ze stejných žánrů.',
  'recommend.blurb': 'Knihy ze žánrů, které si otevíráte.',
  'recommend.privacy':
    'Počítá se to ve vašem prohlížeči — server se dozví žánry, nikdy to, kdo jste.',
  'recommend.forget': 'zapomenout moji historii',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Police',
  'shelf.title': 'Police',
  'shelf.intro':
    'Otevřené katalogy a jakýkoli knihovní server, který provozujete sami. Katalogy, které přidáte, zůstávají v tomto prohlížeči a nikdy se neodesílají na tento web.',
  'shelf.openCatalogs': 'Otevřené katalogy',
  'shelf.yourCatalogs': 'Vaše katalogy',
  'shelf.addCatalog': 'Přidat katalog',
  'shelf.name': 'Název',
  'shelf.address': 'Adresa OPDS',
  'shelf.username': 'Uživatelské jméno (nepovinné)',
  'shelf.password': 'Heslo (nepovinné)',
  'shelf.credentialsNote':
    'Adresa i případné přihlašovací údaje se ukládají jen v tomto prohlížeči.',
  'shelf.add': 'Přidat',
  'shelf.remove': 'Odebrat',
  'shelf.loading': 'Načítám katalog…',
  'shelf.empty': 'Tento katalog neobsahuje žádné položky.',
  'shelf.noCatalogs':
    'Zatím žádný vlastní. Níže přidejte adresu Calibre-Web, COPS, Kavita nebo Audiobookshelf.',
  'shelf.unreachable':
    'Váš prohlížeč nedokázal tento katalog přečíst. Server ve vaší vlastní síti fungovat bude; veřejné weby často odmítají požadavky z jiného původu.',
  'shelf.nextPage': 'Další stránka',
  'shelf.previousPage': 'Předchozí stránka',
  'shelf.drm': 'Vyžaduje aplikaci s DRM',
  'shelf.notFree': 'Není to stažení zdarma',
  'shelf.download': 'Stáhnout',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Knihkupectví ve vašem okolí',
  'stores.useMyLocation': 'Použít mou polohu',
  'stores.placeLabel': 'Město nebo PSČ',
  'stores.find': 'Najít',
  'stores.locating': 'Hledáme…',
  'stores.failed': 'Poloha není dostupná. Napište místo toho město nebo PSČ.',
  'stores.none': 'V okruhu {radius} km není v mapě žádné knihkupectví.',
  'stores.distance': '{distance} km odsud',
  'stores.stockUnknown': 'Pouze mapová data — nikdo nezveřejňuje, co má obchod skladem.',
  'stores.lookupFailed': 'OpenStreetMap se teď nepodařilo oslovit. Zkuste to za chvíli znovu.',
  'stores.privacy':
    'Vaše poloha se zaokrouhluje asi na 100 m a odesílá se pouze do OpenStreetMap — nikdy na tento web.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Ceny a obchody',
  'prices.loading': 'Ptáme se obchodů…',
  'prices.unknown': 'Cena není zveřejněna',
  'prices.degraded': 'Bez odpovědi: {providers}',
  'prices.format.hardcover': 'Pevná vazba',
  'prices.format.paperback': 'Brožovaná',
  'prices.format.ebook': 'E-kniha',
  'prices.format.audiobook': 'Audiokniha',
  'prices.format.unknown': 'Formát neuveden',
  'recommend.hideGenre': 'skrýt „{genre}“',
  'recommend.hiddenList': 'Skryté žánry (kliknutím jeden vrátíte):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Uloženo',
  'settings.status.cleared': 'Vymazáno',
  'settings.status.unstored': 'Neuloženo',
  'settings.status.failed': 'Beze změny',
  'settings.notStored':
    'Tento prohlížeč změnu odmítl uložit, takže se nic nestalo — platí dál hodnota, kterou jste měli předtím.',
  'settings.language.title': 'Jazyk rozhraní',
  'settings.language.changed':
    'Změněno z {from} na {to}. Rozhraní se načte znovu v jazyce {to}; názvy knih a jména autorů zůstávají ve svých jazycích.',
  'settings.country.title': 'Země nákupu',
  'settings.country.changed':
    'Nastaveno na {country}. Odkazy do knihkupectví teď nabízejí obchody, které tam doručují, vedle těch celosvětových.',
  'settings.country.cleared':
    'Žádná země není zvolena. Nabízet se budou jen knihkupectví s celosvětovým doručením.',
  'settings.bookLanguage.title': 'Jazyk knih',
  'settings.bookLanguage.changed':
    'Nastaveno na {language}. Stránky žánrů budou uvádět nejprve knihy s vydáním v jazyce {language}, dokud filtr nezrušíte.',
  'settings.bookLanguage.cleared': 'Vymazáno. Stránky žánrů opět ukazují knihy ve všech jazycích.',
  'settings.hiddenGenres.title': 'Skryté žánry',
  'settings.hiddenGenres.hidden':
    'Žánr „{genre}“ je skrytý. Při načítání doporučení se už neposílá na server; skrytých žánrů je celkem {count}.',
  'settings.hiddenGenres.restored':
    'Žánr „{genre}“ je zpět ve vašich doporučeních. Skrytých zůstává {count}.',
  'settings.history.title': 'Historie čtení',
  'settings.history.cleared':
    'Knihy, které jste otevřeli, byly z tohoto prohlížeče smazány. Doporučení se neobjeví, dokud neotevřete další knihu.',
  'settings.bookmarks.title': 'Uložené knihy',
  'settings.bookmarks.added': 'Kniha „{title}“ byla přidána k uloženým knihám.',
  'settings.bookmarks.removed': 'Kniha „{title}“ byla z uložených knih odebrána.',
  'settings.bookmarks.failed':
    'Server změnu nepřijal, takže vaše uložené knihy zůstávají beze změny.',
  'settings.catalogs.title': 'Vaše katalogy',
  'settings.catalogs.added':
    'Katalog „{name}“ byl přidán na adrese {url}. Adresa zůstává v tomto prohlížeči a nikdy se neodesílá na tento web.',
  'settings.catalogs.addedWithCredentials':
    'Katalog „{name}“ byl přidán na adrese {url}, spolu s uživatelským jménem a heslem, které jste zadali. Vše zůstává v tomto prohlížeči a nic z toho se neodesílá na tento web.',
  'settings.catalogs.removed':
    'Katalog „{name}“ byl z tohoto prohlížeče odebrán, i s přihlašovacími údaji, které pro něj byly uloženy.',
  'settings.catalogs.rejected': 'Nic nebylo přidáno: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Doplňky',
  'addons.title': 'Doplňky',
  'addons.intro':
    'Doplněk přidává vlastní zdroje. Nainstalujete ho vložením jeho adresy; běží buď na vašem zařízení v sandboxu, nebo na serveru svého autora. Golden Library žádné nedodává, žádné neuvádí a nekontroluje, co vracejí.',
  'addons.addressLabel': 'Adresa doplňku',
  'addons.addressHint': 'Adresa manifestu, kterou vám dal autor doplňku.',
  'addons.continue': 'Pokračovat',
  'addons.fromServer': 'Ze serveru',
  'addons.fromFile': 'Ze souboru na vašem zařízení',
  'addons.bundleLabel': 'Adresa kódu doplňku',
  'addons.bundleHint': 'Adresa kódu doplňku. Poběží na tomto zařízení, ne na serveru.',
  'addons.integrityLabel': 'Kontrolní otisk',
  'addons.integrityHint':
    'Uvádí ho autor doplňku, ve tvaru sha256-… . Je povinný: bez něj by se jednou schválený kód mohl později změnit a vy byste se to nikdy nedozvěděli.',
  'addons.checking': 'Načítám doplněk…',
  'addons.installedHeading': 'Nainstalováno',
  'addons.none':
    'Zatím žádné doplňky. Vše, co na tomto webu dosud vidíte, pochází od samotné instance.',
  'addons.priorityHint': 'Pořadí je priorita: první doplněk odpovídá jako první.',
  'addons.enable': 'Zapnout',
  'addons.disable': 'Vypnout',
  'addons.off': 'Vypnuto',
  'addons.remove': 'Odebrat',
  'addons.moveUp': 'Nahoru',
  'addons.moveDown': 'Dolů',
  'addons.configure': 'Nastavit',
  'addons.failedToStart': 'Doplněk „{name}“ se nespustil: {reason}',
  'addons.consentTitle': 'Nainstalovat „{name}“?',
  'addons.consentHosts': 'Bude se spojovat s: {hosts}',
  'addons.consentNoHosts': 'O spojení s ničím nepožádal.',
  'addons.consentSeesYou':
    'Tento doplněk běží na serveru svého autora. Uvidí vaši adresu a vše, co přes něj hledáte.',
  'addons.consentSandboxed':
    'Tento doplněk běží na vašem zařízení v sandboxu. Nemůže číst vaše cookies, data tohoto webu ani nic jiného, co máte otevřené.',
  'addons.consentNotVetted':
    'Golden Library nekontroluje, co doplněk vrací, a tento nedoporučila. Co si nainstalujete, je vaše volba.',
  'addons.install': 'Nainstalovat',
  'addons.cancel': 'Zrušit',
  'addons.via': 'přes {name}',
  'addons.sourcesTitle': 'Z vašich doplňků',
  'addons.searchTitle': 'Nalezeno vašimi doplňky',
  'addons.showLinks': 'Zobrazit odkazy ke stažení',
  'addons.unreadable': 'Z tohoto doplňku se nepodařilo přečíst {count} položek.',
  'addons.browse': 'Procházet katalog',
  'addons.browseTitle': 'Katalog doplňku {name}',
  'addons.browseNoCatalog': 'Tento doplněk nenabízí katalog k procházení.',
  'addons.browseEmpty': 'Katalog tohoto doplňku je momentálně prázdný.',
  'addons.browseFailed': 'Katalog doplňku „{name}“ se nepodařilo načíst: {reason}',
  'addons.loadMore': 'Načíst další',
  'addons.notInstalled': 'Tento doplněk není nainstalovaný.',

  'settings.addons.title': 'Vaše doplňky',
  'settings.addons.installed':
    'Doplněk „{name}“ je nainstalovaný. Bude dotazován spolu s ostatními a může se spojovat s {hosts}.',
  'settings.addons.removed':
    'Doplněk „{name}“ byl odebrán. Jeho výsledky z tohoto prohlížeče zmizely, stejně jako vše, co si tu uložil.',
  'settings.addons.enabled':
    'Doplněk „{name}“ je znovu zapnutý a bude dotazován spolu s ostatními.',
  'settings.addons.disabled':
    'Doplněk „{name}“ je vypnutý. Zůstává nainstalovaný i s nastavením, ale nic z toho, co vrací, se nezobrazí.',
  'settings.addons.reordered': 'Doplněk „{name}“ nyní odpovídá jako {position} z {total}.',
  'settings.addons.rejected': 'Nic nebylo nainstalováno: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Vlastní zdroje',
  'customSources.title': 'Vlastní zdroje',
  'customSources.intro':
    'Přidejte si vlastní obchod nebo katalog: dejte mu název a vyhledávací URL s {isbn}, {query}, {title}, {author} nebo {language}. Odkaz se sestaví na tomto zařízení a tento web ho nikdy nevolá.',
  'customSources.nameLabel': 'Název',
  'customSources.templateLabel': 'Šablona URL',
  'customSources.templateHint':
    'Absolutní adresa https://. {isbn}, {query}, {title}, {author} a {language} se doplní z vydání; zástupný symbol, který zůstane prázdný, znamená, že se odkaz pro dané vydání vynechá.',
  'customSources.add': 'Přidat zdroj',
  'customSources.listHeading': 'Vaše zdroje',
  'customSources.none': 'Zatím žádné vlastní zdroje.',
  'customSources.off': 'Vypnuto',
  'customSources.enable': 'Zapnout',
  'customSources.disable': 'Vypnout',
  'customSources.remove': 'Odebrat',
  'customSources.heading': 'Vaše zdroje',
  'customSources.caption':
    'Odkazy, které jste si nastavili sami. Tato instance nekontroluje, kam vedou.',

  'settings.customSources.title': 'Vaše vlastní zdroje',
  'settings.customSources.added': 'Zdroj „{name}“ byl přidán a bude nabízen spolu s ostatními.',
  'settings.customSources.removed': 'Zdroj „{name}“ byl z tohoto prohlížeče odebrán.',
  'settings.customSources.enabled': 'Zdroj „{name}“ je znovu zapnutý.',
  'settings.customSources.disabled':
    'Zdroj „{name}“ je vypnutý. Zůstává nastavený, ale jeho odkaz se nezobrazí.',
  'settings.customSources.rejected': 'Nic nebylo přidáno: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Knihy ve vašem jazyce',
  'featured.inLanguageBlurb':
    'Knihy napsané v jazyce, ve kterém tenhle web čtete, nejvydávanější první — je to pořadí samotné Open Library, ne žebříček bestsellerů.',
  'work.newSearch': 'Nové hledání',
  'work.descriptionFrom': 'Popis:',
  'work.descriptionNotLocalized':
    'Tento popis je v jazyce, ve kterém ho napsal zdroj — ve vašem jazyce zatím pro tuto knihu žádný není.',

  // Reader ratings of an edition, never of a translation — see TranslationRatings.tsx.
  'ratings.edition': '{average} z {outOf} od {votes} čtenářů na {source}',
  'ratings.lowConfidence': 'příliš málo hlasů na srovnání',
  'ratings.reviews': 'Recenze',
  'ratings.reviewsOn': 'Recenze tohoto vydání na {source}',
  'ratings.noteNoRatings':
    'Žádný otevřený zdroj nehodnotí překlad a ani jeden z těchto výtisků tu nemá čtenářské hodnocení.',
  'ratings.noteReviews':
    'Tam, kde je vydání známé na {sources}, odkaz vede na recenze právě toho výtisku — u většiny vydání tomu tak není.',
  'ratings.translator':
    'Vydání v překladu {name}: {average} z {outOf} napříč {editions} hodnocenými vydáními, celkem {votes} čtenářů.',
  'ratings.note':
    'Jsou to hodnocení čtenářů konkrétního vydání na {sources}, ne posouzení samotného překladu — to nikdo nezveřejňuje. Vyplatí se číst je vedle sebe: stejná kniha, stejný jazyk, jiní překladatelé, a vždy s počtem hlasů na očích.',
  'ratings.gapWithoutIsbn':
    '{count} zdejších vydání nemá ISBN, takže k nim nešlo přiřadit žádné hodnocení.',
  'ratings.gapNotLookedUp': 'Dalších {count} vydání se v tomto dotazu nedohledávalo.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Čtěte ve svém prohlížeči',
  'reader.privacy':
    'Váš prohlížeč otevře tuhle knihu sám. Soubor, místo, odkud pochází, ani to, kam jste se dočetli, se na tenhle web nikdy nedostanou.',
  'reader.chooseFile': 'Otevřít knihu z tohoto zařízení',
  'reader.formats': 'EPUB, FB2, MOBI a CBZ.',
  'reader.loading': 'Otevírám…',
  'reader.failed': 'Tuhle knihu se nepodařilo otevřít: {reason}',
  'reader.previous': 'Předchozí stránka',
  'reader.next': 'Další stránka',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…nebo sem knihu přetáhněte',
  'reader.fetching': 'Žádám {host} o soubor…',
  'reader.blockedTitle': '{host} tuhle stránce soubor nevydal',
  'reader.blockedBody':
    'Buď je nedostupný, nebo nedovoluje jiným webům číst své soubory. Tenhle web ho za vás nestáhne: vaše kniha jím nikdy neprochází, a přesně o to při čtení tady jde.',
  'reader.blockedDownload': 'Stáhněte ji z {host}',
  'reader.blockedOpenHere': 'a pak ji tady otevřete ze svého zařízení',
  'reader.blockedAddon': 'Funguje i doplněk, který soubor poskytuje sám.',
  'reader.keepFile': 'Ponechat tuhle knihu v tomto prohlížeči',
  'reader.keepFileHint':
    'Ve výchozím stavu vypnuto. Bez toho soubor zmizí, jakmile zavřete panel; s tím zůstane jen na tomto zařízení.',
  'reader.library': 'Ponecháno v tomto prohlížeči',
  'reader.libraryEmpty':
    'Zatím nic ponechaného. Knihy, které si ponecháte, zůstávají na tomto zařízení a nikam se nenahrávají.',
  'reader.libraryOpen': 'Otevřít',
  'reader.libraryRemove': 'Odebrat',
  'reader.libraryFileKept': 'soubor ponechán',
  'reader.libraryFileGone': 'soubor neponechán',
  'reader.untitled': 'Kniha bez názvu',
  'settings.reader.libraryTitle': 'Knihy ponechané v tomto prohlížeči',
  'settings.reader.kept':
    'Kniha „{title}“ je nyní ponechána na tomto zařízení, takže se otevře bez opětovného stahování. Nikam se nenahrává.',
  'settings.reader.forgotten':
    'Soubor knihy „{title}“ byl z tohoto prohlížeče smazán. V seznamu zůstává, takže ji můžete znovu otevřít z jejího zdroje.',
  'settings.reader.removed':
    'Kniha „{title}“ byla z tohoto prohlížeče odstraněna úplně — soubor i záznam.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Otevřeno tam, kde jste skončili — na {percent} %.',
  'reader.bookmarks': 'Záložky',
  'reader.bookmarkAdd': 'Přidat záložku na tuhle stránku',
  'reader.bookmarkNone': 'V téhle knize zatím nejsou žádné záložky.',
  'reader.bookmarkGo': 'Přejít na',
  'reader.bookmarkRemove': 'Odebrat záložku',
  'reader.bookmarkNote': 'Poznámka',
  'reader.bookmarkNotePlaceholder': 'Vaše vlastní slova k téhle stránce',
  'reader.bookmarkAt': 'na {percent} %',
  'settings.reader.bookmarkTitle': 'Záložky v tomto prohlížeči',
  'settings.reader.bookmarkAdded':
    'Záložka na {percent} % knihy „{title}“. Záložky zůstávají na tomto zařízení spolu s knihou.',
  'settings.reader.bookmarkRemoved':
    'Ta záložka v knize „{title}“ byla z tohoto prohlížeče odebrána.',
  'settings.reader.noteSaved':
    'Vaše poznámka k téhle stránce knihy „{title}“ byla uložena na tomto zařízení.',
  'settings.reader.positionTitle': 'Místo ve čtení',
  'settings.reader.positionUnstored':
    'Tenhle prohlížeč odmítl uložit, kde jste v knize „{title}“, takže se příště otevře od začátku. Dělá to anonymní režim i plný disk.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': 'Jak tahle kniha vypadá',
  'reader.theme': 'Barvy',
  'reader.themeApp': 'Podle webu',
  'reader.themeLight': 'Papír',
  'reader.themeDark': 'Inkoust',
  'reader.themeSepia': 'Sépie',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint':
    'Čistá černá na bílé, žádná animace, jeden sloupec — pro displeje z elektronického papíru.',
  'reader.fontSize': 'Velikost písma',
  'reader.smaller': 'Menší',
  'reader.larger': 'Větší',
  'reader.lineHeight': 'Řádkování',
  'reader.margin': 'Okraje',
  'reader.flow': 'Stránky',
  'reader.flowPaged': 'Otáčet stránky',
  'reader.flowScrolled': 'Rolovat',
  'reader.justify': 'Zarovnat do bloku',
  'reader.hyphenate': 'Dělení slov',
  'reader.displayReset': 'Zpět na výchozí',
  'settings.reader.displayTitle': 'Vzhled čtení',
  'settings.reader.displayChanged':
    '{setting} je nyní {value}. Platí pro každou knihu, kterou v tomto prohlížeči otevřete.',
  'settings.reader.displayReset':
    'Vzhled čtení se vrátil k výchozím hodnotám pro všechny knihy v tomto prohlížeči.',
  'reader.on': 'Zapnuto',
  'reader.off': 'Vypnuto',
  'reader.openHere': 'Čtěte ve svém prohlížeči',
  'reader.notAFileTitle': '{host} poslal webovou stránku, ne soubor',
  'reader.notAFileBody':
    'Odkaz vede na stránku, ne ke knize — na stránku ke stažení, obrazovku se souhlasem nebo ověření, že nejste robot. Otevřete ji sami a soubor tam bude.',
  'settings.status.session': 'Nezapamatováno',
  'settings.notRemembered':
    'Tenhle prohlížeč si to odmítl zapamatovat, takže až příště otevřete knihu, bude všechno jako dřív.',
  'compare.rowEditionStatement': 'Vydání',
  'home.genres': 'Oblíbené žánry',
  'home.genresBlurb': 'Štítky, za nimiž stojí nejvíc knih. Každý z nich otevře svůj katalog.',

  // --- The first-run walkthrough (components/OnboardingTour.tsx) -----------
  'tour.next': 'Dál',
  'tour.back': 'Zpět',
  'tour.skip': 'Teď ne',
  'tour.finish': 'Hotovo',
  'tour.close': 'Zavřít prohlídku',
  'tour.welcome.title': 'Vítejte v Golden Library',
  'tour.welcome.text':
    'Minuta a budete vědět, kde co je. Tenhle web zjišťuje, v jakých jazycích kniha existuje a kde ji získat legálně — a dělá to tím lépe, čím přesněji mu řeknete, kde má hledat. Tím tedy začneme.',
  'tour.customSourcesNav.title': 'Začněte vlastními zdroji',
  'tour.customSourcesNav.text':
    'Otevřete <strong>Vlastní zdroje</strong> — stránku, kde rozhodujete, které katalogy se prohledávají vedle vestavěných.',
  'tour.presets.title': 'Psát od nuly není nutné',
  'tour.presets.text':
    'Zveřejňují se tam hotové šablony. Patří těm, kdo je napsali: tento web na onom kanálu nic nekontroluje a zdroj, který přidáte, hledá z vašeho prohlížeče, ne z tohoto serveru. Otevřete na nové kartě, vezměte si, co potřebujete, a vraťte se.',
  'tour.sourceForm.title': 'Dvě pole a je to',
  'tour.sourceForm.text':
    'Název, který poznáte, a adresa hledání, kde <strong>{query}</strong> stojí na místě vašich slov. Přidejte jeden hned, nebo stiskněte «Dál» a vraťte se k tomu později.',
  'tour.sourceList.title': 'Všechno přidané zůstává tady',
  'tour.sourceList.text':
    'Vaše zdroje jsou níže a každý se dá vypnout nebo smazat. Žijí v tomto prohlížeči a nikdy neodcházejí na server: tady je nikdo nevidí a na jiném zařízení nebudou.',
  'tour.addonsNav.title': 'Doplňky jdou dál',
  'tour.addonsNav.text':
    'Otevřete <strong>Doplňky</strong>. Vlastní zdroj je jedna adresa, kterou jste napsali; doplněk je malý program od někoho jiného, který umí katalog opravdu prohledat.',
  'tour.addons.title': 'Nic se neinstaluje, dokud si to neprohlédnete',
  'tour.addons.text':
    'Vložte adresu doplňku a formulář ukáže, co to je a s jakými hosty bude mluvit; teprve pak se instaluje. Jeho výsledky vždy nesou jméno doplňku, který je dodal.',
  'tour.shelfNav.title': 'Police',
  'tour.shelfNav.text':
    'Otevřete <strong>Polici</strong> a uvidíte katalogy, ze kterých lze číst přímo.',
  'tour.shelf.title': 'Otevřené katalogy i ty vaše',
  'tour.shelf.text':
    'Projekt Gutenberg a jemu podobné tu jsou od začátku. Pod nimi můžete přidat libovolný katalog OPDS — třeba server Calibre ve vaší síti: dosáhne na něj váš prohlížeč, tento web nikdy.',
  'tour.language.title': 'Jazyk rozhraní',
  'tour.language.text':
    'Měňte ho tady, kdykoli chcete. Jako každé nastavení na tomto webu se zapíše do vašeho prohlížeče a platí okamžitě — a řekne to v hlášce, i když prohlížeč odmítne si ho zapamatovat.',
  'tour.done.title': 'A to je celá prohlídka',
  'tour.done.text':
    'Hledejte z úvodní stránky a přihlaste se, pokud chcete nalezené knihy uchovat. Odkaz v patičce kterékoli stránky prohlídku spustí znovu.',
  'settings.tour.title': 'Prohlídka s průvodcem',
  'settings.tour.finished':
    'Prohlídku máte za sebou, sama se už neotevře. Odkaz v patičce ji spustí, kdykoli budete chtít.',
  'settings.tour.skipped':
    'Prohlídka je zavřená a sama se už neotevře. Odkaz v patičce ji spustí, kdykoli budete chtít.',
  'settings.tour.restarted':
    'Začínáme znovu od prvního kroku a tento prohlížeč zapomněl, že jste ji už viděli.',
  'customSources.presets': 'Hotové šablony',
  'customSources.presetsCaption':
    'Šablony, které sdílejí ostatní čtenáři, na kanálu této instance. Nikdo je tu nekontroluje: přečtěte si šablonu, než ji přidáte, a mějte na paměti, že hledat bude z vašeho prohlížeče.',
  'footer.takeTheTour': 'Projít prohlídku',
};
