// 用户相关类型
export interface User {
  id: string
  username: string
  email: string
  displayName?: string
  avatar?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
  isVerified: boolean
  role: 'user' | 'moderator' | 'admin'
  stats: UserStats
}

export interface UserStats {
  modelsCount: number
  likesReceived: number
  commentsReceived: number
  followersCount: number
  followingCount: number
}

// 面部模型相关类型
export interface FaceModel {
  id: string
  title: string
  description: string
  authorId: string
  author: User
  thumbnail?: string
  jsonData: VRChatFaceData
  tags: string[]
  category: ModelCategory
  isPublic: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  stats: ModelStats
  metadata: ModelMetadata
}

export interface ModelStats {
  views: number
  downloads: number
  likes: number
  comments: number
}

export interface ModelMetadata {
  version: string
  compatibility: string[]
  fileSize: number
}

export type ModelCategory = 'cute' | 'cool' | 'funny' | 'gentle' | 'sci-fi' | 'animal' | 'other'

// VRChat 面部数据结构
export interface VRChatFaceData {
  [key: string]: any // VRChat 的面部表情数据结构可能很复杂，这里先用通用对象
}

// 评论相关类型
export interface Comment {
  id: string
  content: string
  authorId: string
  author: User
  modelId: string
  parentId?: string // 用于回复评论
  createdAt: Date
  updatedAt: Date
  isEdited: boolean
  likes: number
  replies?: Comment[]
}

// 点赞相关类型
export interface Like {
  id: string
  userId: string
  modelId?: string
  commentId?: string
  createdAt: Date
}

// 标签相关类型
export interface Tag {
  id: string
  name: string
  description?: string
  color?: string
  category: TagCategory
  tag_type: TagType // 新增：标签类型
  usageCount: number
  createdAt: Date
}

export type TagCategory = 'emotion' | 'style' | 'character' | 'technical'
export type TagType = 'model_name' | 'model_style' // 新增：模型名字 vs 模型风格

// 收藏相关类型
export interface Favorite {
  id: string
  userId: string
  modelId: string
  createdAt: Date
}

// 关注相关类型
export interface Follow {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 搜索和筛选相关类型
export interface SearchFilters {
  query?: string
  tags?: string[]
  category?: ModelCategory
  author?: string
  sortBy?: 'latest' | 'popular' | 'trending' | 'most_liked'
  dateRange?: {
    start: Date
    end: Date
  }
}

// 表单相关类型
export interface CreateModelForm {
  title: string
  description: string
  jsonData: VRChatFaceData
  tags: string[]
  category: ModelCategory
  isPublic: boolean
  thumbnail?: File
}

export interface UpdateModelForm extends Partial<CreateModelForm> {
  id: string
}

export interface CreateCommentForm {
  content: string
  modelId: string
  parentId?: string
}

export interface UpdateUserProfileForm {
  displayName?: string
  bio?: string
  avatar?: File
}

// 通知相关类型
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: Date
}

export type NotificationType = 
  | 'like_model'
  | 'comment_model'
  | 'reply_comment'
  | 'follow_user'
  | 'model_verified'
  | 'system_announcement'

// 统计相关类型
export interface SiteStats {
  totalUsers: number
  totalModels: number
  totalDownloads: number
  totalLikes: number
  totalComments: number
  activeUsers: number
}

// 错误类型
export interface AppError {
  code: string
  message: string
  details?: any
}