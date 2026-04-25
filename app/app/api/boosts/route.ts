// @ts-nocheck
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { BOOST_POINTS_COST, BOOST_DURATION_HOURS } from "@/lib/referral/constants"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { intentId } = await request.json()

    if (!intentId) {
      return NextResponse.json({ error: "intentId is required" }, { status: 400 })
    }

    // Verify ownership
    const intent = await prisma.intent.findUnique({ where: { id: intentId } })
    if (!intent || intent.userId !== userId) {
      return NextResponse.json({ error: "Intent not found or access denied" }, { status: 403 })
    }

    // Check if already active boost
    const now = new Date()
    const activeBoost = await prisma.intentBoost.findFirst({
      where: {
        intentId,
        endAt: { gt: now }
      }
    })

    if (activeBoost) {
      return NextResponse.json({ error: "Intent is already boosted" }, { status: 409 })
    }

    // Execute atomic points reduction & boost creation (Tech Lead requirement: Race condition prevention)
    const boost = await prisma.$transaction(async (tx) => {
      // 1. Atomic decrement with condition
      const updateRes = await tx.userStat.updateMany({
        where: { 
          userId,
          points: { gte: BOOST_POINTS_COST }
        },
        data: {
          points: { decrement: BOOST_POINTS_COST },
          totalPointsSpent: { increment: BOOST_POINTS_COST }
        }
      });

      if (updateRes.count === 0) {
        throw new Error("INSUFFICIENT_POINTS");
      }

      // 2. Log transaction
      await tx.pointTransaction.create({
        data: {
          userId,
          amount: -BOOST_POINTS_COST, // Spending so it's negative
          reason: "Tiêu điểm Boost tin đăng 24h",
          type: "boost",
          referenceId: intentId
        }
      });

      // 3. Create active boost record
      const endAt = new Date(now.getTime() + BOOST_DURATION_HOURS * 60 * 60 * 1000);
      return await tx.intentBoost.create({
        data: {
          intentId,
          userId,
          pointsSpent: BOOST_POINTS_COST,
          startAt: now,
          endAt: endAt
        }
      });
    });

    return NextResponse.json({ success: true, boost })

  } catch (error: any) {
    if (error.message === "INSUFFICIENT_POINTS") {
      return NextResponse.json({ error: "Không đủ điểm để boost bài" }, { status: 402 })
    }
    console.error("POST BOOST ERROR:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
