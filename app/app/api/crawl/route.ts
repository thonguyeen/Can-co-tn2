import { NextRequest, NextResponse } from 'next/server'
import {
  crawlAllSources as crawlLegacySources,
  crawlSingleSource,
} from '@/lib/crawler/crawler-manager'
import { crawlAllSources, crawlPlatform } from '@/lib/crawlers/unified-crawler'
import { SourcePlatform } from '@/lib/crawlers/source-registry'
import { prisma } from '@/lib/db'
import { toSnakeCase } from '@/lib/data/helpers'

export const maxDuration = 300 // 5 minutes timeout

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { source_id, platforms } = body as {
      source_id?: string
      platforms?: SourcePlatform[]
    }

    // Phase 9: Platform-based crawling (new unified system)
    if (platforms) {
      const summary = await crawlAllSources(platforms)
      return NextResponse.json({ success: true, summary })
    }

    // Legacy: Single source or all sources
    let results

    if (source_id) {
      const result = await crawlSingleSource(source_id)
      results = [result]
    } else {
      results = await crawlLegacySources()
    }

    const summary = {
      total_sources: results.length,
      successful: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'failed').length,
      total_articles_found: results.reduce(
        (sum, r) => sum + r.articles_found,
        0
      ),
      total_articles_new: results.reduce((sum, r) => sum + r.articles_new, 0),
      total_duration_ms: results.reduce((sum, r) => sum + r.duration_ms, 0),
    }

    return NextResponse.json({
      success: true,
      summary,
      results,
    })
  } catch (error) {
    console.error('Crawl error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Crawl failed' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const platform = searchParams.get('platform') as SourcePlatform | null

  // Phase 9: Platform-specific crawl via query param
  if (platform) {
    try {
      const summary = await crawlPlatform(platform)
      return NextResponse.json({ success: true, summary })
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Crawl failed' },
        { status: 500 }
      )
    }
  }

  // Check if this is a cron job
  const authHeader = req.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    try {
      const summary = await crawlAllSources()
      return NextResponse.json({ success: true, summary })
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Crawl failed' },
        { status: 500 }
      )
    }
  }

  // Otherwise return status — migrate from supabase to prisma
  const logs = await prisma.crawlLog.findMany({
    include: {
      source: { select: { name: true } },
    },
    orderBy: { startedAt: 'desc' },
    take: 50,
  })

  const sources = await prisma.source.findMany({
    select: { id: true, name: true, lastCrawledAt: true, isActive: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({
    recent_logs: toSnakeCase(logs),
    sources: toSnakeCase(sources),
  })
}
