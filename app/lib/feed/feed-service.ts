import { prisma } from '@/lib/db'
import { toSnakeCase } from '@/lib/data/helpers'
import {
  rankPosts,
  ScoringContext,
  ScoredPost,
  DEFAULT_WEIGHTS,
  PostForScoring,
} from './scoring'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface FeedOptions {
  userId?: string
  cursor?: string
  limit?: number
  botHandle?: string
  verificationStatus?: string
  timeRange?: 'day' | 'week' | 'month' | 'all'
}

export interface FeedResult {
  posts: ScoredPost[]
  nextCursor: string | null
  hasMore: boolean
  meta: {
    total: number
    filters: {
      botHandle?: string
      verificationStatus?: string
      timeRange?: string
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN FEED FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function getFeed(options: FeedOptions = {}): Promise<FeedResult> {
  const {
    userId,
    cursor,
    limit = 20,
    botHandle,
    verificationStatus,
    timeRange = 'all',
  } = options

  // 1. Build scoring context (personalization data)
  const context = await buildScoringContext(userId)

  // 2. Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}

  // 3. Apply filters
  if (botHandle) {
    const bot = await prisma.bot.findUnique({
      where: { handle: botHandle },
      select: { id: true },
    })
    if (bot) {
      where.botId = bot.id
    }
  }

  if (verificationStatus) {
    where.verificationStatus = verificationStatus
  }

  if (timeRange !== 'all') {
    const since = getTimeRangeSince(timeRange)
    where.createdAt = { gte: since }
  }

  // 4. Fetch more posts than needed for proper ranking after scoring
  const fetchLimit = limit * 3

  const posts = await prisma.post.findMany({
    where,
    include: {
      bot: {
        select: {
          id: true,
          name: true,
          handle: true,
          avatarUrl: true,
          colorAccent: true,
          expertise: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: fetchLimit,
  })

  if (posts.length === 0) {
    return {
      posts: [],
      nextCursor: null,
      hasMore: false,
      meta: { total: 0, filters: { botHandle, verificationStatus, timeRange } },
    }
  }

  // 5. Convert to snake_case for scoring engine compatibility
  const postsSnake = posts.map((p) => toSnakeCase(p))

  // 6. Score and rank posts
  const rankedPosts = rankPosts(postsSnake as unknown as PostForScoring[], context)

  // 7. Apply cursor-based pagination
  let startIndex = 0
  if (cursor) {
    const cursorIndex = rankedPosts.findIndex((p) => p.id === cursor)
    if (cursorIndex !== -1) {
      startIndex = cursorIndex + 1
    }
  }

  const paginatedPosts = rankedPosts.slice(startIndex, startIndex + limit)
  const hasMore = startIndex + limit < rankedPosts.length
  const nextCursor = hasMore
    ? paginatedPosts[paginatedPosts.length - 1]?.id
    : null

  return {
    posts: paginatedPosts,
    nextCursor,
    hasMore,
    meta: {
      total: rankedPosts.length,
      filters: { botHandle, verificationStatus, timeRange },
    },
  }
}

// ═══════════════════════════════════════════════════════════════
// SCORING CONTEXT BUILDER
// ═══════════════════════════════════════════════════════════════

async function buildScoringContext(userId?: string): Promise<ScoringContext> {
  const context: ScoringContext = {
    followedBotIds: new Set(),
    interactedPostIds: new Set(),
    weights: DEFAULT_WEIGHTS,
  }

  if (!userId) {
    return context
  }

  // Get followed bots
  const follows = await prisma.follow.findMany({
    where: { userId },
    select: { botId: true },
  })
  follows.forEach((f) => context.followedBotIds.add(f.botId))

  // Get interacted posts (liked, saved, commented)
  const [likes, saves, comments] = await Promise.all([
    prisma.like.findMany({
      where: { userId },
      select: { postId: true },
    }),
    prisma.save.findMany({
      where: { userId },
      select: { postId: true },
    }),
    prisma.comment.findMany({
      where: { userId },
      select: { postId: true },
    }),
  ])

  ;[likes, saves, comments].forEach((items) => {
    items.forEach((item) => context.interactedPostIds.add(item.postId))
  })

  return context
}

// ═══════════════════════════════════════════════════════════════
// TRENDING POSTS
// ═══════════════════════════════════════════════════════════════

export async function getTrendingPosts(limit: number = 5): Promise<ScoredPost[]> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const posts = await prisma.post.findMany({
    where: {
      createdAt: { gte: since },
    },
    include: {
      bot: {
        select: {
          name: true,
          handle: true,
          avatarUrl: true,
          colorAccent: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  if (posts.length === 0) {
    return []
  }

  // Convert to snake_case for scoring engine
  const postsSnake = posts.map((p) => toSnakeCase(p))

  // Score with engagement-heavy weights for trending
  const trendingWeights = {
    ...DEFAULT_WEIGHTS,
    freshness: { ...DEFAULT_WEIGHTS.freshness, halfLifeHours: 6 },
    engagement: { ...DEFAULT_WEIGHTS.engagement, maxMultiplier: 3.0 },
  }

  const context: ScoringContext = {
    followedBotIds: new Set(),
    interactedPostIds: new Set(),
    weights: trendingWeights,
  }

  const ranked = rankPosts(postsSnake as unknown as PostForScoring[], context)

  return ranked.slice(0, limit)
}

// ═══════════════════════════════════════════════════════════════
// FOR YOU FEED (Personalized)
// ═══════════════════════════════════════════════════════════════

export async function getForYouFeed(
  userId: string,
  options: Omit<FeedOptions, 'userId'> = {}
): Promise<FeedResult> {
  return getFeed({ ...options, userId })
}

// ═══════════════════════════════════════════════════════════════
// FOLLOWING FEED (Only from followed bots)
// ═══════════════════════════════════════════════════════════════

export async function getFollowingFeed(
  userId: string,
  options: Omit<FeedOptions, 'userId'> = {}
): Promise<FeedResult> {
  // Get followed bot IDs
  const follows = await prisma.follow.findMany({
    where: { userId },
    select: { botId: true },
  })

  if (follows.length === 0) {
    return {
      posts: [],
      nextCursor: null,
      hasMore: false,
      meta: { total: 0, filters: {} },
    }
  }

  const botIds = follows.map((f) => f.botId)

  const { cursor, limit = 20, timeRange = 'all' } = options

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    botId: { in: botIds },
  }

  if (timeRange !== 'all') {
    const since = getTimeRangeSince(timeRange)
    where.createdAt = { gte: since }
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      bot: {
        select: {
          id: true,
          name: true,
          handle: true,
          avatarUrl: true,
          colorAccent: true,
          expertise: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit * 2,
  })

  if (posts.length === 0) {
    return {
      posts: [],
      nextCursor: null,
      hasMore: false,
      meta: { total: 0, filters: {} },
    }
  }

  // Convert to snake_case for scoring engine
  const postsSnake = posts.map((p) => toSnakeCase(p))

  const context = await buildScoringContext(userId)
  const ranked = rankPosts(postsSnake as unknown as PostForScoring[], context)

  let startIndex = 0
  if (cursor) {
    const idx = ranked.findIndex((p) => p.id === cursor)
    if (idx !== -1) startIndex = idx + 1
  }

  const paginated = ranked.slice(startIndex, startIndex + limit)
  const hasMore = startIndex + limit < ranked.length

  return {
    posts: paginated,
    nextCursor: hasMore ? paginated[paginated.length - 1]?.id : null,
    hasMore,
    meta: { total: ranked.length, filters: { timeRange } },
  }
}

function getTimeRangeSince(range: string): Date {
  const now = new Date()
  switch (range) {
    case 'day':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    default:
      return new Date(0)
  }
}
