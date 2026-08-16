import type { Dictionary } from '../dictionary';

export const ko: Dictionary = {
  'nav.savedBooks': '저장한 책',
  'nav.signIn': '로그인',
  'nav.signOut': '로그아웃',
  'nav.language': '언어',
  'nav.skipToContent': '본문으로 건너뛰기',
  'footer.legal':
    '합법적인 경로만 제공합니다. 직접 내려받기는 퍼블릭 도메인과 개방형 라이선스 저작물에 한하며, 저작권이 있는 책은 구매하거나 도서관에서 대출합니다. 모든 링크에 권리 상태를 명시합니다.',
  'footer.openSource': '오픈 소스',
  'footer.openSourceRest': '— MIT 라이선스, 직접 호스팅할 수 있습니다. 코드는 GitHub에 있습니다.',
  'home.title': 'Golden Library',
  'home.subtitle': '열린 도서 번역 집계 서비스: 언어, 판본, 합법적인 입수 경로.',
  'home.searchLabel': '제목과 저자',
  'home.searchPlaceholder': '전쟁과 평화 톨스토이',
  'home.searchButton': '검색',
  'search.searching': '검색 중…',
  'search.backfilling':
    '아직 결과가 없습니다 — 여러 출처에서 이 책을 가져오는 중이며 몇 초 걸립니다.',
  'search.notFound': '이 검색어로는 아무것도 찾지 못했습니다.',
  'search.retry': '다시 시도',
  'search.signInPrompt':
    '하면 찾은 책을 저장해 두었다가 다시 볼 수 있고, 고르기 전에 여러 해의 판본을 나란히 비교할 수 있습니다.',
  'featured.yearHeading': '올해의 책',
  'featured.yearBlurb':
    '최근 각 해의 눈에 띄는 책들. 사람이 직접 고른 목록이며 판매 순위가 아닙니다 — 공개된 판매 순위는 존재하지 않습니다.',
  'featured.popularHeading': '많이 읽히고 많이 번역된 책',
  'featured.popularBlurb': '여러 언어로 존재하는 책들 — 이 사이트가 있는 이유입니다.',
  'featured.filling': '일부는 아직 백그라운드에서 가져오는 중입니다. 잠시 후 새로고침해 주세요.',
  'featured.freeCopy': '무료본 있음',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': '지금 무료로 읽기',
  'free.homeBlurb': '이 인스턴스가 직접 건네줄 수 있는 퍼블릭 도메인과 공개 라이선스 도서.',
  'free.seeAll': '더 보기',
  'free.downloadable': '내려받기',
  'free.pageTitle': '무료 도서',
  'free.pageBlurb':
    '여기 있는 책에는 합법적인 무료본이 최소 하나 있습니다. 퍼블릭 도메인이거나 권리자가 공개한 것입니다. 구매도, 도서관 카드도 필요 없습니다.',
  'free.empty':
    '아직 무료로 볼 책이 없습니다. 이 인스턴스가 책을 받아올수록 무료본이 나타납니다. 책을 검색한 뒤 다시 들러 주세요.',
  'free.emptyForLanguage':
    '아직 {language} 무료본이 없습니다. 위의 필터를 해제하면 전체 서가를 볼 수 있습니다.',
  'free.showMore': '더 불러오기',
  'free.shown': '{total}권 중 {shown}권을 표시합니다.',
  'free.allLanguages': '모든 언어의 무료본.',
  'free.filteredByLanguage': '{language} 무료본만.',
  'free.filterByLanguage': '{language} 무료본만 보기.',
  'free.dropLanguageFilter': '모든 언어 보기',
  'free.loadFailed': '지금은 무료 도서를 불러오지 못했습니다.',
  'work.original': '원어',
  'work.dataSources': '데이터 출처',
  'work.about': '이 책에 대하여',
  'work.translatedInto': '번역된 언어',
  'work.availableIn': '이용 가능한 언어',
  'work.languagesNote':
    '참조한 자료에 있는 것만 표시합니다. 여기에 없는 번역본도 존재할 수 있습니다.',
  'work.noTranslations': '아직 번역본을 찾지 못했습니다.',
  'work.yourLanguage.title': '내 언어로',
  'work.yourLanguage.yes': '{language} 번역본이 있습니다.',
  'work.yourLanguage.original': '이 책의 원어는 {language}입니다.',
  'work.yourLanguage.no': '확인된 판본 중에 {language} 번역본이 없습니다.',
  'work.yourLanguage.show': '{language} 판본 보기',
  'work.editions': '판본 (총 {total}개 중 {shown}개)',
  'work.filterLanguage': '언어',
  'work.filterAllLanguages': '모든 언어',
  'work.filterYear': '연도',
  'work.filterApply': '필터',
  'work.filterReset': '초기화',
  'work.noEditionsMatch': '이 조건에 맞는 판본이 없습니다.',
  'work.showMoreEditions': '판본 더 보기 (남은 {remaining}개)',
  'work.badgeFreeDownload': '무료 다운로드',
  'work.freeDownloadFormat': '{format} 내려받기',
  'work.freeDownloadNote': '{rights}. {provider}에서 무료 — 계정도 결제도 필요 없습니다.',
  'work.badgeReadBorrow': '읽기 또는 대출',
  'work.badgeInBookstores': '서점에서',
  'work.translatedBy': '옮긴이: {name}',
  'work.pages': '{count}쪽',
  'bookmark.save': '이 책 저장',
  'bookmark.saved': '저장됨',
  'bookmark.signInToSave': '저장하려면 로그인',
  'bookmark.failed': '저장하지 못했습니다. 다시 시도해 주세요.',
  'links.show': '링크 보기',
  'links.hide': '링크 숨기기',
  'links.loading': '링크를 불러오는 중',
  'links.none': '이 판본에는 아직 합법적인 링크가 없습니다.',
  'links.viaOtherEdition': '{label}판의 무료 사본',
  'links.failed': '링크를 불러오지 못했습니다.',
  'links.storesHeading': '서점에서 찾기',
  'links.storesInCountry': '{country}의 서점',
  'links.storesYourCountry': '내 국가',
  'links.storesLanguageMarket': '{language} 도서를 파는 곳',
  'links.storesLanguageMarketGeneric': '이 판본의 언어로 된 도서를 파는 곳',
  'links.storesWorldwide': '전 세계 배송',
  'links.storesCaption':
    '각 링크는 해당 서점의 자체 목록을 검색합니다 — 재고와 가격은 서점이 표시합니다.',
  'linkType.download': '내려받기',
  'linkType.buy': '구매',
  'linkType.borrow': '도서관에서 대출',
  'linkType.listen': '듣기 (오디오북)',
  'rights.public_domain': '퍼블릭 도메인',
  'rights.open_license': '개방형 라이선스',
  'rights.copyrighted': '저작권 보호',
  'rights.unknown': '상태 미상',
  'compare.heading': '판본 비교',
  'compare.blurb': '두세 개의 판본을 고르면 실제로 다른 점만 보여 줍니다.',
  'compare.selected': '{count}개 선택됨 (최소 2개 필요).',
  'compare.editSelection': '판본 변경',
  'compare.showAllEditions': '전체 {count}개 판본 보기',
  'compare.columnDifference': '차이',
  'compare.identical': '출처가 기록한 모든 항목에서 이 판본들은 동일합니다.',
  'compare.rowLanguage': '언어',
  'compare.rowPublished': '발행 연도',
  'compare.rowPublisher': '출판사',
  'compare.rowTranslator': '옮긴이',
  'compare.rowTranslatedFrom': '원어',
  'compare.rowEditionStatement': '판',
  'compare.rowBinding': '제본',
  'compare.rowPages': '쪽수',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': '무료본 또는 대출 가능본',
  'compare.yes': '있음 ({count})',
  'compare.no': '없음',
  'country.label': '책을 어디에서 구입하시나요?',
  'country.worldwideOnly': '전 세계 배송 서점만',
  'auth.signInTitle': '로그인',
  'auth.registerTitle': '계정 만들기',
  'auth.blurb':
    '계정은 오직 한 가지를 위해 있습니다. 찾은 책을 저장해 두었다가 다시 보는 것 — 번역된 언어, 존재하는 판본, 그리고 각각을 합법적으로 구하는 방법과 함께. 뉴스레터도, 프로필도, 추적도 없습니다.',
  'auth.name': '이름 (선택)',
  'auth.email': '이메일',
  'auth.password': '비밀번호',
  'auth.passwordHint':
    '{min}자 이상. 길이만 확인합니다 — 기억할 수 있는 긴 문장이 문장부호를 섞은 짧은 비밀번호보다 낫습니다.',
  'auth.submitSignIn': '로그인',
  'auth.submitRegister': '계정 만들기',
  'auth.working': '처리 중…',
  'auth.google': 'Google로 계속하기',
  'auth.toRegister': '계정이 없으신가요? 만들기',
  'auth.toSignIn': '이미 계정이 있으신가요? 로그인',
  'auth.backToSearch': '검색으로 돌아가기',
  'auth.errorGoogleState':
    '이 로그인 링크는 만료되었거나 다른 브라우저에서 열렸습니다. 다시 시도해 주세요.',
  'auth.errorGoogleFailed':
    'Google 로그인이 완료되지 않았습니다. 이메일과 비밀번호로 로그인할 수 있습니다.',
  'auth.errorGeneric': '문제가 발생했습니다.',
  'bookmarks.title': '저장한 책',
  'bookmarks.signedOut':
    '하면 찾은 책을 보관할 수 있고, 나중에 같은 책의 판본들을 나란히 비교할 수 있습니다.',
  'bookmarks.loading': '불러오는 중…',
  'bookmarks.empty': '아직 저장한 것이 없습니다. 책을 찾아 카드에서 ‘이 책 저장’을 눌러 보세요.',
  'bookmarks.searchLink': '검색',
  'bookmarks.remove': '삭제',
  'bookmarks.loadFailed': '저장한 책을 불러오지 못했습니다.',
  'search.failed': '검색에 실패했습니다.',
  'search.pending': '아직 저희 데이터베이스에 없습니다 — 여러 출처를 확인하는 중입니다',
  'search.pendingLong':
    '아직 검색 중입니다. 어떤 책에 대한 첫 요청은 여러 출처에서 자료를 모으기 때문에 몇 분이 걸릴 수 있습니다',
  'search.notFoundHint': '찾지 못했습니다. 제목이나 저자를 더 정확히 입력해 보세요.',
  'search.timedOut':
    '출처들의 응답이 느려 아직 자료가 없습니다. 백그라운드 동기화가 이미 끝났을 수도 있습니다 — 다시 시도해 주세요.',
  'search.freeOnlyToggle': '무료본 있음',
  'search.noFreeResults':
    '이 결과 중에는 아직 무료로 받을 수 있는 책이 없습니다 — 필터를 꺼 보세요.',
  'home.tagline': '다음에 읽을 역작을 찾아보세요',
  'home.genres': '인기 장르',
  'home.genresBlurb':
    '가장 많은 책이 모여 있는 태그입니다. 각 태그를 누르면 해당 카탈로그가 열립니다.',
  'subject.allLanguages': '모든 언어.',
  'subject.filteredByLanguage': '{language} 판본이 있는 책만.',
  'subject.dropLanguageFilter': '모든 언어 보기',
  'subject.empty':
    '이 태그에는 아직 아무것도 없습니다. 태그는 이 인스턴스가 이미 가져온 책에서 나옵니다.',
  'featured.year': '{year}년',
  'nav.browse': '장르별',
  'recommend.heading': '읽으신 책을 바탕으로',
  'recommend.becauseOf': '‘{title}’을(를) 여셨기에 같은 장르의 책을 모았습니다.',
  'recommend.blurb': '그동안 여신 장르의 책들입니다.',
  'recommend.privacy':
    '이 계산은 브라우저 안에서 이뤄집니다 — 서버에는 장르만 전달되고, 누구인지는 전달되지 않습니다.',
  'recommend.forget': '기록 지우기',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': '책장',
  'shelf.title': '책장',
  'shelf.intro':
    '공개 카탈로그와, 직접 운영하는 장서 서버. 추가한 카탈로그는 이 브라우저에만 남고 이 사이트로는 절대 전송되지 않습니다.',
  'shelf.openCatalogs': '공개 카탈로그',
  'shelf.yourCatalogs': '내 카탈로그',
  'shelf.addCatalog': '카탈로그 추가',
  'shelf.name': '이름',
  'shelf.address': 'OPDS 주소',
  'shelf.username': '사용자 이름(선택)',
  'shelf.password': '비밀번호(선택)',
  'shelf.credentialsNote': '주소와 인증 정보는 이 브라우저에만 저장됩니다.',
  'shelf.add': '추가',
  'shelf.remove': '삭제',
  'shelf.loading': '카탈로그 불러오는 중…',
  'shelf.empty': '이 카탈로그에는 항목이 없습니다.',
  'shelf.noCatalogs':
    '아직 내 카탈로그가 없습니다. 아래에 Calibre-Web, COPS, Kavita, Audiobookshelf 주소를 추가하세요.',
  'shelf.unreachable':
    '브라우저가 이 카탈로그를 읽지 못했습니다. 내 네트워크의 서버는 동작합니다. 공개 사이트는 교차 출처 요청을 거부하는 경우가 많습니다.',
  'shelf.nextPage': '다음 쪽',
  'shelf.previousPage': '이전 쪽',
  'shelf.drm': 'DRM 앱이 필요합니다',
  'shelf.notFree': '무료 내려받기가 아닙니다',
  'shelf.download': '내려받기',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': '가까운 서점',
  'stores.useMyLocation': '내 위치 사용',
  'stores.placeLabel': '도시 또는 우편번호',
  'stores.find': '찾기',
  'stores.locating': '찾는 중…',
  'stores.failed': '위치를 가져올 수 없습니다. 도시나 우편번호를 입력하세요.',
  'stores.none': '{radius} km 안에 지도에 등록된 서점이 없습니다.',
  'stores.distance': '{distance} km 거리',
  'stores.stockUnknown': '지도 데이터뿐입니다 — 서점 재고를 공개하는 곳은 없습니다.',
  'stores.lookupFailed': '지금 OpenStreetMap에 연결하지 못했습니다. 잠시 후 다시 시도하세요.',
  'stores.privacy':
    '위치는 약 100 m로 반올림되어 OpenStreetMap에만 전송되며, 이 사이트로는 보내지 않습니다.',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': '가격과 서점',
  'prices.loading': '서점에 문의하는 중…',
  'prices.unknown': '가격 미공개',
  'prices.degraded': '응답 없음: {providers}',
  'prices.format.hardcover': '양장본',
  'prices.format.paperback': '문고본',
  'prices.format.ebook': '전자책',
  'prices.format.audiobook': '오디오북',
  'prices.format.unknown': '형태 미표기',

  'ratings.edition': '{outOf}점 만점에 {average}점 · {source} 독자 {votes}명의 평가',
  'ratings.lowConfidence': '비교하기에는 평가 수가 너무 적음',
  'ratings.reviews': '리뷰',
  'ratings.reviewsOn': '{source}의 이 판본 리뷰',
  'ratings.noteNoRatings':
    '번역 자체를 평가하는 공개 자료는 없고, 이 판본들에는 독자 평가도 없습니다.',
  'ratings.noteReviews':
    '{sources}에 등록된 판본은 링크가 바로 그 판본의 리뷰로 이어집니다. 대부분은 등록되어 있지 않습니다.',
  'ratings.translator':
    '{name} 번역본: 평가가 있는 {editions}개 판본에서 {outOf}점 만점에 {average}점, 평가 총 {votes}건.',
  'ratings.note':
    '{sources}에서 특정 판본에 매겨진 독자 평가이며, 번역 자체에 대한 평가는 아닙니다. 그런 평가를 공개하는 곳은 없습니다. 같은 책, 같은 언어, 다른 번역자를 평가 수와 함께 나란히 놓고 볼 때 의미가 있습니다.',
  'ratings.gapWithoutIsbn': '{count}개 판본에는 ISBN이 없어 평가를 연결할 수 없었습니다.',
  'ratings.gapNotLookedUp': '이 요청에서는 {count}개 판본을 추가로 조회하지 않았습니다.',
  'recommend.hideGenre': '‘{genre}’ 숨기기',
  'recommend.hiddenList': '숨긴 장르 (클릭하면 되돌립니다):',

  // --- 설정 팝업 ---
  'settings.status.saved': '저장됨',
  'settings.status.cleared': '해제됨',
  'settings.status.unstored': '저장 안 됨',
  'settings.status.failed': '변경 없음',
  'settings.notStored':
    '이 브라우저가 변경 저장을 거부해서 아무 일도 일어나지 않았습니다. 이전 값이 그대로 적용됩니다.',
  'settings.language.title': '인터페이스 언어',
  'settings.language.changed':
    '{from}에서 {to}(으)로 바꿨습니다. 화면이 {to}로 다시 불러와지며, 책 제목과 지은이 이름은 원래 언어 그대로 남습니다.',
  'settings.country.title': '구매 국가',
  'settings.country.changed':
    '{country}(으)로 설정했습니다. 서점 링크에 전 세계 배송 서점과 함께 그곳으로 배송하는 서점도 표시됩니다.',
  'settings.country.cleared': '국가를 고르지 않았습니다. 전 세계로 배송하는 서점만 제안합니다.',
  'settings.bookLanguage.title': '책 언어',
  'settings.bookLanguage.changed':
    '{language}(으)로 설정했습니다. 필터를 해제할 때까지 장르 페이지는 {language} 판이 있는 책을 먼저 보여줍니다.',
  'settings.bookLanguage.cleared': '해제했습니다. 장르 페이지가 다시 모든 언어의 책을 보여줍니다.',
  'settings.hiddenGenres.title': '숨긴 장르',
  'settings.hiddenGenres.hidden':
    '“{genre}”을(를) 숨겼습니다. 추천을 받아올 때 더는 서버로 보내지 않으며, 숨긴 장르는 모두 {count}개입니다.',
  'settings.hiddenGenres.restored':
    '“{genre}”이(가) 추천에 다시 나옵니다. 아직 {count}개 장르가 숨겨져 있습니다.',
  'settings.history.title': '읽은 기록',
  'settings.history.cleared':
    '열어 본 책 기록을 이 브라우저에서 지웠습니다. 다음 책을 열기 전까지는 추천이 나오지 않습니다.',
  'settings.bookmarks.title': '저장한 책',
  'settings.bookmarks.added': '“{title}”을(를) 저장한 책에 추가했습니다.',
  'settings.bookmarks.removed': '“{title}”을(를) 저장한 책에서 뺐습니다.',
  'settings.bookmarks.failed': '서버가 변경을 받아들이지 않아, 저장한 책은 그대로입니다.',
  'settings.catalogs.title': '내 카탈로그',
  'settings.catalogs.added':
    '“{name}”을(를) {url} 주소로 추가했습니다. 주소는 이 브라우저에만 남고 이 사이트로 전송되지 않습니다.',
  'settings.catalogs.addedWithCredentials':
    '“{name}”을(를) {url} 주소로, 입력한 사용자 이름과 비밀번호와 함께 추가했습니다. 모두 이 브라우저에만 남고 이 사이트로는 전송되지 않습니다.',
  'settings.catalogs.removed':
    '“{name}”을(를) 이 브라우저에서, 저장돼 있던 로그인 정보와 함께 지웠습니다.',
  'settings.catalogs.rejected': '아무것도 추가되지 않았습니다: {reason}',
  // --- Addons ---------------------------------------------------------------
  'nav.addons': '애드온',
  'addons.title': '애드온',
  'addons.intro':
    '애드온은 자체 출처를 가져옵니다. 주소를 붙여넣어 설치하며, 샌드박스 안의 내 기기에서 돌거나 제작자의 서버에서 돕니다. Golden Library는 애드온을 함께 배포하지 않고, 목록도 두지 않으며, 무엇을 돌려주는지 검사하지 않습니다.',
  'addons.addressLabel': '애드온 주소',
  'addons.addressHint': '제작자가 알려준 매니페스트 URL.',
  'addons.continue': '계속',
  'addons.fromServer': '서버에서',
  'addons.fromFile': '파일에서 (내 기기에서 실행)',
  'addons.bundleLabel': '애드온 코드 주소',
  'addons.bundleHint': '코드의 URL. 서버가 아니라 이 기기에서 돕니다.',
  'addons.integrityLabel': '무결성 해시',
  'addons.integrityHint':
    '제작자가 sha256-… 형태로 알려줍니다. 필수입니다. 없으면 한 번 승인한 코드가 나중에 바뀌어도 알 수 없습니다.',
  'addons.checking': '애드온을 읽는 중…',
  'addons.installedHeading': '설치됨',
  'addons.none': '아직 애드온이 없습니다. 지금 보이는 것은 모두 이 인스턴스 자체에서 온 것입니다.',
  'addons.priorityHint': '순서가 곧 우선순위입니다. 맨 위 애드온이 먼저 답합니다.',
  'addons.enable': '켜기',
  'addons.disable': '끄기',
  'addons.off': '꺼짐',
  'addons.remove': '삭제',
  'addons.moveUp': '위로',
  'addons.moveDown': '아래로',
  'addons.configure': '설정',
  'addons.failedToStart': '“{name}”이(가) 시작되지 않았습니다: {reason}',
  'addons.consentTitle': '“{name}”을(를) 설치할까요?',
  'addons.consentHosts': '접속할 곳: {hosts}',
  'addons.consentNoHosts': '어디에도 접속을 요청하지 않았습니다.',
  'addons.consentSeesYou':
    '이 애드온은 제작자의 서버에서 돕니다. 제작자는 당신의 주소와, 이 애드온을 통해 찾는 모든 것을 보게 됩니다.',
  'addons.consentSandboxed':
    '이 애드온은 내 기기의 샌드박스에서 돕니다. 쿠키도, 이 사이트의 데이터도, 열려 있는 다른 어떤 것도 읽을 수 없습니다.',
  'addons.consentNotVetted':
    'Golden Library는 애드온이 돌려주는 내용을 검사하지 않으며 이것을 추천하지도 않았습니다. 무엇을 설치할지는 당신의 선택입니다.',
  'addons.install': '설치',
  'addons.cancel': '취소',
  'addons.via': '{name} 경유',
  'addons.sourcesTitle': '내 애드온에서',
  'addons.searchTitle': '내 애드온이 찾은 것',
  'addons.showLinks': '다운로드 링크 표시',
  'addons.unreadable': '이 애드온의 {count}개 항목을 읽지 못했습니다.',
  'addons.browse': '카탈로그 보기',
  'addons.browseTitle': '「{name}」 카탈로그',
  'addons.browseNoCatalog': '이 애드온은 둘러볼 카탈로그를 제공하지 않습니다.',
  'addons.browseEmpty': '이 애드온의 카탈로그가 현재 비어 있습니다.',
  'addons.browseFailed': '「{name}」 카탈로그를 불러오지 못했습니다: {reason}',
  'addons.loadMore': '더 보기',
  'addons.notInstalled': '이 애드온은 설치되어 있지 않습니다.',

  'settings.addons.title': '내 애드온',
  'settings.addons.installed':
    '“{name}”을(를) 설치했습니다. 다른 애드온과 함께 질의되며 {hosts}에 접속할 수 있습니다.',
  'settings.addons.removed':
    '“{name}”을(를) 삭제했습니다. 결과도, 여기 저장해 두었던 것도 이 브라우저에서 사라졌습니다.',
  'settings.addons.enabled': '“{name}”을(를) 다시 켰습니다. 다른 애드온과 함께 질의됩니다.',
  'settings.addons.disabled':
    '“{name}”을(를) 껐습니다. 설정과 함께 설치된 채로 남지만, 돌려주는 내용은 표시되지 않습니다.',
  'settings.addons.reordered': '“{name}”이(가) 이제 {total}개 중 {position}번째로 답합니다.',
  'settings.addons.rejected': '아무것도 설치되지 않았습니다: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': '사용자 소스',
  'customSources.title': '사용자 소스',
  'customSources.intro':
    '이름과 {isbn}, {query}, {title}, {author}, {language}가 포함된 검색 URL을 지정해 나만의 상점이나 카탈로그를 추가하세요. 링크는 이 기기에서 만들어지며, 이 사이트는 절대 가져오지 않습니다.',
  'customSources.nameLabel': '이름',
  'customSources.templateLabel': 'URL 템플릿',
  'customSources.templateHint':
    '절대 https:// 주소입니다. {isbn}, {query}, {title}, {author}, {language}는 판본 정보로 채워집니다. 자리표시자가 비어 있으면 해당 판본의 링크는 생략됩니다.',
  'customSources.add': '소스 추가',
  'customSources.listHeading': '내 소스',
  'customSources.none': '아직 사용자 소스가 없습니다.',
  'customSources.off': '꺼짐',
  'customSources.enable': '켜기',
  'customSources.disable': '끄기',
  'customSources.remove': '제거',
  'customSources.heading': '내 소스',
  'customSources.caption': '직접 설정한 링크입니다. 이 인스턴스는 연결 대상을 확인하지 않습니다.',

  'settings.customSources.title': '내 사용자 소스',
  'settings.customSources.added': '“{name}”이(가) 추가되어 다른 소스와 함께 제공됩니다.',
  'settings.customSources.removed': '“{name}”이(가) 이 브라우저에서 제거되었습니다.',
  'settings.customSources.enabled': '“{name}”이(가) 다시 켜졌습니다.',
  'settings.customSources.disabled':
    '“{name}”이(가) 꺼졌습니다. 설정은 유지되지만 링크는 표시되지 않습니다.',
  'settings.customSources.rejected': '아무것도 추가되지 않았습니다: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': '당신의 언어로 쓰인 책',
  'featured.inLanguageBlurb':
    '이 사이트를 읽고 있는 언어로 쓰인 책입니다. 가장 여러 번 출간된 순서이며, 이는 Open Library 자체의 정렬일 뿐 베스트셀러 순위가 아닙니다.',
  'work.newSearch': '새로 검색',
  'work.descriptionFrom': '소개:',
  'work.descriptionNotLocalized':
    '이 소개는 출처가 쓴 언어 그대로입니다. 이 책에 대한 당신의 언어로 된 소개는 아직 없습니다.',

  // --- Reading a book in this browser (ADR-0013) ----------------------------
  'reader.title': '브라우저에서 읽기',
  'reader.privacy':
    '이 책은 브라우저가 혼자 엽니다. 파일도, 파일을 가져온 곳도, 어디까지 읽었는지도 이 사이트에는 전해지지 않습니다.',
  'reader.chooseFile': '이 기기에서 책 열기',
  'reader.formats': 'EPUB, FB2, MOBI, CBZ.',
  'reader.loading': '여는 중…',
  'reader.failed': '이 책을 열지 못했습니다: {reason}',
  'reader.previous': '이전 쪽',
  'reader.next': '다음 쪽',

  // --- Getting a book into the reader (ADR-0013 §7) --------------------------
  'reader.dropHere': '…또는 여기에 책을 놓으세요',
  'reader.fetching': '{host}에 파일을 요청하는 중…',
  'reader.blockedTitle': '{host}이(가) 이 페이지에 파일을 주지 않았습니다',
  'reader.blockedBody':
    '연결할 수 없거나, 다른 사이트가 자기 파일을 읽는 것을 허용하지 않는 것입니다. 이 사이트가 대신 받아오지는 않습니다. 책이 이 사이트를 거치지 않는 것이 여기서 읽는 이유이기 때문입니다.',
  'reader.blockedDownload': '{host}에서 내려받기',
  'reader.blockedOpenHere': '그런 다음 기기에서 여기로 열기',
  'reader.blockedAddon': '파일을 직접 제공하는 애드온도 괜찮습니다.',
  'reader.keepFile': '이 책을 이 브라우저에 보관',
  'reader.keepFileHint':
    '기본은 꺼짐입니다. 끄면 탭을 닫을 때 파일이 사라지고, 켜면 이 기기에만 남습니다.',
  'reader.library': '이 브라우저에 보관됨',
  'reader.libraryEmpty':
    '아직 보관한 것이 없습니다. 보관한 책은 이 기기에 남고 어디에도 올라가지 않습니다.',
  'reader.libraryOpen': '열기',
  'reader.libraryRemove': '삭제',
  'reader.libraryFileKept': '파일 보관됨',
  'reader.libraryFileGone': '파일 없음',
  'reader.untitled': '제목 없는 책',
  'settings.reader.libraryTitle': '이 브라우저의 책',
  'settings.reader.kept':
    '「{title}」이(가) 이 기기에 보관되어 다시 내려받지 않고 열립니다. 어디에도 올라가지 않습니다.',
  'settings.reader.forgotten':
    '「{title}」의 파일을 이 브라우저에서 지웠습니다. 목록은 남아 있으니 원본에서 다시 열 수 있습니다.',
  'settings.reader.removed':
    '「{title}」을(를) 이 브라우저에서 완전히 지웠습니다 — 파일과 기록 모두.',

  // --- Where the reader got to, and what they marked (ADR-0013 §4) -----------
  'reader.resumed': '읽던 곳에서 열었습니다 — {percent}% 지점.',
  'reader.bookmarks': '책갈피',
  'reader.bookmarkAdd': '이 쪽에 책갈피',
  'reader.bookmarkNone': '이 책에는 아직 책갈피가 없습니다.',
  'reader.bookmarkGo': '이동',
  'reader.bookmarkRemove': '책갈피 삭제',
  'reader.bookmarkNote': '메모',
  'reader.bookmarkNotePlaceholder': '이 쪽에 대한 당신의 말',
  'reader.bookmarkAt': '{percent}% 지점',
  'settings.reader.bookmarkTitle': '이 브라우저의 책갈피',
  'settings.reader.bookmarkAdded':
    '「{title}」의 {percent}% 지점에 책갈피를 두었습니다. 책갈피는 책과 함께 이 기기에 남습니다.',
  'settings.reader.bookmarkRemoved': '「{title}」의 그 책갈피를 이 브라우저에서 지웠습니다.',
  'settings.reader.noteSaved': '「{title}」의 이 쪽에 대한 메모를 이 기기에 저장했습니다.',
  'settings.reader.positionTitle': '읽던 위치',
  'settings.reader.positionUnstored':
    '이 브라우저가 「{title}」에서 어디까지 읽었는지를 저장하지 않았습니다. 다음에는 처음부터 열립니다. 시크릿 모드나 디스크가 가득 찬 경우에 그렇습니다.',

  // --- How the book looks (ADR-0013, ADR-0008) -------------------------------
  'reader.display': '이 책의 모습',
  'reader.theme': '색',
  'reader.themeApp': '사이트와 동일',
  'reader.themeLight': '종이',
  'reader.themeDark': '먹',
  'reader.themeSepia': '세피아',
  'reader.themeEink': 'E-Ink',
  'reader.themeEinkHint': '흰 바탕에 순수한 검정, 애니메이션 없음, 한 단 — 전자잉크 화면용입니다.',
  'reader.fontSize': '글자 크기',
  'reader.smaller': '작게',
  'reader.larger': '크게',
  'reader.lineHeight': '줄 간격',
  'reader.margin': '여백',
  'reader.flow': '쪽',
  'reader.flowPaged': '쪽 넘기기',
  'reader.flowScrolled': '스크롤',
  'reader.justify': '양쪽 정렬',
  'reader.hyphenate': '하이픈 넣기',
  'reader.displayReset': '기본값으로',
  'settings.reader.displayTitle': '읽기 화면',
  'settings.reader.displayChanged':
    '{setting}을(를) {value}(으)로 바꿨습니다. 이 브라우저에서 여는 모든 책에 적용됩니다.',
  'settings.reader.displayReset':
    '읽기 화면을 이 브라우저의 모든 책에 대해 기본값으로 되돌렸습니다.',
  'reader.on': '켬',
  'reader.off': '끔',
  'reader.openHere': '브라우저에서 읽기',
  'reader.notAFileTitle': '{host}이(가) 파일이 아니라 웹 페이지를 보냈습니다',
  'reader.notAFileBody':
    '링크가 책이 아니라 페이지로 이어집니다 — 다운로드 페이지, 동의 화면, 또는 로봇이 아님을 확인하는 절차입니다. 직접 열면 파일이 거기 있습니다.',
  'settings.status.session': '기억되지 않음',
  'settings.notRemembered':
    '이 브라우저가 기억하지 않았습니다. 다음에 책을 열면 원래대로 돌아갑니다.',

  // --- The first-run walkthrough (components/OnboardingTour.tsx) -----------
  'tour.next': '다음',
  'tour.back': '뒤로',
  'tour.skip': '나중에',
  'tour.finish': '완료',
  'tour.close': '둘러보기 닫기',
  'tour.welcome.title': 'Golden Library에 오신 것을 환영합니다',
  'tour.welcome.text':
    '일 분이면 무엇이 어디에 있는지 알게 됩니다. 이 사이트는 어떤 언어로 그 책이 존재하는지, 어디서 합법적으로 구할 수 있는지 찾아 줍니다. 어디를 뒤질지 알려 줄수록 잘 찾으니, 거기서부터 시작하죠.',
  'tour.customSourcesNav.title': '자기 출처부터 시작하세요',
  'tour.customSourcesNav.text':
    '<strong>사용자 출처</strong>를 여세요. 기본 목록과 함께 어떤 카탈로그를 검색할지 여기서 정합니다.',
  'tour.presets.title': '처음부터 쓸 필요는 없습니다',
  'tour.presets.text':
    '거기에는 이미 만들어진 서식이 올라옵니다. 서식은 그것을 쓴 사람의 것입니다. 이 사이트는 그 채널의 내용을 확인하지 않으며, 추가한 출처는 이 서버가 아니라 당신의 브라우저에서 검색합니다. 새 탭에서 열어 필요한 것을 가져온 뒤 돌아오세요.',
  'tour.sourceForm.title': '칸 두 개면 끝입니다',
  'tour.sourceForm.text':
    '알아볼 이름과 검색 주소, 그리고 입력한 말이 들어갈 자리에 <strong>{query}</strong>. 지금 하나 추가하거나, 다음을 눌러 나중에 돌아와도 됩니다.',
  'tour.sourceList.title': '추가한 것은 모두 여기 남습니다',
  'tour.sourceList.text':
    '출처는 아래에 나열되고 각각 끄거나 지울 수 있습니다. 이 브라우저 안에만 있고 서버로 보내지지 않습니다. 여기서는 아무도 볼 수 없고, 다른 기기에는 없습니다.',
  'tour.addonsNav.title': '애드온은 한 걸음 더 나갑니다',
  'tour.addonsNav.text':
    '<strong>애드온</strong>을 여세요. 사용자 출처가 당신이 쓴 주소 하나라면, 애드온은 다른 사람이 만든 작은 프로그램으로 카탈로그를 제대로 검색할 수 있습니다.',
  'tour.addons.title': '보기 전에는 아무것도 설치되지 않습니다',
  'tour.addons.text':
    '애드온 주소를 붙여 넣으면 그것이 무엇이고 어떤 호스트와 통신할지 이 양식이 보여 줍니다. 설치는 그다음입니다. 결과에는 언제나 그것을 내놓은 애드온의 이름이 붙습니다.',
  'tour.shelfNav.title': '책장',
  'tour.shelfNav.text': '바로 읽을 수 있는 카탈로그를 보려면 <strong>책장</strong>을 여세요.',
  'tour.shelf.title': '공개 카탈로그, 그리고 당신의 카탈로그',
  'tour.shelf.text':
    '구텐베르크 프로젝트 같은 곳은 처음부터 들어 있습니다. 그 아래에는 어떤 OPDS 카탈로그든 추가할 수 있습니다. 이를테면 집 안 네트워크의 Calibre 서버 — 당신의 브라우저는 닿지만 이 사이트는 결코 닿지 않습니다.',
  'tour.language.title': '열다섯 개 언어',
  'tour.language.text':
    '화면 언어는 언제든 여기서 바꿉니다. 이 사이트의 다른 설정과 마찬가지로 브라우저에 기록되어 즉시 적용되며, 그 사실을 알림으로 말해 줍니다. 브라우저가 저장을 거부한 경우에도 그렇습니다.',
  'tour.done.title': '둘러보기는 여기까지입니다',
  'tour.done.text':
    '첫 화면에서 검색하세요. 찾은 책을 남겨 두고 싶다면 로그인하시고요. 어느 페이지든 맨 아래 링크로 이 둘러보기를 다시 시작할 수 있습니다.',
  'settings.tour.title': '안내 둘러보기',
  'settings.tour.finished':
    '둘러보기를 마쳤으므로 저절로 다시 열리지 않습니다. 페이지 맨 아래 링크로 언제든 시작할 수 있습니다.',
  'settings.tour.skipped':
    '둘러보기를 닫았고 저절로 다시 열리지 않습니다. 페이지 맨 아래 링크로 언제든 시작할 수 있습니다.',
  'settings.tour.restarted':
    '첫 단계부터 다시 시작합니다. 이 브라우저는 당신이 이미 봤다는 사실을 잊었습니다.',
  'customSources.presets': '이미 만들어진 서식',
  'customSources.presetsCaption':
    '이 인스턴스의 채널에서 다른 독자들이 공유하는 서식입니다. 여기서는 아무도 확인하지 않습니다. 추가하기 전에 읽어 보시고, 검색은 당신의 브라우저에서 이루어진다는 점을 기억하세요.',
  'footer.takeTheTour': '둘러보기',
};
