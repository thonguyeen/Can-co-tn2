import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { processAndReplyToComment } from '@/lib/ai/agents/reply-agent'
import { generateCrossComments } from '@/lib/ai/agents/bot-interactions'

// Rate limiting
let lastRunTime = 0
const MIN_INTERVAL = 30000 // 30 seconds

// GET /api/comments/reply - Get status of pending replies
export async function GET() {
  const pending = await prisma.$queryRaw`
    SELECT
      pr.id,
      pr.status,
      pr.created_at,
      pr.processed_at,
      pr.error_message,
      c.content AS comment_content,
      p.display_name AS user_display_name,
      b.name AS bot_name,
      b.handle AS bot_handle
    FROM pending_replies pr
    LEFT JOIN comments c ON c.id = pr.comment_id
    LEFT JOIN profiles p ON p.id = c.user_id
    LEFT JOIN bots b ON b.id = pr.bot_id
    ORDER BY pr.created_at DESC
    LIMIT 20
  ` as Array<Record<string, unknown>>

  // Get counts by status
  const stats = await prisma.$queryRaw`
    SELECT status, COUNT(*)::int AS count
    FROM pending_replies
    GROUP BY status
  ` as Array<{ status: string; count: number }>

  const statusCounts = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  }

  stats.forEach((row) => {
    if (row.status in statusCounts) {
      statusCounts[row.status as keyof typeof statusCounts] = row.count
    }
  })

  return NextResponse.json({
    pending_replies: pending,
    stats: statusCounts,
    last_run: lastRunTime ? new Date(lastRunTime).toISOString() : null,
  })
}

// POST /api/comments/reply - Process pending bot replies (cron job)
export async function POST(request: NextRequest) {
  // Rate limiting
  const now = Date.now()
  if (now - lastRunTime < MIN_INTERVAL) {
    return NextResponse.json(
      { message: 'Rate limited', retry_after: MIN_INTERVAL - (now - lastRunTime) },
      { status: 429 }
    )
  }
  lastRunTime = now

  const body = await request.json().catch(() => ({}))
  const { batch_limit = 5, include_cross_comments = true } = body

  const results: {
    commentId: string
    replyId?: string
    error?: string
  }[] = []

  try {
    // 1. Get pending replies (pending_replies is a non-Prisma table, use raw query)
    const pendingReplies = await prisma.$queryRaw`
      SELECT id, comment_id, bot_id
      FROM pending_replies
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT ${batch_limit}
    ` as Array<{ id: string; comment_id: string; bot_id: string }>

    // 2. Process each pending reply
    for (const pending of pendingReplies) {
      // Mark as processing
      await prisma.$executeRaw`
        UPDATE pending_replies SET status = 'processing' WHERE id = ${pending.id}
      `

      try {
        // Generate and save reply
        const result = await processAndReplyToComment(pending.comment_id)

        if (result.success) {
          // Mark as completed
          await prisma.$executeRaw`
            UPDATE pending_replies
            SET status = 'completed', processed_at = NOW()
            WHERE id = ${pending.id}
          `

          results.push({
            commentId: pending.comment_id,
            replyId: result.replyId,
          })
        } else {
          throw new Error(result.error || 'Reply generation failed')
        }
      } catch (err) {
        // Mark as failed
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        await prisma.$executeRaw`
          UPDATE pending_replies
          SET status = 'failed', error_message = ${errorMsg}, processed_at = NOW()
          WHERE id = ${pending.id}
        `

        results.push({
          commentId: pending.comment_id,
          error: errorMsg,
        })
      }

      // Delay between replies
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // 3. Process cross-comments for recent bot posts (optional)
    let crossCommentResults = null
    if (include_cross_comments) {
      const recentPosts = await prisma.post.findMany({
        where: {
          createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        select: { id: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      })

      if (recentPosts.length > 0) {
        const randomPost = recentPosts[Math.floor(Math.random() * recentPosts.length)]
        crossCommentResults = await generateCrossComments(randomPost.id)
      }
    }

    return NextResponse.json({
      processed: results.filter((r) => r.replyId).length,
      failed: results.filter((r) => r.error).length,
      results,
      cross_comments: crossCommentResults,
    })
  } catch (error) {
    console.error('Reply processing error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Processing failed' },
      { status: 500 }
    )
  }
}
