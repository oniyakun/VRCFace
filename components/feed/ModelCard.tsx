'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Copy, Download, Eye, Calendar, User, Star, User as UserIcon, Palette } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthProvider'
import { useLanguage } from '@/components/i18n/LanguageProvider'

interface ModelCardProps {
  id: string
  title: string
  description: string
  author: {
    name: string
    avatar?: string
  }
  thumbnail?: string
  images?: string[]
  tags: { id: string; name: string; tag_type?: 'model_name' | 'model_style' }[]
  stats?: {
    likes: number
    comments: number
    downloads: number
    views: number
  }
  created_at: string
  json_data?: object
  height?: number
  className?: string
  is_public?: boolean
  onLike?: (id: string) => void
  onComment?: (id: string) => void
  onCopy?: (id: string, data: object) => void
  onDownload?: (id: string) => void
  onOpenDetail?: (id: string) => void
  onFavorite?: (id: string) => void
}

export default function ModelCard({
  id,
  title,
  description,
  author,
  thumbnail,
  images,
  tags,
  stats,
  created_at,
  json_data,
  height,
  className = '',
  is_public = true,
  onLike,
  onComment,
  onCopy,
  onDownload,
  onOpenDetail,
  onFavorite
}: ModelCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [localStats, setLocalStats] = useState(stats)
  
  // 获取封面图片：优先使用images的第一张，否则使用thumbnail
  const coverImage = images && images.length > 0 ? images[0] : thumbnail
  const { user } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()

  // 当props中的stats更新时，同步更新localStats
  useEffect(() => {
    setLocalStats(stats)
  }, [stats])

  // 检查用户的点赞和收藏状态
  useEffect(() => {
    if (user) {
      checkUserStatus()
    }
  }, [user, id])

  const checkUserStatus = async () => {
    if (!user) return

    try {
      // 检查点赞状态
      const likeResponse = await fetch(`/api/likes?model_id=${id}&user_id=${user.id}`)
      if (likeResponse.ok) {
        const likeData = await likeResponse.json()
        setIsLiked(likeData.isLiked)
      }

      // 检查收藏状态
      const favoriteResponse = await fetch(`/api/favorites?model_id=${id}&user_id=${user.id}`)
      if (favoriteResponse.ok) {
        const favoriteData = await favoriteResponse.json()
        setIsFavorited(favoriteData.isFavorited)
      }
    } catch (error) {
      console.error('检查用户状态失败:', error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_id: id,
          user_id: user.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        const newIsLiked = data.action === 'liked'
        setIsLiked(newIsLiked)
        
        // 更新本地统计数据
        setLocalStats(prev => ({
          likes: newIsLiked 
            ? (prev?.likes || 0) + 1 
            : Math.max((prev?.likes || 0) - 1, 0),
          comments: prev?.comments || 0,
          downloads: prev?.downloads || 0,
          views: prev?.views || 0
        }))
        
        onLike?.(id)
      }
    } catch (error) {
      console.error('点赞操作失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_id: id,
          user_id: user.id
        })
      })

      if (response.ok) {
        const data = await response.json()
        setIsFavorited(data.action === 'favorited')
        onFavorite?.(id)
      }
    } catch (error) {
      console.error('收藏操作失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (json_data) {
      navigator.clipboard.writeText(JSON.stringify(json_data, null, 2))
      onCopy?.(id, json_data)
    }
  }

  return (
    <div 
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 group cursor-pointer',
        className
      )}
      style={height && isFinite(height) && height > 0 ? { height: `${height}px` } : undefined}
      onClick={() => {
        if (onOpenDetail) {
          onOpenDetail(id)
        }
      }}
    >
      {/* 缩略图 */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {coverImage && !imageError ? (
          <>
            <img
              src={coverImage}
              alt={title}
              className={cn(
                'w-full h-full object-cover transition-all duration-500 group-hover:scale-105',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => {
                setImageLoaded(true)
                setImageLoading(false)
              }}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Eye className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-sm text-primary-600 font-medium">{t('modelCard.vrcModel')}</p>
            </div>
          </div>
        )}
        
        {/* 悬浮操作按钮 - 替换为收藏和点赞 */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); handleFavorite() }}
              disabled={isLoading}
              className={cn(
                'bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg border-0 transition-all duration-200 hover:scale-105',
                isFavorited ? 'text-yellow-500' : 'text-gray-600'
              )}
            >
              <Star className={cn('w-4 h-4', isFavorited && 'fill-current')} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); handleLike() }}
              disabled={isLoading}
              className={cn(
                'bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg border-0 transition-all duration-200 hover:scale-105',
                isLiked ? 'text-red-500' : 'text-gray-600'
              )}
            >
              <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
            </Button>
          </div>
        </div>

        {/* 图片数量指示器 */}
        {images && images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
            1/{images.length}
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="p-5">
        {/* 标题和描述 */}
        <div className="mb-4">
          <div className="flex items-start gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors flex-1 text-lg leading-tight">
              {title}
            </h3>
            {/* 私人标签 */}
            {!is_public && (
              <span className="inline-flex items-center px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium whitespace-nowrap">
                {t('modelCard.private')}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* 标签 */}
        {tags && tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-4">
              {/* 模型名字标签 */}
              {tags.filter(tag => tag.tag_type === 'model_name').length > 0 && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center text-xs text-blue-600 font-medium mb-1.5">
                    <UserIcon className="w-3 h-3 mr-1.5" />
                    {t('modelCard.modelName')}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags
                      .filter(tag => tag.tag_type === 'model_name')
                      .slice(0, 2)
                      .map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
                        >
                          <UserIcon className="w-3 h-3 mr-1" />
                          {tag.name}
                        </span>
                      ))}
                    {tags.filter(tag => tag.tag_type === 'model_name').length > 2 && (
                      <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-200">
                        +{tags.filter(tag => tag.tag_type === 'model_name').length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* 模型风格标签 */}
              {tags.filter(tag => tag.tag_type === 'model_style' || !tag.tag_type).length > 0 && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center text-xs text-purple-600 font-medium mb-1.5">
                    <Palette className="w-3 h-3 mr-1.5" />
                    {t('modelCard.modelStyle')}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags
                      .filter(tag => tag.tag_type === 'model_style' || !tag.tag_type)
                      .slice(0, 2)
                      .map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-full hover:bg-purple-100 transition-colors cursor-pointer border border-purple-200"
                        >
                          <Palette className="w-3 h-3 mr-1" />
                          {tag.name}
                        </span>
                      ))}
                    {tags.filter(tag => tag.tag_type === 'model_style' || !tag.tag_type).length > 2 && (
                      <span className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-600 text-xs rounded-full border border-purple-200">
                        +{tags.filter(tag => tag.tag_type === 'model_style' || !tag.tag_type).length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 作者信息和时间 */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center min-w-0 flex-1">
            {author?.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-7 h-7 rounded-full mr-2.5 flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0">
                <User className="w-4 h-4 text-gray-500" />
              </div>
            )}
            <span className="font-medium text-gray-900 text-sm truncate">{author?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 ml-3 flex-shrink-0">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            <span className="whitespace-nowrap">{formatRelativeTime(created_at)}</span>
          </div>
        </div>

        {/* 统计信息和操作 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="flex items-center text-sm text-gray-600">
              <Eye className="w-4 h-4 mr-1.5" />
              <span className="font-medium hidden xs:inline">{stats?.views || 0}</span>
              <span className="font-medium xs:hidden">{(stats?.views || 0) > 999 ? `${Math.floor((stats?.views || 0) / 1000)}k` : (stats?.views || 0)}</span>
            </span>
            <span className="flex items-center text-sm text-gray-600">
              <Star className={cn('w-4 h-4 mr-1.5', isFavorited ? 'text-yellow-500 fill-current' : '')} />
              <span className="font-medium hidden sm:inline">{t('modelCard.favorite')}</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={(e) => { e.stopPropagation(); onComment?.(id) }}
              className="flex items-center space-x-1 sm:space-x-1.5 text-gray-600 hover:text-primary-600 transition-colors group"
            >
              <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{localStats?.comments || 0}</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleLike() }}
              disabled={isLoading}
              className={cn(
                'flex items-center space-x-1 sm:space-x-1.5 transition-all group',
                isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              )}
            >
              <Heart className={cn('w-4 h-4 group-hover:scale-110 transition-transform', isLiked && 'fill-current')} />
              <span className="text-sm font-medium">{localStats?.likes || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}