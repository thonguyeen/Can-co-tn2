import { NextRequest, NextResponse } from 'next/server';
import { getOrchestrator } from '@/lib/openclaw/orchestrator';
import { getRealEstateCrawler } from '@/lib/openclaw/real-estate-crawler';

// Allow this route to run up to 60 seconds on Vercel
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // 1. Vercel Cron Authentication
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized CRON execution' },
      { status: 401 }
    );
  }

  try {
    console.log('[CRON] Starting cron execution run...');
    
    // 2. Start Orchestrator if it isn't running already
    const orchestrator = getOrchestrator();
    let orchestratorStarted = false;
    
    if (!orchestrator.getStatus().isRunning) {
      console.log('[CRON] Triggering orchestrator startup...');
      await orchestrator.start();
      orchestratorStarted = true;
    } else {
      // In Serverless environments, background setIntervals are unpredictable.
      // Force trigger manual bot actions to ensure activity.
      console.log('[CRON] Orchestrator already running, triggering random post manual fallback...');
      await orchestrator.triggerRandomPost();
    }

    // 3. Trigger crawling of Real Estate sources
    const crawler = getRealEstateCrawler();
    console.log('[CRON] Starting Real Estate multi-source crawler...');
    const crawlerResult = await crawler.crawlAll();
    
    console.log('[CRON] Complete!', {
      crawlerSaved: crawlerResult.itemsSaved,
      crawlerDupe: crawlerResult.itemsDuplicate
    });

    return NextResponse.json({
      success: true,
      message: 'CRON successful',
      data: {
        crawlerResult,
        orchestratorState: {
          isRunning: orchestrator.getStatus().isRunning,
          justStarted: orchestratorStarted,
          mode: orchestrator.isDryRun() ? 'test' : 'live'
        }
      }
    });
  } catch (error: any) {
    console.error('[CRON] Error during cron execution:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
