// POST /api/openclaw/distribute - Distribute post to channels

import { NextRequest, NextResponse } from 'next/server';
import {
  getDistributionManager,
  isUsingOpenClaw,
  getOpenClawClient,
  ChannelType,
} from '@/lib/openclaw';

interface DistributeRequest {
  postId: string;
  content: string;
  botHandle: string;
  channels?: ChannelType[];
  attachments?: Array<{
    type: 'image' | 'video' | 'audio' | 'file';
    url: string;
    mimeType: string;
    size: number;
  }>;
  scheduledAt?: string; // ISO date string
}

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for automated calls
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Allow if not automated (no auth required for manual calls in dev)
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    if (!isUsingOpenClaw()) {
      return NextResponse.json(
        { error: 'OpenClaw is disabled' },
        { status: 400 }
      );
    }

    const body: DistributeRequest = await request.json();

    if (!body.postId || !body.content || !body.botHandle) {
      return NextResponse.json(
        { error: 'Missing required fields: postId, content, botHandle' },
        { status: 400 }
      );
    }

    // Ensure connected
    const client = getOpenClawClient();
    if (!client.isConnected()) {
      await client.connect();
    }

    const distributionManager = getDistributionManager();

    // Handle scheduled distribution
    if (body.scheduledAt) {
      const scheduledDate = new Date(body.scheduledAt);
      const scheduleId = await distributionManager.scheduleDistribution(
        {
          postId: body.postId,
          content: body.content,
          botHandle: body.botHandle,
          channels: body.channels || [],
          attachments: body.attachments,
        },
        scheduledDate
      );

      return NextResponse.json({
        success: true,
        scheduled: true,
        scheduleId,
        scheduledAt: body.scheduledAt,
      });
    }

    // Immediate distribution
    const result = await distributionManager.distributePost({
      postId: body.postId,
      content: body.content,
      botHandle: body.botHandle,
      channels: body.channels || [],
      attachments: body.attachments,
    });

    const successCount = result.results.filter((r) => r.success).length;
    const failureCount = result.results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      postId: result.postId,
      distributed: {
        total: result.results.length,
        success: successCount,
        failed: failureCount,
      },
      results: result.results,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error('[OpenClaw Distribute] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/openclaw/distribute - Get distribution config
export async function GET() {
  try {
    if (!isUsingOpenClaw()) {
      return NextResponse.json(
        { error: 'OpenClaw is disabled' },
        { status: 400 }
      );
    }

    const distributionManager = getDistributionManager();
    const config = distributionManager.getConfig();

    return NextResponse.json({
      config,
      enabledChannels: Object.entries(config)
        .filter(([, cfg]) => cfg?.enabled)
        .map(([channel]) => channel),
    });
  } catch (error) {
    console.error('[OpenClaw Distribute] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
