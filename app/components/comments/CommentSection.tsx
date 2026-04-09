'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Send, MoreHorizontal } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/utils'
import { MOCK_USER, MOCK_BOTS } from '@/lib/mock/data'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface Comment {
  id: string
  post_id: string
  user_id: string | null
  bot_id: string | null
  parent_id: string | null
  content: string
  created_at: string
  profiles: { display_name: string; avatar_url?: string } | null
  bots: { name: string; handle: string; avatar_url?: string; color_accent?: string } | null
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
  postBotId?: string
  initialComments: Comment[]
}

// ═══════════════════════════════════════════════════════════════
// BOT AUTO-REPLY TEMPLATES (for demo simulation)
// ═══════════════════════════════════════════════════════════════

const BOT_REPLY_TEMPLATES: Record<string, string[]> = {
  'b1000000-0000-0000-0000-000000000001': [
    'Câu hỏi hay! Theo mình nghiên cứu thì đây là một vấn đề rất thú vị trong lĩnh vực AI hiện tại.',
    'Đúng rồi, bạn nêu điểm quan trọng. Thêm vào đó, các nghiên cứu gần đây cũng cho thấy xu hướng tương tự.',
    'Hmm, câu này cần suy nghĩ thêm. Nhưng theo quan điểm của mình, technology luôn có hai mặt.',
  ],
  'b1000000-0000-0000-0000-000000000002': [
    'Từ góc độ business, đây là một signal rất tích cực cho thị trường.',
    'Số liệu này khá ấn tượng! So với mặt bằng chung thì đây là trên average.',
    'Bạn hỏi đúng câu. Unit economics mới là thứ quyết định thành bại ở đây.',
  ],
  'b1000000-0000-0000-0000-000000000003': [
    'Mình đã hands-on thử rồi, và phải nói là khá ấn tượng! 👌',
    'Đúng, so với thế hệ trước thì cải tiến rõ rệt. Nhưng giá thì... cân nhắc.',
    'Haha đúng rồi! Mình cũng nghĩ vậy. Real-world usage mới là chuẩn để đánh giá.',
  ],
}

// ═══════════════════════════════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════════════════════════════

const RATE_LIMIT_MS = 30000 // 30 seconds between comments

// ═══════════════════════════════════════════════════════════════
// COMMENT ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════

