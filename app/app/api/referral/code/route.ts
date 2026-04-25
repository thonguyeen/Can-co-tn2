// @ts-nocheck
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { ReferralService } from "@/lib/referral/referral-service"
import { TIER_NAMES } from "@/lib/referral/constants"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id

    let profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { referralCode: true, totalReferrals: true, tier: true }
    })

    if (!profile) {
      profile = await prisma.profile.create({
        data: { id: userId, tier: 1, totalReferrals: 0 },
        select: { referralCode: true, totalReferrals: true, tier: true }
      })
    }

    // Tự sinh mã nếu chưa có
    if (!profile.referralCode) {
      const newCode = ReferralService.generateCode()
      profile = await prisma.profile.update({
        where: { id: userId },
        data: { referralCode: newCode },
        select: { referralCode: true, totalReferrals: true, tier: true }
      })
    }
    
    // Bổ sung UserStat để lấy thông tin điểm
    let stat = await prisma.userStat.findUnique({
      where: { userId }
    })
    
    if (!stat) {
      stat = await prisma.userStat.create({ data: { userId, points: 0, level: 1 } })
    }

    const tierIndex = (profile.tier || 1) - 1
    const tierName = TIER_NAMES[tierIndex] || "Đồng"

    return NextResponse.json({
      code: profile.referralCode,
      referralUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register?ref=${profile.referralCode}`,
      stats: {
        totalReferrals: profile.totalReferrals || 0,
        tier: profile.tier || 1,
        tierName,
        points: stat?.points || 0
      }
    })
  } catch (error) {
    console.error("GET REFERRAL CODE ERROR:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
