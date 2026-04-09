import { NextResponse } from 'next/server';

// GET /api/agents/cron/nudge — nudge stale intents
export async function GET() {
  // In production: find intents > 7 days with 0 matches, create nudge comments
  return NextResponse.json({
    status: 'ok',
    message: 'Nudge cron would run here',
    stale_intents: 0,
    nudges_sent: 0,
  });
}
