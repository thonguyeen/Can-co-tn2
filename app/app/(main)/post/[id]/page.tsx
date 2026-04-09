import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { toSnakeCase } from '@/lib/data/helpers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PostCard } from '@/components/feed/PostCard'
import { CommentList } from '@/components/comments'
import { formatDate } from '@/lib/utils'
import { VERIFICATION_CONFIG } from '@/lib/types'
import type { PostWithBot, PostUpdate } from '@/lib/types'

interface PostDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params

  // Get current user from NextAuth session
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  // Get post with bot
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      bot: true,
    },
  })

  if (!post) {
    notFound()
  }

  // Get verification history
  const updates = await prisma.postUpdate.findMany({
    where: { postId: id },
    orderBy: { createdAt: 'desc' },
  })

  // Check if user has liked/saved this post
  let isLiked = false
  let isSaved = false

  if (userId) {
    const [likeResult, saveResult] = await Promise.all([
      prisma.like.findUnique({
        where: { userId_postId: { userId, postId: id } },
      }),
      prisma.save.findUnique({
        where: { userId_postId: { userId, postId: id } },
      }),
    ])
    isLiked = !!likeResult
    isSaved = !!saveResult
  }

  // Convert to snake_case for frontend compatibility
  const postSnake = toSnakeCase(post)
  const postWithBot = {
    ...postSnake,
    sources: postSnake.sources || [],
    bot: postSnake.bot,
  } as PostWithBot

  // Convert updates to snake_case
  const updatesSnake = updates.map((u) => toSnakeCase(u)) as PostUpdate[]

  return (
    <div className="pb-8">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/feed">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Quay lại Feed
          </Button>
        </Link>
      </div>

      {/* Post */}
      <PostCard
        post={postWithBot}
        showFullContent
        initialIsLiked={isLiked}
        initialIsSaved={isSaved}
      />

      {/* Verification History */}
      {updatesSnake && updatesSnake.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Lịch sử xác minh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {updatesSnake.map((update: PostUpdate) => {
                const config = VERIFICATION_CONFIG[update.new_status]
                return (
                  <div
                    key={update.id}
                    className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="text-lg">{config.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {update.old_status ? (
                          <>
                            Cập nhật từ{' '}
                            <span className="text-muted-foreground">
                              {VERIFICATION_CONFIG[update.old_status].label}
                            </span>{' '}
                            sang{' '}
                            <span className={config.textColor}>
                              {config.label}
                            </span>
                          </>
                        ) : (
                          <>
                            Trạng thái ban đầu:{' '}
                            <span className={config.textColor}>
                              {config.label}
                            </span>
                          </>
                        )}
                      </p>
                      {update.note && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {update.note}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(update.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">
            Bình luận ({postSnake.comments_count})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CommentList
            postId={id}
            botName={postWithBot.bot.name}
            botAvatarUrl={postWithBot.bot.avatar_url}
            botColorAccent={postWithBot.bot.color_accent}
          />
        </CardContent>
      </Card>
    </div>
  )
}
