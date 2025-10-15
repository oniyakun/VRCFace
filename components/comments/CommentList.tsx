'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import CommentItem from './CommentItem'
import type { Comment } from './CommentSection'

interface CommentListProps {
  comments: Comment[]
  modelId: string
  onCommentUpdated: (comment: Comment) => void
  onCommentDeleted: (commentId: string) => void
  onReplyAdded: (comment: Comment) => void
  className?: string
}

export default function CommentList({
  comments,
  modelId,
  onCommentUpdated,
  onCommentDeleted,
  onReplyAdded,
  className = ''
}: CommentListProps) {
  const { t } = useLanguage()
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  // 初始化时展开所有有回复的评论
  useEffect(() => {
    const commentsWithReplies = comments
      .filter(comment => (comment.reply_count || 0) > 0)
      .map(comment => comment.id)
    
    if (commentsWithReplies.length > 0) {
      setExpandedReplies(new Set(commentsWithReplies))
    }
  }, [comments])

  // 切换回复展开状态
  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  if (comments.length === 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          modelId={modelId}
          isExpanded={expandedReplies.has(comment.id)}
          onToggleReplies={() => toggleReplies(comment.id)}
          onCommentUpdated={onCommentUpdated}
          onCommentDeleted={onCommentDeleted}
          onReplyAdded={onReplyAdded}
        />
      ))}
    </div>
  )
}