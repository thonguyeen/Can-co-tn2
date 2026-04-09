import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/admin/guard"
import { TIER_NAMES } from "@/lib/referral/constants"

export async function GET(request: NextRequest) {
  // ─── Bảo vệ cổng: Chỉ Admin được vào ───
  const guard = await requireAdmin()
  if (!guard.isAdmin) return guard.response

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") ?? ""
  const tierParam = searchParams.get("tier")
  const bannedParam = searchParams.get("banned")
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20", 10))
  const skip = (page - 1) * limit

  // ─── Build filter conditions ───
  // Profile.id = User.id (shared PK 1-1), search email qua User model riêng
  const profileWhere: Record<string, unknown> = {}
  const userEmailFilter = search
    ? { email: { contains: search, mode: "insensitive" as const } }
    : undefined

  if (search) {
    // Tìm userId có email match trước
    const matchedUsers = await prisma.user.findMany({
      where: userEmailFilter,
      select: { id: true }
    })
    const matchedIds = matchedUsers.map((u) => u.id)

    profileWhere.OR = [
      { displayName: { contains: search, mode: "insensitive" } },
      ...(matchedIds.length > 0 ? [{ id: { in: matchedIds } }] : [])
    ]
  }

  if (tierParam) {
    const tier = parseInt(tierParam, 10)
    if (!isNaN(tier) && tier >= 1 && tier <= 5) {
      profileWhere.tier = tier
    }
  }

  if (bannedParam !== null) {
    profileWhere.isBanned = bannedParam === "true"
  }

  // ─── Query: Danh sách + Phân trang ───
  const [profiles, total] = await prisma.$transaction([
    prisma.profile.findMany({
      where: profileWhere,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        tier: true,
        totalReferrals: true,
        isBanned: true,
        createdAt: true,
        // Profile.id = User.id, lấy email qua User relation
        user: { select: { email: true } },
        // UserStat relation tên là userStats trong schema
        userStats: { select: { points: true } }
      }
    }),
    prisma.profile.count({ where: profileWhere })
  ])

  // ─── Tổng số user theo từng hạng (cho bộ lọc nhanh) ───
  const tierGroupRaw = await prisma.profile.groupBy({
    by: ["tier"],
    _count: { tier: true }
  })

  const tierStats: Record<number, number> = {}
  for (const g of tierGroupRaw) {
    if (g.tier !== null) {
      tierStats[g.tier] = g._count.tier
    }
  }

  // ─── Format response ───
  const users = profiles.map((p) => ({
    id: p.id,
    name: p.displayName ?? "Chưa đặt tên",
    email: p.user?.email ?? "",
    avatarUrl: p.avatarUrl ?? null,
    tier: p.tier ?? 1,
    tierName: TIER_NAMES[(p.tier ?? 1) - 1] ?? "Đồng",
    totalReferrals: p.totalReferrals ?? 0,
    points: p.userStats?.points ?? 0,
    isBanned: p.isBanned ?? false,
    createdAt: p.createdAt
  }))

  return NextResponse.json({
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    tierStats
  })
}
