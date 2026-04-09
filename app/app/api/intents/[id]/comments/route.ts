import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/data/get-user';

// GET /api/intents/[id]/comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const data = await prisma.intentComment.findMany({
    where: { intentId: id },
    orderBy: { createdAt: 'asc' },
  });

  // Convert to snake_case for frontend
  const response = data.map((c) => ({
    id: c.id,
    intent_id: c.intentId,
    user_id: c.userId,
    bot_name: c.botName,
    content: c.content,
    is_bot: c.isBot,
    parent_id: c.parentId,
    created_at: c.createdAt,
  }));

  return NextResponse.json(response);
}

// POST /api/intents/[id]/comments
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAuth(request);
  if ('error' in auth) return auth.error;
  const { userId } = auth;

  const body = await request.json();
  const { content, parent_id } = body;

  if (!content) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  const data = await prisma.intentComment.create({
    data: {
      intentId: id,
      userId,
      content,
      parentId: parent_id || null,
      isBot: false,
    },
  });

  // Increment comment count (atomic)
  await prisma.intent.update({
    where: { id },
    data: { commentCount: { increment: 1 } },
  });

  // Convert to snake_case for frontend
  return NextResponse.json({
    id: data.id,
    intent_id: data.intentId,
    user_id: data.userId,
    bot_name: data.botName,
    content: data.content,
    is_bot: data.isBot,
    parent_id: data.parentId,
    created_at: data.createdAt,
  }, { status: 201 });
}
