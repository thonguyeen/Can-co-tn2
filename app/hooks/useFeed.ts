'use client'

import { useState, useEffect, useCallback } from 'react'

interface Bot {
  id: string
  name: string
  handle: string
  avatar_url: string
  color_accent: string
}

interface Post {
  id: string
  content: string
  created_at: string
  verification_status: string
  verification_note: string
  likes_count: number
  comments_count: number
  saves_count: number
  sources: unknown[]
  score: number
  bot_id: string
  bots: Bot
}

interface UseFeedOptions {
  type?: 'all' | 'foryou' | 'following' | 'trending'
  botHandle?: string
  verificationStatus?: string
  timeRange?: 'day' | 'week' | 'month' | 'all'
  limit?: number
}

interface UseFeedResult {
  posts: Post[]
  likedPostIds: string[]
  savedPostIds: string[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

export function useFeed(options: UseFeedOptions = {}): UseFeedResult {
  const {
    type = 'all',
    botHandle,
    verificationStatus,
    timeRange = 'all',
    limit = 20,
  } = options

  const [posts, setPosts] = useState<Post[]>([])
  const [likedPostIds, setLikedPostIds] = useState<string[]>([])
  const [savedPostIds, setSavedPostIds] = useState<string[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const buildUrl = useCallback(
    (withCursor?: string) => {
      const params = new URLSearchParams()
      params.set('type', type)
      params.set('limit', limit.toString())
      if (withCursor) params.set('cursor', withCursor)
      if (botHandle) params.set('bot', botHandle)
      if (verificationStatus) params.set('status', verificationStatus)
      if (timeRange) params.set('time', timeRange)
      return `/api/feed?${params.toString()}`
    },
    [type, limit, botHandle, verificationStatus, timeRange]
  )

  const fetchFeed = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setIsLoading(true)
          setCursor(null)
        }

        const currentCursor = isRefresh ? undefined : cursor || undefined
        const url = buildUrl(currentCursor)
        const res = await fetch(url)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load feed')
        }

        if (isRefresh) {
          setPosts(data.posts)
          setLikedPostIds(data.likedPostIds || [])
          setSavedPostIds(data.savedPostIds || [])
        } else {
          setPosts((prev) => [...prev, ...data.posts])
          setLikedPostIds((prev) => [...prev, ...(data.likedPostIds || [])])
          setSavedPostIds((prev) => [...prev, ...(data.savedPostIds || [])])
        }

        setCursor(data.nextCursor)
        setHasMore(data.hasMore)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [buildUrl, cursor]
  )

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    await fetchFeed(false)
  }, [fetchFeed, isLoadingMore, hasMore])

  const refresh = useCallback(async () => {
    await fetchFeed(true)
  }, [fetchFeed])

  // Initial load
  useEffect(() => {
    fetchFeed(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, botHandle, verificationStatus, timeRange])

  return {
    posts,
    likedPostIds,
    savedPostIds,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  }
}
