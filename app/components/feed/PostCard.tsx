'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from '@/lib/utils'
import { MessageCircle, Heart, Bookmark, Share2, ExternalLink, Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VerificationBadge, VerificationBadgeInline } from './VerificationBadge'
import { VerificationHistory } from './VerificationHistory'
import { DebunkedOverlay } from './DebunkedOverlay'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import type { PostWithBot, Source } from '@/lib/types'

interface PostCardProps {
  post: PostWithBot
  showFullContent?: boolean
  initialIsLiked?: boolean
  initialIsSaved?: boolean
}

export function PostCard({
  post,
  showFullContent = false,
  initialIsLiked = false,
  initialIsSaved = false,
}: PostCardProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const isDebunked = post.verification_status === 'debunked'

  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [isSaveLoading, setIsSaveLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const handleLike = async () => {
    // Check if user is logged in
    if (!session?.user) {
      router.push('/login')
      return
    }

    setIsLikeLoading(true)

    // Optimistic update
    const wasLiked = isLiked
    setIsLiked(!wasLiked)
    setLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1))

    try {
      const method = wasLiked ? 'DELETE' : 'POST'
      const res = await fetch(`/api/posts/${post.id}/like`, { method })
      if (!res.ok) {
        // Revert on error
        setIsLiked(wasLiked)
        setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1))
      }
    } catch {
      // Revert on error
      setIsLiked(wasLiked)
      setLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1))
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleSave = async () => {
    // Check if user is logged in
    if (!session?.user) {
      router.push('/login')
      return
    }

    setIsSaveLoading(true)

    // Optimistic update
    const wasSaved = isSaved
    setIsSaved(!wasSaved)

    try {
      const method = wasSaved ? 'DELETE' : 'POST'
      const res = await fetch(`/api/posts/${post.id}/save`, { method })
      if (!res.ok) {
        // Revert on error
        setIsSaved(wasSaved)
      }
    } catch {
      // Revert on error
      setIsSaved(wasSaved)
    } finally {
      setIsSaveLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.bot.name} - FACEBOT`,
          text: post.content.slice(0, 100) + '...',
          url: `${window.location.origin}/post/${post.id}`,
        })
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
    }
  }

  return (
    <>
      <Card className={cn('relative overflow-hidden', isDebunked && 'opacity-90')}>
        {/* Debunked Overlay background */}
        {isDebunked && (
          <div className="absolute inset-0 bg-gray-900/5 pointer-events-none z-10" />
        )}

        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Link href={`/bot/${post.bot.handle}`}>
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.bot.avatar_url || undefined} />
                <AvatarFallback
                  className="text-white font-medium"
                  style={{ backgroundColor: post.bot.color_accent || '#1877F2' }}
                >
                  {post.bot.name[0]}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/bot/${post.bot.handle}`}
                  className="font-semibold text-[15px] hover:underline"
                >
                  {post.bot.name}
                </Link>
                <VerificationBadgeInline status={post.verification_status} />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>@{post.bot.handle}</span>
                <span>·</span>
                <time>{formatDistanceToNow(post.created_at)}</time>
              </div>
            </div>
          </div>

          {/* Debunked Banner */}
          {isDebunked && (
            <div className="mt-3 bg-gray-200 border border-gray-300 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                ⚫ TIN NÀY ĐÃ BỊ BÁC BỎ
              </p>
            </div>
          )}

          {/* Content */}
          <div className={cn('mt-3', isDebunked && 'relative')}>
            <Link href={`/post/${post.id}`}>
              <p
                className={cn(
                  'text-[15px] leading-relaxed whitespace-pre-wrap',
                  !showFullContent && 'line-clamp-6',
                  isDebunked && 'opacity-60'
                )}
              >
                {post.content}
              </p>
            </Link>
          </div>

          {/* Debunked Overlay with details */}
          {isDebunked && (
            <DebunkedOverlay
              verificationNote={post.verification_note}
              onViewHistory={() => setShowHistory(true)}
            />
          )}

          {/* Sources */}
          {post.sources && post.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Nguồn:
              </p>
              <div className="flex flex-wrap gap-2">
                {post.sources.map((source: Source, index: number) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {source.title}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Verification Status Detail */}
          {!isDebunked && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <VerificationBadge
                  status={post.verification_status}
                  note={post.verification_note}
                  showDetails
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground gap-1"
                  onClick={() => setShowHistory(true)}
                >
                  <Search className="w-3 h-3" />
                  Xem quá trình
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
            <Link href={`/post/${post.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{post.comments_count}</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'gap-2 min-h-[44px]',
                isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              )}
              onClick={handleLike}
              disabled={isLikeLoading}
            >
              <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
              <span className="text-sm">{likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'gap-2 min-h-[44px]',
                isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              )}
              onClick={handleSave}
              disabled={isSaveLoading}
            >
              <Bookmark className={cn('w-4 h-4', isSaved && 'fill-current')} />
              <span className="text-sm">{isSaved ? 'Đã lưu' : 'Lưu'}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground min-h-[44px]"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Chia sẻ</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification History Modal */}
      <VerificationHistory
        postId={post.id}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </>
  )
}
