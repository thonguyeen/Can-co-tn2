import { NextRequest, NextResponse } from 'next/server'
import { crawlSingleSource } from '@/lib/crawler/crawler-manager'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  try {
    const { sourceId } = await params
    const result = await crawlSingleSource(sourceId)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Crawl failed' },
      { status: 500 }
    )
  }
}
