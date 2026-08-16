import type { Dictionary } from '../dictionary';

export const tr: Dictionary = {
  'nav.savedBooks': 'Kaydedilen kitaplar',
  'nav.signIn': 'Giriş yap',
  'nav.signOut': 'Çıkış yap',
  'nav.language': 'Dil',
  'nav.skipToContent': 'İçeriğe geç',
  'footer.legal':
    'Yalnızca yasal kaynaklar: doğrudan indirme sadece kamu malı ve açık lisanslı eserler için; telif hakkıyla korunan kitaplar — satın alma veya kütüphaneden ödünç alma. Her bağlantı hukuki durumunu açıkça belirtir.',
  'footer.openSource': 'Açık kaynak',
  'footer.openSourceRest': '— MIT lisansı, kendi sunucunuzda çalıştırabilirsiniz. Kod GitHub’da.',
  'home.title': 'Golden Library',
  'home.subtitle': 'Açık bir kitap çevirisi toplayıcısı: diller, baskılar ve yasal kaynaklar.',
  'home.searchLabel': 'Başlık ve yazar',
  'home.searchPlaceholder': 'Savaş ve Barış Tolstoy',
  'home.searchButton': 'Ara',
  'search.searching': 'Aranıyor…',
  'search.backfilling':
    'Henüz bir şey yok — bu kitabı kaynaklardan getiriyoruz. Birkaç saniye sürer.',
  'search.notFound': 'Bu arama için bir şey bulunamadı.',
  'search.retry': 'Tekrar dene',
  'search.signInPrompt':
    ' — bulduğunuz kitapları kaydedip sonra geri dönmek ve seçim yapmadan önce farklı yılların baskılarını karşılaştırmak için.',
  'featured.yearHeading': 'Yılın kitapları',
  'featured.yearBlurb':
    'Son yılların her birinden dikkat çeken kitaplar. Elle seçilmiş bir liste, satış listesi değil — açık bir kaynak böyle bir liste yayımlamıyor.',
  'featured.popularHeading': 'Çok okunan, çok çevrilen',
  'featured.popularBlurb': 'Birçok dilde var olan kitaplar — bu site tam da bunun için.',
  'featured.filling':
    'Bunlardan birkaçı hâlâ arka planda getiriliyor. Bir dakika sonra sayfayı yenileyin.',
  'featured.freeCopy': 'Ücretsiz nüsha',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': 'Şimdi ücretsiz okuyun',
  'free.homeBlurb': 'Bu kopyanın doğrudan verebildiği kamu malı ve açık lisanslı kitaplar.',
  'free.seeAll': 'Daha fazlasını gör',
  'free.downloadable': 'İndir',
  'free.pageTitle': 'Ücretsiz kitaplar',
  'free.pageBlurb':
    'Buradaki her kitabın en az bir yasal ücretsiz nüshası var: kamu malı ya da hak sahibinin izniyle. Satın alma yok, kütüphane kartı yok.',
  'free.empty':
    'Burada henüz ücretsiz bir şey yok. Ücretsiz nüshalar bu kopya kitapları getirdikçe belirir — bir kitap arayın ve sonra tekrar bakın.',
  'free.emptyForLanguage':
    'Henüz {language} dilinde ücretsiz nüsha yok. Tüm rafı görmek için yukarıdaki filtreyi kaldırın.',
  'free.showMore': 'Daha fazla göster',
  'free.shown': '{total} kitaptan {shown} tanesi gösteriliyor.',
  'free.allLanguages': 'Tüm dillerdeki ücretsiz nüshalar.',
  'free.filteredByLanguage': 'Yalnızca {language} dilindeki ücretsiz nüshalar.',
  'free.filterByLanguage': 'Yalnızca {language} dilindeki ücretsiz nüshaları göster.',
  'free.dropLanguageFilter': 'tüm dilleri göster',
  'free.loadFailed': 'Ücretsiz kitaplar şu anda yüklenemedi.',
  'work.original': 'özgün dil',
  'work.dataSources': 'Veri kaynakları',
  'work.about': 'Bu kitap hakkında',
  'work.translatedInto': 'Çevrildiği diller',
  'work.availableIn': 'Mevcut diller',
  'work.languagesNote':
    'Yalnızca kaynaklarımızın listelediği diller — burada olmayan bir çeviri yine de var olabilir.',
  'work.noTranslations': 'Henüz çeviri bulunamadı.',
  'work.yourLanguage.title': 'Sizin dilinizde',
  'work.yourLanguage.yes': '{language} çevirisi var.',
  'work.yourLanguage.original': 'Bu kitap {language} yazılmış.',
  'work.yourLanguage.no': 'Bilinen baskılar arasında {language} çeviri yok.',
  'work.yourLanguage.show': '{language} baskıları göster',
  'work.editions': 'Baskılar ({total} içinden {shown})',
  'work.filterLanguage': 'Dil',
  'work.filterAllLanguages': 'Tüm diller',
  'work.filterYear': 'Yıl',
  'work.filterApply': 'Filtrele',
  'work.filterReset': 'Sıfırla',
  'work.noEditionsMatch': 'Bu filtrelere uyan baskı yok.',
  'work.showMoreEditions': 'Daha fazla baskı göster ({remaining} kaldı)',
  'work.badgeFreeDownload': 'ücretsiz indirme',
  'work.freeDownloadFormat': '{format} indir',
  'work.freeDownloadNote': '{rights}. {provider} üzerinden ücretsiz — hesap yok, ödeme yok.',
  'work.badgeReadBorrow': 'oku veya ödünç al',
  'work.badgeInBookstores': 'kitapçılarda',
  'work.translatedBy': 'çeviren: {name}',
  'work.pages': '{count} sayfa',
  'bookmark.save': 'Bu kitabı kaydet',
  'bookmark.saved': 'Kaydedildi',
  'bookmark.signInToSave': 'Kaydetmek için giriş yapın',
  'bookmark.failed': 'Kaydedilemedi. Tekrar deneyin.',
  'links.show': 'Bağlantıları göster',
  'links.hide': 'Bağlantıları gizle',
  'links.loading': 'Bağlantılar yükleniyor',
  'links.none': 'Bu baskı için henüz yasal bağlantı yok.',
  'links.viaOtherEdition': '{label} baskısından ücretsiz kopya',
  'links.failed': 'Bağlantılar yüklenemedi.',
  'links.storesHeading': 'Kitapçıda bul',
  'links.storesInCountry': '{country} içinde',
  'links.storesYourCountry': 'ülkeniz',
  'links.storesLanguageMarket': '{language} kitapların satıldığı yerler',
  'links.storesLanguageMarketGeneric': 'Bu baskının dilindeki kitapların satıldığı yerler',
  'links.storesWorldwide': 'Dünya geneline gönderim',
  'links.storesCaption':
    'Her bağlantı ilgili mağazanın kendi kataloğunda arama yapar — stok ve fiyatı mağaza gösterir.',
  'linkType.download': 'İndir',
  'linkType.buy': 'Satın al',
  'linkType.borrow': 'Kütüphaneden ödünç al',
  'linkType.listen': 'Dinle (sesli kitap)',
  'rights.public_domain': 'Kamu malı',
  'rights.open_license': 'Açık lisans',
  'rights.copyrighted': 'Telif hakkıyla korunuyor',
  'rights.unknown': 'Durum bilinmiyor',
  'compare.heading': 'Baskıları karşılaştır',
  'compare.blurb': 'Gerçekten neyin farklı olduğunu görmek için iki ya da üç baskı seçin.',
  'compare.selected': '{count} seçildi, en az 2 gerekiyor.',
  'compare.editSelection': 'Baskıları değiştir',
  'compare.showAllEditions': 'Tüm {count} baskıyı göster',
  'compare.columnDifference': 'Fark',
  'compare.identical': 'Kaynakların kaydettiği her şeyde bu baskılar aynı.',
  'compare.rowLanguage': 'Dil',
  'compare.rowPublished': 'Yayım yılı',
  'compare.rowPublisher': 'Yayınevi',
  'compare.rowTranslator': 'Çevirmen',
  'compare.rowTranslatedFrom': 'Çevrildiği dil',
  'compare.rowBinding': 'Cilt',
  'compare.rowPages': 'Sayfa',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': 'Ücretsiz veya ödünç alınabilir nüsha',
  'compare.yes': 'evet ({count})',
  'compare.no': 'bulunamadı',
  'country.label': 'Kitapları nereden alıyorsunuz?',
  'country.worldwideOnly': 'Yalnızca dünya geneline gönderen mağazalar',
  'auth.signInTitle': 'Giriş',
  'auth.registerTitle': 'Hesap oluştur',
  'auth.blurb':
    'Hesap tek bir amaç için var: bulduğunuz kitapları kaydetmek ve onlara geri dönmek — çevrildikleri diller, var olan baskılar ve her birini yasal olarak nereden edineceğinizle birlikte. Bülten yok, profil yok, takip yok.',
  'auth.name': 'Ad (isteğe bağlı)',
  'auth.email': 'E-posta',
  'auth.password': 'Parola',
  'auth.passwordHint':
    'En az {min} karakter. Yalnızca uzunluk denetleniyor — hatırlayabileceğiniz uzun bir cümle, noktalama içeren kısa bir paroladan iyidir.',
  'auth.submitSignIn': 'Giriş yap',
  'auth.submitRegister': 'Hesap oluştur',
  'auth.working': 'Bir saniye…',
  'auth.google': 'Google ile devam et',
  'auth.toRegister': 'Hesabınız yok mu? Oluşturun',
  'auth.toSignIn': 'Zaten hesabınız var mı? Giriş yapın',
  'auth.backToSearch': 'Aramaya dön',
  'auth.errorGoogleState':
    'Bu giriş bağlantısının süresi doldu veya başka bir tarayıcıda açıldı. Lütfen tekrar deneyin.',
  'auth.errorGoogleFailed':
    'Google ile giriş tamamlanmadı. Bunun yerine e-posta ve parola kullanabilirsiniz.',
  'auth.errorGeneric': 'Bir şeyler ters gitti.',
  'bookmarks.title': 'Kaydedilen kitaplar',
  'bookmarks.signedOut':
    ' — bulduğunuz kitapları saklamak ve sonra aynı kitabın baskılarını yan yana karşılaştırmak için.',
  'bookmarks.loading': 'Yükleniyor…',
  'bookmarks.empty':
    'Henüz kayıtlı bir şey yok. Bir kitap bulun ve kartındaki “Bu kitabı kaydet” düğmesini kullanın.',
  'bookmarks.searchLink': 'Ara',
  'bookmarks.remove': 'Kaldır',
  'bookmarks.loadFailed': 'Kaydedilen kitaplarınız yüklenemedi.',
  'search.failed': 'Arama başarısız oldu.',
  'search.pending': 'Henüz veritabanımızda yok — kaynakları kontrol ediyoruz',
  'search.pendingLong':
    'Hâlâ arıyoruz: bir kitap için ilk istek kaynaklardan veri toplar ve birkaç dakika sürebilir',
  'search.notFoundHint': 'Bir şey bulunamadı. Başlığı veya yazarı netleştirmeyi deneyin.',
  'search.timedOut':
    'Kaynaklar yavaş yanıt veriyor ve henüz veri yok. Arka plandaki eşitleme bitmiş olabilir — tekrar deneyin.',
  'search.freeOnlyToggle': 'Ücretsiz indirilebilir',
  'search.noFreeResults':
    'Bunların hiçbirinde henüz ücretsiz indirme yok — filtreyi kapatmayı deneyin.',
  'home.tagline': 'Sıradaki başyapıtınızı bulun',
  'subject.allLanguages': 'Tüm diller.',
  'subject.filteredByLanguage': 'Yalnızca {language} baskısı olan kitaplar.',
  'subject.dropLanguageFilter': 'tüm dilleri göster',
  'subject.empty':
    'Bu etikette henüz bir şey yok. Etiketler bu kurulumun daha önce getirdiği kitaplardan gelir.',
  'featured.year': '{year}',
  'nav.browse': 'Türe göre',
  'recommend.heading': 'Okuduklarınıza göre',
  'recommend.becauseOf': '“{title}” kitabını açtınız — işte aynı türlerden kitaplar.',
  'recommend.blurb': 'Açtığınız türlerdeki kitaplar.',
  'recommend.privacy':
    'Bu hesap tarayıcınızda yapılır — sunucuya türler bildirilir, kim olduğunuz asla.',
  'recommend.forget': 'geçmişimi unut',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': 'Raf',
  'shelf.title': 'Raf',
  'shelf.intro':
    'Açık kataloglar ve kendi işlettiğiniz herhangi bir kütüphane sunucusu. Eklediğiniz kataloglar bu tarayıcıda kalır ve bu siteye asla gönderilmez.',
  'shelf.openCatalogs': 'Açık kataloglar',
  'shelf.yourCatalogs': 'Kataloglarınız',
  'shelf.addCatalog': 'Katalog ekle',
  'shelf.name': 'Ad',
  'shelf.address': 'OPDS adresi',
  'shelf.username': 'Kullanıcı adı (isteğe bağlı)',
  'shelf.password': 'Parola (isteğe bağlı)',
  'shelf.credentialsNote': 'Adres ve varsa kimlik bilgileri yalnızca bu tarayıcıda saklanır.',
  'shelf.add': 'Ekle',
  'shelf.remove': 'Kaldır',
  'shelf.loading': 'Katalog yükleniyor…',
  'shelf.empty': 'Bu katalogda kayıt yok.',
  'shelf.noCatalogs':
    'Henüz kendinize ait yok. Aşağıya bir Calibre-Web, COPS, Kavita ya da Audiobookshelf adresi ekleyin.',
  'shelf.unreachable':
    'Tarayıcınız bu katalogu okuyamadı. Kendi ağınızdaki bir sunucu çalışır; genel siteler çapraz kaynak isteklerini sıkça reddeder.',
  'shelf.nextPage': 'Sonraki sayfa',
  'shelf.previousPage': 'Önceki sayfa',
  'shelf.drm': 'DRM uygulaması gerekir',
  'shelf.notFree': 'Ücretsiz bir indirme değil',
  'shelf.download': 'İndir',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': 'Yakınınızdaki kitapçılar',
  'stores.useMyLocation': 'Konumumu kullan',
  'stores.placeLabel': 'Şehir veya posta kodu',
  'stores.find': 'Bul',
  'stores.locating': 'Aranıyor…',
  'stores.failed': 'Konum alınamadı. Bunun yerine bir şehir ya da posta kodu yazın.',
  'stores.none': '{radius} km içinde haritada kitapçı yok.',
  'stores.distance': '{distance} km uzakta',
  'stores.stockUnknown':
    'Yalnızca harita verisi — bir kitapçının stoğunda ne olduğunu kimse yayımlamıyor.',
  'stores.lookupFailed': 'OpenStreetMap’e şu anda ulaşılamadı. Birazdan yeniden deneyin.',
  'stores.privacy':
    'Konumunuz yaklaşık 100 m’ye yuvarlanır ve yalnızca OpenStreetMap’e gönderilir, bu siteye asla.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': 'Fiyatlar ve kitapçılar',
  'prices.loading': 'Kitapçılara soruluyor…',
  'prices.unknown': 'Fiyat yayımlanmamış',
  'prices.degraded': 'Yanıt vermeyenler: {providers}',
  'prices.format.hardcover': 'Ciltli',
  'prices.format.paperback': 'Ciltsiz',
  'prices.format.ebook': 'E-kitap',
  'prices.format.audiobook': 'Sesli kitap',
  'prices.format.unknown': 'Biçim belirtilmemiş',
  'recommend.hideGenre': '“{genre}” türünü gizle',
  'recommend.hiddenList': 'Gizlenen türler (geri getirmek için tıklayın):',

  // --- Ayar bildirimleri ---
  'settings.status.saved': 'Kaydedildi',
  'settings.status.cleared': 'Temizlendi',
  'settings.status.unstored': 'Kaydedilmedi',
  'settings.status.failed': 'Değişmedi',
  'settings.notStored':
    'Bu tarayıcı değişikliği kaydetmeyi reddetti; bu yüzden hiçbir şey olmadı, önceki değer geçerli.',
  'settings.language.title': 'Arayüz dili',
  'settings.language.changed':
    '{from} dilinden {to} diline değiştirildi. Arayüz {to} dilinde yeniden yükleniyor; kitap adları ve yazar adları kendi dillerinde kalır.',
  'settings.country.title': 'Alışveriş ülkesi',
  'settings.country.changed':
    '{country} olarak ayarlandı. Kitapçı bağlantıları artık dünya geneline ek olarak oraya teslimat yapan mağazaları da gösteriyor.',
  'settings.country.cleared':
    'Ülke seçilmedi. Yalnızca dünya geneline gönderim yapan kitapçılar önerilecek.',
  'settings.bookLanguage.title': 'Kitap dili',
  'settings.bookLanguage.changed':
    '{language} olarak ayarlandı. Tür sayfaları, filtreyi temizleyene kadar önce {language} baskısı olan kitapları gösterecek.',
  'settings.bookLanguage.cleared':
    'Temizlendi. Tür sayfaları yine her dildeki kitapları gösteriyor.',
  'settings.hiddenGenres.title': 'Gizlenen türler',
  'settings.hiddenGenres.hidden':
    '“{genre}” gizlendi. Öneriler alınırken artık sunucuya gönderilmiyor; toplam {count} tür gizli.',
  'settings.hiddenGenres.restored': '“{genre}” önerilerinize geri döndü. {count} tür hâlâ gizli.',
  'settings.history.title': 'Okuma geçmişi',
  'settings.history.cleared':
    'Açtığınız kitaplar bu tarayıcıdan silindi. Yeni bir kitap açana kadar öneri görünmeyecek.',
  'settings.bookmarks.title': 'Kaydedilen kitaplar',
  'settings.bookmarks.added': '“{title}” kaydedilen kitaplarınıza eklendi.',
  'settings.bookmarks.removed': '“{title}” kaydedilen kitaplarınızdan çıkarıldı.',
  'settings.bookmarks.failed':
    'Sunucu değişikliği kabul etmedi; kaydedilen kitaplarınız olduğu gibi kaldı.',
  'settings.catalogs.title': 'Kataloglarınız',
  'settings.catalogs.added':
    '“{name}”, {url} adresiyle eklendi. Adresi bu tarayıcıda kalır ve hiçbir zaman bu siteye gönderilmez.',
  'settings.catalogs.addedWithCredentials':
    '“{name}”, girdiğiniz kullanıcı adı ve parolayla birlikte {url} adresiyle eklendi. Hepsi bu tarayıcıda kalır ve hiçbiri bu siteye gönderilmez.',
  'settings.catalogs.removed':
    '“{name}” bu tarayıcıdan, onun için saklanan kimlik bilgileriyle birlikte kaldırıldı.',
  'settings.catalogs.rejected': 'Hiçbir şey eklenmedi: {reason}',
  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'Eklentiler',
  'addons.title': 'Eklentiler',
  'addons.intro':
    'Bir eklenti kendi kaynaklarını getirir. Adresini yapıştırarak kurarsınız; ya kendi cihazınızda, bir kum havuzunda, ya da yazarının sunucusunda çalışır. Golden Library hiçbirini dağıtmaz, listesini tutmaz ve ne döndürdüklerini denetlemez.',
  'addons.addressLabel': 'Eklenti adresi',
  'addons.addressHint': 'Eklentinin yazarının verdiği manifest adresi.',
  'addons.continue': 'Devam',
  'addons.fromServer': 'Bir sunucudan',
  'addons.fromFile': 'Bir dosyadan, kendi cihazınızda',
  'addons.bundleLabel': 'Eklenti kodunun adresi',
  'addons.bundleHint': 'Eklenti kodunun adresi. Sunucuda değil, bu cihazda çalışacak.',
  'addons.integrityLabel': 'Bütünlük özeti',
  'addons.integrityHint':
    'Eklentinin yazarı verir, sha256-… biçiminde. Zorunlu: onsuz, bir kez onayladığınız kod sonradan değişebilir ve bunu hiç fark etmezsiniz.',
  'addons.checking': 'Eklenti okunuyor…',
  'addons.installedHeading': 'Kurulu',
  'addons.none': 'Henüz eklenti yok. Burada gördüğünüz her şey örneğin kendisinden geliyor.',
  'addons.priorityHint': 'Sıra önceliktir: ilk eklenti ilk yanıt verir.',
  'addons.enable': 'Aç',
  'addons.disable': 'Kapat',
  'addons.off': 'Kapalı',
  'addons.remove': 'Kaldır',
  'addons.moveUp': 'Yukarı',
  'addons.moveDown': 'Aşağı',
  'addons.configure': 'Ayarla',
  'addons.failedToStart': '“{name}” başlamadı: {reason}',
  'addons.consentTitle': '“{name}” kurulsun mu?',
  'addons.consentHosts': 'Şunlara bağlanacak: {hosts}',
  'addons.consentNoHosts': 'Hiçbir yere bağlanma izni istemedi.',
  'addons.consentSeesYou':
    'Bu eklenti yazarının sunucusunda çalışıyor. Yazar adresinizi ve onun üzerinden aradığınız her şeyi görecek.',
  'addons.consentSandboxed':
    'Bu eklenti cihazınızda, bir kum havuzunda çalışıyor. Çerezlerinizi, bu sitenin verilerini ya da açık olan başka hiçbir şeyi okuyamaz.',
  'addons.consentNotVetted':
    'Golden Library bir eklentinin ne döndürdüğünü denetlemez ve bunu önermedi. Ne kuracağınız sizin kararınız.',
  'addons.install': 'Kur',
  'addons.cancel': 'Vazgeç',
  'addons.via': '{name} aracılığıyla',
  'addons.sourcesTitle': 'Eklentilerinizden',
  'addons.searchTitle': 'Eklentilerinizin bulduğu',
  'addons.showLinks': 'İndirme bağlantılarını göster',
  'addons.unreadable': 'Bu eklentiden {count} kayıt okunamadı.',
  'addons.browse': 'Kataloğa göz at',
  'addons.browseTitle': '“{name}” kataloğu',
  'addons.browseNoCatalog': 'Bu eklenti göz atılabilecek bir katalog sunmuyor.',
  'addons.browseEmpty': 'Bu eklentinin kataloğu şu anda boş.',
  'addons.browseFailed': '“{name}” kataloğu yüklenemedi: {reason}',
  'addons.loadMore': 'Daha fazla yükle',
  'addons.notInstalled': 'Bu eklenti kurulu değil.',

  'settings.addons.title': 'Eklentileriniz',
  'settings.addons.installed':
    '“{name}” kuruldu. Diğerleriyle birlikte sorgulanacak ve {hosts} adresine bağlanabilir.',
  'settings.addons.removed':
    '“{name}” kaldırıldı. Sonuçları bu tarayıcıdan silindi, burada sakladığı her şey de.',
  'settings.addons.enabled': '“{name}” yeniden açık ve diğerleriyle birlikte sorgulanacak.',
  'settings.addons.disabled':
    '“{name}” kapalı. Ayarlarıyla birlikte kurulu kalır ama döndürdüğü hiçbir şey gösterilmez.',
  'settings.addons.reordered': '“{name}” artık {total} içinde {position}. sırada yanıt veriyor.',
  'settings.addons.rejected': 'Hiçbir şey kurulmadı: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'Özel kaynaklar',
  'customSources.title': 'Özel kaynaklar',
  'customSources.intro':
    'Kendi mağazanızı veya kataloğunuzu, ona bir ad ve {isbn}, {query}, {title}, {author} veya {language} içeren bir arama URL’si vererek ekleyin. Bağlantı bu cihazda oluşturulur ve bu site onu asla getirmez.',
  'customSources.nameLabel': 'Ad',
  'customSources.templateLabel': 'URL şablonu',
  'customSources.templateHint':
    'Mutlak bir https:// adresi. {isbn}, {query}, {title}, {author} ve {language} baskı bilgilerinden doldurulur; bir yer tutucu boş kalırsa o baskı için bağlantı atlanır.',
  'customSources.add': 'Kaynak ekle',
  'customSources.listHeading': 'Kaynaklarınız',
  'customSources.none': 'Henüz özel kaynak yok.',
  'customSources.off': 'Kapalı',
  'customSources.enable': 'Aç',
  'customSources.disable': 'Kapat',
  'customSources.remove': 'Kaldır',
  'customSources.heading': 'Kaynaklarınız',
  'customSources.caption':
    'Kendinizin yapılandırdığı bağlantılar. Bu örnek nereye gittiklerini denetlemez.',

  'settings.customSources.title': 'Özel kaynaklarınız',
  'settings.customSources.added': '“{name}” eklendi ve diğerleriyle birlikte sunulacak.',
  'settings.customSources.removed': '“{name}” bu tarayıcıdan kaldırıldı.',
  'settings.customSources.enabled': '“{name}” tekrar açık.',
  'settings.customSources.disabled':
    '“{name}” kapalı. Yapılandırması kalır, ancak bağlantısı gösterilmeyecek.',
  'settings.customSources.rejected': 'Hiçbir şey eklenmedi: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'Kendi dilinizdeki kitaplar',
  'featured.inLanguageBlurb':
    'Bu siteyi okuduğunuz dilde yazılmış kitaplar; önce en çok basılanlar — bu, Open Library’nin kendi sıralaması, bir çok satanlar listesi değil.',
  'work.newSearch': 'Yeni arama',
  'work.descriptionFrom': 'Açıklama:',
  'work.descriptionNotLocalized':
    'Bu açıklama, kaynağın yazdığı dilde — bu kitap için kendi dilinizde henüz bir açıklama yok.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': 'Tarayıcıda oku',
  'reader.privacy':
    'Bu kitabı tarayıcınız kendisi açar. Ne dosya, ne nereden geldiği, ne de nereye kadar okuduğunuz bu siteye ulaşır.',
  'reader.chooseFile': 'Bu cihazdan bir kitap aç',
  'reader.formats': 'EPUB, FB2, MOBI ve CBZ.',
  'reader.loading': 'Açılıyor…',
  'reader.failed': 'Bu kitap açılamadı: {reason}',
  'reader.previous': 'Önceki sayfa',
  'reader.next': 'Sonraki sayfa',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…ya da bir kitabı buraya bırakın',
  'reader.fetching': 'Dosya {host} adresinden isteniyor…',
  'reader.blockedTitle': '{host} dosyayı bu sayfaya vermedi',
  'reader.blockedBody':
    'Ya erişilemiyor ya da dosyalarını başka sitelerin okumasına izin vermiyor. Bu site onu sizin yerinize indirmeyecek: kitabınız buradan hiç geçmez, zaten burada okumanın anlamı da bu.',
  'reader.blockedDownload': '{host} adresinden indirin',
  'reader.blockedOpenHere': 've burada kendi cihazınızdan açın',
  'reader.blockedAddon': 'Dosyayı kendisi sunan bir eklenti de olur.',
  'reader.keepFile': 'Bu kitabı bu tarayıcıda sakla',
  'reader.keepFileHint':
    'Varsayılan olarak kapalı. Kapalıyken dosya sekmeyi kapatınca kaybolur; açıkken yalnızca bu cihazda kalır.',
  'reader.library': 'Bu tarayıcıda saklananlar',
  'reader.libraryEmpty':
    'Henüz bir şey saklanmadı. Sakladığınız kitaplar bu cihazda kalır ve hiçbir yere yüklenmez.',
  'reader.libraryOpen': 'Aç',
  'reader.libraryRemove': 'Kaldır',
  'reader.libraryFileKept': 'dosya saklandı',
  'reader.libraryFileGone': 'dosya saklanmadı',
  'reader.untitled': 'Adsız kitap',
  'settings.reader.libraryTitle': 'Bu tarayıcıdaki kitaplar',
  'settings.reader.kept':
    '“{title}” artık bu cihazda saklanıyor ve yeniden indirmeden açılıyor. Hiçbir yere yüklenmiyor.',
  'settings.reader.forgotten':
    '“{title}” dosyası bu tarayıcıdan silindi. Kayıt duruyor: kitabı kaynağından yeniden açabilirsiniz.',
  'settings.reader.removed': '“{title}” bu tarayıcıdan tamamen kaldırıldı — dosya da kayıt da.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': 'Bıraktığınız yerden açıldı — %{percent}.',
  'reader.bookmarks': 'Yer imleri',
  'reader.bookmarkAdd': 'Bu sayfaya yer imi koy',
  'reader.bookmarkNone': 'Bu kitapta henüz yer imi yok.',
  'reader.bookmarkGo': 'Git',
  'reader.bookmarkRemove': 'Yer imini kaldır',
  'reader.bookmarkNote': 'Not',
  'reader.bookmarkNotePlaceholder': 'Bu sayfa hakkında kendi sözleriniz',
  'reader.bookmarkAt': '%{percent}',
  'settings.reader.bookmarkTitle': 'Bu tarayıcıdaki yer imleri',
  'settings.reader.bookmarkAdded':
    '“{title}” kitabının %{percent} kısmına yer imi konuldu. Yer imleri kitapla birlikte bu cihazda kalır.',
  'settings.reader.bookmarkRemoved': '“{title}” içindeki o yer imi bu tarayıcıdan kaldırıldı.',
  'settings.reader.noteSaved':
    '“{title}” kitabının bu sayfasına dair notunuz bu cihaza kaydedildi.',
  'settings.reader.positionTitle': 'Okuma yeri',
  'settings.reader.positionUnstored':
    'Bu tarayıcı “{title}” içinde nerede kaldığınızı saklamadı; kitap bir dahaki sefere baştan açılacak. Gizli mod ve dolu disk bunu yapar.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': 'Bu kitabın görünümü',
  'reader.theme': 'Renkler',
  'reader.themeApp': 'Site gibi',
  'reader.themeLight': 'Kâğıt',
  'reader.themeDark': 'Mürekkep',
  'reader.themeSepia': 'Sepya',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint':
    'Beyaz üzerine saf siyah, animasyon yok, tek sütun — e-mürekkep ekranlar için.',
  'reader.fontSize': 'Yazı boyutu',
  'reader.smaller': 'Küçült',
  'reader.larger': 'Büyüt',
  'reader.lineHeight': 'Satır aralığı',
  'reader.margin': 'Kenar boşlukları',
  'reader.flow': 'Sayfalar',
  'reader.flowPaged': 'Sayfa çevir',
  'reader.flowScrolled': 'Kaydır',
  'reader.justify': 'İki yana yasla',
  'reader.hyphenate': 'Heceleme',
  'reader.displayReset': 'Varsayılanlara dön',
  'settings.reader.displayTitle': 'Okuma görünümü',
  'settings.reader.displayChanged':
    '{setting} artık {value}. Bu tarayıcıda açtığınız her kitap için geçerlidir.',
  'settings.reader.displayReset':
    'Okuma görünümü, bu tarayıcıdaki tüm kitaplar için varsayılanlara döndü.',
  'reader.on': 'Açık',
  'reader.off': 'Kapalı',
  'reader.openHere': 'Tarayıcıda oku',
  'reader.notAFileTitle': '{host} dosya yerine bir web sayfası gönderdi',
  'reader.notAFileBody':
    'Bağlantı kitaba değil bir sayfaya gidiyor: indirme sayfası, onay ekranı ya da robot olmadığınızın kontrolü. Kendiniz açın, dosya orada olacak.',
  'settings.status.session': 'Hatırlanmadı',
  'settings.notRemembered':
    'Bu tarayıcı bunu hatırlamak istemedi: bir sonraki kitabı açtığınızda her şey eskisi gibi olacak.',
};
