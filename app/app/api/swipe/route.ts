/**
 * POST /api/swipe
 *
 * Xử lý hành động vuốt (LIKE / SKIP).
 * Nếu LIKE → Kích hoạt Mutual Match Detection.
 *
 * Body: { intentId: string, action: "LIKE" | "SKIP" }
 * Response: { success: true, isMutualMatch: boolean, conversationId?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/data/get-user';
import { prisma } from '@/lib/db';
import { detectAndHandleMatch } from '@/lib/swipe/match-detector';

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const auth = await requireAuth(req);
    if ('error' in auth) return auth.error;
    const { userId } = auth;

    // 2. Parse & validate body
    const body = await req.json();
    const { intentId, action } = body as { intentId?: string; action?: string };

    if (!intentId || typeof intentId !== 'string') {
      return NextResponse.json({ error: 'intentId là bắt buộc' }, { status: 400 });
    }

    if (action !== 'LIKE' && action !== 'SKIP') {
      return NextResponse.json({ error: 'action phải là LIKE hoặc SKIP' }, { status: 400 });
    }

    // 3. Kiểm tra intent tồn tại và không phải bài của chính mình
    const intent = await prisma.intent.findUnique({
      where: { id: intentId },
      select: { id: true, userId: true, isBot: true },
    });

    if (!intent) {
      return NextResponse.json({ error: 'Bài đăng không tồn tại' }, { status: 404 });
    }

    if (intent.userId === userId) {
      return NextResponse.json({ error: 'Không thể vuốt bài của chính mình' }, { status: 400 });
    }

    // 4. Lưu hành động vuốt (upsert — nếu vuốt lại thì update)
    await prisma.swipeLike.upsert({
      where: {
        userId_intentId: { userId, intentId },
      },
      update: { action },
      create: { userId, intentId, action },
    });

    // 5. Nếu SKIP → Done
    if (action === 'SKIP') {
      return NextResponse.json({ success: true, isMutualMatch: false });
    }

    // 6. Nếu LIKE → Chạy Mutual Match Detection
    const result = await detectAndHandleMatch(userId, intentId);

    return NextResponse.json({
      success: true,
      isMutualMatch: result.isMutualMatch,
      ...(result.conversationId && { conversationId: result.conversationId }),
    });
  } catch (error) {
    console.error('[POST /api/swipe] Error:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 });
  }
}
