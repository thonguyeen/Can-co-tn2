import { NextRequest, NextResponse } from 'next/server';
import {
  runHourlyProactiveTasks,
  runDailyMaintenanceTasks,
  runWeeklyAnalyticsTasks,
} from '@/lib/intelligence/proactive/scheduler';

export const maxDuration = 120;

// GET: Cron trigger
export async function GET(req: NextRequest) {
  const taskType = req.nextUrl.searchParams.get('task') || 'hourly';

  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let results;

    switch (taskType) {
      case 'daily':
        results = await runDailyMaintenanceTasks();
        break;
      case 'weekly':
        results = await runWeeklyAnalyticsTasks();
        break;
      case 'hourly':
      default:
        results = await runHourlyProactiveTasks();
        break;
    }

    const totalProcessed = results.reduce((sum, r) => sum + r.processed, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    return NextResponse.json({
      success: true,
      taskType,
      results,
      summary: {
        totalProcessed,
        totalErrors,
        totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Proactive scheduler error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Task failed' },
      { status: 500 }
    );
  }
}
