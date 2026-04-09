'use client'

import { useState, useEffect, useCallback } from 'react'
import { CommentItem, type Comment } from './CommentItem'
import { CommentInput } from './CommentInput'
import { BotTypingIndicator } from './BotTypingIndicator'
import { MessageCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface CommentListProps {
  postId: string
  botName: string
  botAvatarUrl?: string | null
  botColorAccent?: string | null
}

export function CommentList({
  postId,
  botName,
  botAvatarUrl,
  botColorAccent,
}: CommentListProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null>(null)
  const [replyTo, setReplyTo] = useState<{
    commentId: string
    authorName: string
  } | null>(null)
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)

  // Fetch user
  // Sync user with NextAuth session
  useEffect(() => {
    if (session?.user) {
      // session.user from nextauth typically contains id, name, email, image
      setUser({
        id: session.user.id || '',
        display_name: session.user.name || session.user.email || null,
        avatar_url: session.user.image || null,
      })
    } else {
      setUser(null)
    }
  }, [session])

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleReply = (commentId: string, authorName: string) => {
    setReplyTo({ commentId, authorName })
  }

  const handleCancelReply = () => {
    setReplyTo(null)
  }

  const handleCommentAdded = () => {
    // Show typing indicator to indicate bot is thinking
    setShowTypingIndicator(true)
    // Auto-hide after 30 seconds if no response
    setTimeout(() => setShowTypingIndicator(false), 30000)
    // Refetch comments
    fetchComments()
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <CommentInput
        postId={postId}
        user={user}
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
        onCommentAdded={handleCommentAdded}
      />

      {/* Comments */}
      <div className="divide-y">
        {comments.length === 0 && !showTypingIndicator ? (
          <div className="py-8 text-center text-muted-foreground">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Chưa có bình luận nào</p>
            <p className="text-sm">Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={user?.id}
                onReply={handleReply}
                onDelete={handleDeleteComment}
              />
            ))}
          </>
        )}

        {/* Bot Typing Indicator */}
        {showTypingIndicator && (
          <BotTypingIndicator
            botName={botName}
            botAvatarUrl={botAvatarUrl}
            colorAccent={botColorAccent}
          />
        )}
      </div>
    </div>
  )
}
