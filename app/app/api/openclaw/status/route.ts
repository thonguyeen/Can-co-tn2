// GET /api/openclaw/status - Check OpenClaw connection status

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const useOpenClaw = process.env.USE_OPENCLAW === 'true';
    const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789';

    // Don't actually try to connect - just report config status
    return NextResponse.json({
      enabled: useOpenClaw,
      configured: {
        gateway: gatewayUrl,
        hasOpenClawEnv: !!process.env.USE_OPENCLAW,
        telegramConfigured: !!process.env.TELEGRAM_CHANNEL_ID,
        discordConfigured: !!process.env.DISCORD_CHANNEL_ID,
      },
      message: useOpenClaw
        ? 'OpenClaw is enabled. Make sure Gateway is running at ' + gatewayUrl
        : 'OpenClaw is disabled. Set USE_OPENCLAW=true to enable.',
      instructions: {
        install: 'npm install -g openclaw@latest',
        setup: 'openclaw onboard --install-daemon',
        start: 'openclaw gateway --port 18789 --verbose',
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[OpenClaw Status] Error:', error);
    return NextResponse.json(
      {
        enabled: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
