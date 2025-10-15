'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { MoreHorizontal, Reply, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import CommentForm from './CommentForm'
import type { Comment } from './CommentSection'

interface CommentItemProps {
  comment: Comment
  modelId: string
  isExpanded: boolean
  onToggleReplies: () => void
  onCommentUpdated: (comment: Comment) => void
  onCommentDeleted: (commentId: string) => void
  onReplyAdded: (comment: Comment) => void
  className?: string
}

export default function CommentItem({
  comment,
  modelId,
  isExpanded,
  onToggleReplies,
  onCommentUpdated,
  onCommentDeleted,
  onReplyAdded,
  className = ''
}: CommentItemProps) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [replies, setReplies] = useState<Comment[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [repliesLoaded, setRepliesLoaded] = useState(false)

  const isOwner = user && user.id && comment.author?.id && user.id === comment.author.id
  
  const hasReplies = (comment.reply_count || 0) > 0 || replies.length > 0

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return t('comments.justNow')
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return t('comments.minutesAgo', { count: minutes })
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return t('comments.hoursAgo', { count: hours })
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return t('comments.daysAgo', { count: days })
    } else if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800)
      return t('comments.weeksAgo', { count: weeks })
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000)
      return t('comments.monthsAgo', { count: months })
    } else {
      const years = Math.floor(diffInSeconds / 31536000)
      return t('comments.yearsAgo', { count: years })
    }
  }

  // 加载回复
  const loadReplies = async () => {
    if (repliesLoaded || !hasReplies) return

    setLoadingReplies(true)
    try {
      const response = await fetch(`/api/comments/${comment.id}?page=1&limit=10`)
      if (response.ok) {
        const result = await response.json()
        setReplies(result.data?.replies || [])
        setRepliesLoaded(true)
      }
    } catch (error) {
      console.error('加载回复失败:', error)
    } finally {
      setLoadingReplies(false)
    }
  }

  // 当展开回复时加载回复
  useEffect(() => {
    if (isExpanded && hasReplies && !repliesLoaded) {
      loadReplies()
    }
  }, [isExpanded, hasReplies, repliesLoaded])

  // 删除评论
  const handleDelete = async () => {
    if (!window.confirm(t('comments.deleteConfirm'))) {
      return
    }

    try {
      // 获取认证token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        alert('请先登录')
        return
      }

      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        onCommentDeleted(comment.id)
      } else {
        alert(t('comments.deleteFailed'))
      }
    } catch (error) {
      console.error('删除评论失败:', error)
      alert(t('comments.networkError'))
    }
  }

  // 处理回复添加
  const handleReplyAdded = (newReply: Comment) => {
    console.log('handleReplyAdded called with:', newReply)
    console.log('Current replies before update:', replies)
    setReplies(prev => {
      const updated = [newReply, ...prev]
      console.log('Updated replies:', updated)
      return updated
    })
    setShowReplyForm(false)
    onReplyAdded(newReply)
    
    // 如果回复列表未展开，则展开它
    if (!isExpanded) {
      console.log('Expanding replies because isExpanded is false')
      onToggleReplies()
    }
  }

  // 处理编辑完成
  const handleEditComplete = (updatedComment: Comment) => {
    setShowEditForm(false)
    onCommentUpdated(updatedComment)
  }

  // 渲染嵌套回复的递归函数
  const renderNestedReplies = (replies: Comment[], depth: number = 0) => {
    if (!replies || replies.length === 0) return null
    
    const maxDepth = 3 // 最大嵌套深度
    const shouldNest = depth < maxDepth
    
    return replies.map((reply) => (
      <div key={reply.id} className={shouldNest ? "ml-8 mt-3" : "mt-3"}>
        <CommentItem
          comment={reply}
          modelId={modelId}
          isExpanded={false}
          onToggleReplies={() => {}}
          onCommentUpdated={onCommentUpdated}
          onCommentDeleted={onCommentDeleted}
          onReplyAdded={onReplyAdded}
          className="bg-gray-50"
        />
        {/* 递归渲染子回复 */}
        {reply.replies && reply.replies.length > 0 && (
          <div className="mt-2">
            {renderNestedReplies(reply.replies, depth + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* 评论头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* 用户头像 */}
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {comment.author?.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author?.display_name || comment.author?.username || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-500">
                {(comment.author?.display_name || comment.author?.username || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* 用户信息 */}
          <div>
            <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900 text-sm">
              {comment.author?.display_name || comment.author?.username || 'Unknown User'}
            </span>
              {comment.is_edited && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {t('comments.edited')}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">
              {formatTime(comment.created_at)}
            </span>
          </div>
        </div>

        {/* 操作菜单 */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    setShowEditForm(true)
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>{t('comments.edit')}</span>
                </button>
                <button
                  onClick={() => {
                    handleDelete()
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t('comments.delete')}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 评论内容 */}
      {showEditForm ? (
        <CommentEditForm
          comment={comment}
          onSave={handleEditComplete}
          onCancel={() => setShowEditForm(false)}
        />
      ) : (
        <div className="mb-3">
          <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* 回复按钮 */}
          {user && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <Reply className="w-4 h-4" />
              <span>{t('comments.reply')}</span>
            </button>
          )}

          {/* 回复数量和展开按钮 */}
          {hasReplies && (
            <button
              onClick={onToggleReplies}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <span>
                {isExpanded 
                  ? t('comments.hideReplies')
                  : t('comments.showReplies', { count: replies.length || comment.reply_count || 0 })
                }
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 回复表单 */}
      {showReplyForm && (
        <div className="mt-4 pl-8">
          <CommentForm
            modelId={modelId}
            parentId={comment.id}
            replyToUsername={comment.author?.display_name || comment.author?.username || 'Unknown User'}
            onCommentAdded={handleReplyAdded}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* 回复列表 */}
      {isExpanded && hasReplies && (
        <div className="mt-4 pl-8 space-y-3">
          {loadingReplies ? (
            <div className="text-center py-4">
              <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">{t('comments.loadingReplies')}</p>
            </div>
          ) : (
            renderNestedReplies(replies)
          )}
        </div>
      )}
    </div>
  )
}

// 评论编辑表单组件
interface CommentEditFormProps {
  comment: Comment
  onSave: (comment: Comment) => void
  onCancel: () => void
}

function CommentEditForm({ comment, onSave, onCancel }: CommentEditFormProps) {
  const { t } = useLanguage()
  const [content, setContent] = useState(comment.content)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const maxLength = 1000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedContent = content.trim()
    
    if (trimmedContent.length < 1) {
      setError(t('comments.commentTooShort'))
      return
    }

    if (trimmedContent.length > maxLength) {
      setError(t('comments.commentTooLong'))
      return
    }

    if (trimmedContent === comment.content) {
      onCancel()
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      // 获取认证token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('请先登录')
      }

      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          content: trimmedContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update comment')
      }

      const result = await response.json()
      onSave(result.data)
    } catch (err) {
      console.error('更新评论失败:', err)
      setError(err instanceof Error ? err.message : t('comments.updateFailed'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          maxLength={maxLength}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSaving}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {content.length}/{maxLength}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          {t('comments.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSaving || content.trim().length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? t('comments.saving') : t('comments.save')}
        </button>
      </div>
    </form>
  )
}