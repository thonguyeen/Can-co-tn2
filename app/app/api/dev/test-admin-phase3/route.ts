// @ts-nocheck
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { RewardStatus } from "@prisma/client"
import crypto from "crypto"

export async function GET() {
  const logs: string[] = []
  const testId = `diag3-${Date.now().toString().slice(-4)}`
  const testEmail = `${testId}@test.com`
  const userId = crypto.randomUUID()

  try {
    logs.push(`🚀 Bắt đầu Quick Check Phase 03 cho User: ${testEmail}`)

    // 1. Setup một User mới hoàn toàn để test sạch
    await prisma.user.create({
      data: {
        id: userId,
        email: testEmail,
        name: `Test Phase3 ${testId}`,
        profile: {
          create: {
            displayName: `Display ${testId}`,
            referralCode: `CODE${testId}`,
            userStats: { create: { points: 100 } }
          }
        }
      }
    })
    logs.push("✅ Bước 1: Khởi tạo User test thành công (100 points)")

    // 2. Test Logic Cộng Điểm Admin (Atomic)
    // Giả lập logic trong POST /api/admin/users/[id]/points
    await prisma.$transaction(async (tx) => {
      const amount = 50
      await tx.pointTransaction.create({
        data: { userId, amount, type: "manual", reason: "[Admin Diag] Cộng điểm test" }
      })
      await tx.userStat.update({
        where: { userId },
        data: { points: { increment: amount }, totalPointsEarned: { increment: amount } }
      })
    })
    
    const statsAfterAdd = await prisma.userStat.findUnique({ where: { userId } })
    if (statsAfterAdd?.points === 150) {
      logs.push("✅ Bước 2: Test Cộng điểm Admin (100 + 50 = 150) -> THÀNH CÔNG")
    } else {
       throw new Error(`Thất bại cộng điểm: Kỳ vọng 150, thực tế ${statsAfterAdd?.points}`)
    }

    // 3. Test Logic Trừ Điểm Admin (Atomic)
    await prisma.$transaction(async (tx) => {
      const amount = -20
      await tx.pointTransaction.create({
        data: { userId, amount, type: "manual", reason: "[Admin Diag] Trừ điểm test" }
      })
      await tx.userStat.update({
        where: { userId },
        data: { points: { increment: amount }, totalPointsSpent: { increment: Math.abs(amount) } }
      })
    })

    const statsAfterSub = await prisma.userStat.findUnique({ where: { userId } })
    if (statsAfterSub?.points === 130) {
      logs.push("✅ Bước 3: Test Trừ điểm Admin (150 - 20 = 130) -> THÀNH CÔNG")
    } else {
       throw new Error(`Thất bại trừ điểm: Kỳ vọng 130, thực tế ${statsAfterSub?.points}`)
    }

    // 4. Test Khóa/Mở Khóa (Ban/Unban)
    await prisma.profile.update({
      where: { id: userId },
      data: { isBanned: true, banReason: "[Admin Diag] Khoá test", bannedAt: new Date() }
    })
    const profileBanned = await prisma.profile.findUnique({ where: { id: userId } })
    if (profileBanned?.isBanned) {
      logs.push("✅ Bước 4: Test Khóa tài khoản (Ban) -> THÀNH CÔNG")
    }

    await prisma.profile.update({
      where: { id: userId },
      data: { isBanned: false, banReason: null, bannedAt: null }
    })
    const profileUnbanned = await prisma.profile.findUnique({ where: { id: userId } })
    if (!profileUnbanned?.isBanned) {
      logs.push("✅ Bước 5: Test Mở khóa tài khoản (Unban) -> THÀNH CÔNG")
    }

    // 5. Test Hoàn Tiền khi Từ Chối Đổi Quà (Atomic Refund)
    // Setup 1 RewardItem giả
    const rewardId = crypto.randomUUID()
    await prisma.rewardItem.create({
      data: { id: rewardId, label: "Voucher Diag", pointsCost: 100, stock: 10 }
    })

    // Setup 1 Redemption 'PENDING' và đã trừ tiền user (User còn 130 - 100 = 30)
    const redemId = crypto.randomUUID()
    await prisma.$transaction([
      prisma.rewardRedemption.create({
        data: { id: redemId, userId, rewardItemId: rewardId, rewardLabel: "Voucher Diag", pointsCost: 100, status: RewardStatus.PENDING }
      }),
      prisma.userStat.update({
        where: { userId },
        data: { points: { decrement: 100 }, totalPointsSpent: { increment: 100 } }
      })
    ])
    
    // Giả lập Logic 'REJECTED' (Atomic 3-step refund)
    await prisma.$transaction(async (tx) => {
      const redem = await tx.rewardRedemption.findUnique({ where: { id: redemId } })
      const refundAmount = redem!.pointsCost

      await tx.rewardRedemption.update({
        where: { id: redemId },
        data: { status: RewardStatus.REJECTED, adminNote: "[Admin Diag] Từ chối test" }
      })
      await tx.pointTransaction.create({
        data: { userId, amount: refundAmount, type: "refund", reason: "Hoàn điểm test", referenceId: redemId }
      })
      await tx.userStat.update({
        where: { userId },
        data: { points: { increment: refundAmount }, totalPointsSpent: { decrement: refundAmount } }
      })
    })

    const finalStats = await prisma.userStat.findUnique({ where: { userId } })
    if (finalStats?.points === 130) {
      logs.push("✅ Bước 6: Test Hoàn điểm khi Từ chối (30 + 100 = 130) -> THÀNH CÔNG")
    } else {
      throw new Error(`Thất bại hoàn điểm: Kỳ vọng 130, thực tế ${finalStats?.points}`)
    }

    logs.push("🏆 TẤT CẢ TEST PHASE 03 ĐÃ VƯỢT QUA!")
    return NextResponse.json({ success: true, logs })

  } catch (error: any) {
    logs.push(`❌ LỖI NGHIÊM TRỌNG: ${error.message}`)
    return NextResponse.json({ success: false, error: error.message, logs }, { status: 500 })
  }
}
