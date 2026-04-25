// @ts-nocheck
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { TIER_NAMES, TIER_THRESHOLDS, TIER_MULTIPLIERS } from "@/lib/referral/constants"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id

    let profile = await prisma.profile.findUnique({ where: { id: userId } })
    if (!profile) {
      profile = await prisma.profile.create({ data: { id: userId, tier: 1, totalReferrals: 0 } })
    }

    let stat = await prisma.userStat.findUnique({ where: { userId } })
    if (!stat) {
      stat = await prisma.userStat.create({ data: { userId, points: 0, level: 1 } })
    }

    const totalReferrals = profile.totalReferrals || 0
    const tier = profile.tier || 1
    const tierIndex = tier - 1
    const tierName = TIER_NAMES[tierIndex] || "Đồng"
    const nextTierAt = tier < 5 ? TIER_THRESHOLDS[tierIndex + 1] : "-"
    const multiplier = TIER_MULTIPLIERS[tierIndex] || 1.0

    return NextResponse.json({
      tier,
      tierName,
      totalReferrals,
      nextTierAt,
      points: stat.points || 0,
      pointsEarned: stat.totalPointsEarned || 0,
      pointsSpent: stat.totalPointsSpent || 0,
      referralPoints: stat.referralPoints || 0,
      multiplier
    })
  } catch (error) {
    console.error("GET REFERRAL STATS ERROR:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
