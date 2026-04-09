import { NextResponse } from 'next/server';
import { BOT_PERSONAS } from '@/lib/agents/personas';

// GET /api/agents/status — all bots with mock stats
export async function GET() {
  const bots = BOT_PERSONAS.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    title: p.title,
    color: p.color,
    isActive: p.isActive,
    // Mock stats for demo
    commentCount: [24, 18, 6, 12, 8, 5][BOT_PERSONAS.indexOf(p)] ?? 10,
    lastActive: new Date(new Date('2026-03-22T08:00:00Z').getTime() - [5, 30, 120, 15, 60, 180][BOT_PERSONAS.indexOf(p)] * 60 * 1000).toISOString(),
  }));

  return NextResponse.json({ bots });
}
