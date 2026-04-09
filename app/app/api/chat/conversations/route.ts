import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/data/get-user';
import { prisma } from '@/lib/db';
import { toSnakeCase } from '@/lib/data/helpers';

// GET /api/chat/conversations — list user's conversations with preview
export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch conversations where user is participant
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ userA: userId }, { userB: userId }],
    },
    include: {
      intent: {
        select: { id: true, title: true, type: true, rawText: true },
      },
    },
    orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
  });

  if (conversations.length === 0) {
    return NextResponse.json([]);
  }

  // Collect IDs for batch fetch
  const otherUserIds = [...new Set(
    conversations.map((c) => (c.userA === userId ? c.userB : c.userA))
  )];
  const convIds = conversations.map((c) => c.id);

  // Batch fetch: profiles + all messages for these conversations
  const [profiles, messages, unreadMessages] = await Promise.all([
    prisma.profile.findMany({
      where: { id: { in: otherUserIds } },
      select: { id: true, displayName: true, avatarUrl: true },
    }),
    // Get all messages ordered desc to pick latest per conversation
    prisma.message.findMany({
      where: { conversationId: { in: convIds } },
      orderBy: { createdAt: 'desc' },
      select: { conversationId: true, content: true, createdAt: true, senderId: true },
    }),
    // Count unread messages
    prisma.message.findMany({
      where: {
        conversationId: { in: convIds },
        senderId: { not: userId },
        readAt: null,
      },
      select: { conversationId: true },
    }),
  ]);

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastMessageMap = new Map<string, any>();
  for (const msg of messages) {
    if (!lastMessageMap.has(msg.conversationId)) {
      lastMessageMap.set(msg.conversationId, msg);
    }
  }

  const unreadMap = new Map<string, number>();
  for (const u of unreadMessages) {
    unreadMap.set(u.conversationId, (unreadMap.get(u.conversationId) || 0) + 1);
  }

  const enriched = conversations.map((conv) => {
    const otherUserId = conv.userA === userId ? conv.userB : conv.userA;
    const profile = profileMap.get(otherUserId);
    const lastMessage = lastMessageMap.get(conv.id);

    return {
      id: conv.id,
      intent_id: conv.intentId,
      intent: conv.intent
        ? {
            id: conv.intent.id,
            title: conv.intent.title,
            type: conv.intent.type,
            raw_text: conv.intent.rawText,
          }
        : null,
      other_party: {
        id: otherUserId,
        name: profile?.displayName || 'Người dùng',
        avatar_url: profile?.avatarUrl || null,
      },
      last_message: lastMessage
        ? {
            conversation_id: lastMessage.conversationId,
            content: lastMessage.content,
            created_at: lastMessage.createdAt,
            sender_id: lastMessage.senderId,
          }
        : null,
      unread_count: unreadMap.get(conv.id) || 0,
      last_message_at: conv.lastMessageAt,
      created_at: conv.createdAt,
    };
  });

  return NextResponse.json(enriched);
}

// POST /api/chat/conversations — create or find conversation
export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { intent_id, other_user_id } = body;

  if (!other_user_id) {
    return NextResponse.json({ error: 'other_user_id required' }, { status: 400 });
  }

  if (other_user_id === userId) {
    return NextResponse.json({ error: 'Không thể chat với chính mình' }, { status: 400 });
  }

  // Check if conversation already exists (either direction)
  const existing = await prisma.conversation.findFirst({
    where: {
      OR: [
        { userA: userId, userB: other_user_id, intentId: intent_id || null },
        { userA: other_user_id, userB: userId, intentId: intent_id || null },
      ],
    },
  });

  if (existing) {
    return NextResponse.json(toSnakeCase(existing));
  }

  // Also check with intent_id for specific intent-based chat
  if (intent_id) {
    const existingForIntent = await prisma.conversation.findFirst({
      where: {
        intentId: intent_id,
        OR: [
          { userA: userId, userB: other_user_id },
          { userA: other_user_id, userB: userId },
        ],
      },
    });

    if (existingForIntent) {
      return NextResponse.json(toSnakeCase(existingForIntent));
    }
  }

  try {
    const conversation = await prisma.conversation.create({
      data: {
        intentId: intent_id || null,
        userA: userId,
        userB: other_user_id,
      },
    });

    return NextResponse.json(toSnakeCase(conversation), { status: 201 });
  } catch (error: unknown) {
    // Unique constraint violated — conversation exists (race condition)
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      const found = await prisma.conversation.findFirst({
        where: {
          OR: [
            { userA: userId, userB: other_user_id },
            { userA: other_user_id, userB: userId },
          ],
        },
      });
      if (found) return NextResponse.json(toSnakeCase(found));
    }
    console.error('Create conversation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
