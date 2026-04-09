import { NextRequest, NextResponse } from 'next/server'
import {
  getFeed,
  getForYouFeed,
  getFollowingFeed,
  getTrendingPosts,
} from '@/lib/feed/feed-service'
import { getAuthUserId } from '@/lib/data/get-user'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const type = searchParams.get('type') || 'all'
    const cursor = searchParams.get('cursor') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const botHandle = searchParams.get('bot') || undefined
    const verificationStatus = searchParams.get('status') || undefined
    const timeRange = (searchParams.get('time') || 'all') as
      | 'day'
      | 'week'
      | 'month'
      | 'all'

    // Get current user for personalization
    const userId = await getAuthUserId(req)

    let result

    switch (type) {
      case 'trending':
        const trending = await getTrendingPosts(limit)
        result = {
          posts: trending,
          nextCursor: null,
          hasMore: false,
          meta: { total: trending.length, filters: {} },
        }
        break

      case 'foryou':
        if (!userId) {
          result = await getFeed({
            cursor,
            limit,
            botHandle,
            verificationStatus,
            timeRange,
          })
        } else {
          result = await getForYouFeed(userId, {
            cursor,
            limit,
            botHandle,
            verificationStatus,
            timeRange,
          })
        }
        break

      case 'following':
        if (!userId) {
          return NextResponse.json(
            { error: 'Login required for Following feed' },
            { status: 401 }
          )
        }
        result = await getFollowingFeed(userId, { cursor, limit, timeRange })
        break

      default:
        result = await getFeed({
          userId: userId || undefined,
          cursor,
          limit,
          botHandle,
          verificationStatus,
          timeRange,
        })
    }

    // Fetch user's liked/saved post IDs if authenticated
    let likedPostIds: string[] = []
    let savedPostIds: string[] = []

    if (userId && result.posts.length > 0) {
      const postIds = result.posts.map((p: { id: string }) => p.id)

      const [likes, saves] = await Promise.all([
        prisma.like.findMany({
          where: { userId, postId: { in: postIds } },
          select: { postId: true },
        }),
        prisma.save.findMany({
          where: { userId, postId: { in: postIds } },
          select: { postId: true },
        }),
      ])

      likedPostIds = likes.map((l) => l.postId)
      savedPostIds = saves.map((s) => s.postId)
    }

    return NextResponse.json({ ...result, likedPostIds, savedPostIds })
  } catch (error) {
    console.error('Feed API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load feed' },
      { status: 500 }
    )
  }
}