function CommentItem({
  comment,
  depth,
  onReply,
}: {
  comment: Comment
  depth: number
  onReply: (parentId: string, authorName: string) => void
}) {
  const isBot = !!comment.bot_id
  const authorName = isBot ? comment.bots?.name : comment.profiles?.display_name
  const avatarUrl = isBot ? comment.bots?.avatar_url : comment.profiles?.avatar_url
  const colorAccent = isBot ? comment.bots?.color_accent : undefined

  return (
    <div className={cn('flex gap-2', depth > 0 && 'ml-10')}>
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src={avatarUrl || ''} />
        <AvatarFallback
          className={cn('text-xs', isBot && 'text-white')}
          style={colorAccent ? { backgroundColor: colorAccent } : {}}
        >
          {authorName?.[0] || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="bg-secondary rounded-2xl px-3 py-2 inline-block max-w-full">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[13px]">{authorName}</span>
            {isBot && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-[#2D6A4F]/10 text-[#2D6A4F]">
                Bot
              </Badge>
            )}
          </div>
          <p className="text-[14px] mt-0.5 whitespace-pre-wrap break-words">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1 text-xs text-muted-foreground">
          <span>{formatDistanceToNow(comment.created_at)}</span>
          <button className="font-medium hover:underline">Thích</button>
          <button
            className="font-medium hover:underline"
            onClick={() => onReply(comment.id, authorName || 'Người dùng')}
          >
            Trả lời
          </button>
          <button className="ml-auto">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TYPING INDICATOR
// ═══════════════════════════════════════════════════════════════

function TypingIndicator({ botName, botColor }: { botName: string; botColor: string }) {
  return (
    <div className="flex gap-2 ml-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className="text-xs text-white" style={{ backgroundColor: botColor }}>
          {botName[0]}
        </AvatarFallback>
      </Avatar>
      <div className="bg-secondary rounded-2xl px-4 py-3 inline-flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function CommentSection({ postId, postBotId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<{ parentId: string; authorName: string } | null>(null)
  const [lastCommentTime, setLastCommentTime] = useState(0)
  const [rateLimitRemaining, setRateLimitRemaining] = useState(0)
  const [typingBot, setTypingBot] = useState<{ name: string; color: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  // Rate limit countdown
  useEffect(() => {
    if (rateLimitRemaining <= 0) return
    const timer = setInterval(() => {
      const remaining = Math.max(0, RATE_LIMIT_MS - (Date.now() - lastCommentTime))
      setRateLimitRemaining(remaining)
    }, 1000)
    return () => clearInterval(timer)
  }, [lastCommentTime, rateLimitRemaining])

  const handleReply = useCallback((parentId: string, authorName: string) => {
    setReplyingTo({ parentId, authorName })
    inputRef.current?.focus()
  }, [])

  const cancelReply = () => {
    setReplyingTo(null)
  }

  // Simulate bot auto-reply
  const simulateBotReply = useCallback((parentCommentId: string) => {
    if (!postBotId) return

    const bot = MOCK_BOTS.find(b => b.id === postBotId)
    if (!bot) return

    // Show typing indicator after 1s
    setTimeout(() => {
      setTypingBot({ name: bot.name, color: bot.color_accent })
    }, 1000)

    // Add bot reply after 2-4s
    const delay = 2000 + Math.random() * 2000
    setTimeout(() => {
      setTypingBot(null)

      const templates = BOT_REPLY_TEMPLATES[postBotId] || [
        'Cảm ơn bạn đã bình luận! Mình sẽ xem xét thêm nhé.',
      ]
      const replyContent = templates[Math.floor(Math.random() * templates.length)]

      const botReply: Comment = {
        id: `bot-reply-${Date.now()}`,
        post_id: postId,
        user_id: null,
        bot_id: postBotId,
        parent_id: parentCommentId,
        content: replyContent,
        created_at: new Date().toISOString(),
        profiles: null,
        bots: {
          name: bot.name,
          handle: bot.handle,
          avatar_url: bot.avatar_url || undefined,
          color_accent: bot.color_accent,
        },
      }

      setComments(prev => addReplyToComments(prev, parentCommentId, botReply))
    }, delay)
  }, [postBotId, postId])

  const handleSubmit = () => {
    if (!commentText.trim()) return

    // Rate limiting check
    const now = Date.now()
    if (now - lastCommentTime < RATE_LIMIT_MS) {
      setRateLimitRemaining(RATE_LIMIT_MS - (now - lastCommentTime))
      return
    }

    const newComment: Comment = {
      id: `user-comment-${Date.now()}`,
      post_id: postId,
      user_id: MOCK_USER.id,
      bot_id: null,
      parent_id: replyingTo?.parentId || null,
      content: commentText.trim(),
      created_at: new Date().toISOString(),
      profiles: {
        display_name: MOCK_USER.display_name,
        avatar_url: MOCK_USER.avatar_url,
      },
      bots: null,
    }

    if (replyingTo) {
      setComments(prev => addReplyToComments(prev, replyingTo.parentId, newComment))
    } else {
      setComments(prev => [...prev, { ...newComment, replies: [] }])
    }

    setLastCommentTime(now)
    setCommentText('')
    setReplyingTo(null)

    // Trigger bot auto-reply (only for top-level comments or if replying to bot's own post)
    if (!replyingTo) {
      simulateBotReply(newComment.id)
    }

    // Scroll to bottom
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div>
      {/* Comments List */}
      <div className="space-y-3 mb-4">
        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-sm">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              depth={0}
              onReply={handleReply}
            />
          ))
        )}

        {/* Typing Indicator */}
        {typingBot && (
          <TypingIndicator botName={typingBot.name} botColor={typingBot.color} />
        )}

        <div ref={commentsEndRef} />
      </div>

      {/* Reply Indicator */}
      {replyingTo && (
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-secondary/50 rounded-t-lg">
          <span>Đang trả lời <span className="font-medium text-foreground">{replyingTo.authorName}</span></span>
          <button onClick={cancelReply} className="ml-auto text-muted-foreground hover:text-foreground">
            ✕
          </button>
        </div>
      )}

      {/* Comment Input */}
      <div className="flex gap-2 items-center">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarImage src={MOCK_USER.avatar_url} />
          <AvatarFallback className="bg-[#1B4D3E] text-white text-xs">
            {MOCK_USER.display_name?.[0] || 'D'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={replyingTo ? `Trả lời ${replyingTo.authorName}...` : 'Viết bình luận...'}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full h-9 bg-secondary rounded-full px-4 text-sm outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 transition-shadow"
            />
          </div>
          <Button
            size="icon"
            className="w-9 h-9 rounded-full bg-[#2D6A4F] hover:bg-[#1B4D3E] shrink-0"
            onClick={handleSubmit}
            disabled={!commentText.trim() || rateLimitRemaining > 0}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Rate Limit Warning */}
      {rateLimitRemaining > 0 && (
        <p className="text-xs text-orange-500 mt-1.5 ml-10">
          Vui lòng chờ {Math.ceil(rateLimitRemaining / 1000)}s trước khi bình luận tiếp
        </p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function addReplyToComments(comments: Comment[], parentId: string, reply: Comment): Comment[] {
  return comments.map(comment => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), { ...reply, replies: [] }],
      }
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: addReplyToComments(comment.replies, parentId, reply),
      }
    }
    return comment
  })
}
