import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCuratorBot } from '@/lib/openclaw/curator-bot';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const curator = getCuratorBot();

    // 1. Unprocessed count
    const pendingCount = await prisma.rawNews.count({
      where: { isProcessed: false },
    });

    // 2. Processed today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const processedToday = await prisma.rawNews.count({
      where: {
        isProcessed: true,
        curatedAt: { gte: startOfDay },
      },
    });

    // 3. Failed today
    const failedToday = await prisma.rawNews.count({
      where: {
        isProcessed: true,
        curatedAt: { gte: startOfDay },
        curateError: { not: null },
      },
    });

    // 4. Last run at
    const lastRun = await prisma.rawNews.findFirst({
      where: { isProcessed: true, curatedAt: { not: null } },
      orderBy: { curatedAt: 'desc' },
      select: { curatedAt: true },
    });

    return NextResponse.json({
      pendingCount,
      processedToday,
      failedToday,
      isRunning: curator.running,
      lastRunAt: lastRun?.curatedAt || null,
    });
  } catch (err: any) {
    console.error('[API] Curator stats error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
