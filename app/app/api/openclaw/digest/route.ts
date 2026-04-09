import { NextRequest, NextResponse } from 'next/server';
import { sendScheduledDigests, sendDigestToUser } from '@/lib/openclaw/digest-scheduler';
import { OpenClawChannel } from '@/lib/openclaw/types';

export const maxDuration = 120; // 2 minutes

// GET: Cron trigger for digest (called every 30 minutes)
export async function GET(req: NextRequest) {
  // Verify cron secret (optional)
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await sendScheduledDigests();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Digest cron error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Digest failed' },
      { status: 500 }
    );
  }
}

// POST: Manual trigger for specific user
export async function POST(req: NextRequest) {
  try {
    const { userId, channel, channelId } = await req.json();

    if (!userId || !channel || !channelId) {
      return NextResponse.json(
        { error: 'userId, channel, and channelId required' },
        { status: 400 }
      );
    }

    const success = await sendDigestToUser(
      userId,
      channel as OpenClawChannel,
      channelId
    );

    return NextResponse.json({ success });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}
