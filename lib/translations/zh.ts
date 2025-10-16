export const zh = {
  // 通用
  common: {
    loading: '加载中...',
    error: '错误',
    success: '成功',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    create: '创建',
    search: '搜索',
    clear: '清除',
    submit: '提交',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    close: '关闭',
    view: '查看',
    upload: '上传',
    download: '下载',
    copySuccess: '复制成功',
    copyError: '复制失败',
    new: '新',
    unknownAuthor: '未知作者',
    loadFailed: '加载失败'
  },

  // 导航
  nav: {
    home: '首页',
    docs: '文档',
    create: '发布作品',
    profile: '个人资料',
    settings: '设置',
    admin: '管理',
    login: '登录',
    logout: '退出登录',
    register: '注册',
    loginRegister: '登录/注册'
  },

  // 首页
  home: {
    title: 'VRCFace',
    subtitle: '分享你的 VRChat 捏脸创作',
    description: '探索、分享和下载精美的 VRChat 捏脸数据，与全球创作者一起打造独特的虚拟形象',
    viewDocs: '查看文档',
    goToGithub: '前往 GitHub',
    featuredModels: '热门模型展示',
    featuredDescription: '探索社区中最受欢迎的 VRChat 捏脸数据，通过标签筛选找到适合你的完美模型',
    allTags: '全部',
    viewDetails: '查看详情',
    popularModels: '热门模型',
    exploreDescription: '探索社区中最受欢迎的 VRChat 捏脸数据',
    discoverModels: '发现模型',
    discoverDescription: '发现社区创作者们分享的捏脸数据，通过标签筛选找到最适合你的风格',
    noModelsFound: '暂无符合条件的模型',
    tags: {
      all: '全部',
      cute: '可爱',
      cool: '酷炫',
      funny: '搞笑',
      gentle: '温柔',
      scifi: '科幻',
      animal: '动物'
    },
    features: {
      pluginShare: '插件分享',
      tagFilter: '标签筛选',
      freeOpen: '免费开源'
    }
  },

  // 创建页面
  create: {
    publishNewModel: '发布新作品',
    shareYourWork: '分享您的捏脸数据',
    titleField: '标题',
    titlePlaceholder: '为您的模型起个好听的名字',
    titleRequired: '请输入标题',
    description: '描述',
    descriptionPlaceholder: '描述您的模型特点、风格或使用场景...',
    descriptionRequired: '请输入描述',
    tagsRequired: '请至少选择一个标签',
    images: '预览图片',
    imagesSubtitle: '最多5张',
    imagesSelected: '已选择 {count} 张图片',
    clearAll: '清空所有',
    clickToUpload: '点击上传图片',
    continueUpload: '继续添加图片 ({remaining} 张剩余)',
    supportedFormats: '支持 JPG, PNG 格式，可多选',
    coverImage: '封面',
    firstImageAsCover: '第一张图片将作为封面显示',
    tags: '标签',
    selectedTags: '已选择标签',
    availableTags: '选择标签',
    modelName: '模型名字',
    modelStyle: '模型风格',
    newTag: '新',
    createNewTag: '创建新标签',
    tagName: '标签名称',
    tagType: '标签类型',
    addTag: '添加标签',
    tagExists: '标签名称已存在',
    faceData: '捏脸数据',
    faceDataOptional: '可选',
    faceDataPlaceholder: '粘贴您的捏脸JSON数据...',
    faceDataInvalid: '捏脸数据格式不正确，请输入有效的JSON格式',
    visibility: '可见性',
    public: '公开',
    publicDescription: '所有人都可以查看和下载',
    private: '私有',
    privateDescription: '仅自己可见',
    publishing: '发布中...',
    publish: '发布作品',
    maxImages: '最多只能上传5张图片',
    imageProcessFailed: '图片处理失败，请重试',
    loginRequired: '请先登录',
    selectAtLeastOneImage: '请至少选择一张预览图片',
    publishSuccess: '作品发布成功！',
    publishFailed: '发布失败，请重试',
    errorOccurred: '发生错误',
    loadingTags: '加载标签中...',
    tagLoadFailed: '标签加载失败',
    uploadImages: '上传图片',
    dragDropImages: '拖拽图片到此处或点击选择',
    selectImages: '选择图片',
    imageUploadTip: '支持 JPG、PNG 格式，最多5张',
    noTagsSelected: '未选择标签',
    selectTagsPrompt: '请为模型选择合适的标签',
    faceDataDescription: 'VRChat 捏脸数据（可选）',
    faceDataHelp: '提供捏脸数据后，其他用户可以复制使用',
    visibilitySettings: '可见性设置',
    makePublic: '设为公开',
    makePrivate: '设为私有',
    publicNote: '公开后所有用户都可以查看和下载',
    privateNote: '私有状态下仅自己可见',
    form: {
      title: '标题',
      titlePlaceholder: '为您的模型起个好听的名字',
      description: '描述',
      descriptionPlaceholder: '描述您的模型特点、风格或使用场景...',
      previewImages: '预览图片',
      maxImages: '最多5张',
      selectedImages: '已选择 {count} 张图片',
      clearAll: '清空所有',
      clickToUpload: '点击上传图片',
      continueAdding: '继续添加图片（剩余 {remaining} 张）',
      supportedFormats: '支持 JPG, PNG 格式，可多选',
      cover: '封面',
      firstImageCover: '第一张图片将作为封面显示',
      previewImageAlt: '预览图片 {index}',
      tags: '标签',
      modelName: '模型名字',
      modelStyle: '模型风格',
      availableTags: '可选标签',
      createNewTag: '创建新标签',
      tagNamePlaceholder: '输入标签名称',
      add: '添加',
      new: '新',
      tagHint: '标签帮助其他人更容易找到您的作品',
      faceData: '捏脸数据',
      optional: '可选',
      faceDataPlaceholder: '粘贴您的 VRChat 捏脸 JSON 数据（可选）...',
      faceDataHint: '可选：如果提供，其他用户可以复制您的捏脸数据',
      visibility: '可见性',
      public: '公开',
      private: '私有',
      publicHint: '所有人都可以查看和下载',
      privateHint: '仅自己可见',
      publishing: '发布中...',
      publish: '发布模型'
    }
  },

  // 模型卡片
  modelCard: {
    vrcModel: 'VRC 模型',
    private: '私人',
    modelName: '模型名字',
    modelStyle: '模型风格',
    favorite: '收藏',
    modelNotFound: '未找到模型',
    loadFailed: '获取模型详情失败',
    modelDetails: '模型详情',
    copied: '已复制',
    copyFaceData: '复制捏脸数据',
    modelDetailsNotFound: '未找到模型详情',
    modelImages: '模型图片',
    cover: '封面',
    faceData: '捏脸数据'
  },

  // 动态页面
  feed: {
    noModelsFound: '未找到匹配的模型',
    adjustFilters: '尝试调整搜索条件或筛选标签'
  },

  feedControls: {
    searchPlaceholder: '搜索模型...',
    totalCount: '共 {count} 个模型',
    gridView: '网格视图',
    listView: '列表视图',
    filter: '筛选',
    sortOptions: {
      latest: '最新发布',
      trending: '热门趋势',
      mostLiked: '最多喜欢'
    }
  },

  // 标签相关
  tags: {
    filter: '标签筛选',
    clearAll: '清除全部',
    modelName: '模型名字',
    modelStyle: '模型风格',
    searchPlaceholder: '搜索{type}标签...',
    selected: '已选择',
    noTags: '暂无标签',
    noMatchingTags: '未找到匹配的标签'
  },

  // 标签筛选器
  tagFilter: {
    title: '标签筛选',
    clearAll: '清除全部',
    modelName: '模型名字',
    modelStyle: '模型风格',
    searchPlaceholder: '搜索{type}标签...',
    selected: '已选择',
    noTags: '暂无标签',
    noMatch: '未找到匹配的标签'
  },

  // 管理页面
  admin: {
    dashboard: '仪表板',
    userManagement: '用户管理',
    contentManagement: '内容管理',
    tagManagement: '标签管理',
    systemSettings: '系统设置',
    totalModels: '总计 {count} 个模型',
    totalTags: '总计 {count} 个标签',
    searchAndFilter: '搜索和过滤',
    searchModels: '搜索模型标题或描述...',
    filterByAuthor: '按作者ID筛选...',
    modelList: '模型列表',
    tagList: '标签列表',
    searchTags: '搜索标签名称或描述...',
    createTag: '创建标签',
    manageAllTags: '管理系统中的所有标签',
    role: '角色',
    normalUser: '普通用户',
    moderator: '版主',
    admin: '管理员',
    verificationStatus: '验证状态',
    verified: '已验证',
    unverified: '未验证'
  },

  // 个人资料
  profile: {
    editWork: '编辑作品',
    deleteWork: '删除作品',
    noPreview: '暂无预览',
    unknownUser: '未知用户',
    loginFirst: '请先登录',
    deleteFailed: '删除失败',
    verified: '已验证',
    joinTime: '加入时间：',
    editProfile: '编辑资料',
    follow: '关注',
    unfollow: '取消关注',
    works: '作品',
    fans: '粉丝',
    following: '关注',
    likesReceived: '获赞',
    tabs: {
      models: '作品',
      favorites: '收藏',
      followers: '粉丝',
      following: '关注'
    },
    noWorks: '暂无作品',
    noWorksOwn: '开始创建您的第一个作品吧！',
    noWorksOther: '该用户还没有发布作品',
    favoriteWorks: '收藏的作品',
    loadingFavorites: '正在加载收藏...',
    noFavorites: '暂无收藏',
    noFavoritesOwn: '还没有收藏任何作品',
    noFavoritesOther: '该用户还没有收藏任何作品',
    followersList: '粉丝列表',
    followingList: '关注列表',
    featureInDevelopment: '功能开发中...',
    loadingFollowers: '正在加载粉丝...',
    loadingFollowing: '正在加载关注...',
    noFollowers: '暂无粉丝',
    noFollowersOwn: '还没有粉丝',
    noFollowersOther: '该用户还没有粉丝',
    noFollowing: '暂无关注',
    noFollowingOwn: '还没有关注任何人',
    noFollowingOther: '该用户还没有关注任何人',
    viewProfile: '查看资料',
    followedAt: '关注于',
    private: '私人',
    views: '浏览',
    likes: '点赞',
    edit: '编辑',
    delete: '删除',
    favoritedAt: '收藏于',
    userNotFound: '用户不存在',
    back: '返回',
    operationFailed: '操作失败',
    networkError: '网络错误，请稍后重试'
  },

  // 编辑模型弹窗
  editModel: {
    title: '编辑作品',
    titleField: '标题',
    titlePlaceholder: '为您的模型起个好听的名字',
    description: '描述',
    descriptionPlaceholder: '描述您的模型特点、风格或使用场景...',
    previewImages: '预览图片',
    maxImages: '最多5张',
    clickToUpload: '点击上传图片',
    continueUpload: '继续添加图片',
    remaining: '张剩余',
    supportedFormats: '支持 JPG, PNG 格式，可多选',
    coverImage: '封面',
    firstImageAsCover: '第一张图片将作为封面显示',
    tags: '标签',
    modelName: '模型名字',
    modelStyle: '模型风格',
    selectTags: '选择标签',
    createNewTag: '创建新标签',
    newTagPlaceholder: '输入新的{type}标签',
    vrchatData: 'VRChat捏脸数据 (JSON格式)',
    vrchatDataPlaceholder: '粘贴你的VRChat捏脸JSON数据（可选）...',
    vrchatDataOptional: '可选项：如果提供，其他用户可以复制您的捏脸数据',
    publicSetting: '公开发布（其他用户可以查看和下载）',
    cancel: '取消',
    updating: '更新中...',
    updateWork: '更新作品',
    maxImagesError: '最多只能上传5张图片',
    invalidImage: '图片文件无效',
    imageProcessFailed: '图片处理失败，请重试',
    titleRequired: '请输入标题',
    descriptionRequired: '请输入描述',
    invalidJson: 'JSON数据格式不正确',
    loginRequired: '请先登录',
    updateSuccess: '作品更新成功！',
    enterNew: '输入新的',
    tag: '标签',
    jsonData: 'VRChat捏脸数据 (JSON格式)',
    jsonPlaceholder: '粘贴你的VRChat捏脸JSON数据（可选）...',
    jsonDescription: '可选项：如果提供，其他用户可以复制您的捏脸数据',
    updateFailed: '更新失败，请重试',
    networkError: '更新失败，请检查网络连接',
  },

  // 删除确认弹窗
  deleteConfirm: {
    title: '确认删除作品',
    aboutToDelete: '您即将删除作品：',
    warning: '警告：',
    warningText: '此操作不可撤销！删除后将永久失去以下数据：',
    dataLoss: {
      images: '作品的所有图片和数据',
      likes: '所有点赞和收藏记录',
      comments: '所有评论和互动数据',
      stats: '作品的浏览统计信息'
    },
    cancel: '取消',
    deleting: '删除中...',
    confirmDelete: '确认删除'
  },

  // 错误和状态消息
  messages: {
    authRequired: '需要登录才能访问此页面',
    loadingTags: '加载标签中...',
    tagsFetchFailed: '获取标签失败',
    createTagFailed: '创建标签失败'
  },

  // 认证表单
  auth: {
    login: '登录',
    register: '注册',
    welcome: {
      loginTitle: '欢迎回来！',
      loginSubtitle: '登录您的账户',
      registerTitle: '创建账户',
      registerSubtitle: '加入我们的社区'
    },
    form: {
      username: '用户名',
      displayName: '显示名称',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      usernamePlaceholder: '请输入用户名',
      displayNamePlaceholder: '请输入显示名称（可选）',
      emailPlaceholder: '请输入邮箱',
      passwordPlaceholder: '请输入密码',
      confirmPasswordPlaceholder: '请再次输入密码',
      forgotPassword: '忘记密码？',
      loading: '处理中...',
      loginButton: '登录',
      registerButton: '注册',
      resendButton: '重新发送验证邮件',
      noAccount: '还没有账户？',
      hasAccount: '已有账户？',
      registerLink: '立即注册',
      loginLink: '立即登录'
    },
    validation: {
      emailPasswordRequired: '邮箱和密码为必填项',
      invalidEmail: '邮箱格式不正确',
      passwordTooShort: '密码长度至少为6位',
      usernameRequired: '用户名为必填项',
      invalidUsername: '用户名只能包含字母、数字和下划线，长度为3-20位',
      passwordMismatch: '两次输入的密码不一致'
    },
    success: {
      loginSuccess: '登录成功',
      registerSuccess: '注册成功'
    },
    errors: {
      loginFailed: '登录失败，请稍后重试',
      registerFailed: '注册失败，请稍后重试',
      networkError: '网络错误，请稍后重试',
      emailRequired: '请输入邮箱地址',
      emailInvalid: '邮箱格式不正确',
      sendFailed: '发送失败，请稍后重试',
      resendFailed: '发送验证邮件失败'
    },
    forgotPassword: {
      title: '找回密码',
      subtitle: '输入您的邮箱地址，我们将发送密码重置链接',
      emailPlaceholder: '请输入您的邮箱地址',
      sendButton: '发送重置邮件',
      redirectMessage: '3秒后将自动跳转到登录页面...',
      rememberPassword: '记起密码了？',
      backToLogin: '返回登录'
    },
    resetPassword: {
      title: '重置密码',
      subtitle: '请输入您的新密码',
      newPassword: '新密码',
      confirmPassword: '确认新密码',
      newPasswordPlaceholder: '请输入新密码（至少6位）',
      confirmPasswordPlaceholder: '请再次输入新密码',
      resetButton: '重置密码',
      resetting: '重置中...',
      redirectMessage: '3秒后将自动跳转到登录页面...',
      rememberPassword: '记起密码了？',
      backToLogin: '返回登录',
      invalidLink: '无效的重置链接或链接已过期。请重新申请密码重置。',
      invalidLinkTitle: '链接无效',
      requestNewReset: '重新申请密码重置',
      fillAllFields: '请填写所有字段',
      passwordTooShort: '密码长度至少为6位',
      passwordMismatch: '两次输入的密码不一致',
      resetFailed: '密码重置失败，请稍后重试'
    }
  },

  // 设置页面
  settings: {
    title: '账户设置',
    subtitle: '管理您的个人信息和偏好设置',
    loading: '加载中...',
    basicInfo: {
      title: '基本信息',
      username: '用户名',
      email: '邮箱',
      displayName: '显示名称',
      avatar: '头像URL',
      bio: '个人简介',
      usernameNote: '用户名不可修改',
      emailNote: '邮箱不可修改',
      displayNamePlaceholder: '输入您的显示名称',
      avatarPlaceholder: '输入头像图片URL',
      bioPlaceholder: '介绍一下您自己...'
    },
    form: {
      saving: '保存中...',
      saveButton: '保存设置'
    },
    success: {
      settingsSaved: '设置保存成功！',
      saveSuccess: '保存成功！'
    },
    errors: {
      saveFailed: '保存失败，请稍后重试'
    }
  },

  // UI 组件
  // 文档
  docs: {
    title: 'VRCFace 使用文档',
    subtitle: '了解如何使用 VRCFace 平台分享和管理你的 VRChat 捏脸数据，通过插件和标签筛选功能轻松找到心仪的模型',
    backToHome: '返回首页',
    quickStart: {
      title: '快速开始',
      description: '当您看到有喜欢的模型的时候，如果作者提供了捏脸数据，您可以按照以下步骤来把捏脸数据导入到自己的模型里',
      viewTutorial: '查看教程'
    },
    blendshapes: {
      title: '如何导出 BlendShapes',
      description: '学会通过我们的 Unity 插件来快速导出和导入 BlendShapes 数据',
      viewTutorial: '查看教程'
    },
    community: {
      title: '社区指南',
      description: '了解社区规则，学会与其他用户互动和协作',
      viewRules: '社区规则'
    },
    api: {
      title: 'API 文档',
      description: '为开发者提供的完整 API 接口文档和示例代码',
      viewReference: 'API 参考'
    },
    moreContent: '更多详细文档内容正在编写中...',
    stayTuned: '文档将在后续开发步骤中逐步完善，敬请期待！',
    backToDocs: '返回文档',
    tutorial: {
      quickStart: {
        title: '快速开始',
        subtitle: '当您看到有喜欢的模型的时候，如果作者提供了捏脸数据，您可以按照以下步骤来把捏脸数据导入到自己的模型里',
        steps: {
          step1: {
            title: '确认模型匹配',
            description: '确保网站上的模型名字和您自己的模型是同一个'
          },
          step2: {
            title: '下载Unity插件',
            description: '从 GitHub 的 release 链接，下载最新版本的 unitypackage 文件',
            tip: {
              label: '提示：',
              content: '下载最新的unitypackage并导入unity'
            }
          },
          step3: {
            title: '打开BlendShape Extractor工具',
            description: '从菜单栏找到 Oniya tools → BlendShape Extractor'
          },
          step4: {
            title: '设置导入对象',
            description: '找到"通过json文件导入blendshapes"项，并把含有对应blendshapes的gameobject拖入其中',
            imageAlt: 'BlendShape Extractor 工具界面',
            imageCaption: '在工具中设置导入对象'
          },
          step5: {
            title: '复制捏脸数据',
            description: '打开模型详情页，点击右上方的"复制捏脸数据"按钮',
            imageAlt: '模型详情页面',
            imageCaption: '点击复制捏脸数据按钮'
          },
          step6: {
            title: '粘贴数据到Unity',
            description: '回到unity插件内，点击"从剪贴板粘贴"按钮'
          },
          step7: {
            title: '完成导入',
            description: '选择你需要导入的blendshapes数据，按下"导入blendshape"按钮，完成导入',
            success: {
              label: '成功！',
              content: '现在你可以在 Unity 中使用来自 VRCFace 的捏脸数据了！'
            }
          }
        }
      },
      blendshapes: {
        title: '如何导出 BlendShapes',
        subtitle: '学会通过我们的 Unity 插件来快速导出和导入 BlendShapes 数据',
        steps: {
          step1: {
            title: '下载 Unity 插件',
            description: '访问 GitHub 的 release 链接，下载最新版本的 unitypackage 文件',
            tip: '选择最新的 release 版本下载，确保获得最新功能和修复。'
          },
          step2: {
            title: '导入 Unity 项目',
            description: '将下载的 unitypackage 文件导入到你的 Unity 项目中',
            steps: [
              '在 Unity 中打开你的项目',
              '双击下载的 .unitypackage 文件，或者通过 Assets → Import Package → Custom Package 导入',
              '在导入对话框中点击 "Import" 按钮',
              '导入完成后，在上方菜单栏找到 Oniya tools → BlendShape Extractor'
            ]
          },
          step3: {
            title: '使用 BlendShape Extractor',
            description: '打开工具窗口并导出 BlendShapes 数据',
            steps: [
              '点击菜单栏中的 Oniya tools → BlendShape Extractor 打开工具窗口',
              '将含有 SkinnedMeshRenderer 组件的 GameObject 拖入工具窗口的指定区域',
              '工具会自动检测并列出所有可用的 BlendShapes'
            ]
          },
          step4: {
            title: '复制到剪贴板',
            description: '将导出的 BlendShapes 数据复制到剪贴板，以便在 VRCFace 中使用',
            steps: [
              '在工具窗口中点击 "Copy to Clipboard" 按钮',
              '数据将以 JSON 格式复制到系统剪贴板',
              '前往 VRCFace 的创建页面，粘贴数据即可创建新的模型'
            ],
            success: '现在你可以在 VRCFace 中使用这些 BlendShapes 数据创建和分享你的虚拟形象了。'
          }
        },
        faq: {
          title: '常见问题',
          q1: {
            question: '为什么我的 GameObject 无法被识别？',
            answer: '请确保你的 GameObject 包含 SkinnedMeshRenderer 组件，并且该组件上有 BlendShapes 数据。'
          },
          q2: {
            question: '导出的数据格式是什么？',
            answer: '工具导出的是标准的 JSON 格式，包含所有 BlendShapes 的名称和权重信息，完全兼容 VRCFace 平台。'
          },
          q3: {
            question: '可以批量导出多个模型吗？',
            answer: '目前工具支持单个模型导出，如需批量处理，请分别对每个模型进行导出操作。'
          }
        }
      }
    }
  },

  ui: {
    scrollIndicator: {
      scrollDown: '向下滚动'
    },
    waterfall: {
      layoutCalculating: '布局计算中...',
      allContentLoaded: '已加载全部内容'
    }
  },

  // 评论
  comments: {
    title: '评论',
    noComments: '暂无评论',
    beFirstToComment: '来发表第一条评论吧！',
    writeComment: '写评论...',
    postComment: '发表评论',
    posting: '发表中...',
    reply: '回复',
    replying: '回复中...',
    replies: '回复',
    showReplies: '显示 {count} 条回复',
    hideReplies: '隐藏回复',
    collapse: '收起',
    expand: '展开',
    totalComments: '共 {count} 条评论',
    viewAll: '查看全部',
    retry: '重试',
    edit: '编辑',
    delete: '删除',
    edited: '已编辑',
    justNow: '刚刚',
    minutesAgo: '{count} 分钟前',
    hoursAgo: '{count} 小时前',
    daysAgo: '{count} 天前',
    weeksAgo: '{count} 周前',
    monthsAgo: '{count} 个月前',
    yearsAgo: '{count} 年前',
    loadMore: '加载更多评论',
    loading: '加载评论中...',
    loadingReplies: '加载回复中...',
    loginToComment: '请登录后发表评论',
    commentTooShort: '评论内容太短',
    commentTooLong: '评论内容太长（最多1000字符）',
    postFailed: '发表评论失败',
    updateFailed: '更新评论失败',
    deleteFailed: '删除评论失败',
    deleteConfirm: '确定要删除这条评论吗？',
    deleteSuccess: '评论删除成功',
    updateSuccess: '评论更新成功',
    networkError: '网络错误，请重试',
    cancel: '取消',
    save: '保存',
    saving: '保存中...',
    replyTo: '回复 {username}',
    editComment: '编辑评论',
    commentPlaceholder: '分享你的想法...',
    replyPlaceholder: '写回复...'
  }
}