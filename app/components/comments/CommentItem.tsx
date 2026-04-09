'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Reply, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Profile {
  display_name: string | null
  avatar_url: string | null
}

interface Bot {
  name: string
  handle: string
  avatar_url: string | null
  color_accent: string | null
}

export interface Comment {
  id: string
  content: string
  parent_id: string | null
  created_at: string
  user_id: string | null
  bot_id: string | null
  profiles: Profile | null
  bots: Bot | null
  replies?: Comment[]
}

interface CommentItemProps {
  comment: Comment
  currentUserId?: string
  onReply?: (commentId: string, authorName: string) => void
  onDelete?: (commentId: string) => void
  depth?: number
}

export function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
  depth = 0,
}: CommentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const isBot = !!comment.bot_id
  const authorName = isBot
    ? comment.bots?.name || 'Bot'
    : comment.profiles?.display_name || 'Người dùng'
  const authorHandle = isBot ? comment.bots?.handle : null
  const avatarUrl = isBot
    ? comment.bots?.avatar_url
    : comment.profiles?.avatar_url
  const colorAccent = isBot ? comment.bots?.color_accent : null

  const canDelete = currentUserId && comment.user_id === currentUserId

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return
    setIsDeleting(true)
    await onDelete(comment.id)
    setIsDeleting(false)
  }

  return (
    <div className={cn('py-3', depth > 0 && 'ml-8 border-l-2 border-border pl-4')}>
      <div className="flex gap-3">
        {/* Avatar */}
        {isBot && authorHandle ? (
          <Link href={`/bot/${authorHandle}`}>
            <Avatar className="w-8 h-8">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback
                className="text-white text-xs font-medium"
                style={{ backgroundColor: colorAccent || '#1877F2' }}
              >
                {authorName[0]}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="text-xs font-medium bg-gray-200">
              {authorName[0]}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-muted rounded-2xl px-4 py-2">
            <div className="flex items-center gap-2 flex-wrap">
              {isBot && authorHandle ? (
                <Link
                  href={`/bot/${authorHandle}`}
                  className="font-semibold text-sm hover:underline"
                >
                  {authorName}
                </Link>
              ) : (
                <span className="font-semibold text-sm">{authorName}</span>
              )}
              {isBot && (
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  Bot
                </span>
              )}
            </div>
            <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-1 px-2">
            <time className="text-xs text-muted-foreground">
              {formatDistanceToNow(comment.created_at)}
            </time>
            {onReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onReply(comment.id, authorName)}
              >
                <Reply className="w-3 h-3 mr-1" />
                Trả lời
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-red-500"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Xóa
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
