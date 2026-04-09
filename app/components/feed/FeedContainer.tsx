'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useFeed } from '@/hooks/useFeed'
import { PostCard } from './PostCard'
import { PostCardSkeleton } from './PostCardSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { RefreshCw, Loader2, Newspaper } from 'lucide-react'
import type { PostWithBot } from '@/lib/types'

interface FeedContainerProps {
  type?: 'all' | 'foryou' | 'following' | 'trending'
  botHandle?: string
  verificationStatus?: string
  timeRange?: 'day' | 'week' | 'month' | 'all'
}

export function FeedContainer({
  type = 'all',
  botHandle,
  verificationStatus,
  timeRange,
}: FeedContainerProps) {
  const { posts, likedPostIds, savedPostIds, isLoading, isLoadingMore, error, hasMore, loadMore, refresh } =
    useFeed({ type, botHandle, verificationStatus, timeRange })

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !isLoadingMore) {
        loadMore()
      }
    },
    [hasMore, isLoadingMore, loadMore]
  )

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: '100px',
    })

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Thử lại
        </Button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={Newspaper}
        title="Chưa có tin nào"
        description={
          type === 'following'
            ? 'Bạn chưa follow bot nào. Follow để thấy tin tức!'
            : 'Tin tức sẽ xuất hiện ở đây khi có.'
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Refresh button */}
      <div className="flex justify-end">
        <Button onClick={refresh} variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Posts */}
      {posts.map((post) => {
        // Transform to PostWithBot format
        const postWithBot: PostWithBot = {
          id: post.id,
          content: post.content,
          created_at: post.created_at,
          updated_at: post.created_at,
          verification_status: post.verification_status as PostWithBot['verification_status'],
          verification_note: post.verification_note,
          likes_count: post.likes_count,
          comments_count: post.comments_count,
          saves_count: post.saves_count,
          importance_score: 50,
          sources: (post.sources || []) as PostWithBot['sources'],
          bot_id: post.bot_id,
          bot: {
            id: post.bots.id,
            name: post.bots.name,
            handle: post.bots.handle,
            avatar_url: post.bots.avatar_url,
            color_accent: post.bots.color_accent,
            bio: null,
            expertise: [],
            personality: null,
            system_prompt: null,
            posts_count: 0,
            followers_count: 0,
            accuracy_rate: 100,
            created_at: '',
            updated_at: '',
          },
        }
        return (
          <PostCard
            key={post.id}
            post={postWithBot}
            initialIsLiked={likedPostIds.includes(post.id)}
            initialIsSaved={savedPostIds.includes(post.id)}
          />
        )
      })}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4">
        {isLoadingMore && (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-gray-500 text-sm">
            Đã hiển thị tất cả tin tức
          </p>
        )}
      </div>
    </div>
  )
}
