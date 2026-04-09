// /api/openclaw/sessions - Manage bot sessions

import { NextRequest, NextResponse } from 'next/server';
import {
  isUsingOpenClaw,
  getOpenClawClient,
  getSessionManager,
  initializeBotSessions,
  BOT_HANDLES,
  FACEBOT_BOTS,
} from '@/lib/openclaw';

// GET /api/openclaw/sessions - List all bot sessions
export async function GET(request: NextRequest) {
  try {
    if (!isUsingOpenClaw()) {
      return NextResponse.json(
        { error: 'OpenClaw is disabled' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');

    const sessionManager = getSessionManager();

    if (handle) {
      // Get specific bot session
      const session = sessionManager.getSession(handle);
      if (!session) {
        return NextResponse.json(
          { error: `Session not found for @${handle}` },
          { status: 404 }
        );
      }
      return NextResponse.json({ session });
    }

    // List all sessions
    const sessions = sessionManager.getAllSessions();
    const initializedHandles = sessionManager.getInitializedHandles();

    return NextResponse.json({
      total: BOT_HANDLES.length,
      initialized: initializedHandles.length,
      sessions: sessions.map((s) => ({
        handle: s.botHandle,
        sessionId: s.sessionId,
        initialized: s.initialized,
        persona: {
          name: s.persona.nameVi,
          category: s.persona.category,
          color: s.persona.color,
        },
      })),
      availableBots: BOT_HANDLES.map((h) => ({
        ...FACEBOT_BOTS[h],
      })),
    });
  } catch (error) {
    console.error('[OpenClaw Sessions] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/openclaw/sessions - Initialize or manage sessions
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for automated calls
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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

    const body = await request.json();
    const action = body.action as string;

    switch (action) {
      case 'initialize_all':
        return initializeAllSessions();
      case 'initialize':
        return initializeSession(body.handle);
      case 'reset':
        return resetSession(body.handle);
      case 'reset_all':
        return resetAllSessions();
      case 'chat':
        return chatWithBot(body.handle, body.message);
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: initialize_all, initialize, reset, reset_all, chat' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[OpenClaw Sessions] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function initializeAllSessions(): Promise<NextResponse> {
  await initializeBotSessions();

  const sessionManager = getSessionManager();
  const initializedHandles = sessionManager.getInitializedHandles();

  return NextResponse.json({
    success: true,
    action: 'initialize_all',
    initialized: initializedHandles.length,
    handles: initializedHandles,
  });
}

async function initializeSession(handle: string): Promise<NextResponse> {
  if (!handle) {
    return NextResponse.json(
      { error: 'handle is required' },
      { status: 400 }
    );
  }

  if (!BOT_HANDLES.includes(handle as typeof BOT_HANDLES[number])) {
    return NextResponse.json(
      { error: `Unknown bot handle: ${handle}` },
      { status: 400 }
    );
  }

  const sessionManager = getSessionManager();
  const session = await sessionManager.initializeBotSession(handle);

  return NextResponse.json({
    success: true,
    action: 'initialize',
    session: {
      handle: session.botHandle,
      sessionId: session.sessionId,
      initialized: session.initialized,
    },
  });
}

async function resetSession(handle: string): Promise<NextResponse> {
  if (!handle) {
    return NextResponse.json(
      { error: 'handle is required' },
      { status: 400 }
    );
  }

  const sessionManager = getSessionManager();
  await sessionManager.resetSession(handle);

  return NextResponse.json({
    success: true,
    action: 'reset',
    handle,
  });
}

async function resetAllSessions(): Promise<NextResponse> {
  const sessionManager = getSessionManager();
  await sessionManager.resetAllSessions();

  return NextResponse.json({
    success: true,
    action: 'reset_all',
  });
}

async function chatWithBot(handle: string, message: string): Promise<NextResponse> {
  if (!handle || !message) {
    return NextResponse.json(
      { error: 'handle and message are required' },
      { status: 400 }
    );
  }

  const sessionManager = getSessionManager();
  const response = await sessionManager.chat(handle, message);

  return NextResponse.json({
    success: true,
    action: 'chat',
    handle,
    message,
    response,
    timestamp: Date.now(),
  });
}
