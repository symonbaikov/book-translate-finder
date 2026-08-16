import type { Dictionary } from '../dictionary';

export const fi: Dictionary = {
  'nav.savedBooks': 'Tallennetut kirjat',
  'nav.signIn': 'Kirjaudu sisään',
  'nav.signOut': 'Kirjaudu ulos',
  'nav.language': 'Kieli',
  'nav.skipToContent': 'Siirry sisältöön',
  'footer.legal':
    'Vain lailliset lähteet: suora lataus ainoastaan vapaan käyttöoikeuden ja avoimien lisenssien teoksille; tekijänoikeuden alaiset kirjat — osto tai kirjastolaina. Jokaisessa linkissä lukee sen oikeudellinen tila.',
  'footer.openSource': 'Avoin lähdekoodi',
  'footer.openSourceRest': '— MIT-lisenssi, voit ajaa omalla palvelimellasi. Koodi on GitHubissa.',
  'home.title': 'Golden Library',
  'home.subtitle': 'Avoin kirjakäännösten kooste: kielet, laitokset ja lailliset lähteet.',
  'home.searchLabel': 'Nimeke ja tekijä',
  'home.searchPlaceholder': 'Sota ja rauha Tolstoi',
  'home.searchButton': 'Hae',
  'search.searching': 'Haetaan…',
  'search.backfilling':
    'Täällä ei ole vielä mitään — haemme kirjaa lähteistä. Tämä kestää muutaman sekunnin.',
  'search.notFound': 'Tällä haulla ei löytynyt mitään.',
  'search.retry': 'Yritä uudelleen',
  'search.signInPrompt':
    'tallentaaksesi täältä löytämäsi kirjat ja palataksesi niihin — ja vertaillaksesi eri vuosien laitoksia rinnakkain ennen valintaa.',
  'featured.yearHeading': 'Vuoden kirjat',
  'featured.yearBlurb':
    'Huomionarvoisia kirjoja kultakin viime vuodelta. Käsin koottu lista, ei myyntitilasto — sellaista ei julkaise yksikään avoin lähde.',
  'featured.popularHeading': 'Paljon luettuja, paljon käännettyjä',
  'featured.popularBlurb':
    'Kirjoja, joita on monella kielellä — juuri sitä varten tämä sivusto on.',
  'featured.filling':
    'Osaa näistä haetaan yhä taustalla. Lataa sivu uudelleen minuutin kuluttua nähdäksesi loput.',
  'featured.freeCopy': 'Ilmainen kappale',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Luettavissa ilmaiseksi heti',
  'free.homeBlurb':
    'Vapaan käyttöoikeuden ja avoimen lisenssin kirjoja, jotka tämä sivuston kopio voi antaa sinulle suoraan.',
  'free.seeAll': 'Katso lisää',
  'free.downloadable': 'Lataa',
  'free.pageTitle': 'Ilmaiset kirjat',
  'free.pageBlurb':
    'Jokaisesta täällä olevasta kirjasta on ainakin yksi laillinen ilmainen kappale — vapaan käyttöoikeuden teos tai oikeudenhaltijan lahjoittama. Ei ostoa, ei kirjastokorttia.',
  'free.empty':
    'Täällä ei ole vielä mitään ilmaista. Ilmaisia kappaleita ilmestyy sitä mukaa kun tämä instanssi hakee kirjoja, joten hae jotakin ja palaa myöhemmin.',
  'free.emptyForLanguage':
    'Kielellä {language} ei ole vielä ilmaisia kappaleita. Poista yllä oleva suodatin nähdäksesi koko hyllyn.',
  'free.showMore': 'Näytä lisää',
  'free.shown': 'Näytetään {shown}/{total}.',
  'free.allLanguages': 'Ilmaisia kappaleita kaikilla kielillä.',
  'free.filteredByLanguage': 'Vain ilmaiset kappaleet kielellä {language}.',
  'free.filterByLanguage': 'Näytä vain ilmaiset kappaleet kielellä {language}.',
  'free.dropLanguageFilter': 'näytä kaikki kielet',
  'free.loadFailed': 'Ilmaisia kirjoja ei saatu juuri nyt ladattua.',
  'work.original': 'alkuteos',
  'work.dataSources': 'Tietolähteet',
  'work.about': 'Tietoa kirjasta',
  'work.translatedInto': 'Käännetty kielille',
  'work.availableIn': 'Saatavilla kielillä',
  'work.languagesNote':
    'Vain se, mitä lukemamme lähteet luettelevat — täältä puuttuva käännös voi silti olla olemassa.',
  'work.noTranslations': 'Käännöksiä ei ole vielä löytynyt.',
  'work.yourLanguage.title': 'Omalla kielelläsi',
  'work.yourLanguage.yes': 'Kielelle {language} on käännös.',
  'work.yourLanguage.original': 'Tämä kirja on kirjoitettu kielellä {language}.',
  'work.yourLanguage.no': 'Täällä tunnetuista laitoksista ei löydy käännöstä kielelle {language}.',
  'work.yourLanguage.show': 'Näytä laitokset kielellä {language}',
  'work.editions': 'Laitokset ({shown}/{total})',
  'work.filterLanguage': 'Kieli',
  'work.filterAllLanguages': 'Kaikki kielet',
  'work.filterYear': 'Vuosi',
  'work.filterApply': 'Suodata',
  'work.filterReset': 'Tyhjennä',
  'work.noEditionsMatch': 'Mikään laitos ei vastaa näitä suodattimia.',
  'work.showMoreEditions': 'Näytä lisää laitoksia ({remaining} jäljellä)',
  'work.badgeFreeDownload': 'ilmainen lataus',
  'work.freeDownloadFormat': 'Lataa {format}',
  'work.freeDownloadNote': '{rights}. Ilmaiseksi lähteestä {provider} — ei tiliä, ei maksua.',
  'work.badgeReadBorrow': 'lue tai lainaa',
  'work.badgeInBookstores': 'kirjakaupoissa',
  'work.translatedBy': 'suomentanut {name}',
  'work.pages': '{count} sivua',
  'bookmark.save': 'Tallenna tämä kirja',
  'bookmark.saved': 'Tallennettu',
  'bookmark.signInToSave': 'Kirjaudu sisään tallentaaksesi',
  'bookmark.failed': 'Tallennus ei onnistunut. Yritä uudelleen.',
  'links.show': 'Näytä linkit',
  'links.hide': 'Piilota linkit',
  'links.loading': 'Ladataan linkkejä',
  'links.none': 'Tälle laitokselle ei ole vielä laillisia linkkejä.',
  'links.viaOtherEdition': 'ilmainen kappale laitoksesta {label}',
  'links.failed': 'Linkkien lataus epäonnistui.',
  'links.storesHeading': 'Etsi kirjakaupasta',
  'links.storesInCountry': 'Maassa {country}',
  'links.storesYourCountry': 'oma maasi',
  'links.storesLanguageMarket': 'Missä myydään kielellä {language} olevia kirjoja',
  'links.storesLanguageMarketGeneric': 'Missä tämän laitoksen kieltä myydään',
  'links.storesWorldwide': 'Toimittaa maailmanlaajuisesti',
  'links.storesCaption':
    'Jokainen linkki hakee kaupan omasta luettelosta — saatavuuden ja hinnan näyttää kauppa itse.',
  'linkType.download': 'Lataa',
  'linkType.buy': 'Osta',
  'linkType.borrow': 'Lainaa kirjastosta',
  'linkType.listen': 'Kuuntele (äänikirja)',
  'rights.public_domain': 'Vapaa käyttöoikeus',
  'rights.open_license': 'Avoin lisenssi',
  'rights.copyrighted': 'Tekijänoikeuden alainen',
  'rights.unknown': 'Tila tuntematon',
  'compare.heading': 'Vertaa laitoksia',
  'compare.blurb': 'Valitse kaksi tai kolme laitosta nähdäksesi, mikä niissä oikeasti eroaa.',
  'compare.selected': 'Valittu {count}, tarvitaan vähintään 2.',
  'compare.editSelection': 'Vaihda laitoksia',
  'compare.showAllEditions': 'Näytä kaikki {count} laitosta',
  'compare.columnDifference': 'Ero',
  'compare.identical': 'Nämä laitokset ovat samanlaiset kaikessa, minkä lähteet kirjaavat.',
  'compare.rowLanguage': 'Kieli',
  'compare.rowPublished': 'Julkaistu',
  'compare.rowPublisher': 'Kustantaja',
  'compare.rowTranslator': 'Kääntäjä',
  'compare.rowTranslatedFrom': 'Käännetty kielestä',
  'compare.rowBinding': 'Sidonta',
  'compare.rowPages': 'Sivuja',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Ilmainen tai lainattava kappale',
  'compare.yes': 'kyllä ({count})',
  'compare.no': 'ei löytynyt',
  'country.label': 'Mistä ostat kirjoja?',
  'country.worldwideOnly': 'Vain maailmanlaajuisesti toimittavat kaupat',
  'auth.signInTitle': 'Kirjaudu sisään',
  'auth.registerTitle': 'Luo tili',
  'auth.blurb':
    'Tili on olemassa yhtä tarkoitusta varten: tallentaa löytämiäsi kirjoja ja palata niihin — kielineen, joille ne on käännetty, olemassa olevine laitoksineen ja tietoineen siitä, mistä kunkin saa laillisesti. Ei uutiskirjettä, ei profiilia, ei seurantaa.',
  'auth.name': 'Nimi (valinnainen)',
  'auth.email': 'Sähköposti',
  'auth.password': 'Salasana',
  'auth.passwordHint':
    'Vähintään {min} merkkiä. Vain pituus tarkistetaan — pitkä lause, jonka muistat, on parempi kuin lyhyt välimerkkeineen.',
  'auth.submitSignIn': 'Kirjaudu sisään',
  'auth.submitRegister': 'Luo tili',
  'auth.working': 'Työstetään…',
  'auth.google': 'Jatka Googlella',
  'auth.toRegister': 'Eikö sinulla ole tiliä? Luo sellainen',
  'auth.toSignIn': 'Onko sinulla jo tili? Kirjaudu sisään',
  'auth.backToSearch': 'Takaisin hakuun',
  'auth.errorGoogleState':
    'Kirjautumislinkki vanheni tai avattiin eri selaimessa. Yritä uudelleen.',
  'auth.errorGoogleFailed':
    'Google-kirjautuminen ei mennyt loppuun. Voit käyttää sen sijaan sähköpostia ja salasanaa.',
  'auth.errorGeneric': 'Jokin meni pieleen.',
  'bookmarks.title': 'Tallennetut kirjat',
  'bookmarks.signedOut':
    'säilyttääksesi löytämäsi kirjat — ja vertaillaksesi myöhemmin saman kirjan laitoksia rinnakkain.',
  'bookmarks.loading': 'Ladataan…',
  'bookmarks.empty':
    'Mitään ei ole vielä tallennettu. Etsi kirja ja käytä sen kortin ”Tallenna tämä kirja” -painiketta.',
  'bookmarks.searchLink': 'Hae',
  'bookmarks.remove': 'Poista',
  'bookmarks.loadFailed': 'Tallennettujen kirjojesi lataus ei onnistunut.',
  'search.failed': 'Haku epäonnistui.',
  'search.pending': 'Ei vielä tietokannassamme — tarkistamme lähteet',
  'search.pendingLong':
    'Haku on yhä kesken: ensimmäinen kysely kirjasta kerää tiedot lähteistä, mikä voi kestää pari minuuttia',
  'search.notFoundHint': 'Ei löytynyt mitään. Kokeile tarkentaa nimekettä tai tekijää.',
  'search.timedOut':
    'Lähteet vastaavat hitaasti eikä meillä ole vielä tietoja. Taustasynkronointi on ehkä jo valmis — yritä uudelleen.',
  'search.freeOnlyToggle': 'Ilmaiseksi ladattavissa',
  'search.noFreeResults':
    'Yhdessäkään näistä ei ole vielä ilmaista latausta — kokeile poistaa suodatin.',
  'home.tagline': 'Löydä seuraava magnum opuksesi',
  'subject.allLanguages': 'Kaikki kielet.',
  'subject.filteredByLanguage': 'Vain kirjat, joista on laitos kielellä {language}.',
  'subject.dropLanguageFilter': 'näytä kaikki kielet',
  'subject.empty':
    'Tämän tunnisteen alla ei ole vielä mitään. Tunnisteet tulevat kirjoista, jotka tämä instanssi on jo hakenut.',
  'featured.year': '{year}',
  'nav.browse': 'Selaa lajityypeittäin',
  'recommend.heading': 'Sen perusteella, mitä olet lukenut',
  'recommend.becauseOf': 'Avasit teoksen ”{title}”, joten tässä on kirjoja samoista lajityypeistä.',
  'recommend.blurb': 'Kirjoja niistä lajityypeistä, joita olet avannut.',
  'recommend.privacy':
    'Tämä lasketaan selaimessasi — palvelimelle kerrotaan lajityypit, ei koskaan sitä, kuka olet.',
  'recommend.forget': 'unohda historiani',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Hylly',
  'shelf.title': 'Hylly',
  'shelf.intro':
    'Avoimia luetteloita ja mikä tahansa itse ylläpitämäsi kirjastopalvelin. Lisäämäsi luettelot jäävät tähän selaimeen eikä niitä lähetetä koskaan tälle sivustolle.',
  'shelf.openCatalogs': 'Avoimet luettelot',
  'shelf.yourCatalogs': 'Omat luettelosi',
  'shelf.addCatalog': 'Lisää luettelo',
  'shelf.name': 'Nimi',
  'shelf.address': 'OPDS-osoite',
  'shelf.username': 'Käyttäjätunnus (valinnainen)',
  'shelf.password': 'Salasana (valinnainen)',
  'shelf.credentialsNote': 'Osoite ja mahdolliset tunnukset tallennetaan vain tähän selaimeen.',
  'shelf.add': 'Lisää',
  'shelf.remove': 'Poista',
  'shelf.loading': 'Ladataan luetteloa…',
  'shelf.empty': 'Tässä luettelossa ei ole tietueita.',
  'shelf.noCatalogs':
    'Ei vielä omia. Lisää alle Calibre-Webin, COPSin, Kavitan tai Audiobookshelfin osoite.',
  'shelf.unreachable':
    'Selaimesi ei pystynyt lukemaan tätä luetteloa. Oman verkkosi palvelin toimii; julkiset sivustot torjuvat usein toisesta lähteestä tulevat pyynnöt.',
  'shelf.nextPage': 'Seuraava sivu',
  'shelf.previousPage': 'Edellinen sivu',
  'shelf.drm': 'Vaatii DRM-sovelluksen',
  'shelf.notFree': 'Ei ilmainen lataus',
  'shelf.download': 'Lataa',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Kirjakaupat lähelläsi',
  'stores.useMyLocation': 'Käytä sijaintiani',
  'stores.placeLabel': 'Kaupunki tai postinumero',
  'stores.find': 'Etsi',
  'stores.locating': 'Etsitään…',
  'stores.failed': 'Sijainti ei ole saatavilla. Kirjoita sen sijaan kaupunki tai postinumero.',
  'stores.none': '{radius} km:n säteellä ei ole kartoitettuja kirjakauppoja.',
  'stores.distance': '{distance} km päässä',
  'stores.stockUnknown': 'Vain karttatietoa — kukaan ei julkaise, mitä kaupan hyllyssä on.',
  'stores.lookupFailed': 'OpenStreetMapiin ei juuri nyt saatu yhteyttä. Yritä hetken kuluttua.',
  'stores.privacy':
    'Sijaintisi pyöristetään noin 100 metriin ja lähetetään vain OpenStreetMapiin — ei koskaan tälle sivustolle.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Hinnat ja kaupat',
  'prices.loading': 'Kysytään kaupoilta…',
  'prices.unknown': 'Hintaa ei ole julkaistu',
  'prices.degraded': 'Ei vastausta: {providers}',
  'prices.format.hardcover': 'Kovakantinen',
  'prices.format.paperback': 'Pehmeäkantinen',
  'prices.format.ebook': 'E-kirja',
  'prices.format.audiobook': 'Äänikirja',
  'prices.format.unknown': 'Muotoa ei ilmoitettu',
  'recommend.hideGenre': 'piilota ”{genre}”',
  'recommend.hiddenList': 'Piilotetut lajityypit (napsauta palauttaaksesi):',

  // --- Settings popups ------------------------------------------------------
  'settings.status.saved': 'Tallennettu',
  'settings.status.cleared': 'Tyhjennetty',
  'settings.status.unstored': 'Ei tallennettu',
  'settings.status.failed': 'Ennallaan',
  'settings.notStored':
    'Tämä selain kieltäytyi tallentamasta muutosta, joten mitään ei tapahtunut — aiempi arvo on yhä voimassa.',
  'settings.language.title': 'Käyttöliittymän kieli',
  'settings.language.changed':
    'Vaihdettu kielestä {from} kieleen {to}. Käyttöliittymä latautuu uudelleen kielellä {to}; kirjojen nimekkeet ja tekijöiden nimet pysyvät omilla kielillään.',
  'settings.country.title': 'Ostomaa',
  'settings.country.changed':
    'Asetettu: {country}. Kirjakauppalinkit tarjoavat nyt sinne toimittavia kauppoja maailmanlaajuisten rinnalla.',
  'settings.country.cleared':
    'Maata ei ole valittu. Tarjolla ovat vain maailmanlaajuisesti toimittavat kirjakaupat.',
  'settings.bookLanguage.title': 'Kirjojen kieli',
  'settings.bookLanguage.changed':
    'Asetettu: {language}. Lajityyppisivut nostavat ensin kirjat, joista on laitos kielellä {language}, kunnes tyhjennät suodattimen.',
  'settings.bookLanguage.cleared':
    'Tyhjennetty. Lajityyppisivut näyttävät taas kirjoja kaikilla kielillä.',
  'settings.hiddenGenres.title': 'Piilotetut lajityypit',
  'settings.hiddenGenres.hidden':
    'Lajityyppi ”{genre}” on piilotettu. Sitä ei enää lähetetä palvelimelle ehdotuksia haettaessa, ja piilotettuja lajityyppejä on yhteensä {count}.',
  'settings.hiddenGenres.restored':
    'Lajityyppi ”{genre}” on taas ehdotuksissasi. {count} lajityyppiä on yhä piilotettuna.',
  'settings.history.title': 'Lukuhistoria',
  'settings.history.cleared':
    'Avaamasi kirjat on poistettu tästä selaimesta. Ehdotukset pysyvät poissa, kunnes avaat uuden kirjan.',
  'settings.bookmarks.title': 'Tallennetut kirjat',
  'settings.bookmarks.added': '”{title}” lisättiin tallennettuihin kirjoihisi.',
  'settings.bookmarks.removed': '”{title}” poistettiin tallennetuista kirjoistasi.',
  'settings.bookmarks.failed':
    'Palvelin ei hyväksynyt muutosta, joten tallennetut kirjasi ovat ennallaan.',
  'settings.catalogs.title': 'Omat luettelosi',
  'settings.catalogs.added':
    '”{name}” lisättiin osoitteeseen {url}. Osoite jää tähän selaimeen eikä sitä lähetetä koskaan tälle sivustolle.',
  'settings.catalogs.addedWithCredentials':
    '”{name}” lisättiin osoitteeseen {url} kirjoittamallasi käyttäjätunnuksella ja salasanalla. Kaikki jää tähän selaimeen eikä mitään lähetetä tälle sivustolle.',
  'settings.catalogs.removed':
    '”{name}” poistettiin tästä selaimesta yhdessä sille tallennettujen tunnusten kanssa.',
  'settings.catalogs.rejected': 'Mitään ei lisätty: {reason}',

  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Lisäosat',
  'addons.title': 'Lisäosat',
  'addons.intro':
    'Lisäosa tuo mukanaan omat lähteensä. Asennat sen liittämällä sen osoitteen; se toimii joko laitteellasi hiekkalaatikossa tai tekijänsä palvelimella. Golden Library ei toimita yhtäkään, ei luetteloi yhtäkään eikä tarkista, mitä ne palauttavat.',
  'addons.addressLabel': 'Lisäosan osoite',
  'addons.addressHint': 'Manifestin URL, jonka lisäosan tekijä antoi sinulle.',
  'addons.continue': 'Jatka',
  'addons.fromServer': 'Palvelimelta',
  'addons.fromFile': 'Tiedostosta laitteellasi',
  'addons.bundleLabel': 'Lisäosan koodin osoite',
  'addons.bundleHint': 'Lisäosan koodin URL. Se suoritetaan tällä laitteella, ei palvelimella.',
  'addons.integrityLabel': 'Eheystiiviste',
  'addons.integrityHint':
    'Lisäosan tekijän antama, muodossa sha256-… . Pakollinen: ilman sitä kerran hyväksymäsi koodi voisi muuttua jälkikäteen ilman että saisit tietää.',
  'addons.checking': 'Luetaan lisäosaa…',
  'addons.installedHeading': 'Asennetut',
  'addons.none':
    'Ei vielä lisäosia. Kaikki tällä sivustolla toistaiseksi tulee instanssilta itseltään.',
  'addons.priorityHint': 'Järjestys on prioriteetti: ensimmäinen lisäosa vastaa ensin.',
  'addons.enable': 'Ota käyttöön',
  'addons.disable': 'Poista käytöstä',
  'addons.off': 'Pois',
  'addons.remove': 'Poista',
  'addons.moveUp': 'Siirrä ylös',
  'addons.moveDown': 'Siirrä alas',
  'addons.configure': 'Määritä',
  'addons.failedToStart': '”{name}” ei käynnistynyt: {reason}',
  'addons.consentTitle': 'Asennetaanko ”{name}”?',
  'addons.consentHosts': 'Se ottaa yhteyttä: {hosts}',
  'addons.consentNoHosts': 'Se ei ole pyytänyt yhteyttä mihinkään.',
  'addons.consentSeesYou':
    'Tämä lisäosa toimii tekijänsä palvelimella. He näkevät osoitteesi ja kaiken, mitä sen kautta haet.',
  'addons.consentSandboxed':
    'Tämä lisäosa toimii laitteellasi hiekkalaatikossa. Se ei voi lukea evästeitäsi, tämän sivuston tietoja eikä mitään muuta, mikä sinulla on auki.',
  'addons.consentNotVetted':
    'Golden Library ei tarkista, mitä lisäosa palauttaa, eikä ole suositellut tätä. Se, mitä asennat, on oma valintasi.',
  'addons.install': 'Asenna',
  'addons.cancel': 'Peruuta',
  'addons.via': 'lähteestä {name}',
  'addons.sourcesTitle': 'Lisäosistasi',
  'addons.searchTitle': 'Lisäosiesi löytämät',
  'addons.showLinks': 'Näytä latauslinkit',
  'addons.unreadable': 'Tämän lisäosan {count} tietuetta ei voitu lukea.',
  'addons.browse': 'Selaa luetteloa',
  'addons.browseTitle': 'Lisäosan {name} luettelo',
  'addons.browseNoCatalog': 'Tämä lisäosa ei tarjoa selattavaa luetteloa.',
  'addons.browseEmpty': 'Tämän lisäosan luettelo on tällä hetkellä tyhjä.',
  'addons.browseFailed': 'Lisäosan ”{name}” luettelon lataus epäonnistui: {reason}',
  'addons.loadMore': 'Lataa lisää',
  'addons.notInstalled': 'Tätä lisäosaa ei ole asennettu.',

  'settings.addons.title': 'Lisäosasi',
  'settings.addons.installed':
    '”{name}” on asennettu. Sitä kysytään muiden ohella, ja se voi ottaa yhteyttä: {hosts}.',
  'settings.addons.removed':
    '”{name}” poistettiin. Sen tulokset ovat poissa tästä selaimesta, samoin kaikki, mitä se oli tänne tallentanut.',
  'settings.addons.enabled': '”{name}” on taas päällä ja sitä kysytään muiden ohella.',
  'settings.addons.disabled':
    '”{name}” on pois päältä. Se pysyy asennettuna asetuksineen, mutta mitään sen palauttamaa ei näytetä.',
  'settings.addons.reordered': '”{name}” vastaa nyt sijalla {position}/{total}.',
  'settings.addons.rejected': 'Mitään ei asennettu: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Omat lähteet',
  'customSources.title': 'Omat lähteet',
  'customSources.intro':
    'Lisää oma kauppasi tai luettelosi antamalla sille nimi ja haku-URL, jossa on {isbn}, {query}, {title}, {author} tai {language}. Linkki muodostetaan tällä laitteella eikä tämä sivusto koskaan hae sitä.',
  'customSources.nameLabel': 'Nimi',
  'customSources.templateLabel': 'URL-malli',
  'customSources.templateHint':
    'Absoluuttinen https://-osoite. {isbn}, {query}, {title}, {author} ja {language} täytetään laitoksen tiedoista; tyhjäksi jäävä paikkamerkki tarkoittaa, että linkki ohitetaan kyseisen laitoksen kohdalla.',
  'customSources.add': 'Lisää lähde',
  'customSources.listHeading': 'Omat lähteesi',
  'customSources.none': 'Ei vielä omia lähteitä.',
  'customSources.off': 'Pois',
  'customSources.enable': 'Ota käyttöön',
  'customSources.disable': 'Poista käytöstä',
  'customSources.remove': 'Poista',
  'customSources.heading': 'Omat lähteesi',
  'customSources.caption':
    'Itse määrittämäsi linkit. Tämä instanssi ei tarkista, minne ne johtavat.',

  'settings.customSources.title': 'Omat lähteesi',
  'settings.customSources.added': '”{name}” lisättiin ja sitä tarjotaan muiden ohella.',
  'settings.customSources.removed': '”{name}” poistettiin tästä selaimesta.',
  'settings.customSources.enabled': '”{name}” on taas käytössä.',
  'settings.customSources.disabled':
    '”{name}” on pois käytöstä. Se pysyy määritettynä, mutta sen linkkiä ei näytetä.',
  'settings.customSources.rejected': 'Mitään ei lisätty: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Kirjoja omalla kielelläsi',
  'featured.inLanguageBlurb':
    'Kirjoja, jotka on kirjoitettu sillä kielellä, jolla luet tätä sivustoa, eniten julkaistut ensin — Open Libraryn oma järjestys, ei bestseller-lista.',
  'work.newSearch': 'Uusi haku',
  'work.descriptionFrom': 'Kuvaus:',
  'work.descriptionNotLocalized':
    'Tämä kuvaus on sillä kielellä, jolla lähde sen kirjoitti — omalla kielelläsi ei ole vielä kuvausta tälle kirjalle.',
};
