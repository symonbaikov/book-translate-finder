import type { Dictionary } from '../dictionary';

export const ro: Dictionary = {
  'nav.savedBooks': 'Cărți salvate',
  'nav.signIn': 'Autentificare',
  'nav.signOut': 'Deconectare',
  'nav.language': 'Limbă',
  'nav.skipToContent': 'Sari la conținut',
  'footer.legal':
    'Doar surse legale: descărcare directă exclusiv pentru operele din domeniul public și cu licențe deschise; cărțile protejate de drepturi de autor — cumpărare sau împrumut la bibliotecă. Fiecare link are un statut juridic declarat explicit.',
  'footer.openSource': 'Sursă deschisă',
  'footer.openSourceRest': '— licență MIT, poate fi găzduit de oricine. Codul este pe GitHub.',
  'home.title': 'Golden Library',
  'home.subtitle': 'Un agregator deschis de traduceri de carte: limbi, ediții și surse legale.',
  'home.searchLabel': 'Titlu și autor',
  'home.searchPlaceholder': 'Război și pace Tolstoi',
  'home.searchButton': 'Caută',
  'search.searching': 'Se caută…',
  'search.backfilling': 'Încă nu e nimic aici — aducem cartea din surse. Durează câteva secunde.',
  'search.notFound': 'Nu s-a găsit nimic pentru această căutare.',
  'search.retry': 'Încearcă din nou',
  'search.signInPrompt':
    'ca să salvezi cărțile pe care le găsești aici și să revii la ele — și ca să compari alături ediții din ani diferiți înainte să alegi una.',
  'featured.yearHeading': 'Cărțile anului',
  'featured.yearBlurb':
    'Cărți demne de reținut din fiecare an recent. O listă alcătuită manual, nu un clasament de vânzări — așa ceva nu publică nicio sursă deschisă.',
  'featured.popularHeading': 'Mult citite, mult traduse',
  'featured.popularBlurb':
    'Cărți care există în multe limbi — exact pentru asta există acest site.',
  'featured.filling':
    'Câteva dintre ele se aduc încă în fundal. Reîncarcă peste un minut ca să le vezi pe restul.',
  'featured.freeCopy': 'Exemplar gratuit',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Gratuit de citit chiar acum',
  'free.homeBlurb':
    'Cărți din domeniul public și cu licență deschisă pe care această copie a site-ului ți le poate da direct.',
  'free.seeAll': 'Vezi mai multe',
  'free.downloadable': 'Descarcă',
  'free.pageTitle': 'Cărți gratuite',
  'free.pageBlurb':
    'Fiecare carte de aici are cel puțin un exemplar gratuit și legal — domeniu public sau dăruit de deținătorul drepturilor. Fără cumpărare, fără permis de bibliotecă.',
  'free.empty':
    'Încă nu e nimic gratuit aici. Exemplarele gratuite apar pe măsură ce această instanță aduce cărți, așa că caută una și revino.',
  'free.emptyForLanguage':
    'Încă nu există exemplare gratuite în {language}. Renunță la filtrul de mai sus ca să vezi tot raftul.',
  'free.showMore': 'Arată mai multe',
  'free.shown': 'Se afișează {shown} din {total}.',
  'free.allLanguages': 'Exemplare gratuite în toate limbile.',
  'free.filteredByLanguage': 'Numai exemplare gratuite în {language}.',
  'free.filterByLanguage': 'Arată doar exemplarele gratuite în {language}.',
  'free.dropLanguageFilter': 'arată toate limbile',
  'free.loadFailed': 'Cărțile gratuite nu au putut fi încărcate acum.',
  'work.original': 'original',
  'work.dataSources': 'Surse de date',
  'work.about': 'Despre această carte',
  'work.translatedInto': 'Tradusă în',
  'work.availableIn': 'Disponibilă în',
  'work.languagesNote':
    'Doar ce enumeră sursele pe care le citim — o traducere care lipsește aici poate totuși să existe.',
  'work.noTranslations': 'Încă nu s-au găsit traduceri.',
  'work.yourLanguage.title': 'În limba ta',
  'work.yourLanguage.yes': 'Există o traducere în {language}.',
  'work.yourLanguage.original': 'Această carte a fost scrisă în {language}.',
  'work.yourLanguage.no': 'Nicio traducere în {language} printre edițiile cunoscute aici.',
  'work.yourLanguage.show': 'Arată edițiile în {language}',
  'work.editions': 'Ediții ({shown} din {total})',
  'work.filterLanguage': 'Limbă',
  'work.filterAllLanguages': 'Toate limbile',
  'work.filterYear': 'An',
  'work.filterApply': 'Filtrează',
  'work.filterReset': 'Resetează',
  'work.noEditionsMatch': 'Nicio ediție nu corespunde acestor filtre.',
  'work.showMoreEditions': 'Arată mai multe ediții (au mai rămas {remaining})',
  'work.badgeFreeDownload': 'descărcare gratuită',
  'work.freeDownloadFormat': 'Descarcă {format}',
  'work.freeDownloadNote': '{rights}. Gratuit de la {provider} — fără cont, fără plată.',
  'work.badgeReadBorrow': 'citește sau împrumută',
  'work.badgeInBookstores': 'în librării',
  'work.translatedBy': 'traducere de {name}',
  'work.pages': '{count} pagini',
  'bookmark.save': 'Salvează această carte',
  'bookmark.saved': 'Salvată',
  'bookmark.signInToSave': 'Autentifică-te ca să salvezi',
  'bookmark.failed': 'Nu s-a putut salva. Încearcă din nou.',
  'links.show': 'Arată linkurile',
  'links.hide': 'Ascunde linkurile',
  'links.loading': 'Se încarcă linkurile',
  'links.none': 'Încă nu există linkuri legale pentru această ediție.',
  'links.viaOtherEdition': 'exemplar gratuit din ediția {label}',
  'links.failed': 'Linkurile nu au putut fi încărcate.',
  'links.storesHeading': 'Găsește într-o librărie',
  'links.storesInCountry': 'În {country}',
  'links.storesYourCountry': 'țara ta',
  'links.storesLanguageMarket': 'Unde se vând cărți în {language}',
  'links.storesLanguageMarketGeneric': 'Unde se vinde limba acestei ediții',
  'links.storesWorldwide': 'Livrează în toată lumea',
  'links.storesCaption':
    'Fiecare link caută în catalogul propriu al librăriei — disponibilitatea și prețul sunt arătate chiar de ea.',
  'linkType.download': 'Descarcă',
  'linkType.buy': 'Cumpără',
  'linkType.borrow': 'Împrumută de la bibliotecă',
  'linkType.listen': 'Ascultă (audiobook)',
  'rights.public_domain': 'Domeniu public',
  'rights.open_license': 'Licență deschisă',
  'rights.copyrighted': 'Protejată de drepturi de autor',
  'rights.unknown': 'Statut necunoscut',
  'compare.heading': 'Compară edițiile',
  'compare.blurb': 'Alege două sau trei ediții ca să vezi ce le deosebește cu adevărat.',
  'compare.selected': 'Selectate {count} din cel puțin 2.',
  'compare.editSelection': 'Schimbă edițiile',
  'compare.showAllEditions': 'Arată toate cele {count} ediții',
  'compare.columnDifference': 'Diferență',
  'compare.identical': 'În tot ce consemnează sursele, aceste ediții sunt identice.',
  'compare.rowLanguage': 'Limbă',
  'compare.rowPublished': 'Publicată',
  'compare.rowPublisher': 'Editură',
  'compare.rowTranslator': 'Traducător',
  'compare.rowTranslatedFrom': 'Tradusă din',
  'compare.rowBinding': 'Legătură',
  'compare.rowPages': 'Pagini',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Exemplar gratuit sau de împrumut',
  'compare.yes': 'da ({count})',
  'compare.no': 'nu s-a găsit',
  'country.label': 'De unde cumperi cărți?',
  'country.worldwideOnly': 'Doar magazine care livrează în toată lumea',
  'auth.signInTitle': 'Autentificare',
  'auth.registerTitle': 'Creează un cont',
  'auth.blurb':
    'Un cont există dintr-un singur motiv: să salvezi cărțile pe care le găsești și să revii la ele — cu limbile în care au fost traduse, edițiile care există și locul de unde poți obține fiecare, legal. Fără newsletter, fără profil, fără urmărire.',
  'auth.name': 'Nume (opțional)',
  'auth.email': 'E-mail',
  'auth.password': 'Parolă',
  'auth.passwordHint':
    'Cel puțin {min} caractere. Se verifică doar lungimea — o frază lungă pe care o ții minte bate una scurtă plină de semne de punctuație.',
  'auth.submitSignIn': 'Autentifică-te',
  'auth.submitRegister': 'Creează contul',
  'auth.working': 'Se lucrează…',
  'auth.google': 'Continuă cu Google',
  'auth.toRegister': 'Nu ai încă un cont? Creează-l',
  'auth.toSignIn': 'Ai deja cont? Autentifică-te',
  'auth.backToSearch': 'Înapoi la căutare',
  'auth.errorGoogleState':
    'Acel link de autentificare a expirat sau a fost deschis în alt navigator. Încearcă din nou.',
  'auth.errorGoogleFailed':
    'Autentificarea cu Google nu s-a finalizat. Poți folosi în schimb e-mail și parolă.',
  'auth.errorGeneric': 'Ceva n-a mers bine.',
  'bookmarks.title': 'Cărți salvate',
  'bookmarks.signedOut':
    'ca să păstrezi cărțile pe care le găsești — și ca să compari mai târziu, alături, ediții ale aceleiași cărți.',
  'bookmarks.loading': 'Se încarcă…',
  'bookmarks.empty':
    'Nu ai salvat nimic încă. Găsește o carte și folosește „Salvează această carte” pe fișa ei.',
  'bookmarks.searchLink': 'Caută',
  'bookmarks.remove': 'Elimină',
  'bookmarks.loadFailed': 'Cărțile tale salvate nu au putut fi încărcate.',
  'search.failed': 'Căutarea a eșuat.',
  'search.pending': 'Încă nu e în baza noastră de date — verificăm sursele',
  'search.pendingLong':
    'Încă se caută: prima cerere pentru o carte adună date din surse, ceea ce poate dura până la câteva minute',
  'search.notFoundHint': 'Nu s-a găsit nimic. Încearcă să precizezi titlul sau autorul.',
  'search.timedOut':
    'Sursele răspund încet și încă nu avem date. Sincronizarea din fundal s-ar putea să se fi încheiat deja — încearcă din nou.',
  'search.freeOnlyToggle': 'Gratuit de descărcat',
  'search.noFreeResults':
    'Niciuna dintre ele nu are încă o descărcare gratuită — încearcă să oprești filtrul.',
  'home.tagline': 'Găsește-ți următorul magnum opus',
  'subject.allLanguages': 'Toate limbile.',
  'subject.filteredByLanguage': 'Doar cărți care au o ediție în {language}.',
  'subject.dropLanguageFilter': 'arată toate limbile',
  'subject.empty':
    'Încă nu e nimic sub această etichetă. Etichetele vin din cărțile pe care această instanță le-a adus deja.',
  'featured.year': '{year}',
  'nav.browse': 'Răsfoiește după gen',
  'recommend.heading': 'Pornind de la ce ai citit',
  'recommend.becauseOf': 'Ai deschis „{title}”, deci iată cărți din aceleași genuri.',
  'recommend.blurb': 'Cărți din genurile pe care le-ai deschis.',
  'recommend.privacy':
    'Asta se calculează în navigatorul tău — serverului i se spun genurile, niciodată cine ești.',
  'recommend.forget': 'uită-mi istoricul',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Raft',
  'shelf.title': 'Raft',
  'shelf.intro':
    'Cataloage deschise și orice server de bibliotecă pe care îl rulezi tu. Cataloagele pe care le adaugi rămân în acest navigator și nu sunt trimise niciodată către acest site.',
  'shelf.openCatalogs': 'Cataloage deschise',
  'shelf.yourCatalogs': 'Cataloagele tale',
  'shelf.addCatalog': 'Adaugă un catalog',
  'shelf.name': 'Nume',
  'shelf.address': 'Adresă OPDS',
  'shelf.username': 'Nume de utilizator (opțional)',
  'shelf.password': 'Parolă (opțional)',
  'shelf.credentialsNote':
    'Adresa și eventualele date de autentificare sunt păstrate doar în acest navigator.',
  'shelf.add': 'Adaugă',
  'shelf.remove': 'Elimină',
  'shelf.loading': 'Se încarcă catalogul…',
  'shelf.empty': 'Acest catalog nu are intrări.',
  'shelf.noCatalogs':
    'Niciunul al tău încă. Adaugă mai jos o adresă de Calibre-Web, COPS, Kavita sau Audiobookshelf.',
  'shelf.unreachable':
    'Navigatorul tău nu a putut citi acest catalog. Un server din propria ta rețea va funcționa; site-urile publice refuză adesea cererile din altă origine.',
  'shelf.nextPage': 'Pagina următoare',
  'shelf.previousPage': 'Pagina anterioară',
  'shelf.drm': 'Necesită o aplicație cu DRM',
  'shelf.notFree': 'Nu este o descărcare gratuită',
  'shelf.download': 'Descarcă',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Librării în apropiere',
  'stores.useMyLocation': 'Folosește locația mea',
  'stores.placeLabel': 'Oraș sau cod poștal',
  'stores.find': 'Găsește',
  'stores.locating': 'Se caută…',
  'stores.failed': 'Locația nu este disponibilă. Scrie în schimb un oraș sau un cod poștal.',
  'stores.none': 'Nicio librărie pe hartă pe o rază de {radius} km.',
  'stores.distance': 'la {distance} km',
  'stores.stockUnknown': 'Doar date de hartă — nimeni nu publică ce are un magazin în stoc.',
  'stores.lookupFailed': 'Nu am putut contacta OpenStreetMap acum. Încearcă din nou în scurt timp.',
  'stores.privacy':
    'Locația ta este rotunjită la aproximativ 100 m și trimisă doar către OpenStreetMap — niciodată către acest site.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Prețuri și magazine',
  'prices.loading': 'Întrebăm magazinele…',
  'prices.unknown': 'Prețul nu este publicat',
  'prices.degraded': 'Niciun răspuns de la: {providers}',
  'prices.format.hardcover': 'Cartonată',
  'prices.format.paperback': 'Broșată',
  'prices.format.ebook': 'Carte electronică',
  'prices.format.audiobook': 'Audiobook',
  'prices.format.unknown': 'Format nespecificat',
  'recommend.hideGenre': 'ascunde „{genre}”',
  'recommend.hiddenList': 'Genuri ascunse (click pentru a readuce unul):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Salvat',
  'settings.status.cleared': 'Șters',
  'settings.status.unstored': 'Nesalvat',
  'settings.status.failed': 'Neschimbat',
  'settings.notStored':
    'Acest navigator a refuzat să păstreze modificarea, deci nu s-a întâmplat nimic — valoarea dinainte rămâne în vigoare.',
  'settings.language.title': 'Limba interfeței',
  'settings.language.changed':
    'Schimbată din {from} în {to}. Interfața se reîncarcă în {to}; titlurile cărților și numele autorilor rămân în limbile lor.',
  'settings.country.title': 'Țara de cumpărare',
  'settings.country.changed':
    'Setată la {country}. Linkurile către librării oferă acum magazine care livrează acolo, alături de cele internaționale.',
  'settings.country.cleared':
    'Nicio țară aleasă. Vor fi oferite doar librăriile care livrează în toată lumea.',
  'settings.bookLanguage.title': 'Limba cărților',
  'settings.bookLanguage.changed':
    'Setată la {language}. Paginile de gen vor pune în față cărțile care au o ediție în {language} până când resetezi filtrul.',
  'settings.bookLanguage.cleared': 'Șters. Paginile de gen arată din nou cărți în toate limbile.',
  'settings.hiddenGenres.title': 'Genuri ascunse',
  'settings.hiddenGenres.hidden':
    '„{genre}” este ascuns. Nu mai este trimis la server când se aduc sugestii, iar în total sunt {count} genuri ascunse.',
  'settings.hiddenGenres.restored':
    '„{genre}” este din nou în sugestiile tale. Rămân {count} genuri ascunse.',
  'settings.history.title': 'Istoric de lectură',
  'settings.history.cleared':
    'Cărțile pe care le deschiseseși au fost șterse din acest navigator. Sugestiile stau deoparte până deschizi altă carte.',
  'settings.bookmarks.title': 'Cărți salvate',
  'settings.bookmarks.added': '„{title}” a fost adăugată la cărțile tale salvate.',
  'settings.bookmarks.removed': '„{title}” a fost scoasă din cărțile tale salvate.',
  'settings.bookmarks.failed':
    'Serverul nu a acceptat modificarea, deci cărțile tale salvate au rămas cum erau.',
  'settings.catalogs.title': 'Cataloagele tale',
  'settings.catalogs.added':
    '„{name}” a fost adăugat la {url}. Adresa rămâne în acest navigator și nu este trimisă niciodată către acest site.',
  'settings.catalogs.addedWithCredentials':
    '„{name}” a fost adăugat la {url}, cu numele de utilizator și parola pe care le-ai scris. Totul rămâne în acest navigator și nimic nu este trimis către acest site.',
  'settings.catalogs.removed':
    '„{name}” a fost eliminat din acest navigator, împreună cu datele de autentificare păstrate pentru el.',
  'settings.catalogs.rejected': 'Nu s-a adăugat nimic: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Suplimente',
  'addons.title': 'Suplimente',
  'addons.intro':
    'Un supliment aduce surse proprii. Îl instalezi lipind adresa lui; rulează fie pe dispozitivul tău, într-un sandbox, fie pe serverul autorului său. Golden Library nu livrează niciunul, nu listează niciunul și nu verifică ce returnează.',
  'addons.addressLabel': 'Adresa suplimentului',
  'addons.addressHint': 'URL-ul manifestului pe care ți l-a dat autorul suplimentului.',
  'addons.continue': 'Continuă',
  'addons.fromServer': 'De pe un server',
  'addons.fromFile': 'Dintr-un fișier de pe dispozitivul tău',
  'addons.bundleLabel': 'Adresa codului suplimentului',
  'addons.bundleHint':
    'URL-ul codului suplimentului. Va rula pe acest dispozitiv, nu pe un server.',
  'addons.integrityLabel': 'Amprentă de integritate',
  'addons.integrityHint':
    'Dată de autorul suplimentului, ca sha256-… . Obligatorie: fără ea, codul pe care l-ai aprobat o dată s-ar putea schimba ulterior fără să afli vreodată.',
  'addons.checking': 'Se citește suplimentul…',
  'addons.installedHeading': 'Instalate',
  'addons.none':
    'Niciun supliment încă. Tot ce se vede până acum pe acest site vine de la instanța însăși.',
  'addons.priorityHint': 'Ordinea este prioritate: primul supliment răspunde primul.',
  'addons.enable': 'Pornește',
  'addons.disable': 'Oprește',
  'addons.off': 'Oprit',
  'addons.remove': 'Elimină',
  'addons.moveUp': 'Mută mai sus',
  'addons.moveDown': 'Mută mai jos',
  'addons.configure': 'Configurează',
  'addons.failedToStart': '„{name}” nu a pornit: {reason}',
  'addons.consentTitle': 'Instalezi „{name}”?',
  'addons.consentHosts': 'Va contacta: {hosts}',
  'addons.consentNoHosts': 'Nu a cerut să contacteze nimic.',
  'addons.consentSeesYou':
    'Acest supliment rulează pe serverul autorului său. El îți va vedea adresa și tot ce cauți prin el.',
  'addons.consentSandboxed':
    'Acest supliment rulează pe dispozitivul tău, într-un sandbox. Nu poate citi cookie-urile tale, datele acestui site sau altceva ce ai deschis.',
  'addons.consentNotVetted':
    'Golden Library nu verifică ce returnează un supliment și nu l-a recomandat pe acesta. Ce instalezi este alegerea ta.',
  'addons.install': 'Instalează',
  'addons.cancel': 'Anulează',
  'addons.via': 'prin {name}',
  'addons.sourcesTitle': 'De la suplimentele tale',
  'addons.searchTitle': 'Găsite de suplimentele tale',
  'addons.showLinks': 'Arată linkurile de descărcare',
  'addons.unreadable': '{count} intrări de la acest supliment nu au putut fi citite.',
  'addons.browse': 'Răsfoiește catalogul',
  'addons.browseTitle': 'Catalogul {name}',
  'addons.browseNoCatalog': 'Acest supliment nu oferă un catalog de răsfoit.',
  'addons.browseEmpty': 'Catalogul acestui supliment este gol acum.',
  'addons.browseFailed': 'Catalogul „{name}” nu a putut fi încărcat: {reason}',
  'addons.loadMore': 'Încarcă mai multe',
  'addons.notInstalled': 'Acest supliment nu este instalat.',

  'settings.addons.title': 'Suplimentele tale',
  'settings.addons.installed':
    '„{name}” este instalat. Va fi întrebat alături de celelalte și poate contacta {hosts}.',
  'settings.addons.removed':
    '„{name}” a fost eliminat. Rezultatele lui au dispărut din acest navigator, la fel și tot ce păstrase aici.',
  'settings.addons.enabled': '„{name}” este pornit din nou și va fi întrebat alături de celelalte.',
  'settings.addons.disabled':
    '„{name}” este oprit. Rămâne instalat cu setările lui, dar nimic din ce returnează nu va fi afișat.',
  'settings.addons.reordered': '„{name}” răspunde acum al {position}-lea din {total}.',
  'settings.addons.rejected': 'Nu s-a instalat nimic: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Surse proprii',
  'customSources.title': 'Surse proprii',
  'customSources.intro':
    'Adaugă-ți propriul magazin sau catalog dându-i un nume și un URL de căutare care conține {isbn}, {query}, {title}, {author} sau {language}. Linkul se construiește pe acest dispozitiv, iar acest site nu îl accesează niciodată.',
  'customSources.nameLabel': 'Nume',
  'customSources.templateLabel': 'Șablon de URL',
  'customSources.templateHint':
    'O adresă https:// absolută. {isbn}, {query}, {title}, {author} și {language} se completează din ediție; un substituent rămas gol înseamnă că linkul este sărit pentru acea ediție.',
  'customSources.add': 'Adaugă sursă',
  'customSources.listHeading': 'Sursele tale',
  'customSources.none': 'Nicio sursă proprie încă.',
  'customSources.off': 'Oprită',
  'customSources.enable': 'Pornește',
  'customSources.disable': 'Oprește',
  'customSources.remove': 'Elimină',
  'customSources.heading': 'Sursele tale',
  'customSources.caption':
    'Linkuri pe care le-ai configurat singur. Această instanță nu verifică unde duc.',

  'settings.customSources.title': 'Sursele tale proprii',
  'settings.customSources.added': '„{name}” a fost adăugată și va fi oferită alături de celelalte.',
  'settings.customSources.removed': '„{name}” a fost eliminată din acest navigator.',
  'settings.customSources.enabled': '„{name}” este pornită din nou.',
  'settings.customSources.disabled':
    '„{name}” este oprită. Rămâne configurată, dar linkul ei nu va fi afișat.',
  'settings.customSources.rejected': 'Nu s-a adăugat nimic: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Cărți în limba ta',
  'featured.inLanguageBlurb':
    'Cărți scrise în limba în care citești acest site, cele mai publicate primele — ordinea proprie a Open Library, nu un clasament de bestselleruri.',
  'work.newSearch': 'Căutare nouă',
  'work.descriptionFrom': 'Descriere:',
  'work.descriptionNotLocalized':
    'Această descriere este în limba în care a scris-o sursa — în limba ta nu există încă una pentru această carte.',

  // Reader ratings of an edition, never of a translation — see TranslationRatings.tsx.
  'ratings.edition': '{average} din {outOf} de la {votes} cititori pe {source}',
  'ratings.lowConfidence': 'prea puține voturi pentru o comparație',
  'ratings.reviews': 'Recenzii',
  'ratings.reviewsOn': 'Recenzii ale acestei ediții pe {source}',
  'ratings.noteNoRatings':
    'Nicio sursă deschisă nu notează o traducere, iar niciunul dintre aceste tiraje nu are aici o notă de la cititori.',
  'ratings.noteReviews':
    'Acolo unde o ediție este cunoscută pe {sources}, linkul duce la recenziile exact ale acelui tiraj — majoritatea edițiilor nu sunt.',
  'ratings.translator':
    'Ediții traduse de {name}: {average} din {outOf} pe {editions} ediții notate, {votes} cititori în total.',
  'ratings.note':
    'Acestea sunt notele cititorilor pentru o anumită ediție pe {sources}, nu o evaluare a traducerii în sine — asta nu publică nimeni. Merită citite alături: aceeași carte, aceeași limbă, traducători diferiți, și mereu cu numărul de voturi la vedere.',
  'ratings.gapWithoutIsbn':
    '{count} ediții de aici nu au ISBN, așa că nicio notă nu a putut fi asociată cu ele.',
  'ratings.gapNotLookedUp': 'Alte {count} ediții nu au fost căutate în această cerere.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Citește în navigatorul tău',
  'reader.privacy':
    'Navigatorul tău deschide singur această carte. Fișierul, locul din care a venit și cât ai citit nu ajung niciodată la acest site.',
  'reader.chooseFile': 'Deschide o carte de pe acest dispozitiv',
  'reader.formats': 'EPUB, FB2, MOBI și CBZ.',
  'reader.loading': 'Se deschide…',
  'reader.failed': 'Această carte nu a putut fi deschisă: {reason}',
  'reader.previous': 'Pagina anterioară',
  'reader.next': 'Pagina următoare',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…sau lasă o carte aici',
  'reader.fetching': 'Se cere fișierul de la {host}…',
  'reader.blockedTitle': '{host} nu a predat fișierul acestei pagini',
  'reader.blockedBody':
    'Fie nu poate fi contactat, fie nu permite altor site-uri să îi citească fișierele. Acest site nu îl aduce în locul tău: cartea ta nu trece niciodată prin el, și tocmai în asta constă cititul aici.',
  'reader.blockedDownload': 'Descarc-o de la {host}',
  'reader.blockedOpenHere': 'apoi deschide-o aici, de pe dispozitivul tău',
  'reader.blockedAddon': 'Merge și un supliment care servește el însuși fișierul.',
  'reader.keepFile': 'Păstrează această carte în acest navigator',
  'reader.keepFileHint':
    'Oprit implicit. Fără el, fișierul dispare când închizi fila; cu el, rămâne doar pe acest dispozitiv.',
  'reader.library': 'Păstrate în acest navigator',
  'reader.libraryEmpty':
    'Nimic păstrat încă. Cărțile pe care le păstrezi rămân pe acest dispozitiv și nu sunt încărcate nicăieri.',
  'reader.libraryOpen': 'Deschide',
  'reader.libraryRemove': 'Elimină',
  'reader.libraryFileKept': 'fișier păstrat',
  'reader.libraryFileGone': 'fișier nepăstrat',
  'reader.untitled': 'Carte fără titlu',
  'settings.reader.libraryTitle': 'Cărți păstrate în acest navigator',
  'settings.reader.kept':
    '„{title}” este acum păstrată pe acest dispozitiv, deci se deschide fără să fie descărcată din nou. Nu este încărcată nicăieri.',
  'settings.reader.forgotten':
    'Fișierul pentru „{title}” a fost șters din acest navigator. Rămâne în listă, așa că o poți deschide din nou de la sursa ei.',
  'settings.reader.removed':
    '„{title}” a fost eliminată complet din acest navigator — fișierul și intrarea.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Deschisă de unde ai rămas — la {percent}%.',
  'reader.bookmarks': 'Semne de carte',
  'reader.bookmarkAdd': 'Pune semn la această pagină',
  'reader.bookmarkNone': 'Încă niciun semn de carte în această carte.',
  'reader.bookmarkGo': 'Mergi la',
  'reader.bookmarkRemove': 'Elimină semnul',
  'reader.bookmarkNote': 'Notă',
  'reader.bookmarkNotePlaceholder': 'Cuvintele tale despre această pagină',
  'reader.bookmarkAt': 'la {percent}%',
  'settings.reader.bookmarkTitle': 'Semne de carte în acest navigator',
  'settings.reader.bookmarkAdded':
    'Semn pus la {percent}% din „{title}”. Semnele rămân pe acest dispozitiv, împreună cu cartea.',
  'settings.reader.bookmarkRemoved': 'Acel semn din „{title}” a fost eliminat din acest navigator.',
  'settings.reader.noteSaved':
    'Nota ta de pe această pagină din „{title}” a fost salvată pe acest dispozitiv.',
  'settings.reader.positionTitle': 'Poziția în lectură',
  'settings.reader.positionUnstored':
    'Acest navigator nu a păstrat unde ai rămas în „{title}”, deci data viitoare se va deschide de la început. Modul privat și un disc plin fac amândouă asta.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': 'Cum arată această carte',
  'reader.theme': 'Culori',
  'reader.themeApp': 'După site',
  'reader.themeLight': 'Hârtie',
  'reader.themeDark': 'Cerneală',
  'reader.themeSepia': 'Sepia',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint':
    'Negru pur pe alb, fără animație, o singură coloană — pentru ecrane cu cerneală electronică.',
  'reader.fontSize': 'Mărimea literelor',
  'reader.smaller': 'Mai mic',
  'reader.larger': 'Mai mare',
  'reader.lineHeight': 'Spațiere între rânduri',
  'reader.margin': 'Margini',
  'reader.flow': 'Pagini',
  'reader.flowPaged': 'Întoarce paginile',
  'reader.flowScrolled': 'Derulează',
  'reader.justify': 'Aliniere stânga-dreapta',
  'reader.hyphenate': 'Despărțire în silabe',
  'reader.displayReset': 'Înapoi la valorile implicite',
  'settings.reader.displayTitle': 'Afișarea la lectură',
  'settings.reader.displayChanged':
    '{setting} este acum {value}. Se aplică fiecărei cărți pe care o deschizi în acest navigator.',
  'settings.reader.displayReset':
    'Afișarea la lectură a revenit la valorile implicite pentru fiecare carte din acest navigator.',
  'reader.on': 'Pornit',
  'reader.off': 'Oprit',
  'reader.openHere': 'Citește în navigatorul tău',
  'reader.notAFileTitle': '{host} a trimis o pagină web, nu fișierul',
  'reader.notAFileBody':
    'Linkul duce la o pagină, nu la o carte — o pagină de descărcare, un ecran de consimțământ sau o verificare că nu ești robot. Deschide-o tu și fișierul va fi acolo.',
  'settings.status.session': 'Nereținut',
  'settings.notRemembered':
    'Acest navigator nu a reținut, deci data viitoare când deschizi o carte totul va fi cum era.',
  'compare.rowEditionStatement': 'Ediție',
  'home.genres': 'Genuri populare',
  'home.genresBlurb':
    'Etichetele cu cele mai multe cărți în spate. Fiecare își deschide catalogul.',
};
