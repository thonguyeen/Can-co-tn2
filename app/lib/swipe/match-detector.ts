/**
 * Mutual Match Detector
 *
 * Khi User A like Intent X (của User B):
 *   → Kiểm tra User B đã LIKE bất kỳ Intent nào của User A chưa?
 *   → Nếu CÓ → Mutual Match → Tạo Conversation + 2 Notifications
 *   → Nếu KHÔNG → One-way Like → Tạo 1 Notification cho B
 *
 * Wrapped trong $transaction để chống race condition (điều kiện C-2).
 */

import { prisma } from '../db';

export interface MatchResult {
  isMutualMatch: boolean;
  conversationId?: string;
}

/**
 * Xử lý hành động LIKE và phát hiện Mutual Match.
 *
 * @param likerUserId  - userId của người vừa LIKE (User A)
 * @param intentId     - intentId bị LIKE (bài của User B)
 * @returns MatchResult
 */
export async function detectAndHandleMatch(
  likerUserId: string,
  intentId: string
): Promise<MatchResult> {
  // Bước 1: Lấy thông tin bài bị Like (cần biết chủ bài là ai)
  const likedIntent = await prisma.intent.findUnique({
    where: { id: intentId },
    select: {
      id: true,
      title: true,
      userId: true,
    },
  });

  if (!likedIntent || !likedIntent.userId) {
    return { isMutualMatch: false };
  }

  const intentOwnerId = likedIntent.userId; // User B

  // Không tự like bài của chính mình (safety check thêm)
  if (intentOwnerId === likerUserId) {
    return { isMutualMatch: false };
  }

  // Bước 2: Kiểm tra Mutual Match
  // "User B có đang LIKE bất kỳ Intent nào của User A không?"
  const mutualLike = await prisma.swipeLike.findFirst({
    where: {
      userId: intentOwnerId, // B đã like...
      action: 'LIKE',
      intent: {
        userId: likerUserId, // ...bài của A
        status: 'active',
      },
    },
    select: { id: true },
  });

  if (mutualLike) {
    // 🎉 MUTUAL MATCH! Thực hiện trong transaction để chống race condition
    return await prisma.$transaction(async (tx) => {
      // Tạo Conversation (@@unique bảo vệ khỏi duplicate)
      const conversation = await tx.conversation.upsert({
        where: {
          intentId_userA_userB: {
            intentId: intentId,
            userA: likerUserId,
            userB: intentOwnerId,
          },
        },
        update: {}, // Nếu đã tồn tại, không update gì
        create: {
          intentId: intentId,
          userA: likerUserId,
          userB: intentOwnerId,
        },
      });

      // Lấy profile người Like (để hiện tên trong notification)
      const likerProfile = await tx.profile.findUnique({
        where: { id: likerUserId },
        select: { displayName: true, avatarUrl: true },
      });

      const likerName = likerProfile?.displayName ?? 'Ai đó';

      // Tạo Notification cho User A (người vừa Like)
      await tx.notification.create({
        data: {
          userId: likerUserId,
          type: 'mutual_match',
          title: '🎉 Khớp Đôi thành công!',
          message: `Bạn và ${intentOwnerId} đã cùng quan tâm nhau. Vào phòng thỏa thuận ngay!`,
          referenceId: conversation.id,
          referenceType: 'conversation',
        },
      });

      // Lấy tên B để báo cho B
      const ownerProfile = await tx.profile.findUnique({
        where: { id: intentOwnerId },
        select: { displayName: true },
      });

      // Tạo Notification cho User B (chủ bài)
      await tx.notification.create({
        data: {
          userId: intentOwnerId,
          type: 'mutual_match',
          title: '🎉 Khớp Đôi thành công!',
          message: `${likerName} và bạn đã cùng quan tâm nhau. Vào phòng thỏa thuận ngay!`,
          referenceId: conversation.id,
          referenceType: 'conversation',
        },
      });

      return {
        isMutualMatch: true,
        conversationId: conversation.id,
      };
    });
  } else {
    // One-way Like: Chỉ thông báo cho chủ bài (công khai tên người like)
    const likerProfile = await prisma.profile.findUnique({
      where: { id: likerUserId },
      select: { displayName: true, avatarUrl: true },
    });

    const likerName = likerProfile?.displayName ?? 'Ai đó';

    await prisma.notification.create({
      data: {
        userId: intentOwnerId,
        type: 'swipe_like',
        title: `${likerName} quan tâm đến bài của bạn`,
        message: `"${likedIntent.title ?? 'Bài đăng của bạn'}" đang được quan tâm. Hãy xem bài đăng của họ!`,
        referenceId: intentId,
        referenceType: 'intent',
        link: `/profile/${likerUserId}`,
      },
    });

    return { isMutualMatch: false };
  }
}
