import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { injectIntentFromRawNews } from '@/lib/ai/agents/intent-injector'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { raw_news_id, batch_limit = 5 } = body

    if (raw_news_id) {
      // 1. Generate single intent from a known raw_news_id
      const result = await injectIntentFromRawNews(raw_news_id)

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 })
      }
      return NextResponse.json({ success: true, intentId: result.intentId })
    } else {
      // 2. Batch process multiple raw_news items
      const unprocessedNews = await prisma.rawNews.findMany({
        where: { isProcessed: false },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
        take: batch_limit,
      })

      if (unprocessedNews.length === 0) {
        return NextResponse.json({ success: true, generated: 0, message: "Không có tin báo/bđs thô mới" })
      }

      const results: { rawNewsId: string; intentId?: string; error?: string }[] = []

      for (const news of unprocessedNews) {
        const injectRes = await injectIntentFromRawNews(news.id)
        if (injectRes.success) {
             results.push({ rawNewsId: news.id, intentId: injectRes.intentId })
        } else {
             results.push({ rawNewsId: news.id, error: injectRes.error })
        }
        // sleep 1.5s to bypass rate limits
        await new Promise(r => setTimeout(r, 1500))
      }

      return NextResponse.json({
        success: true,
        generated: results.filter((r) => r.intentId).length,
        results
      })
    }
  } catch (error) {
    console.error('Inject intent API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Injection failed' },
      { status: 500 }
    )
  }
}
