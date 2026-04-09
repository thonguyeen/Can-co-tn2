import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/data/get-user';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if ('error' in auth) return auth.error;
    const { userId } = auth;

    const body = await req.json();
    const { intent_id, content } = body;

    if (!intent_id || !content) {
      return NextResponse.json({ error: 'Nội dung bình luận không hợp lệ' }, { status: 400 });
    }

    const data = await prisma.intentComment.create({
      data: {
        intentId: intent_id,
        userId,
        content,
        isBot: false,
      },
    });

    // Increment comment_count
    await prisma.intent.update({
      where: { id: intent_id },
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
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi hệ thống';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
