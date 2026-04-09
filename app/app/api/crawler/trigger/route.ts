import { NextRequest, NextResponse } from 'next/server';
import { getRealEstateCrawler } from '@/lib/openclaw/real-estate-crawler';
import { prisma } from '@/lib/db';
import { toSnakeCase } from '@/lib/data/helpers';

// POST /api/crawler/trigger
// Body: { sourceId?: string } — sourceId → cào 1 nguồn; không có → cào tất cả
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sourceId } = body as { sourceId?: string };

    const crawler = getRealEstateCrawler();

    console.log(
      `[API Crawler] Trigger: ${sourceId ? `source ${sourceId}` : 'all sources'}`,
    );

    const result = sourceId
      ? await crawler.crawlSourceById(sourceId)
      : await crawler.crawlAll();

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err) {
    console.error('[API Crawler] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}

// GET /api/crawler/trigger — Status check (sources overview)
export async function GET() {
  try {
    const sources = await prisma.crawlSource.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        sourceType: true,
        isActive: true,
        lastCrawledAt: true,
        totalItemsCrawled: true,
      },
      orderBy: { name: 'asc' },
    });

    const mapped = toSnakeCase(sources);

    return NextResponse.json({
      total: mapped.length,
      active: mapped.filter((s: { is_active: boolean | null }) => s.is_active).length,
      sources: mapped,
    });
  } catch (err) {
    console.error('[API Crawler] GET Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
