// @ts-nocheck
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      prisma.referralLog.findMany({
        where: { referrerId: userId },
        include: {
          referee: {
            select: { displayName: true, avatarUrl: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.referralLog.count({
        where: { referrerId: userId }
      })
    ])

    const formattedLogs = logs.map(log => ({
      id: log.id,
      refereeId: log.refereeId,
      refereeName: log.referee.displayName || "Unknown",
      refereeAvatar: log.referee.avatarUrl,
      pointsAwarded: log.pointsAwarded,
      createdAt: log.createdAt
    }))

    return NextResponse.json({
      logs: formattedLogs,
      total,
      page,
      limit
    })
  } catch (error) {
    console.error("GET REFERRAL LOGS ERROR:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
