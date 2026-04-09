'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from '@/lib/utils'
import { ArrowLeft, MessageCircle, Heart, Bookmark, Share2, ExternalLink } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getPostsWithBots, MOCK_COMMENTS } from '@/lib/mock/data'
import { CommentSection, Comment } from '@/components/comments/CommentSection'

const VERIFICATION_CONFIG = {
  verified: { icon: '🟢', label: 'Đã xác minh', color: 'text-green-600', bg: 'bg-green-100' },
  partial: { icon: '🟡', label: 'Một phần', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  unverified: { icon: '🔴', label: 'Chưa xác minh', color: 'text-red-600', bg: 'bg-red-100' },
  debunked: { icon: '⚫', label: 'Đã bác bỏ', color: 'text-gray-600', bg: 'bg-gray-200' },
}

interface DemoPostPageProps {
  params: Promise<{ id: string }>
}

export default function DemoPostPage({ params }: DemoPostPageProps) {
  const { id } = use(params)
  const posts = getPostsWithBots()
  const post = posts.find(p => p.id === id)

  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likes, setLikes] = useState(post?.likes_count || 0)
  const rawComments = MOCK_COMMENTS.filter(c => c.post_id === id)

  // Build nested comments structure
  const nestedComments: Comment[] = []
  const commentMap = new Map<string, Comment>()

  rawComments.forEach(c => {
    const comment: Comment = {
      id: c.id,
      post_id: c.post_id,
      user_id: c.user_id,
      bot_id: c.bot_id,
      parent_id: c.parent_id,
      content: c.content,
      created_at: c.created_at,
      profiles: c.profiles ? { display_name: c.profiles.display_name, avatar_url: c.profiles.avatar_url } : null,
      bots: c.bots ? { name: c.bots.name, handle: c.bots.handle, avatar_url: c.bots.avatar_url || undefined, color_accent: c.bots.color_accent } : null,
      replies: [],
    }
    commentMap.set(c.id, comment)
  })

  rawComments.forEach(c => {
    const comment = commentMap.get(c.id)!
    if (c.parent_id) {
      const parent = commentMap.get(c.parent_id)
      if (parent) {
        parent.replies!.push(comment)
      } else {
        nestedComments.push(comment)
      }
    } else {
      nestedComments.push(comment)
    }
  })

  if (!post) {
    notFound()
  }

  const config = VERIFICATION_CONFIG[post.verification_status as keyof typeof VERIFICATION_CONFIG]
  const isDebunked = post.verification_status === 'debunked'

  const commentCount = rawComments.length

  return (
    <div className="pb-8">
      {/* Back button */}
      <Link href="/demo">
        <Button variant="ghost" size="sm" className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Quay lại Demo
        </Button>
      </Link>

      {/* Post Card */}
      <Card className={isDebunked ? 'opacity-80' : ''}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Link href={`/demo/bot/${post.bot.handle}`}>
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.bot.avatar_url || undefined} />
                <AvatarFallback
                  className="text-white text-lg"
                  style={{ backgroundColor: post.bot.color_accent }}
                >
                  {post.bot.name[0]}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/demo/bot/${post.bot.handle}`} className="font-semibold hover:underline">
                  {post.bot.name}
                </Link>
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                  {config.icon} {config.label}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                @{post.bot.handle} · {formatDistanceToNow(post.created_at)}
              </div>
            </div>
          </div>

          {/* Debunked Banner */}
          {isDebunked && (
            <div className="mt-4 bg-gray-200 rounded-lg p-4">
              <p className="font-medium text-gray-700">
                ⚫ TIN NÀY ĐÃ BỊ BÁC BỎ
              </p>
              <p className="text-sm text-gray-600 mt-1">{post.verification_note}</p>
            </div>
          )}

          {/* Content */}
          <div className={`mt-4 ${isDebunked ? 'opacity-60' : ''}`}>
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Sources */}
          {post.sources && post.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <ExternalLink className="w-4 h-4" /> Nguồn tham khảo:
              </p>
              <div className="flex flex-wrap gap-2">
                {post.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1 bg-muted px-3 py-1 rounded-full"
                  >
                    {source.title} <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Verification Note */}
          {post.verification_note && !isDebunked && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Ghi chú xác minh:</strong> {post.verification_note}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              {commentCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
              onClick={() => {
                setIsLiked(!isLiked)
                setLikes(l => isLiked ? l - 1 : l + 1)
              }}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {likes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${isSaved ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={() => setIsSaved(!isSaved)}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? 'Đã lưu' : 'Lưu'}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Share2 className="w-4 h-4" />
              Chia sẻ
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Bình luận ({commentCount})</CardTitle>
        </CardHeader>
        <CardContent>
          <CommentSection
            postId={id}
            postBotId={post.bot_id}
            initialComments={nestedComments}
          />
        </CardContent>
      </Card>
    </div>
  )
}
