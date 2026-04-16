/**
 * GET /api/swipe/matches
 *
 * Trả về danh sách Phòng Thỏa Thuận (Mutual Match) của user hiện tại.
 * Kèm:
 *   - Thông tin Intent liên quan
 *   - Profile đối phương
 *   - Tin nhắn cuối cùng
 *
 * Sắp xếp: lastMessageAt DESC (active chat lên trên)
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

    // 2. Lấy tất cả Conversation mà user tham gia (là userA hoặc userB)
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ userA: userId }, { userB: userId }],
      },
      include: {
        intent: {
          select: {
            id: true,
            title: true,
            type: true,
            district: true,
            city: true,
            price: true,
            priceMin: true,
            priceMax: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { lastMessageAt: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
    });

    // 3. Lấy Profile đối phương cho từng conversation
    const partnerIds = conversations.map((c) =>
      c.userA === userId ? c.userB : c.userA
    );

    const partnerProfiles = await prisma.profile.findMany({
      where: { id: { in: partnerIds } },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        trustScore: true,
        verificationLevel: true,
      },
    });

    const profileMap = new Map(partnerProfiles.map((p) => [p.id, p]));

    // 4. Combine và serialize
    const matches = conversations.map((c) => {
      const partnerId = c.userA === userId ? c.userB : c.userA;
      const partner = profileMap.get(partnerId);
      const lastMessage = c.messages[0] ?? null;

      return {
        conversationId: c.id,
        createdAt: c.createdAt,
        lastMessageAt: c.lastMessageAt,
        intent: c.intent
          ? {
              ...c.intent,
              price: c.intent.price ? Number(c.intent.price) : null,
              priceMin: c.intent.priceMin ? Number(c.intent.priceMin) : null,
              priceMax: c.intent.priceMax ? Number(c.intent.priceMax) : null,
            }
          : null,
        partner: partner ?? { id: partnerId, displayName: 'Người dùng', avatarUrl: null },
        lastMessage: lastMessage
          ? {
              ...lastMessage,
              isMe: lastMessage.senderId === userId,
            }
          : null,
      };
    });

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('[GET /api/swipe/matches] Error:', error);
    return NextResponse.json({ error: 'Không thể tải danh sách khớp đôi' }, { status: 500 });
  }
}
