import { prisma } from "@/lib/db"
import { REFERRAL_POINTS, TIER_THRESHOLDS } from "./constants"

export class ReferralService {
  /**
   * Sinh mã 8 ký tự an toàn
   */
  static generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  /**
   * Tính level dựa trên mốc Thresholds [0, 3, 10, 30, 100]
   */
  static calculateTier(totalReferrals: number): number {
    let tier = 1
    for (let i = TIER_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalReferrals >= TIER_THRESHOLDS[i]) {
        tier = i + 1
        break
      }
    }
    return tier
  }

  /**
   * Logic cốt lõi: xử lý sau khi user đăng ký qua referral link (Sử dụng Single Source of Truth + Transaction)
   */
  static async processReferral(referralCode: string, newProfileId: string): Promise<void> {
    const referrer = await prisma.profile.findUnique({
      where: { referralCode }
    })

    // Khóa chống gian lận: mã tự chỉ vào chính mình hoặc mã không tồn tại
    if (!referrer || referrer.id === newProfileId) {
      return 
    }

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Lưu DB gốc của Ai-mời-Ai (ReferralLog)
        await tx.referralLog.create({
          data: {
            referrerId: referrer.id,
            refereeId: newProfileId,
            pointsAwarded: REFERRAL_POINTS
          }
        })

        // 2. Chuyển tiền (Tạo log Transaction)
        await tx.pointTransaction.create({
          data: {
            userId: referrer.id,
            amount: REFERRAL_POINTS,
            reason: "Thưởng giới thiệu thành viên mới",
            type: "referral",
            referenceId: newProfileId
          }
        })

        // 3. Cập nhật thống kê điểm của Referrer
        await tx.userStat.upsert({
          where: { userId: referrer.id },
          create: {
            userId: referrer.id,
            points: REFERRAL_POINTS,
            totalPointsEarned: REFERRAL_POINTS,
            referralPoints: REFERRAL_POINTS
          },
          update: {
            points: { increment: REFERRAL_POINTS },
            totalPointsEarned: { increment: REFERRAL_POINTS },
            referralPoints: { increment: REFERRAL_POINTS }
          }
        })

        // 4. Update tổng số người mời và kiểm tra lên hạng (Cache trong Profile)
        const newTotalReferrals = (referrer.totalReferrals || 0) + 1
        const newTier = ReferralService.calculateTier(newTotalReferrals)

        await tx.profile.update({
          where: { id: referrer.id },
          data: {
            totalReferrals: newTotalReferrals,
            tier: newTier
          }
        })

        // 5. Gắn Soft-link cache cho Referee (Tech Lead Condition: Caching lookup)
        await tx.profile.update({
          where: { id: newProfileId },
          data: {
            referredBy: referrer.id
          }
        })

      })
    } catch (error) {
      console.error("Lỗi khi chạy Transaction cộng điểm Referral:", error)
      // Không ném lỗi ra ngoài làm đứt mạch đăng ký của user mới
    }
  }
}
