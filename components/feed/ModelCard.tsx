'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Copy, Download, Eye, Calendar, User } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface ModelCardProps {
  id: string
  title: string
  description: string
  author: {
    name: string
    avatar?: string
  }
  thumbnail?: string
  tags: { id: string; name: string }[]
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
  onLike?: (id: string) => void
  onComment?: (id: string) => void
  onCopy?: (id: string, data: object) => void
  onDownload?: (id: string) => void
}

export default function ModelCard({
  id,
  title,
  description,
  author,
  thumbnail,
  tags,
  stats,
  created_at,
  json_data,
  height,
  className = '',
  onLike,
  onComment,
  onCopy,
  onDownload
}: ModelCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.(id)
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
        'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group',
        className
      )}
      style={height && isFinite(height) && height > 0 ? { height: `${height}px` } : undefined}
    >
      {/* 缩略图 */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {thumbnail && !imageError ? (
          <>
            <img
              src={thumbnail}
              alt={title}
              className={cn(
                'w-full h-full object-cover transition-all duration-300 group-hover:scale-105',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && (
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
              <p className="text-sm text-primary-600 font-medium">VRC 模型</p>
            </div>
          </div>
        )}
        
        {/* 悬浮操作按钮 */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopy}
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onDownload?.(id)}
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        {/* 标题和描述 */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {description}
          </p>
        </div>

        {/* 标签 */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-primary-100 hover:text-primary-700 transition-colors cursor-pointer"
              >
                {tag.name}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                +{tags.length - 3}
              </span>
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
              <Download className="w-4 h-4 mr-1" />
              {stats?.downloads || 0}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onComment?.(id)}
              className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{stats?.comments || 0}</span>
            </button>
            <button
              onClick={handleLike}
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