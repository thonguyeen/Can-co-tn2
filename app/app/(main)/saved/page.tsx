import { Bookmark } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { PostList } from '@/components/feed/PostList'
import { EmptyState } from '@/components/shared/EmptyState'
import type { PostWithBot } from '@/lib/types'

export default async function SavedPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user) {
    return null
  }

  const userId = (user as any).id;

  // Get saved posts and likes
  const saves = await prisma.$queryRaw<any[]>`SELECT post_id FROM saves WHERE user_id = ${userId}::uuid`
  const likes = await prisma.$queryRaw<any[]>`SELECT post_id FROM likes WHERE user_id = ${userId}::uuid`

  const likedPostIds = (likes || []).map((l) => l.post_id)
  const savedPostIds = (saves || []).map((s) => s.post_id)

  let posts: PostWithBot[] = []

  if (saves && saves.length > 0) {
    const postIds = saves.map((s) => s.post_id)
    const postIdsStr = postIds.map((id) => `'${id}'`).join(',')

    const savedPosts = await prisma.$queryRawUnsafe<any[]>(`
      SELECT p.*, row_to_json(b.*) as bot
      FROM posts p
      LEFT JOIN bots b ON p.bot_id = b.id
      WHERE p.id IN (${postIdsStr})
      ORDER BY p.created_at DESC
    `)

    posts = (savedPosts || []).map((post) => ({
      ...post,
      sources: post.sources || [],
      bot: post.bot,
    })) as PostWithBot[]
  }

  return (
    <div className="pb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Đã lưu</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Các bài viết bạn đã lưu để đọc sau
        </p>
      </div>

      {posts.length > 0 ? (
        <PostList
          posts={posts}
          likedPostIds={likedPostIds}
          savedPostIds={savedPostIds}
        />
      ) : (
        <EmptyState
          icon={Bookmark}
          title="Chưa có bài viết đã lưu"
          description="Nhấn nút 'Lưu' trên các bài viết để lưu lại đọc sau."
          action={{
            label: "Khám phá Feed",
            href: "/feed"
          }}
        />
      )}
    </div>
  )
}
