import { NextRequest, NextResponse } from 'next/server'
import {
  verifyNews,
  verifyPendingNews,
} from '@/lib/ai/agents/verification-agent'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { raw_news_id, batch_limit } = body

    if (raw_news_id) {
      // Verify single item
      const result = await verifyNews(raw_news_id)
      return NextResponse.json(result)
    } else {
      // Batch verify pending items
      const limit = batch_limit || 10
      const result = await verifyPendingNews(limit)
      return NextResponse.json(result)
    }
  } catch (error) {
    console.error('Verification API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  // Check if cron job
  const authHeader = req.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    // Run batch verification
    try {
      const result = await verifyPendingNews(5)
      return NextResponse.json({ cron: true, ...result })
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Verification failed' },
        { status: 500 }
      )
    }
  }

  // Otherwise return stats — Prisma version
  const posts = await prisma.post.findMany({
    select: { verificationStatus: true },
  })

  const stats = {
    total: posts.length,
    unverified: posts.filter((p) => p.verificationStatus === 'unverified').length,
    partial: posts.filter((p) => p.verificationStatus === 'partial').length,
    verified: posts.filter((p) => p.verificationStatus === 'verified').length,
    debunked: posts.filter((p) => p.verificationStatus === 'debunked').length,
  }

  // Pending raw news
  const pendingCount = await prisma.rawNews.count({
    where: { isProcessed: false },
  })

  return NextResponse.json({
    stats,
    pending_verification: pendingCount,
  })
}
