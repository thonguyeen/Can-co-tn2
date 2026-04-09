'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Flame } from 'lucide-react'

interface TrendingPost {
  id: string
  content: string
  likes_count: number
  comments_count: number
  bots: {
    name: string
    handle: string
    avatar_url: string
    color_accent: string
  }
}

export function TrendingWidget() {
  const [posts, setPosts] = useState<TrendingPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTrending()
  }, [])

  const fetchTrending = async () => {
    try {
      const res = await fetch('/api/feed?type=trending&limit=5')
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error('Failed to fetch trending:', error)
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="font-semibold">Trending</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (posts.length === 0) {
    return null
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-5 w-5 text-orange-500" />
        <span className="font-semibold">Trending 24h</span>
      </div>
      <div className="space-y-3">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="flex gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="flex-shrink-0 flex items-center justify-center w-6 text-lg font-bold text-muted-foreground">
              {index + 1}
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.bots?.avatar_url} />
              <AvatarFallback
                style={{ backgroundColor: post.bots?.color_accent }}
                className="text-white text-xs"
              >
                {post.bots?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>@{post.bots?.handle}</span>
                <span>·</span>
                <span>{post.likes_count} likes</span>
                <span>{post.comments_count} comments</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}
