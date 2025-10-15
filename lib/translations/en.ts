export const en = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    clear: 'Clear',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    view: 'View',
    upload: 'Upload',
    download: 'Download',
    new: 'New',
    copySuccess: 'Copied successfully',
    copyError: 'Copy failed',
    unknownAuthor: 'Unknown Author',
    loadFailed: 'Load Failed'
  },

  // Navigation
  nav: {
    home: 'Home',
    docs: 'Docs',
    create: 'Create',
    profile: 'Profile',
    settings: 'Settings',
    admin: 'Admin',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    loginRegister: 'Login/Register'
  },

  // Home
  home: {
    title: 'VRCFace',
    subtitle: 'Share Your VRChat Avatar Creations',
    description: 'Explore, share and download beautiful VRChat shared blendshapes, create unique virtual identities with creators worldwide',
    viewDocs: 'View Docs',
    goToGithub: 'Go to GitHub',
    featuredModels: 'Featured Models',
    featuredDescription: 'Explore the most popular VRChat shared blendshapes in the community, find your perfect model through tag filtering',
    popularModels: 'Popular Models',
    exploreDescription: 'Explore the most popular VRChat shared blendshapes in the community',
    allTags: 'All',
    viewDetails: 'View Details',
    discoverModels: 'Discover Models',
    discoverDescription: 'Discover shared blendshapes shared by community creators, find the style that suits you best through tag filtering',
    noModelsFound: 'No models matching the criteria found',
    tags: {
      all: 'All',
      cute: 'Cute',
      cool: 'Cool',
      funny: 'Funny',
      gentle: 'Gentle',
      scifi: 'Sci-Fi',
      animal: 'Animal',
      fantasy: 'Fantasy',
      realistic: 'Realistic',
      anime: 'Anime'
    },
    features: {
      pluginShare: 'Plugin Sharing',
      pluginShareDesc: 'Easily share and discover VRChat shared blendshapes through plugins',
      tagFilter: 'Tag Filtering',
      tagFilterDesc: 'Find your favorite models quickly with intelligent tag filtering',
      freeOpen: 'Free & Open Source',
      freeOpenDesc: 'Completely free platform, open source code, community driven'
    }
  },

  // Create page
  create: {
    title: 'Create New Work',
    titleField: 'Title',
    titlePlaceholder: 'Give your model a nice name',
    titleRequired: 'Please enter a title',
    description: 'Description',
    descriptionPlaceholder: 'Describe your model features, style or usage scenarios...',
    descriptionRequired: 'Please enter a description',
    images: 'Preview Images',
    imagesSubtitle: 'Up to 5 images',
    imagesSelected: '{count} images selected',
    clearAll: 'Clear All',
    clickToUpload: 'Click to upload images',
    continueUpload: 'Continue adding images ({remaining} remaining)',
    supportedFormats: 'Supports JPG, PNG formats, multiple selection allowed',
    coverImage: 'Cover',
    firstImageAsCover: 'The first image will be displayed as cover',
    tags: 'Tags',
    selectedTags: 'Selected Tags',
    availableTags: 'Select Tags',
    modelName: 'Model Name',
    modelStyle: 'Model Style',
    newTag: 'New',
    createNewTag: 'Create New Tag',
    tagName: 'Tag Name',
    tagType: 'Tag Type',
    addTag: 'Add Tag',
    tagExists: 'Tag name already exists',
    faceData: 'Shared Blendshapes',
    faceDataOptional: 'Optional',
    faceDataPlaceholder: 'Paste your shared blendshapes JSON data...',
    faceDataInvalid: 'Shared blendshapes format is incorrect, please enter valid JSON format',
    visibility: 'Visibility',
    public: 'Public',
    publicDescription: 'Everyone can view and download',
    private: 'Private',
    privateDescription: 'Only visible to yourself',
    publishing: 'Publishing...',
    publish: 'Publish Work',
    maxImages: 'Maximum 5 images allowed',
    imageProcessFailed: 'Image processing failed, please try again',
    loginRequired: 'Please login first',
    selectAtLeastOneImage: 'Please select at least one preview image',
    publishSuccess: 'Work published successfully!',
    publishFailed: 'Publishing failed, please try again',
    publishNewModel: 'Publish New Model',
    shareYourWork: 'Share Your VRChat Avatar Creations',
    maxImagesError: 'Maximum 5 images allowed',
    invalidImageFile: 'Invalid image file',
    tagAlreadyExists: 'Tag name already exists',
    imageRequired: 'Please select at least one preview image',
    invalidJsonFormat: 'Shared blendshapes format is incorrect, please enter valid JSON format',
    networkError: 'Publishing failed, please check network connection',
    publishSuccessTitle: 'Published Successfully!',
    redirectingToProfile: 'Redirecting to your profile...',
    form: {
      title: 'Title',
      titlePlaceholder: 'Give your model a nice name',
      description: 'Description',
      descriptionPlaceholder: 'Describe your model features, style or usage scenarios...',
      previewImages: 'Preview Images',
      maxImages: 'up to 5',
      selectedImages: '{count} images selected',
      clearAll: 'Clear All',
      clickToUpload: 'Click to upload images',
      continueAdding: 'Continue adding images ({remaining} remaining)',
      supportedFormats: 'Supports JPG, PNG formats, multiple selection allowed',
      cover: 'Cover',
      firstImageCover: 'The first image will be displayed as cover',
      previewImageAlt: 'Preview image {index}',
      tags: 'Tags',
      modelName: 'Model Name',
      modelStyle: 'Model Style',
      availableTags: 'Available Tags',
      createNewTag: 'Create New Tag',
      tagNamePlaceholder: 'Enter tag name',
      add: 'Add',
      new: 'New',
      tagHint: 'Tags help others find your work more easily',
      faceData: 'Shared Blendshapes',
      optional: 'Optional',
      faceDataPlaceholder: 'Paste your VRChat shared blendshapes JSON data (optional)...',
      faceDataHint: 'Optional: If provided, other users can copy your shared blendshapes',
      visibility: 'Visibility',
      public: 'Public',
      private: 'Private',
      publicHint: 'Everyone can view and download',
      privateHint: 'Only visible to yourself',
      publishing: 'Publishing...',
      publish: 'Publish Model'
    }
  },

  // Tags
  tags: {
    filter: 'Tag Filter',
    clearAll: 'Clear All',
    modelName: 'Model Name',
    modelStyle: 'Model Style',
    searchPlaceholder: 'Search {type} tags...',
    selected: 'Selected',
    noTags: 'No tags available',
    noMatchingTags: 'No matching tags found'
  },

  // Tag Filter
  tagFilter: {
    title: 'Tag Filter',
    clearAll: 'Clear All',
    modelName: 'Model Name',
    modelStyle: 'Model Style',
    searchPlaceholder: 'Search {type} tags...',
    selected: 'Selected',
    noTags: 'No tags available',
    noMatch: 'No matching tags found'
  },

  // Admin pages
  admin: {
    dashboard: 'Dashboard',
    userManagement: 'User Management',
    contentManagement: 'Content Management',
    tagManagement: 'Tag Management',
    systemSettings: 'System Settings',
    totalModels: 'Total {count} models',
    totalTags: 'Total {count} tags',
    searchAndFilter: 'Search and Filter',
    searchModels: 'Search model title or description...',
    filterByAuthor: 'Filter by author ID...',
    modelList: 'Model List',
    tagList: 'Tag List',
    searchTags: 'Search tag name or description...',
    createTag: 'Create Tag',
    manageAllTags: 'Manage all tags in the system',
    role: 'Role',
    normalUser: 'User',
    moderator: 'Moderator',
    admin: 'Admin',
    verificationStatus: 'Verification Status',
    verified: 'Verified',
    unverified: 'Unverified'
  },

  // Profile
  profile: {
    editWork: 'Edit Work',
    deleteWork: 'Delete Work',
    noPreview: 'No Preview',
    unknownUser: 'Unknown User',
    loginFirst: 'Please login first',
    deleteFailed: 'Delete failed',
    verified: 'Verified',
    joinTime: 'Joined: ',
    editProfile: 'Edit Profile',
    follow: 'Follow',
    unfollow: 'Unfollow',
    works: 'Works',
    fans: 'Followers',
    following: 'Following',
    likesReceived: 'Likes',
    tabs: {
      models: 'Works',
      favorites: 'Favorites',
      followers: 'Followers',
      following: 'Following'
    },
    noWorks: 'No works',
    noWorksOwn: 'Start creating your first work!',
    noWorksOther: 'This user has not published any works yet',
    favoriteWorks: 'Favorite Works',
    loadingFavorites: 'Loading favorites...',
    noFavorites: 'No favorites',
    noFavoritesOwn: 'No works favorited yet',
    noFavoritesOther: 'This user has not favorited any works yet',
    followersList: 'Followers List',
    followingList: 'Following List',
    featureInDevelopment: 'Feature in development...',
    private: 'Private',
    views: 'Views',
    likes: 'Likes',
    edit: 'Edit',
    delete: 'Delete',
    favoritedAt: 'Favorited on',
    userNotFound: 'User not found',
    back: 'Back',
    operationFailed: 'Operation failed',
    networkError: 'Network error, please try again later'
  },

  modelCard: {
    vrcModel: 'VRC Model',
    private: 'Private',
    modelName: 'Model Name',
    modelStyle: 'Model Style',
    favorite: 'Favorite',
    modelNotFound: 'Model not found',
    loadFailed: 'Failed to load model details',
    modelDetails: 'Model Details',
    copied: 'Copied',
    copyFaceData: 'Copy Shared Blendshapes',
    modelDetailsNotFound: 'Model details not found',
    modelImages: 'Model Images',
    cover: 'Cover',
    faceData: 'Shared Blendshapes'
  },

  feed: {
    noModelsFound: 'No models found',
    adjustFilters: 'Try adjusting your filters or search terms'
  },

  feedControls: {
    searchPlaceholder: 'Search models...',
    totalCount: 'Total {count} models',
    gridView: 'Grid View',
    listView: 'List View',
    filter: 'Filter',
    sortOptions: {
      latest: 'Latest',
      trending: 'Trending',
      popular: 'Most Popular',
      mostLiked: 'Most Liked'
    }
  },

  editModel: {
    title: 'Edit Work',
    titleField: 'Title *',
    titlePlaceholder: 'Give your model a nice name',
    description: 'Description *',
    descriptionPlaceholder: 'Describe your model features, style or usage scenarios...',
    previewImages: 'Preview Images',
    maxImages: 'up to 5',
    coverImage: 'Cover',
    clickToUpload: 'Click to upload images',
    continueUpload: 'Continue adding images',
    remaining: 'remaining',
    supportedFormats: 'Supports JPG, PNG formats, multiple selection allowed',
    firstImageAsCover: 'The first image will be displayed as cover',
    tags: 'Tags',
    modelName: 'Model Name',
    modelStyle: 'Model Style',
    selectTags: 'Select Tags',
    createNewTag: 'Create New Tag',
    enterNew: 'Enter new ',
    tag: ' tag',
    jsonData: 'VRChat Shared Blendshapes (JSON Format)',
    jsonPlaceholder: 'Paste your VRChat shared blendshapes JSON data (optional)...',
    jsonDescription: 'Optional: If provided, other users can copy your shared blendshapes',
    publicSetting: 'Publish publicly (other users can view and download)',
    updating: 'Updating...',
    updateWork: 'Update Work',
    maxImagesError: 'Maximum 5 images allowed',
    invalidImage: 'Invalid image file',
    imageProcessFailed: 'Image processing failed, please try again',
    titleRequired: 'Please enter a title',
    descriptionRequired: 'Please enter a description',
    invalidJson: 'JSON data format is incorrect',
    loginRequired: 'Please login first',
    updateSuccess: 'Work updated successfully!',
    updateFailed: 'Update failed, please try again',
    networkError: 'Update failed, please check network connection'
  },

  // Delete confirmation modal
  deleteConfirm: {
    title: 'Confirm Delete Work',
    aboutToDelete: 'You are about to delete the work:',
    warning: 'Warning:',
    warningText: 'This action cannot be undone! The following data will be permanently lost:',
    dataLoss: {
      images: 'All images and data of the work',
      likes: 'All likes and favorite records',
      comments: 'All comments and interaction data',
      stats: 'View statistics of the work'
    },
    cancel: 'Cancel',
    deleting: 'Deleting...',
    confirmDelete: 'Confirm Delete'
  },

  // Error and status messages
  messages: {
    authRequired: 'Login required to access this page',
    loadingTags: 'Loading tags...',
    tagsFetchFailed: 'Failed to fetch tags',
    createTagFailed: 'Failed to create tag'
  },

  // Authentication form
  auth: {
    welcome: {
      loginTitle: 'Welcome back!',
      loginSubtitle: 'Sign in to your account',
      registerTitle: 'Create your account',
      registerSubtitle: 'Join our community'
    },
    form: {
      username: 'Username',
      displayName: 'Display Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      usernamePlaceholder: 'Enter username',
      displayNamePlaceholder: 'Enter display name (optional)',
      emailPlaceholder: 'Enter email',
      passwordPlaceholder: 'Enter password',
      confirmPasswordPlaceholder: 'Enter password again',
      forgotPassword: 'Forgot password?',
      loading: 'Processing...',
      loginButton: 'Sign In',
      registerButton: 'Create Account',
      resendButton: 'Resend verification email',
      noAccount: 'Don\'t have an account?',
      hasAccount: 'Already have an account?',
      registerLink: 'Register now',
      loginLink: 'Login now'
    },
    validation: {
      emailPasswordRequired: 'Email and password are required',
      invalidEmail: 'Invalid email format',
      passwordTooShort: 'Password must be at least 6 characters',
      usernameRequired: 'Username is required',
      invalidUsername: 'Username can only contain letters, numbers and underscores, 3-20 characters long',
      passwordMismatch: 'Passwords do not match'
    },
    success: {
      loginSuccess: 'Login successful',
      registerSuccess: 'Registration successful'
    },
    errors: {
      loginFailed: 'Login failed, please try again later',
      registerFailed: 'Registration failed, please try again later',
      networkError: 'Network error, please try again later',
      emailRequired: 'Please enter email address',
      resendFailed: 'Failed to send verification email'
    },
    forgotPassword: {
      title: 'Forgot Password',
      subtitle: 'Enter your email to reset password',
      emailPlaceholder: 'Enter your email address',
      sendButton: 'Send Reset Link',
      sending: 'Sending...',
      success: 'Reset link sent to your email',
      error: 'Failed to send reset link',
      backToLogin: 'Back to Login'
    },
    resetPassword: {
      title: 'Reset Password',
      subtitle: 'Enter your new password',
      newPasswordPlaceholder: 'Enter new password',
      confirmPasswordPlaceholder: 'Confirm new password',
      resetButton: 'Reset Password',
      resetting: 'Resetting...',
      success: 'Password reset successfully',
      error: 'Failed to reset password',
      invalidToken: 'Invalid or expired reset token'
    }
  },

  // Settings page
  settings: {
    title: 'Account Settings',
    subtitle: 'Manage your personal information and preferences',
    loading: 'Loading...',
    basicInfo: {
      title: 'Basic Information',
      username: 'Username',
      email: 'Email',
      displayName: 'Display Name',
      avatar: 'Avatar URL',
      bio: 'Bio',
      usernameNote: 'Username cannot be modified',
      emailNote: 'Email cannot be modified',
      displayNamePlaceholder: 'Enter your display name',
      avatarPlaceholder: 'Enter avatar image URL',
      bioPlaceholder: 'Tell us about yourself...'
    },
    form: {
      saving: 'Saving...',
      saveButton: 'Save Settings'
    },
    success: {
      settingsSaved: 'Settings saved successfully!',
      saveSuccess: 'Settings saved successfully!'
    },
    errors: {
      saveFailed: 'Save failed, please try again later'
    }
  },

  // UI Components
  ui: {
    scrollIndicator: {
      scrollDown: 'Scroll Down'
    }
  }
}