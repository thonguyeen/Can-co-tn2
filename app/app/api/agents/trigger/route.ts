import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { orchestrate, executeActions } from '@/lib/agents/orchestrator';
import type { Intent } from '@/lib/engine/types';

// POST /api/agents/trigger — run orchestrator for an event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, intent_id, context } = body;

    if (!event) {
      return NextResponse.json({ error: 'event required' }, { status: 400 });
    }

    let intentData: Intent | undefined;
    if (intent_id) {
      const data = await prisma.intent.findUnique({
        where: { id: intent_id },
      });
      if (data) intentData = data as unknown as Intent;
    }

    const actions = await orchestrate({
      event,
      intentId: intent_id,
      intentData,
      context,
    });

    if (actions.length > 0) {
      await executeActions(actions);
    }

    return NextResponse.json({
      actions: actions.map((a) => ({ botId: a.botId, reason: a.reason })),
      count: actions.length,
    });
  } catch (err) {
    console.error('Agent trigger error:', err);
    return NextResponse.json({ error: 'Agent trigger failed' }, { status: 500 });
  }
}
