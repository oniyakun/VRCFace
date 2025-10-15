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
  
  // 获取封面图片：优先使用images的第一张，否则使用thumbnail
  const coverImage = images && images.length > 0 ? images[0] : thumbnail
  const { user } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()

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
        setIsLiked(data.action === 'liked')
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
        'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer',
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
                'w-full h-full object-cover transition-all duration-300 group-hover:scale-105',
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
              <div className="absolute inset-0 flex items-center justify-center">
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
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); handleFavorite() }}
              disabled={isLoading}
              className={cn(
                'bg-white/90 backdrop-blur-sm hover:bg-white transition-colors',
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
                'bg-white/90 backdrop-blur-sm hover:bg-white transition-colors',
                isLiked ? 'text-red-500' : 'text-gray-600'
              )}
            >
              <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
            </Button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        {/* 标题和描述 */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors flex-1">
              {title}
            </h3>
            {/* 私人标签 */}
            {!is_public && (
              <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md font-medium">
                {t('modelCard.private')}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {description}
          </p>
        </div>

        {/* 标签 */}
        {tags && tags.length > 0 && (
          <div className="mb-3">
            {/* 模型名字标签 */}
            {tags.filter(tag => tag.tag_type === 'model_name').length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                <div className="flex items-center text-xs text-blue-600 font-medium mb-1 w-full">
                  <UserIcon className="w-3 h-3 mr-1" />
                  {t('modelCard.modelName')}
                </div>
                {tags
                  .filter(tag => tag.tag_type === 'model_name')
                  .slice(0, 2)
                  .map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md hover:bg-blue-200 transition-colors cursor-pointer"
                    >
                      <UserIcon className="w-3 h-3 mr-1" />
                      {tag.name}
                    </span>
                  ))}
                {tags.filter(tag => tag.tag_type === 'model_name').length > 2 && (
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-md">
                    +{tags.filter(tag => tag.tag_type === 'model_name').length - 2}
                  </span>
                )}
              </div>
            )}
            
            {/* 模型风格标签 */}
            {tags.filter(tag => tag.tag_type === 'model_style' || !tag.tag_type).length > 0 && (
              <div className="flex flex-wrap gap-1">
                <div className="flex items-center text-xs text-purple-600 font-medium mb-1 w-full">
                  <Palette className="w-3 h-3 mr-1" />
                  {t('modelCard.modelStyle')}
                </div>
                {tags
                  .filter(tag => tag.tag_type === 'model_style' || !tag.tag_type)
                  .slice(0, 2)
                  .map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md hover:bg-purple-200 transition-colors cursor-pointer"
                    >
                      <Palette className="w-3 h-3 mr-1" />
                      {tag.name}
                    </span>
                  ))}
                {tags.filter(tag => tag.tag_type === 'model_style' || !tag.tag_type).length > 2 && (
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-md">
                    +{tags.filter(tag => tag.tag_type === 'model_style' || !tag.tag_type).length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* 作者信息 */}
        <div className="flex items-center mb-3 text-sm text-gray-600">
          <div className="flex items-center flex-1">
            {author?.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-6 h-6 rounded-full mr-2"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                <User className="w-3 h-3 text-gray-600" />
              </div>
            )}
            <span className="font-medium">{author?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            {formatRelativeTime(created_at)}
          </div>
        </div>

        {/* 统计信息和操作 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {stats?.views || 0}
            </span>
            <span className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              {t('modelCard.favorite')}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => { e.stopPropagation(); onComment?.(id) }}
              className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{stats?.comments || 0}</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleLike() }}
              disabled={isLoading}
              className={cn(
                'flex items-center space-x-1 transition-colors',
                isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              )}
            >
              <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
              <span className="text-sm">{(stats?.likes || 0) + (isLiked ? 1 : 0)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}