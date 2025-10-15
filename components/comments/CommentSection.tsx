'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { useAuth } from '@/components/auth/AuthProvider'
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import CommentForm from './CommentForm'
import CommentList from './CommentList'

export interface Comment {
  id: string
  content: string
  author_id: string
  model_id: string
  parent_id: string | null
  is_edited: boolean
  likes: number
  created_at: string
  updated_at: string
  author: {
    id: string
    username: string
    display_name: string | null
    avatar: string | null
  }
  reply_count?: number
  replies?: Comment[]
}

interface CommentSectionProps {
  modelId: string
  className?: string
}

export default function CommentSection({ modelId, className = '' }: CommentSectionProps) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isExpanded, setIsExpanded] = useState(true)

  const limit = 10

  // 获取评论列表
  const fetchComments = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true)
        setError(null)
      } else {
        setLoadingMore(true)
      }

      const response = await fetch(`/api/comments?model_id=${modelId}&page=${pageNum}&limit=${limit}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch comments')
      }

      const data = await response.json()
      
      if (append) {
        setComments(prev => [...(prev || []), ...(data.data?.comments || [])])
      } else {
        setComments(data.data?.comments || [])
      }
      
      setTotalCount(data.data?.pagination?.total || 0)
      setHasMore(data.data?.pagination?.hasNext || false)
      setPage(pageNum)
    } catch (err) {
      console.error('获取评论失败:', err)
      setError(err instanceof Error ? err.message : t('comments.loadFailed'))
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // 初始加载评论
  useEffect(() => {
    fetchComments()
  }, [modelId])

  // 加载更多评论
  const loadMoreComments = () => {
    if (!loadingMore && hasMore) {
      fetchComments(page + 1, true)
    }
  }

  // 处理新评论添加
  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [newComment, ...(prev || [])])
    setTotalCount(prev => prev + 1)
    
    // 如果评论区域未展开，则展开它
    if (!isExpanded) {
      setIsExpanded(true)
    }
  }

  // 处理评论更新
  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments(prev => 
      (prev || []).map(comment => 
        comment.id === updatedComment.id ? updatedComment : comment
      )
    )
  }

  // 处理评论删除
  const handleCommentDeleted = (commentId: string) => {
    setComments(prev => (prev || []).filter(comment => comment.id !== commentId))
    setTotalCount(prev => Math.max(0, prev - 1))
  }

  // 处理回复添加
  const handleReplyAdded = (newReply: Comment) => {
    // 更新父评论的回复数量
    setComments(prev => 
      (prev || []).map(comment => 
        comment.id === newReply.parent_id 
          ? { ...comment, reply_count: (comment.reply_count || 0) + 1 }
          : comment
      )
    )
    setTotalCount(prev => prev + 1)
  }

  return (
    <div className={`bg-white border-t border-gray-200 ${className}`}>
      {/* 评论区域头部 */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              {t('comments.title')}
            </h3>
            {totalCount > 0 && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {totalCount}
              </span>
            )}
          </div>

          {/* 展开/收起按钮 */}
          {totalCount > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>{t('comments.collapse')}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>{t('comments.expand')}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 评论表单 */}
      {user && (
        <div className="px-6 py-4 border-b border-gray-100">
          <CommentForm
            modelId={modelId}
            onCommentAdded={handleCommentAdded}
            placeholder={t('comments.writeComment')}
          />
        </div>
      )}

      {/* 未登录提示 */}
      {!user && (
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">{t('comments.loginToComment')}</p>
          </div>
        </div>
      )}

      {/* 评论列表 */}
      {isExpanded && (
        <div className="px-6 py-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="h-6 w-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-500">{t('comments.loading')}</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-3">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">{t('comments.loadFailed')}</p>
              </div>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => fetchComments()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t('comments.retry')}
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium mb-1">{t('comments.noComments')}</p>
              <p className="text-sm text-gray-400">{t('comments.beFirstToComment')}</p>
            </div>
          ) : (
            <>
              <CommentList
                comments={comments}
                modelId={modelId}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
                onReplyAdded={handleReplyAdded}
              />

              {/* 加载更多按钮 */}
              {hasMore && (
                <div className="text-center mt-6">
                  <button
                    onClick={loadMoreComments}
                    disabled={loadingMore}
                    className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                        <span>{t('comments.loadingMore')}</span>
                      </div>
                    ) : (
                      t('comments.loadMore')
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 收起状态下的简要信息 */}
      {!isExpanded && totalCount > 0 && (
        <div className="px-6 py-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {t('comments.totalComments', { count: totalCount })}
            </p>
            <button
              onClick={() => setIsExpanded(true)}
              className="mt-2 text-sm text-blue-500 hover:text-blue-600 transition-colors"
            >
              {t('comments.viewAll')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}