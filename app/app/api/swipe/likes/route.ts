// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/data/get-user';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if ('error' in auth) return auth.error;
    const { userId } = auth;

    // 1. Get likes pointing TO the user's intents
    const myIntents = await prisma.intent.findMany({
      where: { userId },
      select: { id: true }
    });
    const myIntentIds = myIntents.map(i => i.id);

    const likesReceived = await prisma.swipeLike.findMany({
      where: {
        intentId: { in: myIntentIds },
        action: 'LIKE',
        userId: { not: userId }
      },
      include: {
        intent: {
          select: { title: true, type: true }
        },
        user: {
          select: { displayName: true, avatarUrl: true, trustScore: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const serializedLikes = likesReceived.map(like => ({
      ...like,
      user: {
        ...like.user!,
        displayName: like.user!.displayName ?? 'Ai đó'
      }
    }));

    return NextResponse.json({ likes: serializedLikes });

  } catch (error) {
    console.error('[GET /api/swipe/likes] Error:', error);
    return NextResponse.json({ error: 'Không thể tải danh sách quan tâm' }, { status: 500 });
  }
}
