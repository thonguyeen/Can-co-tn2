import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/admin/guard"
import { TIER_NAMES } from "@/lib/referral/constants"

export async function GET(_request: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.isAdmin) return guard.response

  try {
    const now = new Date()

    // ─── Mốc thời gian ───
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // ─── Summary số liệu tổng hợp ───
    const [today, thisMonth, allTime] = await prisma.$transaction([
      prisma.referralLog.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.referralLog.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.referralLog.count()
    ])

    // ─── Phân phối hạng (Tier Distribution) ───
    const tierGroupRaw = await prisma.profile.groupBy({
      by: ["tier"],
      _count: { tier: true },
      orderBy: { tier: "asc" }
    })

    const tierDistribution = [1, 2, 3, 4, 5].map((tier) => {
      const found = tierGroupRaw.find((g) => g.tier === tier)
      return {
        tier,
        tierName: TIER_NAMES[tier - 1],
        count: found?._count.tier ?? 0
      }
    })

    // ─── Top 10 Referrers ───
    const topReferrers = await prisma.profile.findMany({
      where: { totalReferrals: { gt: 0 } },
      orderBy: { totalReferrals: "desc" },
      take: 10,
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        totalReferrals: true,
        tier: true
      }
    })

    // ─── Thống kê 30 ngày gần nhất (cho biểu đồ) ───
    const referralLogs = await prisma.referralLog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    })

    // Group by date (YYYY-MM-DD)
    const dailyMap: Record<string, number> = {}
    for (const log of referralLogs) {
      const dateKey = (log.createdAt ?? new Date()).toISOString().split("T")[0]
      dailyMap[dateKey] = (dailyMap[dateKey] ?? 0) + 1
    }

    // Điền đầy 30 ngày kể cả ngày 0
    const dailyStats: { date: string; count: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split("T")[0]
      dailyStats.push({ date: key, count: dailyMap[key] ?? 0 })
    }

    return NextResponse.json({
      summary: {
        totalReferralsToday: today,
        totalReferralsThisMonth: thisMonth,
        totalReferralsAllTime: allTime
      },
      tierDistribution,
      topReferrers: topReferrers.map((p) => ({
        id: p.id,
        name: p.displayName ?? "Chưa đặt tên",
        avatarUrl: p.avatarUrl ?? null,
        totalReferrals: p.totalReferrals ?? 0,
        tier: p.tier ?? 1,
        tierName: TIER_NAMES[(p.tier ?? 1) - 1]
      })),
      dailyStats
    })
  } catch (error) {
    console.error("[admin/referrals GET]", error)
    return NextResponse.json({ error: "Lỗi server." }, { status: 500 })
  }
}
