import type { Dictionary } from '../dictionary';

export const ja: Dictionary = {
  'nav.savedBooks': '保存した本',
  'nav.signIn': 'ログイン',
  'nav.signOut': 'ログアウト',
  'nav.language': '言語',
  'nav.skipToContent': '本文へスキップ',
  'footer.legal':
    '合法な入手先のみ：直接ダウンロードはパブリックドメインおよびオープンライセンスの作品に限ります。著作権のある本は購入または図書館での貸出です。すべてのリンクに権利状態を明示しています。',
  'footer.openSource': 'オープンソース',
  'footer.openSourceRest': '— MIT ライセンス、自分で運用できます。コードは GitHub にあります。',
  'home.title': 'Golden Library',
  'home.subtitle': '本の翻訳を集めるオープンなサービス：言語、版、合法な入手先。',
  'home.searchLabel': '書名と著者',
  'home.searchPlaceholder': '戦争と平和 トルストイ',
  'home.searchButton': '検索',
  'search.searching': '検索しています…',
  'search.backfilling': 'まだ何もありません — 各ソースからこの本を取得中です。数秒かかります。',
  'search.notFound': 'この検索では何も見つかりませんでした。',
  'search.retry': 'もう一度試す',
  'search.signInPrompt':
    'すると、見つけた本を保存して後で戻れます。選ぶ前に、異なる年の版を並べて比較することもできます。',
  'featured.yearHeading': '年ごとの一冊',
  'featured.yearBlurb':
    '最近の各年から注目の本を。手作業で選んだ一覧であり、売上ランキングではありません — 公開されている売上ランキングは存在しません。',
  'featured.popularHeading': 'よく読まれ、よく訳される本',
  'featured.popularBlurb': '多くの言語で存在する本 — このサイトはそのためにあります。',
  'featured.filling': '一部はまだ裏側で取得中です。1 分ほどしてから再読み込みしてください。',
  'featured.freeCopy': '無料で入手可',

  // --- Free books ---------------------------------------------------------
  'free.homeHeading': '今すぐ無料で読める',
  'free.homeBlurb':
    'パブリックドメインとオープンライセンスの本を、このインスタンスが直接お渡しします。',
  'free.seeAll': 'もっと見る',
  'free.downloadable': 'ダウンロード',
  'free.pageTitle': '無料の本',
  'free.pageBlurb':
    'ここにある本には、少なくとも一つの合法な無料版があります。パブリックドメイン、または権利者が公開したものです。購入も図書館カードも要りません。',
  'free.empty':
    'まだ無料の本はありません。このインスタンスが本を取得するにつれて無料版が現れます。本を検索してから、また覗いてみてください。',
  'free.emptyForLanguage':
    '{language}の無料版はまだありません。上のフィルターを外すと棚全体が見られます。',
  'free.showMore': 'さらに表示',
  'free.shown': '{total}冊中{shown}冊を表示しています。',
  'free.allLanguages': 'すべての言語の無料版。',
  'free.filteredByLanguage': '{language}の無料版のみ。',
  'free.filterByLanguage': '{language}の無料版だけを表示。',
  'free.dropLanguageFilter': 'すべての言語を表示',
  'free.loadFailed': 'いまは無料の本を読み込めませんでした。',
  'work.original': '原語',
  'work.dataSources': 'データ提供元',
  'work.about': 'この本について',
  'work.translatedInto': '翻訳されている言語',
  'work.availableIn': '収録されている言語',
  'work.languagesNote':
    '参照している情報源に載っているものだけです。ここにない翻訳が存在することもあります。',
  'work.noTranslations': 'まだ翻訳が見つかっていません。',
  'work.yourLanguage.title': 'あなたの言語で',
  'work.yourLanguage.yes': '{language}の翻訳があります。',
  'work.yourLanguage.original': 'この本の原語は{language}です。',
  'work.yourLanguage.no': '確認できた版の中に{language}の翻訳はありません。',
  'work.yourLanguage.show': '{language}の版を表示',
  'work.editions': '版（{total} 件中 {shown} 件）',
  'work.filterLanguage': '言語',
  'work.filterAllLanguages': 'すべての言語',
  'work.filterYear': '年',
  'work.filterApply': '絞り込む',
  'work.filterReset': 'リセット',
  'work.noEditionsMatch': 'この条件に合う版はありません。',
  'work.showMoreEditions': 'さらに版を表示（残り {remaining} 件）',
  'work.badgeFreeDownload': '無料ダウンロード',
  'work.freeDownloadFormat': '{format}をダウンロード',
  'work.freeDownloadNote': '{rights}。{provider}から無料 — アカウントも支払いも不要です。',
  'work.badgeReadBorrow': '読む・借りる',
  'work.badgeInBookstores': '書店で',
  'work.translatedBy': '訳：{name}',
  'work.pages': '{count} ページ',
  'bookmark.save': 'この本を保存',
  'bookmark.saved': '保存済み',
  'bookmark.signInToSave': '保存するにはログイン',
  'bookmark.failed': '保存できませんでした。もう一度お試しください。',
  'links.show': 'リンクを表示',
  'links.hide': 'リンクを隠す',
  'links.loading': 'リンクを読み込み中',
  'links.none': 'この版の合法なリンクはまだありません。',
  'links.viaOtherEdition': '{label}版の無料コピー',
  'links.failed': 'リンクを読み込めませんでした。',
  'links.storesHeading': '書店で探す',
  'links.storesInCountry': '{country} の書店',
  'links.storesYourCountry': 'お住まいの国',
  'links.storesLanguageMarket': '{language} の本が売られている国',
  'links.storesLanguageMarketGeneric': 'この版の言語の本が売られている国',
  'links.storesWorldwide': '世界中に発送',
  'links.storesCaption':
    '各リンクはその書店自身のカタログを検索します。在庫と価格は書店が表示します。',
  'linkType.download': 'ダウンロード',
  'linkType.buy': '購入',
  'linkType.borrow': '図書館で借りる',
  'linkType.listen': '聴く（オーディオブック）',
  'rights.public_domain': 'パブリックドメイン',
  'rights.open_license': 'オープンライセンス',
  'rights.copyrighted': '著作権あり',
  'rights.unknown': '状態不明',
  'compare.heading': '版を比較する',
  'compare.blurb': '2 つか 3 つの版を選ぶと、実際に違う点だけが表示されます。',
  'compare.selected': '{count} 件選択中（最低 2 件必要）。',
  'compare.editSelection': '版を変更',
  'compare.showAllEditions': 'すべての版を表示（{count} 件）',
  'compare.columnDifference': '違い',
  'compare.identical': '各ソースが記録している範囲では、これらの版は同一です。',
  'compare.rowLanguage': '言語',
  'compare.rowPublished': '刊行年',
  'compare.rowPublisher': '出版社',
  'compare.rowTranslator': '訳者',
  'compare.rowTranslatedFrom': '原語',
  'compare.rowBinding': '装丁',
  'compare.rowPages': 'ページ数',
  'compare.rowIsbn': 'ISBN',
  'compare.rowFreeCopy': '無料または貸出可能な版',
  'compare.yes': 'あり（{count}）',
  'compare.no': '見つかりません',
  'country.label': '本はどの国で買いますか？',
  'country.worldwideOnly': '世界発送の書店のみ',
  'auth.signInTitle': 'ログイン',
  'auth.registerTitle': 'アカウント作成',
  'auth.blurb':
    'アカウントの目的はひとつだけです。見つけた本を保存し、後で戻ってくること — 翻訳されている言語、存在する版、そしてそれぞれを合法に入手する方法とともに。メール配信も、プロフィールも、追跡もありません。',
  'auth.name': '名前（任意）',
  'auth.email': 'メールアドレス',
  'auth.password': 'パスワード',
  'auth.passwordHint':
    '{min} 文字以上。確認するのは長さだけです — 覚えられる長い文のほうが、記号を混ぜた短いものより安全です。',
  'auth.submitSignIn': 'ログイン',
  'auth.submitRegister': 'アカウントを作成',
  'auth.working': '処理中…',
  'auth.google': 'Google で続ける',
  'auth.toRegister': 'アカウントがありませんか？作成する',
  'auth.toSignIn': 'すでにアカウントをお持ちですか？ログイン',
  'auth.backToSearch': '検索に戻る',
  'auth.errorGoogleState':
    'このログインリンクは期限切れか、別のブラウザーで開かれました。もう一度お試しください。',
  'auth.errorGoogleFailed':
    'Google でのログインが完了しませんでした。メールアドレスとパスワードでもログインできます。',
  'auth.errorGeneric': '問題が発生しました。',
  'bookmarks.title': '保存した本',
  'bookmarks.signedOut':
    'すると、見つけた本を保存しておけます。後で同じ本の版を並べて比較することもできます。',
  'bookmarks.loading': '読み込み中…',
  'bookmarks.empty':
    'まだ何も保存されていません。本を探して、カードの「この本を保存」を使ってください。',
  'bookmarks.searchLink': '検索',
  'bookmarks.remove': '削除',
  'bookmarks.loadFailed': '保存した本を読み込めませんでした。',
  'search.failed': '検索に失敗しました。',
  'search.pending': 'まだデータベースにありません — 各ソースを確認しています',
  'search.pendingLong':
    'まだ検索中です。ある本の最初のリクエストは各ソースからデータを集めるため、数分かかることがあります',
  'search.notFoundHint': '見つかりませんでした。書名や著者名をより正確に入力してみてください。',
  'search.timedOut':
    'ソースの応答が遅く、まだデータがありません。バックグラウンドの同期はすでに終わっているかもしれません — もう一度お試しください。',
  'search.freeOnlyToggle': '無料で入手可',
  'search.noFreeResults':
    'これらの中に無料で入手できるものはまだありません — フィルターを解除してみてください。',
  'home.tagline': '次の一冊、あなたの代表作を見つける',
  'subject.allLanguages': 'すべての言語。',
  'subject.filteredByLanguage': '{language}の版がある本のみ。',
  'subject.dropLanguageFilter': 'すべての言語を表示',
  'subject.empty':
    'このタグにはまだ何もありません。タグは、この環境がすでに取得した本から集まります。',
  'featured.year': '{year}年',
  'nav.browse': 'ジャンル別',
  'recommend.heading': 'これまで読んだ本から',
  'recommend.becauseOf': '「{title}」を開いたので、同じジャンルの本を集めました。',
  'recommend.blurb': 'あなたが開いてきたジャンルの本です。',
  'recommend.privacy':
    'この計算はブラウザー内で行われます。サーバーに伝わるのはジャンルだけで、あなたが誰かは伝わりません。',
  'recommend.forget': '履歴を消す',

  // --- Shelf: OPDS catalogs (Module A) -------------------------------------
  'nav.shelf': '本棚',
  'shelf.title': '本棚',
  'shelf.intro':
    'オープンなカタログと、あなた自身が運用している蔵書サーバー。追加したカタログはこのブラウザーに留まり、このサイトへ送られることはありません。',
  'shelf.openCatalogs': 'オープンなカタログ',
  'shelf.yourCatalogs': 'あなたのカタログ',
  'shelf.addCatalog': 'カタログを追加',
  'shelf.name': '名前',
  'shelf.address': 'OPDS アドレス',
  'shelf.username': 'ユーザー名（任意）',
  'shelf.password': 'パスワード（任意）',
  'shelf.credentialsNote': 'アドレスと認証情報はこのブラウザーにのみ保存されます。',
  'shelf.add': '追加',
  'shelf.remove': '削除',
  'shelf.loading': 'カタログを読み込み中…',
  'shelf.empty': 'このカタログには項目がありません。',
  'shelf.noCatalogs':
    'まだ自分のカタログがありません。下に Calibre-Web、COPS、Kavita、Audiobookshelf のアドレスを追加してください。',
  'shelf.unreachable':
    'ブラウザーからこのカタログを読み取れませんでした。自分のネットワーク上のサーバーなら動きます。公開サイトはクロスオリジンの要求をよく拒否します。',
  'shelf.nextPage': '次のページ',
  'shelf.previousPage': '前のページ',
  'shelf.drm': 'DRM アプリが必要',
  'shelf.notFree': '無料のダウンロードではありません',
  'shelf.download': 'ダウンロード',

  // --- Bookshops nearby (Module B) -----------------------------------------
  'stores.title': '近くの書店',
  'stores.useMyLocation': '現在地を使う',
  'stores.placeLabel': '市区町村または郵便番号',
  'stores.find': '探す',
  'stores.locating': '検索中…',
  'stores.failed': '位置情報を取得できません。市区町村名か郵便番号を入力してください。',
  'stores.none': '{radius} km 以内に地図上の書店はありません。',
  'stores.distance': '{distance} km 先',
  'stores.stockUnknown': '地図データのみ — 書店の在庫を公開している情報源はありません。',
  'stores.lookupFailed':
    'いま OpenStreetMap に接続できませんでした。少ししてからもう一度お試しください。',
  'stores.privacy':
    '現在地は約 100 m に丸めて OpenStreetMap にのみ送信され、このサイトへは送られません。',

  // --- Prices across shops (Module C) --------------------------------------
  'prices.title': '価格と書店',
  'prices.loading': '書店に問い合わせ中…',
  'prices.unknown': '価格は公開されていません',
  'prices.degraded': '応答なし: {providers}',
  'prices.format.hardcover': 'ハードカバー',
  'prices.format.paperback': 'ペーパーバック',
  'prices.format.ebook': '電子書籍',
  'prices.format.audiobook': 'オーディオブック',
  'prices.format.unknown': '形態の記載なし',

  'ratings.edition': '{outOf} 点中 {average} 点／{source} の読者 {votes} 人の評価',
  'ratings.lowConfidence': '比較するには評価数が少なすぎます',
  'ratings.reviews': 'レビュー',
  'ratings.reviewsOn': 'この版のレビュー（{source}）',
  'ratings.noteNoRatings':
    '翻訳そのものを評価する公開情報はなく、これらの版には読者評価もありません。',
  'ratings.noteReviews':
    '{sources} に登録のある版は、リンク先がその版自体のレビューです（登録のない版がほとんどです）。',
  'ratings.translator':
    '{name} 訳の版：評価のある {editions} 版で {outOf} 点中 {average} 点、評価数は合計 {votes} 件。',
  'ratings.note':
    'これは {sources} で特定の版に付けられた読者の評価であり、翻訳そのものの評価ではありません（それを公開している所はありません）。同じ本、同じ言語、別の訳者どうしを、評価数と一緒に見比べるための数字です。',
  'ratings.gapWithoutIsbn': '{count} 版には ISBN がないため、評価を結び付けられませんでした。',
  'ratings.gapNotLookedUp': 'さらに {count} 版は、この要求では照会していません。',
  'recommend.hideGenre': '「{genre}」を非表示にする',
  'recommend.hiddenList': '非表示のジャンル（クリックで戻せます）:',

  // --- 設定のポップアップ ---
  'settings.status.saved': '保存しました',
  'settings.status.cleared': '解除しました',
  'settings.status.unstored': '未保存',
  'settings.status.failed': '変更なし',
  'settings.notStored':
    'このブラウザが保存を拒否したため、何も起きていません。以前の値がそのまま有効です。',
  'settings.language.title': '表示言語',
  'settings.language.changed':
    '{from} から {to} に変更しました。画面は{to}で再読み込みされます。本のタイトルや著者名はそのままの言語で表示されます。',
  'settings.country.title': '購入する国',
  'settings.country.changed':
    '{country} に設定しました。書店リンクに、世界配送の店に加えてそこへ配送する店も表示されます。',
  'settings.country.cleared': '国は未選択です。世界中に配送する書店だけを表示します。',
  'settings.bookLanguage.title': '本の言語',
  'settings.bookLanguage.changed':
    '{language} に設定しました。フィルターを解除するまで、ジャンルのページでは{language}版のある本が先に表示されます。',
  'settings.bookLanguage.cleared':
    '解除しました。ジャンルのページは再びすべての言語の本を表示します。',
  'settings.hiddenGenres.title': '非表示のジャンル',
  'settings.hiddenGenres.hidden':
    '「{genre}」を非表示にしました。おすすめの取得時にサーバーへ送られることはなくなり、非表示のジャンルは全部で{count}件です。',
  'settings.hiddenGenres.restored':
    '「{genre}」をおすすめに戻しました。非表示のジャンルは残り{count}件です。',
  'settings.history.title': '閲覧履歴',
  'settings.history.cleared':
    '開いた本の記録をこのブラウザから削除しました。次に本を開くまで、おすすめは表示されません。',
  'settings.bookmarks.title': '保存した本',
  'settings.bookmarks.added': '「{title}」を保存した本に追加しました。',
  'settings.bookmarks.removed': '「{title}」を保存した本から削除しました。',
  'settings.bookmarks.failed': 'サーバーが変更を受け付けなかったため、保存した本は元のままです。',
  'settings.catalogs.title': 'あなたのカタログ',
  'settings.catalogs.added':
    '「{name}」を {url} で追加しました。アドレスはこのブラウザに留まり、このサイトに送られることはありません。',
  'settings.catalogs.addedWithCredentials':
    '「{name}」を {url} で、入力したユーザー名とパスワードとともに追加しました。すべてこのブラウザに留まり、このサイトには一切送られません。',
  'settings.catalogs.removed':
    '「{name}」を、保存されていた認証情報とともにこのブラウザから削除しました。',
  'settings.catalogs.rejected': '何も追加されませんでした: {reason}',
  // --- Addons ---------------------------------------------------------------
  'nav.addons': 'アドオン',
  'addons.title': 'アドオン',
  'addons.intro':
    'アドオンは独自の入手先を持ち込みます。アドレスを貼り付けて導入します。動く場所は、サンドボックス内のあなたの端末か、作者のサーバーのどちらかです。Golden Library はアドオンを同梱せず、一覧も出さず、返ってきた内容も検査しません。',
  'addons.addressLabel': 'アドオンのアドレス',
  'addons.addressHint': '作者から渡されたマニフェストの URL。',
  'addons.continue': '次へ',
  'addons.fromServer': 'サーバーから',
  'addons.fromFile': 'ファイルから（あなたの端末で動きます）',
  'addons.bundleLabel': 'アドオンのコードのアドレス',
  'addons.bundleHint': 'コードの URL。サーバーではなく、この端末で動きます。',
  'addons.integrityLabel': '完全性ハッシュ',
  'addons.integrityHint':
    '作者から sha256-… の形で渡されます。必須です。これがないと、一度承認したコードが後から変わっても気づけません。',
  'addons.checking': 'アドオンを読み込み中…',
  'addons.installedHeading': '導入済み',
  'addons.none':
    'まだアドオンはありません。ここに出ているものはすべてこのインスタンス自身のものです。',
  'addons.priorityHint': '並び順が優先順位です。先頭のアドオンが最初に答えます。',
  'addons.enable': '有効にする',
  'addons.disable': '無効にする',
  'addons.off': '無効',
  'addons.remove': '削除',
  'addons.moveUp': '上へ',
  'addons.moveDown': '下へ',
  'addons.configure': '設定',
  'addons.failedToStart': '「{name}」が起動しませんでした: {reason}',
  'addons.consentTitle': '「{name}」を導入しますか？',
  'addons.consentHosts': '接続先: {hosts}',
  'addons.consentNoHosts': '接続先は要求されていません。',
  'addons.consentSeesYou':
    'このアドオンは作者のサーバーで動きます。作者にはあなたのアドレスと、このアドオンを通して探したものがすべて見えます。',
  'addons.consentSandboxed':
    'このアドオンはあなたの端末のサンドボックス内で動きます。クッキーも、このサイトのデータも、開いている他のものも読めません。',
  'addons.consentNotVetted':
    'Golden Library はアドオンが返す内容を検査しておらず、これを推奨してもいません。何を入れるかはあなたの判断です。',
  'addons.install': '導入する',
  'addons.cancel': 'やめる',
  'addons.via': '{name} 経由',
  'addons.sourcesTitle': 'あなたのアドオンから',
  'addons.searchTitle': 'あなたのアドオンが見つけたもの',
  'addons.showLinks': 'ダウンロードリンクを表示',
  'addons.unreadable': 'このアドオンの {count} 件は読み取れませんでした。',
  'addons.browse': 'カタログを見る',
  'addons.browseTitle': '「{name}」のカタログ',
  'addons.browseNoCatalog': 'このアドオンには閲覧できるカタログがありません。',
  'addons.browseEmpty': 'このアドオンのカタログは現在空です。',
  'addons.browseFailed': '「{name}」のカタログを読み込めませんでした：{reason}',
  'addons.loadMore': 'もっと見る',
  'addons.notInstalled': 'このアドオンはインストールされていません。',

  'settings.addons.title': 'あなたのアドオン',
  'settings.addons.installed':
    '「{name}」を導入しました。他と並んで問い合わせられ、{hosts} に接続することがあります。',
  'settings.addons.removed':
    '「{name}」を削除しました。このブラウザーから結果も、ここに保存していたものも消えました。',
  'settings.addons.enabled': '「{name}」を再び有効にしました。他と一緒に問い合わせられます。',
  'settings.addons.disabled':
    '「{name}」を無効にしました。設定ごと導入されたままですが、返す内容は表示されません。',
  'settings.addons.reordered':
    '「{name}」は {total} 件中 {position} 番目に答えるようになりました。',
  'settings.addons.rejected': '何も導入されませんでした: {reason}',

  // --- Custom sources ---------------------------------------------------------
  'nav.customSources': 'カスタムソース',
  'customSources.title': 'カスタムソース',
  'customSources.intro':
    '名前と、{isbn}、{query}、{title}、{author}、{language} を含む検索URLを指定して、自分の店やカタログを追加できます。リンクはこの端末上で作られ、このサイトが取得することはありません。',
  'customSources.nameLabel': '名前',
  'customSources.templateLabel': 'URLテンプレート',
  'customSources.templateHint':
    '絶対URL（https://）。{isbn}、{query}、{title}、{author}、{language} はエディションの情報から埋められます。空のままのプレースホルダーがあると、そのエディションのリンクは省略されます。',
  'customSources.add': 'ソースを追加',
  'customSources.listHeading': 'あなたのソース',
  'customSources.none': 'カスタムソースはまだありません。',
  'customSources.off': 'オフ',
  'customSources.enable': 'オンにする',
  'customSources.disable': 'オフにする',
  'customSources.remove': '削除',
  'customSources.heading': 'あなたのソース',
  'customSources.caption': 'ご自身で設定したリンクです。このインスタンスはリンク先を確認しません。',

  'settings.customSources.title': 'あなたのカスタムソース',
  'settings.customSources.added': '「{name}」を追加しました。他のソースと並んで提示されます。',
  'settings.customSources.removed': '「{name}」をこのブラウザから削除しました。',
  'settings.customSources.enabled': '「{name}」を再びオンにしました。',
  'settings.customSources.disabled':
    '「{name}」はオフです。設定は残りますが、リンクは表示されません。',
  'settings.customSources.rejected': '何も追加されませんでした: {reason}',

  // --- Books in the reader's own language, and localized descriptions -------
  'featured.inLanguageHeading': 'あなたの言語の本',
  'featured.inLanguageBlurb':
    'このサイトを読んでいる言語で書かれた本です。版を重ねた順に並んでいます — Open Library 自身の並び順であって、売上ランキングではありません。',
  'work.newSearch': '新しく検索',
  'work.descriptionFrom': '紹介文:',
  'work.descriptionNotLocalized':
    'この紹介文は情報源が書いた言語のままです。この本については、あなたの言語のものはまだありません。',
};
