import { NextRequest, NextResponse } from 'next/server';
import {
  createTrigger,
  getUserTriggers,
  toggleTrigger,
  deleteTrigger,
  PRESET_TRIGGERS,
  AlertTrigger,
} from '@/lib/intelligence/alerts/custom-triggers';

// GET: Get user triggers
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const triggers = await getUserTriggers(userId);
    return NextResponse.json({ success: true, triggers, presets: PRESET_TRIGGERS });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}

// POST: Create trigger
export async function POST(req: NextRequest) {
  try {
    const { userId, trigger, presetIndex } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    let newTrigger: AlertTrigger;

    if (presetIndex !== undefined && PRESET_TRIGGERS[presetIndex]) {
      newTrigger = await createTrigger(userId, PRESET_TRIGGERS[presetIndex]);
    } else if (trigger) {
      newTrigger = await createTrigger(userId, trigger);
    } else {
      return NextResponse.json({ error: 'trigger or presetIndex required' }, { status: 400 });
    }

    return NextResponse.json({ success: true, trigger: newTrigger });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}

// PATCH: Toggle trigger
export async function PATCH(req: NextRequest) {
  try {
    const { triggerId, isActive } = await req.json();

    if (!triggerId) {
      return NextResponse.json({ error: 'triggerId required' }, { status: 400 });
    }

    await toggleTrigger(triggerId, isActive);
    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}

// DELETE: Delete trigger
export async function DELETE(req: NextRequest) {
  try {
    const { triggerId } = await req.json();

    if (!triggerId) {
      return NextResponse.json({ error: 'triggerId required' }, { status: 400 });
    }

    await deleteTrigger(triggerId);
    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}
