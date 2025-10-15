'use client'

import { useState } from 'react'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Send, X } from 'lucide-react'
import type { Comment } from './CommentSection'

interface CommentFormProps {
  modelId: string
  parentId?: string
  replyToUsername?: string
  onCommentAdded: (comment: Comment) => void
  onCancel?: () => void
  placeholder?: string
  className?: string
}

export default function CommentForm({
  modelId,
  parentId,
  replyToUsername,
  onCommentAdded,
  onCancel,
  placeholder,
  className = ''
}: CommentFormProps) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isReply = !!parentId
  const maxLength = 1000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError(t('comments.loginToComment'))
      return
    }

    const trimmedContent = content.trim()
    
    if (trimmedContent.length < 1) {
      setError(t('comments.commentTooShort'))
      return
    }

    if (trimmedContent.length > maxLength) {
      setError(t('comments.commentTooLong'))
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // 获取认证token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('请先登录')
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content: trimmedContent,
          model_id: modelId,
          parent_id: parentId || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to post comment')
      }

      const result = await response.json()
      onCommentAdded(result.data)
      setContent('')
      
      if (onCancel) {
        onCancel()
      }
    } catch (err) {
      console.error('发表评论失败:', err)
      setError(err instanceof Error ? err.message : t('comments.postFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setContent('')
    setError(null)
    if (onCancel) {
      onCancel()
    }
  }

  if (!user) {
    return null
  }

  const placeholderText = placeholder || 
    (isReply 
      ? t('comments.replyPlaceholder')
      : t('comments.commentPlaceholder')
    )

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      {/* 回复提示 */}
      {isReply && replyToUsername && (
        <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
          <span className="text-sm text-blue-700">
            {t('comments.replyTo', { username: replyToUsername })}
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 输入框 */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholderText}
          rows={isReply ? 3 : 4}
          maxLength={maxLength}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          disabled={isSubmitting}
        />
        
        {/* 字符计数 */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {content.length}/{maxLength}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* 用户头像 */}
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName || user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-500">
                {(user.displayName || user.username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-sm text-gray-600">
            {user.displayName || user.username}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* 取消按钮（仅回复时显示） */}
          {isReply && onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              {t('comments.cancel')}
            </button>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={isSubmitting || content.trim().length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span>
              {isSubmitting 
                ? (isReply ? t('comments.replying') : t('comments.posting'))
                : (isReply ? t('comments.reply') : t('comments.postComment'))
              }
            </span>
          </button>
        </div>
      </div>
    </form>
  )
}