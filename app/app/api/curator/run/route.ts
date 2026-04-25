// @ts-nocheck
import { NextResponse } from 'next/server';
import { getCuratorBot } from '@/lib/openclaw/curator-bot';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Phase 04 Auth Check (temporary simplified for Phase 03)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'dev_secret'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let limit = 10;
    try {
      const body = await request.json();
      if (body.limit && typeof body.limit === 'number') {
        limit = Math.min(body.limit, 100); // Max 100 per run
      }
    } catch (e) {
      // Ignore JSON parse error, use default limit
    }

    const curator = getCuratorBot();
    
    // Check if already running to return early 429
    if (curator.running) {
      return NextResponse.json(
        { error: 'Curator is already running. Please try again later.' },
        { status: 429 }
      );
    }

    // Run curator asynchronously or synchronously depending on needs.
    // For manual trigger, we await it to return stats.
    const result = await curator.processUnprocessedNews(limit);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error('[API] Curator run error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
