// @ts-nocheck
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin } from "@/lib/admin/guard"
import { RewardStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.isAdmin) return guard.response

  const { searchParams } = new URL(request.url)
  const statusParam = searchParams.get("status")?.toUpperCase() // pending → PENDING
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20", 10))
  const skip = (page - 1) * limit

  // Validate enum value nếu có
  const validStatuses: string[] = ["PENDING", "APPROVED", "REJECTED", "FULFILLED"]
  const status =
    statusParam && validStatuses.includes(statusParam)
      ? (statusParam as RewardStatus)
      : undefined

  const where = status ? { status } : {}

  const [redemptions, total] = await prisma.$transaction([
    prisma.rewardRedemption.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            displayName: true,
            avatarUrl: true,
            user: { select: { email: true } }
          }
        },
        rewardItem: {
          select: { label: true, pointsCost: true }
        }
      }
    }),
    prisma.rewardRedemption.count({ where })
  ])

  return NextResponse.json({
    redemptions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  })
}
