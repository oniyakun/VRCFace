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
    featuredModels: 'Featured Avatars',
    featuredDescription: 'Explore the most popular VRChat shared blendshapes in the community, find your perfect avatar through tag filtering',
    popularModels: 'Popular Avatars',
    exploreDescription: 'Explore the most popular VRChat shared blendshapes in the community',
    allTags: 'All',
    viewDetails: 'View Details',
    discoverModels: 'Discover Avatars',
    discoverDescription: 'Discover shared blendshapes shared by community creators, find the style that suits you best through tag filtering',
    noModelsFound: 'No avatars matching the criteria found',
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
      tagFilterDesc: 'Find your favorite avatars quickly with intelligent tag filtering',
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
    tagsRequired: 'Please select at least one tag',
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
    modelName: 'Avatar Name',
    modelStyle: 'Avatar Style',
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
    publishNewModel: 'Publish New Avatar',
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
      modelName: 'Avatar Name',
      modelStyle: 'Avatar Style',
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
    modelName: 'Avatar Name',
    modelStyle: 'Avatar Style',
    searchPlaceholder: 'Search {type} tags...',
    selected: 'Selected',
    noTags: 'No tags available',
    noMatchingTags: 'No matching tags found'
  },

  // Tag Filter
  tagFilter: {
    title: 'Tag Filter',
    clearAll: 'Clear All',
    modelName: 'Avatar Name',
    modelStyle: 'Avatar Style',
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
    vrcModel: 'VRC Avatar',
    private: 'Private',
    modelName: 'Avatar Name',
    modelStyle: 'Avatar Style',
    favorite: 'Favorite',
    modelNotFound: 'Avatar not found',
    loadFailed: 'Failed to load avatar details',
    modelDetails: 'Avatar Details',
    copied: 'Copied',
    copyFaceData: 'Copy Shared Blendshapes',
    modelDetailsNotFound: 'Avatar details not found',
    modelImages: 'Avatar Images',
    cover: 'Cover',
    faceData: 'Shared Blendshapes'
  },

  feed: {
    noModelsFound: 'No avatars found',
    adjustFilters: 'Try adjusting your filters or search terms'
  },

  feedControls: {
    searchPlaceholder: 'Search avatars...',
    totalCount: 'Total {count} avatars',
    gridView: 'Grid View',
    listView: 'List View',
    filter: 'Filter',
    sortOptions: {
      latest: 'Latest',
      trending: 'Trending',
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
    modelName: 'Avatar Name',
    modelStyle: 'Avatar Style',
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
  // Documentation
  docs: {
    title: 'VRCFace Documentation',
    subtitle: 'Learn how to use the VRCFace platform to share and manage your VRChat face data, easily find your favorite avatars through plugins and tag filtering features',
    backToHome: 'Back to Home',
    quickStart: {
      title: 'Quick Start',
      description: 'When you see an avatar you like, if the author provides face data, you can follow these steps to import the face data into your own avatar',
      viewTutorial: 'View Tutorial'
    },
    blendshapes: {
      title: 'How to Export BlendShapes',
      description: 'Learn to quickly export and import BlendShapes data through our Unity plugin',
      viewTutorial: 'View Tutorial'
    },
    community: {
      title: 'Community Guidelines',
      description: 'Learn community rules and how to interact and collaborate with other users',
      viewRules: 'Community Rules'
    },
    api: {
      title: 'API Documentation',
      description: 'Complete API interface documentation and sample code for developers',
      viewReference: 'API Reference'
    },
    moreContent: 'More detailed documentation content is being written...',
    stayTuned: 'Documentation will be gradually improved in subsequent development steps, stay tuned!',
    backToDocs: 'Back to Docs',
    tutorial: {
      quickStart: {
        title: 'Quick Start',
        subtitle: 'When you see an avatar you like, if the author provides face data, you can follow these steps to import the face data into your own avatar',
        steps: {
          step1: {
            title: 'Confirm Avatar Match',
            description: 'Make sure the  on the website is the same as your own avatar'
          },
          step2: {
            title: 'Download Unity Plugin',
            description: 'Download the latest version of the unitypackage file from the GitHub release link',
            tip: 'Download the latest unitypackage and import it into Unity'
          },
          step3: {
            title: 'Open BlendShape Extractor Tool',
            description: 'Find Oniya tools → BlendShape Extractor from the menu bar'
          },
          step4: {
            title: 'Set Import Object',
            description: 'Find the "Import blendshapes via json file" item and drag the gameobject containing the corresponding blendshapes into it'
          },
          step5: {
            title: 'Copy Face Data',
            description: 'Open the avatar details page and click the "Copy Face Data" button in the upper right corner'
          },
          step6: {
            title: 'Paste Data to Unity',
            description: 'Return to the Unity plugin and click the "Paste from Clipboard" button'
          },
          step7: {
            title: 'Complete Import',
            description: 'Select the blendshapes data you need to import and press the "Import blendshape" button to complete the import',
            success: {
              label: 'Success!',
              content: 'Now you can use the blendshape data from VRCFace in Unity!'
            }
          }
        }
      },
      blendshapes: {
        title: 'How to Export BlendShapes',
        subtitle: 'Learn to quickly export and import BlendShapes data through our Unity plugin',
        steps: {
          step1: {
            title: 'Download Unity Plugin',
            description: 'Visit the GitHub release link and download the latest version of the unitypackage file',
            tip: 'Choose the latest release version to download to ensure you get the latest features and fixes.'
          },
          step2: {
            title: 'Import Unity Project',
            description: 'Import the downloaded unitypackage file into your Unity project',
            steps: [
              'Open your project in Unity',
              'Double-click the downloaded .unitypackage file, or import through Assets → Import Package → Custom Package',
              'Click the "Import" button in the import dialog',
              'After import is complete, find Oniya tools → BlendShape Extractor in the top menu bar'
            ]
          },
          step3: {
            title: 'Use BlendShape Extractor',
            description: 'Open the tool window and export BlendShapes data',
            steps: [
              'Click Oniya tools → BlendShape Extractor in the menu bar to open the tool window',
              'Drag the GameObject containing the SkinnedMeshRenderer component into the designated area of the tool window',
              'The tool will automatically detect and list all available BlendShapes'
            ]
          },
          step4: {
            title: 'Copy to Clipboard',
            description: 'Copy the exported BlendShapes data to the clipboard for use in VRCFace',
            steps: [
              'Click the "Copy to Clipboard" button in the tool window',
              'The data will be copied to the system clipboard in JSON format',
              'Go to the VRCFace creation page and paste the data to create a new avatar'
            ],
            success: 'Now you can use these BlendShapes data to create and share your virtual avatar in VRCFace.'
          }
        },
        faq: {
          title: 'Frequently Asked Questions',
          q1: {
            question: 'Why is my GameObject not recognized?',
            answer: 'Please make sure your GameObject contains a SkinnedMeshRenderer component and that component has BlendShapes data.'
          },
          q2: {
            question: 'What format is the exported data?',
            answer: 'The tool exports standard JSON format containing all BlendShapes names and weight information, fully compatible with the VRCFace platform.'
          },
          q3: {
            question: 'Can I batch export multiple models?',
            answer: 'Currently the tool supports single model export. For batch processing, please export each model separately.'
          }
        }
      }
    }
  },

  ui: {
    scrollIndicator: {
      scrollDown: 'Scroll Down'
    },
    waterfall: {
      layoutCalculating: 'Calculating layout...',
      allContentLoaded: 'All content loaded'
    }
  },

  // Comments
  comments: {
    title: 'Comments',
    noComments: 'No comments yet',
    beFirstToComment: 'Be the first to comment!',
    writeComment: 'Write a comment...',
    postComment: 'Post Comment',
    posting: 'Posting...',
    reply: 'Reply',
    replying: 'Replying...',
    replies: 'Replies',
    showReplies: 'Show {count} replies',
    hideReplies: 'Hide replies',
    collapse: 'Collapse',
    expand: 'Expand',
    totalComments: '{count} comments total',
    viewAll: 'View All',
    retry: 'Retry',
    loadFailed: 'Failed to load comments',
    edit: 'Edit',
    delete: 'Delete',
    edited: 'Edited',
    justNow: 'Just now',
    minutesAgo: '{count} minutes ago',
    hoursAgo: '{count} hours ago',
    daysAgo: '{count} days ago',
    weeksAgo: '{count} weeks ago',
    monthsAgo: '{count} months ago',
    yearsAgo: '{count} years ago',
    loadMore: 'Load more comments',
    loading: 'Loading comments...',
    loadingReplies: 'Loading replies...',
    loginToComment: 'Please login to comment',
    commentTooShort: 'Comment is too short',
    commentTooLong: 'Comment is too long (max 1000 characters)',
    postFailed: 'Failed to post comment',
    updateFailed: 'Failed to update comment',
    deleteFailed: 'Failed to delete comment',
    deleteConfirm: 'Are you sure you want to delete this comment?',
    deleteSuccess: 'Comment deleted successfully',
    updateSuccess: 'Comment updated successfully',
    networkError: 'Network error, please try again',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    replyTo: 'Reply to {username}',
    editComment: 'Edit comment',
    commentPlaceholder: 'Share your thoughts...',
    replyPlaceholder: 'Write a reply...'
  }
}