import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/data/get-user';
import { prisma } from '@/lib/db';
import { toSnakeCase } from '@/lib/data/helpers';

// GET /api/chat/[id]/messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const before = searchParams.get('before');

  const messages = await prisma.message.findMany({
    where: {
      conversationId: id,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  // Mark other person's messages as read (fire-and-forget side effect)
  prisma.message
    .updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    })
    .catch(() => {});

  return NextResponse.json(toSnakeCase(messages));
}

// POST /api/chat/[id]/messages — send message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { content } = body;

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: 'Nội dung không được trống' }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: 'Tin nhắn quá dài (tối đa 2000 ký tự)' }, { status: 400 });
  }

  // Insert message
  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: userId,
      content: content.trim(),
    },
  });

  // Update conversation last_message_at
  await prisma.conversation.update({
    where: { id },
    data: { lastMessageAt: new Date() },
  });

  // Create notification for recipient (fire-and-forget)
  createMessageNotification(id, userId, content.trim()).catch(() => {});

  return NextResponse.json(toSnakeCase(message), { status: 201 });
}

async function createMessageNotification(
  conversationId: string,
  senderId: string,
  content: string,
) {
  // Get conversation to find recipient
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { userA: true, userB: true },
  });

  if (!conv) return;

  const recipientId = conv.userA === senderId ? conv.userB : conv.userA;

  // Get sender name
  const profile = await prisma.profile.findUnique({
    where: { id: senderId },
    select: { displayName: true },
  });

  const senderName = profile?.displayName || 'Người dùng';

  await prisma.notification.create({
    data: {
      userId: recipientId,
      type: 'new_message',
      title: `Tin nhắn mới từ ${senderName}`,
      message: content.slice(0, 100),
      link: `/can-co/chat/${conversationId}`,
    },
  });
}
