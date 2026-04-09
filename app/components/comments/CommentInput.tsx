'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Send, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentInputProps {
  postId: string
  user?: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
  replyTo?: {
    commentId: string
    authorName: string
  } | null
  onCancelReply?: () => void
  onCommentAdded?: () => void
}

export function CommentInput({
  postId,
  user,
  replyTo,
  onCancelReply,
  onCommentAdded,
}: CommentInputProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px'
    }
  }, [content])

  // Focus textarea when replying
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [replyTo])

  const handleSubmit = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: content.trim(),
          parentId: replyTo?.commentId,
        }),
      })

      if (res.ok) {
        setContent('')
        onCancelReply?.()
        onCommentAdded?.()
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-4 px-4 bg-muted/50 rounded-lg">
        <Button variant="link" onClick={() => router.push('/login')}>
          Đăng nhập để bình luận
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm">
          <span className="text-muted-foreground">
            Đang trả lời <strong>{replyTo.authorName}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 ml-auto"
            onClick={onCancelReply}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 items-start">
        <Avatar className="w-8 h-8">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback className="text-xs font-medium bg-gray-200">
            {user.display_name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 flex gap-2 items-end">
          <div className="flex-1 bg-muted rounded-2xl px-4 py-2">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={replyTo ? 'Viết câu trả lời...' : 'Viết bình luận...'}
              rows={1}
              className={cn(
                'w-full bg-transparent resize-none outline-none text-sm',
                'placeholder:text-muted-foreground',
                'min-h-[24px] max-h-[150px]'
              )}
              disabled={isSubmitting}
            />
          </div>

          <Button
            size="icon"
            className="h-8 w-8 rounded-full shrink-0"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
          >
            <Send className={cn('w-4 h-4', isSubmitting && 'animate-pulse')} />
          </Button>
        </div>
      </div>
    </div>
  )
}
