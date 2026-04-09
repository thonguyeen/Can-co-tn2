import { NextRequest, NextResponse } from 'next/server'
import {
  generatePostFromNews,
  saveGeneratedPost,
  generatePendingPosts,
} from '@/lib/ai/agents/post-generator'
import { detectBreakingNews, getExpiryTime } from '@/lib/ai/agents/breaking-detector'
import { prisma } from '@/lib/db'
import { toSnakeCase } from '@/lib/data/helpers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { raw_news_id, batch_limit, save = true } = body

    if (raw_news_id) {
      // Generate single post
      const { success, post, error } = await generatePostFromNews(raw_news_id)

      if (!success || !post) {
        return NextResponse.json({ success: false, error }, { status: 400 })
      }

      if (save) {
        const saveResult = await saveGeneratedPost(post)

        // Detect breaking news
        let breakingResult = null
        if (saveResult.success && saveResult.postId) {
          breakingResult = await checkAndSaveBreaking(
            saveResult.postId,
            post.content,
            post.botHandle
          )
        }

        return NextResponse.json({
          success: true,
          post: {
            ...post,
            id: saveResult.postId,
          },
          saved: saveResult.success,
          breaking: breakingResult,
        })
      }

      return NextResponse.json({ success: true, post, saved: false })
    } else {
      // Batch generate
      const limit = batch_limit || 5
      const result = await generatePendingPosts(limit)
      return NextResponse.json(result)
    }
  } catch (error) {
    console.error('Generate post API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  // Check if cron job
  const authHeader = req.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    // Run batch generation
    try {
      const result = await generatePendingPosts(3)
      return NextResponse.json({ cron: true, ...result })
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Generation failed' },
        { status: 500 }
      )
    }
  }

  // Get generation stats
  const bots = await prisma.bot.findMany({
    select: {
      id: true,
      name: true,
      handle: true,
      postsCount: true,
      avatarUrl: true,
      colorAccent: true,
    },
  })

  const recentPosts = await prisma.post.findMany({
    select: {
      id: true,
      content: true,
      createdAt: true,
      verificationStatus: true,
      bot: {
        select: { name: true, handle: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const pendingCount = await prisma.rawNews.count({
    where: { isProcessed: false },
  })

  return NextResponse.json({
    bots: toSnakeCase(bots),
    recent_posts: toSnakeCase(recentPosts),
    pending_news: pendingCount,
  })
}

// ═══════════════════════════════════════════════════════════════
// BREAKING NEWS DETECTION
// ═══════════════════════════════════════════════════════════════

async function checkAndSaveBreaking(
  postId: string,
  content: string,
  botHandle: string
): Promise<{ isBreaking: boolean; id?: string } | null> {
  try {
    const detection = await detectBreakingNews(content, botHandle)

    if (!detection.isBreaking) {
      return { isBreaking: false }
    }

    const expiresAt = getExpiryTime(detection.urgencyLevel, detection.expiresInMinutes)

    // Mark post as breaking
    await prisma.post.update({
      where: { id: postId },
      data: { isBreaking: true },
    })

    // Insert breaking news record
    // Note: relatedTopics column not in current schema — omitted
    const breakingNews = await prisma.breakingNews.create({
      data: {
        postId,
        headline: detection.headline,
        summary: detection.summary,
        urgencyLevel: detection.urgencyLevel,
        category: detection.category,
        isActive: true,
        expiresAt,
      },
      select: { id: true },
    })

    return { isBreaking: true, id: breakingNews.id }
  } catch (error) {
    console.error('Breaking detection save error:', error)
    return null
  }
}
