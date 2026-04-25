// @ts-nocheck
/**
 * GET /api/swipe/feed
 *
 * Trả về danh sách Intent cho màn hình Khớp Nhanh.
 * Áp dụng bộ lọc:
 *   - isBot = false (chỉ người thật)
 *   - status = "active"
 *   - userId ≠ currentUser (không hiện bài của chính mình)
 *   - Chưa vuốt bởi currentUser (không lặp)
 *
 * Query params: ?limit=20&offset=0
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/data/get-user';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // 1. Auth check
    const auth = await requireAuth(req);
    if ('error' in auth) return auth.error;
    const { userId } = auth;

    // 2. Pagination
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // 3. Lấy danh sách intentId đã vuốt (dùng NOT IN filter)
    const swipedIds = await prisma.swipeLike.findMany({
      where: { userId },
      select: { intentId: true },
    });
    const swipedIntentIds = swipedIds.map((s) => s.intentId);

    // 4. Query feed với đầy đủ bộ lọc
    const [intents, total] = await Promise.all([
      prisma.intent.findMany({
        where: {
          isBot: false,           // Chỉ người thật
          status: 'active',
          userId: { not: userId }, // Không thấy bài của mình
          ...(swipedIntentIds.length > 0 && {
            id: { notIn: swipedIntentIds }, // Không lặp bài đã vuốt
          }),
        },
        select: {
          id: true,
          type: true,
          title: true,
          rawText: true,
          price: true,
          priceMin: true,
          priceMax: true,
          address: true,
          district: true,
          ward: true,
          city: true,
          category: true,
          subcategory: true,
          trustScore: true,
          matchCount: true,
          viewCount: true,
          createdAt: true,
          userId: true,
          images: {
            select: { url: true, displayOrder: true },
            orderBy: { displayOrder: 'asc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.intent.count({
        where: {
          isBot: false,
          status: 'active',
          userId: { not: userId },
          ...(swipedIntentIds.length > 0 && {
            id: { notIn: swipedIntentIds },
          }),
        },
      }),
    ]);

    // 5. Serialize (BigInt price fields → string)
    const serialized = intents.map((intent) => ({
      ...intent,
      price: intent.price ? Number(intent.price) : null,
      priceMin: intent.priceMin ? Number(intent.priceMin) : null,
      priceMax: intent.priceMax ? Number(intent.priceMax) : null,
    }));

    return NextResponse.json({ intents: serialized, total });
  } catch (error) {
    console.error('[GET /api/swipe/feed] Error:', error);
    return NextResponse.json({ error: 'Không thể tải danh sách bài' }, { status: 500 });
  }
}
