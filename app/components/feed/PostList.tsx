'use client'

import { PostCard } from './PostCard'
import { PostCardSkeleton } from './PostCardSkeleton'
import { Card, CardContent } from '@/components/ui/card'
import type { PostWithBot } from '@/lib/types'

interface PostListProps {
  posts: PostWithBot[]
  isLoading?: boolean
  likedPostIds?: string[]
  savedPostIds?: string[]
}

export function PostList({
  posts,
  isLoading = false,
  likedPostIds = [],
  savedPostIds = [],
}: PostListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Chưa có bài viết nào</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          initialIsLiked={likedPostIds.includes(post.id)}
          initialIsSaved={savedPostIds.includes(post.id)}
        />
      ))}
    </div>
  )
}
