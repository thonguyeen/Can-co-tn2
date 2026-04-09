import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/data/get-user';
import { prisma } from '@/lib/db';

// PUT /api/chat/[id]/read — mark messages as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: userId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
