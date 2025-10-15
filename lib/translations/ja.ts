export const ja = {
  // 共通
  common: {
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    cancel: 'キャンセル',
    confirm: '確認',
    save: '保存',
    delete: '削除',
    edit: '編集',
    create: '作成',
    search: '検索',
    clear: 'クリア',
    submit: '送信',
    back: '戻る',
    next: '次へ',
    previous: '前へ',
    close: '閉じる',
    view: '表示',
    upload: 'アップロード',
    download: 'ダウンロード',
    new: '新規',
    copySuccess: 'コピーしました',
    copyError: 'コピーに失敗しました',
    unknownAuthor: '不明な作者',
    loadFailed: '読み込みに失敗しました'
  },

  // ナビゲーション
  nav: {
    home: 'ホーム',
    docs: 'ドキュメント',
    create: '作品投稿',
    profile: 'プロフィール',
    settings: '設定',
    admin: '管理',
    login: 'ログイン',
    logout: 'ログアウト',
    register: '登録',
    loginRegister: 'ログイン/登録'
  },

  // ホーム
  home: {
    title: 'VRCFace',
    subtitle: 'VRChatアバター作品を共有しよう',
    description: '美しいVRChat共有ブレンドシェイプを探索、共有、ダウンロードし、世界中のクリエイターと一緒にユニークなバーチャルアイデンティティを作成しましょう',
    viewDocs: 'ドキュメントを見る',
    goToGithub: 'GitHubへ',
    featuredModels: '人気モデル',
    featuredDescription: 'コミュニティで最も人気のあるVRChat共有ブレンドシェイプを探索し、タグフィルタリングで完璧なモデルを見つけましょう',
    popularModels: '人気モデル',
    exploreDescription: 'コミュニティで最も人気のあるVRChat共有ブレンドシェイプを探索',
    allTags: 'すべて',
    viewDetails: '詳細を見る',
    discoverModels: 'モデルを発見',
    discoverDescription: 'コミュニティクリエイターが共有する共有ブレンドシェイプを発見し、タグフィルタリングで最適なスタイルを見つけましょう',
    noModelsFound: '条件に合うモデルが見つかりません',
    tags: {
      all: 'すべて',
      cute: 'かわいい',
      cool: 'クール',
      funny: '面白い',
      gentle: '優しい',
      scifi: 'SF',
      animal: '動物',
      fantasy: 'ファンタジー',
      realistic: 'リアル',
      anime: 'アニメ'
    },
    features: {
      pluginShare: 'プラグイン共有',
      pluginShareDesc: 'プラグインを通じてVRChat共有ブレンドシェイプを簡単に共有・発見',
      tagFilter: 'タグフィルタリング',
      tagFilterDesc: 'インテリジェントなタグフィルタリングでお気に入りのモデルを素早く見つける',
      freeOpen: '無料・オープンソース',
      freeOpenDesc: '完全無料のプラットフォーム、オープンソースコード、コミュニティ主導'
    }
  },

  // 作成ページ
  create: {
    title: '新しい作品を投稿',
    titleField: 'タイトル',
    titlePlaceholder: 'モデルに素敵な名前をつけてください',
    titleRequired: 'タイトルを入力してください',
    description: '説明',
    descriptionPlaceholder: 'モデルの特徴、スタイル、使用シーンを説明してください...',
    descriptionRequired: '説明を入力してください',
    images: 'プレビュー画像',
    imagesSubtitle: '最大5枚',
    imagesSelected: '{count}枚の画像を選択',
    clearAll: 'すべてクリア',
    clickToUpload: 'クリックして画像をアップロード',
    continueUpload: '画像を追加 (残り{remaining}枚)',
    supportedFormats: 'JPG、PNG形式をサポート、複数選択可能',
    coverImage: 'カバー',
    firstImageAsCover: '最初の画像がカバーとして表示されます',
    tags: 'タグ',
    tagsRequired: '少なくとも1つのタグを選択してください',
    selectedTags: '選択されたタグ',
    availableTags: 'タグを選択',
    modelName: 'モデル名',
    modelStyle: 'モデルスタイル',
    newTag: '新規',
    createNewTag: '新しいタグを作成',
    tagName: 'タグ名',
    tagType: 'タグタイプ',
    addTag: 'タグを追加',
    tagExists: 'タグ名が既に存在します',
    faceData: '共有ブレンドシェイプ',
    faceDataOptional: 'オプション',
    faceDataPlaceholder: '共有ブレンドシェイプのJSONデータを貼り付けてください...',
    faceDataInvalid: '共有ブレンドシェイプの形式が正しくありません。有効なJSON形式を入力してください',
    visibility: '公開設定',
    public: '公開',
    publicDescription: '誰でも表示・ダウンロード可能',
    private: '非公開',
    privateDescription: '自分のみ表示可能',
    publishing: '投稿中...',
    publish: '作品を投稿',
    maxImages: '最大5枚まで画像をアップロードできます',
    imageProcessFailed: '画像処理に失敗しました。再試行してください',
    loginRequired: '最初にログインしてください',
    selectAtLeastOneImage: '少なくとも1枚のプレビュー画像を選択してください',
    publishSuccess: '作品が正常に投稿されました！',
    publishFailed: '投稿に失敗しました。再試行してください',
    errorOccurred: 'エラーが発生しました',
    loadingTags: 'タグを読み込み中...',
    tagLoadFailed: 'タグの読み込みに失敗しました',
    uploadImages: '画像をアップロード',
    dragDropImages: 'ここに画像をドラッグ&ドロップするか、クリックして選択',
    selectImages: '画像を選択',
    imageUploadTip: 'JPG、PNG形式をサポート、最大5枚まで',
    noTagsSelected: 'タグが選択されていません',
    selectTagsPrompt: 'モデルに適したタグを選択してください',
    faceDataDescription: 'VRChat 共有ブレンドシェイプ（可選）',
    faceDataHelp: '共有ブレンドシェイプを提供すると、他のユーザーがコピーできます',
    visibilitySettings: '公開設定',
    makePublic: '公開する',
    makePrivate: '非公開にする',
    publicNote: '公開すると、すべてのユーザーが表示・ダウンロードできます',
    privateNote: '非公開の場合、自分のみが表示できます',
    publishNewModel: '新しいモデルを投稿',
    shareYourWork: 'VRChatアバター作品を共有しよう',
    maxImagesError: '最大5枚まで画像をアップロードできます',
    invalidImageFile: '無効な画像ファイル',
    tagAlreadyExists: 'タグ名が既に存在します',
    imageRequired: '少なくとも1枚のプレビュー画像を選択してください',
    invalidJsonFormat: '共有ブレンドシェイプの形式が正しくありません。有効なJSON形式を入力してください',
    networkError: '投稿に失敗しました。ネットワーク接続を確認してください',
    publishSuccessTitle: '投稿完了！',
    redirectingToProfile: 'プロフィールページにリダイレクトしています...',
    form: {
      title: 'タイトル',
      titlePlaceholder: 'モデルに素敵な名前をつけてください',
      description: '説明',
      descriptionPlaceholder: 'モデルの特徴、スタイル、使用シーンを説明してください...',
      previewImages: 'プレビュー画像',
      maxImages: '最大5枚',
      selectedImages: '{count}枚の画像を選択',
      clearAll: 'すべてクリア',
      clickToUpload: 'クリックして画像をアップロード',
      continueAdding: '画像を追加（残り{remaining}枚）',
      supportedFormats: 'JPG、PNG形式をサポート、複数選択可能',
      cover: 'カバー',
      firstImageCover: '最初の画像がカバーとして表示されます',
      previewImageAlt: 'プレビュー画像 {index}',
      tags: 'タグ',
      modelName: 'モデル名',
      modelStyle: 'モデルスタイル',
      availableTags: '利用可能なタグ',
      createNewTag: '新しいタグを作成',
      tagNamePlaceholder: 'タグ名を入力',
      add: '追加',
      new: '新規',
      tagHint: 'タグは他の人があなたの作品を見つけやすくします',
      faceData: '共有ブレンドシェイプ',
      optional: 'オプション',
      faceDataPlaceholder: 'VRChat 共有ブレンドシェイプのJSONデータを貼り付けてください（オプション）...',
      faceDataHint: 'オプション：提供された場合、他のユーザーが共有ブレンドシェイプをコピーできます',
      visibility: '公開設定',
      public: '公開',
      private: '非公開',
      publicHint: '誰でも表示・ダウンロード可能',
      privateHint: '自分のみ表示可能',
      publishing: '投稿中...',
      publish: 'モデルを投稿'
    }
  },

  // タグ関連
  tags: {
    filter: 'タグフィルター',
    clearAll: 'すべてクリア',
    modelName: 'モデル名',
    modelStyle: 'モデルスタイル',
    searchPlaceholder: '{type}タグを検索...',
    selected: '選択済み',
    noTags: 'タグがありません',
    noMatchingTags: '一致するタグが見つかりません'
  },

  // タグフィルター
  tagFilter: {
    title: 'タグフィルター',
    clearAll: 'すべてクリア',
    modelName: 'モデル名',
    modelStyle: 'モデルスタイル',
    searchPlaceholder: '{type}タグを検索...',
    selected: '選択済み',
    noTags: 'タグがありません',
    noMatch: '一致するタグが見つかりません'
  },

  // 管理ページ
  admin: {
    dashboard: 'ダッシュボード',
    userManagement: 'ユーザー管理',
    contentManagement: 'コンテンツ管理',
    tagManagement: 'タグ管理',
    systemSettings: 'システム設定',
    totalModels: '合計{count}個のモデル',
    totalTags: '合計{count}個のタグ',
    searchAndFilter: '検索とフィルター',
    searchModels: 'モデルのタイトルまたは説明を検索...',
    filterByAuthor: '作者IDでフィルター...',
    modelList: 'モデルリスト',
    tagList: 'タグリスト',
    searchTags: 'タグ名または説明を検索...',
    createTag: 'タグを作成',
    manageAllTags: 'システム内のすべてのタグを管理',
    role: '役割',
    normalUser: '一般ユーザー',
    moderator: 'モデレーター',
    admin: '管理者',
    verificationStatus: '認証状態',
    verified: '認証済み',
    unverified: '未認証'
  },

  // プロフィール
  profile: {
    editWork: '作品を編集',
    deleteWork: '作品を削除',
    noPreview: 'プレビューなし',
    unknownUser: '不明なユーザー',
    loginFirst: 'まずログインしてください',
    deleteFailed: '削除に失敗しました',
    verified: '認証済み',
    joinTime: '参加日：',
    editProfile: 'プロフィールを編集',
    follow: 'フォロー',
    unfollow: 'フォロー解除',
    works: '作品',
    fans: 'フォロワー',
    following: 'フォロー中',
    likesReceived: 'いいね',
    tabs: {
      models: '作品',
      favorites: 'お気に入り',
      followers: 'フォロワー',
      following: 'フォロー中'
    },
    noWorks: '作品がありません',
    noWorksOwn: '最初の作品を作成しましょう！',
    noWorksOther: 'このユーザーはまだ作品を公開していません',
    favoriteWorks: 'お気に入りの作品',
    loadingFavorites: 'お気に入りを読み込み中...',
    noFavorites: 'お気に入りがありません',
    noFavoritesOwn: 'まだ作品をお気に入りに追加していません',
    noFavoritesOther: 'このユーザーはまだ作品をお気に入りに追加していません',
    followersList: 'フォロワーリスト',
    followingList: 'フォロー中リスト',
    featureInDevelopment: '機能開発中...',
    private: 'プライベート',
    views: '閲覧',
    likes: 'いいね',
    edit: '編集',
    delete: '削除',
    favoritedAt: 'お気に入り追加日',
    userNotFound: 'ユーザーが見つかりません',
    back: '戻る',
    operationFailed: '操作に失敗しました',
    networkError: 'ネットワークエラーです。後でもう一度お試しください'
  },

  // モデルカード
  modelCard: {
    vrcModel: 'VRCモデル',
    private: 'プライベート',
    modelName: 'モデル名',
    modelStyle: 'モデルスタイル',
    favorite: 'お気に入り',
    modelNotFound: 'モデルが見つかりません',
    loadFailed: '読み込みに失敗しました',
    modelDetails: 'モデル詳細',
    copied: 'コピーしました',
    copyFaceData: '共有ブレンドシェイプをコピー',
    modelDetailsNotFound: 'モデル詳細が見つかりません',
    modelImages: 'モデル画像',
    cover: 'カバー',
    faceData: '共有ブレンドシェイプ'
  },

  // フィード
  feed: {
    noModelsFound: 'モデルが見つかりません',
    adjustFilters: 'フィルターや検索条件を調整してください'
  },

  // フィードコントロール
  feedControls: {
    searchPlaceholder: 'モデルを検索...',
    totalCount: '合計 {count} 個のモデル',
    gridView: 'グリッド表示',
    listView: 'リスト表示',
    filter: 'フィルター',
    sortOptions: {
      latest: '最新発布',
      trending: '人気トレンド',
      mostLiked: '最多いいね'
    }
  },

  // モデル編集
  editModel: {
    title: '作品を編集',
    titleField: 'タイトル *',
    titlePlaceholder: 'モデルに素敵な名前をつけてください',
    description: '説明 *',
    descriptionPlaceholder: 'モデルの特徴、スタイル、使用シーンを説明してください...',
    previewImages: 'プレビュー画像',
    maxImages: '最大5枚',
    coverImage: 'カバー',
    clickToUpload: 'クリックして画像をアップロード',
    continueUpload: '画像を追加',
    remaining: '残り',
    supportedFormats: 'JPG、PNG形式をサポート、複数選択可能',
    firstImageAsCover: '最初の画像がカバーとして表示されます',
    tags: 'タグ',
    modelName: 'モデル名',
    modelStyle: 'モデルスタイル',
    selectTags: 'タグを選択',
    createNewTag: '新しいタグを作成',
    enterNew: '新しい',
    tag: 'タグを入力',
    jsonData: 'VRChat共有ブレンドシェイプ（JSON形式）',
    jsonPlaceholder: 'VRChat共有ブレンドシェイプのJSONデータを貼り付けてください（オプション）...',
    jsonDescription: 'オプション：提供された場合、他のユーザーが共有ブレンドシェイプをコピーできます',
    publicSetting: '公開投稿（他のユーザーが表示・ダウンロード可能）',
    updating: '更新中...',
    updateWork: '作品を更新',
    maxImagesError: '最大5枚まで画像をアップロードできます',
    invalidImage: '無効な画像ファイル',
    imageProcessFailed: '画像処理に失敗しました。再試行してください',
    titleRequired: 'タイトルを入力してください',
    descriptionRequired: '説明を入力してください',
    invalidJson: 'JSONデータの形式が正しくありません',
    loginRequired: '最初にログインしてください',
    updateSuccess: '作品が正常に更新されました！',
    updateFailed: '更新に失敗しました。再試行してください',
    networkError: '更新に失敗しました。ネットワーク接続を確認してください'
  },

  // 削除確認モーダル
  deleteConfirm: {
    title: '作品の削除を確認',
    aboutToDelete: '削除予定の作品：',
    warning: '警告：',
    warningText: 'この操作は取り消せません！削除後、以下のデータが永久に失われます：',
    dataLoss: {
      images: 'すべてのプレビュー画像',
      likes: 'すべてのいいね',
      comments: 'すべてのコメント',
      stats: 'すべての統計データ'
    },
    cancel: 'キャンセル',
    deleting: '削除中...',
    confirmDelete: '削除を確認'
  },

  // エラーとステータスメッセージ
  messages: {
    authRequired: 'このページにアクセスするにはログインが必要です',
    loadingTags: 'タグを読み込み中...',
    tagsFetchFailed: 'タグの取得に失敗しました',
    createTagFailed: 'タグの作成に失敗しました'
  },

  // 認証フォーム
  auth: {
    welcome: {
      loginTitle: 'おかえりなさい！',
      loginSubtitle: 'アカウントにサインイン',
      registerTitle: 'アカウントを作成',
      registerSubtitle: 'コミュニティに参加'
    },
    form: {
      username: 'ユーザー名',
      displayName: '表示名',
      email: 'メールアドレス',
      password: 'パスワード',
      confirmPassword: 'パスワード確認',
      usernamePlaceholder: 'ユーザー名を入力',
      displayNamePlaceholder: '表示名を入力（オプション）',
      emailPlaceholder: 'メールアドレスを入力',
      passwordPlaceholder: 'パスワードを入力',
      confirmPasswordPlaceholder: 'パスワードを再入力',
      forgotPassword: 'パスワードを忘れましたか？',
      loading: '処理中...',
      loginButton: 'サインイン',
      registerButton: 'アカウント作成',
      resendButton: '確認メールを再送信',
      noAccount: 'アカウントをお持ちでないですか？',
      hasAccount: 'すでにアカウントをお持ちですか？',
      registerLink: '今すぐ登録',
      loginLink: '今すぐログイン'
    },
    validation: {
      emailPasswordRequired: 'メールアドレスとパスワードは必須です',
      invalidEmail: 'メールアドレスの形式が正しくありません',
      passwordTooShort: 'パスワードは6文字以上である必要があります',
      usernameRequired: 'ユーザー名は必須です',
      invalidUsername: 'ユーザー名は文字、数字、アンダースコアのみ使用可能で、3-20文字である必要があります',
      passwordMismatch: 'パスワードが一致しません'
    },
    success: {
      loginSuccess: 'ログインに成功しました',
      registerSuccess: '登録に成功しました'
    },
    errors: {
      loginFailed: 'ログインに失敗しました。後でもう一度お試しください',
      registerFailed: '登録に失敗しました。後でもう一度お試しください',
      networkError: 'ネットワークエラーです。後でもう一度お試しください',
      emailRequired: 'メールアドレスを入力してください',
      resendFailed: '確認メールの送信に失敗しました'
    },
    forgotPassword: {
      title: 'パスワードを忘れた場合',
      subtitle: 'パスワードリセット用のメールアドレスを入力',
      emailPlaceholder: 'メールアドレスを入力',
      sendButton: 'リセットリンクを送信',
      sending: '送信中...',
      success: 'リセットリンクをメールに送信しました',
      error: 'リセットリンクの送信に失敗しました',
      backToLogin: 'ログインに戻る'
    },
    resetPassword: {
      title: 'パスワードリセット',
      subtitle: '新しいパスワードを入力',
      newPasswordPlaceholder: '新しいパスワードを入力',
      confirmPasswordPlaceholder: '新しいパスワードを確認',
      resetButton: 'パスワードをリセット',
      resetting: 'リセット中...',
      success: 'パスワードが正常にリセットされました',
      error: 'パスワードのリセットに失敗しました',
      invalidToken: '無効または期限切れのリセットトークンです'
    }
  },

  // 設定ページ
  settings: {
    title: 'アカウント設定',
    subtitle: '個人情報と設定を管理',
    loading: '読み込み中...',
    basicInfo: {
      title: '基本情報',
      username: 'ユーザー名',
      email: 'メールアドレス',
      displayName: '表示名',
      avatar: 'アバターURL',
      bio: '自己紹介',
      usernameNote: 'ユーザー名は変更できません',
      emailNote: 'メールアドレスは変更できません',
      displayNamePlaceholder: '表示名を入力',
      avatarPlaceholder: 'アバター画像のURLを入力',
      bioPlaceholder: '自己紹介を入力してください...'
    },
    form: {
      saving: '保存中...',
      saveButton: '設定を保存'
    },
    success: {
      settingsSaved: '設定が正常に保存されました！',
      saveSuccess: '設定が正常に保存されました！'
    },
    errors: {
      saveFailed: '保存に失敗しました。後でもう一度お試しください'
    }
  },
  // Documentation
  docs: {
    title: 'VRCFace ドキュメント',
    subtitle: 'VRCFaceプラットフォームを使用してVRChatの顔データを共有・管理し、プラグインやタグフィルタリング機能を通じてお気に入りのモデルを簡単に見つける方法を学びましょう',
    backToHome: 'ホームに戻る',
    quickStart: {
      title: 'クイックスタート',
      description: '気に入ったモデルを見つけて、作者が顔データを提供している場合、以下の手順に従って顔データを自分のモデルにインポートできます',
      viewTutorial: 'チュートリアルを見る'
    },
    blendshapes: {
      title: 'BlendShapesのエクスポート方法',
      description: 'Unityプラグインを通じてBlendShapesデータを素早くエクスポート・インポートする方法を学びましょう',
      viewTutorial: 'チュートリアルを見る'
    },
    community: {
      title: 'コミュニティガイドライン',
      description: 'コミュニティルールと他のユーザーとの交流・協力方法を学びましょう',
      viewRules: 'コミュニティルール'
    },
    api: {
      title: 'API ドキュメント',
      description: '開発者向けの完全なAPIインターフェースドキュメントとサンプルコード',
      viewReference: 'API リファレンス'
    },
    moreContent: 'より詳細なドキュメント内容を作成中...',
    stayTuned: 'ドキュメントは今後の開発ステップで段階的に改善されます。お楽しみに！',
    backToDocs: 'ドキュメントに戻る',
    tutorial: {
      quickStart: {
        title: 'クイックスタート',
        subtitle: '気に入ったモデルを見つけて、作者が顔データを提供している場合、以下の手順に従って顔データを自分のモデルにインポートできます',
        steps: {
          step1: {
            title: 'モデルの一致を確認',
            description: 'ウェブサイト上のモデル名が自分のモデルと同じであることを確認してください'
          },
          step2: {
            title: 'Unityプラグインをダウンロード',
            description: 'GitHubリリースリンクから最新バージョンのunitypackageファイルをダウンロードしてください',
            tip: '最新のunitypackageをダウンロードしてUnityにインポートしてください'
          },
          step3: {
            title: 'BlendShape Extractorツールを開く',
            description: 'メニューバーからOniya tools → BlendShape Extractorを見つけてください'
          },
          step4: {
            title: 'インポートオブジェクトを設定',
            description: '"Import blendshapes via json file"項目を見つけて、対応するblendshapesを含むgameobjectをドラッグしてください'
          },
          step5: {
            title: '顔データをコピー',
            description: 'モデル詳細ページを開き、右上の「顔データをコピー」ボタンをクリックしてください'
          },
          step6: {
            title: 'Unityにデータを貼り付け',
            description: 'Unityプラグインに戻り、「クリップボードから貼り付け」ボタンをクリックしてください'
          },
          step7: {
            title: 'インポート完了',
            description: 'インポートしたいblendshapesデータを選択し、「Import blendshape」ボタンを押してインポートを完了してください',
            success: {
              label: '成功！',
              content: 'これでUnityでVRCFaceのブレンドシェイプデータを使用できます！'
            }
          }
        }
      },
      blendshapes: {
        title: 'BlendShapesのエクスポート方法',
        subtitle: 'Unityプラグインを通じてBlendShapesデータを素早くエクスポート・インポートする方法を学びましょう',
        steps: {
          step1: {
            title: 'Unityプラグインをダウンロード',
            description: 'GitHubリリースリンクにアクセスして最新バージョンのunitypackageファイルをダウンロードしてください',
            tip: '最新の機能と修正を確実に取得するため、最新のリリースバージョンを選択してダウンロードしてください。'
          },
          step2: {
            title: 'Unityプロジェクトにインポート',
            description: 'ダウンロードしたunitypackageファイルをUnityプロジェクトにインポートしてください',
            steps: [
              'UnityでプロジェクトOを開く',
              'ダウンロードした.unitypackageファイルをダブルクリックするか、Assets → Import Package → Custom Packageからインポート',
              'インポートダイアログで「Import」ボタンをクリック',
              'インポート完了後、上部メニューバーでOniya tools → BlendShape Extractorを見つける'
            ]
          },
          step3: {
            title: 'BlendShape Extractorを使用',
            description: 'ツールウィンドウを開いてBlendShapesデータをエクスポートしてください',
            steps: [
              'メニューバーでOniya tools → BlendShape Extractorをクリックしてツールウィンドウを開く',
              'SkinnedMeshRendererコンポーネントを含むGameObjectをツールウィンドウの指定エリアにドラッグ',
              'ツールが自動的に利用可能なすべてのBlendShapesを検出してリスト表示'
            ]
          },
          step4: {
            title: 'クリップボードにコピー',
            description: 'エクスポートしたBlendShapesデータをクリップボードにコピーしてVRCFaceで使用してください',
            steps: [
              'ツールウィンドウの「クリップボードにコピー」ボタンをクリック',
              'データがJSON形式でシステムクリップボードにコピーされます',
              'VRCFace作成ページに移動してデータを貼り付けて新しいモデルを作成'
            ],
            success: 'これでこれらのBlendShapesデータを使用してVRCFaceでバーチャルアバターを作成・共有できます。'
          }
        },
        faq: {
          title: 'よくある質問',
          q1: {
            question: 'なぜGameObjectが認識されないのですか？',
            answer: 'GameObjectにSkinnedMeshRendererコンポーネントが含まれており、そのコンポーネントにBlendShapesデータがあることを確認してください。'
          },
          q2: {
            question: 'エクスポートされるデータの形式は何ですか？',
            answer: 'ツールはすべてのBlendShapes名と重み情報を含む標準JSON形式でエクスポートし、VRCFaceプラットフォームと完全に互換性があります。'
          },
          q3: {
            question: '複数のモデルを一括エクスポートできますか？',
            answer: '現在、ツールは単一モデルのエクスポートをサポートしています。バッチ処理の場合は、各モデルを個別にエクスポートしてください。'
          }
        }
      }
    }
  },

  ui: {
    scrollIndicator: {
      scrollDown: 'スクロールダウン'
    },
    waterfall: {
      layoutCalculating: 'レイアウト計算中...',
      allContentLoaded: 'すべてのコンテンツが読み込まれました'
    }
  }
}