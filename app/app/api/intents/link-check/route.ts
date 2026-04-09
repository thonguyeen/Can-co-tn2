import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

// Check if a URL is still alive (HTTP HEAD first, fallback to GET if blocked)
async function checkUrlAlive(url: string): Promise<{ alive: boolean; status: number }> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    // Try HEAD first (lightweight, no content downloaded)
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CanCo-LinkChecker/1.0)' },
      redirect: 'follow',
    })

    clearTimeout(timeout)

    // Some servers (VnExpress etc.) return 405/406 for HEAD — fallback to GET
    if (res.status === 405 || res.status === 406) {
      const controller2 = new AbortController()
      const timeout2 = setTimeout(() => controller2.abort(), 8000)

      const res2 = await fetch(url, {
        method: 'GET',
        signal: controller2.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CanCo-LinkChecker/1.0)' },
        redirect: 'follow',
      })

      clearTimeout(timeout2)
      return { alive: res2.ok, status: res2.status }
    }

    return { alive: res.ok, status: res.status }
  } catch {
    return { alive: false, status: 0 }
  }
}

// POST /api/intents/link-check — Batch check all crawled intent links
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { batch_limit = 20 } = body

    // Find all active intents with parsed_data
    const intents = await prisma.intent.findMany({
      where: {
        status: 'active',
        NOT: { parsedData: { equals: Prisma.DbNull } },
      },
      select: { id: true, parsedData: true },
      take: 500,
    })

    // Filter to only crawled intents (have source field) that aren't already marked dead
    const crawledIntents = intents.filter((i) => {
      const pd = i.parsedData as Record<string, unknown>
      return pd?.source && pd?.original_url && !pd?.source_dead
    }).slice(0, batch_limit)

    if (crawledIntents.length === 0) {
      return NextResponse.json({ success: true, checked: 0, dead: 0, message: 'Không có link nào cần kiểm tra' })
    }

    const results: { intentId: string; url: string; alive: boolean; status: number }[] = []

    for (const intent of crawledIntents) {
      const pd = intent.parsedData as Record<string, unknown>
      const url = pd.original_url as string

      const { alive, status } = await checkUrlAlive(url)
      results.push({ intentId: intent.id, url, alive, status })

      // If dead, update parsed_data with source_dead flag
      if (!alive) {
        const updatedParsedData = { ...pd, source_dead: true, source_dead_checked_at: new Date().toISOString() }
        await prisma.intent.update({
          where: { id: intent.id },
          data: { parsedData: updatedParsedData },
        })
      }

      // Small delay between requests to be polite
      await new Promise(r => setTimeout(r, 300))
    }

    const deadCount = results.filter(r => !r.alive).length

    return NextResponse.json({
      success: true,
      checked: results.length,
      alive: results.filter(r => r.alive).length,
      dead: deadCount,
      results,
    })
  } catch (error) {
    console.error('Link check error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Link check failed' },
      { status: 500 }
    )
  }
}

// GET /api/intents/link-check — Status/stats
export async function GET() {
  const intents = await prisma.intent.findMany({
    where: {
      status: 'active',
      NOT: { parsedData: { equals: Prisma.DbNull } },
    },
    select: { parsedData: true },
  })

  const crawled = intents.filter(i => (i.parsedData as Record<string, unknown>)?.source)
  const dead = crawled.filter(i => (i.parsedData as Record<string, unknown>)?.source_dead)

  return NextResponse.json({
    total_crawled_intents: crawled.length,
    alive: crawled.length - dead.length,
    dead: dead.length,
    message: dead.length > 0
      ? `⚠️ ${dead.length} nguồn đã bị gỡ/thay đổi`
      : '✅ Tất cả nguồn đều hoạt động tốt',
  })
}
