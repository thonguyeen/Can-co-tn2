import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/admin/guard"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.isAdmin) return guard.response

  const { id } = await params

  try {
    // ─── Profile + User email (Profile.id = User.id → shared PK) ───
    const profile = await prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        tier: true,
        totalReferrals: true,
        referralCode: true,
        referredBy: true,
        isBanned: true,
        banReason: true,
        bannedAt: true,
        createdAt: true,
        user: { select: { email: true } }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: "Không tìm thấy user." }, { status: 404 })
    }

    // ─── Stats điểm (relation tên userStats) ───
    const stats = await prisma.userStat.findUnique({
      where: { userId: id },
      select: {
        points: true,
        totalPointsEarned: true,
        totalPointsSpent: true,
        referralPoints: true
      }
    })

    // ─── 10 giao dịch điểm gần nhất ───
    const recentTransactions = await prisma.pointTransaction.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        amount: true,
        type: true,
        reason: true,
        createdAt: true
      }
    })

    // ─── Cây Referral ───
    let referredByProfile = null
    if (profile.referredBy) {
      referredByProfile = await prisma.profile.findUnique({
        where: { id: profile.referredBy },
        select: { displayName: true, avatarUrl: true }
      })
    }

    const referralsMade = await prisma.referralLog.findMany({
      where: { referrerId: id },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        referee: {
          select: { displayName: true, avatarUrl: true }
        }
      }
    })

    // ─── Achievements ───
    const achievements = await prisma.userAchievement.findMany({
      where: { userId: id },
      orderBy: { unlockedAt: "desc" }
    })

    return NextResponse.json({
      profile: {
        id: profile.id,
        name: profile.displayName ?? "Chưa đặt tên",
        email: profile.user?.email ?? "",
        avatarUrl: profile.avatarUrl ?? null,
        tier: profile.tier ?? 1,
        totalReferrals: profile.totalReferrals ?? 0,
        referralCode: profile.referralCode,
        referredBy: profile.referredBy,
        isBanned: profile.isBanned ?? false,
        banReason: profile.banReason ?? null,
        bannedAt: profile.bannedAt ?? null,
        createdAt: profile.createdAt
      },
      stats: stats ?? {
        points: 0,
        totalPointsEarned: 0,
        totalPointsSpent: 0,
        referralPoints: 0
      },
      recentTransactions,
      referralTree: {
        referredBy: referredByProfile,
        referrals: referralsMade.map((r) => ({
          name: r.referee?.displayName ?? "Chưa đặt tên",
          avatarUrl: r.referee?.avatarUrl ?? null,
          createdAt: r.createdAt
        }))
      },
      achievements
    })
  } catch (error) {
    console.error("[admin/users/[id] GET]", error)
    return NextResponse.json({ error: "Lỗi server." }, { status: 500 })
  }
}
